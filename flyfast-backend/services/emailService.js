const nodemailer = require('nodemailer');

// Configuração do transporte de email
// Certifique-se de definir EMAIL_USER e EMAIL_PASS no seu ficheiro .env
const transporter = nodemailer.createTransport({
  service: 'gmail', // Pode alterar para 'hotmail', 'yahoo' ou usar host/port específicos
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

/**
 * Função base para envio de emails
 */
const sendEmail = async (options) => {
  // Verificação de segurança para não crashar se não houver credenciais
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.warn('⚠️ AVISO: EMAIL_USER ou EMAIL_PASS não configurados no .env.');
    console.log('📧 Simulação de envio de email para:', options.to);
    return;
  }

  const mailOptions = {
    from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
    to: options.to,
    subject: options.subject,
    html: options.html,
    text: options.text
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Email enviado com sucesso: %s', info.messageId);
    return info;
  } catch (error) {
    console.error('❌ Erro ao enviar email:', error);
    // Não lançamos o erro para não parar o processo de auth, mas logamos
    return null;
  }
};

// Exporta as funções que o authController provavelmente está a tentar usar
module.exports = {
  sendEmail,
  
  // Wrapper para email de boas-vindas (caso o controller chame especificamente esta função)
  sendWelcomeEmail: async (user) => {
    return sendEmail({
      to: user.email,
      subject: 'Bem-vindo à FlyFast!',
      html: `<h1>Olá ${user.name || 'Cliente'},</h1><p>Obrigado por se registar na FlyFast.</p>`
    });
  },

  // Wrapper para reset de password
  sendPasswordResetEmail: async (email, resetUrl) => {
    return sendEmail({
      to: email,
      subject: 'Redefinição de Palavra-passe',
      html: `<p>Recebemos um pedido para redefinir a sua senha. Clique <a href="${resetUrl}">aqui</a> para redefinir.</p>`
    });
  }
};