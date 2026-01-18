const express = require('express');
const router = express.Router();
const shopController = require('../controllers/shopController');

// Rota para receber notificações da Shopify (Webhooks)
// URL final será: https://teu-backend.com/api/shop/webhooks/shopify
router.post('/webhooks/shopify', shopController.handleShopifyWebhook);
module.exports = router;