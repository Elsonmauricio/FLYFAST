import { useState, useEffect } from "react";
// import { shopifyClient } from "../lib/shopify";

export const useShopData = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        setError(null);

        // Buscar todos os produtos da loja Shopify
        // const productsData = await shopifyClient.product.fetchAll();
        // setProducts(productsData);
        setProducts([]);
      } catch (err) {
        console.error(err);
        setError("Não foi possível carregar os produtos da loja.");
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []); // O array vazio garante que a busca ocorre apenas uma vez

  return { products, loading, error };
};