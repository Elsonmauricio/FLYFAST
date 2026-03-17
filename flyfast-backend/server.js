const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const compression = require('compression');
require('express-async-errors'); // Para capturar erros em rotas async
require('dotenv').config();

// --- Verificação de Variáveis de Ambiente na Inicialização ---
const essentialEnvs = [
  'SHOPIFY_STOREFRONT_TOKEN',
  'SHOPIFY_DOMAIN',
  'FRONTEND_URL',
  // Adicione aqui outras variáveis essenciais, como as do Firebase
  'FIREBASE_PROJECT_ID',
  'FIREBASE_CLIENT_EMAIL',
  'FIREBASE_PRIVATE_KEY'
];

console.log('--- Verificando Variáveis de Ambiente Essenciais ---');
let hasMissingEnvs = false;
essentialEnvs.forEach(envVar => {
  if (!process.env[envVar]) {
    console.error(`❌ Variável de ambiente em falta: ${envVar}`);
    hasMissingEnvs = true;
  } else {
    console.log(`✅ ${envVar}: Configurada.`);
  }
});
if (hasMissingEnvs) {
  console.error('🚨 ERRO CRÍTICO: Uma ou mais variáveis de ambiente não estão configuradas. O servidor pode não funcionar corretamente.');
}
console.log('----------------------------------------------------');

// Importar configuração Firebase
const { db, auth } = require('./config/firebase');

// Importar rotas
const authRoutes = require('./routes/auth');
const shipmentRoutes = require('./routes/shipments');
const accountRoutes = require('./routes/account');
// Importar rotas do Personal Shopper
const personalShopperRoutes = require('./routes/personalShopper');
const notificationRoutes = require('./routes/notifications');
const adminRoutes = require('./routes/admin');
const userRoutes = require('./routes/users');
const scheduleRoutes = require('./routes/schedules');
const trackingRoutes = require('./routes/tracking');
const contactRoutes = require('./routes/contact');
// No server.js
const pricingRoutes = require('./routes/pricing');

const shopifyRoutes = require('./routes/shopify'); // Certifique-se que este arquivo existe

// Inicializar app
const app = express();

app.set('trust proxy', 1); 

// Middlewares de segurança
app.use(helmet());
app.use(cors({
  origin: function (origin, callback) {
    // DEBUG: Adicione este log para ver a origem de cada pedido nos logs da Vercel
    console.log(`[CORS Check] Pedido recebido da origem: ${origin}`);

    // Lista de origens permitidas. Adicione o seu domínio personalizado se tiver um.
    const allowedOrigins = [process.env.FRONTEND_URL, 'https://flyfast-market.com'];

    // Permitir pedidos sem 'origin' (ex: Postman), de origens na lista,
    // de qualquer subdomínio vercel.app (para previews) e de localhost (para desenvolvimento).
    if (!origin || allowedOrigins.includes(origin) || origin.endsWith('.vercel.app') || origin.includes('localhost')) {
      callback(null, true);
    } else {
      console.error(`[CORS BLOCK] A origem '${origin}' foi bloqueada pela política de CORS.`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100,
  message: {
    error: 'Muitas requisições',
    message: 'Por favor, tente novamente mais tarde'
  }
});
app.use('/api/', limiter);

// Compressão
app.use(compression());

// Logging
app.use(morgan('combined'));

// Body parser
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Configurar rotas
app.use('/api/auth', authRoutes);
app.use('/api/account', accountRoutes);
app.use('/api/shipments', shipmentRoutes);
// Registar rotas do Personal Shopper
app.use('/api/personal-shopper', personalShopperRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/users', userRoutes);
app.use('/api/schedules', scheduleRoutes);
app.use('/api/tracking', trackingRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/pricing', pricingRoutes);
app.use('/api/shopify', shopifyRoutes); // Rota registrada aqui

// Rota de saúde
app.get('/api/health', (req, res) => {
  // Testar conexão com Firebase
  db.collection('health').doc('check').set({
    timestamp: new Date().toISOString(),
    status: 'healthy'
  }).then(() => {
    res.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      service: 'FLYFAST Backend (Firebase)',
      version: '1.0.0',
      database: 'Firebase Firestore (Connected)'
    });
  }).catch(error => {
    res.status(500).json({
      status: 'unhealthy',
      error: error.message,
      database: 'Firebase Firestore (Connection Error)'
    });
  });
});

// Rota de documentação
app.get('/api/docs', (req, res) => {
  res.json({
    documentation: 'API Documentation',
    endpoints: {
      auth: '/api/auth',
      shipments: '/api/shipments',
      personalShopper: '/api/personal-shopper',
      admin: '/api/admin'
    },
    authentication: 'Bearer Token required for protected routes',
    examples: {
      register: 'POST /api/auth/register',
      login: 'POST /api/auth/login',
      track_shipment: 'GET /api/shipments/track/:code'
    }
  });
});

// 404 Handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Endpoint não encontrado',
    path: req.originalUrl,
    suggestion: 'Verifique a documentação em /api/docs'
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('❌ Erro no Servidor:', err.message);
  console.error(err.stack);
  
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Erro interno do servidor';
  
  res.status(statusCode).json({
    error: message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// Iniciar servidor
const PORT = process.env.PORT || 5000;

let server;
// Apenas inicia o servidor se este ficheiro for executado diretamente (Localmente)
if (require.main === module) {
  server = app.listen(PORT, () => {
    console.log(`🚀 Servidor FLYFAST (Firebase) rodando na porta ${PORT}`);
    console.log(`📁 Ambiente: ${process.env.NODE_ENV}`);
    console.log(`🔗 Frontend: ${process.env.FRONTEND_URL}`);
    console.log(`🗄️  Database: Firebase Firestore`);
    console.log(`🔐 Auth: Firebase Authentication`);
    console.log(`💾 Storage: Firebase Storage`);
  });
}

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  server.close(() => {
    console.log('HTTP server closed');
    process.exit(0);
  });
});

module.exports = { app, server };