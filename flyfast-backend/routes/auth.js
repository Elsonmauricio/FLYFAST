const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { isAuthenticated, hasRole } = require('../middleware/authMiddleware');
const {
  validateRegister,
  validateLogin,
  handleValidationErrors
} = require('../middleware/validation');

// Rotas públicas
router.post('/register', 
  validateRegister, 
  handleValidationErrors, 
  authController.register
);

router.post('/login', 
  validateLogin, 
  handleValidationErrors, 
  authController.login
);

router.post('/refresh', authController.refreshToken);
router.post('/forgot-password', authController.forgotPassword);
router.post('/reset-password', authController.resetPassword);
router.post('/verify-email', authController.verifyEmail);
router.post('/resend-verification', authController.resendVerification);

// Rotas protegidas
router.get('/profile', isAuthenticated, authController.getProfile);
router.put('/profile', isAuthenticated, authController.updateProfile);
router.put('/change-password', isAuthenticated, authController.changePassword);
router.post('/logout', isAuthenticated, authController.logout);

// Rotas admin
router.get('/users', isAuthenticated, hasRole(['admin']), authController.getAllUsers);
router.get('/users/:id', isAuthenticated, hasRole(['admin']), authController.getUserById);
router.put('/users/:id', isAuthenticated, hasRole(['admin']), authController.updateUser);
router.delete('/users/:id', isAuthenticated, hasRole(['admin']), authController.deleteUser);
router.put('/users/:id/role', isAuthenticated, hasRole(['admin']), authController.changeUserRole);

module.exports = router;