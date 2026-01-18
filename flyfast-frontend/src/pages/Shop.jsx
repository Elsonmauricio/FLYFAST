import React, { useEffect, useState } from 'react';
import client from '../lib/shopify';
import { ShopifyCartProvider, useShopifyCart } from '../contexts/ShopifyCartContext';
import CartDrawer from '../components/CartDrawer';
import { FaShoppingCart, FaExclamationTriangle, FaTimes, FaInfoCircle, FaMinus, FaPlus, FaSearch } from 'react-icons/fa';

const ShopContent = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [collections, setCollections] = useState([]);
  const [selectedCollectionId, setSelectedCollectionId] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const { addItemToCart, setIsCartOpen, checkout } = useShopifyCart();

  useEffect(() => {
    // Busca todas as coleções da Shopify
    client.collection.fetchAll().then((fetchedCollections) => {
      // Filtra a coleção "Página inicial" (ou "Home page") para não aparecer nos filtros
      const filtered = fetchedCollections.filter(c => c.title !== 'Página inicial' && c.title !== 'Home page');
      setCollections(filtered);
    }).catch(err => console.error("Erro ao buscar coleções:", err));
  }, []);

  useEffect(() => {
    setLoading(true);
    
    const fetchPromise = selectedCollectionId 
      ? client.collection.fetchWithProducts(selectedCollectionId, {productsFirst: 250}).then(col => col.products)
      : client.product.fetchAll(250);

    fetchPromise.then((fetchedProducts) => {
      console.log("✅ Produtos carregados com sucesso:", fetchedProducts);
      setProducts(fetchedProducts);
      setLoading(false);
    }).catch((err) => {
      console.error("Erro ao buscar produtos na Shopify:", err);
      setError(err);
      setLoading(false);
    });
  }, [selectedCollectionId]);

  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col justify-center items-center bg-gray-50 p-4 text-center">
        <FaExclamationTriangle className="text-5xl text-red-500 mb-4" />
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Não foi possível carregar a loja</h2>
        <p className="text-gray-600 mb-6 max-w-md">
          Ocorreu um erro de conexão com o Shopify (CORS).
        </p>
        <div className="bg-white p-6 rounded-lg shadow-md text-left text-sm text-gray-700 max-w-lg border-l-4 border-red-500">
          <p className="font-bold mb-2 text-red-600">Diagnóstico:</p>
          <p className="mb-2">O navegador bloqueou o acesso à API da Shopify. Isto acontece quase sempre por <strong>configuração incorreta do Token</strong>.</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Verifique se está a usar o <strong>Storefront Access Token</strong> (Público).</li>
            <li>Não use o <strong>Admin API Token</strong> (Começa por <code>shpat_</code>) no frontend.</li>
            <li>Confirme se a App no Shopify tem a "Storefront API" ativada.</li>
          </ul>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 relative">
      {/* Botão Flutuante do Carrinho */}
      <button 
        onClick={() => setIsCartOpen(true)} 
        className="fixed bottom-8 right-8 bg-flyfast-blue text-white p-4 rounded-full shadow-lg z-40 hover:bg-blue-800 transition-colors flex items-center justify-center"
      >
        <FaShoppingCart size={24} />
        {checkout?.lineItems?.length > 0 && (
          <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center border-2 border-white">
            {checkout.lineItems.length}
          </span>
        )}
      </button>

      <div className="container mx-auto px-4">
        <h1 className="text-4xl font-bold text-flyfast-blue mb-8 text-center">Flyfast-Market</h1>
        
        {/* Barra de Pesquisa */}
        <div className="max-w-md mx-auto mb-8 relative">
          <input
            type="text"
            placeholder="Pesquisar produtos..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-flyfast-blue focus:border-transparent shadow-sm"
          />
          <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
        </div>

        {/* Filtros de Coleção */}
        <div className="flex flex-wrap justify-center gap-3 mb-8">
          <button
            onClick={() => setSelectedCollectionId('')}
            className={`px-4 py-2 rounded-full text-sm font-bold transition-colors ${
              selectedCollectionId === '' 
                ? 'bg-flyfast-blue text-white shadow-md' 
                : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
            }`}
          >
            Todos
          </button>
          {collections.map(collection => (
            <button
              key={collection.id}
              onClick={() => setSelectedCollectionId(collection.id)}
              className={`px-4 py-2 rounded-full text-sm font-bold transition-colors ${
                selectedCollectionId === collection.id
                  ? 'bg-flyfast-blue text-white shadow-md'
                  : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
              }`}
            >
              {collection.title}
            </button>
          ))}
        </div>

        {products.length === 0 && !loading ? (
          <div className="text-center py-16">
            <div className="text-6xl mb-6">📦</div>
            <p className="text-xl text-gray-600">Nenhum produto disponível no momento.</p>
          </div>
        ) : products.filter(p => p.title.toLowerCase().includes(searchQuery.toLowerCase())).length === 0 ? (
          <div className="text-center py-16">
            <div className="text-6xl mb-6">🔍</div>
            <p className="text-xl text-gray-600">Nenhum produto encontrado para "{searchQuery}".</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.filter(p => p.title.toLowerCase().includes(searchQuery.toLowerCase())).map((product) => (
              <div key={product.id} className="bg-white rounded-xl shadow-md hover:shadow-2xl transition-all duration-300 flex flex-col transform hover:-translate-y-1 border border-gray-100">
                {/* Imagem do Produto */}
                {product.images && product.images.length > 0 && (
                  <div 
                    className="h-48 sm:h-64 overflow-hidden bg-gray-100 relative group cursor-pointer"
                    onClick={() => { 
                      setSelectedProduct(product); 
                      setQuantity(1); 
                      setSelectedVariant(product.variants[0]);
                      setCurrentImageIndex(0);
                    }}
                  >
                    <img 
                      src={product.images[0].src} 
                      alt={product.title} 
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300 flex items-center justify-center">
                      <span className="bg-white text-flyfast-blue px-4 py-2 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 font-bold text-sm shadow-lg transform translate-y-4 group-hover:translate-y-0 flex items-center gap-2">
                        <FaInfoCircle /> Ver Detalhes
                      </span>
                    </div>
                  </div>
                )}
                
                <div className="p-5 flex-1 flex flex-col">
                  <h2 
                    className="text-lg font-bold text-gray-900 mb-1 line-clamp-1 cursor-pointer hover:text-flyfast-blue transition-colors" 
                    title={product.title}
                    onClick={() => { 
                      setSelectedProduct(product); 
                      setQuantity(1); 
                      setSelectedVariant(product.variants[0]);
                      setCurrentImageIndex(0);
                    }}
                  >
                    {product.title}
                  </h2>
                  <p className="text-gray-500 text-sm mb-4 line-clamp-2 flex-1">
                    {product.description}
                  </p>
                  
                  <div className="flex flex-col sm:flex-row justify-between items-center mt-auto pt-4 border-t border-gray-100 gap-3">
                    <span className="text-xl font-extrabold text-flyfast-blue">
                      {product.variants[0].price.amount} {product.variants[0].price.currencyCode}
                    </span>
                    
                    {/* Botão de Adicionar ao Carrinho */}
                    <button 
                      onClick={() => addItemToCart(product.variants[0].id, 1)}
                      className="w-full sm:w-auto bg-flyfast-yellow text-flyfast-blue px-4 py-2 rounded-lg font-bold hover:bg-yellow-400 transition-colors flex items-center justify-center gap-2 text-sm shadow-sm hover:shadow"
                    >
                      <FaShoppingCart /> Adicionar
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal de Detalhes do Produto */}
      {selectedProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
          <div 
            className="absolute inset-0 bg-black bg-opacity-60 backdrop-blur-sm transition-opacity" 
            onClick={() => setSelectedProduct(null)}
          ></div>
          
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col md:flex-row relative z-10 animate-fade-in-up">
            <button 
              onClick={() => setSelectedProduct(null)}
              className="absolute top-4 right-4 z-20 bg-white/80 hover:bg-white text-gray-500 hover:text-gray-800 p-2 rounded-full transition-colors shadow-sm"
            >
              <FaTimes size={20} />
            </button>

            {/* Lado da Imagem */}
            <div className="w-full md:w-1/2 bg-gray-100 relative h-64 md:h-auto">
              {selectedProduct.images && selectedProduct.images.length > 0 ? (
                <div className="h-full flex flex-col">
                  <img 
                    src={selectedProduct.images[currentImageIndex].src} 
                    alt={selectedProduct.title} 
                    className="w-full flex-1 object-cover"
                  />
                  {/* Galeria de Miniaturas */}
                  {selectedProduct.images.length > 1 && (
                    <div className="flex gap-2 p-2 overflow-x-auto bg-white border-t">
                      {selectedProduct.images.map((img, idx) => (
                        <button key={img.id} onClick={() => setCurrentImageIndex(idx)} className={`w-16 h-16 flex-shrink-0 border-2 rounded overflow-hidden ${currentImageIndex === idx ? 'border-flyfast-blue' : 'border-transparent'}`}>
                          <img src={img.src} alt="" className="w-full h-full object-cover" />
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400">Sem imagem</div>
              )}
            </div>

            {/* Lado do Conteúdo */}
            <div className="w-full md:w-1/2 p-6 md:p-10 flex flex-col overflow-y-auto bg-white">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">{selectedProduct.title}</h2>
              
              <div className="flex items-center gap-4 mb-6 border-b border-gray-100 pb-4">
                <span className="text-3xl font-extrabold text-flyfast-blue">
                  {selectedVariant ? selectedVariant.price.amount : selectedProduct.variants[0].price.amount} {selectedVariant ? selectedVariant.price.currencyCode : selectedProduct.variants[0].price.currencyCode}
                </span>
                <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                  Em Stock
                </span>
              </div>

              {/* Seletor de Variantes */}
              {selectedProduct.variants.length > 1 && (
                <div className="mb-6">
                  <label className="block text-sm font-bold text-gray-700 mb-2">Opções:</label>
                  <select 
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-flyfast-blue outline-none bg-white"
                    value={selectedVariant?.id}
                    onChange={(e) => {
                      const variant = selectedProduct.variants.find(v => v.id === e.target.value);
                      setSelectedVariant(variant);
                      // Tenta encontrar a imagem associada à variante
                      if (variant.image) {
                        const imgIndex = selectedProduct.images.findIndex(img => img.id === variant.image.id);
                        if (imgIndex !== -1) setCurrentImageIndex(imgIndex);
                      }
                    }}
                  >
                    {selectedProduct.variants.map(variant => (
                      <option key={variant.id} value={variant.id}>
                        {variant.title}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="prose prose-blue text-gray-600 mb-8 flex-1 overflow-y-auto pr-2">
                <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-2">Descrição</h3>
                {selectedProduct.descriptionHtml ? (
                  <div 
                    className="whitespace-pre-line leading-relaxed text-base"
                    dangerouslySetInnerHTML={{ __html: selectedProduct.descriptionHtml }} 
                  />
                ) : (
                  <p className="whitespace-pre-line leading-relaxed text-base">
                    {selectedProduct.description || "Sem descrição disponível para este produto."}
                  </p>
                )}
              </div>

              <div className="mt-auto pt-6 border-t border-gray-100">
                <div className="flex items-center justify-between mb-4">
                  <span className="font-bold text-gray-700">Quantidade:</span>
                  <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden">
                    <button 
                      className="px-4 py-2 bg-gray-50 hover:bg-gray-100 text-gray-600 transition-colors disabled:opacity-50"
                      onClick={() => setQuantity(q => Math.max(1, q - 1))}
                      disabled={quantity <= 1}
                    >
                      <FaMinus size={12} />
                    </button>
                    <span className="px-4 py-2 font-bold text-gray-800 min-w-[3rem] text-center">{quantity}</span>
                    <button 
                      className="px-4 py-2 bg-gray-50 hover:bg-gray-100 text-gray-600 transition-colors"
                      onClick={() => setQuantity(q => q + 1)}
                    >
                      <FaPlus size={12} />
                    </button>
                  </div>
                </div>
                <button 
                  onClick={() => {
                    addItemToCart(selectedVariant ? selectedVariant.id : selectedProduct.variants[0].id, quantity);
                    setSelectedProduct(null);
                  }}
                  className="w-full bg-flyfast-yellow text-flyfast-blue py-4 rounded-xl font-bold text-lg hover:bg-yellow-400 transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-3 transform active:scale-[0.98]"
                >
                  <FaShoppingCart size={20} /> 
                  Adicionar ao Carrinho
                </button>
                <p className="text-center text-xs text-gray-400 mt-3 flex items-center justify-center gap-1">
                  <FaInfoCircle /> Envio seguro e rápido com a FLYFAST.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const Shop = () => {
  return (
    <ShopifyCartProvider>
      <ShopContent />
      <CartDrawer />
    </ShopifyCartProvider>
  );
};

export default Shop;