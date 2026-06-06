import React, { useState } from 'react';
import { FaChevronDown, FaGlobeAmericas, FaTruck, FaShieldAlt, FaUsers, FaLightbulb, FaHeadset } from 'react-icons/fa';

const Checkout = () => {
  const [activeTab, setActiveTab] = useState('about');
  const [expandedFAQ, setExpandedFAQ] = useState(null);

  const toggleFAQ = (index) => {
    setExpandedFAQ(expandedFAQ === index ? null : index);
  };

  const faqItems = [
    {
      question: "Como posso rastrear meu envio?",
      answer: "Você pode rastrear seu envio em tempo real usando o código de rastreamento fornecido no email de confirmação. Visite a página de rastreamento e insira o código para ver a localização atual e o histórico da encomenda."
    },
    {
      question: "Qual é o tempo de entrega estimado?",
      answer: "O tempo estimado de entrega para encomendas de pequeno porte é de até 5 dias úteis após a data de envio. Já para encomendas de grande porte e associadas a grandes contribuintes podem levar de 5 até 15 dias úteis após a data de envio, dependendo da localização."
    },
    {
      question: "Qual é o custo de envio?",
      answer: "Oferecemos diferentes opções de envio com preços competitivos. O custo de envio para algumas encomendas depende do peso e destino, para outras tem custo fixo consulte a nossa tabela de preços na secção rotas. Você pode calcular o custo de envio antes de confirmar a compra."
    },
    {
      question: "O que devo fazer se meu envio se atrasar?",
      answer: "Se seu envio se atrasar além do prazo estimado, entre em contato com nosso suporte através do formulário de contacto. Nossa equipe investigará o caso e fornecerá uma atualização."
    },
    {
      question: "Como posso cancelar meu pedido?",
      answer: "Pedidos podem ser cancelados até 24 horas após a confirmação. Entre em contato com nosso suporte imediatamente com seu número de pedido. Após esse período, o reembolso pode estar sujeito a taxas."
    },
    {
      question: "Como funciona o serviço de Personal Shopper?",
      answer: "Nosso serviço de Personal Shopper permite que você tenha um especialista dedicado para ajudar na seleção de produtos, verificação de qualidade e negociação de preços. Preencha o formulário na página de Personal Shopper para solicitar esse serviço."
    },
    {
      question: "Quais métodos de pagamento vocês aceitam?",
      answer: "Aceitamos transferência bancária e pagamento via Mbway."
    },
    {
      question: "Meus dados são seguros?",
      answer: "Sim. Utilizamos criptografia SSL de grau bancário e cumprimos com as melhores práticas de segurança. Seus dados pessoais e de pagamento nunca são compartilhados com terceiros."
    },
    {
      question: "Como posso entrar em contato com o suporte?",
      answer: "Você pode contactar-nos através do formulário de contacto na página de Contacto, email em flyfast163@gmail.com, ou Telefone ao vivo disponível 24/7."
    }
  ];

  const features = [
    {
      icon: <FaGlobeAmericas className="text-4xl text-flyfast-blue" />,
      title: "Alcance Global",
      description: "Enviamos para Angola, Portugal e mais países. Qualquer lugar do mundo, qualidade garantida."
    },
    {
      icon: <FaTruck className="text-4xl text-flyfast-blue" />,
      title: "Logística Inteligente",
      description: "Rastreamento em tempo real, rotas otimizadas e múltiplas opções de entrega."
    },
    {
      icon: <FaShieldAlt className="text-4xl text-flyfast-blue" />,
      title: "100% Seguro",
      description: "Seus pedidos são protegidos. Reembolso garantido se algo correr mal."
    },
    {
      icon: <FaUsers className="text-4xl text-flyfast-blue" />,
      title: "Equipa Dedicada",
      description: "Personal Shoppers para ajudar você a encontrar exatamente o que precisa."
    },
    {
      icon: <FaLightbulb className="text-4xl text-flyfast-blue" />,
      title: "Inovação",
      description: "Tecnologia de ponta para a melhor experiência de compra online."
    },
    {
      icon: <FaHeadset className="text-4xl text-flyfast-blue" />,
      title: "Suporte 24/7",
      description: "Equipa de atendimento pronta para ajudar a qualquer momento."
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-flyfast-blue to-blue-700 text-white py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">FLYFAST</h1>
          <p className="text-xl text-blue-100">Comércio sem Fronteiras. Entrega com Qualidade.</p>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-4">
          <div className="flex gap-0 sm:gap-4">
            <button
              onClick={() => setActiveTab('about')}
              className={`flex-1 sm:flex-none px-6 py-4 font-semibold transition-colors border-b-2 ${
                activeTab === 'about'
                  ? 'border-flyfast-blue text-flyfast-blue'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              Sobre Nós
            </button>
            <button
              onClick={() => setActiveTab('faq')}
              className={`flex-1 sm:flex-none px-6 py-4 font-semibold transition-colors border-b-2 ${
                activeTab === 'faq'
                  ? 'border-flyfast-blue text-flyfast-blue'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              FAQ
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-12">
        {/* SOBRE NÓS TAB */}
        {activeTab === 'about' && (
          <div className="space-y-12">
            {/* Missão */}
            <section className="bg-white rounded-lg p-8 shadow-sm">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Missão Corporativa</h2>
              <p className="text-gray-700 leading-relaxed text-lg">
                Ajudar particulares e empresas a transportar todo o tipo de mercadorias e produtos, bem como 
                alavancar potenciais negócios que dependem da importação ou exportação, através de políticas 
                eficientes, céleres e cada vez mais tecnológicas. Nosso objetivo é maximizar a produção dos 
                nossos clientes sem burocracia, tornando o comércio internacional acessível e simples para todos.
              </p>
            </section>

            {/* Visão */}
            <section className="bg-white rounded-lg p-8 shadow-sm">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Nossa Visão</h2>
              <p className="text-gray-700 leading-relaxed text-lg">
                Ser a plataforma número um em África para comércio eletrônico e logística, criando oportunidades 
                económicas para pequenas e grandes empresas, eliminando as barreiras geográficas e tornando possível 
                que qualquer pessoa venda ou compre em qualquer lugar do mundo.
              </p>
            </section>

            {/* Valores */}
            <section className="bg-white rounded-lg p-8 shadow-sm">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Nossos Valores</h2>
              <div className="grid md:grid-cols-1 gap-6">
                <div className="border-l-4 border-flyfast-blue pl-4 pb-4">
                  <h3 className="font-bold text-xl text-gray-900 mb-2">Qualidade e Excelência</h3>
                  <p className="text-gray-600">Comprometidos em manter um serviço de alto padrão e qualidade, cuidando da segurança de produtos sempre em primeiro, combinando isso com a garantia de um serviço excepcional.</p>
                </div>
                <div className="border-l-4 border-flyfast-blue pl-4 pb-4">
                  <h3 className="font-bold text-xl text-gray-900 mb-2">Integridade</h3>
                  <p className="text-gray-600">Trabalhamos constantemente para garantir que os nossos serviços sejam prestados com transparência total, honestidade e um comportamento digno com os nossos clientes.</p>
                </div>
                <div className="border-l-4 border-flyfast-blue pl-4">
                  <h3 className="font-bold text-xl text-gray-900 mb-2">Inovação</h3>
                  <p className="text-gray-600">Garantimos o uso continuo de todos os recursos de última geração para inovar e atualizarmos todos os dias os nossos serviços em prol da satisfação dos nossos clientes.</p>
                </div>
              </div>
            </section>

            {/* Serviços */}
            <section className="bg-white rounded-lg p-8 shadow-sm">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Nossos Serviços</h2>
              <p className="text-gray-700 leading-relaxed mb-6">Possuímos uma vasta escala de serviços que visam aproximar os nossos clientes até as suas necessidades pessoais, profissionais e empresariais.</p>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h3 className="font-bold text-lg text-gray-900 mb-3">Transporte de Mercadorias</h3>
                  <p className="text-gray-700">Transporte de mercadorias entre Europa (Portugal) e Angola com rastreamento em tempo real e máxima segurança.</p>
                </div>
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h3 className="font-bold text-lg text-gray-900 mb-3">Personal Shopper</h3>
                  <p className="text-gray-700">Serviço de compras personalizadas com especialistas dedicados para ajudar na seleção de produtos e negociação de preços.</p>
                </div>
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h3 className="font-bold text-lg text-gray-900 mb-3">Pagamento de Facturas</h3>
                  <p className="text-gray-700">Assistência no pagamento de faturas e transações internacionais de forma segura e eficiente.</p>
                </div>
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h3 className="font-bold text-lg text-gray-900 mb-3">Assistência em Exchange</h3>
                  <p className="text-gray-700">Suporte completo para transações de câmbio e operações comerciais internacionais.</p>
                </div>
              </div>
            </section>

            {/* Diferenciais */}
            <section>
              <h2 className="text-3xl font-bold text-gray-900 mb-8">Por Que Escolher FLYFAST?</h2>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {features.map((feature, index) => (
                  <div key={index} className="bg-white rounded-lg p-6 shadow-sm hover:shadow-md transition">
                    <div className="flex justify-center mb-4">
                      {feature.icon}
                    </div>
                    <h3 className="font-bold text-lg text-gray-900 text-center mb-2">{feature.title}</h3>
                    <p className="text-gray-600 text-center text-sm">{feature.description}</p>
                  </div>
                ))}
              </div>
            </section>

            {/* Histórico */}
            <section className="bg-white rounded-lg p-8 shadow-sm">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Nossa História</h2>
              <div className="space-y-4">
                <div className="flex gap-4">
                  <div className="flex-shrink-0">
                    <div className="flex items-center justify-center h-8 w-8 rounded-full bg-flyfast-blue text-white font-bold">2023</div>
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900">Fundação da FLYFAST</h3>
                    <p className="text-gray-600">Começamos como uma startup inovadora em Luanda com a visão de transformar o comércio eletrônico em Angola.</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="flex-shrink-0">
                    <div className="flex items-center justify-center h-8 w-8 rounded-full bg-flyfast-blue text-white font-bold">2024</div>
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900">Expansão Regional</h3>
                    <p className="text-gray-600">Estendemos nossas operações para todo o território angolano, atingindo milhares de clientes.</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="flex-shrink-0">
                    <div className="flex items-center justify-center h-8 w-8 rounded-full bg-flyfast-blue text-white font-bold">2025</div>
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900">Alcance Global</h3>
                    <p className="text-gray-600">Iniciamos operações internacionais, conectando Angola com Portugal.</p>
                  </div>
                </div>
              </div>
            </section>

            {/* Call to Action */}
            <section className="bg-gradient-to-r from-flyfast-blue to-blue-700 text-white rounded-lg p-8 text-center">
              <h2 className="text-2xl font-bold mb-4">Pronto para Começar?</h2>
              <p className="mb-6 text-blue-100">Junte-se a milhares de clientes satisfeitos e comece sua jornada com FLYFAST.</p>
              <a href="/shop" className="inline-block bg-white text-flyfast-blue px-8 py-3 rounded-lg font-bold hover:bg-blue-50 transition">
                Explorar Loja
              </a>
            </section>
          </div>
        )}

        {/* FAQ TAB */}
        {activeTab === 'faq' && (
          <div className="space-y-4">
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Perguntas Frequentes</h2>
              <p className="text-gray-600">Encontre respostas para as dúvidas mais comuns sobre nossos serviços.</p>
            </div>

            {faqItems.map((item, index) => (
              <div key={index} className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition">
                <button
                  onClick={() => toggleFAQ(index)}
                  className="w-full px-6 py-4 flex justify-between items-center hover:bg-gray-50 transition"
                >
                  <h3 className="font-semibold text-gray-900 text-left">{item.question}</h3>
                  <FaChevronDown 
                    className={`text-flyfast-blue transition-transform ${expandedFAQ === index ? 'rotate-180' : ''}`}
                  />
                </button>

                {expandedFAQ === index && (
                  <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
                    <p className="text-gray-700 leading-relaxed">{item.answer}</p>
                  </div>
                )}
              </div>
            ))}

            {/* Mais Dúvidas */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mt-8">
              <h3 className="font-bold text-gray-900 mb-2">Não encontrou sua resposta?</h3>
              <p className="text-gray-600 mb-4">Nossa equipa de suporte está sempre pronta para ajudar.</p>
              <a href="/contact" className="inline-block text-flyfast-blue font-semibold hover:underline">
                Entre em contato com o suporte →
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Checkout;
