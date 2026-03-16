import React, { useEffect, useState } from 'react';
import client from '../lib/shopify';
import { ShopifyCartProvider, useShopifyCart } from '../contexts/ShopifyCartContext';
import CartDrawer from '../components/CartDrawer';
import { FaShoppingCart, FaExclamationTriangle, FaTimes, FaMinus, FaPlus, FaSearch } from 'react-icons/fa';

// --- Configurações de Internacionalização ---
const TRANSLATIONS = {
  pt: {
    search: "Pesquisar",
    heroTitle: "Novas Coleções",
    heroText: "Descubra as últimas tendências globais. Enviamos para todo o mundo com qualidade e rapidez.",
    buyNow: "Comprar Agora",
    home: "Início",
    catalog: "Catálogo",
    soldOut: "Esgotado",
    unavailable: "Indisponível",
    addToCart: "Adicionar ao carrinho",
    quantity: "Quantidade",
    errorTitle: "Erro de Conexão",
    errorText: "Verifique o seu Storefront Access Token.",
    inStock: "Em Stock",
    seeMore: "Ver Mais"
  },
  en: {
    search: "Search",
    heroTitle: "New Collections",
    heroText: "Discover the latest global trends. We ship worldwide with quality and speed.",
    buyNow: "Shop Now",
    home: "Home",
    catalog: "Catalog",
    soldOut: "Sold Out",
    unavailable: "Unavailable",
    addToCart: "Add to Cart",
    quantity: "Quantity",
    errorTitle: "Connection Error",
    errorText: "Check your Storefront Access Token.",
    inStock: "In Stock",
    seeMore: "See More"
  },
  es: {
    search: "Buscar",
    heroTitle: "Nuevas Colecciones",
    heroText: "Descubre las últimas tendencias globales. Enviamos a todo el mundo con calidad y rapidez.",
    buyNow: "Comprar Ahora",
    home: "Inicio",
    catalog: "Catálogo",
    soldOut: "Agotado",
    unavailable: "No disponible",
    addToCart: "Añadir al carrito",
    quantity: "Cantidad",
    errorTitle: "Error de Conexión",
    errorText: "Verifique su Token de Acceso.",
    inStock: "En Stock",
    seeMore: "Ver Más"
  },
  fr: {
    search: "Rechercher",
    heroTitle: "Nouvelles Collections",
    heroText: "Découvrez les dernières tendances mondiales. Nous expédions dans le monde entier avec qualité et rapidité.",
    buyNow: "Acheter Maintenant",
    home: "Accueil",
    catalog: "Catalogue",
    soldOut: "Épuisé",
    unavailable: "Indisponible",
    addToCart: "Ajouter au panier",
    quantity: "Quantité",
    errorTitle: "Erreur de Connexion",
    errorText: "Vérifiez votre jeton d'accès.",
    inStock: "En Stock",
    seeMore: "Voir Plus"
  }
};

// Lista extensa de idiomas
const ALL_LANGUAGES = [
  { code: 'pt', name: 'Português' },
  { code: 'en', name: 'English' },
  { code: 'es', name: 'Español' },
  { code: 'fr', name: 'Français' }
];

const ShopContent = () => {
  /* O código da loja está comentado para evitar chamadas à API enquanto a loja está inativa */
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
  const [gridSelections, setGridSelections] = useState({});
  const [viewMode, setViewMode] = useState('home'); // 'home', 'catalog', 'collection'
  const [visibleCount, setVisibleCount] = useState(8);
  
  // Estados de Internacionalização
  const [language, setLanguage] = useState('pt');

  const { addItemToCart, setIsCartOpen, checkout } = useShopifyCart();

  // Helper de Tradução
  const t = (key) => {
    // Tenta encontrar a tradução no idioma selecionado, senão usa Português como fallback
    const dict = TRANSLATIONS[language] || TRANSLATIONS['pt'];
    return dict[key] || TRANSLATIONS['pt'][key] || key;
  };

  useEffect(() => {
    client.collection.fetchAll().then((fetchedCollections) => {
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
      setProducts(fetchedProducts);
      setLoading(false);
    }).catch((err) => {
      setError(err);
      setLoading(false);
    });
  }, [selectedCollectionId]);

  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center bg-white">
        <div className="w-8 h-8 border-2 border-gray-200 border-t-black rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col justify-center items-center bg-white p-4">
        <FaExclamationTriangle className="text-2xl text-gray-400 mb-4" />
        <h2 className="text-xl font-light uppercase tracking-widest">{t('errorTitle')}</h2>
        <p className="text-gray-500 mt-2">{t('errorText')}</p>
      </div>
    );
  }

  // Função para alterar a variante selecionada no cartão
  const handleGridOptionChange = (productId, optionName, optionValue) => {
    const product = products.find(p => p.id === productId);
    if (!product) return;

    const currentVariant = gridSelections[productId] || product.variants[0];
    
    // Encontra a nova variante mantendo as outras opções (ex: mantém o tamanho M, muda só a cor)
    const newVariant = product.variants.find(v => 
      v.selectedOptions.every(opt => 
        opt.name === optionName ? opt.value === optionValue : 
        opt.value === currentVariant.selectedOptions.find(o => o.name === opt.name)?.value
      )
    );

    if (newVariant) {
      setGridSelections(prev => ({ ...prev, [productId]: newVariant }));
    }
  };

  const filteredProducts = products.filter(p => p.title.toLowerCase().includes(searchQuery.toLowerCase()));
  
  // Lógica de Agrupamento para o Catálogo
  const productsByType = filteredProducts.reduce((acc, product) => {
    const type = product.productType || 'Outros';
    if (!acc[type]) acc[type] = [];
    acc[type].push(product);
    return acc;
  }, {});
  
  const productTypes = Object.keys(productsByType).sort();

  // Helper para renderizar o cartão do produto
  const renderProductCard = (product) => {
    const variant = gridSelections[product.id] || product.variants[0];
    const isSoldOut = (variant && typeof variant.available !== 'undefined') ? !variant.available : !product.availableForSale;
    
    return (
      <div key={product.id} className="group flex flex-col h-full">
        <div 
          className="relative w-full aspect-square bg-[#f5f5f5] overflow-hidden cursor-pointer rounded-xl md:rounded-2xl mb-3 md:mb-4"
          onClick={() => { 
            setSelectedProduct(product); 
            setSelectedVariant(variant);
            setCurrentImageIndex(0);
            setQuantity(1);
          }}
        >
          <img 
            src={variant.image?.src || product.images[0]?.src} 
            alt={product.title} 
            className={`w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 ${isSoldOut ? 'opacity-50' : ''}`}
          />
          {isSoldOut && (
            <span className="absolute bottom-2 left-2 bg-white/90 backdrop-blur-sm text-[10px] font-bold px-2 py-1 rounded-md shadow-sm uppercase tracking-wide">{t('soldOut')}</span>
          )}
        </div>

        <div className="flex flex-col flex-grow">
            {product.vendor && (
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">{product.vendor}</p>
            )}
            <h2 
                className="text-sm md:text-base font-serif font-medium text-gray-900 mb-1 cursor-pointer hover:underline decoration-1 underline-offset-2 line-clamp-1"
                onClick={() => { 
                    setSelectedProduct(product); 
                    setSelectedVariant(variant);
                    setCurrentImageIndex(0);
                    setQuantity(1);
                }}
            >
            {product.title}
            </h2>
            
            <div className="mb-3 flex flex-col gap-2 mt-1">
              {product.productType && (
                <div className="text-[10px] font-medium text-gray-500 bg-gray-50 px-2 py-0.5 rounded w-fit">{product.productType}</div>
              )}
              
              {product.options && product.options.map(opt => {
                if (opt.name === 'Title') return null;
                return (
                  <div key={opt.id || opt.name} className="flex flex-col gap-1">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">{opt.name}</span>
                    <div className="flex flex-wrap gap-1.5">
                      {opt.values.map(val => {
                        const isSelected = variant.selectedOptions.some(o => o.name === opt.name && o.value === val.value);
                        return (
                          <button 
                            key={val.value} 
                            onClick={(e) => {
                              e.stopPropagation();
                              handleGridOptionChange(product.id, opt.name, val.value);
                            }}
                            className={`inline-flex items-center px-2 py-1 rounded-md text-[10px] font-medium border shadow-sm transition-all ${
                              isSelected 
                                ? 'bg-gray-900 text-white border-gray-900' 
                                : 'bg-white text-gray-700 border-gray-200 hover:border-gray-300'
                            }`}
                          >
                            {val.value}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>

            <p className="text-xs md:text-sm text-gray-600 mb-2 md:mb-3">
            {variant.price.amount} {variant.price.currencyCode}
            </p>

            <button 
            onClick={() => addItemToCart(variant.id, 1)}
            disabled={isSoldOut}
            className={`w-full py-2 md:py-2.5 rounded-lg md:rounded-xl font-medium text-xs md:text-sm transition-all border mt-auto ${
                isSoldOut 
                ? 'bg-gray-50 text-gray-400 border-gray-100 cursor-not-allowed' 
                : 'bg-white text-black border-gray-300 hover:border-black hover:bg-black hover:text-white'
            }`}
            >
            {isSoldOut ? t('unavailable') : t('addToCart')}
            </button>
        </div>
      </div>
    );
  };

  // Encontrar o produto para o Hero (Destaque)
  const heroProduct = products.find(p => p.title.includes("Sniff Tote Bag - XXL"));

  return (
    <div className="min-h-screen bg-white font-sans text-gray-900 pb-20">
      
      {/* 2. Cabeçalho Funcional */}
      <header className="container mx-auto px-4 py-4 md:py-6 flex flex-col md:flex-row justify-between items-center gap-4 border-b border-transparent">
        <div className="flex items-center gap-2 md:gap-4 order-2 md:order-1 w-full md:w-auto justify-center md:justify-start">
           <select 
             value={language}
             onChange={(e) => setLanguage(e.target.value)}
             className="bg-transparent text-xs md:text-sm border-none outline-none cursor-pointer text-gray-600 hover:text-black hover:bg-gray-50 px-2 py-1 rounded-lg transition-colors"
           >
             {ALL_LANGUAGES.map(lang => (
               <option key={lang.code} value={lang.code}>{lang.name}</option>
             ))}
           </select>
        </div>

        <h1 className="text-2xl md:text-3xl font-serif font-medium text-gray-900 order-1 md:order-2">FLYFAST-MARKET</h1>

        <div className="flex items-center gap-4 order-3">
           <div className="relative">
             <input
               type="text"
               placeholder={t('search')}
               value={searchQuery}
               onChange={(e) => setSearchQuery(e.target.value)}
               className="bg-gray-100 rounded-full py-2 px-4 pl-4 pr-8 text-xs md:text-sm focus:ring-1 focus:ring-black outline-none w-32 focus:w-40 md:focus:w-48 transition-all placeholder-gray-500"
             />
             <FaSearch className="absolute right-3 top-2.5 text-gray-400 text-xs" />
           </div>
           <button onClick={() => setIsCartOpen(true)} className="relative p-2">
             <FaShoppingCart size={20} className="text-gray-700 hover:text-black transition" />
             {checkout?.lineItems?.length > 0 && (
               <span className="absolute top-0 right-0 bg-black text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                 {checkout.lineItems.length}
               </span>
             )}
           </button>
        </div>
      </header>

      {/* 3. Hero Section (Bloco de texto colorido sobre imagem) */}
      {viewMode !== 'catalog' && (
      <div className="container mx-auto px-4 my-8">
        <div className="relative w-full h-[350px] md:h-[500px] rounded-2xl md:rounded-3xl overflow-hidden bg-gray-100 shadow-sm">
           {heroProduct ? (
             <img 
               src={heroProduct.images[0]?.src} 
               alt="Hero" 
               className="w-full h-full object-contain object-right p-6 mix-blend-multiply"
             />
           ) : (
             <div className="w-full h-full bg-gray-200"></div>
           )}
           <div className="absolute bottom-4 left-4 right-4 md:right-auto md:bottom-12 md:left-12 bg-[#F3E5F5]/95 backdrop-blur-sm p-6 md:p-10 rounded-xl md:rounded-2xl max-w-md shadow-sm">
             <h2 className="text-xl md:text-3xl font-serif font-medium mb-2 md:mb-3 text-gray-900">
               {t('heroTitle')}
             </h2>
             <p className="text-gray-700 mb-4 md:mb-5 leading-relaxed text-xs md:text-base">
               {t('heroText')}
             </p>
             <button 
               onClick={() => { setViewMode('catalog'); setSelectedCollectionId(''); }}
               className="bg-black text-white px-5 py-2.5 md:px-6 md:py-3 rounded-lg md:rounded-xl font-medium hover:bg-gray-800 transition text-xs md:text-sm w-full md:w-auto"
             >
               {t('buyNow')}
             </button>
           </div>
        </div>
      </div>
      )}

      <div className="container mx-auto px-4 py-8">
        {/* Filtros */}
        <div className="flex flex-wrap justify-center gap-2 md:gap-3 mb-8 md:mb-12">
            {/* Botão Início */}
            <button
              onClick={() => { setViewMode('home'); setSelectedCollectionId(''); setVisibleCount(8); }}
              className={`px-4 py-1.5 md:px-5 md:py-2 rounded-full text-xs md:text-sm font-medium transition-all border ${viewMode === 'home' ? 'bg-black text-white border-black' : 'bg-white text-gray-600 border-gray-200 hover:border-gray-400'}`}
            >
              {t('home')}
            </button>

            {/* Botão Catálogo */}
            <button
              onClick={() => { setViewMode('catalog'); setSelectedCollectionId(''); }}
              className={`px-4 py-1.5 md:px-5 md:py-2 rounded-full text-xs md:text-sm font-medium transition-all border ${viewMode === 'catalog' ? 'bg-black text-white border-black' : 'bg-white text-gray-600 border-gray-200 hover:border-gray-400'}`}
            >
              {t('catalog')}
            </button>

            {collections.map(col => (
              <button
                key={col.id}
                onClick={() => { setViewMode('collection'); setSelectedCollectionId(col.id); }}
                className={`px-4 py-1.5 md:px-5 md:py-2 rounded-full text-xs md:text-sm font-medium transition-all border ${selectedCollectionId === col.id ? 'bg-black text-white border-black' : 'bg-white text-gray-600 border-gray-200 hover:border-gray-400'}`}
              >
                {col.title}
              </button>
            ))}
        </div>

        {/* Grelha de Produtos ou Catálogo por Tipo */}
        {(viewMode === 'catalog' && !searchQuery) ? (
          // Modo Catálogo (Agrupado por Tipo)
          <div className="space-y-16">
            {productTypes.map(type => (
              <div key={type}>
                <h2 className="text-2xl font-serif font-medium text-gray-900 mb-6 border-b border-gray-100 pb-4">{type}</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-3 gap-y-8 md:gap-x-6 md:gap-y-10">
                  {productsByType[type].map(product => renderProductCard(product))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          // Modo Filtro/Busca (Flat Grid)
          <>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-3 gap-y-8 md:gap-x-6 md:gap-y-10">
              {(viewMode === 'home' && !searchQuery ? filteredProducts.slice(0, visibleCount) : filteredProducts).map(product => renderProductCard(product))}
            </div>
            {viewMode === 'home' && !searchQuery && visibleCount < filteredProducts.length && (
              <div className="flex justify-center mt-12">
                <button 
                  onClick={() => setVisibleCount(prev => prev + 8)}
                  className="px-8 py-3 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-full font-medium transition-colors"
                >
                  {t('seeMore')}
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Modal Quick View (Atualizado para rounded-3xl e font-serif) */}
      {selectedProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setSelectedProduct(null)}></div>
          
          <div className="bg-white w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col md:flex-row relative shadow-2xl rounded-3xl animate-fade-in-up">
            <button onClick={() => setSelectedProduct(null)} className="absolute top-4 right-4 z-30 p-2 bg-white/80 rounded-full hover:bg-white transition text-gray-600 hover:text-black">
              <FaTimes size={20} />
            </button>

            {/* Galeria à Esquerda */}
            <div className="w-full md:w-1/2 bg-[#f5f5f5] flex flex-col p-6 gap-4">
              <div className="flex-1 flex items-center justify-center relative overflow-hidden">
                <img 
                  src={selectedProduct.images[currentImageIndex]?.src} 
                  className="w-full h-full object-contain mix-blend-multiply max-h-[50vh]"
                  alt={selectedProduct.title}
                />
              </div>
              {selectedProduct.images.length > 1 && (
                <div className="flex gap-2 overflow-x-auto pb-2 justify-center px-4">
                  {selectedProduct.images.map((img, i) => (
                    <button 
                        key={i} 
                        onClick={() => setCurrentImageIndex(i)}
                        className={`w-16 h-16 flex-shrink-0 rounded-lg border-2 overflow-hidden transition-all ${currentImageIndex === i ? 'border-black' : 'border-transparent hover:border-gray-300'}`}
                    >
                      <img src={img.src} className="w-full h-full object-cover" alt={`Thumbnail ${i}`} />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Info à Direita */}
            <div className="w-full md:w-1/2 p-8 md:p-12 overflow-y-auto flex flex-col">
              <h2 className="text-3xl font-serif font-medium mb-2 text-gray-900">{selectedProduct.title}</h2>
              <p className="text-2xl text-gray-600 mb-6 font-light">
                {selectedVariant?.price.amount || selectedProduct.variants[0].price.amount} {selectedProduct.variants[0].price.currencyCode}
              </p>

              {/* Seletor de Variantes no Modal */}
              {selectedProduct.options && selectedProduct.options.map(opt => {
                if (opt.name === 'Title') return null;
                return (
                  <div key={opt.id || opt.name} className="mb-6">
                    <span className="text-sm font-bold text-gray-900 uppercase tracking-wide block mb-3">{opt.name}</span>
                    <div className="flex flex-wrap gap-2">
                      {opt.values.map(val => {
                        const isSelected = selectedVariant?.selectedOptions.some(o => o.name === opt.name && o.value === val.value);
                        return (
                          <button
                            key={val.value}
                            onClick={() => {
                                const newVariant = selectedProduct.variants.find(v => 
                                    v.selectedOptions.every(o => 
                                        o.name === opt.name ? o.value === val.value : 
                                        o.value === selectedVariant.selectedOptions.find(so => so.name === o.name)?.value
                                    )
                                );
                                if (newVariant) {
                                    setSelectedVariant(newVariant);
                                    if (newVariant.image) {
                                        const imgIndex = selectedProduct.images.findIndex(img => img.id === newVariant.image.id);
                                        if (imgIndex !== -1) setCurrentImageIndex(imgIndex);
                                    }
                                }
                            }}
                            className={`px-4 py-2 rounded-xl text-sm font-medium border transition-all ${
                              isSelected 
                                ? 'bg-black text-white border-black shadow-md' 
                                : 'bg-white text-gray-700 border-gray-200 hover:border-gray-400 hover:bg-gray-50'
                            }`}
                          >
                            {val.value}
                          </button>
                        )
                      })}
                    </div>
                  </div>
                );
              })}

              <div className="space-y-6 mb-8 flex-1">
                <div className="text-sm leading-relaxed text-gray-600 prose prose-sm max-w-none [&_table]:w-full [&_table]:border-collapse [&_table]:mb-4 [&_th]:border [&_th]:border-gray-200 [&_th]:p-2 [&_th]:bg-gray-50 [&_th]:text-left [&_td]:border [&_td]:border-gray-200 [&_td]:p-2" 
                     dangerouslySetInnerHTML={{ __html: selectedProduct.descriptionHtml || selectedProduct.description }}>
                </div>
              </div>

              <div className="space-y-4 mt-auto pt-6 border-t border-gray-100">
                <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">{t('quantity')}</span>
                    <div className="flex items-center border border-gray-300 rounded-lg">
                    <button className="p-3 hover:bg-gray-50 text-gray-600" onClick={() => setQuantity(q => Math.max(1, q - 1))}><FaMinus size={10}/></button>
                    <span className="px-4 text-sm font-medium">{quantity}</span>
                    <button className="p-3 hover:bg-gray-50 text-gray-600" onClick={() => setQuantity(q => q + 1)}><FaPlus size={10}/></button>
                    </div>
                </div>

                <button 
                  onClick={() => {
                    addItemToCart(selectedVariant?.id || selectedProduct.variants[0].id, quantity);
                    setSelectedProduct(null);
                    setIsCartOpen(true);
                  }}
                  className="w-full bg-black text-white py-4 rounded-xl font-medium hover:bg-gray-800 transition-colors shadow-lg"
                >
                  {t('addToCart')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const Shop = () => {
  // Defina para 'true' para ativar o modo manutenção e evitar erros da API da Shopify.
  // Defina para 'false' quando a loja Shopify estiver ativa.
  const isMaintenanceMode = false;

  if (isMaintenanceMode) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4 text-center">
        <FaExclamationTriangle className="text-6xl text-yellow-500 mb-6" />
        <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">Loja em Manutenção</h1>
        <p className="text-lg text-gray-600 max-w-md mx-auto mb-8">
          Estamos a realizar melhorias na nossa loja online para lhe oferecer uma experiência ainda melhor.<br/>
          Por favor, volte mais tarde.
        </p>
        <a 
          href="/"
          className="bg-blue-900 text-white px-8 py-3 rounded-full font-bold hover:bg-blue-800 transition-colors"
        >
          Voltar ao Início
        </a>
      </div>
    );
  }

  return (
    <ShopifyCartProvider>
      <ShopContent />
      <CartDrawer />
    </ShopifyCartProvider>
  );
};

export default Shop;