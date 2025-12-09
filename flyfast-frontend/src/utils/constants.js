export const SERVICES = [
  {
    id: 1,
    icon: '📦',
    title: 'Envios Express',
    description: 'Entrega rápida entre Luanda e Lisboa com segurança máxima',
    color: 'bg-blue-100',
    iconColor: 'text-flyfast-blue'
  },
  {
    id: 2,
    icon: '🗺️',
    title: 'Rastreamento em Tempo Real',
    description: 'Acompanhe seu pacote em cada etapa do caminho',
    color: 'bg-yellow-100',
    iconColor: 'text-flyfast-yellow'
  },
  {
    id: 3,
    icon: '👔',
    title: 'Personal Shopper',
    description: 'Compre produtos específicos em Portugal ou Angola',
    color: 'bg-blue-50',
    iconColor: 'text-flyfast-blue'
  },
  {
    id: 4,
    icon: '🛍️',
    title: 'Loja Oficial',
    description: 'Produtos exclusivos e materiais de envio',
    color: 'bg-yellow-50',
    iconColor: 'text-flyfast-yellow'
  }
];

export const UPCOMING_ROUTES = [
  {
    id: 1,
    from: 'Luanda',
    to: 'Lisboa',
    date: '2025-01-15',
    time: '10:00',
    available: 12,
    status: 'Disponível'
  },
  {
    id: 2,
    from: 'Lisboa',
    to: 'Luanda',
    date: '2025-01-16',
    time: '14:00',
    available: 8,
    status: 'Disponível'
  },
  {
    id: 3,
    from: 'Luanda',
    to: 'Lisboa',
    date: '2025-01-17',
    time: '09:00',
    available: 15,
    status: 'Disponível'
  }
];

export const PRODUCTS = [
  {
    id: 1,
    name: 'T-shirt FLYFAST Premium',
    price: 4990,
    currency: 'AOA',
    category: 'Merchandise',
    image: 'tshirt.jpg',
    rating: 4.8,
    reviews: 24
  },
  {
    id: 2,
    name: 'Boné FLYFAST',
    price: 2990,
    currency: 'AOA',
    category: 'Merchandise',
    image: 'cap.jpg',
    rating: 4.5,
    reviews: 18
  },
  {
    id: 3,
    name: 'Caixa Personalizada',
    price: 1990,
    currency: 'AOA',
    category: 'Materiais',
    image: 'box.jpg',
    rating: 4.9,
    reviews: 32
  }
];

export const TRACKING_STATUS = {
  'processing': { text: 'Em Processamento', color: 'bg-yellow-500' },
  'transit': { text: 'Em Trânsito', color: 'bg-blue-500' },
  'arrived': { text: 'Chegou ao Destino', color: 'bg-green-500' },
  'delivered': { text: 'Entregue', color: 'bg-green-700' }
};