// Status de envios
const SHIPMENT_STATUS = {
  PENDING: 'pending',           // Aguardando recolha
  COLLECTED: 'collected',       // Recolhido
  IN_TRANSIT: 'in_transit',     // Em trânsito
  ARRIVED_DESTINATION: 'arrived_destination', // Chegou ao destino
  OUT_FOR_DELIVERY: 'out_for_delivery', // Saiu para entrega
  DELIVERED: 'delivered',       // Entregue
  DELAYED: 'delayed',           // Atrasado
  RETURNED: 'returned',         // Devolvido
  CANCELLED: 'cancelled'        // Cancelado
};

// Status de pedidos da loja
const ORDER_STATUS = {
  PENDING: 'pending',      // Pedido criado
  CONFIRMED: 'confirmed',  // Confirmado
  PROCESSING: 'processing', // Em processamento
  SHIPPED: 'shipped',      // Enviado
  DELIVERED: 'delivered',  // Entregue
  CANCELLED: 'cancelled',  // Cancelado
  RETURNED: 'returned'     // Devolvido
};

// Status de pagamento
const PAYMENT_STATUS = {
  PENDING: 'pending',    // Pendente
  PROCESSING: 'processing', // Processando
  PAID: 'paid',          // Pago
  FAILED: 'failed',      // Falhou
  REFUNDED: 'refunded',  // Reembolsado
  CANCELLED: 'cancelled' // Cancelado
};

// Status de Personal Shopper
const PERSONAL_SHOPPER_STATUS = {
  PENDING: 'pending',        // Recebido
  REVIEWING: 'reviewing',    // Em análise
  SEARCHING: 'searching',    // Procurando produto
  FOUND: 'found',            // Produto encontrado
  PRICE_CONFIRMED: 'price_confirmed', // Preço confirmado
  PURCHASED: 'purchased',    // Comprado
  SHIPPED: 'shipped',        // Enviado
  DELIVERED: 'delivered',    // Entregue
  CANCELLED: 'cancelled',    // Cancelado
  COMPLETED: 'completed'     // Concluído
};

// Categorias de produtos
const PRODUCT_CATEGORIES = {
  MERCHANDISE: 'merchandise',           // Merchandising FLYFAST
  PACKING_MATERIALS: 'packing_materials', // Materiais de envio
  TRAVEL_ACCESSORIES: 'travel_accessories', // Acessórios de viagem
  SHIPPING_SUPPLIES: 'shipping_supplies'   // Suprimentos de envio
};

// Métodos de pagamento
const PAYMENT_METHODS = {
  STRIPE: 'stripe',          // Cartão via Stripe
  PAYPAL: 'paypal',          // PayPal
  MBWAY: 'mbway',            // MB Way
  BANK_TRANSFER: 'bank_transfer', // Transferência bancária
  CASH: 'cash'               // Dinheiro
};

// Tipos de notificação
const NOTIFICATION_TYPES = {
  TRACKING_UPDATE: 'tracking_update',
  PAYMENT_CONFIRMATION: 'payment_confirmation',
  ORDER_UPDATE: 'order_update',
  PERSONAL_SHOPPER: 'personal_shopper',
  MARKETING: 'marketing',
  SYSTEM: 'system',
  ALERT: 'alert'
};

// Países suportados
const COUNTRIES = {
  ANGOLA: 'Angola',
  PORTUGAL: 'Portugal'
};

// Moedas suportadas
const CURRENCIES = {
  AOA: 'AOA', // Kwanza Angolano
  EUR: 'EUR', // Euro
  USD: 'USD'  // Dólar Americano
};

// Taxas de serviço
const SERVICE_FEES = {
  PERSONAL_SHOPPER: 0.15, // 15% do valor do produto
  MINIMUM_FEE: 5000,      // Taxa mínima em AOA
  SHIPPING_INSURANCE: 0.02 // 2% para seguro
};

// Prazos de entrega (em dias)
const DELIVERY_TIMEFRAMES = {
  LISBON_TO_LUANDA: 3,
  LUANDA_TO_LISBON: 2,
  STANDARD: 5
};

// Limites de peso (em kg)
const WEIGHT_LIMITS = {
  MAX_SHIPMENT: 50,
  MAX_PER_ITEM: 30,
  MIN_SHIPMENT: 0.1
};

// Dimensões máximas (em cm)
const DIMENSION_LIMITS = {
  MAX_LENGTH: 150,
  MAX_WIDTH: 150,
  MAX_HEIGHT: 150,
  MAX_GIRTH: 300
};

// URLs importantes
const URLS = {
  FRONTEND: process.env.FRONTEND_URL || 'http://localhost:3000',
  BACKEND: process.env.BACKEND_URL || 'http://localhost:5000',
  TERMS: '/terms',
  PRIVACY: '/privacy',
  SUPPORT: '/contact'
};

// Configurações de email
const EMAIL_CONFIG = {
  FROM: process.env.EMAIL_FROM || '"FLYFAST" <noreply@flyfast.com>',
  SUPPORT: process.env.SUPPORT_EMAIL || 'suporte@flyfast.com',
  CONTACT: process.env.CONTACT_EMAIL || 'info@flyfast.com'
};

// Configurações de WhatsApp
const WHATSAPP_CONFIG = {
  SUPPORT_NUMBER: process.env.SUPPORT_WHATSAPP || '+244923456789',
  BUSINESS_HOURS: {
    start: '09:00',
    end: '18:00',
    timezone: 'Africa/Luanda'
  }
};

// Níveis de fidelidade
const LOYALTY_TIERS = {
  BRONZE: {
    name: 'bronze',
    points: 0,
    discount: 0,
    benefits: ['Acesso básico']
  },
  SILVER: {
    name: 'silver',
    points: 1000,
    discount: 0.05, // 5%
    benefits: ['5% desconto', 'Suporte prioritário']
  },
  GOLD: {
    name: 'gold',
    points: 5000,
    discount: 0.10, // 10%
    benefits: ['10% desconto', 'Suporte VIP', 'Envios grátis ocasionais']
  },
  PLATINUM: {
    name: 'platinum',
    points: 10000,
    discount: 0.15, // 15%
    benefits: ['15% desconto', 'Suporte 24/7', 'Envios grátis', 'Acesso antecipado']
  }
};

// Pontos por ação
const LOYALTY_POINTS = {
  SIGNUP: 100,
  ORDER_COMPLETE: 50,
  REVIEW: 25,
  REFERRAL: 200,
  BIRTHDAY: 100
};

// Códigos de erro
const ERROR_CODES = {
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  AUTH_ERROR: 'AUTH_ERROR',
  NOT_FOUND: 'NOT_FOUND',
  PERMISSION_DENIED: 'PERMISSION_DENIED',
  RATE_LIMIT: 'RATE_LIMIT',
  INTERNAL_ERROR: 'INTERNAL_ERROR',
  PAYMENT_ERROR: 'PAYMENT_ERROR',
  SHIPPING_ERROR: 'SHIPPING_ERROR'
};

// Mensagens de erro
const ERROR_MESSAGES = {
  INVALID_CREDENTIALS: 'Credenciais inválidas',
  USER_NOT_FOUND: 'Utilizador não encontrado',
  SHIPMENT_NOT_FOUND: 'Envio não encontrado',
  ORDER_NOT_FOUND: 'Pedido não encontrado',
  PRODUCT_NOT_FOUND: 'Produto não encontrado',
  INSUFFICIENT_STOCK: 'Stock insuficiente',
  PAYMENT_FAILED: 'Pagamento falhou',
  UNAUTHORIZED: 'Não autorizado',
  RATE_LIMITED: 'Muitas requisições, por favor tente mais tarde'
};

module.exports = {
  SHIPMENT_STATUS,
  ORDER_STATUS,
  PAYMENT_STATUS,
  PERSONAL_SHOPPER_STATUS,
  PRODUCT_CATEGORIES,
  PAYMENT_METHODS,
  NOTIFICATION_TYPES,
  COUNTRIES,
  CURRENCIES,
  SERVICE_FEES,
  DELIVERY_TIMEFRAMES,
  WEIGHT_LIMITS,
  DIMENSION_LIMITS,
  URLS,
  EMAIL_CONFIG,
  WHATSAPP_CONFIG,
  LOYALTY_TIERS,
  LOYALTY_POINTS,
  ERROR_CODES,
  ERROR_MESSAGES
};