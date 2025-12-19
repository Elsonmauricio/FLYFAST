const axios = require('axios');

class WhatsAppService {
  constructor() {
    this.baseURL = 'https://graph.facebook.com/v17.0';
    this.accessToken = process.env.WHATSAPP_ACCESS_TOKEN;
    this.businessId = process.env.WHATSAPP_BUSINESS_ID;
  }

  async sendMessage(to, message, template = null) {
    try {
      const url = `${this.baseURL}/${this.businessId}/messages`;
      
      const data = {
        messaging_product: "whatsapp",
        to,
        type: "text",
        text: {
          body: message
        }
      };

      if (template) {
        data.type = "template";
        data.template = template;
      }

      const response = await axios.post(url, data, {
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json'
        }
      });

      return response.data;
    } catch (error) {
      console.error('Error sending WhatsApp message:', error.response?.data || error.message);
      throw error;
    }
  }

  // Templates específicos
  async sendTrackingUpdateWhatsApp(phone, shipment) {
    const message = `📦 *ATUALIZAÇÃO FLYFAST*\n\n` +
                   `Envio: *${shipment.trackingCode}*\n` +
                   `Status: ${shipment.status}\n` +
                   `Local: ${shipment.currentLocation}\n` +
                   `Próxima ação: ${shipment.nextUpdate || 'Em breve'}\n\n` +
                   `Acompanhe: ${process.env.FRONTEND_URL}/tracking?code=${shipment.trackingCode}`;

    return this.sendMessage(phone, message);
  }

  async sendPaymentConfirmation(phone, order) {
    const message = `✅ *PAGAMENTO CONFIRMADO*\n\n` +
                   `Pedido: #${order.orderNumber}\n` +
                   `Valor: ${order.totalAmount} ${order.currency}\n` +
                   `Status: Processado\n\n` +
                   `Obrigado pela sua compra!`;

    return this.sendMessage(phone, message);
  }

  async sendPersonalShopperUpdate(phone, request) {
    const message = `👔 *ATUALIZAÇÃO PERSONAL SHOPPER*\n\n` +
                   `Pedido: ${request.product}\n` +
                   `Status: ${request.status}\n` +
                   `Atualização: ${request.update || 'Em processamento'}\n\n` +
                   `Ver detalhes: ${process.env.FRONTEND_URL}/personal-shopper/${request._id}`;

    return this.sendMessage(phone, message);
  }
}

module.exports = new WhatsAppService();