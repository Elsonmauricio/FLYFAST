const twilio = require('twilio');

class SMSService {
  constructor() {
    this.client = null;
    this.isEnabled = false;
    
    if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) {
      this.client = twilio(
        process.env.TWILIO_ACCOUNT_SID,
        process.env.TWILIO_AUTH_TOKEN
      );
      this.isEnabled = true;
      console.log('✅ Twilio SMS service initialized');
    } else {
      console.warn('⚠️ Twilio credentials not found, SMS service disabled');
    }
  }

  /**
   * Envia um SMS
   * @param {string} to - Número de telefone destino
   * @param {string} message - Mensagem a enviar
   * @returns {Promise<Object>} Resultado do envio
   */
  async sendSMS(to, message) {
    try {
      if (!this.isEnabled || !this.client) {
        throw new Error('SMS service is not enabled');
      }

      // Formatar número (adicionar + se não tiver)
      let formattedTo = to;
      if (!formattedTo.startsWith('+')) {
        formattedTo = '+' + formattedTo;
      }

      const result = await this.client.messages.create({
        body: message,
        from: process.env.TWILIO_PHONE_NUMBER,
        to: formattedTo
      });

      console.log(`✅ SMS sent to ${formattedTo}, SID: ${result.sid}`);
      
      return {
        success: true,
        messageId: result.sid,
        status: result.status,
        to: formattedTo,
        timestamp: new Date()
      };

    } catch (error) {
      console.error('❌ Error sending SMS:', error);
      
      return {
        success: false,
        error: error.message,
        to,
        timestamp: new Date()
      };
    }
  }

  /**
   * Envia SMS de verificação
   * @param {string} phone - Número de telefone
   * @param {string} code - Código de verificação
   * @returns {Promise<Object>} Resultado do envio
   */
  async sendVerificationCode(phone, code) {
    const message = `FLYFAST - Seu código de verificação: ${code}\n\nEste código expira em 10 minutos.`;
    
    return this.sendSMS(phone, message);
  }

  /**
   * Envia SMS de atualização de envio
   * @param {string} phone - Número de telefone
   * @param {Object} shipment - Dados do envio
   * @returns {Promise<Object>} Resultado do envio
   */
  async sendTrackingUpdate(phone, shipment) {
    const message = `FLYFAST - Atualização de Envio\n\n` +
                   `Código: ${shipment.trackingCode}\n` +
                   `Status: ${shipment.status}\n` +
                   `Local: ${shipment.currentLocation}\n\n` +
                   `Acompanhe: ${process.env.FRONTEND_URL}/tracking?code=${shipment.trackingCode}`;
    
    return this.sendSMS(phone, message);
  }

  /**
   * Envia SMS de confirmação de pagamento
   * @param {string} phone - Número de telefone
   * @param {Object} order - Dados do pedido
   * @returns {Promise<Object>} Resultado do envio
   */
  async sendPaymentConfirmation(phone, order) {
    const message = `FLYFAST - Pagamento Confirmado\n\n` +
                   `Pedido: ${order.orderNumber}\n` +
                   `Valor: ${order.totalAmount} ${order.currency}\n` +
                   `Status: Confirmado\n\n` +
                   `Obrigado pela sua compra!`;
    
    return this.sendSMS(phone, message);
  }

  /**
   * Envia SMS de alerta (admin/staff)
   * @param {string} phone - Número de telefone
   * @param {string} alert - Tipo de alerta
   * @param {Object} data - Dados do alerta
   * @returns {Promise<Object>} Resultado do envio
   */
  async sendAlert(phone, alert, data = {}) {
    let message = '';
    
    switch (alert) {
      case 'new_order':
        message = `🚨 NOVO PEDIDO\n\n` +
                 `Pedido: ${data.orderNumber}\n` +
                 `Valor: ${data.totalAmount} ${data.currency}\n` +
                 `Cliente: ${data.customerName}\n` +
                 `Ver no painel: ${process.env.ADMIN_URL}/orders/${data.orderId}`;
        break;
        
      case 'new_shipment':
        message = `📦 NOVO ENVIO\n\n` +
                 `Código: ${data.trackingCode}\n` +
                 `De: ${data.from}\n` +
                 `Para: ${data.to}\n` +
                 `Ver no painel: ${process.env.ADMIN_URL}/shipments/${data.shipmentId}`;
        break;
        
      case 'urgent':
        message = `⚠️ ALERTA URGENTE\n\n${data.message}`;
        break;
        
      default:
        message = `FLYFAST Alert: ${alert}\n\n${JSON.stringify(data)}`;
    }
    
    return this.sendSMS(phone, message);
  }

  /**
   * Verifica o status de um SMS
   * @param {string} messageId - SID da mensagem
   * @returns {Promise<Object>} Status da mensagem
   */
  async checkStatus(messageId) {
    try {
      if (!this.isEnabled || !this.client) {
        throw new Error('SMS service is not enabled');
      }

      const message = await this.client.messages(messageId).fetch();
      
      return {
        success: true,
        status: message.status,
        sent: message.dateSent,
        to: message.to,
        from: message.from,
        body: message.body
      };

    } catch (error) {
      console.error('❌ Error checking SMS status:', error);
      
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Verifica se o serviço está disponível
   * @returns {Object} Status do serviço
   */
  getStatus() {
    return {
      enabled: this.isEnabled,
      provider: 'Twilio',
      hasCredentials: !!(process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN)
    };
  }
}

// Exportar instância única
const smsService = new SMSService();
module.exports = smsService;