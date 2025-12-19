const { verifyIdToken } = require('../config/firebase');

const auth = async (req, res, next) => {
  try {
    // Obter token do header
    const authHeader = req.header('Authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        error: 'Acesso não autorizado',
        message: 'Token de autenticação não fornecido'
      });
    }

    const token = authHeader.replace('Bearer ', '');
    
    // Verificar token Firebase
    const decoded = await verifyIdToken(token);
    
    // Buscar dados do usuário no Firestore
    const { db } = require('../config/firebase');
    const userDoc = await db.collection('users').doc(decoded.uid).get();
    
    if (!userDoc.exists) {
      return res.status(401).json({
        error: 'Acesso não autorizado',
        message: 'Utilizador não encontrado'
      });
    }

    const userData = userDoc.data();
    
    // Verificar se usuário está ativo
    if (!userData.isActive) {
      return res.status(403).json({
        error: 'Conta desativada',
        message: 'A sua conta foi desativada'
      });
    }

    // Adicionar usuário ao request
    req.user = {
      id: decoded.uid,
      ...userData
    };
    req.token = token;

    next();
  } catch (error) {
    console.error('Auth middleware error:', error.message);
    
    if (error.message.includes('Token inválido')) {
      return res.status(401).json({
        error: 'Acesso não autorizado',
        message: 'Token inválido ou expirado'
      });
    }

    res.status(500).json({
      error: 'Erro de autenticação',
      message: error.message
    });
  }
};

const adminAuth = async (req, res, next) => {
  try {
    await auth(req, res, () => {
      if (req.user.role !== 'admin') {
        return res.status(403).json({
          error: 'Acesso negado',
          message: 'Apenas administradores podem aceder a esta funcionalidade'
        });
      }
      next();
    });
  } catch (error) {
    res.status(500).json({
      error: 'Erro de autorização',
      message: error.message
    });
  }
};

const staffAuth = async (req, res, next) => {
  try {
    await auth(req, res, () => {
      if (!['admin', 'staff'].includes(req.user.role)) {
        return res.status(403).json({
          error: 'Acesso negado',
          message: 'Apenas staff ou administradores podem aceder'
        });
      }
      next();
    });
  } catch (error) {
    res.status(500).json({
      error: 'Erro de autorização',
      message: error.message
    });
  }
};

// Middleware para verificar email verificado
const verifiedEmail = async (req, res, next) => {
  try {
    await auth(req, res, () => {
      if (!req.user.emailVerified) {
        return res.status(403).json({
          error: 'Email não verificado',
          message: 'Por favor, verifique o seu email antes de continuar'
        });
      }
      next();
    });
  } catch (error) {
    res.status(500).json({
      error: 'Erro de verificação',
      message: error.message
    });
  }
};

// Middleware para APIs públicas com rate limiting básico
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.header('Authorization');
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.replace('Bearer ', '');
      const decoded = await verifyIdToken(token);
      
      const { db } = require('../config/firebase');
      const userDoc = await db.collection('users').doc(decoded.uid).get();
      
      if (userDoc.exists) {
        req.user = {
          id: decoded.uid,
          ...userDoc.data()
        };
        req.token = token;
      }
    }
    
    next();
  } catch (error) {
    // Se o token for inválido, apenas continuamos sem usuário
    next();
  }
};

module.exports = {
  auth,
  adminAuth,
  staffAuth,
  verifiedEmail,
  optionalAuth
};