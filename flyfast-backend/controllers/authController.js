const User = require('../models/User');
const { auth } = require('../config/firebase'); // Importar o auth do Firebase
const crypto = require('crypto');
const EmailService = require('../services/emailService');
const { generateToken } = require('../utils/helpers');

class AuthController {
  // Registro de usuário
  // Agora usa Firebase Authentication para criar o utilizador
  async register(req, res) {
    try {
      const { name, email, phone, password } = req.body;

      // 1. Criar utilizador no Firebase Authentication
      const userRecord = await auth.createUser({
        email,
        password,
        displayName: name,
        phoneNumber: phone,
      });

      // 2. Criar documento do utilizador no Firestore
      const userData = {
        uid: userRecord.uid,
        name,
        email,
        phone,
        preferences: {
          notifications: {
            email: true,
            sms: true,
            whatsapp: true,
            push: true
          },
          language: 'pt',
          currency: 'AOA'
        }
      };
      const user = await User.create(userData);

      // 3. Gerar um custom token para o cliente fazer login inicial
      const customToken = await auth.createCustomToken(userRecord.uid);

      // Enviar email de boas-vindas
      await EmailService.sendWelcomeEmail(user);

      // Criar resposta
      const userResponse = { ...user };

      res.status(201).json({
        success: true,
        message: 'Conta criada com sucesso',
        token: customToken, // O cliente usa este token para obter um ID token
        user: userResponse,
      });

    } catch (error) {
      console.error('Error in register:', error);
      res.status(500).json({
        error: 'Erro ao criar conta',
        message: error.message
      });
    }
  }

  // Login
  async login(req, res) {
    try {
      // No fluxo Firebase, o cliente faz login e envia o ID token.
      // Este endpoint agora valida o ID token e retorna os dados do utilizador.
      const idToken = req.headers.authorization?.split('Bearer ')[1];
      if (!idToken) {
        return res.status(401).json({ error: 'Token de autenticação não fornecido.' });
      }

      const decodedToken = await auth.verifyIdToken(idToken);
      const uid = decodedToken.uid;

      const user = await User.findById(uid);

      // Verificar se conta está ativa
      if (!user || !user.isActive) {
        return res.status(403).json({
          error: 'Conta desativada',
          message: 'A sua conta foi desativada. Contacte o suporte.'
        });
      }

      // Atualizar último login
      user.lastLogin = new Date();
      await user.save();

      // Preparar resposta
      const userResponse = { ...user };

      res.json({
        success: true,
        message: 'Login bem-sucedido',
        token: idToken, // Retorna o mesmo token que foi validado
        user: userResponse,
      });

    } catch (error) {
      console.error('Error in login:', error);
      res.status(500).json({
        error: 'Erro no login',
        message: error.message
      });
    }
  }

  // Refresh token
  async refreshToken(req, res) {
    // A atualização de token é geralmente tratada automaticamente pelo Firebase Client SDK.
    // Este endpoint pode não ser mais necessário.
    res.status(511).json({
      message: 'A atualização de token é gerida pelo Firebase Client SDK.'
    });
  }

  // Esqueci a password
  async forgotPassword(req, res) {
    try {
      const { email } = req.body;

      // Verificar se o utilizador existe no nosso DB primeiro (opcional, mas bom para consistência)
      const user = await User.findByEmail(email);
      
      if (!user) {
        // Por segurança, não revelar que o email não existe
        return res.json({
          success: true,
          message: 'Se o email existir, receberá instruções para redefinir a palavra-passe'
        });
      }

      // Gerar link de reset de password através do Firebase Auth
      const link = await auth.generatePasswordResetLink(email);

      // Enviar email com o link gerado pelo Firebase
      await EmailService.sendPasswordReset(user, link); // O EmailService precisa ser adaptado para enviar o link

      res.json({
        success: true,
        message: 'Instruções de redefinição enviadas para o seu email'
      });

    } catch (error) {
      console.error('Error in forgot password:', error);
      res.status(500).json({
        error: 'Erro ao processar pedido',
        message: error.message
      });
    }
  }

  // Redefinir password
  async resetPassword(req, res) {
    try {
      // O reset de password com o link do Firebase é feito numa página web fornecida pelo Firebase.
      // O backend não participa diretamente na troca da password.
      // Este endpoint pode ser removido ou servir para confirmar que a ação foi concluída.
      // Por agora, vamos retornar uma mensagem informativa.
      res.json({
        success: true,
        message: 'A redefinição de palavra-passe é concluída através do link enviado para o seu email.'
      });

    } catch (error) {
      console.error('Error in reset password:', error);
      res.status(500).json({
        error: 'Erro ao redefinir palavra-passe',
        message: error.message
      });
    }
  }

  // Obter perfil
  async getProfile(req, res) {
    try {
      // req.user.uid deve ser preenchido por um middleware de autenticação Firebase
      const user = await User.findById(req.user.uid);

      res.json({
        success: true,
        user
      });

    } catch (error) {
      console.error('Error getting profile:', error);
      res.status(500).json({
        error: 'Erro ao obter perfil',
        message: error.message
      });
    }
  }

  // Atualizar perfil
  async updateProfile(req, res) {
    try {
      const updates = req.body;
      const allowedUpdates = ['name', 'phone', 'preferences', 'addresses'];
      
      // Filtrar atualizações permitidas
      const filteredUpdates = {};
      Object.keys(updates).forEach(key => {
        if (allowedUpdates.includes(key)) {
          filteredUpdates[key] = updates[key];
        }
      });

      const user = await User.findById(req.user.uid);
      if (!user) {
        return res.status(404).json({ error: 'Utilizador não encontrado.' });
      }

      Object.assign(user, filteredUpdates);
      await user.save();
      res.json({
        success: true,
        message: 'Perfil atualizado com sucesso',
        user
      });

    } catch (error) {
      console.error('Error updating profile:', error);
      res.status(500).json({
        error: 'Erro ao atualizar perfil',
        message: error.message
      });
    }
  }

  // Alterar password
  async changePassword(req, res) {
    try {
      const { newPassword } = req.body;
      const uid = req.user.uid;

      // A verificação da password antiga é feita no cliente com `reauthenticateWithCredential`.
      // O backend apenas executa a atualização.
      await auth.updateUser(uid, {
        password: newPassword,
      });

      // Opcional: registar a alteração no nosso DB
      const user = await User.findById(uid);
      if (user) {
        // Poderíamos ter um campo `passwordChangedAt`
      }
      res.json({
        success: true,
        message: 'Palavra-passe alterada com sucesso'
      });

    } catch (error) {
      console.error('Error changing password:', error);
      res.status(500).json({
        error: 'Erro ao alterar palavra-passe',
        message: error.message
      });
    }
  }

  // Verificar email
  async verifyEmail(req, res) {
    try {
      // A verificação de email também é feita através de um link do Firebase.
      // O backend pode ter um endpoint para confirmar o status.
      const userRecord = await auth.getUser(req.user.uid);

      if (userRecord.emailVerified) {
        const user = await User.findById(req.user.uid);
        if (user && !user.emailVerified) {
          user.emailVerified = true;
          await user.save();
        }
      }
      user.emailVerified = true;
      
      res.json({
        success: true,
        message: 'Email verificado com sucesso'
      });

    } catch (error) {
      console.error('Error verifying email:', error);
      res.status(500).json({
        error: 'Erro ao verificar email',
        message: error.message
      });
    }
  }

  // Reenviar verificação de email
  async resendVerification(req, res) {
    try {
      const { email } = req.body;

      const user = await User.findByEmail(email);

      if (!user) {
        return res.status(404).json({
          error: 'Utilizador não encontrado'
        });
      }

      if (user.emailVerified) {
        return res.status(400).json({
          error: 'Email já verificado'
        });
      }

      const link = await auth.generateEmailVerificationLink(email);
      await EmailService.sendVerificationEmail(user, link); // Adaptar EmailService

      res.json({
        success: true,
        message: 'Email de verificação reenviado'
      });

    } catch (error) {
      console.error('Error resending verification:', error);
      res.status(500).json({
        error: 'Erro ao reenviar verificação',
        message: error.message
      });
    }
  }

  // Logout
  async logout(req, res) {
    try {
      // Com Firebase, o logout é feito no cliente (descarta o token).
      // O backend pode invalidar refresh tokens se estiver a usar sessões com cookies.
      
      res.json({
        success: true,
        message: 'Logout bem-sucedido'
      });

    } catch (error) {
      console.error('Error in logout:', error);
      res.status(500).json({
        error: 'Erro no logout',
        message: error.message
      });
    }
  }

  // Admin: Obter todos os usuários
  async getAllUsers(req, res) {
    try {
      const { pageToken, limit = 20 } = req.query;

      // Listar utilizadores do Firebase Auth
      const listUsersResult = await auth.listUsers(parseInt(limit), pageToken);
      
      // Opcional: enriquecer com dados do Firestore.
      // Para uma lista simples, os dados do Auth podem ser suficientes.
      const users = listUsersResult.users.map(userRecord => ({
        uid: userRecord.uid,
        email: userRecord.email,
        name: userRecord.displayName,
        phone: userRecord.phoneNumber,
        emailVerified: userRecord.emailVerified,
        disabled: userRecord.disabled,
        createdAt: userRecord.metadata.creationTime,
        lastLogin: userRecord.metadata.lastSignInTime,
      }));

      // A paginação do Firebase é baseada em `pageToken`
      const nextPageToken = listUsersResult.pageToken;

      res.json({
        success: true,
        users,
        pagination: {
          limit: parseInt(limit),
          nextPageToken: nextPageToken || null,
        }
      });

    } catch (error) {
      console.error('Error getting all users:', error);
      res.status(500).json({
        error: 'Erro ao obter usuários',
        message: error.message
      });
    }
  }

  // Admin: Obter usuário por ID
  async getUserById(req, res) {
    try {
      const user = await User.findById(req.params.id);

      if (!user) {
        return res.status(404).json({
          error: 'Utilizador não encontrado'
        });
      }

      res.json({
        success: true,
        user
      });

    } catch (error) {
      console.error('Error getting user by ID:', error);
      res.status(500).json({
        error: 'Erro ao obter usuário',
        message: error.message
      });
    }
  }

  // Admin: Atualizar usuário
  async updateUser(req, res) {
    try {
      const updates = req.body;
      const uid = req.params.id;
      
      // Remover campos que não devem ser atualizados
      delete updates.password;
      delete updates.email;
      delete updates.createdAt;

      // Atualizar no Firebase Auth (se aplicável)
      await auth.updateUser(uid, {
        displayName: updates.name,
        phoneNumber: updates.phone,
      });

      // Atualizar no Firestore
      const user = await User.findById(uid);

      if (!user) {
        return res.status(404).json({
          error: 'Utilizador não encontrado'
        });
      }

      Object.assign(user, updates);
      await user.save();

      res.json({
        success: true,
        message: 'Utilizador atualizado com sucesso',
        user
      });

    } catch (error) {
      console.error('Error updating user:', error);
      res.status(500).json({
        error: 'Erro ao atualizar usuário',
        message: error.message
      });
    }
  }

  // Admin: Deletar usuário
  async deleteUser(req, res) {
    try {
      const uid = req.params.id;

      // Desativar no Firebase Auth
      await auth.updateUser(uid, { disabled: true });

      // Desativar no Firestore
      const user = await User.findById(uid);
      if (user) {
        user.isActive = false;
        await user.save();
      }

      res.json({
        success: true,
        message: 'Utilizador desativado com sucesso'
      });

    } catch (error) {
      console.error('Error deleting user:', error);
      res.status(500).json({
        error: 'Erro ao desativar usuário',
        message: error.message
      });
    }
  }

  // Admin: Alterar role do usuário
  async changeUserRole(req, res) {
    try {
      const { role } = req.body;

      const validRoles = ['user', 'staff', 'admin'];
      if (!validRoles.includes(role)) {
        return res.status(400).json({
          error: 'Role inválida'
        });
      }

      const uid = req.params.id;

      // Definir custom claims no Firebase Auth
      await auth.setCustomUserClaims(uid, { role });

      const user = await User.findById(uid);

      if (!user) {
        return res.status(404).json({
          error: 'Utilizador não encontrado'
        });
      }

      user.role = role;
      await user.save();

      res.json({
        success: true,
        message: `Role alterada para ${role}`,
        user
      });

    } catch (error) {
      console.error('Error changing user role:', error);
      res.status(500).json({
        error: 'Erro ao alterar role',
        message: error.message
      });
    }
  }
}

module.exports = new AuthController();