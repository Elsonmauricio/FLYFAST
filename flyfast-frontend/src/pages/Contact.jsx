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
             Encontre-nos
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Angola Office */}
            <div className="card">
              <div className="flex items-center mb-6">
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
                      Rua direita do colegio São Vicente de Paulo, antigo<br />
                      Luanda Sul, Viana, Angola
                    </p>
                  </div>
                </div>
                <div className="flex items-start">
                  <span className="text-xl mr-3">🕒</span>
                  <div>
                    <p className="font-semibold">Horário</p>
                    <p className="text-gray-600">
                      Seg-Sex: 8:0-17:30<br />
                      Sábado: Fechado<br />
                      Domingo: Fechado
                    </p>
                  </div>
                </div>
              </div>
              {/* Map */}
              <div className="mt-6 bg-gray-200 rounded-lg h-48 overflow-hidden">
                <iframe 
                  title="Mapa Luanda"
                  width="100%" 
                  height="100%" 
                  frameBorder="0" 
                  scrolling="no" 
                  src="https://maps.google.com/maps?q=Rua+direita+do+colegio+S%C3%A3o+Vicente+de+Paulo,+antigo+Luanda+Sul,+Viana,+Angola&t=&z=15&ie=UTF8&iwloc=&output=embed"
                ></iframe>
              </div>
            </div>

            {/* Portugal Office */}
            <div className="card">
              <div className="flex items-center mb-6">
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
                      Rua João Villaret 7, Queluz 2745-285 <br />
                      Lisboa, Portugal
                    </p>
                  </div>
                </div>
                <div className="flex items-start">
                  <span className="text-xl mr-3">🕒</span>
                  <div>
                    <p className="font-semibold">Horário</p>
                    <p className="text-gray-600">
                      Seg-Sex: 9:00-18:30<br />
                      Sábado: Fechado<br />
                      Domingo: Fechado
                    </p>
                  </div>
                </div>
              </div>
              {/* Map */}
              <div className="mt-6 bg-gray-200 rounded-lg h-48 overflow-hidden">
                <iframe 
                  title="Mapa Lisboa"
                  width="100%" 
                  height="100%" 
                  frameBorder="0" 
                  scrolling="no" 
                  src="https://maps.google.com/maps?q=Rua+Jo%C3%A3o+Villaret+7,+Queluz+2745-285&t=&z=15&ie=UTF8&iwloc=&output=embed"
                ></iframe>
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
                  <p className="text-flyfast-blue text-xl font-bold">+244 948 787 653</p>
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