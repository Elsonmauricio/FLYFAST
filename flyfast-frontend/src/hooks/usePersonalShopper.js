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
        const errorData = await response.json();
        throw new Error(errorData.message || 'Falha ao submeter o pedido. Tente novamente.');
      }

      setIsSuccess(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [authState.token]);

  return {
    isLoading, error, isSuccess, submitRequest
  };
};