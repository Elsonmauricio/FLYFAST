import React, { useState } from 'react';
import { useTracking } from '../hooks/useTracking';
import { FaSearch, FaSpinner, FaExclamationCircle, FaBell, FaEnvelope, FaPlane } from 'react-icons/fa';

const Tracking = () => {
  const [trackingCode, setTrackingCode] = useState('');
  const { trackingInfo, isLoading, error, fetchTrackingInfo } = useTracking();

  // Estado para a subscrição de notificações
  const [emailForUpdates, setEmailForUpdates] = useState('');
  const [isSubscribing, setIsSubscribing] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    fetchTrackingInfo(trackingCode);
  };

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (!emailForUpdates) return;
    setIsSubscribing(true);
    // Simulação de chamada à API para registar o email
    setTimeout(() => {
      setIsSubscribing(false);
      alert(`Notificações ativadas para ${emailForUpdates}! Receberá um email sempre que o estado mudar.`);
      setEmailForUpdates('');
    }, 1500);
  };

  const getProgress = (status) => {
    const statusMap = {
      'Pendente': 5,
      'Em Processamento': 20,
      'Em Trânsito': 60,
      'Chegou ao Destino': 90,
      'Entregue': 100
    };
    return statusMap[status] || 5;
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4 sm:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Formulário de Busca */}
        <div className="card mb-8">
          <h1 className="text-3xl font-bold text-flyfast-blue mb-2">Rastreie o seu Envio</h1>
          <p className="text-gray-600 mb-6">Insira o código de rastreamento para ver o estado atual da sua encomenda.</p>
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4">
            <input
              type="text"
              value={trackingCode}
              onChange={(e) => setTrackingCode(e.target.value)}
              placeholder="Ex: FLY123456PT"
              className="flex-grow input input-bordered w-full p-3 border rounded-lg"
              disabled={isLoading}
            />
            <button type="submit" className="btn btn-primary px-6 py-3 rounded-lg font-bold bg-flyfast-blue text-white hover:bg-blue-700 transition" disabled={isLoading}>
              {isLoading ? (
                <>
                  <FaSpinner className="animate-spin mr-2" />
                  A Rastrear...
                </>
              ) : (
                <>
                  <FaSearch className="mr-2" />
                  Rastrear
                </>
              )}
            </button>
          </form>
        </div>

        {/* Área de Resultados */}
        {error && (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded" role="alert">
            <FaExclamationCircle />
            <span>{error}</span>
          </div>
        )}

        {trackingInfo && (
          <div className="card">
            <h2 className="text-2xl font-bold text-flyfast-blue mb-6 border-b pb-4">
              Detalhes do Envio: <span className="font-mono">{trackingInfo.code}</span>
            </h2>
            
            {/* Visual Map */}
            <div className="mb-8 bg-flyfast-blue rounded-xl p-6 text-white relative overflow-hidden shadow-inner">
               {/* Abstract Map Background */}
               <div className="absolute inset-0 opacity-20 pointer-events-none">
                  <svg width="100%" height="100%">
                     <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                       <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="0.5"/>
                     </pattern>
                     <rect width="100%" height="100%" fill="url(#grid)" />
                  </svg>
               </div>

               <div className="relative z-10 flex justify-between items-center h-24 px-4">
                  {/* Origin */}
                  <div className="flex flex-col items-center z-20">
                     <div className="w-3 h-3 bg-flyfast-yellow rounded-full mb-2 shadow-[0_0_10px_rgba(255,215,0,0.8)]"></div>
                     <span className="font-bold text-lg">{trackingInfo.from || 'Luanda'}</span>
                  </div>

                  {/* Path Line */}
                  <div className="flex-1 mx-4 relative h-1 bg-blue-800 rounded-full">
                     <div 
                       className="absolute top-0 left-0 h-full bg-flyfast-yellow rounded-full transition-all duration-1000 ease-out"
                       style={{ width: `${getProgress(trackingInfo.status)}%` }}
                     ></div>
                     
                     {/* Plane Icon */}
                     <div 
                       className="absolute top-1/2 -translate-y-1/2 transition-all duration-1000 ease-out"
                       style={{ left: `${getProgress(trackingInfo.status)}%` }}
                     >
                        <div className="bg-white text-flyfast-blue p-1.5 rounded-full shadow-lg transform -translate-x-1/2 rotate-90">
                           <FaPlane size={14} />
                        </div>
                     </div>
                  </div>

                  {/* Destination */}
                  <div className="flex flex-col items-center z-20">
                     <div className={`w-3 h-3 rounded-full mb-2 ${trackingInfo.status === 'Entregue' ? 'bg-green-400' : 'bg-white'}`}></div>
                     <span className="font-bold text-lg">{trackingInfo.to || 'Lisboa'}</span>
                  </div>
               </div>
               <div className="text-center text-blue-200 text-sm mt-2">
                  {trackingInfo.status === 'Em Trânsito' ? '✈️ Em voo' : trackingInfo.status}
               </div>
            </div>

            <div className="mb-8 bg-gray-50 p-4 rounded-lg">
              <p className="text-lg mb-2">
                <strong>Estado Atual:</strong>
                <span className={`ml-2 px-3 py-1 rounded-full text-sm font-bold ${
                  trackingInfo.status === 'Entregue' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
                }`}>
                  {trackingInfo.status}
                </span>
              </p>
              <p className="text-gray-600">
                <strong>Rota:</strong> {trackingInfo.from || 'Luanda'} ➝ {trackingInfo.to || 'Lisboa'}
              </p>
              <p className="text-gray-500 text-sm mt-2">Última atualização: {new Date(trackingInfo.lastUpdate).toLocaleString('pt-PT')}</p>
            </div>

            <div>
              <h3 className="font-bold text-xl mb-4 text-gray-700">Histórico de Localizações</h3>
              <ul className="steps steps-vertical">
                {trackingInfo.history.map((item, index) => (
                  <li key={index} className="step step-primary">
                    <div className="flex flex-col items-start text-left ml-2">
                      <span className="font-semibold">{item.location}</span>
                      <span className="text-sm text-gray-500">{new Date(item.date).toLocaleString('pt-PT')}</span>
                      <span className="text-sm">{item.status}</span>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            {/* Nova Funcionalidade: Notificações */}
            <div className="mt-10 pt-8 border-t border-gray-200">
              <h3 className="font-bold text-xl mb-4 text-gray-700 flex items-center gap-2">
                <FaBell className="text-flyfast-yellow" />
                Receber Atualizações
              </h3>
              <p className="text-gray-600 mb-4">
                Insira o seu email para receber notificações automáticas sempre que o estado da sua encomenda mudar.
              </p>
              <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-3 max-w-lg">
                <div className="relative flex-grow">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaEnvelope className="text-gray-400" />
                  </div>
                  <input 
                    type="email" 
                    placeholder="seu@email.com" 
                    className="w-full pl-10 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-flyfast-blue focus:outline-none"
                    value={emailForUpdates}
                    onChange={(e) => setEmailForUpdates(e.target.value)}
                    required
                  />
                </div>
                <button 
                  type="submit" 
                  className="bg-gray-800 text-white px-6 py-3 rounded-lg font-bold hover:bg-gray-700 transition disabled:opacity-70"
                  disabled={isSubscribing}
                >
                  {isSubscribing ? 'A ativar...' : 'Subscrever'}
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Tracking;