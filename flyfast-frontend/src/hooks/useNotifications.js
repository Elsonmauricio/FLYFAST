import { useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';

/**
 * Hook para acionar eventos de notificação no backend.
 */
export const useNotifications = () => {
  const { authState } = useAuth();

  const triggerNotification = useCallback(async (notificationData) => {
    // Só aciona se o utilizador estiver autenticado
    if (!authState.token) return;

    try {
      // Endpoint da API para acionar o envio de uma notificação
      await fetch('/api/notifications/trigger', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authState.token}`,
        },
        body: JSON.stringify(notificationData),
      });
    } catch (error) {
      console.error('Falha ao acionar a notificação:', error);
    }
  }, [authState.token]);

  return { triggerNotification };
};