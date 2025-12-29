const express = require('express');
const router = express.Router();
const { db } = require('../config/firebase');
const { isAuthenticated } = require('../middleware/authMiddleware');

// POST /api/users/create-profile
router.post('/create-profile', isAuthenticated, async (req, res) => {
  try {
    const { name } = req.body;
    const { uid, email } = req.user;

    // Cria ou atualiza o documento do utilizador no Firestore
    await db.collection('users').doc(uid).set({
      name,
      email,
      memberSince: new Date().getFullYear(),
      loyaltyPoints: 0,
      createdAt: new Date().toISOString(),
      role: 'customer'
    }, { merge: true });

    res.status(201).json({ message: 'Perfil criado com sucesso' });
  } catch (error) {
    console.error('Erro ao criar perfil:', error);
    res.status(500).json({ error: 'Erro ao criar perfil' });
  }
});

module.exports = router;