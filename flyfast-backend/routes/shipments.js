const express = require('express');
const router = express.Router();
const { db, auth, FieldValue } = require('../config/firebase');
const { sendShipmentStatusUpdate } = require('../lib/email');
const emailService = require('../services/emailService');

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

    // Tentar encontrar a rota (Schedule) automaticamente se não for passado o ID, mas tivermos data
    if (!data.scheduleId && data.date) {
      // Remove espaços extras que possam vir do frontend
      const cleanFrom = data.from.trim();
      const cleanTo = data.to.trim();

      const scheduleQuery = await db.collection('schedules')
        .where('from', '==', cleanFrom)
        .where('to', '==', cleanTo)
        .where('date', '==', data.date)
        .limit(1)
        .get();
      
      if (!scheduleQuery.empty) {
        data.scheduleId = scheduleQuery.docs[0].id;
      } else {
        console.warn(`⚠️ Rota não encontrada para dedução de capacidade: ${cleanFrom} -> ${cleanTo} em ${data.date}`);
      }
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
      // --- 1. LEITURAS (Reads) ---
      // Devem ser feitas ANTES de qualquer escrita (t.set, t.update)

      // Ler dados do utilizador
      const userRef = db.collection('users').doc(uid);
      const userDoc = await t.get(userRef);

      // Ler dados da rota (se aplicável)
      let scheduleRef = null;
      let scheduleDoc = null;
      if (data.scheduleId && data.weight) {
        scheduleRef = db.collection('schedules').doc(data.scheduleId);
        scheduleDoc = await t.get(scheduleRef);
      }

      // --- 2. ESCRITAS (Writes) ---
      
      // Criar referência e gravar envio
      const shipmentRef = db.collection('shipments').doc();
      t.set(shipmentRef, { ...newShipment, id: shipmentRef.id });

      // Atualizar capacidade da rota
      if (scheduleDoc && scheduleDoc.exists) {
          const scheduleData = scheduleDoc.data();
          const currentAvailable = parseFloat(scheduleData.available);
          const weightToDeduct = parseFloat(data.weight);

          if (!isNaN(currentAvailable) && !isNaN(weightToDeduct)) {
            if (currentAvailable < weightToDeduct) throw new Error(`Capacidade insuficiente na rota. Disponível: ${currentAvailable}kg`);
            t.update(scheduleRef, { available: currentAvailable - weightToDeduct });
          }
      }
      
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

    // 5. Enviar Emails de Resumo (Admin) e Instruções (Cliente)
    try {
      const userDoc = await db.collection('users').doc(uid).get();
      const userData = userDoc.exists ? userDoc.data() : {};
      const clientName = userData.name || 'Cliente';
      const clientPhone = userData.phone || 'N/D';
      const description = data.items || data.description || 'Mercadoria Geral';

      // Endereços dos Armazéns (Drop-off) - Onde o cliente deve entregar
      const warehouses = {
        'Luanda': 'Rua da Missão, nº 10, Ingombota, Luanda',
        'Lisboa': 'Av. do Brasil, nº 34, 1700-061 Lisboa'
      };
      const dropOffAddress = warehouses[data.from] || 'Endereço a confirmar com o suporte';

      // Verificar se o serviço de email tem o método genérico sendEmail
      if (emailService && typeof emailService.sendEmail === 'function') {
        // Email para o Admin (Resumo da Reserva)
        const adminHtml = `
          <h3>Nova Reserva de Envio Recebida</h3>
          <p><strong>Cliente:</strong> ${clientName}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Telefone:</strong> ${clientPhone}</p>
          <hr/>
          <p><strong>Peso:</strong> ${data.weight} kg</p>
          <p><strong>Descrição:</strong> ${description}</p>
          <p><strong>Rota:</strong> ${data.from} -> ${data.to}</p>
        `;
        // Envia para o email da empresa (substitua pelo email real do admin se necessário)
        await emailService.sendEmail('admin@flyfast.com', `Nova Reserva: ${clientName} (${data.weight}kg)`, adminHtml);

        // Email para o Cliente (Instruções de Entrega)
        const clientHtml = `
          <h3>Reserva Confirmada!</h3>
          <p>Olá ${clientName}, recebemos o seu pedido de envio.</p>
          <p>Por favor, entregue a sua encomenda no seguinte endereço:</p>
          <div style="background:#f4f4f4; padding:15px; margin:10px 0; border-left: 4px solid #333;">
            <strong>${dropOffAddress}</strong>
          </div>
          <p>Código de Envio: <strong>${shipmentId}</strong></p>
        `;
        await emailService.sendEmail(email, 'Instruções para o seu Envio FlyFast', clientHtml);
      }
    } catch (emailError) {
      console.error('Erro ao enviar emails de reserva:', emailError);
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
  const { id } = req.params;

  try {
    await db.runTransaction(async (t) => {
      const shipmentRef = db.collection('shipments').doc(id);
      const doc = await t.get(shipmentRef);

      if (!doc.exists) throw new Error('Envio não encontrado');
      
      const data = doc.data();

      // Verificação de permissão: Dono ou Admin
      let isAuthorized = data.userId === req.user.uid;
      if (!isAuthorized) {
         const userRef = db.collection('users').doc(req.user.uid);
         const userDoc = await t.get(userRef);
         if (userDoc.exists && userDoc.data().role === 'admin') {
            isAuthorized = true;
         }
      }

      if (!isAuthorized) throw new Error('Não autorizado');

      if (data.status === 'Cancelado') throw new Error('Envio já está cancelado');

      // Restaurar capacidade na rota (Schedule)
      if (data.scheduleId && data.weight) {
        const scheduleRef = db.collection('schedules').doc(data.scheduleId);
        const scheduleDoc = await t.get(scheduleRef);
        
        if (scheduleDoc.exists) {
          const scheduleData = scheduleDoc.data();
          const currentAvailable = parseFloat(scheduleData.available) || 0;
          
          // Obter capacidade máxima para garantir que não ultrapassamos o limite ao restaurar
          let maxCapacity = 50;
          if (scheduleData.capacity) {
             const parsed = parseFloat(String(scheduleData.capacity).replace(/[^0-9.]/g, ''));
             if (!isNaN(parsed) && parsed > 0) maxCapacity = parsed;
          }

          const weightToAdd = parseFloat(data.weight);
          
          if (!isNaN(currentAvailable) && !isNaN(weightToAdd)) {
             // Garante que a disponibilidade nunca excede a capacidade total da rota
             const newAvailable = Math.min(currentAvailable + weightToAdd, maxCapacity);
             t.update(scheduleRef, { available: newAvailable });
          }
        }
      }

      t.update(shipmentRef, { status: 'Cancelado' });
    });

    res.json({ message: 'Envio cancelado e capacidade restaurada.' });
  } catch (error) {
    console.error('Erro ao cancelar envio:', error);
    const status = error.message === 'Não autorizado' ? 403 : (error.message === 'Envio não encontrado' ? 404 : 500);
    res.status(status).json({ error: error.message });
  }
});

// DELETE /:id - Remover envio (Admin)
router.delete('/:id', authenticate, async (req, res) => {
  const { id } = req.params;

  try {
    await db.runTransaction(async (t) => {
      const shipmentRef = db.collection('shipments').doc(id);
      const doc = await t.get(shipmentRef);

      if (!doc.exists) throw new Error('Envio não encontrado');
      
      const data = doc.data();

      // Verificação de permissão: Apenas Admin
      const userRef = db.collection('users').doc(req.user.uid);
      const userDoc = await t.get(userRef);
      
      if (!userDoc.exists || userDoc.data().role !== 'admin') {
        throw new Error('Apenas administradores podem remover envios');
      }

      // Restaurar capacidade se não estiver cancelado
      if (data.status !== 'Cancelado' && data.scheduleId && data.weight) {
        const scheduleRef = db.collection('schedules').doc(data.scheduleId);
        const scheduleDoc = await t.get(scheduleRef);
        
        if (scheduleDoc.exists) {
          const scheduleData = scheduleDoc.data();
          const currentAvailable = parseFloat(scheduleData.available) || 0;
          
          // Obter capacidade máxima para garantir que não ultrapassamos o limite ao restaurar
          let maxCapacity = 50;
          if (scheduleData.capacity) {
             const parsed = parseFloat(String(scheduleData.capacity).replace(/[^0-9.]/g, ''));
             if (!isNaN(parsed) && parsed > 0) maxCapacity = parsed;
          }

          const weightToAdd = parseFloat(data.weight);
          
          if (!isNaN(currentAvailable) && !isNaN(weightToAdd)) {
             // Garante que a disponibilidade nunca excede a capacidade total da rota
             const newAvailable = Math.min(currentAvailable + weightToAdd, maxCapacity);
             t.update(scheduleRef, { available: newAvailable });
          }
        }
      }

      t.delete(shipmentRef);
    });

    res.json({ message: 'Envio removido e capacidade restaurada.' });
  } catch (error) {
    console.error('Erro ao remover envio:', error);
    const status = error.message.includes('administradores') ? 403 : (error.message === 'Envio não encontrado' ? 404 : 500);
    res.status(status).json({ error: error.message });
  }
});

// PUT /:id - Atualizar envio (Admin)
router.put('/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const { status, currentLocation, from, to, weight, items } = req.body;
    
    // Verificar se é admin
    const userDoc = await db.collection('users').doc(req.user.uid).get();
    if (!userDoc.exists || userDoc.data().role !== 'admin') {
      return res.status(403).json({ error: 'Acesso não autorizado' });
    }

    const shipmentRef = db.collection('shipments').doc(id);
    const doc = await shipmentRef.get();

    if (!doc.exists) return res.status(404).json({ error: 'Envio não encontrado' });
    
    const oldStatus = doc.data().status;
    const oldLocation = doc.data().currentLocation;
    
    // Construção segura do objeto de atualização para evitar 'undefined'
    const updateData = {};
    if (status !== undefined) updateData.status = status;
    if (currentLocation !== undefined) updateData.currentLocation = currentLocation;
    if (from !== undefined) updateData.from = from;
    if (to !== undefined) updateData.to = to;
    if (weight !== undefined) updateData.weight = weight;
    if (items !== undefined) updateData.items = items;

    // Definir valores efetivos para o histórico (usar o novo se existir, senão manter o antigo)
    const effectiveStatus = status !== undefined ? status : oldStatus;
    const effectiveLocation = currentLocation !== undefined ? currentLocation : (oldLocation || '');

    // Atualizar histórico se necessário
    if ((status !== undefined && status !== oldStatus) || (currentLocation !== undefined && currentLocation !== oldLocation)) {
      updateData.trackingHistory = FieldValue.arrayUnion({
        status: effectiveStatus || 'Pendente',
        location: effectiveLocation || 'Localização não definida',
        date: new Date().toISOString()
      });
    }

    // Só atualiza se houver dados para alterar
    if (Object.keys(updateData).length > 0) {
      await shipmentRef.update(updateData);
    }

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