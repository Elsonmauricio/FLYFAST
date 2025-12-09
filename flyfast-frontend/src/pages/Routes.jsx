import React, { useState } from 'react';
import RouteCard from '../components/RouteCard';
import { UPCOMING_ROUTES } from '../utils/constants';

const Routes = () => {
  const [filter, setFilter] = useState('all');

  const routes = [
    ...UPCOMING_ROUTES,
    {
      id: 4,
      from: 'Lisboa',
      to: 'Luanda',
      date: '2025-01-18',
      time: '16:00',
      available: 5,
      status: 'Quase Esgotado'
    },
    {
      id: 5,
      from: 'Luanda',
      to: 'Lisboa',
      date: '2025-01-19',
      time: '11:00',
      available: 18,
      status: 'Disponível'
    },
    {
      id: 6,
      from: 'Lisboa',
      to: 'Luanda',
      date: '2025-01-20',
      time: '13:00',
      available: 3,
      status: 'Quase Esgotado'
    }
  ];

  const filteredRoutes = filter === 'all' 
    ? routes 
    : routes.filter(route => 
        filter === 'luanda-lisboa' 
          ? route.from === 'Luanda'
          : route.from === 'Lisboa'
      );

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
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
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
            
            <div className="flex space-x-4">
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
            </div>
          </div>

          {/* Routes Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredRoutes.map(route => (
              <RouteCard key={route.id} route={route} />
            ))}
          </div>

          {/* Empty State */}
          {filteredRoutes.length === 0 && (
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

        {/* Pricing Info */}
        <div className="card max-w-6xl mx-auto mb-12">
          <h2 className="text-2xl font-bold text-flyfast-blue mb-8 text-center">
            💰 Tabela de Preços
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-100">
                  <th className="p-4 text-left">Tipo de Envio</th>
                  <th className="p-4 text-left">Peso</th>
                  <th className="p-4 text-left">Luanda → Lisboa</th>
                  <th className="p-4 text-left">Lisboa → Luanda</th>
                  <th className="p-4 text-left">Tempo Estimado</th>
                </tr>
              </thead>
              <tbody>
                {[
                  {
                    type: 'Documentos',
                    weight: 'Até 1kg',
                    toLisbon: '15.000 AOA',
                    toLuanda: '35€',
                    time: '24-48h'
                  },
                  {
                    type: 'Pequeno',
                    weight: '1-5kg',
                    toLisbon: '35.000 AOA',
                    toLuanda: '75€',
                    time: '24-48h'
                  },
                  {
                    type: 'Médio',
                    weight: '5-15kg',
                    toLisbon: '65.000 AOA',
                    toLuanda: '140€',
                    time: '48-72h'
                  },
                  {
                    type: 'Grande',
                    weight: '15-30kg',
                    toLisbon: '120.000 AOA',
                    toLuanda: '250€',
                    time: '48-72h'
                  },
                  {
                    type: 'Extra',
                    weight: '30-50kg',
                    toLisbon: '200.000 AOA',
                    toLuanda: '400€',
                    time: '72-96h'
                  }
                ].map((row, index) => (
                  <tr key={index} className="border-b hover:bg-gray-50">
                    <td className="p-4 font-semibold">{row.type}</td>
                    <td className="p-4">{row.weight}</td>
                    <td className="p-4 text-flyfast-blue font-bold">{row.toLisbon}</td>
                    <td className="p-4 text-flyfast-blue font-bold">{row.toLuanda}</td>
                    <td className="p-4">{row.time}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-gray-600 text-sm mt-6 text-center">
            * Preços incluem seguro básico. Seguro completo disponível por +20%
          </p>
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
              },
              {
                question: 'E se meu envio atrasar?',
                answer: 'Garantimos reembolso parcial por atrasos superiores a 48h em relação ao previsto.'
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