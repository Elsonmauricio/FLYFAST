const sendWhatsAppMessage = async (to, message) => {
  // Simulação de envio (Log apenas)
  // Para produção, integre com Twilio, Z-API ou similar
  console.log(`[WhatsApp] Enviando para ${to}: ${message}`);
  return true;
};

module.exports = { sendWhatsAppMessage };