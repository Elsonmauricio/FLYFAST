const nodemailer = require('nodemailer');

// Configuração do Transporter (Gmail, Outlook, ou SMTP genérico)
// Certifica-te de ter estas variáveis no teu ficheiro .env
const transporter = nodemailer.createTransport({
  service: process.env.EMAIL_SERVICE || 'gmail', // ou use host/port para SMTP
  auth: {
    user: process.env.EMAIL_USER, // O teu email (ex: flyfast@gmail.com)
    pass: process.env.EMAIL_PASS  // A tua password de aplicação (App Password)
  }
});

/**
 * Envia um email genérico
 */
const sendEmail = async (to, subject, html) => {
  try {
    const mailOptions = {
      from: `"Flyfast Logística" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('📧 Email enviado: %s', info.messageId);
    return info;
  } catch (error) {
    console.error('❌ Erro ao enviar email:', error);
    // Não lançamos o erro para não bloquear o fluxo principal da aplicação
    return null;
  }
};

/**
 * Envia notificação de atualização de estado de encomenda
 */
const sendShipmentStatusUpdate = async (to, userName, shipmentId, newStatus, location) => {
  const subject = `📦 Atualização do Envio #${shipmentId} - ${newStatus}`;
  
  const statusColors = {
    'Pendente': '#fbbf24', // Amarelo
    'Em Processamento': '#3b82f6', // Azul
    'Em Trânsito': '#8b5cf6', // Roxo
    'Chegou ao Destino': '#10b981', // Verde
    'Entregue': '#059669', // Verde Escuro
    'Cancelado': '#ef4444' // Vermelho
  };

  const color = statusColors[newStatus] || '#3b82f6';

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e5e7eb; border-radius: 8px; overflow: hidden;">
      <div style="background-color: #1e3a8a; padding: 20px; text-align: center;">
        <h1 style="color: #ffffff; margin: 0;">FLYFAST</h1>
      </div>
      <div style="padding: 20px;">
        <h2 style="color: #1f2937;">Olá, ${userName}!</h2>
        <p style="color: #4b5563; font-size: 16px;">O estado da sua encomenda <strong>#${shipmentId}</strong> foi atualizado.</p>
        
        <div style="background-color: #f3f4f6; padding: 15px; border-radius: 6px; margin: 20px 0; text-align: center;">
          <p style="margin: 0; color: #6b7280; font-size: 14px;">Novo Estado:</p>
          <h3 style="margin: 5px 0 0 0; color: ${color}; font-size: 24px;">${newStatus}</h3>
          ${location ? `<p style="margin-top: 10px; color: #4b5563;">📍 Localização: <strong>${location}</strong></p>` : ''}
        </div>

        <p style="color: #4b5563;">Pode acompanhar todos os detalhes na sua área de cliente.</p>
        
        <div style="text-align: center; margin-top: 30px;">
          <a href="${process.env.FRONTEND_URL}/tracking/${shipmentId}" style="background-color: #fbbf24; color: #1e3a8a; padding: 12px 24px; text-decoration: none; font-weight: bold; border-radius: 4px;">Rastrear Encomenda</a>
        </div>
      </div>
      <div style="background-color: #f9fafb; padding: 15px; text-align: center; font-size: 12px; color: #9ca3af;">
        <p>© ${new Date().getFullYear()} Flyfast - Prestação de Serviços, LDA.</p>
        <p>Este é um email automático, por favor não responda.</p>
      </div>
    </div>
  `;

  return sendEmail(to, subject, html);
};

module.exports = {
  sendEmail,
  sendShipmentStatusUpdate
};