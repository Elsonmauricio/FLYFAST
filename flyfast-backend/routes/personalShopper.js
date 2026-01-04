const express = require('express');
const router = express.Router();
const multer = require('multer');
const { db } = require('../config/firebase'); // Ajusta conforme a tua config
const storageService = require('../services/storageService');
const { isAuthenticated } = require('../middleware/authMiddleware');

// Configuração do Multer para guardar o ficheiro na memória temporariamente
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // Limite de 5MB
});

// POST /api/personal-shopper/requests (Renomeado de /create para coincidir com o frontend)
router.post('/requests', upload.single('attachment'), async (req, res) => {
  try {
    const { productName, productLink, details, budget, deliveryCountry, name, email, phone } = req.body;
    
    // Gerar o ID do documento antecipadamente para organizar a pasta no Storage
    const docRef = db.collection('personalShopperRequests').doc();
    
    let attachmentData = null;

    // Se houver ficheiro, faz upload para o Firebase Storage
    if (req.file) {
      console.log('A iniciar upload para Firebase Storage...');
      
      // Usa o serviço de storage existente para salvar na pasta 'personal-shopper/{id}/attachments'
      const uploadResult = await storageService.uploadPersonalShopperAttachment(docRef.id, req.file);
      
      if (!uploadResult.success) {
        throw new Error(uploadResult.error || 'Falha no upload do anexo');
      }

      attachmentData = {
        name: req.file.originalname,
        link: uploadResult.url, // URL assinada do Firebase
        viewLink: uploadResult.url
      };
      console.log('Upload concluído:', uploadResult.url);
    }

    // Salvar no Firestore
    const newRequest = {
      productName,
      productLink,
      details,
      budget,
      deliveryCountry,
      contact: {
        name,
        email,
        phone
      },
      attachment: attachmentData,
      status: 'pending',
      createdAt: new Date().toISOString(),
      // Se o utilizador estiver logado, podes adicionar o ID dele aqui (req.user.uid)
    };

    // Usamos .set() porque já gerámos o ID (docRef) acima
    await docRef.set(newRequest);

    res.status(201).json({ 
      message: 'Pedido criado com sucesso', 
      id: docRef.id,
      attachment: attachmentData 
    });

  } catch (error) {
    console.error('Erro ao processar pedido:', error);
    res.status(500).json({ error: 'Erro ao processar o pedido: ' + error.message });
  }
});

// GET /api/personal-shopper/my-requests (Para a área de cliente)
router.get('/my-requests', isAuthenticated, async (req, res) => {
  try {
    const userEmail = req.user.email;
    
    // Procura pedidos onde o email de contacto coincide com o email do utilizador logado
    const snapshot = await db.collection('personalShopperRequests')
      .where('contact.email', '==', userEmail)
      .orderBy('createdAt', 'desc')
      .get();

    const requests = [];
    snapshot.forEach(doc => {
      requests.push({ id: doc.id, ...doc.data() });
    });

    res.json(requests);
  } catch (error) {
    console.error('Erro ao buscar meus pedidos:', error);
    res.status(500).json({ error: 'Erro ao buscar pedidos.' });
  }
});

// GET /api/personal-shopper/admin/requests (Para o painel de admin)
router.get('/admin/requests', isAuthenticated, async (req, res) => {
  // Verifica se é admin (assumindo que o middleware popula req.user.role ou verificamos aqui)
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Acesso negado.' });
  }

  try {
    const snapshot = await db.collection('personalShopperRequests')
      .orderBy('createdAt', 'desc')
      .get();

    const requests = [];
    snapshot.forEach(doc => {
      requests.push({ id: doc.id, ...doc.data() });
    });

    res.json(requests);
  } catch (error) {
    console.error('Erro ao buscar pedidos admin:', error);
    res.status(500).json({ error: 'Erro ao buscar pedidos.' });
  }
});

// PUT /api/personal-shopper/requests/:id/status (Para atualizar estado no admin)
router.put('/requests/:id/status', isAuthenticated, async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Acesso negado.' });
  }

  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status) return res.status(400).json({ error: 'Status é obrigatório' });

    await db.collection('personalShopperRequests').doc(id).update({ 
      status,
      updatedAt: new Date().toISOString()
    });

    res.json({ message: 'Estado atualizado com sucesso' });
  } catch (error) {
    console.error('Erro ao atualizar estado:', error);
    res.status(500).json({ error: 'Erro ao atualizar estado.' });
  }
});

module.exports = router;