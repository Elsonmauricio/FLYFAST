import Client from 'shopify-buy';

// URL do Backend (Proxy)
// Em produção, não usamos localhost como fallback para evitar erros de Mixed Content.
// Se a variável não estiver definida em prod, usamos string vazia (caminho relativo) ou o localhost apenas em dev.
const isProduction = process.env.NODE_ENV === 'production';
const BACKEND_URL = process.env.REACT_APP_API_URL || (isProduction ? '' : 'http://localhost:5000');

// --- INTERCEPTADOR GLOBAL (Correção Definitiva de CORS) ---
// Intercepta qualquer chamada do navegador para a Shopify e desvia para o Backend
const originalFetch = window.fetch;

window.fetch = async (url, options) => {
  const urlString = url ? String(url instanceof Request ? url.url : url) : '';

  // Se a biblioteca tentar acessar a Shopify diretamente, nós desviamos
  if (urlString.includes('myshopify.com') && urlString.includes('/graphql')) {
    console.log('🔒 Proxy Ativado: Redirecionando chamada Shopify para Backend');
    
    // Constrói a URL correta. Se BACKEND_URL for vazio (prod sem env var), fica /api/shopify/graphql (relativo)
    const endpoint = BACKEND_URL 
      ? `${BACKEND_URL}/api/shopify/graphql`
      : '/api/shopify/graphql';

    return originalFetch(endpoint, {
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
  apiVersion: '2026-01'
});

export default client;
