const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { db } = require('../config/firebase');
// const { adminAuth } = require('../middleware/auth');
const { uploadSingle } = require('../middleware/upload');
const { isAuthenticated, hasRole } = require('../middleware/authMiddleware');

// Dashboard stats
router.get('/dashboard/stats', isAuthenticated, hasRole(['admin']), adminController.getDashboardStats);

// Usuários
router.get('/users', isAuthenticated, hasRole(['admin']), adminController.getUsers);
router.get('/users/:id', isAuthenticated, hasRole(['admin']), adminController.getUserDetails);
router.put('/users/:id', isAuthenticated, hasRole(['admin']), adminController.updateUser);
router.delete('/users/:id', isAuthenticated, hasRole(['admin']), adminController.deleteUser);
router.post('/users/:id/impersonate', isAuthenticated, hasRole(['admin']), adminController.impersonateUser);

// Envios
router.get('/shipments', isAuthenticated, hasRole(['admin']), adminController.getShipments);
router.post('/shipments', isAuthenticated, hasRole(['admin']), adminController.createShipment);
router.get('/shipments/:id', isAuthenticated, hasRole(['admin']), adminController.getShipmentDetails);
router.put('/shipments/:id', isAuthenticated, hasRole(['admin']), adminController.updateShipment);
router.delete('/shipments/:id', isAuthenticated, hasRole(['admin']), adminController.deleteShipment);
router.post('/shipments/:id/resend-email', isAuthenticated, hasRole(['admin']), adminController.resendShipmentEmail);
router.post('/shipments/export', isAuthenticated, hasRole(['admin']), adminController.exportShipments);

// Pedidos
router.get('/orders', isAuthenticated, hasRole(['admin']), adminController.getOrders);
router.get('/orders/:id', isAuthenticated, hasRole(['admin']), adminController.getOrderDetails);
router.put('/orders/:id', isAuthenticated, hasRole(['admin']), adminController.updateOrder);
router.delete('/orders/:id', isAuthenticated, hasRole(['admin']), adminController.deleteOrder);
router.post('/orders/export', isAuthenticated, hasRole(['admin']), adminController.exportOrders);

// Produtos
router.get('/products', isAuthenticated, hasRole(['admin']), adminController.getProducts);
router.post('/products/import', 
  isAuthenticated, hasRole(['admin']),
  uploadSingle('file'),
  adminController.importProducts
);

router.post('/products/export', isAuthenticated, hasRole(['admin']), adminController.exportProducts);

// Personal Shopper
router.get('/personal-shopper', isAuthenticated, hasRole(['admin']), adminController.getPersonalShopperRequests);
router.put('/personal-shopper/:id', isAuthenticated, hasRole(['admin']), adminController.updatePersonalShopperRequest);

// Configurações
router.get('/settings', isAuthenticated, hasRole(['admin']), adminController.getSettings);
router.put('/settings', isAuthenticated, hasRole(['admin']), adminController.updateSettings);
router.put('/settings/email', isAuthenticated, hasRole(['admin']), adminController.updateEmailSettings);
router.put('/settings/payment', isAuthenticated, hasRole(['admin']), adminController.updatePaymentSettings);
router.put('/settings/shipping', isAuthenticated, hasRole(['admin']), adminController.updateShippingSettings);

// Logs
router.get('/logs', isAuthenticated, hasRole(['admin']), adminController.getLogs);
router.get('/logs/:id', isAuthenticated, hasRole(['admin']), adminController.getLogDetails);
router.delete('/logs', isAuthenticated, hasRole(['admin']), adminController.clearLogs);

// Backup
router.post('/backup', isAuthenticated, hasRole(['admin']), adminController.createBackup);
router.get('/backups', isAuthenticated, hasRole(['admin']), adminController.getBackups);
router.post('/backups/restore/:id', isAuthenticated, hasRole(['admin']), adminController.restoreBackup);
router.delete('/backups/:id', isAuthenticated, hasRole(['admin']), adminController.deleteBackup);

// Sistema
router.get('/system/health', isAuthenticated, hasRole(['admin']), adminController.getSystemHealth);
router.get('/system/info', isAuthenticated, hasRole(['admin']), adminController.getSystemInfo);
router.post('/system/maintenance', isAuthenticated, hasRole(['admin']), adminController.toggleMaintenance);
router.post('/system/cache/clear', isAuthenticated, hasRole(['admin']), adminController.clearCache);

// Relatórios
router.get('/reports/sales', isAuthenticated, hasRole(['admin']), adminController.getSalesReport);
router.get('/reports/shipments', isAuthenticated, hasRole(['admin']), adminController.getShipmentsReport);
router.get('/reports/users', isAuthenticated, hasRole(['admin']), adminController.getUsersReport);
router.get('/reports/financial', isAuthenticated, hasRole(['admin']), adminController.getFinancialReport);
router.post('/reports/generate', isAuthenticated, hasRole(['admin']), adminController.generateReport);

// API Keys
router.get('/api-keys', isAuthenticated, hasRole(['admin']), adminController.getApiKeys);
router.post('/api-keys', isAuthenticated, hasRole(['admin']), adminController.createApiKey);
router.put('/api-keys/:id', isAuthenticated, hasRole(['admin']), adminController.updateApiKey);
router.delete('/api-keys/:id', isAuthenticated, hasRole(['admin']), adminController.deleteApiKey);

// Notificações admin
router.get('/notifications', isAuthenticated, hasRole(['admin']), adminController.getAdminNotifications);
router.put('/notifications/:id', isAuthenticated, hasRole(['admin']), adminController.markAdminNotificationAsRead);

// --- GESTÃO DE PREÇOS (Inline para acesso direto ao DB) ---
// Rota PÚBLICA para que o site (Routes.jsx) possa ler os preços
router.get('/pricing', async (req, res) => {
  try {
    const doc = await db.collection('settings').doc('pricing').get();
    // Valores padrão se não existir configuração
    res.json(doc.exists ? doc.data() : { pricePerKg: 13000, serviceFee: 0, insuranceRate: 0 });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar tabela de preços' });
  }
});

router.put('/pricing', isAuthenticated, hasRole(['admin']), async (req, res) => {
  try {
    const { uid, email } = req.user;
    const newPricing = req.body;
    
    // 1. Buscar preço antigo para histórico
    const oldDoc = await db.collection('settings').doc('pricing').get();
    const oldPricing = oldDoc.exists ? oldDoc.data() : null;

    // 2. Atualizar
    await db.collection('settings').doc('pricing').set(newPricing, { merge: true });

    // 3. Criar Log de Auditoria
    await db.collection('audit_logs').add({
      action: 'UPDATE_PRICING',
      performedBy: uid,
      performedByEmail: email,
      details: {
        oldValue: oldPricing,
        newValue: newPricing
      },
      timestamp: new Date().toISOString(),
      resource: 'pricing'
    });

    res.json({ message: 'Tabela de preços atualizada com sucesso' });
  } catch (error) {
    console.error('Erro ao atualizar preços:', error);
    res.status(500).json({ error: 'Erro ao atualizar preços' });
  }
});

// Rota para buscar histórico de preços
router.get('/pricing/logs', isAuthenticated, hasRole(['admin']), async (req, res) => {
  try {
    const snapshot = await db.collection('audit_logs')
      .where('resource', '==', 'pricing')
      .orderBy('timestamp', 'desc')
      .limit(20)
      .get();
    
    const logs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.json(logs);
  } catch (error) {
    console.error('Erro ao buscar logs de preços:', error);
    res.status(500).json({ error: 'Erro ao buscar histórico' });
  }
});

// --- GESTÃO DE MENSAGENS DE CONTACTO ---
router.get('/contact-requests', isAuthenticated, hasRole(['admin']), async (req, res) => {
  try {
    const snapshot = await db.collection('contactRequests').orderBy('createdAt', 'desc').get();
    const requests = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.json(requests);
  } catch (error) {
    console.error('Erro ao buscar mensagens:', error);
    res.status(500).json({ error: 'Erro ao buscar mensagens' });
  }
});

router.delete('/contact-requests/:id', isAuthenticated, hasRole(['admin']), async (req, res) => {
  try {
    await db.collection('contactRequests').doc(req.params.id).delete();
    res.json({ message: 'Mensagem apagada com sucesso' });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao apagar mensagem' });
  }
});

// --- MANUTENÇÃO: Corrigir Capacidades (Script de Correção) ---
router.post('/system/fix-capacities', isAuthenticated, hasRole(['admin']), async (req, res) => {
  try {
    const snapshot = await db.collection('schedules').get();
    let fixedCount = 0;
    const updates = [];

    console.log(`🔄 Iniciando sincronização de ${snapshot.size} rotas...`);

    // Usar loop for...of para permitir await sequencial (mais seguro para muitas rotas)
    for (const doc of snapshot.docs) {
      const data = doc.data();
      const scheduleId = doc.id;
      
      // 1. Determinar Capacidade Máxima (Lógica igual ao shipments.js)
      let maxCapacity = 50;
      if (data.capacity) {
         const parsed = parseFloat(String(data.capacity).replace(/[^0-9.]/g, ''));
         if (!isNaN(parsed) && parsed > 0) maxCapacity = parsed;
      }

      // 2. Calcular peso real reservado somando os envios ativos na base de dados
      const shipmentsSnapshot = await db.collection('shipments')
        .where('scheduleId', '==', scheduleId)
        .get();
      
      let totalReserved = 0;
      shipmentsSnapshot.forEach(s => {
        const sData = s.data();
        // Ignorar envios cancelados
        if (sData.status !== 'Cancelado') {
           totalReserved += (parseFloat(sData.weight) || 0);
        }
      });

      // 3. Calcular disponibilidade correta e comparar
      const correctAvailable = Math.max(0, maxCapacity - totalReserved);
      const currentAvailable = parseFloat(data.available);
      
      // 4. Atualizar se houver discrepância (com margem de erro para float)
      if (isNaN(currentAvailable) || Math.abs(currentAvailable - correctAvailable) > 0.01) {
        console.log(`🔧 Rota ${scheduleId}: Ajustando disponível de ${currentAvailable} para ${correctAvailable} (Reservado Real: ${totalReserved})`);
        updates.push(doc.ref.update({ available: correctAvailable }));
        fixedCount++;
      }
    }

    if (updates.length > 0) {
      await Promise.all(updates);
    }

    res.json({ 
      message: 'Sincronização concluída. Capacidades recalculadas com base nos envios reais.', 
      fixedCount, 
      totalChecked: snapshot.size 
    });
  } catch (error) {
    console.error('Erro ao corrigir capacidades:', error);
    res.status(500).json({ error: 'Erro ao executar script de correção.' });
  }
});

// --- ROTA: Buscar Envios de um Agendamento Específico ---
router.get('/schedules/:id/shipments', isAuthenticated, hasRole(['admin']), async (req, res) => {
  try {
    const { id } = req.params;
    const snapshot = await db.collection('shipments')
      .where('scheduleId', '==', id)
      .get();
    
    const shipments = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.json(shipments);
  } catch (error) {
    console.error('Erro ao buscar envios da rota:', error);
    res.status(500).json({ error: 'Erro ao buscar envios da rota' });
  }
});

module.exports = router;