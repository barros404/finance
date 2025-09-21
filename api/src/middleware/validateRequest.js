const { validationResult } = require('express-validator');

/**
 * Middleware to validate request using express-validator
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const validateRequest = (req, res, next) => {
  const errors = validationResult(req);
  console.log('ERROS',errors)
  
  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map(error => ({
      field: error.param,
      message: error.msg
    }));
    
    return res.status(400).json({
      status: 'error',
      message: 'Validation failed',
      errors: errorMessages
    });
  }
  
  next();
};

module.exports = { validateRequest };
