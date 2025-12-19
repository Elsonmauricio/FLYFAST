import { useState, useCallback } from 'react';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
} from 'firebase/auth';
import { auth, db } from '../lib/firebase';
import { shopifyClient } from '../lib/shopify';
import { doc, setDoc } from 'firebase/firestore';

export const useLogin = () => {
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const performLogin = useCallback(async (email, password) => {
    setIsLoading(true);
    setError(null);
    try {
      await signInWithEmailAndPassword(auth, email, password);

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

    } catch (err) {
      setError('Email ou palavra-passe inválidos.');
      // Garante que limpamos o token da Shopify em caso de falha
      localStorage.removeItem('shopify_customer_access_token');
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
      localStorage.removeItem('shopify_customer_access_token');
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

  const performRegister = useCallback(async (email, password, name) => {
    setIsLoading(true);
    setError(null);

    if (password.length < 6) {
      setError('A palavra-passe deve ter no mínimo 6 caracteres.');
      setIsLoading(false);
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Guarda os dados adicionais do utilizador no Firestore
      await setDoc(doc(db, 'users', user.uid), {
        name: name,
        email: email,
        memberSince: new Date().getFullYear(),
        loyaltyPoints: 0,
      });

      // Após criar o utilizador no Firebase, cria também na Shopify
      const [firstName, ...lastNameParts] = name.split(' ');
      const lastName = lastNameParts.join(' ');

      const createShopifyCustomer = await shopifyClient.customer.create({
        email: email,
        password: password,
        firstName: firstName,
        lastName: lastName,
      });

      if (createShopifyCustomer.customerUserErrors?.length > 0) {
        console.warn("Criação de cliente na Shopify falhou:", createShopifyCustomer.customerUserErrors);
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