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
const sendEmail = async (to, subject, html) => {
  // Normalizar argumentos: suporta tanto objeto de opções quanto argumentos separados
  let options;
  if (typeof to === 'object' && to !== null && to.to) {
    options = to;
  } else {
    options = { to, subject, html };
  }

  // Verificação de segurança para não crashar se não houver credenciais
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.warn('⚠️ AVISO: EMAIL_USER ou EMAIL_PASS não configurados no .env.');
    console.log('📧 Simulação de envio de email para:', options.to);
    return;
  }

  // DEBUG: Verificar problemas comuns nas credenciais (Espaços em branco)
  if (process.env.EMAIL_PASS.trim().length !== process.env.EMAIL_PASS.length) {
    console.error('\n❌ ERRO CRÍTICO NO .ENV:');
    console.error('   A sua senha (EMAIL_PASS) tem espaços em branco no início ou no fim!');
    console.error('   Por favor, edite o ficheiro .env e remova os espaços.\n');
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
    console.error('❌ Erro técnico ao enviar email:', error.message);

    // Diagnóstico amigável para erro de senha (535)
    if (error.code === 'EAUTH' || (error.response && error.response.includes('535'))) {
        console.error('\n🛑 SOLUÇÃO PARA O ERRO DE EMAIL (535):');
        console.error('   1. A senha no ficheiro .env ESTÁ INCORRETA ou EXPIROU.');
        console.error('   2. Não use a sua senha do Gmail. Use uma "Senha de Aplicação" de 16 letras.');
        console.error('   3. Gere uma nova aqui: https://myaccount.google.com/apppasswords');
        console.error('   4. Atualize o ficheiro .env e REINICIE O SERVIDOR.\n');
    }

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