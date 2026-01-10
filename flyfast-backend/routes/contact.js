const express = require('express');
const router = express.Router();
const { db } = require('../config/firebase');
const { body, validationResult } = require('express-validator');

router.post('/', [
  body('name').notEmpty().withMessage('Nome é obrigatório'),
  body('email').isEmail().withMessage('Email inválido'),
  body('message').notEmpty().withMessage('Mensagem é obrigatória')
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ error: errors.array()[0].msg });
  }

  const { name, email, phone, subject, message } = req.body;

  try {
    await db.collection('contactRequests').add({
      name,
      email,
      phone: phone || null,
      subject: subject || 'Sem Assunto',
      message,
      createdAt: new Date().toISOString(),
      read: false
    });
    res.json({ message: 'Mensagem enviada com sucesso!' });
  } catch (error) {
    console.error('Erro ao salvar mensagem:', error);
    res.status(500).json({ error: 'Erro ao enviar mensagem.' });
  }
});

module.exports = router;