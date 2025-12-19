import React, { useState } from 'react';
import { useCart } from '../contexts/CartContext';
import { FaSpinner } from 'react-icons/fa';

const ProductCard = ({ product }) => {
  const [quantity, setQuantity] = useState(1);
  const [isAdding, setIsAdding] = useState(false);
  const { addToCart } = useCart();

  const handleAddToCart = async () => {
    // A API da Shopify precisa do ID da variante do produto, não do ID do produto.
    // Para simplificar, vamos usar a primeira variante disponível.
    const variantId = product.variants[0].id;

    setIsAdding(true);
    await addToCart(variantId, quantity);
    setIsAdding(false);
    // Opcional: mostrar uma notificação de sucesso
  };

  const handleFavorite = () => {
    // Implement favorite functionality
    alert(`${product.name} adicionado aos favoritos!`);
  };

  return (
    <div className="card hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
      {/* Product Image */}
      <div className="bg-gray-100 rounded-lg h-48 mb-4 flex items-center justify-center">
        <div className="text-6xl">
          {product.name.includes('T-shirt') && '👕'}
          {product.name.includes('Boné') && '🧢'}
          {product.name.includes('Caixa') && '📦'}
          {product.name.includes('Mochila') && '🎒'}
        </div>
      </div>

      {/* Product Info */}
      <div className="mb-4">
        <span className="text-xs font-semibold text-flyfast-blue bg-blue-50 px-2 py-1 rounded">
          {product.category}
        </span>
        <h3 className="text-lg font-bold text-gray-800 mt-2">
          {product.name}
        </h3>
        
        {/* Rating */}
        <div className="flex items-center mt-2">
          <div className="flex text-yellow-400">
            {'★'.repeat(Math.floor(product.rating))}
            {'☆'.repeat(5 - Math.floor(product.rating))}
          </div>
          <span className="text-sm text-gray-600 ml-2">
            {product.rating} ({product.reviews} reviews)
          </span>
        </div>

        {/* Price */}
        <div className="mt-3">
          <span className="text-2xl font-bold text-flyfast-blue">
            {product.price.toLocaleString()} {product.currency}
          </span>
          {product.currency === 'AOA' && (
            <p className="text-sm text-gray-500">
              ≈ {Math.round(product.price / 200)}€
            </p>
          )}
        </div>
      </div>

      {/* Quantity Selector */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <button 
            onClick={() => setQuantity(Math.max(1, quantity - 1))}
            className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center hover:bg-gray-300"
          >
            -
          </button>
          <span className="font-semibold">{quantity}</span>
          <button 
            onClick={() => setQuantity(quantity + 1)}
            className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center hover:bg-gray-300"
          >
            +
          </button>
        </div>
        
        <button 
          onClick={handleFavorite}
          className="text-gray-400 hover:text-red-500 transition"
        >
          ❤️
        </button>
      </div>

      {/* Action Buttons */}
      <div className="space-y-2">
        <button 
          onClick={handleAddToCart}
          className="w-full btn-primary py-3 flex items-center justify-center"
          disabled={isAdding}
        >
          {isAdding ? (
            <FaSpinner className="animate-spin" />
          ) : (
            '🛒 Adicionar ao Carrinho'
          )}
        </button>
        <button className="w-full border-2 border-flyfast-blue text-flyfast-blue py-3 rounded-lg font-semibold hover:bg-blue-50 transition">
          Ver Detalhes
        </button>
      </div>
    </div>
  );
};

export default ProductCard;