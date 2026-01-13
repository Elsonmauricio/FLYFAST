import { useState, useCallback } from 'react';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
} from 'firebase/auth';
import { auth } from '../lib/firebase';
// import { shopifyClient } from '../lib/shopify';

export const useLogin = () => {
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const performLogin = useCallback(async (email, password) => {
    setIsLoading(true);
    setError(null);
    try {
      await signInWithEmailAndPassword(auth, email, password);

      /*
      // Após o login no Firebase, obtemos o token de acesso do cliente da Shopify
      const tokenResponse = await shopifyClient.customer.createAccessToken({
        email: email,
        password: password,
      });

      if (tokenResponse.customerAccessToken) {
        const customerAccessToken = tokenResponse.customerAccessToken.accessToken;
        localStorage.setItem('shopify_customer_access_token', customerAccessToken);
      } else {
        // Não bloqueia o login, mas avisa que a parte da Shopify falhou
        console.warn("Login de cliente na Shopify falhou:", tokenResponse.customerUserErrors);
      }
      */

    } catch (err) {
      setError('Email ou palavra-passe inválidos.');
      // Garante que limpamos o token da Shopify em caso de falha
      // localStorage.removeItem('shopify_customer_access_token');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { performLogin, isLoading, error };
};

export const useLogout = () => {
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const performLogout = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      await signOut(auth);
      // Limpa também o token da Shopify
      // localStorage.removeItem('shopify_customer_access_token');
    } catch (err) {
      setError('Ocorreu um erro ao terminar a sessão.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { performLogout, isLoading, error };
};

export const useRegister = () => {
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const performRegister = useCallback(async (email, password, name, phone) => {
    setIsLoading(true);
    setError(null);

    if (password.length < 6) {
      setError('A palavra-passe deve ter no mínimo 6 caracteres.');
      setIsLoading(false);
      return;
    }

    // Validação de Email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Por favor, insira um endereço de email válido.');
      setIsLoading(false);
      return;
    }

    // Validação de Telefone (Angola ou Portugal)
    const phoneClean = phone ? phone.replace(/\D/g, '') : '';
    const validPhone = 
      /^9[1-9]\d{7}$/.test(phoneClean) ||        // 9xxxxxxxx (9 dígitos)
      /^2449[1-9]\d{7}$/.test(phoneClean) ||     // 2449xxxxxxxx (Angola com indicativo)
      /^3519[1-9]\d{7}$/.test(phoneClean);       // 3519xxxxxxxx (Portugal com indicativo)

    if (!validPhone) {
      setError('Número de telefone inválido. Insira um número válido de Angola ou Portugal.');
      setIsLoading(false);
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      const token = await user.getIdToken();

      // Chama o endpoint para criar o perfil no backend (Firestore + Shopify)
      const response = await fetch('/api/users/create-profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ name, email, phone }),
      });

      if (!response.ok) {
        throw new Error('Falha ao criar perfil do utilizador.');
      }

      // O AuthContext irá detetar o novo utilizador e atualizar o estado global
    } catch (err) {
      setError('Não foi possível criar a conta. O email poderá já estar em uso.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { performRegister, isLoading, error };
};