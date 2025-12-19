import React from 'react';
import { formatDate, getFlag } from './formatting';

const RouteCard = ({ route }) => {
  return (
    <div className="card hover:border-flyfast-blue border-2 border-transparent">
      <div className="flex justify-between items-start mb-4">
        <div>
          <div className="flex items-center space-x-2 mb-1">
            <span className="text-2xl" aria-hidden="true">{getFlag(route.from)}</span>
            <h3 className="text-xl font-bold text-flyfast-blue">
              {route.from} → {route.to}
            </h3>
            <span className="text-2xl" aria-hidden="true">{getFlag(route.to)}</span>
          </div>
          <p className="text-gray-600">
            {formatDate(route.date)} • {route.time}
          </p>
        </div>
        <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-semibold">
          {route.status}
        </span>
      </div>

      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-gray-600">Lugares disponíveis:</span>
          <span className="font-bold text-lg">{route.available}</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-flyfast-yellow h-2 rounded-full"
            style={{ width: `${(route.available / (route.totalAvailable || 20)) * 100}%` }}
          ></div>
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Tempo estimado:</span>
          <span className="font-semibold">{route.estimatedTime || '6-8 horas'}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Tipo de carga:</span>
          <span className="font-semibold">{route.cargoType || 'Encomendas & Documentos'}</span>
        </div>
      </div>

      <button 
        className="w-full mt-6 btn-primary"
        aria-label={`Reservar envio para a rota de ${route.from} para ${route.to} na data ${formatDate(route.date)}`}
      >
        <span aria-hidden="true">📋 </span>Reservar Envio
      </button>
    </div>
  );
};

export default RouteCard;