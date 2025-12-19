import React, { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useNotifications } from '../hooks/useNotifications';
import { FaCheckCircle } from 'react-icons/fa';

const OrderConfirmation = () => {
  const { orderId } = useParams();
  const { triggerNotification } = useNotifications();

  // Aciona a notificação de "nova encomenda" quando o componente é montado
  useEffect(() => {
    if (orderId) {
      triggerNotification({
        type: 'NEW_ORDER_CONFIRMATION',
        data: { orderId },
      });
    }
  }, [orderId, triggerNotification]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="card max-w-2xl text-center">
        <FaCheckCircle className="text-6xl text-green-500 mx-auto mb-6" />
        <h1 className="text-3xl font-bold text-flyfast-blue mb-4">
          Obrigado pela sua Compra!
        </h1>
        <p className="text-gray-600 mb-2">
          A sua encomenda <span className="font-bold font-mono">#{orderId}</span> foi recebida com sucesso.
        </p>
        <p className="text-gray-600 mb-8">
          Enviámos um email de confirmação com todos os detalhes do seu pedido.
        </p>
        <div className="flex justify-center gap-4">
          <Link to="/account?tab=orders" className="btn-secondary">
            Ver Meus Pedidos
          </Link>
          <Link to="/shop" className="btn-primary">
            Continuar a Comprar
          </Link>
        </div>
      </div>
    </div>
  );
};

export default OrderConfirmation;