const rateLimit = require('express-rate-limit');

// Limites globais
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 1000, // limite por IP
  message: {
    error: 'Muitas requisições',
    message: 'Por favor, tente novamente mais tarde'
  },
  standardHeaders: true,
  legacyHeaders: false
});

// Limites para autenticação
const authLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hora
  max: 10, // 10 tentativas por hora por IP
  message: {
    error: 'Muitas tentativas de login',
    message: 'Por favor, tente novamente em 1 hora'
  }
});

// Limites para API pública
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // 100 requisições por IP
  message: {
    error: 'Limite de API excedido',
    message: 'Por favor, tente novamente mais tarde'
  }
});

// Limites para envio de emails
const emailLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hora
  max: 5, // 5 emails por hora por IP
  message: {
    error: 'Limite de emails excedido',
    message: 'Por favor, tente novamente em 1 hora'
  }
});

// Limites para criação de contas
const accountCreationLimiter = rateLimit({
  windowMs: 24 * 60 * 60 * 1000, // 24 horas
  max: 3, // 3 contas por dia por IP
  message: {
    error: 'Limite de criação de contas',
    message: 'Por favor, tente novamente amanhã'
  }
});

// Limites para endpoints específicos
const trackingLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minuto
  max: 30, // 30 requisições por minuto
  message: {
    error: 'Muitas requisições de rastreio',
    message: 'Por favor, espere um momento'
  }
});

// Middleware para aplicar limites baseados no usuário
const userBasedRateLimit = (req, res, next) => {
  // Se o usuário estiver autenticado, aplicar limites mais altos
  if (req.user) {
    return next(); // Usuários autenticados têm limites mais altos
  }
  
  // Para usuários não autenticados, aplicar limite padrão
  return apiLimiter(req, res, next);
};

// Middleware para admin (sem limites)
const adminRateLimit = (req, res, next) => {
  // Admins não têm limites de rate
  if (req.user && req.user.role === 'admin') {
    return next();
  }
  
  return globalLimiter(req, res, next);
};

module.exports = {
  globalLimiter,
  authLimiter,
  apiLimiter,
  emailLimiter,
  accountCreationLimiter,
  trackingLimiter,
  userBasedRateLimit,
  adminRateLimit
};