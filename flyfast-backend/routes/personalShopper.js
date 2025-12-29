const express = require('express');
const router = express.Router();
const { db } = require('../config/firebase');
const { isAuthenticated } = require('../middleware/authMiddleware');
const multer = require('multer');
const { google } = require('googleapis');
const { PassThrough } = require('stream');
const path = require('path');
// Configuração básica do multer para processar multipart/form-data (ficheiros em memória)
const upload = multer({ storage: multer.memoryStorage() });

// GET /api/personal-shopper - Listar pedidos do utilizador
router.get('/', isAuthenticated, async (req, res) => {
  try {
    const userId = req.user.uid;
    const snapshot = await db.collection('personalShopperRequests')
      .where('userId', '==', userId)
      .orderBy('createdAt', 'desc')
      .get();

    const requests = [];
    snapshot.forEach(doc => {
      requests.push({ id: doc.id, ...doc.data() });
    });

    res.json(requests);
  } catch (error) {
    console.error('Erro ao buscar pedidos de Personal Shopper:', error);
    res.status(500).json({ error: 'Erro ao buscar pedidos.' });
  }
});

// GET /api/personal-shopper/admin/requests - Listar TODOS os pedidos (para o Admin)
router.get('/admin/requests', isAuthenticated, async (req, res) => {
  try {
    // Nota: Em produção, deve adicionar um middleware para verificar se o utilizador é admin
    const snapshot = await db.collection('personalShopperRequests')
      .orderBy('createdAt', 'desc')
      .get();

    const requests = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    res.json(requests);
  } catch (error) {
    console.error('Erro ao buscar todos os pedidos (admin):', error);
    res.status(500).json({ error: 'Erro ao buscar pedidos.' });
  }
});

// PUT /api/personal-shopper/requests/:id/status - Atualizar estado do pedido (Admin)
router.put('/requests/:id/status', isAuthenticated, async (req, res) => {
  try {
    // TODO: Adicionar verificação se req.user.role === 'admin'
    const { id } = req.params;
    const { status } = req.body;

    if (!status) return res.status(400).json({ error: 'Status é obrigatório' });

    await db.collection('personalShopperRequests').doc(id).update({ status, updatedAt: new Date().toISOString() });
    res.json({ success: true, status });
  } catch (error) {
    console.error('Erro ao atualizar status:', error);
    res.status(500).json({ error: 'Erro ao atualizar status.' });
  }
});

// POST /api/personal-shopper/requests - Criar novo pedido
// Adicionado middleware upload.single('attachment') para processar o ficheiro e os campos do formulário
router.post('/requests', isAuthenticated, upload.single('attachment'), async (req, res) => {
  try {
    // Com o multer, req.body agora contém os campos de texto do FormData
    const { productName, productLink, details, budget, deliveryCountry, name, email, phone } = req.body;
    const userId = req.user.uid;

    // Se houver ficheiro, ele estará disponível em req.file
    let attachmentInfo = null;

    if (req.file) {
      try {
        // Configuração Google Drive
        // Certifique-se de ter o ficheiro de credenciais na pasta config (ex: google-drive.json)
        // e que a API do Google Drive está ativada no seu projeto Google Cloud.
        const KEY_FILE_PATH = path.join(__dirname, '../config/google-drive.json');
        const SCOPES = ['https://www.googleapis.com/auth/drive.file'];

        const auth = new google.auth.GoogleAuth({
          keyFile: KEY_FILE_PATH,
          scopes: SCOPES,
        });

        const drive = google.drive({ version: 'v3', auth });

        const bufferStream = new PassThrough();
        bufferStream.end(req.file.buffer);

        const driveResponse = await drive.files.create({
          media: { mimeType: req.file.mimetype, body: bufferStream },
          requestBody: {
            name: `${Date.now()}_${req.file.originalname}`,
            parents: ['ID_DA_PASTA_AQUI'], // Substitua pelo ID da sua pasta do Google Drive
          },
          fields: 'id, name, webViewLink, size',
        });

        attachmentInfo = {
          name: driveResponse.data.name,
          size: parseInt(driveResponse.data.size),
          link: driveResponse.data.webViewLink, // Link para visualizar/baixar
          fileId: driveResponse.data.id
        };
      } catch (uploadError) {
        console.error('Erro ao fazer upload para o Google Drive:', uploadError);
        // Salva metadados básicos mesmo se o upload falhar, para registo
        attachmentInfo = { name: req.file.originalname, size: req.file.size, error: 'Falha no upload' };
      }
    }

    const newRequest = {
      userId,
      productName,
      productLink: productLink || '',
      details: details || '',
      budget: budget || '',
      deliveryCountry,
      contact: { name, email, phone },
      attachment: attachmentInfo,
      status: 'pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const docRef = await db.collection('personalShopperRequests').add(newRequest);
    
    res.status(201).json({ id: docRef.id, ...newRequest });
  } catch (error) {
    console.error('Erro ao criar pedido de Personal Shopper:', error);
    res.status(500).json({ error: 'Erro ao criar pedido.' });
  }
});

module.exports = router;