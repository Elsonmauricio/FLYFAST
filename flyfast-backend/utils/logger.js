const winston = require('winston');
const path = require('path');
const fs = require('fs');

// Criar diretório de logs se não existir
const logDir = 'logs';
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir);
}

// Definir formatos
const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.splat(),
  winston.format.json()
);

const consoleFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.timestamp({ format: 'HH:mm:ss' }),
  winston.format.printf(
    ({ timestamp, level, message, ...meta }) => {
      return `[${timestamp}] ${level}: ${message} ${
        Object.keys(meta).length ? JSON.stringify(meta) : ''
      }`;
    }
  )
);

// Criar logger
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: logFormat,
  defaultMeta: { service: 'flyfast-backend' },
  transports: [
    // Arquivo de erro
    new winston.transports.File({
      filename: path.join(logDir, 'error.log'),
      level: 'error',
      maxsize: 5242880, // 5MB
      maxFiles: 10,
    }),
    
    // Arquivo combinado
    new winston.transports.File({
      filename: path.join(logDir, 'combined.log'),
      maxsize: 5242880, // 5MB
      maxFiles: 10,
    }),
    
    // Console (apenas em desenvolvimento)
    ...(process.env.NODE_ENV !== 'production' 
      ? [new winston.transports.Console({ format: consoleFormat })]
      : [])
  ],
});

// Stream para Morgan (HTTP logging)
logger.stream = {
  write: (message) => {
    logger.info(message.trim());
  },
};

// Funções auxiliares
const logRequest = (req, res, next) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    
    logger.info('HTTP Request', {
      method: req.method,
      url: req.originalUrl,
      status: res.statusCode,
      duration: `${duration}ms`,
      ip: req.ip,
      userAgent: req.get('user-agent'),
      userId: req.user ? req.user.id : 'anonymous'
    });
  });
  
  next();
};

const logError = (error, context = {}) => {
  logger.error('Error occurred', {
    error: error.message,
    stack: error.stack,
    ...context
  });
};

const logDatabaseQuery = (collection, operation, query, duration) => {
  logger.debug('Database Query', {
    collection,
    operation,
    query: JSON.stringify(query),
    duration: `${duration}ms`
  });
};

const logPayment = (paymentData) => {
  logger.info('Payment Processed', {
    ...paymentData,
    timestamp: new Date().toISOString()
  });
};

const logShipment = (shipmentData) => {
  logger.info('Shipment Update', {
    ...shipmentData,
    timestamp: new Date().toISOString()
  });
};

const logSecurity = (event, data) => {
  logger.warn('Security Event', {
    event,
    ...data,
    timestamp: new Date().toISOString()
  });
};

module.exports = {
  logger,
  logRequest,
  logError,
  logDatabaseQuery,
  logPayment,
  logShipment,
  logSecurity
};