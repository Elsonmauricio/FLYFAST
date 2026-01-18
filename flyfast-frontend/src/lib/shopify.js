import Client from 'shopify-buy';

// URL do Backend (Proxy)
const BACKEND_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

// --- INTERCEPTADOR GLOBAL (Correção Definitiva de CORS) ---
// Intercepta qualquer chamada do navegador para a Shopify e desvia para o Backend
const originalFetch = window.fetch;

window.fetch = async (url, options) => {
  const urlString = url ? String(url instanceof Request ? url.url : url) : '';

  // Se a biblioteca tentar acessar a Shopify diretamente, nós desviamos
  if (urlString.includes('myshopify.com') && urlString.includes('/graphql')) {
    console.log('🔒 Proxy Ativado: Redirecionando chamada Shopify para Backend');
    return originalFetch(`${BACKEND_URL}/api/shopify/graphql`, {
      ...options,
      method: 'POST',
    });
  }
  return originalFetch(url, options);
};
// ----------------------------------------------------------

const client = Client.buildClient({
  domain: 'flyfast.myshopify.com', // Necessário para validação interna da lib
  storefrontAccessToken: 'dummy-token', // O token real está seguro no backend, aqui pode ser qualquer string
  apiVersion: '2025-01'
});

export default client;
