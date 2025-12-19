import { useState, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

export const useCheckout = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const { authState } = useAuth();
  const navigate = useNavigate();

  const placeOrder = useCallback(async (checkoutData) => {
    setIsLoading(true);
    setError(null);

    try {
      // Endpoint da API para criar uma nova encomenda
      const response = await fetch('/api/orders/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authState.token}`,
        },
        body: JSON.stringify(checkoutData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Não foi possível finalizar a encomenda.');
      }

      const orderResult = await response.json();

      // Se o pagamento for com Stripe, o backend deve devolver um URL de sessão
      if (checkoutData.paymentMethod === 'stripe' && orderResult.stripeUrl) {
        // Redireciona o utilizador para a página de pagamento do Stripe
        window.location.href = orderResult.stripeUrl;
      } else {
        // Para outros casos (ex: PayPal, ou confirmação direta), navega para uma página de confirmação
        navigate(`/order-confirmation/${orderResult.orderId}`);
      }

    } catch (err) {
      setError(err.message);
      setIsLoading(false); // Para o loading apenas em caso de erro, pois em sucesso há redirecionamento
    }
  }, [authState.token, navigate]);

  return { isLoading, error, placeOrder };
};