const express = require('express');
const router = express.Router();
const { db } = require('../config/firebase');
const { isAuthenticated } = require('../middleware/authMiddleware');

// GET /api/notifications - Busca notificações do utilizador logado
router.get('/', isAuthenticated, async (req, res) => {
  try {
    const userId = req.user.uid;
    
    const snapshot = await db.collection('users')
      .doc(userId)
      .collection('notifications')
      .orderBy('createdAt', 'desc')
      .limit(20)
      .get();

    const notifications = [];
    snapshot.forEach(doc => {
      notifications.push({
        id: doc.id,
        ...doc.data()
      });
    });

    res.json(notifications);
  } catch (error) {
    console.error('Erro ao buscar notificações:', error);
    res.status(500).json({ error: 'Erro interno ao buscar notificações.' });
  }
});

module.exports = router;