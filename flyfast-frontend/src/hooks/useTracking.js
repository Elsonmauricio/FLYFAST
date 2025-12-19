import { useState, useCallback } from 'react';

// Hook para buscar informações de rastreamento
export const useTracking = () => {
  const [trackingInfo, setTrackingInfo] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchTrackingInfo = useCallback(async (trackingCode) => {
    setIsLoading(true);
    setError(null);
    setTrackingInfo(null); // Limpa dados anteriores

    if (!trackingCode || trackingCode.trim() === '') {
      setError('Por favor, insira um código de rastreamento válido.');
      setIsLoading(false);
      return;
    }

    try {
      // A URL da API viria de uma variável de ambiente, ex: process.env.REACT_APP_API_URL
      const response = await fetch(`/api/tracking/${trackingCode}`);

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Nenhum envio encontrado com este código.');
        }
        throw new Error('Ocorreu um erro ao buscar os dados. Tente novamente.');
      }

      const data = await response.json();
      setTrackingInfo(data);

    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    trackingInfo,
    isLoading,
    error,
    fetchTrackingInfo,
  };
};