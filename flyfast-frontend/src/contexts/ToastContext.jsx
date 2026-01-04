import React, { createContext, useContext, useState, useCallback } from 'react';
import { FaTimes, FaInfoCircle, FaCheckCircle, FaExclamationTriangle } from 'react-icons/fa';

const ToastContext = createContext();

export const useToast = () => useContext(ToastContext);

const ToastNotification = ({ message, type, onClose }) => {
  const icons = {
    success: <FaCheckCircle />,
    error: <FaExclamationTriangle />,
    info: <FaInfoCircle />,
  };

  const colors = {
    success: 'bg-green-500',
    error: 'bg-red-500',
    info: 'bg-blue-500',
  };

  React.useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 5000); // Desaparece após 5 segundos

    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className={`flex items-center text-white p-4 rounded-lg shadow-lg animate-fade-in-right ${colors[type] || 'bg-gray-800'}`}>
      <div className="mr-3 text-xl">{icons[type]}</div>
      <div className="flex-1">{message}</div>
      <button onClick={onClose} className="ml-4 text-white/70 hover:text-white">
        <FaTimes />
      </button>
    </div>
  );
};

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'info') => {
    const id = Date.now() + Math.random();
    setToasts(prevToasts => [...prevToasts, { id, message, type }]);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts(prevToasts => prevToasts.filter(toast => toast.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}
      <div className="fixed top-5 right-5 z-[100] space-y-3 w-80">
        {toasts.map(toast => (
          <ToastNotification
            key={toast.id}
            message={toast.message}
            type={toast.type}
            onClose={() => removeToast(toast.id)}
          />
        ))}
      </div>
    </ToastContext.Provider>
  );
};