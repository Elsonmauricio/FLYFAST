const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
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

module.exports = router;