const admin = require('firebase-admin');

/**
 * Faz upload de um ficheiro para o Firebase Storage (Google Cloud Storage)
 * @param {String} requestId - O ID do pedido para organizar a pasta
 * @param {Object} file - O objeto de ficheiro do Multer
 */
const uploadPersonalShopperAttachment = async (requestId, file) => {
  try {
    const bucket = admin.storage().bucket();
    
    // Verificação de segurança para garantir que o bucket está configurado
    if (!bucket.name) {
      console.warn('⚠️ AVISO: O nome do bucket está indefinido. Verifique o "storageBucket" no config/firebase.js');
    }
    console.log(`📦 [Storage] A iniciar upload para o bucket: ${bucket.name}`);

    const extension = file.originalname.split('.').pop();
    // Cria um caminho organizado: personal-shopper/ID_DO_PEDIDO/timestamp.ext
    const fileName = `personal-shopper/${requestId}/${Date.now()}_${Math.floor(Math.random() * 1000)}.${extension}`;
    const fileUpload = bucket.file(fileName);

    await fileUpload.save(file.buffer, {
      metadata: {
        contentType: file.mimetype,
      },
      public: true, // Torna o ficheiro acessível publicamente
    });

    // Gera o URL público
    const publicUrl = `https://storage.googleapis.com/${bucket.name}/${fileName}`;

    return { success: true, url: publicUrl, fileName: fileName };
  } catch (error) {
    console.error('Erro no upload para Storage:', error);
    
    if (error.code === 404) {
      return { success: false, error: `O bucket '${admin.storage().bucket().name}' não existe. Vá ao Firebase Console > Storage e clique em "Get Started" para criar o bucket.` };
    }
    
    return { success: false, error: error.message };
  }
};

module.exports = { uploadPersonalShopperAttachment };