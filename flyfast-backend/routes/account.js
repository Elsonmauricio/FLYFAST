const express = require('express');
const router = express.Router();
const shipmentController = require('../controllers/shipmentController');
const { isAuthenticated } = require('../middleware/authMiddleware');

// GET /api/account/shipments - Obter todos os envios do utilizador logado
router.get('/shipments', isAuthenticated, shipmentController.getUserShipments);

// Outras rotas de conta podem ser adicionadas aqui no futuro (ex: /profile, /orders)

module.exports = router;