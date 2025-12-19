const { auth, db, FieldValue } = require('../config/firebase');

class AuthService {
  // Criar usuário
  async createUser(email, password, userData) {
    try {
      // Criar no Firebase Auth
      const firebaseUser = await auth.createUser({
        email,
        password,
        displayName: userData.name,
        phoneNumber: userData.phone,
        emailVerified: false,
        disabled: false
      });

      // Criar documento no Firestore
      const userDoc = {
        uid: firebaseUser.uid,
        email,
        name: userData.name,
        phone: userData.phone,
        role: 'user',
        isActive: true,
        emailVerified: false,
        preferences: {
          notifications: {
            email: true,
            sms: true,
            whatsapp: true,
            push: true
          },
          language: 'pt',
          currency: 'AOA'
        },
        addresses: [],
        loyaltyPoints: 0,
        loyaltyTier: 'bronze',
        stripeCustomerId: null,
        lastLogin: null,
        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp()
      };

      await db.collection('users').doc(firebaseUser.uid).set(userDoc);

      // Gerar token personalizado
      const customToken = await auth.createCustomToken(firebaseUser.uid);

      return {
        success: true,
        user: {
          id: firebaseUser.uid,
          ...userDoc
        },
        token: customToken,
        firebaseUser
      };
    } catch (error) {
      console.error('Error creating user:', error);
      return {
        success: false,
        error: error.message,
        code: this.getErrorCode(error)
      };
    }
  }

  // Login com email/password
  async login(email, password) {
    try {
      // Em produção, usarias Firebase Admin SDK ou Firebase Client SDK
      // Esta é uma versão simplificada
      const userRecord = await auth.getUserByEmail(email);
      
      // Verificar se usuário está ativo no Firestore
      const userDoc = await db.collection('users').doc(userRecord.uid).get();
      
      if (!userDoc.exists || !userDoc.data().isActive) {
        return {
          success: false,
          error: 'Conta desativada ou não encontrada'
        };
      }

      // Atualizar último login
      await db.collection('users').doc(userRecord.uid).update({
        lastLogin: FieldValue.serverTimestamp()
      });

      // Gerar token personalizado
      const customToken = await auth.createCustomToken(userRecord.uid);

      return {
        success: true,
        user: {
          id: userRecord.uid,
          ...userDoc.data()
        },
        token: customToken
      };
    } catch (error) {
      console.error('Error in login:', error);
      return {
        success: false,
        error: 'Credenciais inválidas',
        code: this.getErrorCode(error)
      };
    }
  }

  // Verificar token
  async verifyToken(idToken) {
    try {
      const decodedToken = await auth.verifyIdToken(idToken);
      
      // Buscar dados adicionais do Firestore
      const userDoc = await db.collection('users').doc(decodedToken.uid).get();
      
      if (!userDoc.exists) {
        return {
          success: false,
          error: 'Usuário não encontrado no banco de dados'
        };
      }

      return {
        success: true,
        user: {
          id: decodedToken.uid,
          ...userDoc.data()
        },
        decodedToken
      };
    } catch (error) {
      console.error('Error verifying token:', error);
      return {
        success: false,
        error: error.message,
        code: this.getErrorCode(error)
      };
    }
  }

  // Atualizar perfil
  async updateProfile(uid, updates) {
    try {
      const allowedUpdates = ['name', 'phone', 'preferences', 'addresses'];
      const filteredUpdates = {};
      
      Object.keys(updates).forEach(key => {
        if (allowedUpdates.includes(key)) {
          filteredUpdates[key] = updates[key];
        }
      });

      filteredUpdates.updatedAt = FieldValue.serverTimestamp();

      await db.collection('users').doc(uid).update(filteredUpdates);

      // Buscar usuário atualizado
      const userDoc = await db.collection('users').doc(uid).get();

      return {
        success: true,
        user: {
          id: uid,
          ...userDoc.data()
        }
      };
    } catch (error) {
      console.error('Error updating profile:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Alterar password
  async changePassword(uid, newPassword) {
    try {
      await auth.updateUser(uid, {
        password: newPassword
      });

      return {
        success: true,
        message: 'Password alterada com sucesso'
      };
    } catch (error) {
      console.error('Error changing password:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Esqueci password
  async forgotPassword(email) {
    try {
      const userRecord = await auth.getUserByEmail(email);
      
      // Gerar link de reset (em produção, usarias Firebase Client SDK)
      // Esta é uma versão simplificada
      
      return {
        success: true,
        message: 'Instruções enviadas para o email',
        userId: userRecord.uid
      };
    } catch (error) {
      console.error('Error in forgot password:', error);
      return {
        success: false,
        error: 'Email não encontrado'
      };
    }
  }

  // Verificar email
  async verifyEmail(uid) {
    try {
      await auth.updateUser(uid, {
        emailVerified: true
      });

      // Atualizar no Firestore
      await db.collection('users').doc(uid).update({
        emailVerified: true,
        updatedAt: FieldValue.serverTimestamp()
      });

      return {
        success: true,
        message: 'Email verificado com sucesso'
      };
    } catch (error) {
      console.error('Error verifying email:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Deletar conta
  async deleteAccount(uid) {
    try {
      // Soft delete: desativar no Firestore
      await db.collection('users').doc(uid).update({
        isActive: false,
        deletedAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp()
      });

      // Opcional: desativar no Firebase Auth
      // await auth.updateUser(uid, { disabled: true });

      return {
        success: true,
        message: 'Conta desativada com sucesso'
      };
    } catch (error) {
      console.error('Error deleting account:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Admin: Listar usuários
  async listUsers(options = {}) {
    try {
      const { page = 1, limit = 20, search = '' } = options;
      
      let query = db.collection('users');
      
      if (search) {
        // Firestore não suporta OR queries facilmente
        // Esta é uma implementação básica
        query = query.where('email', '>=', search).where('email', '<=', search + '\uf8ff');
      }
      
      const snapshot = await query
        .orderBy('createdAt', 'desc')
        .limit(limit)
        .offset((page - 1) * limit)
        .get();
      
      const users = [];
      snapshot.forEach(doc => {
        users.push({
          id: doc.id,
          ...doc.data()
        });
      });
      
      // Contagem total (simplificada)
      const totalSnapshot = await query.get();
      const total = totalSnapshot.size;
      
      return {
        success: true,
        users,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      };
    } catch (error) {
      console.error('Error listing users:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Helper: Traduzir códigos de erro
  getErrorCode(error) {
    const errorMap = {
      'auth/email-already-exists': 'EMAIL_EXISTS',
      'auth/invalid-email': 'INVALID_EMAIL',
      'auth/weak-password': 'WEAK_PASSWORD',
      'auth/user-not-found': 'USER_NOT_FOUND',
      'auth/wrong-password': 'WRONG_PASSWORD',
      'auth/too-many-requests': 'TOO_MANY_REQUESTS'
    };
    
    return errorMap[error.code] || 'UNKNOWN_ERROR';
  }

  // Gerar token personalizado para desenvolvimento
  async generateCustomToken(uid, additionalClaims = {}) {
    try {
      const token = await auth.createCustomToken(uid, additionalClaims);
      return {
        success: true,
        token
      };
    } catch (error) {
      console.error('Error generating custom token:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }
}

module.exports = new AuthService();