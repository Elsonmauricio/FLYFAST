const express = require('express');
const router = express.Router();
const axios = require('axios');

// Rota Proxy para a Shopify Storefront API
router.post('/graphql', async (req, res) => {
  // Pega a query e variables enviadas pelo frontend (shopify-buy)
  const { query, variables } = req.body;

  // Configurações (Devem estar no .env do Backend)
  let domain = process.env.SHOPIFY_DOMAIN || 'flyfast.myshopify.com';
  // Remove protocolo (https://) e barras no final para evitar erros de URL (ex: https://flyfast.myshopify.com/ -> flyfast.myshopify.com)
  domain = domain.replace(/^https?:\/\//, '').replace(/\/$/, '');
  const storefrontAccessToken = process.env.SHOPIFY_STOREFRONT_TOKEN;

  if (!storefrontAccessToken) {
    console.error('Erro: SHOPIFY_STOREFRONT_TOKEN não configurado no backend.');
    return res.status(500).json({ error: 'Configuração de servidor ausente' });
  }

  try {
    // Faz a requisição para a Shopify (Server-to-Server)
    const response = await axios.post(
      `https://${domain}/api/2025-10/graphql.json`,
      { query, variables },
      {
        headers: {
          'Content-Type': 'application/json',
          'X-Shopify-Storefront-Access-Token': storefrontAccessToken
        }
      }
    );

    // Retorna a resposta da Shopify para o frontend
    res.json(response.data);

  } catch (error) {
    console.error('❌ Erro no Proxy Shopify:');
    if (error.response) {
      // O servidor respondeu com um status de erro (ex: 401, 403)
      console.error('Status:', error.response.status);
      console.error('Detalhes:', JSON.stringify(error.response.data, null, 2));
    } else {
      console.error('Erro de Rede/Config:', error.message);
    }

    res.status(error.response?.status || 500).json({ 
      error: 'Falha na comunicação com Shopify',
      details: error.response?.data 
    });
  }
});

module.exports = router;
