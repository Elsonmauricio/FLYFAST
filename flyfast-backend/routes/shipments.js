const express = require('express');
const router = express.Router();
const { db, auth, FieldValue } = require('../config/firebase');
const { sendShipmentStatusUpdate } = require('../lib/email');

// Middleware de autenticação
const authenticate = async (req, res, next) => {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Token não fornecido' });
  }
  const token = header.split(' ')[1];
  try {
    const decodedToken = await auth.verifyIdToken(token);
    req.user = decodedToken;
    next();
  } catch (error) {
    console.error('Erro de autenticação:', error);
    res.status(401).json({ error: 'Token inválido' });
  }
};

// GET / - Listar meus envios
router.get('/', authenticate, async (req, res) => {
  try {
    const snapshot = await db.collection('shipments')
      .where('userId', '==', req.user.uid)
      .orderBy('createdAt', 'desc')
      .get();
    
    const shipments = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.json(shipments);
  } catch (error) {
    console.error('Erro ao buscar envios:', error);
    res.status(500).json({ error: 'Erro interno ao buscar envios' });
  }
});

// POST / - Criar envio e atribuir pontos AUTOMATICAMENTE
router.post('/', authenticate, async (req, res) => {
  try {
    const { uid, email } = req.user;
    const data = req.body;

    // Validação básica
    if (!data.from || !data.to) {
      return res.status(400).json({ error: 'Origem e destino são obrigatórios.' });
    }

    // 1. Calcular Custo (Se não vier do frontend, calculamos um estimado)
    let cost = parseFloat(data.cost || data.price || 0);
    if (cost === 0 && data.weight) {
        // Buscar configuração de preços atualizada
        const pricingDoc = await db.collection('settings').doc('pricing').get();
        const pricing = pricingDoc.exists ? pricingDoc.data() : {};
        const pricePerKg = parseFloat(pricing.pricePerKg) || 13000; // Default 13.000 AOA
        const serviceFee = parseFloat(pricing.serviceFee) || 0;

        cost = (parseFloat(data.weight) * pricePerKg) + serviceFee;
    }

    // 2. Calcular Pontos: 1 Ponto a cada 1000 AOA gastos
    const pointsEarned = Math.floor(cost / 1000);

    const newShipment = {
      userId: uid,
      userEmail: email,
      ...data,
      cost: cost, // Garante que o custo final é salvo
      status: 'Pendente',
      createdAt: new Date().toISOString(),
      trackingHistory: [
        { status: 'Pendente', location: data.from, date: new Date().toISOString() }
      ]
    };

    // 3. Executar Transação (Criar Envio + Atualizar Pontos)
    const shipmentId = await db.runTransaction(async (t) => {
      // Referência para o novo envio (gerar ID automático)
      const shipmentRef = db.collection('shipments').doc();
      
      // Referência do utilizador para atualizar pontos
      const userRef = db.collection('users').doc(uid);
      const userDoc = await t.get(userRef);

      // Gravar o envio
      t.set(shipmentRef, { ...newShipment, id: shipmentRef.id });
      
      // Atualizar pontos se o utilizador existir e tiver ganho pontos
      if (userDoc.exists && pointsEarned > 0) {
        const currentPoints = userDoc.data().loyaltyPoints || 0;
        t.update(userRef, { 
          loyaltyPoints: currentPoints + pointsEarned 
        });
      }

      return shipmentRef.id;
    });

    // 4. Notificar Admins (Assíncrono)
    try {
      const adminsSnapshot = await db.collection('users').where('role', '==', 'admin').get();
      
      if (!adminsSnapshot.empty) {
        const batch = db.batch();
        
        adminsSnapshot.forEach(adminDoc => {
          const notifRef = db.collection('notifications').doc();
          batch.set(notifRef, {
            userId: adminDoc.id,
            title: 'Novo Envio Criado',
            message: `O cliente ${email} criou o envio #${shipmentId} (${data.from} -> ${data.to}).`,
            read: false,
            type: 'admin_alert',
            relatedId: shipmentId,
            createdAt: new Date().toISOString()
          });
        });

        await batch.commit();
      }
    } catch (notifError) {
      console.error('Erro ao criar notificação para admin:', notifError);
      // Não falhamos o request principal se a notificação falhar
    }

    res.status(201).json({ 
      message: 'Envio criado com sucesso!', 
      pointsEarned,
      totalCost: cost
    });

  } catch (error) {
    console.error('Erro ao criar envio:', error);
    res.status(500).json({ error: 'Erro ao processar envio' });
  }
});

// POST /:id/cancel - Cancelar envio (Admin ou Próprio utilizador)
router.post('/:id/cancel', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const shipmentRef = db.collection('shipments').doc(id);
    const doc = await shipmentRef.get();

    if (!doc.exists) return res.status(404).json({ error: 'Envio não encontrado' });
    
    // Verifica se é o dono ou admin
    // (Assumindo que req.user.role viria do token, mas aqui simplificamos verificando o ID)
    if (doc.data().userId !== req.user.uid) {
       // Se quiser permitir admin cancelar aqui, precisaria verificar a role no DB
       return res.status(403).json({ error: 'Não autorizado' });
    }

    await shipmentRef.update({ status: 'Cancelado' });
    res.json({ message: 'Envio cancelado' });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao cancelar' });
  }
});

// PUT /:id - Atualizar envio (Admin)
router.put('/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const { status, currentLocation, from, to } = req.body;
    
    // Verificar se é admin
    const userDoc = await db.collection('users').doc(req.user.uid).get();
    if (!userDoc.exists || userDoc.data().role !== 'admin') {
      return res.status(403).json({ error: 'Acesso não autorizado' });
    }

    const shipmentRef = db.collection('shipments').doc(id);
    const doc = await shipmentRef.get();

    if (!doc.exists) return res.status(404).json({ error: 'Envio não encontrado' });
    
    const oldStatus = doc.data().status;
    const updateData = { status, currentLocation, from, to };

    // Atualizar histórico se necessário
    if (status !== oldStatus || currentLocation !== doc.data().currentLocation) {
      updateData.trackingHistory = FieldValue.arrayUnion({
        status,
        location: currentLocation,
        date: new Date().toISOString()
      });
    }

    await shipmentRef.update(updateData);

    // Enviar notificação por email se o estado mudou
    if (status && status !== oldStatus) {
      const clientUser = await db.collection('users').doc(doc.data().userId).get();
      const clientData = clientUser.data();
      
      if (clientData && clientData.email) {
        sendShipmentStatusUpdate(clientData.email, clientData.name || 'Cliente', id, status, currentLocation)
          .catch(err => console.error('Erro ao enviar email:', err));
      }
    }

    res.json({ message: 'Envio atualizado com sucesso' });
  } catch (error) {
    console.error('Erro ao atualizar envio:', error);
    res.status(500).json({ error: 'Erro ao atualizar envio' });
  }
});

module.exports = router;