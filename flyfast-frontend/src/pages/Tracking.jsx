import React, { useState } from 'react';
import { useTracking } from '../hooks/useTracking';
import { FaSearch, FaSpinner, FaExclamationCircle } from 'react-icons/fa';

const Tracking = () => {
  const [trackingCode, setTrackingCode] = useState('');
  const { trackingInfo, isLoading, error, fetchTrackingInfo } = useTracking();

  const handleSubmit = (e) => {
    e.preventDefault();
    fetchTrackingInfo(trackingCode);
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
              className="flex-grow input input-bordered w-full"
              disabled={isLoading}
            />
            <button type="submit" className="btn btn-primary" disabled={isLoading}>
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
          <div className="alert alert-error">
            <FaExclamationCircle />
            <span>{error}</span>
          </div>
        )}

        {trackingInfo && (
          <div className="card">
            <h2 className="text-2xl font-bold text-flyfast-blue mb-4">
              Detalhes do Envio: <span className="font-mono">{trackingInfo.code}</span>
            </h2>
            
            <div className="mb-6">
              <p className="text-lg">
                <strong>Estado Atual:</strong>
                <span className="ml-2 badge badge-lg badge-success">{trackingInfo.status}</span>
              </p>
              <p className="text-gray-500">Última atualização: {new Date(trackingInfo.lastUpdate).toLocaleString('pt-PT')}</p>
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
          </div>
        )}
      </div>
    </div>
  );
};

export default Tracking;