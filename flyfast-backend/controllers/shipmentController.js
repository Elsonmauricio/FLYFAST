const { db, FieldValue } = require('../config/firebase');
const emailService = require('../services/emailService');

// Rastrear um envio pelo código (ID)
const trackShipment = async (req, res) => {
  const { trackingCode } = req.params;

  try {
    // Tenta buscar pelo ID do documento (case-sensitive)
    const shipmentDoc = await db.collection('shipments').doc(trackingCode).get();

    if (!shipmentDoc.exists) {
      return res.status(404).json({ error: 'Envio não encontrado.' });
    }

    const shipmentData = shipmentDoc.data();

    // Garante que existe um histórico para exibir
    let history = shipmentData.history || [];
    
    // Se não houver histórico (para envios antigos), cria um básico em tempo de execução
    if (!history || history.length === 0) {
        history = [
            {
                status: 'Pendente',
                location: shipmentData.from,
                date: shipmentData.createdAt,
                description: 'Envio registado no sistema'
            }
        ];
        
        if (shipmentData.status !== 'Pendente') {
             history.push({
                status: shipmentData.status,
                location: shipmentData.currentLocation || 'Em trânsito',
                date: shipmentData.updatedAt,
                description: `Atualização de estado: ${shipmentData.status}`
            });
        }
    }

    const response = {
      code: shipmentDoc.id,
      status: shipmentData.status,
      from: shipmentData.from,
      to: shipmentData.to,
      weight: shipmentData.weight,
      currentLocation: shipmentData.currentLocation || shipmentData.from,
      lastUpdate: shipmentData.updatedAt || shipmentData.createdAt,
      history: history
    };

    res.json(response);
  } catch (error) {
    console.error('Erro ao rastrear envio:', error);
    res.status(500).json({ error: 'Erro interno ao rastrear envio.' });
  }
};

// Atualizar o estado de um envio (Usado pelo Admin)
const updateShipmentStatus = async (req, res) => {
    const { shipmentId } = req.params;
    const { status, currentLocation, from, to } = req.body;

    let updatedShipmentData = null;

    try {
        const shipmentRef = db.collection('shipments').doc(shipmentId);
        
        await db.runTransaction(async (t) => {
            const doc = await t.get(shipmentRef);
            if (!doc.exists) {
                throw new Error('Envio não encontrado');
            }

            const currentData = doc.data();
            const updates = {
                updatedAt: new Date().toISOString()
            };

            if (status) updates.status = status;
            if (currentLocation) updates.currentLocation = currentLocation;
            if (from) updates.from = from;
            if (to) updates.to = to;

            // Atualizar histórico se houver mudança de status ou localização
            if ((status && status !== currentData.status) || (currentLocation && currentLocation !== currentData.currentLocation)) {
                const history = currentData.history || [];
                history.push({
                    status: status || currentData.status,
                    location: currentLocation || currentData.currentLocation || 'Em trânsito',
                    date: new Date().toISOString(),
                    description: status ? `Estado alterado para ${status}` : 'Localização atualizada'
                });
                updates.history = history;
            }

            t.update(shipmentRef, updates);
            
            // Prepara dados para envio de notificações fora da transação
            updatedShipmentData = { ...currentData, ...updates, id: shipmentId };
        });

        // --- Envio de Notificações (Pós-Transação) ---
        if (updatedShipmentData) {
            // 1. Notificação In-App (apenas para o dono do envio)
            if (updatedShipmentData.userId) {
                db.collection('notifications').add({
                    userId: updatedShipmentData.userId,
                    title: `Atualização de Envio #${shipmentId}`,
                    message: `O estado mudou para: ${status || updatedShipmentData.status}. Local: ${currentLocation || updatedShipmentData.currentLocation}`,
                    read: false,
                    createdAt: new Date().toISOString(),
                    type: 'shipment_update',
                    shipmentId: shipmentId
                }).catch(err => console.error("Erro ao criar notificação in-app:", err));
            }

            // 2. Notificação por Email (Dono + Subscritores)
            const emailsToNotify = new Set();
            
            // Adiciona email do dono
            if (updatedShipmentData.userEmail) emailsToNotify.add(updatedShipmentData.userEmail);
            
            // Adiciona subscritores (campo 'subscribers' no Firestore)
            if (updatedShipmentData.subscribers && Array.isArray(updatedShipmentData.subscribers)) {
                updatedShipmentData.subscribers.forEach(email => emailsToNotify.add(email));
            }

            // Envia emails
            emailsToNotify.forEach(email => {
                if (emailService && typeof emailService.sendTrackingUpdate === 'function') {
                    emailService.sendTrackingUpdate(email, updatedShipmentData);
                }
            });
        }

        res.json({ message: 'Estado do envio atualizado com sucesso' });
    } catch (error) {
        console.error('Erro ao atualizar envio:', error);
        const status = error.message === 'Envio não encontrado' ? 404 : 500;
        res.status(status).json({ error: error.message });
    }
};

// Obter envios do utilizador autenticado
const getUserShipments = async (req, res) => {
  try {
    const userId = req.user.uid;
    const snapshot = await db.collection('shipments')
      .where('userId', '==', userId)
      .get();

    // Ordenação em memória para evitar erros de índice no Firestore
    const shipments = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        
    res.json(shipments);
  } catch (error) {
    console.error('Erro ao buscar envios do utilizador:', error);
    res.status(500).json({ error: 'Erro ao buscar histórico de envios.' });
  }
};

// Subscrever atualizações de um envio
const subscribeToUpdates = async (req, res) => {
  const { trackingCode } = req.params;
  const { email } = req.body;

  if (!email || !email.includes('@')) {
    return res.status(400).json({ error: 'Email inválido.' });
  }

  try {
    const shipmentRef = db.collection('shipments').doc(trackingCode);
    // Adiciona o email ao array 'subscribers', criando o array se não existir (arrayUnion evita duplicados)
    await shipmentRef.update({
      subscribers: FieldValue.arrayUnion(email)
    });

    res.json({ message: 'Subscrição realizada com sucesso.' });
  } catch (error) {
    console.error('Erro ao subscrever:', error);
    res.status(500).json({ error: 'Erro ao processar subscrição.' });
  }
};

module.exports = {
  trackShipment,
  updateShipmentStatus,
  getUserShipments,
  subscribeToUpdates
};