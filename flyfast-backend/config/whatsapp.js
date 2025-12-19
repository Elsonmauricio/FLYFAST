const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');

class WhatsAppService {
  constructor() {
    this.client = null;
    this.isReady = false;
    this.init();
  }

  init() {
    try {
      this.client = new Client({
        authStrategy: new LocalAuth(),
        puppeteer: {
          args: ['--no-sandbox', '--disable-setuid-sandbox'],
          headless: true
        }
      });

      // Gerar QR Code
      this.client.on('qr', (qr) => {
        console.log('📱 QR Code recebido para WhatsApp:');
        qrcode.generate(qr, { small: true });
        
        // Guardar QR Code em texto para facilitar
        console.log('\nEscaneie este QR Code com o WhatsApp');
      });

      // Quando estiver pronto
      this.client.on('ready', () => {
        console.log('✅ WhatsApp client está pronto!');
        this.isReady = true;
      });

      // Erros
      this.client.on('auth_failure', (msg) => {
        console.error('❌ WhatsApp auth failure:', msg);
        this.isReady = false;
      });

      this.client.on('disconnected', (reason) => {
        console.log('❌ WhatsApp desconectado:', reason);
        this.isReady = false;
        // Tentar reconectar após 10 segundos
        setTimeout(() => this.init(), 10000);
      });

      // Inicializar
      this.client.initialize();
      
    } catch (error) {
      console.error('❌ Erro ao inicializar WhatsApp:', error);
    }
  }

  // Enviar mensagem
  async sendMessage(to, message) {
    try {
      if (!this.isReady || !this.client) {
        throw new Error('WhatsApp client não está pronto');
      }

      // Formatar número (adicionar código do país se necessário)
      let formattedNumber = to;
      if (!to.includes('@c.us')) {
        formattedNumber = to.replace(/\D/g, '');
        
        // Adicionar código do país de Angola se não tiver
        if (!formattedNumber.startsWith('244')) {
          formattedNumber = '244' + formattedNumber;
        }
        
        formattedNumber = formattedNumber + '@c.us';
      }

      const chat = await this.client.getChatById(formattedNumber);
      
      if (!chat) {
        throw new Error('Chat não encontrado');
      }

      const response = await chat.sendMessage(message);
      console.log(`✅ WhatsApp message sent to ${to}`);
      
      return {
        success: true,
        messageId: response.id.id,
        timestamp: response.timestamp
      };
      
    } catch (error) {
      console.error('❌ Erro ao enviar mensagem WhatsApp:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Enviar mensagem de tracking
  async sendTrackingUpdate(phone, shipment) {
    const message = `*FLYFAST - Atualização de Envio* 📦\n\n` +
                   `*Código:* ${shipment.trackingCode}\n` +
                   `*Status:* ${shipment.status}\n` +
                   `*Localização:* ${shipment.currentLocation}\n` +
                   `*Próxima Atualização:* ${shipment.nextUpdate || 'Em breve'}\n\n` +
                   `Acompanhe em tempo real:\n` +
                   `${process.env.FRONTEND_URL}/tracking?code=${shipment.trackingCode}\n\n` +
                   `_Esta é uma mensagem automática. Por favor, não responda._`;
    
    return this.sendMessage(phone, message);
  }

  // Enviar confirmação de pagamento
  async sendPaymentConfirmation(phone, order) {
    const message = `*FLYFAST - Confirmação de Pagamento* ✅\n\n` +
                   `*Pedido:* ${order.orderNumber}\n` +
                   `*Valor:* ${order.totalAmount} ${order.currency}\n` +
                   `*Método:* ${order.payment.method}\n` +
                   `*Status:* Pagamento confirmado\n\n` +
                   `Obrigado pela sua compra! O seu pedido está agora em processamento.\n\n` +
                   `Acompanhe o seu pedido:\n` +
                   `${process.env.FRONTEND_URL}/account/orders/${order._id}\n\n` +
                   `_Esta é uma mensagem automática. Por favor, não responda._`;
    
    return this.sendMessage(phone, message);
  }

  // Verificar status
  getStatus() {
    return {
      isReady: this.isReady,
      isAuthenticated: this.client ? this.client.info : null
    };
  }
}

// Exportar instância única
const whatsappService = new WhatsAppService();
module.exports = whatsappService;