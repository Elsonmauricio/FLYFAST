import React from 'react';
import TrackingForm from '../components/TrackingForm';

const Tracking = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-flyfast-blue mb-4">
            Rastreamento de Envio
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Acompanhe em tempo real a localização do seu pacote entre Luanda e Lisboa
          </p>
        </div>

        <TrackingForm />

        {/* Help Section */}
        <div className="mt-16 max-w-4xl mx-auto">
          <div className="card bg-blue-50">
            <h2 className="text-2xl font-bold text-flyfast-blue mb-6">
              ❓ Precisa de Ajuda?
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h3 className="font-bold text-lg mb-3">Não tem o código de rastreio?</h3>
                <ul className="space-y-2 text-gray-600">
                  <li>• Verifique o email de confirmação do envio</li>
                  <li>• Contacte o nosso suporte</li>
                  <li>• Consulte a área do cliente</li>
                </ul>
              </div>
              <div>
                <h3 className="font-bold text-lg mb-3">Status do Envio</h3>
                <ul className="space-y-2 text-gray-600">
                  <li className="flex items-center">
                    <span className="w-3 h-3 bg-yellow-500 rounded-full mr-2"></span>
                    Em Processamento
                  </li>
                  <li className="flex items-center">
                    <span className="w-3 h-3 bg-blue-500 rounded-full mr-2"></span>
                    Em Trânsito
                  </li>
                  <li className="flex items-center">
                    <span className="w-3 h-3 bg-green-500 rounded-full mr-2"></span>
                    Entregue
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Tracking;