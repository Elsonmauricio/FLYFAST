const { auth, db } = require('../config/firebase');

/**
 * Middleware para verificar se o utilizador está autenticado via Firebase ID Token.
 * Extrai o token do cabeçalho 'Authorization', verifica-o com o Firebase Admin SDK
 * e anexa os dados do utilizador decodificado (incluindo uid e roles) ao objeto `req`.
 */
const isAuthenticated = async (req, res, next) => {
  const { authorization } = req.headers;

  if (!authorization || !authorization.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Não autorizado. Token não fornecido ou mal formatado.' });
  }

  const idToken = authorization.split('Bearer ')[1];

  try {
    // auth.verifyIdToken() valida o token e retorna os dados do utilizador
    const decodedToken = await auth.verifyIdToken(idToken);
    req.user = decodedToken; // req.user agora contém uid, email, role, etc.

    // Se o token não tiver a role definida (custom claim), vamos buscar ao Firestore
    if (!req.user.role) {
      const userDoc = await db.collection('users').doc(decodedToken.uid).get();
      if (userDoc.exists) {
        req.user.role = userDoc.data().role;
      }
    }
    next();
  } catch (error) {
    console.error('Erro ao verificar o token de autenticação:', error);
    return res.status(403).json({ message: 'Não autorizado. Token inválido ou expirado.' });
  }
};

/**
 * Middleware para verificar se o utilizador tem uma das roles permitidas.
 * Deve ser usado DEPOIS do middleware `isAuthenticated`.
 * @param {string[]} roles - Um array de roles permitidas (ex: ['admin', 'staff']).
 */
const hasRole = (roles = []) => {
  return (req, res, next) => {
    const { role } = req.user; // A role vem dos custom claims do token

    if (roles.includes(role)) {
      return next();
    }

    return res.status(403).json({ message: 'Acesso negado. Permissões insuficientes.' });
  };
};

module.exports = {
  isAuthenticated,
  hasRole,
};