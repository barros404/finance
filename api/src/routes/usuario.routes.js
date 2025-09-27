/**
 * Rotas de Usuários - EndiAgro FinancePro
 *
 * Este arquivo define todas as rotas relacionadas ao gerenciamento de usuários,
 * incluindo validações, middleware de autenticação e autorização.
 *
 * @author António Emiliano Barros
 * @version 1.0.0
 */

const express = require('express');
const router = express.Router();
const usuarioController = require('../controllers/usuario.controller');
const { protect } = require('../middleware/auth.middleware');
const { body, param, query } = require('express-validator');
const { validateRequest } = require('../middleware/validateRequest');

// Aplicar middleware de autenticação em todas as rotas
router.use(protect);

/**
 * @swagger
 * tags:
 *   name: Usuários
 *   description: Gerenciamento de usuários do sistema
 */

/**
 * @swagger
 * /api/usuarios:
 *   get:
 *     summary: Lista todos os usuários
 *     tags: [Usuários]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: perfil
 *         schema:
 *           type: string
 *           enum: [admin, gestor, usuario]
 *         description: Filtrar por perfil
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [ativo, inativo]
 *         description: Filtrar por status
 *       - in: query
 *         name: busca
 *         schema:
 *           type: string
 *         description: Buscar por nome ou email
 *       - in: query
 *         name: pagina
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: Número da página
 *       - in: query
 *         name: limite
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *         description: Itens por página
 *     responses:
 *       200:
 *         description: Lista de usuários retornada com sucesso
 *       401:
 *         description: Não autorizado
 *       403:
 *         description: Acesso negado
 *       500:
 *         description: Erro interno do servidor
 */
router
  .route('/')
  .get(
    [
      query('perfil').optional().isIn(['admin', 'gestor', 'usuario']),
      query('status').optional().isIn(['ativo', 'inativo']),
      query('busca').optional().isString().trim(),
      query('pagina').optional().isInt({ min: 1 }).toInt(),
      query('limite').optional().isInt({ min: 1, max: 100 }).toInt(),
      query('ordenarPor').optional().isIn(['nome', 'email', 'perfil', 'status', 'criadoEm']),
      query('ordem').optional().isIn(['ASC', 'DESC'])
    ],
    validateRequest,
    usuarioController.listarUsuarios
  )
  .post(
    [
      body('nome').trim().notEmpty().withMessage('Nome é obrigatório'),
      body('email').isEmail().withMessage('Email inválido'),
      body('senha').isLength({ min: 8 }).withMessage('Senha deve ter pelo menos 8 caracteres')
        .matches(/[0-9]/).withMessage('Senha deve conter pelo menos um número')
        .matches(/[a-z]/).withMessage('Senha deve conter pelo menos uma letra minúscula')
        .matches(/[A-Z]/).withMessage('Senha deve conter pelo menos uma letra maiúscula'),
      body('perfil').optional().isIn(['admin', 'gestor', 'usuario']).withMessage('Perfil inválido'),
      body('telefone').optional().isString().trim(),
      body('departamento').optional().isString().trim()
    ],
    validateRequest,
    usuarioController.criarUsuario
  );

/**
 * @swagger
 * /api/usuarios/perfil:
 *   get:
 *     summary: Obtém o perfil do usuário logado
 *     tags: [Usuários]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Perfil do usuário retornado com sucesso
 *       401:
 *         description: Não autorizado
 */
router.get('/perfil', usuarioController.obterPerfil);

/**
 * @swagger
 * /api/usuarios/{id}:
 *   get:
 *     summary: Obtém um usuário específico
 *     tags: [Usuários]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID do usuário
 *     responses:
 *       200:
 *         description: Usuário retornado com sucesso
 *       404:
 *         description: Usuário não encontrado
 *       401:
 *         description: Não autorizado
 *       403:
 *         description: Acesso negado
 */
router
  .route('/:id')
  .get(
    [
      param('id').isInt().withMessage('ID do usuário inválido')
    ],
    validateRequest,
    usuarioController.obterUsuarioPorId
  )
  .patch(
    [
      param('id').isInt().withMessage('ID do usuário inválido'),
      body('nome').optional().trim().notEmpty(),
      body('email').optional().isEmail(),
      body('telefone').optional().isString().trim(),
      body('departamento').optional().isString().trim(),
      body('perfil').optional().isIn(['admin', 'gestor', 'usuario']),
      body('status').optional().isIn(['ativo', 'inativo'])
    ],
    validateRequest,
    usuarioController.atualizarUsuario
  )
  .delete(
    [
      param('id').isInt().withMessage('ID do usuário inválido')
    ],
    validateRequest,
    usuarioController.removerUsuario
  );

/**
 * @swagger
 * /api/usuarios/{id}/senha:
 *   patch:
 *     summary: Altera a senha de um usuário
 *     tags: [Usuários]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID do usuário
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               senhaAtual:
 *                 type: string
 *                 description: Senha atual (obrigatória se não for admin)
 *               novaSenha:
 *                 type: string
 *                 description: Nova senha
 *     responses:
 *       200:
 *         description: Senha alterada com sucesso
 *       400:
 *         description: Dados inválidos
 *       403:
 *         description: Acesso negado
 *       404:
 *         description: Usuário não encontrado
 */
router.patch(
  '/:id/senha',
  [
    param('id').isInt().withMessage('ID do usuário inválido'),
    body('novaSenha').isLength({ min: 8 }).withMessage('Nova senha deve ter pelo menos 8 caracteres')
      .matches(/[0-9]/).withMessage('Nova senha deve conter pelo menos um número')
      .matches(/[a-z]/).withMessage('Nova senha deve conter pelo menos uma letra minúscula')
      .matches(/[A-Z]/).withMessage('Nova senha deve conter pelo menos uma letra maiúscula'),
    body('senhaAtual').optional().isString()
  ],
  validateRequest,
  usuarioController.atualizarSenha
);

/**
 * @swagger
 * /api/usuarios/{id}/status:
 *   patch:
 *     summary: Altera o status de um usuário (ativar/desativar)
 *     tags: [Usuários]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID do usuário
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [ativo, inativo]
 *     responses:
 *       200:
 *         description: Status alterado com sucesso
 *       400:
 *         description: Dados inválidos
 *       403:
 *         description: Acesso negado
 *       404:
 *         description: Usuário não encontrado
 */
router.patch(
  '/:id/status',
  [
    param('id').isInt().withMessage('ID do usuário inválido'),
    body('status').isIn(['ativo', 'inativo']).withMessage('Status inválido')
  ],
  validateRequest,
  usuarioController.alterarStatus
);

module.exports = router;