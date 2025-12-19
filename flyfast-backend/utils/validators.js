const validator = require('validator');
const constants = require('./constants');

/**
 * Valida um endereço de email
 * @param {string} email - Email a validar
 * @returns {boolean} True se válido
 */
const isValidEmail = (email) => {
  return validator.isEmail(email);
};

/**
 * Valida um número de telefone (Angola ou Portugal)
 * @param {string} phone - Telefone a validar
 * @returns {boolean} True se válido
 */
const isValidPhone = (phone) => {
  // Remover espaços e caracteres especiais
  const cleaned = phone.replace(/\D/g, '');
  
  // Validação para Angola (9 dígitos, começa com 9)
  const angolaRegex = /^9[1-9][0-9]{7}$/; // 9XX XXX XXX
  
  // Validação para Portugal (9 dígitos, começa com 9)
  const portugalRegex = /^9[1-9][0-9]{7}$/; // 9XX XXX XXX
  
  // Validação com código do país
  const intlAngolaRegex = /^2449[1-9][0-9]{7}$/; // +244 9XX XXX XXX
  const intlPortugalRegex = /^3519[1-9][0-9]{7}$/; // +351 9XX XXX XXX
  
  return angolaRegex.test(cleaned) ||
         portugalRegex.test(cleaned) ||
         intlAngolaRegex.test(cleaned) ||
         intlPortugalRegex.test(cleaned);
};

/**
 * Valida um NIF português
 * @param {string} nif - NIF a validar
 * @returns {boolean} True se válido
 */
const isValidNIF = (nif) => {
  if (!nif || nif.length !== 9) return false;
  
  const nifDigits = nif.split('').map(Number);
  
  // Cálculo do dígito de controle
  let sum = 0;
  for (let i = 0; i < 8; i++) {
    sum += nifDigits[i] * (9 - i);
  }
  
  const remainder = sum % 11;
  const checkDigit = remainder < 2 ? 0 : 11 - remainder;
  
  return checkDigit === nifDigits[8];
};

/**
 * Valida um código postal português
 * @param {string} postalCode - Código postal a validar
 * @returns {boolean} True se válido
 */
const isValidPortuguesePostalCode = (postalCode) => {
  const regex = /^\d{4}-\d{3}$/;
  return regex.test(postalCode);
};

/**
 * Valida se uma string contém apenas letras e espaços
 * @param {string} str - String a validar
 * @returns {boolean} True se válido
 */
const isAlphaWithSpaces = (str) => {
  const regex = /^[A-Za-zÀ-ÿ\s]+$/;
  return regex.test(str);
};

/**
 * Valida um valor monetário
 * @param {number} amount - Valor a validar
 * @param {string} currency - Moeda
 * @returns {boolean} True se válido
 */
const isValidCurrency = (amount, currency = 'AOA') => {
  if (typeof amount !== 'number' || isNaN(amount)) return false;
  
  // Verificar limites baseados na moeda
  const limits = {
    'AOA': { min: 0, max: 10000000 }, // 10 milhões Kz
    'EUR': { min: 0, max: 100000 },   // 100 mil €
    'USD': { min: 0, max: 100000 }    // 100 mil $
  };
  
  const limit = limits[currency] || limits.AOA;
  return amount >= limit.min && amount <= limit.max;
};

/**
 * Valida um peso
 * @param {number} weight - Peso em kg
 * @param {string} unit - Unidade (kg ou g)
 * @returns {boolean} True se válido
 */
const isValidWeight = (weight, unit = 'kg') => {
  if (typeof weight !== 'number' || isNaN(weight)) return false;
  
  if (unit === 'kg') {
    return weight >= constants.WEIGHT_LIMITS.MIN_SHIPMENT && 
           weight <= constants.WEIGHT_LIMITS.MAX_SHIPMENT;
  } else if (unit === 'g') {
    const weightInKg = weight / 1000;
    return weightInKg >= constants.WEIGHT_LIMITS.MIN_SHIPMENT && 
           weightInKg <= constants.WEIGHT_LIMITS.MAX_SHIPMENT;
  }
  
  return false;
};

/**
 * Valida dimensões
 * @param {Object} dimensions - Dimensões {length, width, height}
 * @returns {boolean} True se válido
 */
const isValidDimensions = (dimensions) => {
  if (!dimensions || typeof dimensions !== 'object') return false;
  
  const { length, width, height } = dimensions;
  
  // Verificar se todas as dimensões são números positivos
  if (!length || !width || !height || 
      typeof length !== 'number' || 
      typeof width !== 'number' || 
      typeof height !== 'number' ||
      isNaN(length) || isNaN(width) || isNaN(height)) {
    return false;
  }
  
  // Verificar limites individuais
  if (length > constants.DIMENSION_LIMITS.MAX_LENGTH ||
      width > constants.DIMENSION_LIMITS.MAX_WIDTH ||
      height > constants.DIMENSION_LIMITS.MAX_HEIGHT) {
    return false;
  }
  
  // Calcular perímetro (girth)
  const girth = 2 * (width + height);
  if (girth > constants.DIMENSION_LIMITS.MAX_GIRTH) {
    return false;
  }
  
  return true;
};

/**
 * Valida uma data
 * @param {string|Date} date - Data a validar
 * @param {boolean} futureOnly - Apenas datas futuras
 * @returns {boolean} True se válido
 */
const isValidDate = (date, futureOnly = false) => {
  const dateObj = new Date(date);
  
  if (isNaN(dateObj.getTime())) return false;
  
  if (futureOnly) {
    return dateObj > new Date();
  }
  
  return true;
};

/**
 * Valida uma URL
 * @param {string} url - URL a validar
 * @returns {boolean} True se válido
 */
const isValidUrl = (url) => {
  return validator.isURL(url, {
    require_protocol: true,
    protocols: ['http', 'https']
  });
};

/**
 * Valida um código de rastreio FLYFAST
 * @param {string} code - Código a validar
 * @returns {boolean} True se válido
 */
const isValidTrackingCode = (code) => {
  const regex = /^(LDA|LIS)-(LDA|LIS)-\d{4}-\d{3,4}$/;
  return regex.test(code.toUpperCase());
};

/**
 * Valida uma password
 * @param {string} password - Password a validar
 * @returns {Object} Resultado da validação
 */
const validatePassword = (password) => {
  const errors = [];
  
  if (!password || password.length < 8) {
    errors.push('A palavra-passe deve ter pelo menos 8 caracteres');
  }
  
  if (!/[A-Z]/.test(password)) {
    errors.push('A palavra-passe deve conter pelo menos uma letra maiúscula');
  }
  
  if (!/[a-z]/.test(password)) {
    errors.push('A palavra-passe deve conter pelo menos uma letra minúscula');
  }
  
  if (!/\d/.test(password)) {
    errors.push('A palavra-passe deve conter pelo menos um número');
  }
  
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    errors.push('A palavra-passe deve conter pelo menos um caractere especial');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Valida um endereço
 * @param {Object} address - Endereço a validar
 * @returns {Object} Resultado da validação
 */
const validateAddress = (address) => {
  const errors = [];
  
  if (!address || typeof address !== 'object') {
    errors.push('Endereço inválido');
    return { isValid: false, errors };
  }
  
  const { street, city, postalCode, country } = address;
  
  if (!street || street.trim().length < 5) {
    errors.push('Morada inválida');
  }
  
  if (!city || city.trim().length < 2) {
    errors.push('Cidade inválida');
  }
  
  if (country === 'Portugal' && postalCode) {
    if (!isValidPortuguesePostalCode(postalCode)) {
      errors.push('Código postal português inválido');
    }
  }
  
  if (!country || !constants.COUNTRIES[country.toUpperCase()]) {
    errors.push('País inválido');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

module.exports = {
  isValidEmail,
  isValidPhone,
  isValidNIF,
  isValidPortuguesePostalCode,
  isAlphaWithSpaces,
  isValidCurrency,
  isValidWeight,
  isValidDimensions,
  isValidDate,
  isValidUrl,
  isValidTrackingCode,
  validatePassword,
  validateAddress
};