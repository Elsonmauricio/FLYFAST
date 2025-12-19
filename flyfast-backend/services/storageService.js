const { storage } = require('../config/firebase');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

class StorageService {
  // Upload de arquivo
  async uploadFile(file, folder = 'uploads', options = {}) {
    try {
      const {
        public: isPublic = false,
        maxSizeMB = 10,
        allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'application/pdf']
      } = options;

      // Validar tipo de arquivo
      if (!allowedTypes.includes(file.mimetype)) {
        throw new Error(`Tipo de arquivo não permitido: ${file.mimetype}`);
      }

      // Validar tamanho
      if (file.size > maxSizeMB * 1024 * 1024) {
        throw new Error(`Arquivo muito grande. Máximo: ${maxSizeMB}MB`);
      }

      // Gerar nome único
      const fileExtension = path.extname(file.originalname);
      const fileName = `${folder}/${uuidv4()}${fileExtension}`;
      
      // Criar buffer do arquivo
      const buffer = file.buffer;
      
      // Upload para Firebase Storage
      const fileRef = storage.file(fileName);
      
      await fileRef.save(buffer, {
        metadata: {
          contentType: file.mimetype,
          metadata: {
            originalName: file.originalname,
            size: file.size,
            uploadedAt: new Date().toISOString()
          }
        }
      });

      // Tornar público se necessário
      if (isPublic) {
        await fileRef.makePublic();
      }

      // Obter URL pública
      const [url] = await fileRef.getSignedUrl({
        action: 'read',
        expires: '03-01-2500' // Data longa no futuro
      });

      return {
        success: true,
        fileName,
        url,
        publicUrl: isPublic ? fileRef.publicUrl() : null,
        metadata: {
          originalName: file.originalname,
          size: file.size,
          contentType: file.mimetype,
          folder
        }
      };
    } catch (error) {
      console.error('Error uploading file:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Upload múltiplos arquivos
  async uploadMultipleFiles(files, folder = 'uploads', options = {}) {
    try {
      const uploadPromises = files.map(file => 
        this.uploadFile(file, folder, options)
      );
      
      const results = await Promise.all(uploadPromises);
      
      const successful = results.filter(r => r.success);
      const failed = results.filter(r => !r.success);
      
      return {
        success: true,
        total: files.length,
        uploaded: successful.length,
        failed: failed.length,
        files: successful,
        errors: failed.map(f => f.error)
      };
    } catch (error) {
      console.error('Error uploading multiple files:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Deletar arquivo
  async deleteFile(fileName) {
    try {
      const fileRef = storage.file(fileName);
      await fileRef.delete();
      
      return {
        success: true,
        message: 'Arquivo deletado com sucesso'
      };
    } catch (error) {
      console.error('Error deleting file:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Obter URL do arquivo
  async getFileUrl(fileName, expiresInHours = 24) {
    try {
      const fileRef = storage.file(fileName);
      
      // Verificar se arquivo existe
      const [exists] = await fileRef.exists();
      if (!exists) {
        throw new Error('Arquivo não encontrado');
      }
      
      // Gerar URL assinada
      const expires = new Date();
      expires.setHours(expires.getHours() + expiresInHours);
      
      const [url] = await fileRef.getSignedUrl({
        action: 'read',
        expires
      });
      
      return {
        success: true,
        url,
        expires
      };
    } catch (error) {
      console.error('Error getting file URL:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Listar arquivos em uma pasta
  async listFiles(folder = '', options = {}) {
    try {
      const { maxResults = 100, prefix = folder } = options;
      
      const [files] = await storage.getFiles({
        prefix,
        maxResults
      });
      
      const fileList = await Promise.all(
        files.map(async file => {
          const [metadata] = await file.getMetadata();
          const [url] = await file.getSignedUrl({
            action: 'read',
            expires: '03-01-2500'
          });
          
          return {
            name: file.name,
            url,
            metadata: {
              contentType: metadata.contentType,
              size: metadata.size,
              updated: metadata.updated,
              timeCreated: metadata.timeCreated
            }
          };
        })
      );
      
      return {
        success: true,
        files: fileList,
        total: fileList.length
      };
    } catch (error) {
      console.error('Error listing files:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Upload para categorias específicas
  async uploadUserAvatar(userId, file) {
    return this.uploadFile(file, `users/${userId}/avatar`, {
      public: true,
      maxSizeMB: 5,
      allowedTypes: ['image/jpeg', 'image/png', 'image/gif']
    });
  }

  async uploadShipmentDocument(shipmentId, file) {
    return this.uploadFile(file, `shipments/${shipmentId}/documents`, {
      public: false,
      maxSizeMB: 10,
      allowedTypes: ['image/jpeg', 'image/png', 'application/pdf']
    });
  }

  async uploadProductImage(productId, file) {
    return this.uploadFile(file, `products/${productId}/images`, {
      public: true,
      maxSizeMB: 5,
      allowedTypes: ['image/jpeg', 'image/png', 'image/webp']
    });
  }

  async uploadPersonalShopperAttachment(requestId, file) {
    return this.uploadFile(file, `personal-shopper/${requestId}/attachments`, {
      public: false,
      maxSizeMB: 10,
      allowedTypes: ['image/jpeg', 'image/png', 'application/pdf']
    });
  }
}

module.exports = new StorageService();