import { useState, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';

export const useNotifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const { authState } = useAuth();

  const fetchNotifications = useCallback(async () => {
    if (!authState?.token) return;

    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/notifications', {
        headers: {
          'Authorization': `Bearer ${authState.token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Falha ao carregar notificações.');
      }

      const data = await response.json();
      setNotifications(data);
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [authState?.token]);

  return { notifications, isLoading, error, fetchNotifications };
};