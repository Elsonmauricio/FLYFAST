import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import ServiceCard from '../components/ServiceCard';
import RouteCard from '../components/RouteCard';
import { SERVICES } from '../utils/constants';
import { FaSpinner, FaArrowRight, FaCheckCircle, FaRocket, FaShieldAlt, FaClock, FaGlobe, FaPlay, FaPause } from 'react-icons/fa';
// Importar o vídeo e imagem dos assets
import heroVideo from '../assets/3678391-hd_1920_1080_30fps.mp4';
import experienceImage from '../assets/pexels-davidmcbee-115491.jpg';

const Home = () => {
  const navigate = useNavigate();
  const [routes, setRoutes] = useState([]);
  const [isLoadingRoutes, setIsLoadingRoutes] = useState(true);
  const [isVideoPlaying, setIsVideoPlaying] = useState(true); // Estado para controle do vídeo (opcional)

  useEffect(() => {
    const fetchRoutes = async () => {
      try {
        const response = await fetch(`/api/schedules?limit=3&_t=${new Date().getTime()}`);
        if (response.ok) {
          const data = await response.json();
          const routesList = data.schedules || data;
          setRoutes(Array.isArray(routesList) ? routesList.slice(0, 3) : []);
        }
      } catch (error) {
        console.error('Erro ao carregar rotas:', error);
      } finally {
        setIsLoadingRoutes(false);
      }
    };

    fetchRoutes();
  }, []);

  return (
    <div className="min-h-screen overflow-hidden">
      {/* Hero Section com Vídeo de Fundo - Inspirado no site de referência */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        {/* Vídeo de Fundo */}
        <div className="absolute inset-0 w-full h-full z-0">
          <video
            autoPlay
            loop
            muted
            playsInline
            className="w-full h-full object-cover"
            poster="/path-to-your-video-poster.jpg" // Imagem de fallback enquanto o vídeo carrega
          >
            <source src={heroVideo} type="video/mp4" />
            {/* Fallback para navegadores que não suportam vídeo */}
            <div className="absolute inset-0 bg-gradient-to-br from-flyfast-blue to-blue-900"></div>
          </video>
          
          {/* Overlay escuro para melhor contraste do texto - igual ao site de referência */}
          <div className="absolute inset-0 bg-black/50 z-10"></div>
        </div>


        {/* Conteúdo da Hero Section - Adaptado com a identidade da FLYFAST */}
        <div className="relative z-20 container mx-auto px-4 text-center text-white">
          <div className="max-w-5xl mx-auto">
            {/* Informações de contato no topo - inspirado no site de exemplo */}
            <div className="flex justify-end items-center space-x-6 mb-8 text-sm uppercase tracking-wider text-white/80">
              <div className="flex items-center space-x-2">
                <span className="text-flyfast-yellow font-bold"> FLYFAST</span>
                <span>|</span>
                <span>Luanda - Lisboa</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-flyfast-yellow">📞</span>
                <a href="tel:+244123456789" className="hover:text-flyfast-yellow transition-colors">
                  244 943 427 296
                </a>
              </div>
            </div>

            {/* Título principal */}
            <h1 className="text-5xl md:text-7xl font-black mb-6 leading-tight">
              Conectamos <span className="text-flyfast-yellow">Angola</span> e{' '}
              <span className="text-flyfast-yellow">Portugal</span>
            </h1>
            
            <p className="text-xl md:text-2xl mb-8 text-white/90 max-w-3xl mx-auto">
              Transporte rápido, seguro e confiável de cargas e encomendas entre Luanda e Lisboa
            </p>
            
            <p className="text-2xl md:text-3xl font-bold text-flyfast-yellow mb-12 animate-pulse">
               VOO DIRETO TODOS OS DIAS 
            </p>

            {/* Botões de ação - com estilo mais moderno como no exemplo */}
            <div className="flex flex-wrap justify-center gap-4">
              <Link 
                to="/tracking" 
                className="group bg-flyfast-yellow text-flyfast-blue px-8 py-4 rounded-full text-lg font-bold hover:bg-yellow-400 transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl flex items-center gap-2"
              >
                <span>🔍</span> Rastrear Envio
              </Link>
              <Link 
                to="/shop" 
                className="group bg-transparent border-2 border-white text-white px-8 py-4 rounded-full text-lg font-bold hover:bg-white hover:text-flyfast-blue transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl flex items-center gap-2"
              >
                <span>🛍️</span> Visitar Loja
              </Link>
              <Link 
                to="/routes" 
                className="group bg-flyfast-blue text-white px-8 py-4 rounded-full text-lg font-bold hover:bg-blue-900 transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl flex items-center gap-2"
              >
                <span>📦</span> Enviar Agora
                <FaArrowRight className="group-hover:translate-x-2 transition-transform" />
              </Link>
            </div>

            {/* Estatísticas rápidas - como no site de exemplo */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-16">
              <div>
                <div className="text-3xl font-black text-flyfast-yellow">3000K+</div>
                <p className="text-sm uppercase tracking-wider">Transportes</p>
              </div>
              <div>
                <div className="text-3xl font-black text-flyfast-yellow">1500+</div>
                <p className="text-sm uppercase tracking-wider">Frota</p>
              </div>
              <div>
                <div className="text-3xl font-black text-flyfast-yellow">8000+</div>
                <p className="text-sm uppercase tracking-wider">Clientes</p>
              </div>
              <div>
                <div className="text-3xl font-black text-flyfast-yellow">99%</div>
                <p className="text-sm uppercase tracking-wider">Satisfação</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section - mantendo seu conteúdo, mas com estilo mais clean */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-flyfast-blue font-bold text-sm uppercase tracking-widest">SERVIÇOS</span>
            <h2 className="text-4xl md:text-5xl font-black text-flyfast-blue mt-2 mb-6">
              Worldwide Shipping
            </h2>
            <div className="w-24 h-1 bg-flyfast-yellow mx-auto mb-6"></div>
            <p className="text-xl text-gray-600">
              Oferecemos soluções logísticas completas para todos os seus envios entre Angola e Portugal
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {SERVICES.map((service) => (
              <div key={service.id} className="group">
                <ServiceCard service={service} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Seção "Trusted Experience" - inspirada no site de exemplo */}
      <section className="py-24 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div>
              <span className="text-flyfast-blue font-bold text-sm uppercase tracking-widest">EXPERIÊNCIA</span>
              <h2 className="text-4xl md:text-5xl font-black text-flyfast-blue mt-2 mb-6">
                Confiança que <span className="text-flyfast-yellow">transporta</span>
              </h2>
              <p className="text-gray-600 text-lg mb-8">
                Nossa equipe tem vasta experiência em todos os aspectos da cadeia de suprimentos, 
                desde a coleta até a entrega final. Usamos tecnologia avançada para otimizar cada etapa, 
                garantindo que suas encomendas cheguem no prazo e dentro do orçamento.
              </p>
              
              <div className="grid grid-cols-3 gap-6">
                <div>
                  <div className="text-3xl font-black text-flyfast-yellow">3000K+</div>
                  <p className="text-sm text-gray-500">Transportes</p>
                </div>
                <div>
                  <div className="text-3xl font-black text-flyfast-yellow">1500+</div>
                  <p className="text-sm text-gray-500">Frota</p>
                </div>
                <div>
                  <div className="text-3xl font-black text-flyfast-yellow">8000+</div>
                  <p className="text-sm text-gray-500">Clientes</p>
                </div>
              </div>
            </div>
            
            <div className="relative">
              <img 
                src={experienceImage} 
                alt="Avião de carga da FLYFAST a ser carregado"
                className="rounded-2xl shadow-2xl"
              />
              <div className="absolute -bottom-6 -left-6 bg-flyfast-yellow p-6 rounded-2xl shadow-xl">
                <p className="text-flyfast-blue font-bold text-2xl">+2 anos</p>
                <p className="text-flyfast-blue">de experiência</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Upcoming Routes - mantendo seu conteúdo */}
      <section className="py-24 bg-gradient-to-br from-flyfast-light-yellow to-yellow-50">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center mb-16">
            <div>
              <span className="text-flyfast-blue font-bold text-sm uppercase tracking-widest">VOOS</span>
              <h2 className="text-4xl md:text-5xl font-black text-flyfast-blue mt-2">
                Próximas Rotas
              </h2>
            </div>
            <Link 
              to="/routes" 
              className="group mt-6 md:mt-0 bg-flyfast-blue text-white px-8 py-4 rounded-full font-bold hover:bg-blue-900 transition-all duration-300 flex items-center gap-2"
            >
              Ver todas
              <FaArrowRight className="group-hover:translate-x-2 transition-transform" />
            </Link>
          </div>

          {isLoadingRoutes ? (
            <div className="flex justify-center py-20">
              <FaSpinner className="animate-spin text-5xl text-flyfast-blue" />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {routes.length > 0 ? (
                routes.map((route) => {
                  const rawCapacity = parseInt(String(route.capacity).replace(/[^0-9]/g, '')) || 0;
                  const rawAvailable = parseInt(String(route.available).replace(/[^0-9]/g, '')) || 0;
                  const capacity = rawCapacity > 0 ? rawCapacity : 50;
                  const available = rawAvailable > capacity ? capacity : rawAvailable;

                  return (
                    <RouteCard 
                      key={route.id} 
                      route={{...route, capacity, available}} 
                      onBook={() => navigate('/routes')}
                    />
                  );
                })
              ) : (
                <div className="col-span-3 text-center py-20 bg-white rounded-2xl shadow-xl">
                  <div className="text-7xl mb-6"></div>
                  <h3 className="text-2xl font-bold text-gray-700 mb-3">Rotas Indisponíveis</h3>
                  <p className="text-gray-500">Não há voos agendados para os próximos dias.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      {/* CTA Section - Get a quote */}
      <section className="py-24 bg-gradient-to-r from-flyfast-yellow to-yellow-400">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-4xl md:text-5xl font-black text-flyfast-blue mb-6">
              Solicite um orçamento
            </h2>
            <p className="text-xl text-flyfast-blue/80 mb-8">
              Nossa equipe está pronta para atender você com a melhor solução para seu envio
            </p>
            <Link 
              to="/contact" 
              className="inline-block bg-flyfast-blue text-white px-12 py-5 rounded-full text-xl font-bold hover:bg-blue-900 transform hover:scale-105 transition-all duration-300 shadow-2xl"
            >
              Pedir Cotação
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;