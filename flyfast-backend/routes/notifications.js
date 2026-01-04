const express = require('express');
const router = express.Router();
const { db } = require('../config/firebase');
const { isAuthenticated } = require('../middleware/authMiddleware');

// GET /api/notifications - Listar notificações do utilizador
router.get('/', isAuthenticated, async (req, res) => {
  try {
    const userId = req.user.uid;
    
    // Tenta buscar ordenado pelo Firestore
    try {
      const snapshot = await db.collection('notifications')
        .where('userId', '==', userId)
        .orderBy('createdAt', 'desc')
        .limit(50)
        .get();

      const notifications = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      return res.json(notifications);

    } catch (firestoreError) {
      // Fallback: Se der erro de índice (Code 9), busca sem ordenar e ordena em memória
      if (firestoreError.code === 9 || firestoreError.message.includes('index')) {
        const snapshot = await db.collection('notifications')
          .where('userId', '==', userId)
          .get();
        
        const notifications = snapshot.docs
          .map(doc => ({ id: doc.id, ...doc.data() }))
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
          .slice(0, 50);
          
        return res.json(notifications);
      }
      throw firestoreError;
    }
  } catch (error) {
    console.error('Erro ao buscar notificações:', error);
    res.status(500).json({ error: 'Erro ao carregar notificações.' });
  }
});

// PUT /api/notifications/read-all - Marcar todas como lidas
router.put('/read-all', isAuthenticated, async (req, res) => {
  try {
    const userId = req.user.uid;
    const batch = db.batch();
    
    const snapshot = await db.collection('notifications')
      .where('userId', '==', userId)
      .where('read', '==', false)
      .get();

    if (snapshot.empty) {
      return res.json({ message: 'Nenhuma notificação pendente.' });
    }

    snapshot.docs.forEach(doc => {
      batch.update(doc.ref, { read: true });
    });

    await batch.commit();
    res.json({ success: true, count: snapshot.size });
  } catch (error) {
    console.error('Erro ao marcar todas como lidas:', error);
    res.status(500).json({ error: 'Erro ao atualizar notificações.' });
  }
});

// PUT /api/notifications/:id/read - Marcar uma como lida
router.put('/:id/read', isAuthenticated, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.uid;
    
    const docRef = db.collection('notifications').doc(id);
    // Nota: Em produção, validar se o doc pertence ao user antes de update
    await docRef.update({ read: true });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao atualizar notificação.' });
  }
});

module.exports = router;