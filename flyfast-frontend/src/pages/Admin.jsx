import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { FaUsers, FaBox, FaChartLine, FaSpinner, FaTrash, FaEdit, FaPlus, FaChevronLeft, FaChevronRight, FaEnvelope, FaFileDownload, FaShoppingBag, FaWhatsapp, FaEye, FaPlane, FaBan, FaTags, FaSave, FaHistory, FaSync } from 'react-icons/fa';
import { AlertProvider, useAlert } from '../contexts/AlertContext';
import GlobalAlert from '../components/GlobalAlert';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import FlyfastLogo from '../assets/flyfast-logo.jpg';

const AdminContent = () => {
  const { authState } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [shipments, setShipments] = useState([]);
  const [personalShopperRequests, setPersonalShopperRequests] = useState([]);
  const [routes, setRoutes] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isShipmentFormOpen, setIsShipmentFormOpen] = useState(false);
  const [newShipment, setNewShipment] = useState({
    userId: '',
    from: 'Luanda',
    to: 'Lisboa',
    status: 'Pendente'
  });
  const { showAlert } = useAlert();

  // Estados para edição de envio
  const [editingShipment, setEditingShipment] = useState(null);
  const [isEditShipmentModalOpen, setIsEditShipmentModalOpen] = useState(false);
  const [shipmentSearch, setShipmentSearch] = useState('');

  // Estados de Paginação de Utilizadores
  const [userPage, setUserPage] = useState(0);
  const [userCursors, setUserCursors] = useState([null]); // Pilha de cursores (IDs)
  const [hasMoreUsers, setHasMoreUsers] = useState(false);

  // Estados para visualização de detalhes do pedido Personal Shopper
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);

  // Estados para visualização de detalhes do utilizador
  const [selectedUser, setSelectedUser] = useState(null);
  const [isUserDetailsModalOpen, setIsUserDetailsModalOpen] = useState(false);

  // Estados para gestão de Rotas
  const [isRouteFormOpen, setIsRouteFormOpen] = useState(false);
  const [newRoute, setNewRoute] = useState({
    from: 'Luanda',
    to: 'Lisboa',
    date: '',
    departureTime: '',
    price: '',
    capacity: '',
    duration: ''
  });

  // Estados para edição de Rota
  const [editingRoute, setEditingRoute] = useState(null);
  const [isEditRouteModalOpen, setIsEditRouteModalOpen] = useState(false);

  // Estados de Paginação de Rotas
  const [routesPage, setRoutesPage] = useState(0);
  const [routesCursors, setRoutesCursors] = useState([null]); // Pilha de cursores
  const [hasMoreRoutes, setHasMoreRoutes] = useState(false);

  // Estados para Tabela de Preços
  const [pricing, setPricing] = useState({
    pricePerKg: 12.99,
    serviceFee: 0,
    insuranceRate: 0,
    specificArticles: [
      { article: 'Perfumes/Duplos', price: '7€ | 10€ KG', tax: '35% da fatura' },
      { article: 'Cartões Visa', price: '15 €', tax: '-' },
      { article: 'Documentos', price: '15 €', tax: '-' },
      { article: 'Telemóveis', price: '20 €', tax: '23% da fatura' },
      { article: 'Computadores', price: '35 €', tax: '23% da fatura' },
      { article: 'Artigos de Ouro', price: '15 €', tax: '-' },
      { article: 'Playstation 4/5', price: '45 €', tax: '23% da fatura' }
    ],
    weightArticles: [
      { article: 'Roupas', tax: '23% da fatura' },
      { article: 'Calçados', tax: '23% da fatura' },
      { article: 'Cosméticos', tax: '35% da fatura' },
      { article: 'TV\'s', tax: '23% da fatura' },
      { article: 'Eletrodomésticos', tax: '23% da fatura' },
      { article: 'Máquinas Pesadas', tax: '23% da fatura' }
    ]
  });
  const [pricingLogs, setPricingLogs] = useState([]);
  const [contactMessages, setContactMessages] = useState([]);

  // Verificar se é admin
  useEffect(() => {
    // Se não estiver a carregar e (não autenticado OU não for admin)
    if (!authState.isLoading) {
       if (!authState.isAuthenticated) {
         console.log("Admin: Utilizador não autenticado. Redirecionando para login.");
         navigate('/login');
       } else if (authState.user?.role !== 'admin') {
         // DEBUG: Mostra no console o que o sistema está a ler
         console.warn(`⛔ ACESSO NEGADO. Role lida: '${authState.user?.role}' | UID: ${authState.user?.uid}`);
         console.log("Objeto User completo:", authState.user);
         navigate('/account');
       }
    }
  }, [authState, navigate]);

  const fetchStats = async () => {
    if (!authState.token) return;
    setIsLoading(true);
    try {
      const response = await fetch('/api/admin/dashboard/stats', {
        headers: { 'Authorization': `Bearer ${authState.token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchUsers = async (pageIndex = 0) => {
    if (!authState.token) return;
    setIsLoading(true);
    try {
      const cursor = userCursors[pageIndex];
      let url = `/api/admin/users?limit=1000`;
      if (cursor) {
        url += `&startAfter=${cursor}`;
      }

      const response = await fetch(url, {
        headers: { 'Authorization': `Bearer ${authState.token}` }
      });
      if (response.ok) {
        const data = await response.json();
        console.log(`[Frontend] Recebidos ${data.users.length} utilizadores do backend.`);
        setUsers(data.users);
        setHasMoreUsers(!!data.lastVisible);
        
        // Se tivermos um próximo cursor e estivermos a avançar, guardamos o cursor da próxima página
        if (data.lastVisible) {
           const newCursors = [...userCursors];
           // Apenas atualiza se ainda não tivermos este cursor (evita loops se recarregarmos a mesma página)
           if (!newCursors[pageIndex + 1]) {
             newCursors[pageIndex + 1] = data.lastVisible;
             setUserCursors(newCursors);
           }
        }
      }
    } catch (err) {
      setError('Erro ao carregar utilizadores');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchShipments = async () => {
    if (!authState.token) return;
    setIsLoading(true);
    try {
      const response = await fetch('/api/admin/shipments', {
        headers: { 'Authorization': `Bearer ${authState.token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setShipments(data);
      }
    } catch (err) {
      setError('Erro ao carregar envios');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchPersonalShopperRequests = async () => {
    if (!authState.token) return;
    setIsLoading(true);
    try {
      const response = await fetch('/api/personal-shopper/admin/requests', {
        headers: { 'Authorization': `Bearer ${authState.token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setPersonalShopperRequests(data);
      }
    } catch (err) {
      setError('Erro ao carregar pedidos de Personal Shopper');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchRoutes = async (pageIndex = 0) => {
    if (!authState.token) return;
    setIsLoading(true);
    try {
      const cursor = routesCursors[pageIndex];
      let url = `/api/schedules`;
      if (cursor) {
        url += `&startAfter=${cursor}`;
      }

      const response = await fetch(url);
      if (response.ok) {
        const data = await response.json();
        // O backend agora retorna { schedules, lastVisible } se usarmos limit
        setRoutes(data.schedules || data); 
        setHasMoreRoutes(!!data.lastVisible);

        if (data.lastVisible) {
           const newCursors = [...routesCursors];
           if (!newCursors[pageIndex + 1]) {
             newCursors[pageIndex + 1] = data.lastVisible;
             setRoutesCursors(newCursors);
           }
        }
      }
    } catch (err) {
      setError('Erro ao carregar rotas');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchPricing = async () => {
    if (!authState.token) return;
    setIsLoading(true);
    try {
      // Buscar preços atuais
      const response = await fetch('/api/admin/pricing', {
        headers: { 'Authorization': `Bearer ${authState.token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setPricing(data);
      }

      // Buscar logs de auditoria
      const logsResponse = await fetch('/api/admin/pricing/logs', {
        headers: { 'Authorization': `Bearer ${authState.token}` }
      });
      if (logsResponse.ok) {
        const logsData = await logsResponse.json();
        setPricingLogs(logsData);
      }
    } catch (err) {
      setError('Erro ao carregar preços');
    } finally {
      setIsLoading(false);
    }
  };

  // Estados locais para adicionar novos itens na tabela de preços
  const [newSpecificArticle, setNewSpecificArticle] = useState({ article: '', price: '', tax: '' });
  const [newWeightArticle, setNewWeightArticle] = useState({ article: '', tax: '' });

  const handleAddSpecificArticle = () => {
    if (!newSpecificArticle.article || !newSpecificArticle.price) return;
    setPricing(prev => ({
      ...prev,
      specificArticles: [...(prev.specificArticles || []), newSpecificArticle]
    }));
    setNewSpecificArticle({ article: '', price: '', tax: '' });
  };

  const handleRemoveSpecificArticle = (index) => {
    setPricing(prev => ({
      ...prev,
      specificArticles: (prev.specificArticles || []).filter((_, i) => i !== index)
    }));
  };

  const handleAddWeightArticle = () => {
    if (!newWeightArticle.article) return;
    setPricing(prev => ({
      ...prev,
      weightArticles: [...(prev.weightArticles || []), newWeightArticle]
    }));
    setNewWeightArticle({ article: '', tax: '' });
  };

  const handleRemoveWeightArticle = (index) => {
    setPricing(prev => ({
      ...prev,
      weightArticles: (prev.weightArticles || []).filter((_, i) => i !== index)
    }));
  };

  const fetchContactMessages = async () => {
    if (!authState.token) return;
    setIsLoading(true);
    try {
      const response = await fetch('/api/admin/contact-requests', {
        headers: { 'Authorization': `Bearer ${authState.token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setContactMessages(data);
      }
    } catch (err) {
      setError('Erro ao carregar mensagens');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (authState.user?.role !== 'admin' || !authState.token) return;
    if (activeTab === 'dashboard') {
      fetchStats();
      fetchPersonalShopperRequests();
      fetchShipments(); // Carregar envios para gerar o gráfico
    }
    if (activeTab === 'users') {
      fetchUsers(0); // Carrega a primeira página
      fetchStats(); // Garante que temos o total de utilizadores atualizado
    }
    if (activeTab === 'shipments') fetchShipments();
    if (activeTab === 'personalShopper') fetchPersonalShopperRequests();
    if (activeTab === 'routes') fetchRoutes(0);
    if (activeTab === 'pricing') fetchPricing();
    if (activeTab === 'messages') fetchContactMessages();
  }, [activeTab, authState.user, authState.token]);

  const handleDeleteUser = async (userId) => {
    if(!window.confirm('Tem a certeza que deseja apagar este utilizador? Esta ação é irreversível.')) return;
    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${authState.token}` }
      });
      if (response.ok) {
        fetchUsers(userPage); // Recarregar página atual
        showAlert('success', 'Utilizador removido com sucesso');
      } else {
        const data = await response.json();
        showAlert('error', data.error || 'Erro ao apagar utilizador');
      }
    } catch (err) {
      showAlert('error', 'Erro de conexão');
    }
  };

  const handleUpdateUserRole = async (userId, currentRole) => {
    const newRole = prompt("Introduza o novo role (admin, customer, user):", currentRole);
    if (newRole && newRole !== currentRole) {
      try {
        const response = await fetch(`/api/users/${userId}`, {
          method: 'PUT',
          headers: { 
            'Authorization': `Bearer ${authState.token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ role: newRole })
        });
        if (response.ok) {
          fetchUsers(userPage);
          showAlert('success', `Role atualizado! Peça ao utilizador para fazer logout e login novamente para que a alteração tenha efeito.`);
        } else {
          const data = await response.json();
          showAlert('error', data.error || 'Erro ao atualizar role');
        }
      } catch (err) {
        console.error(err);
        showAlert('error', 'Erro de conexão');
      }
    }
  };

  const handleResendEmail = async (shipmentId) => {
    if(!window.confirm('Deseja reenviar o email de rastreio para o cliente?')) return;
    
    try {
      const response = await fetch(`/api/shipments/${shipmentId}/resend-email`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${authState.token}` }
      });
      
      if (response.ok) {
        showAlert('success', 'Email reenviado com sucesso!');
      } else {
        const data = await response.json();
        showAlert('error', data.error || 'Erro ao reenviar email');
      }
    } catch (err) {
      showAlert('error', 'Erro de conexão');
    }
  };

  const handleCancelShipment = async (shipmentId) => {
    if(!window.confirm('Tem a certeza que deseja cancelar este envio? A capacidade será devolvida à rota.')) return;
    
    try {
      const response = await fetch(`/api/shipments/${shipmentId}/cancel`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${authState.token}` }
      });
      
      if (response.ok) {
        fetchShipments();
        showAlert('success', 'Envio cancelado com sucesso!');
      } else {
        const data = await response.json();
        showAlert('error', data.error || 'Erro ao cancelar envio');
      }
    } catch (err) {
      showAlert('error', 'Erro de conexão');
    }
  };

  const handleUserPageChange = (newPage) => {
    if (newPage < 0 || newPage >= userCursors.length) return;
    // Se for para a próxima página e não tivermos cursor, não faz nada (segurança)
    if (newPage > userPage && !hasMoreUsers) return;

    setUserPage(newPage);
    fetchUsers(newPage);
  };

  const handleRoutesPageChange = (newPage) => {
    if (newPage < 0 || newPage >= routesCursors.length) return;
    if (newPage > routesPage && !hasMoreRoutes) return;
    setRoutesPage(newPage);
    fetchRoutes(newPage);
  };

  const handleCreateShipment = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/admin/shipments', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authState.token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(newShipment)
      });
      
      if (response.ok) {
        setIsShipmentFormOpen(false);
        fetchShipments();
        setNewShipment({ userId: '', from: 'Luanda', to: 'Lisboa', status: 'Pendente' });
        showAlert('success', 'Envio criado com sucesso!');
      } else {
        const data = await response.json();
        showAlert('error', data.error || 'Erro ao criar envio');
      }
    } catch (err) {
      showAlert('error', 'Erro de conexão');
    }
  };

  const handleExportCSV = () => {
    const filteredShipments = shipments.filter(s => 
      s.id.toLowerCase().includes(shipmentSearch.toLowerCase())
    );

    if (filteredShipments.length === 0) {
      showAlert('info', 'Não há envios para exportar.');
      return;
    }

    const headers = ['ID', 'Cliente', 'Origem', 'Destino', 'Estado', 'Localização', 'Data'];
    const csvContent = [
      headers.join(','),
      ...filteredShipments.map(s => [
        s.id, s.userId, s.from, s.to, s.status, s.currentLocation || '', s.createdAt || ''
      ].map(field => `"${String(field || '').replace(/"/g, '""')}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `envios_flyfast_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  const handleEditShipment = (shipment) => {
    setEditingShipment({ ...shipment });
    setIsEditShipmentModalOpen(true);
  };

  const handleUpdateShipment = async (e) => {
    e.preventDefault();
    if (!editingShipment) return;

    try {
      const response = await fetch(`/api/shipments/${editingShipment.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${authState.token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            status: editingShipment.status,
            currentLocation: editingShipment.currentLocation,
            from: editingShipment.from,
            to: editingShipment.to
        })
      });
      
      if (response.ok) {
        setIsEditShipmentModalOpen(false);
        fetchShipments();
        showAlert('success', 'Envio atualizado com sucesso!');
        setEditingShipment(null);
      } else {
        const data = await response.json();
        showAlert('error', data.error || 'Erro ao atualizar envio');
      }
    } catch (err) {
      showAlert('error', 'Erro de conexão');
    }
  };

  const handleViewRequestDetails = (request) => {
    setSelectedRequest(request);
    setIsDetailsModalOpen(true);
  };

  const handleViewUserDetails = (user) => {
    setSelectedUser(user);
    setIsUserDetailsModalOpen(true);
  };

  const handleUpdatePersonalShopperStatus = async (e) => {
    const newStatus = e.target.value;
    if (!selectedRequest) return;

    try {
        const response = await fetch(`/api/personal-shopper/requests/${selectedRequest.id}/status`, {
            method: 'PUT',
            headers: { 'Authorization': `Bearer ${authState.token}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: newStatus })
        });
        if (response.ok) {
            setPersonalShopperRequests(prev => prev.map(r => r.id === selectedRequest.id ? { ...r, status: newStatus } : r));
            setSelectedRequest(prev => ({ ...prev, status: newStatus }));
            showAlert('success', 'Estado atualizado com sucesso');
        }
    } catch (err) { showAlert('error', 'Erro ao atualizar estado'); }
  };

  const handleCreateRoute = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/schedules', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authState.token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(newRoute)
      });
      
      if (response.ok) {
        setIsRouteFormOpen(false);
        fetchRoutes(0); // Volta à primeira página para ver a nova rota
        setNewRoute({ from: 'Luanda', to: 'Lisboa', date: '', departureTime: '', price: '', capacity: '', duration: '' });
        showAlert('success', 'Rota criada com sucesso!');
      } else {
        const data = await response.json();
        showAlert('error', data.error || 'Erro ao criar rota');
      }
    } catch (err) {
      showAlert('error', 'Erro de conexão');
    }
  };

  const handleEditRoute = (route) => {
    setEditingRoute({ ...route });
    setIsEditRouteModalOpen(true);
  };

  const handleUpdateRoute = async (e) => {
    e.preventDefault();
    if (!editingRoute) return;

    try {
      const response = await fetch(`/api/schedules/${editingRoute.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${authState.token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(editingRoute)
      });
      
      if (response.ok) {
        setIsEditRouteModalOpen(false);
        fetchRoutes(routesPage);
        setEditingRoute(null);
        showAlert('success', 'Rota atualizada com sucesso!');
      } else {
        const data = await response.json();
        showAlert('error', data.error || 'Erro ao atualizar rota');
      }
    } catch (err) {
      showAlert('error', 'Erro de conexão');
    }
  };

  const handleDeleteRoute = async (id) => {
    if(!window.confirm('Tem a certeza que deseja apagar esta rota?')) return;
    try {
      const response = await fetch(`/api/schedules/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${authState.token}` }
      });
      if (response.ok) {
        fetchRoutes(routesPage); // Recarrega a página atual
        showAlert('success', 'Rota removida com sucesso');
      } else {
        showAlert('error', 'Erro ao remover rota');
      }
    } catch (err) {
      showAlert('error', 'Erro de conexão');
    }
  };

  const handleUpdatePoints = async (userId, currentPoints) => {
    const newPoints = prompt("Introduza o novo saldo de pontos:", currentPoints);
    if (newPoints !== null && !isNaN(newPoints)) {
        try {
            const response = await fetch(`/api/users/${userId}`, {
                method: 'PUT',
                headers: { 
                    'Authorization': `Bearer ${authState.token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ loyaltyPoints: parseInt(newPoints) })
            });
            if (response.ok) {
                // Atualizar estado local do utilizador selecionado
                setSelectedUser(prev => ({ ...prev, loyaltyPoints: parseInt(newPoints) }));
                // Atualizar na lista geral
                setUsers(prev => prev.map(u => u.id === userId ? { ...u, loyaltyPoints: parseInt(newPoints) } : u));
                showAlert('success', 'Pontos de fidelidade atualizados!');
            } else {
                const data = await response.json();
                showAlert('error', data.error || 'Erro ao atualizar pontos');
            }
        } catch (err) {
            showAlert('error', 'Erro de conexão');
        }
    }
  };

  const handleUpdatePricing = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/admin/pricing', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${authState.token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(pricing)
      });
      
      if (response.ok) {
        showAlert('success', 'Tabela de preços atualizada com sucesso!');
        fetchPricing(); // Recarrega para atualizar os logs
      } else {
        showAlert('error', 'Erro ao atualizar preços');
      }
    } catch (err) {
      showAlert('error', 'Erro de conexão');
    }
  };

  const handleDeleteMessage = async (id) => {
    if(!window.confirm('Tem a certeza que deseja apagar esta mensagem?')) return;
    try {
      const response = await fetch(`/api/admin/contact-requests/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${authState.token}` }
      });
      if (response.ok) {
        fetchContactMessages();
        showAlert('success', 'Mensagem apagada com sucesso');
      } else {
        showAlert('error', 'Erro ao apagar mensagem');
      }
    } catch (err) {
      showAlert('error', 'Erro de conexão');
    }
  };

  // Processar dados para o gráfico (Envios por Mês)
  const getChartData = () => {
    if (!shipments.length) return [];

    const last6Months = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const monthName = d.toLocaleString('pt-PT', { month: 'short' });
      const year = d.getFullYear();
      last6Months.push({ name: `${monthName}/${year}`, month: d.getMonth(), year: year, envios: 0 });
    }

    shipments.forEach(shipment => {
      if (!shipment.createdAt) return;
      const date = new Date(shipment.createdAt);
      const month = date.getMonth();
      const year = date.getFullYear();

      const monthData = last6Months.find(d => d.month === month && d.year === year);
      if (monthData) monthData.envios++;
    });

    return last6Months;
  };

  if (authState.isLoading) return <div className="flex justify-center p-20"><FaSpinner className="animate-spin text-4xl" /></div>;

  // Segurança: Se não for admin, não renderiza nada enquanto aguarda o redirecionamento
  if (!authState.isAuthenticated || authState.user?.role !== 'admin') {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col md:flex-row">
      {/* Sidebar */}
      <div className="w-full md:w-64 bg-flyfast-blue text-white p-6">
        <h1 className="text-2xl font-bold mb-10 flex items-center gap-2">
           <img src={FlyfastLogo} alt="Logo" className="w-8 h-8 rounded-full border-2 border-white object-cover" />
           <span>Admin</span>
        </h1>
        <nav className="space-y-2 flex flex-row md:flex-col overflow-x-auto md:overflow-visible">
          <button 
            onClick={() => setActiveTab('dashboard')}
            className={`flex items-center space-x-3 w-full p-3 rounded transition ${activeTab === 'dashboard' ? 'bg-blue-800' : 'hover:bg-blue-700'}`}
          >
            <FaChartLine /> <span>Dashboard</span>
          </button>
          <button 
            onClick={() => setActiveTab('users')}
            className={`flex items-center space-x-3 w-full p-3 rounded transition ${activeTab === 'users' ? 'bg-blue-800' : 'hover:bg-blue-700'}`}
          >
            <FaUsers /> <span>Utilizadores</span>
          </button>
          <button 
            onClick={() => setActiveTab('shipments')}
            className={`flex items-center space-x-3 w-full p-3 rounded transition ${activeTab === 'shipments' ? 'bg-blue-800' : 'hover:bg-blue-700'}`}
          >
            <FaBox /> <span>Envios</span>
          </button>
          <button 
            onClick={() => setActiveTab('personalShopper')}
            className={`flex items-center space-x-3 w-full p-3 rounded transition ${activeTab === 'personalShopper' ? 'bg-blue-800' : 'hover:bg-blue-700'}`}
          >
            <FaShoppingBag /> <span>Personal Shopper</span>
          </button>
          <button 
            onClick={() => setActiveTab('routes')}
            className={`flex items-center space-x-3 w-full p-3 rounded transition ${activeTab === 'routes' ? 'bg-blue-800' : 'hover:bg-blue-700'}`}
          >
            <FaPlane /> <span>Rotas</span>
          </button>
          <button 
            onClick={() => setActiveTab('pricing')}
            className={`flex items-center space-x-3 w-full p-3 rounded transition ${activeTab === 'pricing' ? 'bg-blue-800' : 'hover:bg-blue-700'}`}
          >
            <FaTags /> <span>Tabela de Preços</span>
          </button>
          <button 
            onClick={() => setActiveTab('messages')}
            className={`flex items-center space-x-3 w-full p-3 rounded transition ${activeTab === 'messages' ? 'bg-blue-800' : 'hover:bg-blue-700'}`}
          >
            <FaEnvelope /> <span>Mensagens</span>
          </button>
        </nav>
      </div>

      {/* Content */}
      <div className="flex-1 p-4 md:p-10 overflow-auto">
        <div className="flex justify-between items-center mb-6">
            <h2 className="text-3xl font-bold text-gray-800 capitalize">{activeTab}</h2>
            <div className="text-sm text-gray-500">Admin: {authState.user?.email}</div>
        </div>
        
        {error && (
            <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4" role="alert">
                <p>{error}</p>
            </div>
        )}

        {isLoading && <div className="flex justify-center"><FaSpinner className="animate-spin text-2xl text-flyfast-blue mb-4" /></div>}
        
        {/* Dashboard View */}
        {activeTab === 'dashboard' && stats && (
          <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div onClick={() => setActiveTab('users')} className="bg-white p-6 rounded-lg shadow border-l-4 border-blue-500 cursor-pointer hover:shadow-md transition">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-gray-500 text-sm font-bold uppercase">Total Utilizadores</h3>
                    <p className="text-3xl font-bold text-gray-800">{stats.totalUsers || 0}</p>
                  </div>
                  <FaUsers className="text-4xl text-blue-200" />
                </div>
              </div>
              <div onClick={() => setActiveTab('shipments')} className="bg-white p-6 rounded-lg shadow border-l-4 border-green-500 cursor-pointer hover:shadow-md transition">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-gray-500 text-sm font-bold uppercase">Envios Ativos</h3>
                    <p className="text-3xl font-bold text-gray-800">{stats.activeShipments || 0}</p>
                  </div>
                  <FaBox className="text-4xl text-green-200" />
                </div>
              </div>
              <div onClick={() => setActiveTab('personalShopper')} className="bg-white p-6 rounded-lg shadow border-l-4 border-purple-500 cursor-pointer hover:shadow-md transition">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-gray-500 text-sm font-bold uppercase">Pedidos Personal Shopper</h3>
                    <p className="text-3xl font-bold text-gray-800">{personalShopperRequests.length || 0}</p>
                  </div>
                  <FaShoppingBag className="text-4xl text-purple-200" />
                </div>
              </div>
            </div>

            {/* Gráfico de Envios */}
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-xl font-bold text-gray-800 mb-6">Envios nos Últimos 6 Meses</h3>
              <div className="h-80 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={getChartData()}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} />
                    <YAxis axisLine={false} tickLine={false} allowDecimals={false} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    />
                    <Bar dataKey="envios" fill="#3B82F6" radius={[4, 4, 0, 0]} barSize={40} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div>
              <h3 className="text-xl font-bold text-gray-800 mb-4">Ações Rápidas</h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <button onClick={() => { setActiveTab('shipments'); setIsShipmentFormOpen(true); }} className="bg-white p-4 rounded-lg shadow hover:shadow-md transition flex items-center space-x-3 text-left border border-gray-100">
                  <div className="bg-blue-100 p-3 rounded-full text-flyfast-blue"><FaPlus /></div>
                  <span className="font-semibold text-gray-700">Novo Envio</span>
                </button>
                <button onClick={() => { setActiveTab('routes'); setIsRouteFormOpen(true); }} className="bg-white p-4 rounded-lg shadow hover:shadow-md transition flex items-center space-x-3 text-left border border-gray-100">
                  <div className="bg-yellow-100 p-3 rounded-full text-yellow-700"><FaPlane /></div>
                  <span className="font-semibold text-gray-700">Nova Rota</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Users View */}
        {activeTab === 'users' && (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="p-4 border-b bg-gray-50 flex justify-between items-center">
              <h3 className="font-bold text-gray-700">Gerir Utilizadores</h3>
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => { fetchUsers(0); fetchStats(); }} 
                  className="text-gray-500 hover:text-flyfast-blue transition" 
                  title="Forçar Atualização"
                >
                  <FaSync />
                </button>
                <span className="bg-blue-100 text-blue-800 text-xs font-bold px-3 py-1 rounded-full">
                  Total Registado: {stats?.totalUsers || '...'}
                </span>
              </div>
            </div>
            
            {/* Modal de Detalhes do Utilizador */}
            {isUserDetailsModalOpen && selectedUser && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                        <div className="p-6 border-b flex justify-between items-center">
                            <h3 className="text-xl font-bold text-gray-800">Detalhes do Utilizador</h3>
                            <button onClick={() => setIsUserDetailsModalOpen(false)} className="text-gray-500 hover:text-gray-700 text-2xl">&times;</button>
                        </div>
                        <div className="p-6 space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <h4 className="font-bold text-gray-700 text-sm uppercase mb-2">Informação Pessoal</h4>
                                    <p><span className="font-semibold">Nome:</span> {selectedUser.name || 'N/D'}</p>
                                    <p><span className="font-semibold">Email:</span> {selectedUser.email}</p>
                                    <p><span className="font-semibold">Telefone:</span> {selectedUser.phone || 'N/D'}</p>
                                    <p><span className="font-semibold">ID:</span> <span className="font-mono text-xs">{selectedUser.id}</span></p>
                                    <p><span className="font-semibold">Role:</span> <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${selectedUser.role === 'admin' ? 'bg-purple-100 text-purple-800' : selectedUser.role === 'customer' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'}`}>{selectedUser.role || 'user'}</span></p>
                                </div>
                                <div>
                                    <h4 className="font-bold text-gray-700 text-sm uppercase mb-2">Conta</h4>
                                    <p><span className="font-semibold">Membro desde:</span> {selectedUser.memberSince || (selectedUser.createdAt ? new Date(selectedUser.createdAt).toLocaleDateString('pt-PT') : 'N/D')}</p>
                                    <p className="flex items-center gap-2">
                                      <span className="font-semibold">Pontos Fidelidade:</span> 
                                      <span>{selectedUser.loyaltyPoints || 0}</span>
                                      <button 
                                        onClick={() => handleUpdatePoints(selectedUser.id, selectedUser.loyaltyPoints || 0)}
                                        className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded hover:bg-blue-200 border border-blue-200"
                                        title="Editar Pontos"
                                      >
                                        <FaEdit />
                                      </button>
                                    </p>
                                </div>
                            </div>

                            {selectedUser.addresses && selectedUser.addresses.length > 0 && (
                                <div className="border-t pt-4">
                                    <h4 className="font-bold text-gray-700 text-sm uppercase mb-3">Moradas Guardadas</h4>
                                    <div className="grid grid-cols-1 gap-3">
                                        {selectedUser.addresses.map((addr, idx) => (
                                            <div key={idx} className="bg-gray-50 p-3 rounded border border-gray-200 text-sm">
                                                <p className="font-bold text-gray-800">{addr.label || `Morada ${idx + 1}`}</p>
                                                <p>{addr.street}</p>
                                                <p>{addr.city}, {addr.zip}</p>
                                                <p>{addr.country}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {selectedUser.preferences && (
                                <div className="border-t pt-4">
                                    <h4 className="font-bold text-gray-700 text-sm uppercase mb-2">Preferências</h4>
                                    <div className="flex gap-4">
                                        <span className={`px-3 py-1 rounded-full text-sm ${selectedUser.preferences.emailUpdates ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-500'}`}>
                                            Email: {selectedUser.preferences.emailUpdates ? 'Sim' : 'Não'}
                                        </span>
                                        <span className={`px-3 py-1 rounded-full text-sm ${selectedUser.preferences.whatsappUpdates ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-500'}`}>
                                            WhatsApp: {selectedUser.preferences.whatsappUpdates ? 'Sim' : 'Não'}
                                        </span>
                                    </div>
                                </div>
                            )}
                        </div>
                        <div className="p-6 border-t bg-gray-50 flex justify-end">
                            <button onClick={() => setIsUserDetailsModalOpen(false)} className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 font-medium">Fechar</button>
                        </div>
                    </div>
                </div>
            )}

            <div className="overflow-x-auto">
                <table className="w-full">
                <thead className="bg-gray-50 border-b">
                    <tr>
                    <th className="p-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nome</th>
                    <th className="p-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                    <th className="p-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                    <th className="p-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                    {users.map(user => (
                    <tr key={user.id} className="hover:bg-gray-50">
                        <td className="p-4 whitespace-nowrap">{user.name || 'Sem nome'}</td>
                        <td className="p-4 whitespace-nowrap">{user.email}</td>
                        <td className="p-4 whitespace-nowrap">
                            <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${user.role === 'admin' ? 'bg-purple-100 text-purple-800' : user.role === 'customer' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'}`}>
                                {user.role || 'user'}
                            </span>
                        </td>
                        <td className="p-4 whitespace-nowrap flex space-x-3">
                            <button onClick={() => handleViewUserDetails(user)} className="text-gray-600 hover:text-gray-900" title="Ver Detalhes"><FaEye /></button>
                            <button onClick={() => handleUpdateUserRole(user.id, user.role)} className="text-blue-600 hover:text-blue-900" title="Editar Role"><FaEdit /></button>
                            <button onClick={() => handleDeleteUser(user.id)} className="text-red-600 hover:text-red-900" title="Apagar"><FaTrash /></button>
                        </td>
                    </tr>
                    ))}
                </tbody>
                </table>
            </div>
            
            {/* Paginação */}
            <div className="bg-gray-50 px-4 py-3 border-t border-gray-200 flex items-center justify-between sm:px-6">
                <div className="flex-1 flex justify-between sm:justify-end gap-2">
                    <button
                        onClick={() => handleUserPageChange(userPage - 1)}
                        disabled={userPage === 0}
                        className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <FaChevronLeft className="mr-2"/> Anterior
                    </button>
                    <button
                        onClick={() => handleUserPageChange(userPage + 1)}
                        disabled={!hasMoreUsers}
                        className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Próximo <FaChevronRight className="ml-2"/>
                    </button>
                </div>
            </div>
          </div>
        )}

        {/* Shipments View */}
        {activeTab === 'shipments' && (
          <div className="bg-white rounded-lg shadow overflow-hidden">
             <div className="p-4 border-b flex flex-col md:flex-row justify-between items-center bg-gray-50 gap-4">
                <h3 className="font-bold text-gray-700">Gerir Envios</h3>
                <div className="flex gap-2 w-full md:w-auto">
                  <input 
                    type="text"
                    placeholder="Pesquisar código..."
                    className="border rounded p-2 text-sm w-full md:w-64"
                    value={shipmentSearch}
                    onChange={(e) => setShipmentSearch(e.target.value)}
                  />
                  <button 
                    onClick={handleExportCSV}
                    className="bg-green-600 text-white px-4 py-2 rounded flex items-center gap-2 hover:bg-green-700 text-sm whitespace-nowrap"
                  >
                    <FaFileDownload /> CSV
                  </button>
                  <button 
                    onClick={() => setIsShipmentFormOpen(!isShipmentFormOpen)}
                    className="bg-flyfast-blue text-white px-4 py-2 rounded flex items-center gap-2 hover:bg-blue-700 text-sm whitespace-nowrap"
                  >
                    <FaPlus /> Novo Envio
                  </button>
                </div>
             </div>
             
             {isShipmentFormOpen && (
               <div className="p-6 bg-blue-50 border-b">
                 <form onSubmit={handleCreateShipment} className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
                    <div>
                      <label className="block text-xs font-bold text-gray-700 uppercase mb-1">ID Cliente</label>
                      <input 
                        type="text" 
                        className="block w-full rounded border-gray-300 shadow-sm p-2 border"
                        value={newShipment.userId}
                        onChange={e => setNewShipment({...newShipment, userId: e.target.value})}
                        placeholder="UID do utilizador"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Origem</label>
                      <select 
                        className="block w-full rounded border-gray-300 shadow-sm p-2 border"
                        value={newShipment.from}
                        onChange={e => setNewShipment({...newShipment, from: e.target.value})}
                      >
                        <option>Luanda</option>
                        <option>Lisboa</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Destino</label>
                      <select 
                        className="block w-full rounded border-gray-300 shadow-sm p-2 border"
                        value={newShipment.to}
                        onChange={e => setNewShipment({...newShipment, to: e.target.value})}
                      >
                        <option>Lisboa</option>
                        <option>Luanda</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Estado</label>
                      <select 
                        className="block w-full rounded border-gray-300 shadow-sm p-2 border"
                        value={newShipment.status}
                        onChange={e => setNewShipment({...newShipment, status: e.target.value})}
                      >
                        <option>Pendente</option>
                        <option>Em Trânsito</option>
                        <option>Entregue</option>
                      </select>
                    </div>
                    <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 h-10 font-bold">
                      Criar
                    </button>
                 </form>
               </div>
             )}

             {/* Modal de Edição de Envio */}
             {isEditShipmentModalOpen && editingShipment && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
                        <div className="p-6 border-b">
                            <h3 className="text-xl font-bold text-gray-800">Editar Envio #{editingShipment.id}</h3>
                        </div>
                        <form onSubmit={handleUpdateShipment} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">Estado</label>
                                <select
                                    className="w-full border rounded p-2"
                                    value={editingShipment.status}
                                    onChange={e => setEditingShipment({...editingShipment, status: e.target.value})}
                                >
                                    <option>Pendente</option>
                                    <option>Em Processamento</option>
                                    <option>Em Trânsito</option>
                                    <option>Chegou ao Destino</option>
                                    <option>Entregue</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">Localização Atual</label>
                                <input
                                    type="text"
                                    className="w-full border rounded p-2"
                                    value={editingShipment.currentLocation || ''}
                                    onChange={e => setEditingShipment({...editingShipment, currentLocation: e.target.value})}
                                    placeholder="Ex: Aeroporto de Lisboa"
                                />
                            </div>
                             <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1">Origem</label>
                                    <select
                                        className="w-full border rounded p-2"
                                        value={editingShipment.from}
                                        onChange={e => setEditingShipment({...editingShipment, from: e.target.value})}
                                    >
                                        <option>Luanda</option>
                                        <option>Lisboa</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1">Destino</label>
                                    <select
                                        className="w-full border rounded p-2"
                                        value={editingShipment.to}
                                        onChange={e => setEditingShipment({...editingShipment, to: e.target.value})}
                                    >
                                        <option>Lisboa</option>
                                        <option>Luanda</option>
                                    </select>
                                </div>
                            </div>
                            <div className="flex justify-end space-x-3 mt-6">
                                <button
                                    type="button"
                                    onClick={() => setIsEditShipmentModalOpen(false)}
                                    className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-flyfast-blue text-white rounded hover:bg-blue-700"
                                >
                                    Guardar
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
             )}

             <div className="overflow-x-auto">
                <table className="w-full">
                <thead className="bg-gray-50 border-b">
                    <tr>
                    <th className="p-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                    <th className="p-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cliente</th>
                    <th className="p-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                    <th className="p-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rota</th>
                    <th className="p-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Data</th>
                    <th className="p-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                    {shipments
                      .filter(s => s.id.toLowerCase().includes(shipmentSearch.toLowerCase()))
                      .map(shipment => (
                    <tr key={shipment.id} className="hover:bg-gray-50">
                        <td className="p-4 whitespace-nowrap font-mono text-sm">{shipment.id}</td>
                        <td className="p-4 whitespace-nowrap text-sm">
                          <div className="font-bold text-gray-900">{shipment.userEmail || users.find(u => u.id === shipment.userId)?.email || 'Email N/D'}</div>
                          <div className="text-xs text-gray-500" title={shipment.userId}>ID: {shipment.userId.substring(0, 8)}...</div>
                        </td>
                        <td className="p-4 whitespace-nowrap">
                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            shipment.status === 'Entregue' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                        }`}>
                            {shipment.status}
                        </span>
                        </td>
                        <td className="p-4 whitespace-nowrap text-sm">{shipment.from} → {shipment.to}</td>
                        <td className="p-4 whitespace-nowrap text-sm">{shipment.createdAt ? new Date(shipment.createdAt).toLocaleDateString('pt-PT') : '-'}</td>
                        <td className="p-4 whitespace-nowrap flex space-x-3">
                        <button onClick={() => handleEditShipment(shipment)} className="text-blue-600 hover:text-blue-900"><FaEdit /></button>
                        <button onClick={() => handleResendEmail(shipment.id)} className="text-yellow-600 hover:text-yellow-900" title="Reenviar Email"><FaEnvelope /></button>
                        <button onClick={() => handleCancelShipment(shipment.id)} className="text-red-500 hover:text-red-700" title="Cancelar Envio"><FaBan /></button>
                        </td>
                    </tr>
                    ))}
                </tbody>
                </table>
            </div>
          </div>
        )}

        {/* Personal Shopper View */}
        {activeTab === 'personalShopper' && (
          <div className="bg-white rounded-lg shadow overflow-hidden">
             <div className="p-4 border-b bg-gray-50">
                <h3 className="font-bold text-gray-700">Pedidos de Personal Shopper</h3>
             </div>

             {/* Modal de Detalhes do Pedido */}
             {isDetailsModalOpen && selectedRequest && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                        <div className="p-6 border-b flex justify-between items-center">
                            <h3 className="text-xl font-bold text-gray-800">Detalhes do Pedido</h3>
                            <button onClick={() => setIsDetailsModalOpen(false)} className="text-gray-500 hover:text-gray-700 text-2xl">&times;</button>
                        </div>
                        <div className="p-6 space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <h4 className="font-bold text-gray-700 text-sm uppercase">Cliente</h4>
                                    <p className="font-semibold">{selectedRequest.contact?.name || selectedRequest.userName || 'Nome N/D'}</p>
                                    <p className="text-sm text-gray-600">{selectedRequest.contact?.email || selectedRequest.userEmail || 'Email N/D'}</p>
                                    <p className="text-sm text-gray-600">{selectedRequest.contact?.phone || selectedRequest.userPhone || 'Telefone N/D'}</p>
                                </div>
                                <div>
                                    <h4 className="font-bold text-gray-700 text-sm uppercase">Entrega</h4>
                                    <p>{selectedRequest.deliveryCountry}</p>
                                    <p className="text-sm text-gray-500 mt-2">Data: {new Date(selectedRequest.createdAt).toLocaleDateString('pt-PT')}</p>
                                    <p className="text-sm text-gray-500">ID: <span className="font-mono">{selectedRequest.id}</span></p>
                                </div>
                            </div>

                            <div className="border-t pt-4">
                                <h4 className="font-bold text-gray-700 text-sm uppercase mb-2">Produto</h4>
                                <p className="font-semibold text-lg">{selectedRequest.productName}</p>
                                {selectedRequest.productLink && (
                                    <a href={selectedRequest.productLink} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline text-sm break-all block mt-1">
                                        🔗 {selectedRequest.productLink}
                                    </a>
                                )}
                                <div className="mt-3 bg-gray-50 p-3 rounded text-gray-700 whitespace-pre-wrap text-sm">
                                    {selectedRequest.details || 'Sem detalhes adicionais.'}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t pt-4">
                                <div>
                                    <h4 className="font-bold text-gray-700 text-sm uppercase">Orçamento</h4>
                                    <p>{selectedRequest.budget || 'Não especificado'}</p>
                                </div>
                                <div>
                                    <h4 className="font-bold text-gray-700 text-sm uppercase">Anexo</h4>
                                    {selectedRequest.attachment ? (
                                        <div>
                                            {selectedRequest.attachment.link && (
                                                <div className="mb-2">
                                                    <img 
                                                        src={selectedRequest.attachment.link}
                                                        alt="Anexo do pedido" 
                                                        className="max-w-full h-auto max-h-64 rounded border border-gray-300 object-contain"
                                                    />
                                                    <a href={selectedRequest.attachment.link} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline font-medium mt-1 inline-block text-sm">
                                                        📎 Abrir Original ({selectedRequest.attachment.name || 'Ficheiro'}) ↗
                                                    </a>
                                                </div>
                                            )}
                                        </div>
                                    ) : (
                                        <p className="text-sm text-gray-500">Sem anexo</p>
                                    )}
                                </div>
                            </div>

                            <div className="border-t pt-4 bg-gray-50 -mx-6 -mb-6 p-6 mt-4">
                                <label className="block text-sm font-bold text-gray-700 mb-2">Atualizar Estado</label>
                                <select 
                                    className="w-full border rounded p-2"
                                    value={selectedRequest.status || 'pending'}
                                    onChange={handleUpdatePersonalShopperStatus}
                                >
                                    <option value="pending">Pendente</option>
                                    <option value="processing">Em Processamento</option>
                                    <option value="purchased">Comprado</option>
                                    <option value="completed">Concluído / Enviado</option>
                                    <option value="cancelled">Cancelado</option>
                                </select>
                            </div>
                        </div>
                    </div>
                </div>
             )}

             <div className="overflow-x-auto">
                <table className="w-full">
                <thead className="bg-gray-50 border-b">
                    <tr>
                    <th className="p-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Data</th>
                    <th className="p-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cliente</th>
                    <th className="p-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Produto</th>
                    <th className="p-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                    <th className="p-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Orçamento</th>
                    <th className="p-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">País</th>
                    <th className="p-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                    {personalShopperRequests.map(request => (
                    <tr key={request.id} className="hover:bg-gray-50">
                        <td className="p-4 whitespace-nowrap text-sm">{new Date(request.createdAt).toLocaleDateString('pt-PT')}</td>
                        <td className="p-4 whitespace-nowrap">
                            <div className="text-sm font-bold text-gray-900">{request.contact?.name || request.userName || 'N/D'}</div>
                            <div className="text-xs text-gray-500">{request.contact?.email || request.userEmail || 'N/D'}</div>
                        </td>
                        <td className="p-4 text-sm max-w-xs truncate" title={request.productName}>
                            {request.productName}
                            {request.attachment && <span className="ml-2 text-xs bg-gray-200 px-1 rounded">📎 Anexo</span>}
                        </td>
                        <td className="p-4 whitespace-nowrap">
                            <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full 
                                ${request.status === 'completed' ? 'bg-green-100 text-green-800' : 
                                  request.status === 'cancelled' ? 'bg-red-100 text-red-800' : 
                                  request.status === 'processing' ? 'bg-blue-100 text-blue-800' : 
                                  'bg-yellow-100 text-yellow-800'}`}>
                                {request.status === 'pending' ? 'Pendente' : request.status}
                            </span>
                        </td>
                        <td className="p-4 whitespace-nowrap text-sm">{request.budget || '-'}</td>
                        <td className="p-4 whitespace-nowrap text-sm">{request.deliveryCountry}</td>
                        <td className="p-4 whitespace-nowrap flex items-center space-x-2">
                            <button onClick={() => handleViewRequestDetails(request)} className="text-blue-600 hover:text-blue-800 p-2" title="Ver Detalhes"><FaEye size={18} /></button>
                            {request.contact?.phone && (
                                <a 
                                    href={`https://wa.me/${request.contact.phone.replace(/[^0-9]/g, '')}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center px-3 py-1 bg-green-500 text-white text-sm font-medium rounded hover:bg-green-600 transition-colors"
                                >
                                    <FaWhatsapp className="mr-2" /> Responder
                                </a>
                            )}
                        </td>
                    </tr>
                    ))}
                    {personalShopperRequests.length === 0 && (
                        <tr><td colSpan="6" className="p-8 text-center text-gray-500">Nenhum pedido encontrado.</td></tr>
                    )}
                </tbody>
                </table>
            </div>
          </div>
        )}

        {/* Routes View */}
        {activeTab === 'routes' && (
          <div className="bg-white rounded-lg shadow overflow-hidden">
             <div className="p-4 border-b flex justify-between items-center bg-gray-50">
                <h3 className="font-bold text-gray-700">Gerir Rotas de Envio</h3>
                <button 
                  onClick={() => setIsRouteFormOpen(!isRouteFormOpen)}
                  className="bg-flyfast-blue text-white px-4 py-2 rounded flex items-center gap-2 hover:bg-blue-700 text-sm"
                >
                  <FaPlus /> Nova Rota
                </button>
             </div>

             {isRouteFormOpen && (
               <div className="p-6 bg-blue-50 border-b">
                 <form onSubmit={handleCreateRoute} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
                    <div>
                      <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Origem</label>
                      <select className="block w-full rounded border-gray-300 shadow-sm p-2 border" value={newRoute.from} onChange={e => setNewRoute({...newRoute, from: e.target.value})}>
                        <option>Luanda</option>
                        <option>Lisboa</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Destino</label>
                      <select className="block w-full rounded border-gray-300 shadow-sm p-2 border" value={newRoute.to} onChange={e => setNewRoute({...newRoute, to: e.target.value})}>
                        <option>Lisboa</option>
                        <option>Luanda</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Data</label>
                      <input type="date" className="block w-full rounded border-gray-300 shadow-sm p-2 border" value={newRoute.date} onChange={e => setNewRoute({...newRoute, date: e.target.value})} required />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Hora</label>
                      <input type="time" className="block w-full rounded border-gray-300 shadow-sm p-2 border" value={newRoute.departureTime} onChange={e => setNewRoute({...newRoute, departureTime: e.target.value})} />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Duração Estimada</label>
                      <input type="text" className="block w-full rounded border-gray-300 shadow-sm p-2 border" value={newRoute.duration} onChange={e => setNewRoute({...newRoute, duration: e.target.value})} placeholder="Ex: 6h 30m" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Preço/Kg</label>
                      <input type="text" className="block w-full rounded border-gray-300 shadow-sm p-2 border" value={newRoute.price} onChange={e => setNewRoute({...newRoute, price: e.target.value})} placeholder="Ex: 12.99€" required />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Capacidade</label>
                      <input type="text" className="block w-full rounded border-gray-300 shadow-sm p-2 border" value={newRoute.capacity} onChange={e => setNewRoute({...newRoute, capacity: e.target.value})} placeholder="Ex: 50kg" />
                    </div>
                    <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 h-10 font-bold">Criar</button>
                 </form>
               </div>
             )}

             {/* Modal de Edição de Rota */}
             {isEditRouteModalOpen && editingRoute && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl">
                        <div className="p-6 border-b flex justify-between items-center">
                            <h3 className="text-xl font-bold text-gray-800">Editar Rota</h3>
                            <button onClick={() => setIsEditRouteModalOpen(false)} className="text-gray-500 hover:text-gray-700">&times;</button>
                        </div>
                        <form onSubmit={handleUpdateRoute} className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
                            <div>
                              <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Origem</label>
                              <select className="block w-full rounded border-gray-300 shadow-sm p-2 border" value={editingRoute.from} onChange={e => setEditingRoute({...editingRoute, from: e.target.value})}>
                                <option>Luanda</option>
                                <option>Lisboa</option>
                              </select>
                            </div>
                            <div>
                              <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Destino</label>
                              <select className="block w-full rounded border-gray-300 shadow-sm p-2 border" value={editingRoute.to} onChange={e => setEditingRoute({...editingRoute, to: e.target.value})}>
                                <option>Lisboa</option>
                                <option>Luanda</option>
                              </select>
                            </div>
                            <div>
                              <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Data</label>
                              <input type="date" className="block w-full rounded border-gray-300 shadow-sm p-2 border" value={editingRoute.date} onChange={e => setEditingRoute({...editingRoute, date: e.target.value})} required />
                            </div>
                            <div>
                              <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Hora</label>
                              <input type="time" className="block w-full rounded border-gray-300 shadow-sm p-2 border" value={editingRoute.departureTime} onChange={e => setEditingRoute({...editingRoute, departureTime: e.target.value})} />
                            </div>
                            <div>
                              <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Duração</label>
                              <input type="text" className="block w-full rounded border-gray-300 shadow-sm p-2 border" value={editingRoute.duration} onChange={e => setEditingRoute({...editingRoute, duration: e.target.value})} placeholder="Ex: 6h 30m" />
                            </div>
                            <div>
                              <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Preço/Kg</label>
                              <input type="text" className="block w-full rounded border-gray-300 shadow-sm p-2 border" value={editingRoute.price} onChange={e => setEditingRoute({...editingRoute, price: e.target.value})} required />
                            </div>
                            <div>
                              <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Capacidade</label>
                              <input type="text" className="block w-full rounded border-gray-300 shadow-sm p-2 border" value={editingRoute.capacity} onChange={e => setEditingRoute({...editingRoute, capacity: e.target.value})} />
                            </div>
                            <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 h-10 font-bold">Atualizar</button>
                        </form>
                    </div>
                </div>
             )}

             <div className="overflow-x-auto">
                <table className="w-full">
                <thead className="bg-gray-50 border-b">
                    <tr>
                    <th className="p-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Origem</th>
                    <th className="p-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Destino</th>
                    <th className="p-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Data</th>
                    <th className="p-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Hora</th>
                    <th className="p-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Duração</th>
                    <th className="p-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Preço/Kg</th>
                    <th className="p-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Capacidade</th>
                    <th className="p-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                    {routes.map(route => (
                    <tr key={route.id} className="hover:bg-gray-50">
                        <td className="p-4 whitespace-nowrap text-sm font-medium">{route.from}</td>
                        <td className="p-4 whitespace-nowrap text-sm font-medium">{route.to}</td>
                        <td className="p-4 whitespace-nowrap text-sm">{route.date}</td>
                        <td className="p-4 whitespace-nowrap text-sm">{route.departureTime || '-'}</td>
                        <td className="p-4 whitespace-nowrap text-sm">{route.duration || '-'}</td>
                        <td className="p-4 whitespace-nowrap text-sm">{route.price}</td>
                        <td className="p-4 whitespace-nowrap text-sm">{route.capacity || route.available || '-'}</td>
                        <td className="p-4 whitespace-nowrap flex space-x-2">
                          <button onClick={() => handleEditRoute(route)} className="text-blue-600 hover:text-blue-900"><FaEdit /></button>
                          <button onClick={() => handleDeleteRoute(route.id)} className="text-red-600 hover:text-red-900"><FaTrash /></button>
                        </td>
                    </tr>
                    ))}
                    {routes.length === 0 && (
                        <tr><td colSpan="8" className="p-8 text-center text-gray-500">Nenhuma rota disponível.</td></tr>
                    )}
                </tbody>
                </table>
            </div>
          </div>
        )}

        {/* Pricing View */}
        {activeTab === 'pricing' && (
          <div className="bg-white rounded-lg shadow overflow-hidden">
             <div className="p-6 border-b bg-gray-50">
                <h3 className="font-bold text-gray-700 text-lg">Configuração da Tabela de Preços</h3>
                <p className="text-sm text-gray-500">Defina os valores base para o cálculo automático de envios.</p>
             </div>
             
             <div className="p-8 max-w-2xl">
                <form onSubmit={handleUpdatePricing} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                      <label className="block text-sm font-bold text-gray-700 mb-2 uppercase">Preço Base por Kg (€)</label>
                      <div className="relative">
                        <input 
                          type="number" 
                          className="block w-full rounded border-gray-300 shadow-sm p-3 pl-4 border text-lg font-bold text-flyfast-blue"
                          value={pricing.pricePerKg}
                          onChange={e => setPricing({...pricing, pricePerKg: parseFloat(e.target.value)})}
                          required
                        />
                        <span className="absolute right-4 top-3 text-gray-400 font-medium">€/kg</span>
                      </div>
                      <p className="text-xs text-gray-500 mt-2">Valor usado para multiplicar pelo peso do pacote.</p>
                    </div>

                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                      <label className="block text-sm font-bold text-gray-700 mb-2 uppercase">Taxa de Serviço Fixa (€)</label>
                      <div className="relative">
                        <input 
                          type="number" 
                          className="block w-full rounded border-gray-300 shadow-sm p-3 pl-4 border text-lg"
                          value={pricing.serviceFee}
                          onChange={e => setPricing({...pricing, serviceFee: parseFloat(e.target.value)})}
                        />
                        <span className="absolute right-4 top-3 text-gray-400 font-medium">€</span>
                      </div>
                      <p className="text-xs text-gray-500 mt-2">Valor fixo adicionado a cada envio (opcional).</p>
                    </div>
                  </div>

                  {/* Gestão de Artigos Específicos */}
                  <div className="bg-white p-4 rounded-lg border border-gray-200 mt-6">
                    <h4 className="font-bold text-gray-700 mb-4 uppercase text-sm">Artigos Específicos (Preço Fixo)</h4>
                    <div className="overflow-x-auto mb-4">
                      <table className="w-full text-sm">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="p-2 text-left">Artigo</th>
                            <th className="p-2 text-left">Preço Fixo</th>
                            <th className="p-2 text-left">Taxa de Fatura (%)</th>
                            <th className="p-2"></th>
                          </tr>
                        </thead>
                        <tbody className="divide-y">
                          {(pricing.specificArticles || []).map((item, idx) => (
                            <tr key={idx}>
                              <td className="p-2">{item.article}</td>
                              <td className="p-2">{item.price}</td>
                              <td className="p-2">{item.tax}</td>
                              <td className="p-2 text-right">
                                <button type="button" onClick={() => handleRemoveSpecificArticle(idx)} className="text-red-500 hover:text-red-700"><FaTrash /></button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-2 items-end bg-gray-50 p-3 rounded">
                      <div>
                        <label className="text-xs font-bold text-gray-500">Artigo</label>
                        <input type="text" className="w-full border rounded p-1 text-sm" value={newSpecificArticle.article} onChange={e => setNewSpecificArticle({...newSpecificArticle, article: e.target.value})} placeholder="Ex: Telemóveis" />
                      </div>
                      <div>
                        <label className="text-xs font-bold text-gray-500">Preço</label>
                        <input type="text" className="w-full border rounded p-1 text-sm" value={newSpecificArticle.price} onChange={e => setNewSpecificArticle({...newSpecificArticle, price: e.target.value})} placeholder="Ex: 20 €" />
                      </div>
                      <div>
                        <label className="text-xs font-bold text-gray-500">Taxa</label>
                        <input type="text" className="w-full border rounded p-1 text-sm" value={newSpecificArticle.tax} onChange={e => setNewSpecificArticle({...newSpecificArticle, tax: e.target.value})} placeholder="Ex: 23% da fatura" />
                      </div>
                      <button type="button" onClick={handleAddSpecificArticle} className="bg-blue-600 text-white p-1 rounded text-sm font-bold h-8">Adicionar</button>
                    </div>
                  </div>

                  {/* Gestão de Artigos por Peso */}
                  <div className="bg-white p-4 rounded-lg border border-gray-200 mt-6">
                    <h4 className="font-bold text-gray-700 mb-4 uppercase text-sm">Artigos por Peso (Taxas Especiais)</h4>
                    <div className="overflow-x-auto mb-4">
                      <table className="w-full text-sm">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="p-2 text-left">Artigo</th>
                            <th className="p-2 text-left">Taxa de Fatura (%)</th>
                            <th className="p-2"></th>
                          </tr>
                        </thead>
                        <tbody className="divide-y">
                          {(pricing.weightArticles || []).map((item, idx) => (
                            <tr key={idx}>
                              <td className="p-2">{item.article}</td>
                              <td className="p-2">{item.tax}</td>
                              <td className="p-2 text-right">
                                <button type="button" onClick={() => handleRemoveWeightArticle(idx)} className="text-red-500 hover:text-red-700"><FaTrash /></button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-2 items-end bg-gray-50 p-3 rounded">
                      <div>
                        <label className="text-xs font-bold text-gray-500">Artigo</label>
                        <input type="text" className="w-full border rounded p-1 text-sm" value={newWeightArticle.article} onChange={e => setNewWeightArticle({...newWeightArticle, article: e.target.value})} placeholder="Ex: Roupas" />
                      </div>
                      <div>
                        <label className="text-xs font-bold text-gray-500">Taxa</label>
                        <input type="text" className="w-full border rounded p-1 text-sm" value={newWeightArticle.tax} onChange={e => setNewWeightArticle({...newWeightArticle, tax: e.target.value})} placeholder="Ex: 23% da fatura" />
                      </div>
                      <button type="button" onClick={handleAddWeightArticle} className="bg-blue-600 text-white p-1 rounded text-sm font-bold h-8">Adicionar</button>
                    </div>
                  </div>

                  <div className="pt-4 border-t">
                    <button type="submit" className="bg-green-600 text-white px-8 py-3 rounded-lg hover:bg-green-700 font-bold shadow-lg flex items-center gap-2">
                      <FaSave /> Guardar Alterações
                    </button>
                  </div>
                </form>
             </div>

             {/* Histórico de Alterações */}
             <div className="p-8 border-t bg-gray-50">
                <h3 className="font-bold text-gray-700 text-lg mb-4 flex items-center gap-2">
                  <FaHistory /> Histórico de Alterações
                </h3>
                <div className="bg-white rounded-lg shadow overflow-hidden">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-100">
                      <tr>
                        <th className="p-3 text-left">Data</th>
                        <th className="p-3 text-left">Responsável</th>
                        <th className="p-3 text-left">Alteração</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {pricingLogs.length === 0 ? (
                        <tr><td colSpan="3" className="p-4 text-center text-gray-500">Nenhum registo encontrado.</td></tr>
                      ) : (
                        pricingLogs.map(log => (
                          <tr key={log.id}>
                            <td className="p-3 text-gray-600">{new Date(log.timestamp).toLocaleString('pt-PT')}</td>
                            <td className="p-3 font-medium">{log.performedByEmail}</td>
                            <td className="p-3 text-gray-600">
                              Atualizou preços (Antigo: {log.details?.oldValue?.pricePerKg || 'N/A'} ➝ Novo: {log.details?.newValue?.pricePerKg})
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
             </div>
          </div>
        )}

        {/* Messages View */}
        {activeTab === 'messages' && (
          <div className="bg-white rounded-lg shadow overflow-hidden">
             <div className="p-4 border-b bg-gray-50">
                <h3 className="font-bold text-gray-700">Mensagens de Contacto</h3>
             </div>
             <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="p-4 text-left text-xs font-medium text-gray-500 uppercase">Data</th>
                      <th className="p-4 text-left text-xs font-medium text-gray-500 uppercase">Remetente</th>
                      <th className="p-4 text-left text-xs font-medium text-gray-500 uppercase">Assunto</th>
                      <th className="p-4 text-left text-xs font-medium text-gray-500 uppercase">Mensagem</th>
                      <th className="p-4 text-left text-xs font-medium text-gray-500 uppercase">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {contactMessages.map(msg => (
                      <tr key={msg.id} className="hover:bg-gray-50">
                        <td className="p-4 whitespace-nowrap text-sm">{new Date(msg.createdAt).toLocaleDateString('pt-PT')}</td>
                        <td className="p-4 whitespace-nowrap">
                          <div className="text-sm font-bold">{msg.name}</div>
                          <div className="text-xs text-gray-500">{msg.email}</div>
                          <div className="text-xs text-gray-500">{msg.phone}</div>
                        </td>
                        <td className="p-4 text-sm">{msg.subject}</td>
                        <td className="p-4 text-sm max-w-xs truncate" title={msg.message}>{msg.message}</td>
                        <td className="p-4 whitespace-nowrap">
                          <button onClick={() => handleDeleteMessage(msg.id)} className="text-red-600 hover:text-red-900" title="Apagar"><FaTrash /></button>
                        </td>
                      </tr>
                    ))}
                    {contactMessages.length === 0 && (
                      <tr><td colSpan="5" className="p-8 text-center text-gray-500">Nenhuma mensagem encontrada.</td></tr>
                    )}
                  </tbody>
                </table>
             </div>
          </div>
        )}
      </div>
    </div>
  );
};

const Admin = () => {
  return (
    <AlertProvider>
      <GlobalAlert />
      <AdminContent />
    </AlertProvider>
  );
};

export default Admin;
