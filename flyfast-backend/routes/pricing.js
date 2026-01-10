const express = require('express');
const router = express.Router();
const { db } = require('../config/firebase');

// GET /api/pricing - Rota Pública para obter a tabela de preços
router.get('/', async (req, res) => {
  try {
    const doc = await db.collection('settings').doc('pricing').get();
    
    if (!doc.exists) {
      // Retorna valores padrão se não existir configuração
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

module.exports = router;
