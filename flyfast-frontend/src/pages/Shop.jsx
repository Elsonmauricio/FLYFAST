import React, { useState } from 'react';
import ProductCard from '../components/ProductCard';
import { PRODUCTS } from '../utils/constants';

const Shop = () => {
  const [activeCategory, setActiveCategory] = useState('all');
  const [cartItems, setCartItems] = useState(3); // Mock cart count

  const categories = [
    { id: 'all', name: 'Todos os Produtos' },
    { id: 'merchandise', name: 'Merchandise' },
    { id: 'materials', name: 'Materiais de Envio' },
    { id: 'travel', name: 'Acessórios de Viagem' }
  ];

  const filteredProducts = activeCategory === 'all' 
    ? PRODUCTS 
    : PRODUCTS.filter(product => 
        product.category.toLowerCase().includes(activeCategory)
      );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Shop Header */}
      <div className="bg-flyfast-blue text-white py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold mb-4">🛍️ Loja FLYFAST</h1>
              <p className="text-xl text-flyfast-yellow">
                Produtos exclusivos e materiais de envio
              </p>
            </div>
            <div className="mt-6 md:mt-0">
              <button className="flex items-center space-x-2 bg-flyfast-yellow text-flyfast-blue px-6 py-3 rounded-lg font-bold hover:bg-yellow-400 transition">
                <span>🛒</span>
                <span>Carrinho ({cartItems})</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Categories */}
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-wrap gap-4 mb-8">
          {categories.map(category => (
            <button
              key={category.id}
              onClick={() => setActiveCategory(category.id)}
              className={`px-6 py-3 rounded-lg font-semibold transition ${
                activeCategory === category.id
                  ? 'bg-flyfast-blue text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              {category.name}
            </button>
          ))}
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredProducts.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>

        {/* Empty State */}
        {filteredProducts.length === 0 && (
          <div className="text-center py-16">
            <div className="text-6xl mb-6">📦</div>
            <h3 className="text-2xl font-bold text-gray-700 mb-4">
              Nenhum produto nesta categoria
            </h3>
            <p className="text-gray-600">
              Em breve teremos mais produtos disponíveis!
            </p>
          </div>
        )}
      </div>

      {/* Shipping Info */}
      <div className="bg-flyfast-light-yellow py-12 mt-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="text-4xl mb-4">🚚</div>
              <h3 className="font-bold text-lg mb-2">Envio Grátis</h3>
              <p className="text-gray-600">
                Para compras acima de 50.000 AOA em Angola ou 250€ em Portugal
              </p>
            </div>
            <div className="text-center">
              <div className="text-4xl mb-4">🔄</div>
              <h3 className="font-bold text-lg mb-2">Devolução Fácil</h3>
              <p className="text-gray-600">
                14 dias para trocas e devoluções
              </p>
            </div>
            <div className="text-center">
              <div className="text-4xl mb-4">🔒</div>
              <h3 className="font-bold text-lg mb-2">Pagamento Seguro</h3>
              <p className="text-gray-600">
                Cartão, MB Way, PayPal e transferência bancária
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Shop;