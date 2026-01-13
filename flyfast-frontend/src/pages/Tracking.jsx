import React, { useState, useEffect } from 'react';
import { useTracking } from '../hooks/useTracking';
import { useParams } from 'react-router-dom';
import { FaSearch, FaSpinner, FaExclamationCircle, FaBell, FaEnvelope, FaPlane } from 'react-icons/fa';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix para os ícones do Leaflet em React
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Componente auxiliar para atualizar o centro do mapa quando a localização muda
const MapUpdater = ({ center }) => {
  const map = useMap();
  useEffect(() => {
    map.setView(center, map.getZoom());
  }, [center, map]);
  return null;
};

const Tracking = () => {
  const params = useParams();
  // Tenta obter o código do URL (suporta :id ou :trackingCode)
  const urlCode = params.id || params.trackingCode;
  
  const [trackingCode, setTrackingCode] = useState(urlCode || '');
  const { trackingInfo, isLoading, error, fetchTrackingInfo } = useTracking();

  // Estado para a subscrição de notificações
  const [emailForUpdates, setEmailForUpdates] = useState('');
  const [isSubscribing, setIsSubscribing] = useState(false);

  // Efeito para buscar automaticamente se vier do link da conta
  useEffect(() => {
    if (urlCode) {
      fetchTrackingInfo(urlCode);
    }
  }, [urlCode, fetchTrackingInfo]);

  const handleSubmit = (e) => {
    e.preventDefault();
    fetchTrackingInfo(trackingCode);
  };

  const handleSubscribe = async (e) => {
    e.preventDefault();
    if (!emailForUpdates) return;
    setIsSubscribing(true);
    
    try {
      const response = await fetch(`/api/tracking/${trackingInfo.code}/subscribe`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: emailForUpdates })
      });

      if (response.ok) {
        alert(`Notificações ativadas para ${emailForUpdates}! Receberá um email sempre que o estado mudar.`);
        setEmailForUpdates('');
      } else {
        if (response.status === 404) {
          alert('Serviço indisponível momentaneamente (Rota não encontrada). Por favor, contacte o suporte.');
        } else {
          alert('Erro ao subscrever notificações. Tente novamente.');
        }
      }
    } catch (error) {
      alert('Erro de conexão.');
    } finally {
      setIsSubscribing(false);
    }
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

  // Coordenadas das principais cidades (Adicione mais conforme necessário)
  // As chaves devem estar em minúsculas para facilitar a comparação
  const LOCATION_COORDINATES = {
    'luanda': [ -8.839988, 13.289437 ],
    'viana': [ -8.9158, 13.3469 ],
    'lisboa': [ 38.722252, -9.139337 ],
    'odivelas': [ 38.7944, -9.1764 ],
    'porto': [ 41.157944, -8.629105 ],
    'benguela': [ -12.5763, 13.4055 ],
    'lobito': [ -12.3481, 13.5456 ],
    'huambo': [ -12.7761, 15.7416 ],
    'lubango': [ -14.9172, 13.4925 ],
    'cabinda': [ -5.5500, 12.2000 ],
    'faro': [ 37.0179, -7.9308 ],
    'coimbra': [ 40.2033, -8.4103 ],
    'setúbal': [ 38.5244, -8.8882 ],
    'em trânsito': [ 15.0, 0.0 ], // Ponto no oceano (exemplo visual)
  };

  const getCoordinates = (location) => {
    if (!location) return LOCATION_COORDINATES['luanda'];
    const lowerLoc = location.toLowerCase();
    const key = Object.keys(LOCATION_COORDINATES).find(k => lowerLoc.includes(k));
    return LOCATION_COORDINATES[key] || LOCATION_COORDINATES['luanda'];
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
            
            {/* Mapa Interativo */}
            <div className="mb-8 h-80 rounded-xl overflow-hidden shadow-lg border border-gray-200 z-0 relative">
               <MapContainer 
                 center={getCoordinates(trackingInfo.currentLocation)} 
                 zoom={4} 
                 style={{ height: '100%', width: '100%' }}
                 scrollWheelZoom={false}
               >
                 <MapUpdater center={getCoordinates(trackingInfo.currentLocation)} />
                 <TileLayer
                   attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                   url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                 />
                 {/* Marcador da Localização Atual */}
                 <Marker position={getCoordinates(trackingInfo.currentLocation)}>
                   <Popup>
                     <div className="text-center">
                       <strong className="text-flyfast-blue text-lg">{trackingInfo.currentLocation}</strong>
                       <br />
                       <span className="text-sm text-gray-600">{trackingInfo.status}</span>
                       <br />
                       <span className="text-xs text-gray-400">{new Date(trackingInfo.lastUpdate).toLocaleDateString()}</span>
                     </div>
                   </Popup>
                 </Marker>
               </MapContainer>
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