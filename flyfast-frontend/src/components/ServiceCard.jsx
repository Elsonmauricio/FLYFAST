import React from 'react';
import { Link } from 'react-router-dom';

const ServiceCard = ({ service }) => {
  const getLink = (title) => {
    switch(title) {
      case 'Envios Express': return '/routes';
      case 'Rastreamento em Tempo Real': return '/tracking';
      case 'Personal Shopper': return '/personal-shopper';
      case 'Loja Oficial': return '/shop';
      default: return '/';
    }
  };

  return (
    <div className="card hover:border-flyfast-blue border-2 border-transparent">
      <div className={`text-4xl mb-4 ${service.iconColor}`}>
        {service.icon}
      </div>
      <h3 className="text-xl font-bold text-flyfast-blue mb-3">
        {service.title}
      </h3>
      <p className="text-gray-600 mb-6">
        {service.description}
      </p>
      <Link 
        to={getLink(service.title)}
        className="inline-block text-flyfast-blue font-semibold hover:text-blue-900 transition flex items-center"
      >
        Saiba mais 
        <span className="ml-2">→</span>
      </Link>
    </div>
  );
};

export default ServiceCard;