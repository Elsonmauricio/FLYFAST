const Notification = require('../models/Notification');
const User = require('../models/User');
// const EmailService = require('../services/emailService');
// const WhatsAppService = require('../services/whatsappService');

class NotificationController {
  // Enviar notificação
  // TODO: Proteger esta rota com middleware de admin: hasRole(['admin'])
  async sendNotification(req, res) {
    try {
      const { userId, type, title, message, data } = req.body;
      
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ error: 'Utilizador não encontrado' });
      }
      
      // Criar notificação na base de dados
      const notification = await Notification.create({
        userId,
        type,
        title,
        message,
        data,
        status: 'sent'
      });
      
      // Enviar por email (se ativado)
      // if (user.preferences.notifications.email) {
      //   await EmailService.sendEmail(
      //     user.email,
      //     title,
      //     this.generateEmailTemplate(type, message, data)
      //   );
      // }
      
      // Enviar WhatsApp (se ativado e tiver telefone)
      // if (user.preferences.notifications.whatsapp && user.phone) {
      //   await WhatsAppService.sendMessage(
      //     user.phone,
      //     `*${title}*\n\n${message}`
      //   );
      // }
      
      res.json({
        success: true,
        message: 'Notificação enviada',
        notification
      });
      
    } catch (error) {
      console.error("Erro ao enviar notificação:", error);
      res.status(500).json({
        error: 'Erro ao enviar notificação',
        message: error.message
      });
    }
  }
  
  // Marcar notificação como lida
  async markAsRead(req, res) {
    try {
      const { notificationId } = req.params;
      const userId = req.user.uid; // UID do utilizador autenticado

      const notification = await Notification.findById(notificationId);

      if (!notification || notification.userId !== userId) {
        return res.status(404).json({
          error: 'Notificação não encontrada ou não pertence ao utilizador.'
        });
      }

      // Utiliza o método de instância para marcar como lida e salvar
      await notification.markAsRead();
      
      res.json({
        success: true,
        notification
      });
    } catch (error) {
      console.error("Erro ao marcar notificação como lida:", error);
      res.status(500).json({
        error: 'Erro ao atualizar notificação',
        message: error.message
      });
    }
  }
  
  // Obter notificações do usuário
  async getUserNotifications(req, res) {
    try {
      const { page = 1, limit = 20 } = req.query;
      const userId = req.user.uid;
      
      // A lógica de consulta foi movida para o modelo
      const { notifications, total, unreadCount } = await Notification.findForUser({
        userId,
        page: parseInt(page, 10),
        limit: parseInt(limit, 10)
      });

      res.json({
        notifications,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        },
        unreadCount
      });
    } catch (error) {
      console.error("Erro ao obter notificações:", error);
      res.status(500).json({
        error: 'Erro ao obter notificações',
        message: error.message
      });
    }
  }
  
}

module.exports = new NotificationController();