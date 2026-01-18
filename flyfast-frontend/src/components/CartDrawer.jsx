import React from 'react';
import { useShopifyCart } from '../contexts/ShopifyCartContext';
import { FaTimes, FaTrash, FaSpinner } from 'react-icons/fa';

const CartDrawer = () => {
  const { isCartOpen, setIsCartOpen, checkout, removeItemFromCart, isLoading } = useShopifyCart();

  if (!isCartOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div className="absolute inset-0 bg-black bg-opacity-50 transition-opacity" onClick={() => setIsCartOpen(false)} />
      <div className="absolute inset-y-0 right-0 max-w-md w-full bg-white shadow-xl flex flex-col transform transition-transform">
        <div className="flex items-center justify-between p-4 border-b bg-gray-50">
          <h2 className="text-lg font-bold text-gray-800">Seu Carrinho</h2>
          <button onClick={() => setIsCartOpen(false)} className="text-gray-500 hover:text-gray-700">
            <FaTimes size={24} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {isLoading && <div className="flex justify-center py-4"><FaSpinner className="animate-spin text-flyfast-blue text-2xl" /></div>}
          
          {!checkout?.lineItems?.length ? (
            <div className="text-center mt-10">
              <p className="text-gray-500 mb-4">O carrinho está vazio.</p>
              <button onClick={() => setIsCartOpen(false)} className="text-flyfast-blue font-bold hover:underline">Continuar a comprar</button>
            </div>
          ) : (
            <ul className="space-y-4">
              {checkout.lineItems.map((item) => (
                <li key={item.id} className="flex py-4 border-b">
                  {item.variant?.image && (
                    <img src={item.variant.image.src} alt={item.title} className="h-20 w-20 object-cover rounded border" />
                  )}
                  <div className="ml-4 flex-1">
                    <div className="flex justify-between items-start">
                      <h3 className="text-sm font-bold text-gray-900 line-clamp-2">{item.title}</h3>
                      <p className="text-sm font-bold text-flyfast-blue ml-2 whitespace-nowrap">
                        {item.variant.price.amount} {item.variant.price.currencyCode}
                      </p>
                    </div>
                    <p className="text-sm text-gray-500 mt-1">Qtd: {item.quantity}</p>
                    <button 
                      onClick={() => removeItemFromCart(item.id)}
                      className="text-red-500 text-xs mt-3 flex items-center hover:text-red-700 font-medium"
                    >
                      <FaTrash className="mr-1" /> Remover
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {checkout?.lineItems?.length > 0 && (
          <div className="p-6 border-t bg-gray-50">
            <div className="flex justify-between text-lg font-bold text-gray-900 mb-4">
              <p>Subtotal</p>
              <p>{checkout.subtotalPrice.amount} {checkout.subtotalPrice.currencyCode}</p>
            </div>
            <p className="text-xs text-gray-500 mb-4 text-center">Portes e taxas calculados no checkout.</p>
            <a
              href={checkout.webUrl}
              className="w-full flex justify-center items-center px-6 py-4 border border-transparent rounded-lg shadow-sm text-base font-bold text-white bg-flyfast-blue hover:bg-blue-800 transition-colors"
            >
              Finalizar Compra na Shopify
            </a>
          </div>
        )}
      </div>
    </div>
  );
};

export default CartDrawer;