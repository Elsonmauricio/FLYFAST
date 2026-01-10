const express = require('express');
const router = express.Router();
const { db, auth } = require('../config/firebase');

// Middleware de autenticação
const authenticate = async (req, res, next) => {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Token não fornecido' });
  }
  const token = header.split(' ')[1];
  try {
    const decodedToken = await auth.verifyIdToken(token);
    req.user = decodedToken;
    next();
  } catch (error) {
    console.error('Erro de autenticação:', error);
    res.status(401).json({ error: 'Token inválido' });
  }
};

// Middleware para verificar se é Admin
const isAdmin = async (req, res, next) => {
  try {
    const { uid } = req.user;
    const userDoc = await db.collection('users').doc(uid).get();
    if (userDoc.exists && userDoc.data().role === 'admin') {
      next();
    } else {
      res.status(403).json({ error: 'Acesso negado. Requer permissões de administrador.' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Erro interno ao verificar permissões.' });
  }
};

// GET /api/users/me - Obter dados do utilizador logado
router.get('/me', authenticate, async (req, res) => {
  try {
    const { uid } = req.user;
    const userDoc = await db.collection('users').doc(uid).get();

    if (!userDoc.exists) {
      return res.status(404).json({ error: 'Utilizador não encontrado' });
    }

    // Retorna os dados do utilizador (incluindo moradas, preferências, etc.)
    res.json({
      id: userDoc.id,
      ...userDoc.data()
    });
  } catch (error) {
    console.error('Erro ao buscar perfil:', error);
    res.status(500).json({ error: 'Erro interno ao buscar perfil' });
  }
});

// PUT /api/users/me - Atualizar dados do utilizador (Moradas, Perfil, Preferências)
router.put('/me', authenticate, async (req, res) => {
  try {
    const { uid } = req.user;
    const updates = req.body;
    
    // Filtra apenas os campos permitidos para segurança
    const allowedFields = ['name', 'phone', 'addresses', 'preferences', 'photoURL'];
    const dataToUpdate = {};

    Object.keys(updates).forEach(key => {
      if (allowedFields.includes(key)) {
        dataToUpdate[key] = updates[key];
      }
    });

    // Atualiza no Firestore (merge: true mantém os outros campos)
    await db.collection('users').doc(uid).set(dataToUpdate, { merge: true });

    res.json({ message: 'Perfil atualizado com sucesso', updatedFields: Object.keys(dataToUpdate) });
  } catch (error) {
    console.error('Erro ao atualizar perfil:', error);
    res.status(500).json({ error: 'Erro interno ao atualizar perfil' });
  }
});

// PUT /api/users/:id - Rota de Admin para atualizar qualquer utilizador (Pontos, Role, etc)
router.put('/:id', authenticate, isAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    
    // Campos que o admin pode alterar
    const allowedFields = ['name', 'phone', 'role', 'loyaltyPoints', 'addresses', 'preferences'];
    const dataToUpdate = {};

    Object.keys(updates).forEach(key => {
      if (allowedFields.includes(key)) {
        dataToUpdate[key] = updates[key];
      }
    });

    await db.collection('users').doc(id).set(dataToUpdate, { merge: true });

    res.json({ message: 'Utilizador atualizado com sucesso', updatedFields: Object.keys(dataToUpdate) });
  } catch (error) {
    console.error('Erro ao atualizar utilizador (Admin):', error);
    res.status(500).json({ error: 'Erro interno ao atualizar utilizador' });
  }
});

module.exports = router;