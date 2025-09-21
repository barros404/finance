const logger = require('../utils/logger');

/**
 * Error handling middleware
 */
const errorHandler = (err, req, res, next) => {
  // Default error object
  const error = {
    status: 'error',
    message: err.message || 'Something went wrong!',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  };

  // Handle specific error types
  if (err.name === 'SequelizeValidationError' || err.name === 'SequelizeUniqueConstraintError') {
    // Handle validation errors
    error.message = 'Validation Error';
    error.errors = err.errors.map(e => ({
      field: e.path,
      message: e.message
    }));
    error.statusCode = 400;
  } else if (err.name === 'JsonWebTokenError') {
    // Handle JWT errors
    error.message = 'Invalid token. Please log in again!';
    error.statusCode = 401;
  } else if (err.name === 'TokenExpiredError') {
    // Handle expired token
    error.message = 'Your token has expired! Please log in again.';
    error.statusCode = 401;
  } else if (err.name === 'SequelizeDatabaseError') {
    // Handle database errors
    error.message = 'Database error occurred';
    error.statusCode = 400;
  } else if (err.name === 'SequelizeConnectionError') {
    // Handle connection errors
    error.message = 'Unable to connect to the database';
    error.statusCode = 503; // Service Unavailable
  }

  // Set status code
  const statusCode = err.statusCode || error.statusCode || 500;
  
  // Log the error
  if (statusCode >= 500) {
    logger.error(`${statusCode} - ${error.message} - ${req.originalUrl} - ${req.method} - ${req.ip}`, {
      error: {
        message: err.message,
        stack: err.stack,
        name: err.name
      },
      request: {
        method: req.method,
        url: req.originalUrl,
        headers: req.headers,
        body: req.body,
        params: req.params,
        query: req.query,
        user: req.user ? req.user.id : 'not authenticated'
      }
    });
  } else {
    // Log non-500 errors as warnings
    logger.warn(`${statusCode} - ${error.message} - ${req.originalUrl} - ${req.method} - ${req.ip}`, {
      error: {
        message: err.message,
        name: err.name
      },
      request: {
        method: req.method,
        url: req.originalUrl,
        user: req.user ? req.user.id : 'not authenticated'
      }
    });
  }

  // Send error response
  res.status(statusCode).json(error);
};

/**
 * 404 Not Found handler
 */
const notFound = (req, res, next) => {
  const error = new Error(`Not Found - ${req.originalUrl}`);
  res.status(404);
  next(error);
};

module.exports = { errorHandler, notFound };
