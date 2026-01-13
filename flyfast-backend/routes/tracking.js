const express = require('express');
const router = express.Router();
const shipmentController = require('../controllers/shipmentController');
const { trackingLimiter } = require('../middleware/rateLimit');

// GET /api/tracking/:trackingCode
// Rota dedicada para o rastreio, correspondendo à chamada do frontend
router.get('/:trackingCode', trackingLimiter, shipmentController.trackShipment);

// POST /api/tracking/:trackingCode/subscribe
// Rota para subscrever notificações por email
router.post('/:trackingCode/subscribe', trackingLimiter, shipmentController.subscribeToUpdates);

module.exports = router;