import React, { createContext, useState, useEffect, useContext } from 'react';
import client from '../lib/shopify';

const ShopifyCartContext = createContext();

export const useShopifyCart = () => useContext(ShopifyCartContext);

export const ShopifyCartProvider = ({ children }) => {
  const [checkout, setCheckout] = useState(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    initializeCheckout();
  }, []);

  const initializeCheckout = async () => {
    const existingCheckoutId = localStorage.getItem('shopify_checkout_id');
    
    if (existingCheckoutId) {
      try {
        const checkout = await client.checkout.fetch(existingCheckoutId);
        // Se o checkout já foi completado, cria um novo
        if (!checkout.completedAt) {
          setCheckout(checkout);
          return;
        }
      } catch (e) {
        console.error("Checkout inválido ou expirado", e);
      }
    }
    createNewCheckout();
  };

  const createNewCheckout = async () => {
    try {
      const checkout = await client.checkout.create();
      localStorage.setItem('shopify_checkout_id', checkout.id);
      setCheckout(checkout);
    } catch (e) {
      console.error("Erro ao criar checkout", e);
    }
  };

  const addItemToCart = async (variantId, quantity) => {
    setIsLoading(true);
    try {
      const lineItemsToAdd = [{ variantId, quantity: parseInt(quantity, 10) }];
      const newCheckout = await client.checkout.addLineItems(checkout.id, lineItemsToAdd);
      setCheckout(newCheckout);
      setIsCartOpen(true); // Abre o carrinho automaticamente
    } catch (e) {
      console.error("Erro ao adicionar item", e);
    } finally {
      setIsLoading(false);
    }
  };

  const removeItemFromCart = async (lineItemId) => {
    setIsLoading(true);
    try {
      const newCheckout = await client.checkout.removeLineItems(checkout.id, [lineItemId]);
      setCheckout(newCheckout);
    } catch (e) {
      console.error("Erro ao remover item", e);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ShopifyCartContext.Provider value={{ 
      checkout, 
      isCartOpen, 
      setIsCartOpen, 
      addItemToCart, 
      removeItemFromCart,
      isLoading 
    }}>
      {children}
    </ShopifyCartContext.Provider>
  );
};