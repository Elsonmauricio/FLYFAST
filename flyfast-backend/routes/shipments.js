const express = require('express');
const router = express.Router();
const shipmentController = require('../controllers/shipmentController');
const { isAuthenticated, hasRole } = require('../middleware/authMiddleware');
const { trackingLimiter, globalLimiter } = require('../middleware/rateLimit');

// Rota pública para rastrear um envio
// (Aplica um rate limit para evitar abusos)
router.get('/track/:trackingCode', trackingLimiter, shipmentController.trackShipment);

// --- Rotas Protegidas para Utilizadores Autenticados ---

// Criar um novo envio
router.post(
  '/',
  isAuthenticated,
  globalLimiter, // Limite geral para utilizadores autenticados
  shipmentController.createShipment
);

// Obter todos os envios do utilizador logado
router.get('/', isAuthenticated, shipmentController.getUserShipments);

// --- Rotas Protegidas para Admin/Staff ---

// Atualizar o status de um envio
router.patch(
  '/:shipmentId/status',
  isAuthenticated,
  hasRole(['admin', 'staff']), // Apenas admin e staff podem aceder
  shipmentController.updateShipmentStatus
);

module.exports = router;