const express = require('express');
const router = express.Router();

// POST /api/shopify/graphql
/*
router.post('/graphql', async (req, res) => {
  try {
    const response = await fetch(`https://${process.env.SHOPIFY_SHOP_NAME}.myshopify.com/api/2025-01/graphql`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Storefront-Access-Token': process.env.SHOPIFY_STOREFRONT_TOKEN
      },
      body: JSON.stringify(req.body)
    });

    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error('Erro no proxy Shopify:', error);
    res.status(500).json({ error: 'Erro ao comunicar com a Shopify' });
  }
});
*/

module.exports = router;