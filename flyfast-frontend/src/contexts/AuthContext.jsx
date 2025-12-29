import React, { createContext, useState, useContext, useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth, db } from '../lib/firebase';
import { doc, getDoc, onSnapshot } from 'firebase/firestore';

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
        const idTokenResult = await firebaseUser.getIdTokenResult();
        const token = idTokenResult.token;

        // Buscar dados adicionais do utilizador no Firestore
        const userDocRef = doc(db, 'users', firebaseUser.uid);
        const userDoc = await getDoc(userDocRef);
        const userData = userDoc.exists() ? userDoc.data() : { email: firebaseUser.email };

        // A role dos custom claims tem prioridade sobre a do Firestore,
        // para consistência com o backend.
        const finalUserData = {
          uid: firebaseUser.uid,
          ...userData,
          role: idTokenResult.claims.role || userData.role,
        };

        localStorage.setItem('token', token); // Opcional, mas útil para chamadas diretas à API
        setAuthState({
          token,
          user: finalUserData,
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

  // NOVO: Ouve por alterações de role em tempo real e força a atualização do token.
  useEffect(() => {
    // Se não houver um utilizador autenticado, não faz nada.
    if (!authState.user?.uid) {
      return;
    }

    const userDocRef = doc(db, 'users', authState.user.uid);
    const unsubscribe = onSnapshot(userDocRef, async (doc) => {
      if (doc.exists()) {
        const newUserData = doc.data();
        const currentUser = auth.currentUser;

        // Se uma alteração de role for detetada no Firestore, força a atualização do token.
        // O `onAuthStateChanged` irá depois tratar da atualização do estado automaticamente.
        if (currentUser && newUserData.role && newUserData.role !== authState.user.role) {
          console.log(
            `Role alterada no Firestore para '${newUserData.role}'. A forçar atualização do token.`
          );
          await currentUser.getIdToken(true);
        }
      }
    });

    return () => unsubscribe();
  }, [authState.user?.uid, authState.user?.role]); // Re-executa se o utilizador ou o role mudar

  const value = { authState }; // O contexto agora só precisa de fornecer o estado

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  return useContext(AuthContext);
};