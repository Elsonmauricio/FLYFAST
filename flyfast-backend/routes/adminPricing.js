const express = require('express');
const router = express.Router();
// Ajusta os caminhos conforme a tua estrutura de pastas
const { db } = require('../lib/firebase'); 
const { isAuthenticated, isAdmin } = require('../middleware/auth');

// 1. GET - Buscar preços atuais para o Admin
router.get('/pricing', isAuthenticated, isAdmin, async (req, res) => {
  try {
    const doc = await db.collection('settings').doc('pricing').get();
    
    if (!doc.exists) {
      // Retorna estrutura padrão se ainda não existir nada na BD
      return res.json({
        pricePerKg: 12.99,
        serviceFee: 0,
        insuranceRate: 0,
        specificArticles: [],
        weightArticles: []
      });
    }
    
    res.json(doc.data());
  } catch (error) {
    console.error('Erro ao buscar preços:', error);
    res.status(500).json({ error: 'Erro ao carregar tabela de preços' });
  }
});

// 2. PUT - Atualizar preços e gerar Log de Auditoria
router.put('/pricing', isAuthenticated, isAdmin, async (req, res) => {
  try {
    const newData = req.body;
    const pricingRef = db.collection('settings').doc('pricing');

    // Buscar dados antigos antes de atualizar (para o log)
    const oldDoc = await pricingRef.get();
    const oldData = oldDoc.exists ? oldDoc.data() : {};

    // Guardar os novos dados
    await pricingRef.set({
      ...newData,
      updatedAt: new Date().toISOString(),
      updatedBy: req.user.uid // Assumindo que o middleware adiciona o user
    }, { merge: true });

    // Criar registo no histórico (Logs)
    await db.collection('pricingLogs').add({
      timestamp: new Date().toISOString(),
      performedBy: req.user.uid,
      performedByEmail: req.user.email || 'Admin',
      action: 'UPDATE_PRICING',
      details: {
        oldValue: { pricePerKg: oldData.pricePerKg },
        newValue: { pricePerKg: newData.pricePerKg }
      }
    });

    res.json({ message: 'Preços atualizados com sucesso' });
  } catch (error) {
    console.error('Erro ao atualizar preços:', error);
    res.status(500).json({ error: 'Erro ao guardar alterações' });
  }
});

// 3. GET - Buscar histórico de logs
router.get('/pricing/logs', isAuthenticated, isAdmin, async (req, res) => {
  try {
    const snapshot = await db.collection('pricingLogs')
      .orderBy('timestamp', 'desc')
      .limit(20) // Limita aos últimos 20 registos
      .get();

    const logs = [];
    snapshot.forEach(doc => {
      logs.push({ id: doc.id, ...doc.data() });
    });

    res.json(logs);
  } catch (error) {
    console.error('Erro ao buscar logs:', error);
    res.status(500).json({ error: 'Erro ao carregar histórico' });
  }
});

module.exports = router;
