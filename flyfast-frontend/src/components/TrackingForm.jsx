import React, { useState } from 'react';

const TrackingForm = () => {
  const [trackingCode, setTrackingCode] = useState('');
  const [trackingResult, setTrackingResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const mockTrackingData = {
    code: 'LDA-LIS-2025-045',
    status: 'transit',
    package: 'Documentos importantes',
    weight: '2.5 kg',
    from: 'Luanda, Angola',
    to: 'Lisboa, Portugal',
    estimatedDelivery: '2025-01-20',
    currentLocation: 'Centro de Distribuição Luanda',
    history: [
      { date: '2025-01-15 10:30', status: 'Encomenda recebida', location: 'Loja FLYFAST Luanda' },
      { date: '2025-01-16 14:15', status: 'Em processamento', location: 'Centro de Distribuição Luanda' },
      { date: '2025-01-17 09:00', status: 'Em trânsito para Lisboa', location: 'Aeroporto 4 de Fevereiro' },
    ]
  };

  const handleTrack = (e) => {
    e.preventDefault();
    if (!trackingCode.trim()) return;

    setLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      setTrackingResult(mockTrackingData);
      setLoading(false);
    }, 1000);
  };

  const getStatusColor = (status) => {
    const colors = {
      'processing': 'bg-yellow-500',
      'transit': 'bg-blue-500',
      'arrived': 'bg-green-500',
      'delivered': 'bg-green-700'
    };
    return colors[status] || 'bg-gray-500';
  };

  const getStatusText = (status) => {
    const texts = {
      'processing': 'Em Processamento',
      'transit': 'Em Trânsito',
      'arrived': 'Chegou ao Destino',
      'delivered': 'Entregue'
    };
    return texts[status] || 'Status Desconhecido';
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="card bg-gradient-to-r from-flyfast-light-yellow to-white">
        <h2 className="text-2xl font-bold text-flyfast-blue mb-6 text-center">
          📦 Rastreie Seu Envio
        </h2>
        
        <form onSubmit={handleTrack} className="mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <input
              type="text"
              value={trackingCode}
              onChange={(e) => setTrackingCode(e.target.value)}
              placeholder="Digite o código de rastreio (ex: LDA-LIS-2025-045)"
              className="input-field flex-grow"
            />
            <button
              type="submit"
              disabled={loading}
              className="btn-primary px-8 py-3"
            >
              {loading ? 'A Rastrear...' : '🔍 Rastrear'}
            </button>
          </div>
        </form>

        {trackingResult && (
          <div className="mt-8 space-y-6">
            {/* Package Info */}
            <div className="card">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
                <div>
                  <h3 className="text-xl font-bold text-flyfast-blue">
                    Encomenda #{trackingResult.code}
                  </h3>
                  <p className="text-gray-600">{trackingResult.package}</p>
                </div>
                <div className={`px-4 py-2 rounded-lg text-white font-bold ${getStatusColor(trackingResult.status)}`}>
                  {getStatusText(trackingResult.status)}
                </div>
              </div>

              {/* Details Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div>
                  <h4 className="font-bold text-gray-700 mb-2">📌 Informações</h4>
                  <ul className="space-y-2">
                    <li className="flex justify-between">
                      <span className="text-gray-600">Peso:</span>
                      <span className="font-semibold">{trackingResult.weight}</span>
                    </li>
                    <li className="flex justify-between">
                      <span className="text-gray-600">Origem:</span>
                      <span className="font-semibold">{trackingResult.from}</span>
                    </li>
                    <li className="flex justify-between">
                      <span className="text-gray-600">Destino:</span>
                      <span className="font-semibold">{trackingResult.to}</span>
                    </li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-bold text-gray-700 mb-2">📍 Localização Atual</h4>
                  <p className="text-lg font-semibold text-flyfast-blue">
                    {trackingResult.currentLocation}
                  </p>
                  <p className="text-gray-600 mt-2">
                    Entrega estimada: {trackingResult.estimatedDelivery}
                  </p>
                </div>
              </div>

              {/* Tracking History */}
              <div>
                <h4 className="font-bold text-gray-700 mb-4">📋 Histórico de Rastreio</h4>
                <div className="space-y-4">
                  {trackingResult.history.map((item, index) => (
                    <div key={index} className="flex items-start space-x-4">
                      <div className="flex flex-col items-center">
                        <div className={`w-3 h-3 rounded-full ${index === 0 ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                        {index < trackingResult.history.length - 1 && (
                          <div className="w-0.5 h-12 bg-gray-300 mt-1"></div>
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between">
                          <p className="font-semibold">{item.status}</p>
                          <p className="text-sm text-gray-500">{item.date}</p>
                        </div>
                        <p className="text-gray-600">{item.location}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {!trackingResult && !loading && (
          <div className="text-center text-gray-500 py-8">
            <p className="text-lg">Digite um código de rastreio para ver o status do seu envio</p>
            <p className="text-sm mt-2">Exemplo: LDA-LIS-2025-045</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TrackingForm;