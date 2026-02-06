import React, { useState, useEffect, useMemo } from 'react';
import { useTracking } from '../hooks/useTracking';
import { useParams } from 'react-router-dom';
import { FaSearch, FaSpinner, FaExclamationCircle, FaBell, FaEnvelope, FaPlane } from 'react-icons/fa';
import { MapContainer, TileLayer, Marker, Polyline, useMap, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix para os ícones padrão do Leaflet em React
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Componente para ajustar o zoom do mapa automaticamente
const MapBoundsHandler = ({ route, center }) => {
  const map = useMap();
  
  useEffect(() => {
    // Timeout para garantir que o container tem dimensões antes de ajustar e força o invalidateSize
    const timer = setTimeout(() => {
      map.invalidateSize(); // Corrige problemas de renderização parcial (tiles cinzentos)

      if (route && route.length > 1) {
        // Se houver uma rota, ajusta o mapa para mostrar a rota inteira
        const bounds = L.latLngBounds(route);
        if (bounds.isValid()) {
          map.fitBounds(bounds, { padding: [50, 50], maxZoom: 8 });
        }
      } else if (center) {
        // Se for apenas um ponto, centra nele
        map.setView(center, map.getZoom() || 5);
      }
    }, 200); // Pequeno delay para garantir renderização do DOM
    
    return () => clearTimeout(timer);
  }, [route, center, map]);
  
  return null;
};

// Helper para calcular o ângulo (bearing) entre dois pontos geográficos
const getBearing = (startLat, startLng, destLat, destLng) => {
  const startLatRad = startLat * (Math.PI / 180);
  const startLngRad = startLng * (Math.PI / 180);
  const destLatRad = destLat * (Math.PI / 180);
  const destLngRad = destLng * (Math.PI / 180);

  const y = Math.sin(destLngRad - startLngRad) * Math.cos(destLatRad);
  const x = Math.cos(startLatRad) * Math.sin(destLatRad) -
            Math.sin(startLatRad) * Math.cos(destLatRad) * Math.cos(destLngRad - startLngRad);
  
  const brng = Math.atan2(y, x);
  return (brng * 180 / Math.PI + 360) % 360;
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
    'angola': [ -8.839988, 13.289437 ],
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
    
    // Lógica para calcular o ponto médio (para simular o avião em trânsito)
    if (location === 'midpoint') {
      const fromCoords = getCoordinates(trackingInfo?.from || 'luanda');
      const toCoords = getCoordinates(trackingInfo?.to || 'lisboa');
      return [
        (fromCoords[0] + toCoords[0]) / 2,
        (fromCoords[1] + toCoords[1]) / 2
      ];
    }

    const lowerLoc = location.toLowerCase();
    const key = Object.keys(LOCATION_COORDINATES).find(k => lowerLoc.includes(k));
    return LOCATION_COORDINATES[key] || LOCATION_COORDINATES['luanda'];
  };

  // Deriva os dados mais recentes do histórico para garantir que a UI está sempre atualizada.
  const sortedHistory = trackingInfo?.history?.length > 0 
    ? [...trackingInfo.history].sort((a, b) => {
        const dateA = a.date ? new Date(a.date).getTime() : 0;
        const dateB = b.date ? new Date(b.date).getTime() : 0;
        return (isNaN(dateA) ? 0 : dateA) - (isNaN(dateB) ? 0 : dateB);
      })
    : [];

  const latestHistoryEntry = sortedHistory.length > 0
    ? sortedHistory[sortedHistory.length - 1]
    : null;

  // Usa os dados do último evento do histórico, ou faz fallback para os dados principais do envio.
  const displayLocation = latestHistoryEntry?.location || trackingInfo?.currentLocation;
  const displayStatus = latestHistoryEntry?.status || trackingInfo?.status;
  const displayLastUpdate = latestHistoryEntry?.date || trackingInfo?.lastUpdate;
  const statusLower = displayStatus ? displayStatus.toLowerCase() : '';

  // Lógica inteligente para determinar a localização no mapa com base no status e rota
  const getMapLocation = () => {
    if (!displayStatus) return displayLocation;
    
    const status = statusLower;
    
    // 1. Chegou ao Destino / Entregue -> Foca no Destino
    if (status.includes('chegou ao destino') || status.includes('entregue') || status.includes('disponível') || status.includes('arrived') || status.includes('delivered')) {
      return trackingInfo?.to || displayLocation;
    }
    
    // 2. Em Trânsito -> Foca no Meio do Caminho (Oceano)
    if (status.includes('trânsito') || status.includes('transito') || status.includes('in_transit') || status.includes('transit')) {
      return 'midpoint';
    }

    // 3. Pendente / Processamento -> Foca na Origem
    if (status.includes('pendente') || status.includes('recolhido') || status.includes('processamento') || status.includes('pending') || status.includes('collected') || status.includes('processing')) {
      return trackingInfo?.from || displayLocation;
    }

    return displayLocation;
  };

  const mapLocation = getMapLocation();

  // Calcular rotação do avião com base na rota (Origem -> Destino)
  const fromCoords = getCoordinates(trackingInfo?.from || 'luanda');
  const toCoords = getCoordinates(trackingInfo?.to || 'lisboa');
  
  let planeRotation = 0;
  if (statusLower.includes('trânsito') || statusLower.includes('transito') || statusLower.includes('in_transit')) {
     // Calcula o ângulo da rota
     planeRotation = getBearing(fromCoords[0], fromCoords[1], toCoords[0], toCoords[1]);
  }

  // Ícone de avião customizado usando HTML/CSS
  const airplaneIcon = useMemo(() => new L.DivIcon({
    className: '', // Define como string vazia para evitar estilos padrão do Leaflet que possam interferir.
    html: `<div style="transform: rotate(${planeRotation}deg); width: 64px; height: 64px; display: flex; align-items: center; justify-content: center;">
      <div class="animate-pulse" style="background-color: white; border-radius: 50%; border: 3px solid #1E40AF; width: 56px; height: 56px; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 10px rgba(0,0,0,0.3);">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="32" height="32" style="fill: #1E40AF;">
          <path d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z"/>
        </svg>
      </div>
    </div>`,
    iconSize: [64, 64],
    iconAnchor: [32, 32],
  }), [planeRotation]);

  // Coordenadas para a linha da rota
  const routePath = useMemo(() => trackingInfo ? [
    getCoordinates(trackingInfo.from),
    getCoordinates(trackingInfo.to)
  ] : [], [trackingInfo]);

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
            <div className="mb-8 h-80 rounded-xl overflow-hidden shadow-lg border border-gray-200 relative z-10">
               <MapContainer 
                 center={getCoordinates(mapLocation)} 
                 zoom={5} 
                 style={{ height: '100%', width: '100%' }}
                 scrollWheelZoom={false}
               >
                 <TileLayer
                   attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                   url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                 />
                 
                 <MapBoundsHandler route={routePath} center={getCoordinates(mapLocation)} />

                 {/* Linha da Rota */}
                 {routePath.length > 0 && (
                   <Polyline positions={routePath} color="#1D4ED8" dashArray="10, 10" weight={3} opacity={0.7} />
                 )}

                 {/* Marcador: Avião em trânsito ou pino no local */}
                 {(statusLower.includes('trânsito') || statusLower.includes('transito') || statusLower.includes('in_transit') || statusLower.includes('transit')) ? (
                   <Marker position={getCoordinates('midpoint')} icon={airplaneIcon}>
                     <Popup>Em Trânsito</Popup>
                   </Marker>
                 ) : (
                   <Marker position={getCoordinates(mapLocation)} />
                 )}
               </MapContainer>
            </div>

            <div className="mb-8 bg-gray-50 p-4 rounded-lg">
              <p className="text-lg mb-2">
                <strong>Estado Atual:</strong>
                <span className={`ml-2 px-3 py-1 rounded-full text-sm font-bold ${
                  displayStatus === 'Entregue' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
                }`}>
                  {displayStatus}
                </span>
              </p>
              <p className="text-gray-600">
                <strong>Rota:</strong> {trackingInfo.from || 'Luanda'} ➝ {trackingInfo.to || 'Lisboa'}
              </p>
              <p className="text-gray-500 text-sm mt-2">Última atualização: {new Date(displayLastUpdate).toLocaleString('pt-PT')}</p>
            </div>

            <div>
              <h3 className="font-bold text-xl mb-4 text-gray-700">Histórico de Localizações</h3>
              <ul className="steps steps-vertical">
                {[...trackingInfo.history]
                  .sort((a, b) => {
                    const dateA = a.date ? new Date(a.date).getTime() : 0;
                    const dateB = b.date ? new Date(b.date).getTime() : 0;
                    return (isNaN(dateA) ? 0 : dateA) - (isNaN(dateB) ? 0 : dateB);
                  })
                  .map((item, index) => (
                  <li key={index} className="step step-primary">
                    <div className="flex flex-col items-start text-left ml-2">
                      <span className="font-semibold">{item.location || 'Localização não registada'}</span>
                      <span className="text-sm text-gray-500">
                        {item.date && !isNaN(new Date(item.date).getTime()) ? new Date(item.date).toLocaleString('pt-PT', {
                          day: '2-digit', month: '2-digit', year: 'numeric',
                          hour: '2-digit', minute: '2-digit'
                        }) : <span className="text-orange-500 text-xs">Data pendente</span>}
                      </span>
                      <span className="text-sm font-bold text-flyfast-blue">{item.status || 'Atualização'}</span>
                      {item.description && (
                        <span className="text-xs text-gray-400 mt-1 italic">{item.description}</span>
                      )}
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