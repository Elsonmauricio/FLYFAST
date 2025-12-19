const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');
const { isAuthenticated, hasRole } = require('../middleware/authMiddleware');

// Notificações do usuário
router.get('/', isAuthenticated, notificationController.getUserNotifications);
router.put('/:notificationId/read', isAuthenticated, notificationController.markAsRead);

// Admin routes (enviar notificações)
router.post('/admin/send', 
  isAuthenticated,
  hasRole(['admin']),
  notificationController.sendNotification
);

module.exports = router;