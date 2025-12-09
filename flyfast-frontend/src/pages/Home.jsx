import React from 'react';
import { Link } from 'react-router-dom';
import ServiceCard from '../components/ServiceCard';
import RouteCard from '../components/RouteCard';
import { SERVICES, UPCOMING_ROUTES } from '../utils/constants';

const Home = () => {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-flyfast-yellow to-yellow-200 py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-flyfast-blue mb-6 font-heading">
            FLYFAST
          </h1>
          <p className="text-2xl md:text-3xl text-gray-800 mb-8">
            Conectando Luanda e Lisboa com <span className="font-bold">velocidade</span> e <span className="font-bold">confiança</span>
          </p>
          <p className="text-xl text-flyfast-blue font-bold mb-12">
            ✈️ VOE CONNOSCO!
          </p>
          
          <div className="flex flex-wrap justify-center gap-4 mb-12">
            <Link to="/tracking" className="btn-primary px-8 py-4 text-lg">
              🔍 Rastrear Envio
            </Link>
            <Link to="/shop" className="btn-secondary px-8 py-4 text-lg">
              🛍️ Visitar Loja
            </Link>
            <Link to="/personal-shopper" className="btn-primary px-8 py-4 text-lg">
              👔 Personal Shopper
            </Link>
            <Link to="/routes" className="btn-secondary px-8 py-4 text-lg">
              📦 Enviar Agora
            </Link>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-flyfast-blue mb-12">
            Nossos Serviços
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {SERVICES.map(service => (
              <ServiceCard key={service.id} service={service} />
            ))}
          </div>
        </div>
      </section>

      {/* Upcoming Routes */}
      <section className="py-20 bg-flyfast-light-yellow">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center mb-12">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-flyfast-blue">
                Próximas Rotas
              </h2>
              <p className="text-gray-600 mt-2">
                Reserve seu lugar nos próximos voos entre Angola e Portugal
              </p>
            </div>
            <Link 
              to="/routes" 
              className="mt-4 md:mt-0 text-flyfast-blue font-bold hover:text-blue-900"
            >
              Ver todas as rotas →
            </Link>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {UPCOMING_ROUTES.map(route => (
              <RouteCard key={route.id} route={route} />
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-flyfast-blue text-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-16">
            FLYFAST em Números
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-5xl font-bold text-flyfast-yellow mb-2">5K+</div>
              <p className="text-gray-300">Envios Realizados</p>
            </div>
            <div>
              <div className="text-5xl font-bold text-flyfast-yellow mb-2">99%</div>
              <p className="text-gray-300">Taxa de Sucesso</p>
            </div>
            <div>
              <div className="text-5xl font-bold text-flyfast-yellow mb-2">6h</div>
              <p className="text-gray-300">Tempo Médio</p>
            </div>
            <div>
              <div className="text-5xl font-bold text-flyfast-yellow mb-2">2K+</div>
              <p className="text-gray-300">Clientes Satisfeitos</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-flyfast-blue mb-6">
              Pronto para Voar Connosco?
            </h2>
            <p className="text-xl text-gray-600 mb-8">
              Junte-se a milhares de clientes que já confiam na FLYFAST para 
              conectar Angola e Portugal de forma rápida e segura.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link 
                to="/contact" 
                className="btn-primary px-8 py-4 text-lg"
              >
                📞 Falar Connosco
              </Link>
              <Link 
                to="/account" 
                className="btn-secondary px-8 py-4 text-lg"
              >
                👤 Criar Conta
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;