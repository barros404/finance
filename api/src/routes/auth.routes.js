const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const { body } = require('express-validator');
const { validateRequest } = require('../middleware/validateRequest');
const { protect } = require('../middleware/auth.middleware');

// User registration
router.post(
  '/register',
  [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('Please provide a valid email'),
    body('password')
      .isLength({ min: 8 })
      .withMessage('Password must be at least 8 characters long')
      .matches(/[0-9]/)
      .withMessage('Password must contain at least one number')
      .matches(/[a-z]/)
      .withMessage('Password must contain at least one lowercase letter')
      .matches(/[A-Z]/)
      .withMessage('Password must contain at least one uppercase letter'),
    body('companyName').trim().notEmpty().withMessage('Company name is required')
  ],
  validateRequest,
  authController.register
);

// User login
router.post(
  '/login',
  [
    body('email').isEmail().withMessage('Please provide a valid email'),
    body('senha').exists().withMessage('Senha is required')
  ],
  validateRequest,
  authController.login
);

// Get current user
router.get('/me', protect, authController.getMe);

// Forgot password
router.post(
  '/forgot-password',
  [
    body('email').isEmail().withMessage('Please provide a valid email')
  ],
  validateRequest,
  authController.forgotPassword
);

// Reset password
router.patch(
  '/reset-password/:token',
  [
    body('password')
      .isLength({ min: 8 })
      .withMessage('Password must be at least 8 characters long')
  ],
  validateRequest,
  authController.resetPassword
);

// Update password
router.patch(
  '/update-password',
  protect,
  [
    body('currentPassword').notEmpty().withMessage('Current password is required'),
    body('newPassword')
      .isLength({ min: 8 })
      .withMessage('New password must be at least 8 characters long')
  ],
  validateRequest,
  authController.updatePassword
);

module.exports = router;
