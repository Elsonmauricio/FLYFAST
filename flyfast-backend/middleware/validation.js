const { body, param, query, validationResult, oneOf } = require('express-validator');

// Validações de autenticação
const validateRegister = [
  body('name')
    .trim()
    .notEmpty().withMessage('Nome é obrigatório')
    .isLength({ min: 2, max: 50 }).withMessage('Nome deve ter entre 2 e 50 caracteres'),
  
  body('email')
    .trim()
    .notEmpty().withMessage('Email é obrigatório')
    .isEmail().withMessage('Email inválido')
    .normalizeEmail(),
  
  // Valida se o telefone corresponde ao formato de Angola OU de Portugal
  oneOf([
    body('phone')
      .trim()
      .matches(/^(\+?244)?[9][1-9][0-9]{7}$/),
    body('phone')
      .trim()
      .matches(/^(\+351)?[9][1-9][0-9]{7}$/)
  ], 'Formato de telefone inválido. Use um número de Angola ou Portugal.'),
  
  body('password')
    .notEmpty().withMessage('Palavra-passe é obrigatória')
    .isLength({ min: 6 }).withMessage('Palavra-passe deve ter pelo menos 6 caracteres')
    .matches(/^(?=.*[A-Za-z])(?=.*\d)/).withMessage('Palavra-passe deve conter letras e números'),
  
  body('confirmPassword')
    .custom((value, { req }) => value === req.body.password)
    .withMessage('Palavras-passe não coincidem')
];

const validateLogin = [
  body('email')
    .trim()
    .notEmpty().withMessage('Email é obrigatório')
    .isEmail().withMessage('Email inválido')
    .normalizeEmail(),
  
  body('password')
    .notEmpty().withMessage('Palavra-passe é obrigatória')
];

// Validações de envios
const validateCreateShipment = [
  body('sender.name')
    .trim()
    .notEmpty().withMessage('Nome do remetente é obrigatório'),
  
  body('sender.phone')
    .trim()
    .notEmpty().withMessage('Telefone do remetente é obrigatório'),
  
  body('sender.address.street')
    .trim()
    .notEmpty().withMessage('Morada do remetente é obrigatória'),
  
  body('recipient.name')
    .trim()
    .notEmpty().withMessage('Nome do destinatário é obrigatório'),
  
  body('recipient.phone')
    .trim()
    .notEmpty().withMessage('Telefone do destinatário é obrigatório'),
  
  body('recipient.address.street')
    .trim()
    .notEmpty().withMessage('Morada do destinatário é obrigatória'),
  
  body('route.from')
    .isIn(['Luanda', 'Lisboa', 'Outro']).withMessage('Origem inválida'),
  
  body('route.to')
    .isIn(['Luanda', 'Lisboa', 'Outro']).withMessage('Destino inválido'),
  
  body('package.description')
    .trim()
    .notEmpty().withMessage('Descrição do pacote é obrigatória'),
  
  body('package.weight.value')
    .isFloat({ min: 0.1, max: 50 }).withMessage('Peso deve ser entre 0.1kg e 50kg'),
  
  body('package.value.amount')
    .optional()
    .isFloat({ min: 0 }).withMessage('Valor deve ser positivo'),
  
  body('insurance.isInsured')
    .optional()
    .isBoolean().withMessage('Valor de seguro inválido')
];

// Validações de produtos
const validateCreateProduct = [
  body('name')
    .trim()
    .notEmpty().withMessage('Nome do produto é obrigatório')
    .isLength({ max: 100 }).withMessage('Nome muito longo'),
  
  body('description')
    .trim()
    .notEmpty().withMessage('Descrição é obrigatória'),
  
  body('category')
    .isIn(['merchandise', 'packing_materials', 'travel_accessories', 'shipping_supplies'])
    .withMessage('Categoria inválida'),
  
  body('price.amount')
    .isFloat({ min: 0 }).withMessage('Preço deve ser positivo'),
  
  body('price.currency')
    .isIn(['AOA', 'EUR', 'USD']).withMessage('Moeda inválida'),
  
  body('inventory.stock')
    .isInt({ min: 0 }).withMessage('Stock deve ser um número positivo'),
  
  body('status')
    .optional()
    .isIn(['draft', 'active', 'out_of_stock', 'discontinued', 'archived'])
    .withMessage('Status inválido')
];

// Validações de pedidos
const validateCreateOrder = [
  body('items')
    .isArray({ min: 1 }).withMessage('Deve conter pelo menos um item'),
  
  body('items.*.productId')
    .notEmpty().withMessage('ID do produto é obrigatório')
    .isString().withMessage('ID do produto inválido'),
  
  body('items.*.quantity')
    .isInt({ min: 1 }).withMessage('Quantidade deve ser pelo menos 1'),
  
  body('shipping.method')
    .isIn(['standard', 'express', 'pickup']).withMessage('Método de envio inválido'),
  
  body('payment.method')
    .isIn(['stripe', 'paypal', 'mbway', 'bank_transfer', 'cash'])
    .withMessage('Método de pagamento inválido')
];

// Validações de Personal Shopper
const validatePersonalShopperRequest = [
  body('clientInfo.name')
    .trim()
    .notEmpty().withMessage('Nome é obrigatório'),
  
  body('clientInfo.email')
    .trim()
    .notEmpty().withMessage('Email é obrigatório')
    .isEmail().withMessage('Email inválido'),
  
  body('clientInfo.phone')
    .trim()
    .notEmpty().withMessage('Telefone é obrigatório'),
  
  body('clientInfo.country')
    .isIn(['Angola', 'Portugal']).withMessage('País inválido'),
  
  body('product.name')
    .trim()
    .notEmpty().withMessage('Nome do produto é obrigatório'),
  
  body('budget.amount')
    .isFloat({ min: 0 }).withMessage('Orçamento deve ser positivo'),
  
  body('budget.currency')
    .isIn(['AOA', 'EUR', 'USD']).withMessage('Moeda inválida')
];

// Validações de parâmetros
const validateIdParam = [
  param('id')
    .notEmpty().withMessage('ID é obrigatório')
    .isString().withMessage('ID inválido')
];

const validateTrackingCode = [
  param('trackingCode')
    .notEmpty().withMessage('Código de rastreio é obrigatório')
    .matches(/^[A-Z]{3}-[A-Z]{3}-\d{4}-\d{4}$/).withMessage('Formato de código inválido')
];

// Validações de consulta
const validatePagination = [
  query('page')
    .optional()
    .isInt({ min: 1 }).withMessage('Página deve ser um número positivo')
    .toInt(),
  
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 }).withMessage('Limite deve ser entre 1 e 100')
    .toInt(),
  
  query('sort')
    .optional()
    .isIn(['asc', 'desc', 'newest', 'oldest', 'price_asc', 'price_desc'])
    .withMessage('Ordenação inválida')
];

// Middleware para processar resultados
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: 'Erro de validação',
      errors: errors.array().map(err => ({
        field: err.param,
        message: err.msg,
        value: err.value
      }))
    });
  }
  
  next();
};

module.exports = {
  // Validações
  validateRegister,
  validateLogin,
  validateCreateShipment,
  validateCreateProduct,
  validateCreateOrder,
  validatePersonalShopperRequest,
  validateIdParam,
  validateTrackingCode,
  validatePagination,
  
  // Middleware
  handleValidationErrors
};