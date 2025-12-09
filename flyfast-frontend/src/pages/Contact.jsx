import React from 'react';
import ContactForm from '../components/ContactForm';

const Contact = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-flyfast-blue to-blue-800 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            📞 Contacte a FLYFAST
          </h1>
          <p className="text-xl max-w-3xl mx-auto">
            Estamos aqui para ajudar! Entre em contacto através do canal que preferir.
          </p>
          <p className="text-flyfast-yellow font-bold text-lg mt-4">
            Resposta rápida garantida
          </p>
        </div>
      </div>

      {/* Contact Form & Info */}
      <div className="container mx-auto px-4 py-12">
        <ContactForm />
      </div>

      {/* Map Section */}
      <div className="bg-white py-12">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-flyfast-blue mb-12">
            📍 Encontre-nos
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Angola Office */}
            <div className="card">
              <div className="flex items-center mb-6">
                <span className="text-3xl mr-3">🇦🇴</span>
                <div>
                  <h3 className="text-2xl font-bold">Luanda, Angola</h3>
                  <p className="text-gray-600">Sede Principal</p>
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex items-start">
                  <span className="text-xl mr-3">📍</span>
                  <div>
                    <p className="font-semibold">Endereço</p>
                    <p className="text-gray-600">
                      Rua da Missão, 123<br />
                      Luanda, Angola
                    </p>
                  </div>
                </div>
                <div className="flex items-start">
                  <span className="text-xl mr-3">🕒</span>
                  <div>
                    <p className="font-semibold">Horário</p>
                    <p className="text-gray-600">
                      Seg-Sex: 8:00-20:00<br />
                      Sábado: 9:00-18:00<br />
                      Domingo: 10:00-16:00
                    </p>
                  </div>
                </div>
              </div>
              {/* Mock Map */}
              <div className="mt-6 bg-gray-200 rounded-lg h-48 flex items-center justify-center">
                <p className="text-gray-500">Mapa de Luanda</p>
              </div>
            </div>

            {/* Portugal Office */}
            <div className="card">
              <div className="flex items-center mb-6">
                <span className="text-3xl mr-3">🇵🇹</span>
                <div>
                  <h3 className="text-2xl font-bold">Lisboa, Portugal</h3>
                  <p className="text-gray-600">Escritório Europeu</p>
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex items-start">
                  <span className="text-xl mr-3">📍</span>
                  <div>
                    <p className="font-semibold">Endereço</p>
                    <p className="text-gray-600">
                      Av. da Liberdade, 456<br />
                      Lisboa, Portugal
                    </p>
                  </div>
                </div>
                <div className="flex items-start">
                  <span className="text-xl mr-3">🕒</span>
                  <div>
                    <p className="font-semibold">Horário</p>
                    <p className="text-gray-600">
                      Seg-Sex: 9:00-19:00<br />
                      Sábado: 10:00-17:00<br />
                      Domingo: Fechado
                    </p>
                  </div>
                </div>
              </div>
              {/* Mock Map */}
              <div className="mt-6 bg-gray-200 rounded-lg h-48 flex items-center justify-center">
                <p className="text-gray-500">Mapa de Lisboa</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Emergency Contact */}
      <div className="bg-red-50 py-12">
        <div className="container mx-auto px-4">
          <div className="card max-w-4xl mx-auto bg-white">
            <div className="text-center">
              <div className="text-4xl mb-4">🚨</div>
              <h2 className="text-2xl font-bold text-red-700 mb-4">
                Contacto de Emergência
              </h2>
              <p className="text-gray-600 mb-6">
                Para situações urgentes relacionadas com envios em curso
              </p>
              <div className="flex flex-col md:flex-row justify-center items-center gap-6">
                <div className="text-center">
                  <p className="font-bold text-lg">WhatsApp 24/7</p>
                  <p className="text-flyfast-blue text-xl font-bold">+244 923 456 789</p>
                </div>
                <div className="text-center">
                  <p className="font-bold text-lg">Emergência</p>
                  <p className="text-flyfast-blue text-xl font-bold">+351 912 345 678</p>
                </div>
              </div>
              <p className="text-sm text-gray-500 mt-6">
                * Apenas para situações verdadeiramente urgentes
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;