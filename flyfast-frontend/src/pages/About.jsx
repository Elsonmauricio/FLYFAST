import React, { useState } from 'react';
import { FaSpinner } from 'react-icons/fa';

const About = () => {
  const [openFaq, setOpenFaq] = useState(null);

  const toggleFaq = (index) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  const faqs = [
    {
      question: 'Quais são os prazos de entrega entre Angola e Portugal?',
      answer: 'Os prazos variam conforme o tipo de serviço escolhido. Para envios expressos, o prazo médio é de 3 a 5 dias úteis. Para envios standard, o prazo médio é de 7 a 10 dias úteis.'
    },
    {
      question: 'Como posso rastrear o meu envio?',
      answer: 'Você pode rastrear o seu envio através da página de Tracking do nosso site, inserindo o número de guia fornecido no momento do envio.'
    },
    {
      question: 'Quais são os métodos de pagamento disponíveis?',
      answer: 'Aceitamos transferências bancárias, PayPal e pagamentos em dinheiro nos nossos escritórios de Luanda e Lisboa.'
    },
    {
      question: 'Vocês fazem recolha ao domicílio?',
      answer: 'Sim, oferecemos serviço de recolha ao domicílio em Luanda e Lisboa. Pode solicitar este serviço durante a criação do envio.'
    },
    {
      question: 'É necessário declarar o conteúdo do envio?',
      answer: 'Sim, todos os envios devem ter o conteúdo declarado para fins de alfândega e segurança. Esta informação é necessária para processarmos a sua encomenda.'
    },
    {
      question: 'O que acontece se a minha encomenda for extraviada?',
      answer: 'Em caso de extravio, seguimos os procedimentos de reclamação e, consoante o seguro contratado, procedemos à indemnização de acordo com as nossas condições gerais.'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-flyfast-blue to-blue-800 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            Sobre a FLYFAST
          </h1>
          <p className="text-xl max-w-3xl mx-auto">
            Conectamos Angola e Portugal com soluções logísticas rápidas, seguras e confiáveis.
          </p>
        </div>
      </div>

      {/* About Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-lg p-8 md:p-12">
            <h2 className="text-3xl font-bold text-flyfast-blue mb-6">
              Quem Somos
            </h2>
            <div className="space-y-6 text-gray-700 text-lg leading-relaxed">
              <p>
                A <strong>FLYFAST</strong> é uma empresa de logística especializada no transporte de cargas e encomendas entre Angola e Portugal. 
                Com mais de 2 anos de experiência no mercado, temos como missão oferecer um serviço rápido, seguro e acessível.
              </p>
              <p>
                Operamos com voos diretos diários entre Luanda e Lisboa, garantindo que as suas encomendas cheguem ao destino 
                no menor tempo possível. A nossa equipa trabalha diariamente para garantir a satisfação dos nossos clientes.
              </p>
              <p>
                Com escritórios em Luanda (Angola) e Lisboa (Portugal), estamos estrategicamente posicionados para oferecer 
                um serviço de qualidade em ambos os lados do Atlântico.
              </p>
            </div>

            {/* Values */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
              <div className="text-center p-6 bg-gray-50 rounded-lg">
                <div className="text-4xl mb-4">🚀</div>
                <h3 className="text-xl font-bold text-flyfast-blue mb-2">Rapidez</h3>
                <p className="text-gray-600">Entregas rápidas e pontuais com voos diretos diários.</p>
              </div>
              <div className="text-center p-6 bg-gray-50 rounded-lg">
                <div className="text-4xl mb-4">🔒</div>
                <h3 className="text-xl font-bold text-flyfast-blue mb-2">Segurança</h3>
                <p className="text-gray-600">Tratamos cada encomenda com o máximo cuidado e profissionalismo.</p>
              </div>
              <div className="text-center p-6 bg-gray-50 rounded-lg">
                <div className="text-4xl mb-4">🤝</div>
                <h3 className="text-xl font-bold text-flyfast-blue mb-2">Confiança</h3>
                <p className="text-gray-600">Mais de 8.000 clientes satisfeitos confiam nos nossos serviços.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="bg-white py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold text-center text-flyfast-blue mb-12">
              Perguntas Frequentes (FAQ)
            </h2>
            <div className="space-y-4">
              {faqs.map((faq, index) => (
                <div 
                  key={index} 
                  className="border border-gray-200 rounded-lg overflow-hidden"
                >
                  <button
                    onClick={() => toggleFaq(index)}
                    className="w-full px-6 py-4 text-left flex justify-between items-center hover:bg-gray-50 transition"
                  >
                    <span className="font-semibold text-gray-800">{faq.question}</span>
                    <span className="text-flyfast-blue text-xl">
                      {openFaq === index ? '−' : '+'}
                    </span>
                  </button>
                  {openFaq === index && (
                    <div className="px-6 py-4 bg-gray-50 text-gray-700 border-t border-gray-200">
                      {faq.answer}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;
