import React, { createContext, useState, useContext, useCallback } from 'react';

const AlertContext = createContext(null);

export const AlertProvider = ({ children }) => {
  const [alert, setAlert] = useState(null);

  const showAlert = useCallback((type, message) => {
    setAlert({ type, message });
    
    // Fecha automaticamente após 5 segundos (exceto se for erro crítico, opcional)
    setTimeout(() => {
      setAlert(null);
    }, 5000);
  }, []);

  const hideAlert = useCallback(() => {
    setAlert(null);
  }, []);

  return (
    <AlertContext.Provider value={{ alert, showAlert, hideAlert }}>
      {children}
    </AlertContext.Provider>
  );
};

export const useAlert = () => {
  return useContext(AlertContext);
};