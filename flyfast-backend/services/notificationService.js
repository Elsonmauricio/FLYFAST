const EmailService = require('./emailService');
const WhatsAppService = require('./whatsappService');
const SMSService = require('./smsService');
const Notification = require('../models/Notification');
const User = require('../models/User');

class NotificationService {
  /**
   * Envia uma notificação por todos os canais configurados
   * @param {string} userId - ID do usuário
   * @param {string} type - Tipo de notificação
   * @param {string} title - Título da notificação
   * @param {string} message - Mensagem
   * @param {Object} data - Dados adicionais
   * @returns {Promise<Object>} Resultado
   */
  async sendNotification(userId, type, title, message, data = {}) {
    try {
      const user = await User.findById(userId);
      
      if (!user) {
        throw new Error(`Usuário não encontrado: ${userId}`);
      }
      
      // Criar registro de notificação
      const notification = new Notification({
        userId,
        type,
        title,
        message,
        data,
        status: 'pending'
      });
      
      await notification.save();
      
      // Enviar por diferentes canais baseado nas preferências
      const results = {
        email: { sent: false },
        whatsapp: { sent: false },
        sms: { sent: false }
      };
      
      const preferences = user.preferences.notifications;
      
      // Email
      if (preferences.email) {
        try {
          const emailResult = await EmailService.sendEmail(
            user.email,
            title,
            this.generateEmailHtml(type, title, message, data)
          );
          
          if (emailResult.success) {
            notification.channels.email.sent = true;
            notification.channels.email.sentAt = new Date();
            notification.channels.email.messageId = emailResult.messageId;
            results.email = { sent: true, ...emailResult };
          }
        } catch (error) {
          console.error('Error sending email notification:', error);
        }
      }
      
      // WhatsApp
      if (preferences.whatsapp && user.phone) {
        try {
          const whatsappResult = await WhatsAppService.sendMessage(
            user.phone,
            `*${title}*\n\n${message}`
          );
          
          if (whatsappResult.success) {
            notification.channels.whatsapp.sent = true;
            notification.channels.whatsapp.sentAt = new Date();
            notification.channels.whatsapp.messageId = whatsappResult.messageId;
            results.whatsapp = { sent: true, ...whatsappResult };
          }
        } catch (error) {
          console.error('Error sending WhatsApp notification:', error);
        }
      }
      
      // SMS
      if (preferences.sms && user.phone) {
        try {
          const smsResult = await SMSService.sendSMS(
            user.phone,
            `${title}: ${message}`
          );
          
          if (smsResult.success) {
            notification.channels.sms.sent = true;
            notification.channels.sms.sentAt = new Date();
            notification.channels.sms.messageId = smsResult.messageId;
            results.sms = { sent: true, ...smsResult };
          }
        } catch (error) {
          console.error('Error sending SMS notification:', error);
        }
      }
      
      // Atualizar status da notificação
      const sentChannels = Object.values(results).filter(r => r.sent).length;
      notification.status = sentChannels > 0 ? 'sent' : 'failed';
      notification.sentAt = new Date();
      
      await notification.save();
      
      return {
        success: true,
        notificationId: notification._id,
        channels: results,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          phone: user.phone
        }
      };
      
    } catch (error) {
      console.error('❌ Error in notification service:', error);
      
      return {
        success: false,
        error: error.message
      };
    }
  }
  
  /**
   * Gera HTML para email baseado no tipo
   * @param {string} type - Tipo de notificação
   * @param {string} title - Título
   * @param {string} message - Mensagem
   * @param {Object} data - Dados adicionais
   * @returns {string} HTML do email
   */
  generateEmailHtml(type, title, message, data = {}) {
    let template = '';
    
    switch (type) {
      case 'tracking_update':
        template = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: linear-gradient(135deg, #0C2E6D, #3A7BFF); padding: 25px; text-align: center;">
              <h2 style="color: white; margin: 0;">${title}</h2>
            </div>
            <div style="padding: 30px; background: white; border: 1px solid #e0e0e0;">
              <p style="color: #333; line-height: 1.6;">${message}</p>
              ${data.trackingCode ? `
                <div style="margin-top: 20px; padding: 15px; background: #f8f9fa; border-radius: 8px;">
                  <h3 style="color: #0C2E6D; margin-top: 0;">📦 Detalhes do Envio</h3>
                  <p><strong>Código:</strong> ${data.trackingCode}</p>
                  <p><strong>Status:</strong> ${data.status}</p>
                  <p><strong>Localização:</strong> ${data.location}</p>
                  <a href="${process.env.FRONTEND_URL}/tracking?code=${data.trackingCode}" 
                     style="display: inline-block; margin-top: 10px; padding: 10px 20px; 
                            background: #0C2E6D; color: white; text-decoration: none; 
                            border-radius: 5px;">
                    Ver Detalhes
                  </a>
                </div>
              ` : ''}
            </div>
          </div>
        `;
        break;
        
      case 'payment_confirmation':
        template = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: linear-gradient(135deg, #28a745, #20c997); padding: 25px; text-align: center;">
              <h2 style="color: white; margin: 0;">${title}</h2>
            </div>
            <div style="padding: 30px; background: white; border: 1px solid #e0e0e0;">
              <p style="color: #333; line-height: 1.6;">${message}</p>
              ${data.orderNumber ? `
                <div style="margin-top: 20px; padding: 15px; background: #f8f9fa; border-radius: 8px;">
                  <h3 style="color: #28a745; margin-top: 0;">✅ Detalhes do Pagamento</h3>
                  <p><strong>Pedido:</strong> ${data.orderNumber}</p>
                  <p><strong>Valor:</strong> ${data.amount} ${data.currency}</p>
                  <p><strong>Método:</strong> ${data.method}</p>
                  <a href="${process.env.FRONTEND_URL}/account/orders/${data.orderId}" 
                     style="display: inline-block; margin-top: 10px; padding: 10px 20px; 
                            background: #28a745; color: white; text-decoration: none; 
                            border-radius: 5px;">
                    Ver Pedido
                  </a>
                </div>
              ` : ''}
            </div>
          </div>
        `;
        break;
        
      default:
        template = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: linear-gradient(135deg, #0C2E6D, #3A7BFF); padding: 25px; text-align: center;">
              <h2 style="color: white; margin: 0;">${title}</h2>
            </div>
            <div style="padding: 30px; background: white; border: 1px solid #e0e0e0;">
              <p style="color: #333; line-height: 1.6;">${message}</p>
              ${Object.keys(data).length > 0 ? `
                <div style="margin-top: 20px; padding: 15px; background: #f8f9fa; border-radius: 8px;">
                  <h4 style="color: #0C2E6D; margin-top: 0;">Detalhes:</h4>
                  <pre style="font-size: 12px; color: #666;">${JSON.stringify(data, null, 2)}</pre>
                </div>
              ` : ''}
            </div>
          </div>
        `;
    }
    
    return template;
  }
  
  /**
   * Envia notificação para múltiplos usuários
   * @param {Array} userIds - IDs dos usuários
   * @param {string} type - Tipo de notificação
   * @param {string} title - Título
   * @param {string} message - Mensagem
   * @param {Object} data - Dados adicionais
   * @returns {Promise<Object>} Resultados
   */
  async sendBulkNotification(userIds, type, title, message, data = {}) {
    try {
      const results = [];
      
      for (const userId of userIds) {
        try {
          const result = await this.sendNotification(userId, type, title, message, data);
          results.push({
            userId,
            success: result.success,
            notificationId: result.notificationId
          });
        } catch (error) {
          results.push({
            userId,
            success: false,
            error: error.message
          });
        }
      }
      
      return {
        success: true,
        total: userIds.length,
        sent: results.filter(r => r.success).length,
        failed: results.filter(r => !r.success).length,
        results
      };
      
    } catch (error) {
      console.error('❌ Error sending bulk notification:', error);
      
      return {
        success: false,
        error: error.message
      };
    }
  }
  
  /**
   * Obtém notificações de um usuário
   * @param {string} userId - ID do usuário
   * @param {Object} options - Opções de paginação
   * @returns {Promise<Object>} Notificações
   */
  async getUserNotifications(userId, options = {}) {
    try {
      const { page = 1, limit = 20, unreadOnly = false } = options;
      const skip = (page - 1) * limit;
      
      const query = { userId };
      if (unreadOnly) {
        query.status = { $ne: 'read' };
      }
      
      const notifications = await Notification.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);
      
      const total = await Notification.countDocuments(query);
      const unreadCount = await Notification.countDocuments({
        userId,
        status: { $ne: 'read' }
      });
      
      return {
        success: true,
        notifications,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit),
          unreadCount
        }
      };
      
    } catch (error) {
      console.error('❌ Error getting user notifications:', error);
      throw error;
    }
  }
  
  /**
   * Marca notificação como lida
   * @param {string} notificationId - ID da notificação
   * @returns {Promise<Object>} Notificação atualizada
   */
  async markAsRead(notificationId) {
    try {
      const notification = await Notification.findByIdAndUpdate(
        notificationId,
        {
          status: 'read',
          readAt: new Date()
        },
        { new: true }
      );
      
      if (!notification) {
        throw new Error('Notificação não encontrada');
      }
      
      return {
        success: true,
        notification
      };
      
    } catch (error) {
      console.error('❌ Error marking notification as read:', error);
      throw error;
    }
  }
  
  /**
   * Marca todas as notificações de um usuário como lidas
   * @param {string} userId - ID do usuário
   * @returns {Promise<Object>} Resultado
   */
  async markAllAsRead(userId) {
    try {
      const result = await Notification.updateMany(
        { userId, status: { $ne: 'read' } },
        {
          status: 'read',
          readAt: new Date()
        }
      );
      
      return {
        success: true,
        modified: result.modifiedCount
      };
      
    } catch (error) {
      console.error('❌ Error marking all notifications as read:', error);
      throw error;
    }
  }
}

module.exports = new NotificationService();