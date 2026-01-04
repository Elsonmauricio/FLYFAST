const express = require('express');
const router = express.Router();
const { db, auth } = require('../config/firebase');
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

// PUT /api/users/me - Atualizar perfil, preferências e password
router.put('/me', isAuthenticated, async (req, res) => {
  try {
    const userId = req.user.uid;
    const { name, phone, preferences, password } = req.body;
    
    const updates = {
      updatedAt: new Date().toISOString()
    };

    // Atualizar campos no Firestore se existirem
    if (name !== undefined) updates.name = name;
    if (phone !== undefined) updates.phone = phone;
    if (preferences !== undefined) updates.preferences = preferences;

    // Atualizar Password no Firebase Auth (se fornecida)
    if (password && password.trim() !== '') {
      await auth.updateUser(userId, {
        password: password
      });
    }

    // Salvar alterações no Firestore
    await db.collection('users').doc(userId).set(updates, { merge: true });
    
    res.json({ message: 'Perfil atualizado com sucesso.', updates });
  } catch (error) {
    console.error('Erro ao atualizar perfil:', error);
    res.status(500).json({ error: 'Erro ao atualizar perfil: ' + error.message });
  }
});

module.exports = router;