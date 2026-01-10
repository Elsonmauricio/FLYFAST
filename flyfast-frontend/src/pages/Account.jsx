import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useLogout } from '../hooks/useAuthHooks';
import BookingModal from '../components/BookingModal';
import { useShipments, useOrders } from '../hooks/useAccountData';
import { useNotifications } from '../hooks/useNotifications';
import { FaSpinner, FaExclamationCircle, FaUserShield, FaCopy, FaLock, FaBell, FaSave, FaTrash, FaPlus, FaMapMarkerAlt } from 'react-icons/fa';
import { auth } from '../lib/firebase';
import { updatePassword, EmailAuthProvider, reauthenticateWithCredential } from 'firebase/auth';

const Account = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('profile');
  const { authState } = useAuth();
  const { performLogout } = useLogout();
  const userData = authState.user || {};

  const { shipments, isLoading: isLoadingShipments, error: shipmentsError } = useShipments();
  const { orders, isLoading: isLoadingOrders, error: ordersError } = useOrders();
  const { notifications, isLoading: isLoadingNotifications, error: notificationsError, fetchNotifications } = useNotifications();

  // Estados para Personal Shopper
  const [personalShopperRequests, setPersonalShopperRequests] = useState([]);
  const [isLoadingPersonalShopper, setIsLoadingPersonalShopper] = useState(false);
  const [personalShopperError, setPersonalShopperError] = useState(null);

  // Estados para Rotas
  const [routes, setRoutes] = useState([]);
  const [isLoadingRoutes, setIsLoadingRoutes] = useState(false);

  // Estados para o Modal de Reserva
  const [selectedRoute, setSelectedRoute] = useState(null);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [isBookingLoading, setIsBookingLoading] = useState(false);

  // Estados para Edição de Perfil e Definições
  const [profileForm, setProfileForm] = useState({
    name: userData.name || '',
    phone: userData.phone || '',
  });
  const [preferences, setPreferences] = useState(userData.preferences || {
    emailUpdates: true,
    whatsappUpdates: true
  });
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [isSaving, setIsSaving] = useState(false);

  // Estados para Gestão de Moradas
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [newAddress, setNewAddress] = useState({
    label: 'Casa',
    street: '',
    city: '',
    zip: '',
    country: 'Angola'
  });

  const menuItems = [
    { id: 'profile', label: 'Perfil', icon: '👤' },
    ...(userData.role !== 'admin' ? [
      { id: 'shipments', label: 'Meus Envios', icon: '📦' },
      { id: 'orders', label: 'Meus Pedidos', icon: '🛍️' },
      { id: 'personal-shopper', label: 'Personal Shopper', icon: '👔' },
      { id: 'routes', label: 'Rotas Disponíveis', icon: '✈️' },
      { id: 'addresses', label: 'Moradas', icon: '📍' },
    ] : []),
    { id: 'notifications', label: 'Notificações', icon: '🔔' },
    { id: 'settings', label: 'Definições', icon: '⚙️' }
  ];

  // Atualiza o formulário quando os dados do utilizador carregam
  useEffect(() => {
    if (userData) {
      setProfileForm({ name: userData.name || '', phone: userData.phone || '' });
      if (userData.preferences) setPreferences(userData.preferences);
    }
  }, [userData]);

  useEffect(() => {
    if (activeTab === 'notifications') {
      fetchNotifications();
    }
  }, [activeTab, fetchNotifications]);

  // Fetch de pedidos Personal Shopper quando a aba é ativada
  useEffect(() => {
    if (activeTab === 'personal-shopper' && authState.token) {
      const fetchRequests = async () => {
        setIsLoadingPersonalShopper(true);
        try {
          const response = await fetch('/api/personal-shopper/my-requests', {
            headers: { 'Authorization': `Bearer ${authState.token}` }
          });
          if (response.ok) {
            const data = await response.json();
            setPersonalShopperRequests(data);
          } else {
            setPersonalShopperError('Não foi possível carregar o histórico de pedidos.');
          }
        } catch (err) {
          setPersonalShopperError('Erro ao carregar os seus pedidos.');
        } finally {
          setIsLoadingPersonalShopper(false);
        }
      };
      fetchRequests();
    }
  }, [activeTab, authState.token]);

  // Fetch de rotas quando a aba é ativada
  useEffect(() => {
    if (activeTab === 'routes') {
      const fetchRoutes = async () => {
        setIsLoadingRoutes(true);
        try {
          const response = await fetch('/api/schedules');
          if (response.ok) {
            const data = await response.json();
            setRoutes(data);
          }
        } catch (err) {
          console.error('Erro ao carregar rotas');
        } finally {
          setIsLoadingRoutes(false);
        }
      };
      fetchRoutes();
    }
  }, [activeTab]);

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    alert(`Código de rastreio ${text} copiado!`);
  };

  const handleMarkAllAsRead = async () => {
    try {
      await fetch('/api/notifications/read-all', {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${authState.token}` }
      });
      fetchNotifications(); // Recarrega a lista para atualizar o UI
    } catch (err) {
      console.error('Erro ao marcar notificações como lidas', err);
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const response = await fetch('/api/users/me', {
        method: 'PUT',
        headers: { 
          'Authorization': `Bearer ${authState.token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(profileForm)
      });

      if (response.ok) {
        alert('Perfil atualizado com sucesso!');
      } else {
        alert('Erro ao atualizar perfil.');
      }
    } catch (error) {
      alert('Erro de conexão.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleUpdatePreferences = async () => {
    setIsSaving(true);
    try {
      const response = await fetch('/api/users/me', {
        method: 'PUT',
        headers: { 
          'Authorization': `Bearer ${authState.token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ preferences })
      });

      if (response.ok) {
        alert('Preferências guardadas com sucesso!');
      }
    } catch (error) {
      alert('Erro ao guardar preferências.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      return alert('As novas palavras-passe não coincidem.');
    }

    setIsSaving(true);
    try {
      const user = auth.currentUser;
      const credential = EmailAuthProvider.credential(user.email, passwordForm.currentPassword);
      await reauthenticateWithCredential(user, credential);
      await updatePassword(user, passwordForm.newPassword);
      alert('Palavra-passe alterada com sucesso!');
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error) {
      alert('Erro ao alterar palavra-passe: ' + error.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleOpenBooking = (route) => {
    setSelectedRoute(route);
    setIsBookingModalOpen(true);
  };

  const handleBookingSubmit = async (bookingData) => {
    setIsBookingLoading(true);
    try {
      const response = await fetch('/api/shipments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authState.token}`
        },
        body: JSON.stringify(bookingData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erro ao criar reserva');
      }

      alert('Reserva efetuada com sucesso! Verifique o seu email.');
      setIsBookingModalOpen(false);
    } catch (err) {
      alert(err.message);
    } finally {
      setIsBookingLoading(false);
    }
  };

  const handleAddAddress = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const currentAddresses = userData.addresses || [];
      const updatedAddresses = [...currentAddresses, newAddress];
      
      const response = await fetch('/api/users/me', {
        method: 'PUT',
        headers: { 
          'Authorization': `Bearer ${authState.token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ addresses: updatedAddresses })
      });

      if (response.ok) {
        alert('Morada adicionada com sucesso! A página será recarregada para atualizar os dados.');
        window.location.reload();
      } else {
        alert('Erro ao adicionar morada.');
      }
    } catch (error) {
      alert('Erro de conexão.');
    } finally {
      setIsSaving(false);
      setIsAddressModalOpen(false);
    }
  };

  const handleDeleteAddress = async (indexToDelete) => {
    if (!window.confirm('Tem a certeza que deseja remover esta morada?')) return;
    
    const currentAddresses = userData.addresses || [];
    const updatedAddresses = currentAddresses.filter((_, index) => index !== indexToDelete);
    
    try {
      const response = await fetch('/api/users/me', {
        method: 'PUT',
        headers: { 
          'Authorization': `Bearer ${authState.token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ addresses: updatedAddresses })
      });

      if (response.ok) {
        alert('Morada removida com sucesso!');
        window.location.reload();
      } else {
        alert('Erro ao remover morada.');
      }
    } catch (error) {
      alert('Erro de conexão.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Account Header */}
      <div className="bg-gradient-to-r from-flyfast-blue to-blue-800 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="mb-6">
            <Link to="/" className="inline-flex items-center gap-2 text-white/80 hover:text-white transition-colors">
              <img src="/logo.png" alt="Flyfast" className="w-6 h-6 rounded-full border border-white/50 object-cover" />
              <span className="font-medium text-sm">Voltar à Home</span>
            </Link>
          </div>
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
              {userData.role === 'admin' && (
                <Link to="/admin" className="mt-4 inline-flex items-center bg-white/20 hover:bg-white/30 border border-white/40 text-white px-4 py-2 rounded-lg font-bold transition">
                  <FaUserShield className="mr-2" />
                  Painel Admin
                </Link>
              )}
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
                {menuItems.map(item => (
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
                <form onSubmit={handleUpdateProfile}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-gray-700 font-medium mb-2">
                        Nome Completo
                      </label>
                      <input
                        type="text"
                        value={profileForm.name}
                        onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                        className="input-field"
                      />
                    </div>
                    <div>
                      <label className="block text-gray-700 font-medium mb-2">
                        Email
                      </label>
                      <input
                        type="email"
                        value={userData.email || ''}
                        className="input-field bg-gray-100 cursor-not-allowed"
                        disabled
                      />
                    </div>
                    <div>
                      <label className="block text-gray-700 font-medium mb-2">
                        Telemóvel
                      </label>
                      <input
                        type="tel"
                        value={profileForm.phone}
                        onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
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
                        className="input-field bg-gray-100 cursor-not-allowed"
                        disabled
                      />
                    </div>
                  </div>
                  <div className="mt-8">
                    <button type="submit" disabled={isSaving} className="btn-primary flex items-center justify-center gap-2">
                      {isSaving && <FaSpinner className="animate-spin" />}
                      <span>Guardar Alterações</span>
                    </button>
                  </div>
                </form>
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
                              <h3 className="font-bold text-lg flex items-center gap-2">
                                Envio #{shipment.id}
                                <button 
                                  onClick={() => copyToClipboard(shipment.id)}
                                  className="text-gray-400 hover:text-flyfast-blue transition-colors text-base"
                                  title="Copiar código de rastreio"
                                >
                                  <FaCopy />
                                </button>
                              </h3>
                              <p className="text-gray-600">
                                {shipment.from} → {shipment.to} • {new Date(shipment.date).toLocaleDateString('pt-PT')}
                              </p>
                              {shipment.currentLocation && (
                                <p className="text-sm text-blue-600 mt-1 font-medium">
                                  📍 {shipment.currentLocation}
                                </p>
                              )}
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
                            <div className="bg-gray-50 p-3 rounded">
                              <p className="text-xs text-gray-500 uppercase font-bold">Peso / Dimensões</p>
                              <p className="font-semibold">{shipment.weight ? `${shipment.weight} kg` : 'N/D'}</p>
                            </div>
                            <div className="bg-gray-50 p-3 rounded">
                              <p className="text-xs text-gray-500 uppercase font-bold">Custo Estimado</p>
                              <p className="font-semibold text-flyfast-blue">{shipment.cost ? `${shipment.cost} AOA` : 'A calcular'}</p>
                            </div>
                            <div className="bg-gray-50 p-3 rounded">
                              <p className="text-xs text-gray-500 uppercase font-bold">Destinatário</p>
                              <p className="font-semibold truncate">{shipment.receiverName || userData.name || 'Eu'}</p>
                            </div>
                          </div>
                          <div className="mt-4 flex space-x-4">
                            <Link to={`/tracking/${shipment.id}`} className="text-flyfast-blue font-semibold hover:text-blue-900">
                              Rastrear
                            </Link>
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
                
                <div className="mb-6">
                  <button onClick={() => navigate('/personal-shopper')} className="btn-primary w-full md:w-auto">
                    👔 Novo Pedido Personal Shopper
                  </button>
                </div>

                {isLoadingPersonalShopper && (
                  <div className="flex justify-center items-center p-16">
                    <FaSpinner className="animate-spin text-4xl text-flyfast-blue" />
                  </div>
                )}

                {personalShopperError && (
                  <div className="alert alert-error">
                    <FaExclamationCircle />
                    <span>{personalShopperError}</span>
                  </div>
                )}

                {!isLoadingPersonalShopper && !personalShopperError && (
                  <div className="space-y-4">
                    {personalShopperRequests.length === 0 ? (
                      <div className="card text-center py-8 text-gray-500">
                        Ainda não tem pedidos de Personal Shopper.
                      </div>
                    ) : (
                      personalShopperRequests.map(request => (
                        <div key={request.id} className="card hover:shadow-md transition-shadow">
                          <div className="flex flex-col md:flex-row justify-between items-start gap-4">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <h3 className="font-bold text-lg text-flyfast-blue">{request.productName}</h3>
                                <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                                  {new Date(request.createdAt).toLocaleDateString('pt-PT')}
                                </span>
                              </div>
                              
                              {request.productLink && (
                                <a href={request.productLink} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline block mb-2 truncate max-w-md">
                                  🔗 {request.productLink}
                                </a>
                              )}
                              
                              <p className="text-gray-600 text-sm mb-2 line-clamp-2">
                                {request.details || 'Sem detalhes adicionais.'}
                              </p>

                              <div className="flex flex-wrap gap-4 text-sm mt-3">
                                <div className="bg-gray-50 px-3 py-1 rounded border">
                                  <span className="font-semibold text-gray-500">Orçamento:</span> {request.budget || 'N/A'}
                                </div>
                                <div className="bg-gray-50 px-3 py-1 rounded border">
                                  <span className="font-semibold text-gray-500">País:</span> {request.deliveryCountry || 'Angola'}
                                </div>
                              </div>
                            </div>

                            <div className="flex flex-col items-end min-w-[140px]">
                              <span className={`px-3 py-1 rounded-full text-sm font-bold text-center w-full mb-2 ${
                                request.status === 'completed' ? 'bg-green-100 text-green-800' :
                                request.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                                request.status === 'purchased' ? 'bg-purple-100 text-purple-800' :
                                request.status === 'processing' ? 'bg-blue-100 text-blue-800' :
                                'bg-yellow-100 text-yellow-800'
                              }`}>
                                {request.status === 'pending' ? 'Pendente' : 
                                 request.status === 'processing' ? 'Em Processamento' :
                                 request.status === 'purchased' ? 'Comprado' :
                                 request.status === 'completed' ? 'Concluído' : 
                                 request.status === 'cancelled' ? 'Cancelado' : request.status}
                              </span>
                              {request.id && <p className="text-xs text-gray-400">ID: {request.id.slice(0, 8)}...</p>}
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Routes Tab */}
            {activeTab === 'routes' && (
              <div>
                <h2 className="text-2xl font-bold text-flyfast-blue mb-6">
                  Rotas e Envios Disponíveis
                </h2>
                {isLoadingRoutes && (
                  <div className="flex justify-center items-center p-16">
                    <FaSpinner className="animate-spin text-4xl text-flyfast-blue" />
                  </div>
                )}
                {!isLoadingRoutes && (
                  <div className="space-y-4">
                    {routes.length === 0 ? (
                      <p className="text-center text-gray-500 py-8">Não há rotas agendadas no momento.</p>
                    ) : (
                      routes.map(route => (
                        <div key={route.id} className="card flex flex-col md:flex-row justify-between items-center gap-4">
                           <div>
                              <div className="flex items-center gap-2 mb-1">
                                <span className="font-bold text-lg">{route.from}</span>
                                <span className="text-gray-400">→</span>
                                <span className="font-bold text-lg">{route.to}</span>
                              </div>
                              <p className="text-gray-600 text-sm">
                                {new Date(route.date).toLocaleDateString('pt-PT')} • {route.departureTime || 'Horário a definir'}
                              </p>
                           </div>
                           <div className="text-right">
                              <p className="text-flyfast-blue font-bold text-xl">{route.price}</p>
                              <p className="text-xs text-gray-500">por Kg</p>
                           </div>
                           <button 
                             onClick={() => handleOpenBooking(route)}
                             className="btn-primary py-2 px-4 text-sm"
                           >
                             Reservar
                           </button>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Addresses Tab */}
            {activeTab === 'addresses' && (
              <div>
                <h2 className="text-2xl font-bold text-flyfast-blue mb-6">
                  Minhas Moradas
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Lista de Moradas Existentes */}
                  {userData.addresses && userData.addresses.map((addr, index) => (
                    <div key={index} className="card relative border border-gray-200 hover:shadow-md transition">
                        <button 
                          onClick={() => handleDeleteAddress(index)} 
                          className="absolute top-4 right-4 text-red-400 hover:text-red-600 p-1"
                          title="Remover morada"
                        >
                          <FaTrash />
                        </button>
                        <div className="flex items-start gap-3">
                          <FaMapMarkerAlt className="text-flyfast-blue text-xl mt-1" />
                          <div>
                            <h3 className="font-bold text-lg">{addr.label || 'Morada'}</h3>
                            <p className="text-gray-600">{addr.street}</p>
                            <p className="text-gray-600">{addr.city}, {addr.zip}</p>
                            <p className="text-gray-500 text-sm mt-1">{addr.country}</p>
                          </div>
                        </div>
                    </div>
                  ))}

                  {/* Botão Adicionar Nova */}
                  <button 
                    onClick={() => setIsAddressModalOpen(true)}
                    className="card border-2 border-dashed border-gray-300 flex flex-col items-center justify-center cursor-pointer hover:border-flyfast-blue hover:bg-blue-50 transition min-h-[160px]"
                  >
                      <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-3 text-flyfast-blue">
                        <FaPlus />
                      </div>
                      <p className="font-bold text-gray-600">Adicionar Nova Morada</p>
                  </button>
                </div>
              </div>
            )}

            {/* Notifications Tab */}
            {activeTab === 'notifications' && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-flyfast-blue">
                    Notificações
                  </h2>
                  {notifications.some(n => !n.read) && (
                    <button 
                      onClick={handleMarkAllAsRead}
                      className="text-sm text-flyfast-blue hover:underline font-medium"
                    >
                      Marcar todas como lidas
                    </button>
                  )}
                </div>
                {isLoadingNotifications && (
                  <div className="flex justify-center items-center p-16">
                    <FaSpinner className="animate-spin text-4xl text-flyfast-blue" />
                  </div>
                )}
                {notificationsError && (
                  <div className="alert alert-error">
                    <FaExclamationCircle />
                    <span>{notificationsError}</span>
                  </div>
                )}
                {!isLoadingNotifications && !notificationsError && (
                  <div className="space-y-4">
                    {notifications.length === 0 ? (
                      <p className="text-center text-gray-500 py-8">Não tem notificações novas.</p>
                    ) : (
                      notifications.map(notification => (
                    <div 
                      key={notification.id} 
                      className={`card ${!notification.read ? 'border-l-4 border-flyfast-blue' : ''}`}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-bold">{notification.title || 'Nova Notificação'}</h3>
                          <p className="text-gray-600 mt-1">{notification.message}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-gray-500">
                            {notification.createdAt 
                              ? new Date(notification.createdAt).toLocaleDateString('pt-PT') 
                              : notification.date}
                          </p>
                          {!notification.read && (
                            <span className="inline-block w-2 h-2 bg-flyfast-blue rounded-full mt-2"></span>
                          )}
                        </div>
                      </div>
                    </div>
                      ))
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Settings Tab */}
            {activeTab === 'settings' && (
              <div className="space-y-8">
                {/* Security Section */}
                <div className="card">
                  <h2 className="text-xl font-bold text-flyfast-blue mb-6 flex items-center gap-2">
                    <FaLock /> Segurança
                  </h2>
                  <form onSubmit={handleChangePassword} className="space-y-4 max-w-md">
                    <div>
                      <label className="label">Palavra-passe Atual</label>
                      <input 
                        type="password" 
                        className="input-field" 
                        value={passwordForm.currentPassword}
                        onChange={e => setPasswordForm({...passwordForm, currentPassword: e.target.value})}
                        required
                      />
                    </div>
                    <div>
                      <label className="label">Nova Palavra-passe</label>
                      <input 
                        type="password" 
                        className="input-field" 
                        value={passwordForm.newPassword}
                        onChange={e => setPasswordForm({...passwordForm, newPassword: e.target.value})}
                        required
                        minLength={6}
                      />
                    </div>
                    <div>
                      <label className="label">Confirmar Nova Palavra-passe</label>
                      <input 
                        type="password" 
                        className="input-field" 
                        value={passwordForm.confirmPassword}
                        onChange={e => setPasswordForm({...passwordForm, confirmPassword: e.target.value})}
                        required
                      />
                    </div>
                    <button type="submit" disabled={isSaving} className="btn-primary w-full">
                      {isSaving ? 'A alterar...' : 'Alterar Palavra-passe'}
                    </button>
                  </form>
                </div>

                {/* Preferences Section */}
                <div className="card">
                  <h2 className="text-xl font-bold text-flyfast-blue mb-6 flex items-center gap-2">
                    <FaBell /> Preferências de Notificação
                  </h2>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-bold text-gray-800">Notificações por Email</p>
                        <p className="text-sm text-gray-600">Receber atualizações sobre encomendas e promoções.</p>
                      </div>
                      <input 
                        type="checkbox" 
                        className="w-6 h-6 text-flyfast-blue rounded focus:ring-flyfast-blue"
                        checked={preferences.emailUpdates}
                        onChange={e => setPreferences({...preferences, emailUpdates: e.target.checked})}
                      />
                    </div>
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-bold text-gray-800">Notificações por WhatsApp</p>
                        <p className="text-sm text-gray-600">Receber alertas urgentes e atualizações de estado.</p>
                      </div>
                      <input 
                        type="checkbox" 
                        className="w-6 h-6 text-flyfast-blue rounded focus:ring-flyfast-blue"
                        checked={preferences.whatsappUpdates}
                        onChange={e => setPreferences({...preferences, whatsappUpdates: e.target.checked})}
                      />
                    </div>
                    <div className="pt-4">
                      <button onClick={handleUpdatePreferences} disabled={isSaving} className="btn-secondary">
                        {isSaving ? 'A guardar...' : 'Guardar Preferências'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal de Reserva */}
      <BookingModal 
        isOpen={isBookingModalOpen}
        onClose={() => setIsBookingModalOpen(false)}
        route={selectedRoute}
        onSubmit={handleBookingSubmit}
        isLoading={isBookingLoading}
      />

      {/* Modal de Adicionar Morada */}
      {isAddressModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
            <h3 className="text-xl font-bold text-flyfast-blue mb-4">Nova Morada</h3>
            <form onSubmit={handleAddAddress} className="space-y-4">
              <div>
                <label className="label">Nome da Morada (Ex: Casa, Escritório)</label>
                <input 
                  type="text" 
                  className="input-field" 
                  value={newAddress.label}
                  onChange={e => setNewAddress({...newAddress, label: e.target.value})}
                  required
                />
              </div>
              <div>
                <label className="label">Rua e Número</label>
                <input 
                  type="text" 
                  className="input-field" 
                  value={newAddress.street}
                  onChange={e => setNewAddress({...newAddress, street: e.target.value})}
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Cidade</label>
                  <input 
                    type="text" 
                    className="input-field" 
                    value={newAddress.city}
                    onChange={e => setNewAddress({...newAddress, city: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <label className="label">Código Postal</label>
                  <input 
                    type="text" 
                    className="input-field" 
                    value={newAddress.zip}
                    onChange={e => setNewAddress({...newAddress, zip: e.target.value})}
                  />
                </div>
              </div>
              <div>
                <label className="label">País</label>
                <select 
                  className="input-field"
                  value={newAddress.country}
                  onChange={e => setNewAddress({...newAddress, country: e.target.value})}
                >
                  <option>Angola</option>
                  <option>Portugal</option>
                </select>
              </div>
              <div className="flex gap-3 mt-6">
                <button 
                  type="button" 
                  onClick={() => setIsAddressModalOpen(false)}
                  className="flex-1 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button 
                  type="submit" 
                  disabled={isSaving}
                  className="flex-1 btn-primary"
                >
                  {isSaving ? 'A guardar...' : 'Guardar Morada'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Account;