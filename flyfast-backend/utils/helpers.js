const crypto = require('crypto');

/**
 * Gera um código alfanumérico aleatório
 * @param {number} length - Comprimento do código
 * @returns {string} Código gerado
 */
const generateCode = (length = 8) => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  
  for (let i = 0; i < length; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  
  return code;
};

/**
 * Gera um token seguro
 * @param {number} bytes - Número de bytes
 * @returns {string} Token em hexadecimal
 */
const generateToken = (bytes = 32) => {
  return crypto.randomBytes(bytes).toString('hex');
};

/**
 * Formata um número de telefone
 * @param {string} phone - Número de telefone
 * @returns {string} Número formatado
 */
const formatPhone = (phone) => {
  // Remover todos os não dígitos
  const cleaned = phone.replace(/\D/g, '');
  
  // Se começar com 9 (Angola) e tiver 9 dígitos, adicionar +244
  if (cleaned.length === 9 && cleaned.startsWith('9')) {
    return `+244${cleaned}`;
  }
  
  // Se começar com 9 (Portugal) e tiver 9 dígitos, adicionar +351
  if (cleaned.length === 9 && cleaned.startsWith('9')) {
    return `+351${cleaned}`;
  }
  
  // Se já tiver código do país, retornar como está
  if (cleaned.length > 9) {
    return `+${cleaned}`;
  }
  
  return phone;
};

/**
 * Formata valor monetário
 * @param {number} amount - Valor
 * @param {string} currency - Moeda
 * @returns {string} Valor formatado
 */
const formatCurrency = (amount, currency = 'AOA') => {
  const formatter = new Intl.NumberFormat('pt-PT', {
    style: 'currency',
    currency: currency === 'AOA' ? 'USD' : currency, // AOA não é suportado pelo Intl
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
  
  let formatted = formatter.format(amount);
  
  // Substituir símbolo se for AOA
  if (currency === 'AOA') {
    formatted = formatted.replace('US$', 'Kz');
  }
  
  return formatted;
};

/**
 * Calcula data estimada de entrega
 * @param {Date} startDate - Data de início
 * @param {string} from - Origem
 * @param {string} to - Destino
 * @returns {Date} Data estimada
 */
const calculateEstimatedDelivery = (startDate, from, to) => {
  const date = new Date(startDate);
  let daysToAdd = 3; // padrão
  
  if (from === 'Luanda' && to === 'Lisboa') {
    daysToAdd = 2; // mais rápido
  } else if (from === 'Lisboa' && to === 'Luanda') {
    daysToAdd = 3;
  } else {
    daysToAdd = 5; // outras rotas
  }
  
  date.setDate(date.getDate() + daysToAdd);
  return date;
};

/**
 * Pagina resultados
 * @param {Array} data - Dados a paginar
 * @param {number} page - Página atual
 * @param {number} limit - Itens por página
 * @returns {Object} Dados paginados
 */
const paginate = (data, page = 1, limit = 20) => {
  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;
  
  const results = {
    data: data.slice(startIndex, endIndex),
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total: data.length,
      pages: Math.ceil(data.length / limit),
      hasNext: endIndex < data.length,
      hasPrev: startIndex > 0
    }
  };
  
  return results;
};

/**
 * Sanitiza texto (remove XSS)
 * @param {string} text - Texto a sanitizar
 * @returns {string} Texto sanitizado
 */
const sanitizeText = (text) => {
  if (!text) return '';
  
  return text
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
};

/**
 * Extrai metadados de arquivo
 * @param {string} filename - Nome do arquivo
 * @returns {Object} Metadados
 */
const getFileMetadata = (filename) => {
  const ext = filename.split('.').pop().toLowerCase();
  const types = {
    image: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
    document: ['pdf', 'doc', 'docx', 'txt'],
    archive: ['zip', 'rar', '7z']
  };
  
  let category = 'other';
  for (const [cat, exts] of Object.entries(types)) {
    if (exts.includes(ext)) {
      category = cat;
      break;
    }
  }
  
  return {
    extension: ext,
    category,
    mimeType: `image/${ext}` // simplificado
  };
};

/**
 * Delay assíncrono
 * @param {number} ms - Milissegundos
 * @returns {Promise} Promise que resolve após o delay
 */
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Gera hash MD5
 * @param {string} text - Texto a hashear
 * @returns {string} Hash MD5
 */
const md5 = (text) => {
  return crypto.createHash('md5').update(text).digest('hex');
};

/**
 * Valida formato de email
 * @param {string} email - Email a validar
 * @returns {boolean} True se válido
 */
const isValidEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};

/**
 * Trunca texto
 * @param {string} text - Texto a truncar
 * @param {number} maxLength - Comprimento máximo
 * @returns {string} Texto truncado
 */
const truncateText = (text, maxLength = 100) => {
  if (!text || text.length <= maxLength) return text;
  
  return text.substring(0, maxLength - 3) + '...';
};

module.exports = {
  generateCode,
  generateToken,
  formatPhone,
  formatCurrency,
  calculateEstimatedDelivery,
  paginate,
  sanitizeText,
  getFileMetadata,
  delay,
  md5,
  isValidEmail,
  truncateText
};