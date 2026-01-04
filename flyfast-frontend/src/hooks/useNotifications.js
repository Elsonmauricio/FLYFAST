import { useState, useCallback, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { db } from '../lib/firebase';
import { collection, query, where, onSnapshot, orderBy } from 'firebase/firestore';

export const useNotifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const { authState } = useAuth();
  const { addToast } = useToast();
  const isInitialLoad = useRef(true);

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

  // Efeito para ouvir notificações em tempo real
  useEffect(() => {
    if (!authState.user?.uid) return;

    const q = query(
      collection(db, 'notifications'),
      where('userId', '==', authState.user.uid),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const newNotifications = [];
      
      // Verifica alterações específicas (adicionados, modificados, removidos)
      querySnapshot.docChanges().forEach((change) => {
        if (change.type === 'added') {
          const notificationData = { id: change.doc.id, ...change.doc.data() };
          newNotifications.push(notificationData);

          // Apenas mostra o toast se não for o carregamento inicial
          if (!isInitialLoad.current) {
            addToast(notificationData.message, 'info');
          }
        }
      });

      // Atualiza o estado com a lista completa (já ordenada pelo Firestore)
      const allNotifications = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setNotifications(allNotifications);
      
      // Marca que o carregamento inicial terminou
      isInitialLoad.current = false;
    }, (err) => {
      console.error("Erro no listener de notificações:", err);
      setError("Erro ao receber notificações em tempo real.");
    });

    // Limpa o listener quando o componente desmonta
    return () => unsubscribe();

  }, [authState.user?.uid, addToast]);

  return { notifications, isLoading, error, fetchNotifications };
};