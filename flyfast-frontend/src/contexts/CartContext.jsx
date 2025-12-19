import React, { createContext, useReducer, useContext, useCallback, useEffect } from 'react';
import { shopifyClient } from '../lib/shopify';

const CartContext = createContext();

// O reducer agora é mais simples, focado em atualizar o estado com base na resposta da API.
const cartReducer = (state, action) => {
  switch (action.type) {
    case 'SET_CART_LOADING':
      return { ...state, isLoading: true, error: null };
    case 'SET_CHECKOUT_SUCCESS':
      return { ...state, isLoading: false, checkout: action.payload };
    case 'SET_CART_ERROR':
      return { ...state, isLoading: false, error: action.payload };
    default:
      return state;
  }
};

export const CartProvider = ({ children }) => {
  const [state, dispatch] = useReducer(cartReducer, { checkout: { lineItems: [] }, isLoading: true, error: null });

  // Busca ou cria um checkout da Shopify quando o componente é montado
  useEffect(() => {
    const initializeCheckout = async () => {
      dispatch({ type: 'SET_CART_LOADING' });
      const checkoutId = localStorage.getItem('shopify_checkout_id');

      try {
        let checkout;
        if (checkoutId) {
          checkout = await shopifyClient.checkout.fetch(checkoutId);
          // Se o checkout já foi completado, criamos um novo
          if (checkout.completedAt) {
            checkout = await shopifyClient.checkout.create();
            localStorage.setItem('shopify_checkout_id', checkout.id);
          }
        } else {
          checkout = await shopifyClient.checkout.create();
          localStorage.setItem('shopify_checkout_id', checkout.id);
        }
        dispatch({ type: 'SET_CHECKOUT_SUCCESS', payload: checkout });
      } catch (err) {
        dispatch({ type: 'SET_CART_ERROR', payload: err.message });
        localStorage.removeItem('shopify_checkout_id'); // Limpa em caso de erro
      }
    };
    initializeCheckout();
  }, []);

  // Adiciona um item ao checkout
  const addToCart = useCallback(async (variantId, quantity) => {
    const checkoutId = state.checkout.id;
    const lineItemsToAdd = [{ variantId, quantity: parseInt(quantity, 10) }];

    try {
      const updatedCheckout = await shopifyClient.checkout.addLineItems(checkoutId, lineItemsToAdd);
      dispatch({ type: 'SET_CHECKOUT_SUCCESS', payload: updatedCheckout });
    } catch (err) {
      console.error(err);
      dispatch({ type: 'SET_CART_ERROR', payload: 'Não foi possível adicionar ao carrinho.' });
    }
  }, [state.checkout.id]);

  const removeFromCart = useCallback(async (lineItemId) => {
    const checkoutId = state.checkout.id;
    try {
      const updatedCheckout = await shopifyClient.checkout.removeLineItems(checkoutId, [lineItemId]);
      dispatch({ type: 'SET_CHECKOUT_SUCCESS', payload: updatedCheckout });
    } catch (err) {
      console.error(err);
      dispatch({ type: 'SET_CART_ERROR', payload: 'Não foi possível remover o item.' });
    }
  }, [state.checkout.id]);

  const updateQuantity = useCallback(async (lineItemId, quantity) => {
    if (quantity <= 0) {
      return removeFromCart(lineItemId);
    }
    const checkoutId = state.checkout.id;
    const lineItemsToUpdate = [{ id: lineItemId, quantity: parseInt(quantity, 10) }];
    try {
      const updatedCheckout = await shopifyClient.checkout.updateLineItems(checkoutId, lineItemsToUpdate);
      dispatch({ type: 'SET_CHECKOUT_SUCCESS', payload: updatedCheckout });
    } catch (err) {
      console.error(err);
      dispatch({ type: 'SET_CART_ERROR', payload: 'Não foi possível atualizar a quantidade.' });
    }
  }, [state.checkout.id, removeFromCart]);

  // O valor do contexto agora expõe o estado e as funções de ação
  const value = {
    checkoutState: state,
    addToCart,
    removeFromCart,
    updateQuantity,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

// Hook customizado para facilitar o uso
export const useCart = () => useContext(CartContext);