const jwt = require('jsonwebtoken');
const logger = require('./logger');

/**
 * Utilitários de autenticação
 * Responsável por gerenciar tokens JWT e validações de autenticação
 */

// Configurações do JWT
const JWT_SECRET = process.env.JWT_SECRET || 'sua-chave-secreta-super-segura-aqui';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '24h';
const JWT_REFRESH_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN || '7d';

/**
 * Gera um token JWT para o usuário
 * @param {Object} user - Dados do usuário
 * @param {string} type - Tipo do token ('access' ou 'refresh')
 * @returns {string} Token JWT
 */
const generateToken = (user, type = 'access') => {
  try {
    const payload = {
      id: user.id,
      email: user.email,
      nome: user.nome,
      tipo: type
    };

    const expiresIn = type === 'refresh' ? JWT_REFRESH_EXPIRES_IN : JWT_EXPIRES_IN;

    const token = jwt.sign(payload, JWT_SECRET, {
      expiresIn,
      issuer: 'agroia-api',
      audience: 'agroia-frontend'
    });

    logger.info(`Token ${type} gerado para usuário ${user.id}`);
    return token;
  } catch (error) {
    logger.error('Erro ao gerar token:', error);
    throw new Error('Erro interno ao gerar token');
  }
};

/**
 * Gera um par de tokens (access e refresh)
 * @param {Object} user - Dados do usuário
 * @returns {Object} Objeto com accessToken e refreshToken
 */
const generateTokenPair = (user) => {
  try {
    const accessToken = generateToken(user, 'access');
    const refreshToken = generateToken(user, 'refresh');

    return {
      accessToken,
      refreshToken,
      expiresIn: JWT_EXPIRES_IN
    };
  } catch (error) {
    logger.error('Erro ao gerar par de tokens:', error);
    throw new Error('Erro interno ao gerar tokens');
  }
};

/**
 * Verifica e decodifica um token JWT
 * @param {string} token - Token JWT
 * @returns {Object} Dados decodificados do token
 */
const verifyToken = (token) => {
  try {
    const decoded = jwt.verify(token, JWT_SECRET, {
      issuer: 'agroia-api',
      audience: 'agroia-frontend'
    });

    return decoded;
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      throw new Error('Token expirado');
    } else if (error.name === 'JsonWebTokenError') {
      throw new Error('Token inválido');
    } else {
      logger.error('Erro ao verificar token:', error);
      throw new Error('Erro interno ao verificar token');
    }
  }
};

/**
 * Extrai o token do header Authorization
 * @param {string} authHeader - Header Authorization
 * @returns {string|null} Token extraído ou null
 */
const extractTokenFromHeader = (authHeader) => {
  if (!authHeader) {
    return null;
  }

  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    return null;
  }

  return parts[1];
};

/**
 * Middleware para verificar autenticação
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 * @param {Function} next - Next middleware function
 */
const authenticateToken = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const token = extractTokenFromHeader(authHeader);

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Token de acesso não fornecido'
      });
    }

    const decoded = verifyToken(token);
    req.user = decoded;
    next();
  } catch (error) {
    logger.error('Erro na autenticação:', error);
    return res.status(401).json({
      success: false,
      message: error.message || 'Token inválido'
    });
  }
};

/**
 * Middleware para verificar se o usuário é admin
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 * @param {Function} next - Next middleware function
 */
const requireAdmin = (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Usuário não autenticado'
      });
    }

    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Acesso negado. Apenas administradores podem acessar este recurso'
      });
    }

    next();
  } catch (error) {
    logger.error('Erro na verificação de admin:', error);
    return res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

/**
 * Gera hash de senha (placeholder - implementar com bcrypt)
 * @param {string} password - Senha em texto plano
 * @returns {string} Hash da senha
 */
const hashPassword = (password) => {
  // TODO: Implementar com bcrypt
  // Por enquanto, retorna a senha como está (NÃO USAR EM PRODUÇÃO)
  logger.warn('hashPassword não implementado - usando senha em texto plano');
  return password;
};

/**
 * Compara senha com hash (placeholder - implementar com bcrypt)
 * @param {string} password - Senha em texto plano
 * @param {string} hash - Hash da senha
 * @returns {boolean} True se as senhas coincidem
 */
const comparePassword = (password, hash) => {
  // TODO: Implementar com bcrypt
  // Por enquanto, compara diretamente (NÃO USAR EM PRODUÇÃO)
  logger.warn('comparePassword não implementado - comparando senhas em texto plano');
  return password === hash;
};

module.exports = {
  generateToken,
  generateTokenPair,
  verifyToken,
  extractTokenFromHeader,
  authenticateToken,
  requireAdmin,
  hashPassword,
  comparePassword,
  JWT_SECRET,
  JWT_EXPIRES_IN,
  JWT_REFRESH_EXPIRES_IN
};
