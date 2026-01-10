import React, { useState, useEffect } from 'react';
import RouteCard from '../components/RouteCard';
import BookingModal from '../components/BookingModal';
import { FaSpinner, FaExclamationCircle } from 'react-icons/fa';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const Routes = () => {
  const { authState } = useAuth();
  const navigate = useNavigate();
  const [filter, setFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('');
  const [routes, setRoutes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Estado para Tabela de Preços Dinâmica
  const [pricing, setPricing] = useState({
    pricePerKg: 12.99,
    specificArticles: [
      { article: 'Perfumes/Duplos', price: '7€ | 10€ KG', tax: '35% da fatura' },
      { article: 'Cartões Visa', price: '15 €', tax: '-' },
      { article: 'Documentos', price: '15 €', tax: '-' },
      { article: 'Telemóveis', price: '20 €', tax: '23% da fatura' },
      { article: 'Computadores', price: '35 €', tax: '23% da fatura' },
      { article: 'Artigos de Ouro', price: '15 €', tax: '-' },
      { article: 'Playstation 4/5', price: '45 €', tax: '23% da fatura' }
    ],
    weightArticles: [
      { article: 'Roupas', tax: '23% da fatura' },
      { article: 'Calçados', tax: '23% da fatura' },
      { article: 'Cosméticos', tax: '35% da fatura' },
      { article: 'TV\'s', tax: '23% da fatura' },
      { article: 'Eletrodomésticos', tax: '23% da fatura' },
      { article: 'Máquinas Pesadas', tax: '23% da fatura' }
    ]
  });

  // Buscar preços ao carregar
  useEffect(() => {
    const fetchPricing = async () => {
      try {
        // Nota: Certifica-te que crias esta rota pública no backend
        const response = await fetch('/api/pricing'); 
        if (response.ok) {
          const data = await response.json();
          setPricing(data);
        }
      } catch (err) {
        console.error('Erro ao carregar preços:', err);
      }
    };
    fetchPricing();
  }, []);

  // Estados para o Modal de Reserva
  const [selectedRoute, setSelectedRoute] = useState(null);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [isBookingLoading, setIsBookingLoading] = useState(false);

  useEffect(() => {
    const fetchRoutes = async () => {
      try {
        const response = await fetch('/api/schedules');
        if (!response.ok) {
          throw new Error('Falha ao carregar as rotas.');
        }
        const data = await response.json();
        setRoutes(data);
      } catch (err) {
        console.error(err);
        setError('Não foi possível carregar as rotas em tempo real.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchRoutes();
  }, []);

  const handleOpenBooking = (route) => {
    if (!authState.isAuthenticated) {
      // Se não estiver logado, redireciona para login
      navigate('/login', { state: { from: '/routes' } });
      return;
    }
    setSelectedRoute(route);
    setIsBookingModalOpen(true);
  };

  const handleBookingSubmit = async (bookingData) => {
    setIsBookingLoading(true);
    try {
      const response = await fetch('/api/shipments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authState.token}`
        },
        body: JSON.stringify(bookingData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erro ao criar reserva');
      }

      alert('Reserva efetuada com sucesso! Verifique o seu email.');
      setIsBookingModalOpen(false);
      // Recarregar rotas para atualizar a capacidade disponível
      window.location.reload(); 
    } catch (err) {
      alert(err.message);
    } finally {
      setIsBookingLoading(false);
    }
  };

  const filteredRoutes = routes.filter(route => {
    const routeFilterMatch = filter === 'all' ||
        (filter === 'luanda-lisboa' ? route.from === 'Luanda' : route.from === 'Lisboa');

    const dateFilterMatch = !dateFilter || route.date === dateFilter;

    return routeFilterMatch && dateFilterMatch;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-flyfast-blue to-blue-800 text-white py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              ✈️ Rotas e Envios
            </h1>
            <p className="text-xl max-w-3xl mx-auto">
              Encontre as próximas rotas disponíveis entre Luanda e Lisboa e reserve seu envio
            </p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 max-w-4xl mx-auto">
            <div className="bg-white/20 backdrop-blur-sm rounded-lg p-6 text-center">
              <div className="text-3xl font-bold mb-2">6-8h</div>
              <p className="text-sm">Tempo de Voo</p>
            </div>
            <div className="bg-white/20 backdrop-blur-sm rounded-lg p-6 text-center">
              <div className="text-3xl font-bold mb-2">2x</div>
              <p className="text-sm">Voo Direto/Dia</p>
            </div>
            <div className="bg-white/20 backdrop-blur-sm rounded-lg p-6 text-center">
              <div className="text-3xl font-bold mb-2">50kg</div>
              <p className="text-sm">Peso Máximo</p>
            </div>
            <div className="bg-white/20 backdrop-blur-sm rounded-lg p-6 text-center">
              <div className="text-3xl font-bold mb-2">24/7</div>
              <p className="text-sm">Suporte</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-12">
        {/* Filters */}
        <div className="mb-12">
          <div className="flex flex-col md:flex-row justify-between items-center mb-8">
            <h2 className="text-3xl font-bold text-flyfast-blue mb-4 md:mb-0">
              Próximas Partidas
            </h2>
            
            <div className="flex flex-wrap gap-4 items-center justify-center md:justify-end w-full md:w-auto">
              <button
                onClick={() => setFilter('all')}
                className={`px-6 py-2 rounded-lg font-semibold ${
                  filter === 'all'
                    ? 'bg-flyfast-blue text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                Todas as Rotas
              </button>
              <button
                onClick={() => setFilter('luanda-lisboa')}
                className={`px-6 py-2 rounded-lg font-semibold ${
                  filter === 'luanda-lisboa'
                    ? 'bg-flyfast-blue text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                Luanda → Lisboa
              </button>
              <button
                onClick={() => setFilter('lisboa-luanda')}
                className={`px-6 py-2 rounded-lg font-semibold ${
                  filter === 'lisboa-luanda'
                    ? 'bg-flyfast-blue text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                Lisboa → Luanda
              </button>
              <input 
                type="date"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="px-4 py-2 rounded-lg bg-gray-200 text-gray-700 font-semibold focus:outline-none focus:ring-2 focus:ring-flyfast-blue w-full sm:w-auto"
                aria-label="Filtrar por data"
              />
            </div>
          </div>

          {/* Loading State */}
          {isLoading && (
            <div className="flex justify-center items-center py-20">
              <FaSpinner className="animate-spin text-4xl text-flyfast-blue" />
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="alert alert-error mb-8">
              <FaExclamationCircle />
              <span>{error}</span>
            </div>
          )}

          {/* Routes Grid */}
          {!isLoading && !error && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-8">
              {filteredRoutes.map(route => {
                // Sanitização e proteção visual: Garante que a barra nunca ultrapassa 100%
                const rawCapacity = parseInt(String(route.capacity).replace(/[^0-9]/g, '')) || 0;
                const rawAvailable = parseInt(String(route.available).replace(/[^0-9]/g, '')) || 0;
                const capacity = rawCapacity > 0 ? rawCapacity : 50; // Evita divisão por zero
                const available = rawAvailable > capacity ? capacity : rawAvailable; // Clampa o valor

                return (
                  <div key={route.id} className="relative w-full overflow-hidden rounded-xl shadow-sm hover:shadow-md transition-all bg-white">
                    <RouteCard 
                      route={{
                        ...route,
                        capacity,
                        available
                      }} 
                      onBook={handleOpenBooking}
                    />
                  </div>
                );
              })}
            </div>
          )}

          {/* Empty State */}
          {!isLoading && !error && filteredRoutes.length === 0 && (
            <div className="text-center py-16">
              <div className="text-6xl mb-6">✈️</div>
              <h3 className="text-2xl font-bold text-gray-700 mb-4">
                Nenhuma rota disponível
              </h3>
              <p className="text-gray-600">
                Não há rotas disponíveis para o filtro selecionado
              </p>
            </div>
          )}
        </div>

        {/* Modal de Reserva */}
        <BookingModal 
          isOpen={isBookingModalOpen}
          onClose={() => setIsBookingModalOpen(false)}
          route={selectedRoute}
          onSubmit={handleBookingSubmit}
          isLoading={isBookingLoading}
        />

{/* Pricing Info */}
<div className="card max-w-6xl mx-auto mb-12">
  <h2 className="text-2xl font-bold text-flyfast-blue mb-8 text-center">
    💰 Tabela de Preços
  </h2>
  
  <div className="mb-6 text-center">
    <p className="text-lg font-semibold text-flyfast-blue">
      Preço base: <span className="text-2xl">
        {/* Tenta formatar se for número, senão mostra como está */}
        {typeof pricing.pricePerKg === 'number' ? `${pricing.pricePerKg}€` : pricing.pricePerKg} POR KG
      </span>
    </p>
    <p className="text-sm text-gray-600 mt-1">
      FLYFAST - PRESTAÇÃO DE SERVIÇOS, LDA
    </p>
  </div>

  <div className="overflow-x-auto mb-8">
    <h3 className="text-xl font-bold mb-4 text-center">📦 Artigos Específicos</h3>
    <table className="w-full">
      <thead>
        <tr className="bg-gray-100">
          <th className="p-4 text-left">Artigo</th>
          <th className="p-4 text-left">Preço Fixo</th>
          <th className="p-4 text-left">Taxa de Fatura (%)</th>
        </tr>
      </thead>
      <tbody>
        {pricing.specificArticles.map((row, index) => (
          <tr key={index} className="border-b hover:bg-gray-50">
            <td className="p-4 font-semibold">{row.article}</td>
            <td className="p-4 text-flyfast-blue font-bold">{row.price}</td>
            <td className="p-4">{row.tax}</td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>

  <div className="overflow-x-auto">
    <h3 className="text-xl font-bold mb-4 text-center">👕 Artigos por Peso ({pricing.pricePerKg}€/kg)</h3>
    <table className="w-full">
      <thead>
        <tr className="bg-gray-100">
          <th className="p-4 text-left">Artigo</th>
          <th className="p-4 text-left">Taxa de Fatura (%)</th>
        </tr>
      </thead>
      <tbody>
        {pricing.weightArticles.map((row, index) => (
          <tr key={index} className="border-b hover:bg-gray-50">
            <td className="p-4 font-semibold">{row.article}</td>
            <td className="p-4">{row.tax}</td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>

  <div className="mt-8 p-4 bg-yellow-50 border-l-4 border-yellow-500 rounded">
    <h4 className="font-bold text-lg mb-2">⚠️ AVISO IMPORTANTE:</h4>
    <p className="text-gray-700">
      Todos os artigos de grande porte devem ser consultados com base na sua medida e peso.
    </p>
  </div>

  <div className="mt-6 text-center">
    <p className="text-gray-600 mb-4">
      Para consultas específicas ou artigos não listados, entre em contacto:
    </p>
    <p className="text-xl font-bold text-flyfast-blue">
      📞 +244 948 787 653
    </p>
    <p className="text-gray-600 mt-2">
      🌐 flyfast.0
    </p>
  </div>
</div>

        {/* FAQ */}
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-flyfast-blue mb-8 text-center">
            ❓ Perguntas Frequentes sobre Envios
          </h2>
          <div className="space-y-4">
            {[
              {
                question: 'Quais documentos preciso para enviar?',
                answer: 'Basta um documento de identificação válido (BI, Passaporte ou Cartão de Cidadão).'
              },
              {
                question: 'Posso enviar itens frágeis ou de valor?',
                answer: 'Sim, oferecemos embalagem especializada e seguro adicional para itens de valor.'
              },
              {
                question: 'Como funciona o processo de entrega?',
                answer: 'Pode escolher entre entrega em mãos ou recolha num dos nossos centros.'
              }
            ].map((faq, index) => (
              <div key={index} className="card">
                <h3 className="font-bold text-lg mb-2">{faq.question}</h3>
                <p className="text-gray-600">{faq.answer}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Routes;