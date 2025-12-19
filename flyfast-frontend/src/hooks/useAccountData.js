import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { shopifyClient } from '../lib/shopify';

// Hook para buscar o histórico de envios do utilizador
export const useShipments = () => {
  const [shipments, setShipments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const { authState } = useAuth();

  useEffect(() => {
    const fetchShipments = async () => {
      if (!authState.token) {
        setIsLoading(false);
        // Não é um erro, apenas não há utilizador logado para buscar dados.
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        // A URL da API viria de uma variável de ambiente, ex: process.env.REACT_APP_API_URL
        const response = await fetch('/api/account/shipments', {
          headers: {
            'Authorization': `Bearer ${authState.token}`,
          },
        });

        if (!response.ok) {
          throw new Error('Não foi possível carregar o histórico de envios.');
        }

        const data = await response.json();
        setShipments(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchShipments();
  }, [authState.token]); // A dependência é o token, para que a busca seja refeita se o utilizador mudar.

  return { shipments, isLoading, error };
};

// Hook para buscar o histórico de encomendas da loja (Shopify/Backend)
export const useOrders = () => {
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const { authState } = useAuth();

  useEffect(() => {
    const fetchOrders = async () => {
      const customerAccessToken = localStorage.getItem('shopify_customer_access_token');

      if (!authState.isAuthenticated || !customerAccessToken) {
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        // Query GraphQL para buscar as encomendas do cliente
        const query = `
          query($customerAccessToken: String!, $first: Int!) {
            customer(customerAccessToken: $customerAccessToken) {
              orders(first: $first, sortKey: PROCESSED_AT, reverse: true) {
                edges {
                  node {
                    id
                    orderNumber
                    processedAt
                    fulfillmentStatus
                    customerUrl
                    totalPriceV2 {
                      amount
                      currencyCode
                    }
                    lineItems(first: 5) {
                      edges {
                        node {
                          title
                          quantity
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        `;
        const variables = { customerAccessToken, first: 20 };
        const response = await shopifyClient.graphQLClient.send(query, variables);

        if (response.data.customer) {
          const formattedOrders = response.data.customer.orders.edges.map(({ node }) => ({
            id: `#${node.orderNumber}`,
            date: node.processedAt,
            product: node.lineItems.edges.map(line => line.node.title).join(', '),
            status: node.fulfillmentStatus === 'FULFILLED' ? 'Enviado' : 'Em Processamento',
            total: `${parseFloat(node.totalPriceV2.amount).toLocaleString('pt-AO')} ${node.totalPriceV2.currencyCode}`,
            url: node.customerUrl,
          }));
          setOrders(formattedOrders);
        } else {
          throw new Error("Token de cliente inválido ou expirado.");
        }
      } catch (err) {
        setError('Não foi possível carregar o histórico de pedidos.');
        console.error("Falha ao buscar pedidos da Shopify:", err);
        localStorage.removeItem('shopify_customer_access_token');
      } finally {
        setIsLoading(false);
      }
    };
    fetchOrders();
  }, [authState.token]);

  return { orders, isLoading, error };
};