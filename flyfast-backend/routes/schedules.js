const express = require('express');
const router = express.Router();
const { db } = require('../config/firebase');

// TODO: Importar middleware de autenticação (ex: const { verifyToken, verifyAdmin } = require('../middleware/auth');)

// GET /api/schedules - Listar todas as rotas disponíveis (futuras)
router.get('/', async (req, res) => {
  try {
    const { limit, startAfter } = req.query;
    const today = new Date().toISOString().split('T')[0];
    
    let query = db.collection('schedules')
      .where('date', '>=', today)
      .orderBy('date', 'asc');

    // Se houver cursor, começa depois desse documento
    if (startAfter) {
      const lastDoc = await db.collection('schedules').doc(startAfter).get();
      if (lastDoc.exists) {
        query = query.startAfter(lastDoc);
      }
    }

    // Se houver limite, aplica-o
    if (limit) {
      query = query.limit(parseInt(limit));
    }

    const snapshot = await query.get();

    const schedules = [];
    snapshot.forEach(doc => {
      schedules.push({ id: doc.id, ...doc.data() });
    });

    // Se foi pedido com paginação, retorna objeto com metadados
    if (limit) {
      const lastVisible = snapshot.docs.length > 0 ? snapshot.docs[snapshot.docs.length - 1].id : null;
      // Se recebemos menos documentos que o limite, chegámos ao fim
      const hasMore = snapshot.docs.length === parseInt(limit);
      
      return res.json({
        schedules,
        lastVisible: hasMore ? lastVisible : null
      });
    }

    // Comportamento padrão (sem paginação) para o site público
    res.json(schedules);
  } catch (error) {
    console.error('Erro ao buscar rotas:', error);
    res.status(500).json({ error: 'Erro ao buscar rotas em tempo real.' });
  }
});

// POST /api/schedules - Criar nova rota (Admin)
// Adicione verifyToken e verifyAdmin aqui
router.post('/', async (req, res) => {
  try {
    const { from, to, date, departureTime, price, capacity, duration } = req.body;

    if (!from || !to || !date || !price) {
      return res.status(400).json({ error: 'Dados incompletos' });
    }

    // Validação: Impedir datas passadas
    const today = new Date().toISOString().split('T')[0];
    if (date < today) {
      return res.status(400).json({ error: 'Não é possível criar rotas com datas passadas.' });
    }

    // Validação e Sanitização da Capacidade
    let numericCapacity = 50; // Valor padrão
    if (capacity) {
      const parsed = parseFloat(String(capacity).replace(/[^0-9.]/g, ''));
      if (isNaN(parsed) || parsed <= 0) {
        return res.status(400).json({ error: 'A capacidade deve ser um número positivo.' });
      }
      numericCapacity = parsed;
    }

    const newRoute = {
      from,
      to,
      date,
      departureTime: departureTime || '',
      price,
      capacity: numericCapacity,
      duration: duration || '6h 30m', // Valor padrão se não for preenchido
      available: numericCapacity,
      createdAt: new Date().toISOString()
    };

    const docRef = await db.collection('schedules').add(newRoute);
    res.status(201).json({ id: docRef.id, ...newRoute });
  } catch (error) {
    console.error('Erro ao criar rota:', error);
    res.status(500).json({ error: 'Erro ao criar rota' });
  }
});

// PUT /api/schedules/:id - Atualizar rota (Admin)
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    delete updates.id; // Proteção: não permitir mudar o ID
    
    // Validação de Capacidade na edição
    if (updates.capacity !== undefined) {
      const parsed = parseFloat(String(updates.capacity).replace(/[^0-9.]/g, ''));
      if (isNaN(parsed) || parsed <= 0) {
        return res.status(400).json({ error: 'A capacidade deve ser um número positivo.' });
      }
      updates.capacity = parsed;
    }

    await db.collection('schedules').doc(id).update(updates);
    res.json({ message: 'Rota atualizada com sucesso' });
  } catch (error) {
    console.error('Erro ao atualizar rota:', error);
    res.status(500).json({ error: 'Erro ao atualizar rota' });
  }
});

// DELETE /api/schedules/:id - Apagar rota (Admin)
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await db.collection('schedules').doc(id).delete();
    res.json({ message: 'Rota removida com sucesso' });
  } catch (error) {
    console.error('Erro ao remover rota:', error);
    res.status(500).json({ error: 'Erro ao remover rota' });
  }
});

module.exports = router;