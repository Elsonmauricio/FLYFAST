import React, { createContext, useState, useContext, useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth, db } from '../lib/firebase';
import { doc, getDoc } from 'firebase/firestore';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [authState, setAuthState] = useState({
    token: null,
    user: null,
    isAuthenticated: false,
    isLoading: true, // Adicionamos um estado de loading para saber quando a verificação inicial terminou
  });

  // Ouve as mudanças no estado de autenticação do Firebase
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // Utilizador está logado
        const token = await firebaseUser.getIdToken();
        // Buscar dados adicionais do utilizador no Firestore
        const userDocRef = doc(db, 'users', firebaseUser.uid);
        const userDoc = await getDoc(userDocRef);
        const userData = userDoc.exists() ? userDoc.data() : { email: firebaseUser.email };

        localStorage.setItem('token', token); // Opcional, mas útil para chamadas diretas à API
        setAuthState({
          token,
          user: { uid: firebaseUser.uid, ...userData },
          isAuthenticated: true,
          isLoading: false,
        });
      } else {
        // Utilizador não está logado
        localStorage.removeItem('token');
        setAuthState({ token: null, user: null, isAuthenticated: false, isLoading: false });
      }
    });

    // Limpa o ouvinte quando o componente é desmontado
    return () => unsubscribe();
  }, []);

  const value = { authState }; // O contexto agora só precisa de fornecer o estado

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  return useContext(AuthContext);
};