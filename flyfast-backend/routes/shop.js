const express = require('express');
const router = express.Router();
const shopController = require('../controllers/shopController');
const { auth, adminAuth } = require('../middleware/auth');
const { uploadMultiple } = require('../middleware/upload');
const { isAuthenticated, hasRole } = require('../middleware/authMiddleware');
const { uploadProductImages } = require('../middleware/upload');
const {
  validateCreateProduct,
  validateCreateOrder,
  validateIdParam,
  validatePagination,
  handleValidationErrors
} = require('../middleware/validation');

// Produtos (público)
router.get('/products', 
  validatePagination, 
  handleValidationErrors,
  shopController.getProducts
);

router.get('/products/:id', 
  validateIdParam, 
  handleValidationErrors,
  shopController.getProductById
);

router.get('/products/slug/:slug', shopController.getProductBySlug);
router.get('/products/category/:category', shopController.getProductsByCategory);
router.get('/products/search/:query', shopController.searchProducts);

// Carrinho (público/com sessão)
router.get('/cart', shopController.getCart);
router.post('/cart', shopController.addToCart);
router.put('/cart/:itemId', shopController.updateCartItem);
router.delete('/cart/:itemId', shopController.removeFromCart);
router.delete('/cart', shopController.clearCart);

// Checkout (requer autenticação)
router.post('/checkout', 
  isAuthenticated,
  validateCreateOrder, 
  handleValidationErrors,
  shopController.createOrder
);

router.post('/checkout/guest', 
  validateCreateOrder, 
  handleValidationErrors,
  shopController.createGuestOrder
);

router.get('/checkout/session/:sessionId', shopController.getCheckoutSession);

// Webhooks
router.post('/webhook/stripe', shopController.handleStripeWebhook);
router.post('/webhook/paypal', shopController.handlePayPalWebhook);

// Pedidos (autenticados)
router.get('/orders', isAuthenticated, shopController.getUserOrders);
router.get('/orders/:id', 
  isAuthenticated,
  validateIdParam, 
  handleValidationErrors,
  shopController.getOrderById
);

router.put('/orders/:id/cancel', 
  isAuthenticated,
  validateIdParam, 
  handleValidationErrors,
  shopController.cancelOrder
);

// Reviews
router.post('/products/:id/reviews', 
  isAuthenticated,
  validateIdParam, 
  handleValidationErrors,
  shopController.addReview
);

// Admin routes
router.post('/admin/products', 
  isAuthenticated, 
  hasRole(['admin']),
  validateCreateProduct, 
  handleValidationErrors,
  uploadMultiple('images', 5),
  uploadProductImages,
  shopController.createProduct
);

router.put('/admin/products/:id', 
  isAuthenticated, 
  hasRole(['admin']),
  validateIdParam,
  handleValidationErrors,
  uploadMultiple('images', 5),
  uploadProductImages,
  shopController.updateProduct
);

router.delete('/admin/products/:id', 
  isAuthenticated, 
  hasRole(['admin']),
  validateIdParam,
  handleValidationErrors,
  shopController.deleteProduct
);

router.get('/admin/orders', 
  isAuthenticated,
  hasRole(['admin']), 
  shopController.getAllOrders
);
router.put('/admin/orders/:id', 
  isAuthenticated, 
  hasRole(['admin']),
  validateIdParam,
  handleValidationErrors,
  shopController.adminUpdateOrder
);
router.get('/admin/stats', 
  isAuthenticated,
  hasRole(['admin']), 
  shopController.getShopStats
);

// Categories
router.get('/categories', shopController.getCategories);

// Discounts
router.get('/discounts/:code', shopController.validateDiscountCode);
router.post('/admin/discounts', 
  isAuthenticated,
  hasRole(['admin']), 
  shopController.createDiscount
);

module.exports = router;