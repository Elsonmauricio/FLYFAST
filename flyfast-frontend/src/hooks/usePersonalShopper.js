import { useState, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';

export const usePersonalShopper = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const { authState } = useAuth();

  const submitRequest = useCallback(async (requestData) => {
    setIsLoading(true);
    setError(null);
    setIsSuccess(false);

    try {
      const isFormData = requestData instanceof FormData;
      const headers = {
        // Se o utilizador estiver logado, enviamos o token para associar o pedido
        ...(authState.token && { 'Authorization': `Bearer ${authState.token}` }),
      };

      if (!isFormData) {
        headers['Content-Type'] = 'application/json';
      }

      const response = await fetch('/api/personal-shopper/requests', {
        method: 'POST',
        headers,
        body: isFormData ? requestData : JSON.stringify(requestData),
      });

      if (!response.ok) {
        let errorMessage = 'Falha ao submeter o pedido. Tente novamente.';
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorMessage;
        } catch (e) {
          // Fallback caso a resposta não seja JSON (ex: erro 404 ou 500 do servidor web)
          errorMessage = `Erro ${response.status}: ${response.statusText || 'Servidor não encontrado'}`;
        }
        throw new Error(errorMessage);
      }

      setIsSuccess(true);
    } catch (err) {
      console.error("Erro no Personal Shopper:", err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [authState.token]);

  return {
    isLoading, error, isSuccess, submitRequest
  };
};