const express = require('express');
const router = express.Router();
const personalShopperController = require('../controllers/personalShopperController');
const { auth, adminAuth, staffAuth } = require('../middleware/auth');
const { isAuthenticated, hasRole } = require('../middleware/authMiddleware');
const {
  validatePersonalShopperRequest,
  validateIdParam,
  handleValidationErrors
} = require('../middleware/validation');

// Clientes
router.post('/request',
  isAuthenticated,
  validatePersonalShopperRequest,
  handleValidationErrors,
  personalShopperController.createRequest
);

router.get('/my-requests', isAuthenticated, personalShopperController.getMyRequests);
router.get('/my-requests/:id',
  isAuthenticated,
  validateIdParam,
  handleValidationErrors,
  personalShopperController.getMyRequestById
);

router.put('/my-requests/:id/cancel',
  isAuthenticated,
  validateIdParam,
  handleValidationErrors,
  personalShopperController.cancelRequest
);

router.post('/my-requests/:id/message',
  isAuthenticated,
  validateIdParam,
  handleValidationErrors,
  personalShopperController.sendMessage
);

// Staff routes
router.get('/staff/requests', 
  isAuthenticated,
  hasRole(['staff', 'admin']),
  personalShopperController.getAllRequests
);

router.get('/staff/assigned', 
  isAuthenticated,
  hasRole(['staff', 'admin']),
  personalShopperController.getAssignedRequests
);

router.put('/staff/requests/:id/assign', 
  isAuthenticated,
  hasRole(['staff', 'admin']),
  validateIdParam,
  handleValidationErrors,
  personalShopperController.assignRequest
);

router.put('/staff/requests/:id/status', 
  isAuthenticated,
  hasRole(['staff', 'admin']),
  validateIdParam,
  handleValidationErrors,
  personalShopperController.updateRequestStatus
);

router.post('/staff/requests/:id/message', 
  isAuthenticated,
  hasRole(['staff', 'admin']),
  validateIdParam,
  handleValidationErrors,
  personalShopperController.sendStaffMessage
);

router.put('/staff/requests/:id/search', 
  isAuthenticated,
  hasRole(['staff', 'admin']),
  validateIdParam,
  handleValidationErrors,
  personalShopperController.addSearchResult
);

router.put('/staff/requests/:id/select-option', 
  isAuthenticated,
  hasRole(['staff', 'admin']),
  validateIdParam,
  handleValidationErrors,
  personalShopperController.selectOption
);

// Admin routes
router.get('/admin/stats', 
  isAuthenticated,
  hasRole(['admin']),
  personalShopperController.getStats
);

router.get('/admin/requests/:id', 
  isAuthenticated,
  hasRole(['admin']),
  validateIdParam,
  handleValidationErrors,
  personalShopperController.getRequestById
);

router.put('/admin/requests/:id', 
  isAuthenticated,
  hasRole(['admin']),
  validateIdParam,
  handleValidationErrors,
  personalShopperController.adminUpdateRequest
);

router.delete('/admin/requests/:id', 
  isAuthenticated,
  hasRole(['admin']),
  validateIdParam,
  handleValidationErrors,
  personalShopperController.deleteRequest
);

// Public info
router.get('/info', personalShopperController.getServiceInfo);
router.get('/faq', personalShopperController.getFAQ);

module.exports = router;