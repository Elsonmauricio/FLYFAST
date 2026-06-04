import { useState, useCallback, useEffect, useRef } from 'react';

// Hook para buscar informações de rastreamento com polling automático
export const useTracking = (pollInterval = 5000) => { // Poll a cada 5 segundos (mais responsivo)
  const [trackingInfo, setTrackingInfo] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const pollTimerRef = useRef(null);
  const lastStatusRef = useRef(null);

  const fetchTrackingInfo = useCallback(async (trackingCode, skipLoading = false) => {
    if (!skipLoading) {
      setIsLoading(true);
    }
    setError(null);

    if (!trackingCode || trackingCode.trim() === '') {
      setError('Por favor, insira um código de rastreamento válido.');
      setIsLoading(false);
      return;
    }

    try {
      // Adiciona timestamp para evitar cache
      const timestamp = new Date().getTime();
      const response = await fetch(`/api/tracking/${trackingCode}?_t=${timestamp}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        credentials: 'include' // Envia cookies para manter contexto
      });

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Nenhum envio encontrado com este código.');
        }
        throw new Error('Ocorreu um erro ao buscar os dados. Tente novamente.');
      }

      const data = await response.json();
      
      // Verifica se o status mudou e força re-render
      const newStatus = data?.status;
      if (lastStatusRef.current !== newStatus) {
        lastStatusRef.current = newStatus;
      }
      
      setTrackingInfo(data);

    } catch (err) {
      setError(err.message);
    } finally {
      if (!skipLoading) {
        setIsLoading(false);
      }
    }
  }, []);

  // Inicia polling automático quando um código de rastreamento é fornecido
  useEffect(() => {
    // Se não há código ou o estado é Entregue, não faz polling
    if (!trackingInfo?.code) {
      return;
    }

    const status = trackingInfo?.status?.toLowerCase() || '';
    const isDelivered = status.includes('entregue') || status.includes('delivered');

    // Limpa o timer anterior se existir
    if (pollTimerRef.current) {
      clearInterval(pollTimerRef.current);
    }

    // Se já foi entregue, não faz polling
    if (isDelivered) {
      return;
    }

    // Inicia o polling automático com intervalo mais curto
    pollTimerRef.current = setInterval(() => {
      fetchTrackingInfo(trackingInfo.code, true); // skipLoading = true para não mostrar loading
    }, pollInterval);

    return () => {
      if (pollTimerRef.current) {
        clearInterval(pollTimerRef.current);
      }
    };
  }, [trackingInfo?.code, fetchTrackingInfo, pollInterval]);

  // Função para forçar atualização imediata
  const forceRefresh = useCallback(() => {
    if (trackingInfo?.code) {
      fetchTrackingInfo(trackingInfo.code, false);
    }
  }, [trackingInfo?.code, fetchTrackingInfo]);

  return {
    trackingInfo,
    isLoading,
    error,
    fetchTrackingInfo,
    forceRefresh,
  };
};