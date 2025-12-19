import Client from 'shopify-buy';

// Substitua com os seus dados reais da Shopify
const domain = process.env.REACT_APP_SHOPIFY_DOMAIN;
const storefrontAccessToken = process.env.REACT_APP_SHOPIFY_STOREFRONT_TOKEN;

export const shopifyClient = Client.buildClient({
  domain,
  storefrontAccessToken,
});