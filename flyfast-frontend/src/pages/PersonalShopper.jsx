import React from 'react';
import PersonalShopperForm from '../components/PersonalShopperForm';

const PersonalShopper = () => {
  const features = [
    {
      icon: '🎯',
      title: 'Produtos Específicos',
      description: 'Encontramos qualquer produto que procura, dos dois lados do Atlântico'
    },
    {
      icon: '💰',
      title: 'Melhor Preço',
      description: 'Negociamos para conseguir o melhor preço possível'
    },
    {
      icon: '🚚',
      title: 'Entrega Rápida',
      description: 'Receba em casa, em Luanda ou Lisboa, em até 72 horas'
    },
    {
      icon: '🛡️',
      title: 'Garantia',
      description: 'Verificamos todos os produtos antes do envio'
    }
  ];

  const popularRequests = [
    'Tênis de marca',
    'Tecnologia e eletrônicos',
    'Cosméticos e perfumes',
    'Roupas e acessórios',
    'Livros e materiais escolares',
    'Medicamentos específicos'
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-flyfast-blue to-blue-900 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            👔 Personal Shopper FLYFAST
          </h1>
          <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto">
            Não encontra o que procura? Nós encontramos por si em Portugal ou Angola!
          </p>
          <p className="text-flyfast-yellow font-bold text-lg">
            Deixe as compras connosco e foque no que realmente importa.
          </p>
        </div>
      </div>

      {/* Features */}
      <div className="container mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-center text-flyfast-blue mb-12">
          Como Funciona?
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          {features.map((feature, index) => (
            <div key={index} className="card text-center">
              <div className="text-4xl mb-4">{feature.icon}</div>
              <h3 className="font-bold text-lg mb-3">{feature.title}</h3>
              <p className="text-gray-600">{feature.description}</p>
            </div>
          ))}
        </div>

        {/* Popular Requests */}
        <div className="card max-w-4xl mx-auto mb-16">
          <h2 className="text-2xl font-bold text-flyfast-blue mb-6">
            🎯 Pedidos Populares
          </h2>
          <div className="flex flex-wrap gap-3">
            {popularRequests.map((request, index) => (
              <span
                key={index}
                className="px-4 py-2 bg-blue-50 text-flyfast-blue rounded-full text-sm font-medium"
              >
                {request}
              </span>
            ))}
          </div>
        </div>

        {/* Pricing Info */}
        <div className="card max-w-4xl mx-auto mb-16 bg-yellow-50">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-flyfast-blue mb-4">
              💰 Taxa do Serviço
            </h2>
            <div className="flex flex-col md:flex-row justify-center items-center gap-8">
              <div className="text-center">
                <div className="text-3xl font-bold text-flyfast-blue">15%</div>
                <p className="text-gray-600">do valor do produto</p>
              </div>
              <div className="text-2xl">+</div>
              <div className="text-center">
                <div className="text-3xl font-bold text-flyfast-blue">5.000 AOA</div>
                <p className="text-gray-600">taxa mínima</p>
              </div>
              <div className="text-2xl">+</div>
              <div className="text-center">
                <div className="text-3xl font-bold text-flyfast-blue">Custo de Envio</div>
                <p className="text-gray-600">conforme tabela</p>
              </div>
            </div>
            <p className="text-gray-600 mt-6">
              * A taxa de serviço só é cobrada após confirmação da compra
            </p>
          </div>
        </div>

        {/* Form Section */}
        <PersonalShopperForm />

        {/* Testimonials */}
        <div className="mt-20">
          <h2 className="text-3xl font-bold text-center text-flyfast-blue mb-12">
            O Que Dizem Nossos Clientes
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                name: 'Maria Silva',
                location: 'Luanda',
                text: 'Conseguiram encontrar um medicamento específico em Lisboa que não encontrava em Luanda. Serviço excelente!'
              },
              {
                name: 'João Santos',
                location: 'Lisboa',
                text: 'Comprei tênis limitados através deles em Angola. Processo muito fácil e seguro.'
              },
              {
                name: 'Ana Pereira',
                location: 'Luanda',
                text: 'Uso o Personal Shopper regularmente para comprar cosméticos em Portugal. Sempre impecável!'
              }
            ].map((testimonial, index) => (
              <div key={index} className="card">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-flyfast-yellow rounded-full flex items-center justify-center mr-3">
                    <span className="text-flyfast-blue font-bold">
                      {testimonial.name.charAt(0)}
                    </span>
                  </div>
                  <div>
                    <p className="font-bold">{testimonial.name}</p>
                    <p className="text-gray-500 text-sm">{testimonial.location}</p>
                  </div>
                </div>
                <p className="text-gray-600 italic">"{testimonial.text}"</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PersonalShopper;