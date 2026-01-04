const express = require('express');
const router = express.Router();
const shipmentController = require('../controllers/shipmentController');
const { isAuthenticated, hasRole } = require('../middleware/authMiddleware');
const { trackingLimiter, globalLimiter } = require('../middleware/rateLimit');
const { db } = require('../config/firebase');
// Importamos o objeto inteiro para evitar erros de destructuring se o módulo falhar
const emailService = require('../services/emailService');
const whatsappService = require('../services/whatsappService');

// Rota pública para rastrear um envio
// (Aplica um rate limit para evitar abusos)
router.get('/track/:trackingCode', trackingLimiter, shipmentController.trackShipment);

// Rota pública para subscrever atualizações de um envio
router.post('/track/:trackingCode/subscribe', trackingLimiter, shipmentController.subscribeToUpdates);

// --- Rotas Protegidas para Utilizadores Autenticados ---

// Criar um novo envio
router.post(
  '/',
  isAuthenticated,
  globalLimiter, // Limite geral para utilizadores autenticados
  async (req, res) => {
    const { routeId, weight, from, to, items } = req.body;
    // Usa o ID do utilizador autenticado para segurança
    const userId = req.user.uid;

    // 1. Validações
    if (!routeId || !weight) {
      return res.status(400).json({ error: 'Dados incompletos: routeId e peso são obrigatórios.' });
    }

    const weightVal = parseFloat(weight);
    if (isNaN(weightVal) || weightVal <= 0) {
      return res.status(400).json({ error: 'O peso deve ser um número positivo.' });
    }

    try {
      // 2. Executar Transação (Leitura + Escrita Atómica)
      const shipmentResult = await db.runTransaction(async (t) => {
        // A. Buscar a rota (schedule)
        const routeRef = db.collection('schedules').doc(routeId);
        const routeDoc = await t.get(routeRef);

        if (!routeDoc.exists) {
          throw new Error('Rota não encontrada.');
        }

        const routeData = routeDoc.data();
        // Garante que tratamos available como número (usa capacity se available não existir)
        const currentAvailable = parseFloat(routeData.available !== undefined ? routeData.available : routeData.capacity);

        // B. Verificar se há espaço suficiente
        if (currentAvailable < weightVal) {
          throw new Error(`Capacidade insuficiente. Apenas ${currentAvailable}kg disponíveis nesta rota.`);
        }

        // C. Preparar o novo envio
        const shipmentRef = db.collection('shipments').doc();
        const shipmentData = {
          userId,
          userEmail: req.user.email || null, // Guarda o email do cliente para identificação no Admin
          routeId, // Importante: Ligar o envio à rota
          from: from || routeData.from,
          to: to || routeData.to,
          weight: weightVal,
          items: items || [],
          status: 'Pendente',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          history: [{
            status: 'Pendente',
            location: from || routeData.from,
            date: new Date().toISOString(),
            description: 'Reserva criada'
          }]
        };

        // D. Executar as escritas (Criar Envio + Atualizar Rota)
        t.set(shipmentRef, shipmentData);
        const newAvailable = currentAvailable - weightVal;
        t.update(routeRef, { available: newAvailable });

        // Retorna os dados para usar fora da transação
        return { id: shipmentRef.id, ...shipmentData };
      });

      // 3. Enviar Notificações (Assíncrono)
      // A. Email
      if (emailService && typeof emailService.sendShipmentConfirmation === 'function') {
        emailService.sendShipmentConfirmation(req.user.email, shipmentResult).catch(err => console.error("Erro envio email:", err));
      }

      // B. Notificação Interna (Firestore)
      db.collection('notifications').add({
        userId,
        title: 'Reserva Confirmada',
        message: `O seu envio #${shipmentResult.id} foi registado com sucesso.`,
        read: false,
        createdAt: new Date().toISOString()
      });

      res.status(201).json({ message: 'Envio criado com sucesso e lugar reservado!' });
    } catch (error) {
      console.error('Erro ao criar envio:', error);
      // Retorna erro 400 se for lógica de negócio (sem capacidade), 500 se for erro de sistema
      const status = error.message.includes('insuficiente') || error.message.includes('não encontrada') ? 400 : 500;
      res.status(status).json({ error: error.message });
    }
  }
);

// --- Rotas Protegidas para Admin/Staff ---

// Atualizar o status de um envio
router.patch(
  '/:shipmentId/status',
  isAuthenticated,
  hasRole(['admin', 'staff']), // Apenas admin e staff podem aceder
  shipmentController.updateShipmentStatus
);

// Cancelar envio e repor capacidade (Admin)
router.post(
  '/:shipmentId/cancel',
  isAuthenticated,
  hasRole(['admin']),
  async (req, res) => {
    const { shipmentId } = req.params;

    try {
      const result = await db.runTransaction(async (t) => {
        const shipmentRef = db.collection('shipments').doc(shipmentId);
        const shipmentDoc = await t.get(shipmentRef);

        if (!shipmentDoc.exists) {
          throw new Error('Envio não encontrado.');
        }

        const shipmentData = shipmentDoc.data();

        if (shipmentData.status === 'Cancelado') {
          throw new Error('Este envio já foi cancelado.');
        }

        // Buscar a rota associada
        const routeRef = db.collection('schedules').doc(shipmentData.routeId);
        const routeDoc = await t.get(routeRef);

        if (!routeDoc.exists) {
           // Se a rota não existe mais, apenas cancelamos o envio sem repor stock
           t.update(shipmentRef, { status: 'Cancelado', updatedAt: new Date().toISOString() });
           return;
        }

        const routeData = routeDoc.data();
        const currentAvailable = parseFloat(routeData.available !== undefined ? routeData.available : routeData.capacity);
        const weightToRestore = parseFloat(shipmentData.weight);

        // Atualizar: Define status como Cancelado e devolve o peso à rota
        t.update(shipmentRef, { status: 'Cancelado', updatedAt: new Date().toISOString() });
        t.update(routeRef, { available: currentAvailable + weightToRestore });

        return { userId: shipmentData.userId, id: shipmentId };
      });

      // Notificações de Cancelamento
      // A. Notificação Interna
      db.collection('notifications').add({
        userId: result.userId,
        title: 'Envio Cancelado',
        message: `O seu envio #${result.id} foi cancelado e o valor reembolsado (se aplicável).`,
        read: false,
        createdAt: new Date().toISOString()
      });

      // B. WhatsApp (Se o utilizador tiver telefone registado)
      try {
        const userDoc = await db.collection('users').doc(result.userId).get();
        if (userDoc.exists) {
          const userData = userDoc.data();
          if (userData.phone) {
            if (whatsappService && typeof whatsappService.sendWhatsAppMessage === 'function') {
               await whatsappService.sendWhatsAppMessage(userData.phone, `⚠️ O seu envio #${result.id} foi cancelado. Por favor, contacte o suporte para mais detalhes.`);
            }
          }
        }
      } catch (err) { console.error('Erro ao enviar WhatsApp:', err); }

      res.json({ message: 'Envio cancelado e capacidade reposta com sucesso.' });
    } catch (error) {
      console.error('Erro ao cancelar envio:', error);
      res.status(500).json({ error: error.message });
    }
  }
);

// Reenviar email de rastreio (Admin)
router.post(
  '/:shipmentId/resend-email',
  isAuthenticated,
  hasRole(['admin']),
  async (req, res) => {
    const { shipmentId } = req.params;
    try {
      const shipmentDoc = await db.collection('shipments').doc(shipmentId).get();
      
      if (!shipmentDoc.exists) {
        return res.status(404).json({ error: 'Envio não encontrado.' });
      }

      const shipmentData = { id: shipmentDoc.id, ...shipmentDoc.data() };
      
      // Tenta obter o email: do envio OU do perfil do utilizador (fallback para envios antigos)
      let targetEmail = shipmentData.userEmail;
      
      if (!targetEmail && shipmentData.userId) {
        const userDoc = await db.collection('users').doc(shipmentData.userId).get();
        if (userDoc.exists) {
          targetEmail = userDoc.data().email;
        }
      }

      if (!targetEmail) {
        return res.status(400).json({ error: 'Email do cliente não encontrado.' });
      }
      
      // Envia o email
      if (emailService && typeof emailService.sendShipmentConfirmation === 'function') {
        await emailService.sendShipmentConfirmation(targetEmail, shipmentData);
      }
      
      res.json({ message: 'Email reenviado com sucesso.' });
    } catch (error) {
      console.error('Erro ao reenviar email:', error);
      res.status(500).json({ error: error.message });
    }
  }
);

module.exports = router;