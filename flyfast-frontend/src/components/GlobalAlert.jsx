import React, { useEffect, useState } from 'react';
import { useAlert } from '../contexts/AlertContext';
import { FaCheckCircle, FaExclamationCircle, FaInfoCircle, FaTimes } from 'react-icons/fa';

const GlobalAlert = () => {
  const { alert, hideAlert } = useAlert();
  const [isVisible, setIsVisible] = useState(false);
  const [displayAlert, setDisplayAlert] = useState(null);

  useEffect(() => {
    if (alert) {
      setDisplayAlert(alert);
      // Pequeno delay para permitir a animação de entrada
      const timer = setTimeout(() => setIsVisible(true), 10);
      return () => clearTimeout(timer);
    } else {
      setIsVisible(false);
      // Aguarda a animação de saída (300ms) antes de remover do DOM
      const timer = setTimeout(() => setDisplayAlert(null), 300);
      return () => clearTimeout(timer);
    }
  }, [alert]);

  if (!displayAlert) return null;

  const { type, message } = displayAlert;

  const styles = {
    success: 'bg-green-100 border-green-500 text-green-700',
    error: 'bg-red-100 border-red-500 text-red-700',
    info: 'bg-blue-100 border-blue-500 text-blue-700'
  };

  const icons = {
    success: <FaCheckCircle className="text-xl" />,
    error: <FaExclamationCircle className="text-xl" />,
    info: <FaInfoCircle className="text-xl" />
  };

  return (
    <div className={`fixed top-5 right-5 z-50 flex items-center p-4 mb-4 border-l-4 rounded shadow-lg 
      ${styles[type] || styles.info} 
      transition-all duration-300 ease-in-out transform 
      ${isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'} 
      max-w-md`}>
      <div className="mr-3">
        {icons[type] || icons.info}
      </div>
      <div className="flex-1 mr-4">
        <p className="font-bold capitalize">{type === 'error' ? 'Erro' : type === 'success' ? 'Sucesso' : 'Info'}</p>
        <p className="text-sm">{message}</p>
      </div>
      <button onClick={hideAlert} className="text-current opacity-70 hover:opacity-100 transition-opacity">
        <FaTimes />
      </button>
    </div>
  );
};

export default GlobalAlert;