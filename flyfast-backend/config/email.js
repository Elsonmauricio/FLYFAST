const nodemailer = require('nodemailer');

// Configuração do transporter
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: process.env.EMAIL_PORT === '465',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Verificar conexão
transporter.verify((error, success) => {
  if (error) {
    console.error('❌ Erro na configuração de email:', error);
  } else {
    console.log('✅ Servidor de email configurado com sucesso');
  }
});

// Templates de email
const emailTemplates = {
  welcome: (user) => ({
    subject: `Bem-vindo à FLYFAST, ${user.name}!`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #0C2E6D, #3A7BFF); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 28px;">FLYFAST</h1>
          <p style="color: #FFD42A; margin: 10px 0 0 0; font-size: 18px;">✈️ Voe Connosco!</p>
        </div>
        <div style="padding: 30px; background: white; border: 1px solid #e0e0e0; border-top: none; border-radius: 0 0 10px 10px;">
          <h2 style="color: #0C2E6D; margin-top: 0;">Olá ${user.name},</h2>
          <p style="color: #333; line-height: 1.6;">
            Bem-vindo à família FLYFAST! A sua conta foi criada com sucesso.
          </p>
          
          <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 25px 0;">
            <h3 style="color: #0C2E6D; margin-top: 0;">O que pode fazer agora:</h3>
            <ul style="color: #333; line-height: 1.8;">
              <li><strong>📦 Rastrear envios</strong> - Acompanhe seus pacotes em tempo real</li>
              <li><strong>🛍️ Comprar na loja</strong> - Produtos exclusivos FLYFAST</li>
              <li><strong>👔 Personal Shopper</strong> - Encontramos qualquer produto para si</li>
              <li><strong>📊 Gerir sua conta</strong> - Moradas, preferências e histórico</li>
            </ul>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.FRONTEND_URL}/account" 
               style="background: #FFD42A; color: #0C2E6D; padding: 14px 32px; 
                      text-decoration: none; border-radius: 8px; font-weight: bold; 
                      font-size: 16px; display: inline-block; border: 2px solid #FFD42A;">
              🚀 ACEDER À MINHA CONTA
            </a>
          </div>
          
          <p style="color: #666; font-size: 14px; border-top: 1px solid #eee; padding-top: 20px; margin-top: 30px;">
            Se tiver alguma dúvida, não hesite em contactar-nos:<br>
            📧 ${process.env.SUPPORT_EMAIL || 'suporte@flyfast.com'}<br>
            📞 ${process.env.SUPPORT_PHONE || '+244 923 456 789'}
          </p>
          
          <p style="color: #0C2E6D; font-weight: bold; margin-top: 20px;">
            A equipa FLYFAST<br>
            Conectando Angola e Portugal
          </p>
        </div>
        <div style="text-align: center; padding: 20px; color: #666; font-size: 12px;">
          <p>© ${new Date().getFullYear()} FLYFAST. Todos os direitos reservados.</p>
          <p>Este é um email automático, por favor não responda.</p>
        </div>
      </div>
    `
  }),

  trackingUpdate: (shipment, user) => ({
    subject: `📦 Atualização do seu envio #${shipment.trackingCode}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #0C2E6D, #3A7BFF); padding: 25px; text-align: center; border-radius: 10px 10px 0 0;">
          <h2 style="color: white; margin: 0; font-size: 24px;">ATUALIZAÇÃO DE ENVIO</h2>
          <p style="color: #FFD42A; margin: 5px 0 0 0; font-size: 16px;">${shipment.trackingCode}</p>
        </div>
        
        <div style="padding: 30px; background: white; border: 1px solid #e0e0e0; border-top: none; border-radius: 0 0 10px 10px;">
          <div style="text-align: center; margin-bottom: 25px;">
            <div style="font-size: 48px; margin-bottom: 10px;">📦</div>
            <h3 style="color: #0C2E6D; margin: 0 0 10px 0;">Status: ${shipment.status}</h3>
            <p style="color: #333; font-size: 18px; margin: 0;">${shipment.currentLocation}</p>
          </div>
          
          <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 25px;">
            <h4 style="color: #0C2E6D; margin-top: 0;">📋 Detalhes do Envio</h4>
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px 0; color: #666;">Origem:</td>
                <td style="padding: 8px 0; font-weight: bold;">${shipment.route.from}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #666;">Destino:</td>
                <td style="padding: 8px 0; font-weight: bold;">${shipment.route.to}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #666;">Entrega Estimada:</td>
                <td style="padding: 8px 0; font-weight: bold;">
                  ${new Date(shipment.estimatedDelivery).toLocaleDateString('pt-PT')}
                </td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #666;">Peso:</td>
                <td style="padding: 8px 0; font-weight: bold;">${shipment.package.weight.value} ${shipment.package.weight.unit}</td>
              </tr>
            </table>
          </div>
          
          <div style="text-align: center; margin: 25px 0;">
            <a href="${process.env.FRONTEND_URL}/tracking?code=${shipment.trackingCode}" 
               style="background: #0C2E6D; color: white; padding: 12px 28px; 
                      text-decoration: none; border-radius: 8px; font-weight: bold; 
                      font-size: 16px; display: inline-block;">
              🔍 VER DETALHES COMPLETOS
            </a>
          </div>
          
          <p style="color: #666; font-size: 14px; text-align: center;">
            Para mais informações, visite a sua área de cliente ou contacte o nosso suporte.
          </p>
        </div>
      </div>
    `
  }),

  passwordReset: (user, resetToken) => ({
    subject: '🔐 Redefinir sua palavra-passe FLYFAST',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #0C2E6D, #3A7BFF); padding: 25px; text-align: center; border-radius: 10px 10px 0 0;">
          <h2 style="color: white; margin: 0; font-size: 24px;">REDEFINIR PALAVRA-PASSE</h2>
        </div>
        
        <div style="padding: 30px; background: white; border: 1px solid #e0e0e0; border-top: none; border-radius: 0 0 10px 10px;">
          <p style="color: #333; line-height: 1.6;">
            Olá ${user.name},<br><br>
            Recebemos um pedido para redefinir a palavra-passe da sua conta FLYFAST.
          </p>
          
          <div style="text-align: center; margin: 30px 0; padding: 20px; background: #f8f9fa; border-radius: 8px;">
            <p style="color: #666; margin-bottom: 15px;">Clique no botão abaixo para criar uma nova palavra-passe:</p>
            <a href="${process.env.FRONTEND_URL}/reset-password?token=${resetToken}" 
               style="background: #FFD42A; color: #0C2E6D; padding: 14px 32px; 
                      text-decoration: none; border-radius: 8px; font-weight: bold; 
                      font-size: 16px; display: inline-block;">
              🔑 CRIAR NOVA PALAVRA-PASSE
            </a>
          </div>
          
          <p style="color: #666; font-size: 14px;">
            <strong>Nota:</strong> Este link é válido por 1 hora apenas.<br>
            Se não foi você que fez este pedido, pode ignorar este email.
          </p>
          
          <p style="color: #333; font-size: 12px; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
            Por segurança, nunca partilhe este link com ninguém.
          </p>
        </div>
      </div>
    `
  })
};

// Função para enviar email
const sendEmail = async (to, subject, html, attachments = []) => {
  try {
    const mailOptions = {
      from: `"FLYFAST" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html,
      attachments
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`✅ Email enviado: ${info.messageId}`);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('❌ Erro ao enviar email:', error);
    return { success: false, error: error.message };
  }
};

module.exports = {
  transporter,
  emailTemplates,
  sendEmail
};