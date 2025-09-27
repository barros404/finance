const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { Usuario } = require('../models');
const { Op } = require('sequelize');
const logger = require('../utils/logger');
const { generateToken } = require('../utils/auth');
const { validationResult } = require('express-validator');

/**
 * Registrar um novo usuário
 * @route POST /api/auth/register
 */
exports.register = async (req, res, next) => {
  try {
    // Validate request
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        status: 'error',
        message: 'Validação falhou',
        errors: errors.array()
      });
    }

    const { name:nome, email, password:senha, companyName } = req.body;

    // Check if user already exists
    const existingUsuario = await Usuario.findOne({ where: { email } });
    if (existingUsuario) {
      return res.status(400).json({
        status: 'error',
        message: 'E-mail já está em uso',
        field: 'email'
      });
    }

    // Create user with hashed password
    const user = await Usuario.create({
      nome,
      email,
      senha,
      role: 'tecnico' // First user is an admin by default
    });

    // Generate JWT token
    const token = generateToken(user.get({ plain: true }));

    // Prepare user data to send back (exclude password)
    const userData = user.get({ plain: true });
    delete userData.senha;

    res.status(201).json({
      status: 'success',
      data: {
        user: userData,
        token
      }
    });
  } catch (error) {
    logger.error(`Erro no registro: ${error.message}`, { error });
    next(error);
  }
};

/**
 * Login user
 * @route POST /api/auth/login
 */
exports.login = async (req, res, next) => {
  try {
    const { email, senha } = req.body;
  

    // Check if user exists
    const user = await Usuario.scope('comSenha').findOne({ where: { email } });
    if (!user) {
      return res.status(401).json({
        status: 'error',
        message: 'Credenciais inválidas'
      });
    }

    // Check if password is correct
    const isMatch = await user.compararSenha(senha);
    if (!isMatch) {
      return res.status(401).json({
        status: 'error',
        message: 'Credenciais inválidas'
      });
    }

    // Check if user is active
    if (user.status !== 'ativo') {
      return res.status(403).json({
        status: 'error',
        message: 'Conta está desativada. Entre em contato com o suporte.'
      });
    }

    // Update last login
    user.ultimoLogin = new Date();
    await user.save();

    // Generate JWT token
    const token = generateToken(user.get({ plain: true }));

    // Prepare user data to send back (exclude password)
    const userData = user.get({ plain: true });
    delete userData.senha;

    res.status(200).json({
      status: 'success',
      data: {
        user: userData,
        token
      }
    });
  } catch (error) {
    logger.error(`Erro no login: ${error.message}`, { error });
    next(error);
  }
};

/**
 * Get current authenticated user
 * @route GET /api/auth/me
 */
exports.getMe = async (req, res, next) => {
  try {
    // Usuario is already attached to req by the auth middleware
    const user = await Usuario.findByPk(req.user.id, {
      attributes: { exclude: ['senha', 'tokenResetSenha', 'tokenResetExpira'] },
      include: [
        {
          association: 'empresa',
          attributes: ['id', 'nome', 'nif']
        }
      ]
    });

    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'Usuário não encontrado'
      });
    }

    res.status(200).json({
      status: 'success',
      data: {
        user
      }
    });
  } catch (error) {
    logger.error(`Erro ao obter dados do usuário: ${error.message}`, { error });
    next(error);
  }
};

/**
 * Forgot password - Send reset password email
 * @route POST /api/auth/forgot-password
 */
exports.forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;

    // Find user by email
    const user = await Usuario.findOne({ where: { email } });
    if (!user) {
      // Don't reveal if the email exists or not
      return res.status(200).json({
        status: 'success',
        message: 'Se o e-mail estiver cadastrado, você receberá um link para redefinir sua senha.'
      });
    }

    // Generate reset token
    const resetToken = user.criarTokenRedefinicaoSenha();
    await user.save({ validate: false });

    // TODO: Send email with reset token
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;
    
    logger.info(`Link de redefinição de senha: ${resetUrl}`);

    res.status(200).json({
      status: 'success',
      message: 'Instruções de redefinição de senha enviadas para o seu e-mail.'
    });
  } catch (error) {
    logger.error(`Erro ao processar solicitação de redefinição de senha: ${error.message}`, { error });
    next(error);
  }
};

/**
 * Reset password
 * @route PATCH /api/auth/reset-password/:token
 */
exports.resetPassword = async (req, res, next) => {
  try {
    const { token } = req.params;
    const { password: novaSenha } = req.body;

    // 1) Get user based on the token
    const hashedToken = crypto
      .createHash('sha256')
      .update(token)
      .digest('hex');

    const user = await Usuario.findOne({
      where: {
        tokenResetSenha: hashedToken,
        tokenResetExpira: { [Op.gt]: Date.now() }
      }
    });

    // 2) If token has not expired, and there is user, set the new password
    if (!user) {
      return res.status(400).json({
        status: 'error',
        message: 'Token inválido ou expirado'
      });
    }

    // 3) Update changedPasswordAt property for the user
    user.senha = novaSenha;
    user.tokenResetSenha = null;
    user.tokenResetExpira = null;
    await user.save();

    // 4) Log the user in, send JWT
    const authToken = generateToken(user.get({ plain: true }));

    res.status(200).json({
      status: 'success',
      token: authToken,
      message: 'Senha redefinida com sucesso!'
    });
  } catch (error) {
    logger.error(`Erro ao redefinir senha: ${error.message}`, { error });
    next(error);
  }
};

/**
 * Update password
 * @route PATCH /api/auth/update-password
 */
exports.updatePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await Usuario.scope('comSenha').findByPk(req.user.id);

    // 1) Check if current password is correct
    if (!(await user.compararSenha(currentPassword))) {
      return res.status(401).json({
        status: 'error',
        message: 'Senha atual está incorreta.'
      });
    }

    // 2) Update password
    user.senha = newPassword;
    await user.save();

    // 3) Generate new JWT
    const token = generateToken(user.get({ plain: true }));

    res.status(200).json({
      status: 'success',
      token,
      message: 'Senha atualizada com sucesso!'
    });
  } catch (error) {
    logger.error(`Erro ao atualizar senha: ${error.message}`, { error });
    next(error);
  }
};
