import React from 'react';
import { useCart } from '../contexts/CartContext';
import { Link } from 'react-router-dom';
import { FaTrash, FaSpinner } from 'react-icons/fa';

const Cart = () => {
  const { checkoutState, removeFromCart, updateQuantity } = useCart();
  const { checkout, isLoading, error } = checkoutState;

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <FaSpinner className="animate-spin text-4xl text-flyfast-blue" /> <span className="ml-4 text-lg">A carregar o seu carrinho...</span>
      </div>
    );
  }

  if (error) {
    return <div className="text-center text-red-500 py-16">{error}</div>;
  }

  if (!checkout || checkout.lineItems.length === 0) {
    return (
      <div className="text-center py-20">
        <div className="text-6xl mb-6">🛒</div>
        <h2 className="text-3xl font-bold text-flyfast-blue mb-4">O seu carrinho está vazio</h2>
        <p className="text-gray-600 mb-8">Parece que ainda não adicionou nada. Que tal explorar a nossa loja?</p>
        <Link to="/shop" className="btn-primary">
          Ir para a Loja
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-flyfast-blue mb-8">Meu Carrinho</h1>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Itens do Carrinho */}
        <div className="lg:col-span-2 space-y-6">
          {checkout.lineItems.map(item => (
            <div key={item.id} className="card flex flex-col sm:flex-row items-center gap-6 p-4">
              <img 
                src={item.variant.image.src} 
                alt={item.title}
                className="w-24 h-24 object-cover rounded-lg bg-gray-100"
              />
              <div className="flex-grow text-center sm:text-left">
                <h3 className="font-bold text-lg">{item.title}</h3>
                <p className="text-gray-500 text-sm">{item.variant.title}</p>
                <p className="text-gray-600 mt-1">Preço: {parseFloat(item.variant.priceV2.amount).toLocaleString('pt-AO', { style: 'currency', currency: item.variant.priceV2.currencyCode })}</p>
              </div>
              <div className="flex items-center gap-4">
                {/* Seletor de Quantidade */}
                <div className="flex items-center space-x-2">
                  <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="quantity-btn">-</button>
                  <span className="font-semibold w-8 text-center">{item.quantity}</span>
                  <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="quantity-btn">+</button>
                </div>
                <p className="font-bold w-28 text-right">
                  {/* O Shopify já não fornece o preço total por linha, calculamos manualmente */}
                  {(parseFloat(item.variant.priceV2.amount) * item.quantity).toLocaleString('pt-AO', { style: 'currency', currency: item.variant.priceV2.currencyCode })}
                </p>
                <button data-testid="remove-item-button" onClick={() => removeFromCart(item.id)} className="text-red-500 hover:text-red-700 p-2 rounded-full">
                  <FaTrash />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Resumo do Pedido */}
        <div className="lg:col-span-1">
          <div className="card sticky top-24">
            <h2 className="text-xl font-bold text-flyfast-blue mb-6">Resumo do Pedido</h2>
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-gray-600">Subtotal</span>
                <span className="font-semibold">{parseFloat(checkout.subtotalPriceV2.amount).toLocaleString('pt-AO', { style: 'currency', currency: checkout.subtotalPriceV2.currencyCode })}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Taxas</span>
                <span className="font-semibold">{parseFloat(checkout.totalTaxV2.amount).toLocaleString('pt-AO', { style: 'currency', currency: checkout.totalTaxV2.currencyCode })}</span>
              </div>
              <div className="border-t pt-4 flex justify-between text-lg font-bold">
                <span>Total</span>
                <span>{parseFloat(checkout.totalPriceV2.amount).toLocaleString('pt-AO', { style: 'currency', currency: checkout.totalPriceV2.currencyCode })}</span>
              </div>
            </div>
            <div className="mt-8">
              {/* O link agora aponta diretamente para o URL de checkout da Shopify */}
              <a href={checkout.webUrl} className="w-full btn-primary btn-lg text-center block">
                Finalizar Compra
              </a>
              <Link to="/shop" className="block text-center mt-4 text-flyfast-blue font-semibold hover:text-blue-900">
                Continuar a comprar
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;