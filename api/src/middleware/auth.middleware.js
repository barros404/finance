const jwt = require('jsonwebtoken');
const { Usuario } = require('../models');
const logger = require('../utils/logger');

/**
 * Protect routes - require authentication
 */
exports.protect = async (req, res, next) => {
  try {
    let token;
    
    // 1) Get token from header
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies?.token) {
      token = req.cookies.token;
    }

    if (!token) {
      return res.status(401).json({
        status: 'error',
        message: 'Voce Não esta Logado Por fazor faz o login.'
      });
    }

    // 2) Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 3) Check if user still exists and get a proper model instance
    const currentUsuario = await Usuario.findOne({
      where: { id: decoded.id },
      raw: false // This ensures we get a full model instance with methods
    });
    
    if (!currentUsuario) {
      return res.status(401).json({
        status: 'error',
        message: 'O usuario que pertence a este token nao existe mais.'
      });
    }

    // 4) Check if user changed password after the token was issued
    if (currentUsuario.changedPasswordAfter && currentUsuario.changedPasswordAfter(decoded.iat)) {
      return res.status(401).json({
        status: 'error',
        message: 'O usuario recentemente mudou a senha! Por favor faça login novamente.'
      });
    } else {
      logger.warn('Método changedPasswordAfter não encontrado no modelo Usuario');
    }
    

    // GRANT ACCESS TO PROTECTED ROUTE (compatibilidade com controladores)
    req.user = currentUsuario;
    res.locals.user = currentUsuario;
    req.usuario = currentUsuario;
    res.locals.usuario = currentUsuario;
    next();
  } catch (error) {
    logger.error(`Authentication error: ${error.message}`, { error });
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        status: 'error',
        message: 'Invalid token. Please log in again!'
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        status: 'error',
        message: 'Your token has expired! Please log in again.'
      });
    }
    
    next(error);
  }
};

/**
 * Restrict access to certain roles
 */
exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    // roles is an array of allowed roles ['admin', 'manager']
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        status: 'error',
        message: 'You do not have permission to perform this action.'
      });
    }
    next();
  };
};

/**
 * Check if user is logged in (for optional authentication)
 */
exports.isLoggedIn = async (req, res, next) => {
  try {
    if (req.cookies?.token) {
      // 1) Verify token
      const decoded = jwt.verify(req.cookies.token, process.env.JWT_SECRET);

      // 2) Check if user still exists
      const currentUsuario = await Usuario.findByPk(decoded.id);
      if (currentUsuario) {
        // 3) Check if user changed password after the token was issued
        if (typeof currentUsuario.changedPasswordAfter === 'function') {
          if (!currentUsuario.changedPasswordAfter(decoded.iat)) {
            req.user = currentUsuario;
            res.locals.user = currentUsuario;
            req.usuario = currentUsuario;
            res.locals.usuario = currentUsuario;
          }
        } else {
          // Se o método não existir, assume que o usuário é válido
          req.user = currentUsuario;
          res.locals.user = currentUsuario;
          req.usuario = currentUsuario;
          res.locals.usuario = currentUsuario;
        }
      }
    }
    next();
  } catch (err) {
    next();
  }
};
