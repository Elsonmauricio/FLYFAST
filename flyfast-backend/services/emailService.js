const nodemailer = require('nodemailer');

class EmailService {
  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
  }

  async sendEmail(to, subject, html, attachments = []) {
    try {
      const info = await this.transporter.sendMail({
        from: `"FLYFAST" <${process.env.EMAIL_USER}>`,
        to,
        subject,
        html,
        attachments,
      });

      console.log(`Email sent: ${info.messageId}`);
      return true;
    } catch (error) {
      console.error('Error sending email:', error);
      return false;
    }
  }

  // Templates específicos
  async sendWelcomeEmail(user) {
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #0C2E6D, #3A7BFF); padding: 30px; text-align: center;">
          <h1 style="color: white; margin: 0;">Bem-vindo à FLYFAST!</h1>
        </div>
        <div style="padding: 30px; background: #f9f9f9;">
          <h2>Olá ${user.name},</h2>
          <p>A sua conta foi criada com sucesso. Agora pode:</p>
          <ul>
            <li>Rastrear os seus envios</li>
            <li>Fazer compras na nossa loja</li>
            <li>Utilizar o serviço Personal Shopper</li>
            <li>Gerir as suas informações pessoais</li>
          </ul>
          <p style="text-align: center;">
            <a href="${process.env.FRONTEND_URL}/account" 
               style="background: #0C2E6D; color: white; padding: 12px 24px; 
                      text-decoration: none; border-radius: 5px; display: inline-block;">
              Aceder à Minha Conta
            </a>
          </p>
          <p>Em caso de dúvidas, não hesite em contactar-nos.</p>
          <p><strong>A equipa FLYFAST</strong><br>
          ✈️ Voe Connosco!</p>
        </div>
      </div>
    `;

    return this.sendEmail(user.email, 'Bem-vindo à FLYFAST!', html);
  }

  async sendTrackingUpdate(shipment, user) {
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #0C2E6D; padding: 20px; text-align: center;">
          <h2 style="color: white; margin: 0;">📦 Atualização do Seu Envio</h2>
        </div>
        <div style="padding: 25px; background: white;">
          <h3>Envio #${shipment.trackingCode}</h3>
          <p><strong>Status:</strong> ${shipment.status}</p>
          <p><strong>Localização:</strong> ${shipment.currentLocation}</p>
          <p><strong>Próxima Atualização:</strong> ${shipment.nextUpdate || 'Em breve'}</p>
          <hr>
          <p style="text-align: center;">
            <a href="${process.env.FRONTEND_URL}/tracking?code=${shipment.trackingCode}"
               style="background: #FFD42A; color: #0C2E6D; padding: 10px 20px; 
                      text-decoration: none; border-radius: 5px; font-weight: bold;">
              VER DETALHES DO ENVIO
            </a>
          </p>
        </div>
      </div>
    `;

    return this.sendEmail(user.email, `Atualização do Envio #${shipment.trackingCode}`, html);
  }

  async sendOrderConfirmation(order, user) {
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #0C2E6D; padding: 20px; text-align: center;">
          <h2 style="color: white; margin: 0;">✅ Confirmação de Pedido</h2>
        </div>
        <div style="padding: 25px; background: white;">
          <h3>Pedido #${order.orderNumber}</h3>
          <p><strong>Data:</strong> ${new Date(order.createdAt).toLocaleDateString('pt-PT')}</p>
          <p><strong>Total:</strong> ${order.totalAmount} ${order.currency}</p>
          <p><strong>Status:</strong> ${order.status}</p>
          <hr>
          <h4>Itens:</h4>
          ${order.items.map(item => `
            <div style="border-bottom: 1px solid #eee; padding: 10px 0;">
              <p><strong>${item.name}</strong> x ${item.quantity}</p>
              <p>${item.price} ${order.currency} cada</p>
            </div>
          `).join('')}
          <hr>
          <p style="text-align: center;">
            <a href="${process.env.FRONTEND_URL}/account/orders/${order._id}"
               style="background: #0C2E6D; color: white; padding: 10px 20px; 
                      text-decoration: none; border-radius: 5px;">
              VER DETALHES DO PEDIDO
            </a>
          </p>
        </div>
      </div>
    `;

    return this.sendEmail(user.email, `Confirmação de Pedido #${order.orderNumber}`, html);
  }
}

module.exports = new EmailService();