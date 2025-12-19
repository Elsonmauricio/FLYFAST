import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useLogout } from '../hooks/useAuthHooks';
import { useShipments, useOrders } from '../hooks/useAccountData';
import { FaSpinner, FaExclamationCircle } from 'react-icons/fa';

const Account = () => {
  const [activeTab, setActiveTab] = useState('profile');
  const { authState } = useAuth();
  const { performLogout } = useLogout();
  const userData = authState.user || {};

  const { shipments, isLoading: isLoadingShipments, error: shipmentsError } = useShipments();
  const { orders, isLoading: isLoadingOrders, error: ordersError } = useOrders();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Account Header */}
      <div className="bg-gradient-to-r from-flyfast-blue to-blue-800 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-4 mb-6 md:mb-0">
              <div className="w-20 h-20 bg-flyfast-yellow rounded-full flex items-center justify-center">
                <span className="text-flyfast-blue text-3xl font-bold capitalize">
                  {userData.name ? userData.name.charAt(0) : '?'}
                </span>
              </div>
              <div>
                <h1 className="text-3xl font-bold capitalize">{userData.name || 'Utilizador'}</h1>
                <p className="text-flyfast-yellow">
                  Cliente FLYFAST desde {userData.memberSince || '2024'}
                </p>
              </div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-flyfast-yellow mb-2">
                {userData.loyaltyPoints || 0} pts
              </div>
              <p className="text-sm">Pontos de Fidelidade</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <div className="lg:w-1/4">
            <div className="card sticky top-24">
              <nav className="space-y-2">
                {[
                  { id: 'profile', label: 'Perfil', icon: '👤' },
                  { id: 'shipments', label: 'Meus Envios', icon: '📦' },
                  { id: 'orders', label: 'Meus Pedidos', icon: '🛍️' },
                  { id: 'personal-shopper', label: 'Personal Shopper', icon: '👔' },
                  { id: 'addresses', label: 'Moradas', icon: '📍' },
                  { id: 'notifications', label: 'Notificações', icon: '🔔' },
                  { id: 'settings', label: 'Definições', icon: '⚙️' }
                ].map(item => (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`w-full text-left flex items-center space-x-3 p-3 rounded-lg transition ${
                      activeTab === item.id
                        ? 'bg-flyfast-blue text-white'
                        : 'hover:bg-gray-100'
                    }`}
                  >
                    <span>{item.icon}</span>
                    <span>{item.label}</span>
                  </button>
                ))}
                <button 
                  onClick={performLogout}
                  className="w-full text-left flex items-center space-x-3 p-3 rounded-lg text-red-600 hover:bg-red-50 mt-8"
                >
                  <span>🚪</span>
                  <span>Sair</span>
                </button>
              </nav>
            </div>
          </div>

          {/* Content Area */}
          <div className="lg:w-3/4">
            {/* Profile Tab */}
            {activeTab === 'profile' && (
              <div className="card">
                <h2 className="text-2xl font-bold text-flyfast-blue mb-6">
                  Meu Perfil
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-gray-700 font-medium mb-2">
                      Nome Completo
                    </label>
                    <input
                      type="text"
                      defaultValue={userData.name}
                      className="input-field"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 font-medium mb-2">
                      Email
                    </label>
                    <input
                      type="email"
                      defaultValue={userData.email}
                      className="input-field"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 font-medium mb-2">
                      Telemóvel
                    </label>
                    <input
                      type="tel"
                      defaultValue={userData.phone}
                      className="input-field"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 font-medium mb-2">
                      Membro desde
                    </label>
                    <input
                      type="text"
                      defaultValue={userData.memberSince}
                      className="input-field bg-gray-50"
                      disabled
                    />
                  </div>
                </div>
                <div className="mt-8">
                  <button className="btn-primary">
                    Guardar Alterações
                  </button>
                </div>
              </div>
            )}

            {/* Shipments Tab */}
            {activeTab === 'shipments' && (
              <div>
                <h2 className="text-2xl font-bold text-flyfast-blue mb-6">
                  Meus Envios
                </h2>
                {/* 3. Adicionar estados de loading e erro */}
                {isLoadingShipments && (
                  <div className="flex justify-center items-center p-16">
                    <FaSpinner className="animate-spin text-4xl text-flyfast-blue" />
                  </div>
                )}

                {shipmentsError && (
                  <div className="alert alert-error">
                    <FaExclamationCircle />
                    <span>{shipmentsError}</span>
                  </div>
                )}

                {!isLoadingShipments && !shipmentsError && (
                  <div className="space-y-6">
                    {shipments.length === 0 ? (
                      <p className="text-center text-gray-500 py-8">Ainda não tem envios no seu histórico.</p>
                    ) : (
                      shipments.map(shipment => (
                        <div key={shipment.id} className="card">
                          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4">
                            <div>
                              <h3 className="font-bold text-lg">
                                Envio #{shipment.id}
                              </h3>
                              <p className="text-gray-600">
                                {shipment.from} → {shipment.to} • {new Date(shipment.date).toLocaleDateString('pt-PT')}
                              </p>
                            </div>
                            <span className={`px-3 py-1 rounded-full text-sm font-semibold mt-2 md:mt-0 ${
                              shipment.status === 'Entregue' 
                                ? 'bg-green-100 text-green-800'
                                : 'bg-blue-100 text-blue-800'
                            }`}>
                              {shipment.status}
                            </span>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {/* ... (restante da estrutura do card) ... */}
                          </div>
                          <div className="mt-4 flex space-x-4">
                            <button className="text-flyfast-blue font-semibold hover:text-blue-900">
                              Rastrear
                            </button>
                            {/* ... */}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Orders Tab */}
            {activeTab === 'orders' && (
              <div>
                <h2 className="text-2xl font-bold text-flyfast-blue mb-6">
                  Meus Pedidos
                </h2>
                {isLoadingOrders && (
                  <div className="flex justify-center items-center p-16">
                    <FaSpinner className="animate-spin text-4xl text-flyfast-blue" />
                  </div>
                )}
                {ordersError && (
                  <div className="alert alert-error">
                    <FaExclamationCircle />
                    <span>{ordersError}</span>
                  </div>
                )}
                {!isLoadingOrders && !ordersError && (
                  orders.length === 0 ? (
                    <p className="text-center text-gray-500 py-8">Ainda não tem pedidos na nossa loja.</p>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="bg-gray-100">
                            <th className="p-4 text-left">Nº Pedido</th>
                            <th className="p-4 text-left">Data</th>
                            <th className="p-4 text-left">Produto/Serviço</th>
                            <th className="p-4 text-left">Status</th>
                            <th className="p-4 text-left">Total</th>
                            <th className="p-4 text-left">Ações</th>
                          </tr>
                        </thead>
                        <tbody>
                          {orders.map(order => (
                            <tr key={order.id} className="border-b hover:bg-gray-50">
                              <td className="p-4 font-semibold">{order.id}</td>
                              <td className="p-4">{new Date(order.date).toLocaleDateString('pt-PT')}</td>
                              <td className="p-4 truncate max-w-xs">{order.product}</td>
                              <td className="p-4">
                                <span className={`px-2 py-1 rounded text-sm ${
                                  order.status === 'Enviado'
                                    ? 'bg-green-100 text-green-800'
                                    : 'bg-yellow-100 text-yellow-800'
                                }`}>
                                  {order.status}
                                </span>
                              </td>
                              <td className="p-4 font-bold">{order.total}</td>
                              <td className="p-4">
                                <a href={order.url} target="_blank" rel="noopener noreferrer" className="text-flyfast-blue hover:text-blue-900">Ver</a>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )
                )}
              </div>
            )}

            {/* Personal Shopper Tab */}
            {activeTab === 'personal-shopper' && (
              <div>
                <h2 className="text-2xl font-bold text-flyfast-blue mb-6">
                  Meus Pedidos Personal Shopper
                </h2>
                <div className="card">
                  <p className="text-gray-600 mb-6">
                    Aqui pode ver e gerir todos os seus pedidos de Personal Shopper.
                  </p>
                  <button className="btn-primary">
                    👔 Novo Pedido Personal Shopper
                  </button>
                </div>
              </div>
            )}

            {/* Notifications Tab */}
            {activeTab === 'notifications' && (
              <div>
                <h2 className="text-2xl font-bold text-flyfast-blue mb-6">
                  Notificações
                </h2>
                <div className="space-y-4">
                  {[
                    {
                      id: 1,
                      title: 'Envio em andamento',
                      message: 'Seu envio LDA-LIS-2025-045 está em trânsito para Lisboa',
                      date: 'Hoje, 10:30',
                      read: false
                    },
                    {
                      id: 2,
                      title: 'Promoção especial',
                      message: '20% de desconto em todos os envios esta semana',
                      date: 'Ontem, 15:45',
                      read: true
                    },
                    {
                      id: 3,
                      title: 'Pedido confirmado',
                      message: 'Seu pedido PS-2025-001 foi confirmado pela equipa',
                      date: '12 Jan, 09:20',
                      read: true
                    }
                  ].map(notification => (
                    <div 
                      key={notification.id} 
                      className={`card ${!notification.read ? 'border-l-4 border-flyfast-blue' : ''}`}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-bold">{notification.title}</h3>
                          <p className="text-gray-600 mt-1">{notification.message}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-gray-500">{notification.date}</p>
                          {!notification.read && (
                            <span className="inline-block w-2 h-2 bg-flyfast-blue rounded-full mt-2"></span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Account;