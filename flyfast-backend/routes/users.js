const express = require('express');
const router = express.Router();
const { db, FieldValue } = require('../config/firebase');

// Cria o perfil do usuário após registro
// Endpoint: POST /api/users/create-profile
router.post('/create-profile', async (req, res) => {
  const { uid, email, name } = req.body;

  if (!uid || !email) {
    return res.status(400).json({ error: 'UID e Email são obrigatórios' });
  }

  try {
    await db.collection('users').doc(uid).set({
      uid,
      email,
      name: name || '',
      role: 'user',
      createdAt: FieldValue.serverTimestamp(),
      memberSince: new Date().getFullYear(),
      loyaltyPoints: 0,
    }, { merge: true }); // merge: true garante que não sobrescrevemos dados se já existirem

    res.status(200).json({ message: "Usuário criado no Firestore" });
  } catch (error) {
    console.error('Erro ao criar perfil:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;