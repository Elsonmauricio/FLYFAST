const multer = require('multer');
const storageService = require('../services/storageService');

// Configurar multer para memória (não salvar no disco)
const storage = multer.memoryStorage();

const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
    files: 10 // máximo de 10 arquivos
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = {
      'image/jpeg': true,
      'image/jpg': true,
      'image/png': true,
      'image/gif': true,
      'image/webp': true,
      'application/pdf': true,
      'application/msword': true,
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': true,
      'text/plain': true
    };

    if (allowedTypes[file.mimetype]) {
      cb(null, true);
    } else {
      cb(new Error(`Tipo de arquivo não permitido: ${file.mimetype}`), false);
    }
  }
});

// Middlewares específicos
const uploadSingle = (fieldName) => upload.single(fieldName);
const uploadMultiple = (fieldName, maxCount) => upload.array(fieldName, maxCount);
const uploadFields = (fields) => upload.fields(fields);

// Middleware para processar upload e salvar no Firebase Storage
const processFirebaseUpload = (folder = 'uploads', options = {}) => {
  return async (req, res, next) => {
    try {
      if (!req.file && !req.files) {
        return next();
      }

      let uploadResult;

      if (req.file) {
        // Upload único
        uploadResult = await storageService.uploadFile(req.file, folder, options);
        
        if (uploadResult.success) {
          req.uploadedFile = uploadResult;
          req.file.firebaseUrl = uploadResult.url;
          req.file.firebaseName = uploadResult.fileName;
        } else {
          throw new Error(uploadResult.error);
        }
      } else if (req.files) {
        // Upload múltiplo
        const files = Array.isArray(req.files) ? req.files : req.files[Object.keys(req.files)[0]];
        uploadResult = await storageService.uploadMultipleFiles(files, folder, options);
        
        if (uploadResult.success) {
          req.uploadedFiles = uploadResult;
          
          // Adicionar URLs aos objetos de arquivo
          if (Array.isArray(req.files)) {
            req.files.forEach((file, index) => {
              if (uploadResult.files[index]) {
                file.firebaseUrl = uploadResult.files[index].url;
                file.firebaseName = uploadResult.files[index].fileName;
              }
            });
          }
        } else {
          throw new Error(uploadResult.error);
        }
      }

      next();
    } catch (error) {
      console.error('Error processing Firebase upload:', error);
      res.status(400).json({
        error: 'Erro no upload do arquivo',
        message: error.message
      });
    }
  };
};

// Upload específico para categorias
const uploadUserAvatar = [
  uploadSingle('avatar'),
  processFirebaseUpload('users/avatars', {
    public: true,
    maxSizeMB: 5,
    allowedTypes: ['image/jpeg', 'image/png', 'image/gif']
  })
];

const uploadShipmentDocument = [
  uploadSingle('document'),
  processFirebaseUpload('shipments/documents', {
    public: false,
    maxSizeMB: 10,
    allowedTypes: ['image/jpeg', 'image/png', 'application/pdf']
  })
];

const uploadProductImages = [
  uploadMultiple('images', 5),
  processFirebaseUpload('products/images', {
    public: true,
    maxSizeMB: 5,
    allowedTypes: ['image/jpeg', 'image/png', 'image/webp']
  })
];

const uploadPersonalShopperAttachments = [
  uploadMultiple('attachments', 3),
  processFirebaseUpload('personal-shopper/attachments', {
    public: false,
    maxSizeMB: 10,
    allowedTypes: ['image/jpeg', 'image/png', 'application/pdf']
  })
];

// Middleware para deletar arquivo do Firebase
const deleteFirebaseFile = async (fileName) => {
  try {
    await storageService.deleteFile(fileName);
    return true;
  } catch (error) {
    console.error('Error deleting Firebase file:', error);
    return false;
  }
};

module.exports = {
  upload,
  uploadSingle,
  uploadMultiple,
  uploadFields,
  processFirebaseUpload,
  uploadUserAvatar,
  uploadShipmentDocument,
  uploadProductImages,
  uploadPersonalShopperAttachments,
  deleteFirebaseFile
};