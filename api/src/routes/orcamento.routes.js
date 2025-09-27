/**
 * Rotas de Orçamentos - EndiAgro FinancePro
 * 
 * Este arquivo define todas as rotas relacionadas a orçamentos,
 * incluindo validações, middleware de autenticação e documentação.
 * 
 * @author António Emiliano Barros
 * @version 1.0.0
 */

const express = require('express');
const router = express.Router();
const orcamentoController = require('../controllers/orcamento.controller');
const { protect } = require('../middleware/auth.middleware');
const { body, param, query } = require('express-validator');
const { validateRequest } = require('../middleware/validateRequest');

// Aplicar middleware de autenticação em todas as rotas
router.use(protect);

/**
 * @swagger
 * tags:
 *   name: Orçamentos
 *   description: Gerenciamento de orçamentos e planejamento financeiro
 */

/**
 * @swagger
 * /api/orcamentos:
 *   get:
 *     summary: Lista todos os orçamentos
 *     tags: [Orçamentos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [rascunho, pendente, aprovado, rejeitado, ativo, concluido, arquivado]
 *         description: Filtrar por status
 *       - in: query
 *         name: busca
 *         schema:
 *           type: string
 *         description: Buscar por nome ou descrição
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
 *         description: Lista de orçamentos retornada com sucesso
 *       401:
 *         description: Não autorizado
 *       500:
 *         description: Erro interno do servidor
 */
router
  .route('/')
  .get(
    [
      query('status').optional().isIn(['rascunho', 'pendente', 'aprovado', 'rejeitado', 'ativo', 'concluido', 'arquivado']),
      query('busca').optional().isString().trim(),
      query('pagina').optional().isInt({ min: 1 }).toInt(),
      query('limite').optional().isInt({ min: 1, max: 100 }).toInt(),
      query('dataInicio').optional().isISO8601(),
      query('dataFim').optional().isISO8601(),
      query('ordenarPor').optional().isIn(['nome', 'dataInicio', 'dataFim', 'status', 'criadoEm']),
      query('ordem').optional().isIn(['ASC', 'DESC'])
    ],
    validateRequest,
    orcamentoController.listarOrcamentos
  )
  .post(
    [
      body('nome').trim().notEmpty().withMessage('Nome do orçamento é obrigatório'),
      body('descricao').optional().isString().trim(),
      body('dataInicio').isISO8601().withMessage('Data de início inválida'),
      body('dataFim').isISO8601().withMessage('Data de fim inválida'),
      body('moeda').optional().isIn(['AOA', 'USD', 'EUR', 'BRL']),
      body('temSazonalidade').optional().isBoolean(),
      body('mesesSazonais').optional().isArray(),
      body('observacoes').optional().isString().trim(),
      body('receitas').optional().isArray(),
      body('custos').optional().isArray(),
      body('ativos').optional().isArray()
    ],
    validateRequest,
    orcamentoController.criarOrcamento
  );

/**
 * @swagger
 * /api/orcamentos/novo-orcamento:
 *   post:
 *     summary: Cria um orçamento completo a partir do formulário
 *     tags: [Orçamentos]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               companyInfo:
 *                 type: object
 *                 properties:
 *                   name:
 *                     type: string
 *                   type:
 *                     type: string
 *                   sectors:
 *                     type: array
 *                     items:
 *                       type: string
 *               revenues:
 *                 type: array
 *                 items:
 *                   type: object
 *               costs:
 *                 type: object
 *                 properties:
 *                   materials:
 *                     type: array
 *                   services:
 *                     type: array
 *                   personnel:
 *                     type: array
 *                   fixed:
 *                     type: array
 *               assets:
 *                 type: array
 *               seasonality:
 *                 type: object
 *     responses:
 *       201:
 *         description: Orçamento criado com sucesso
 *       400:
 *         description: Dados inválidos
 *       401:
 *         description: Não autorizado
 */
router.post(
  '/novo-orcamento',
  [
    body('nome').trim().notEmpty().withMessage('Nome do orçamento é obrigatório'),
    body('ano').isInt({ min: 2020, max: 2100 }).withMessage('Ano inválido'),
    body('descricao').optional().isString().trim(),
    body('observacoes').optional().isString().trim(),
    body('receitas').optional().isArray(),
    body('custos').optional().isObject(),
    body('custos.materials').optional().isArray(),
    body('custos.services').optional().isArray(),
    body('custos.personnel').optional().isArray(),
    body('custos.fixed').optional().isArray(),
    body('ativos').optional().isArray(),
    body('sazonalidade').optional().isArray()
  ],
  validateRequest,
  orcamentoController.criarOrcamentoCompleto
);

/**
 * @swagger
 * /api/orcamentos/estatisticas:
 *   get:
 *     summary: Obtém estatísticas dos orçamentos
 *     tags: [Orçamentos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: dataInicio
 *         schema:
 *           type: string
 *           format: date
 *         description: Data de início para filtro
 *       - in: query
 *         name: dataFim
 *         schema:
 *           type: string
 *           format: date
 *         description: Data de fim para filtro
 *     responses:
 *       200:
 *         description: Estatísticas retornadas com sucesso
 */
router.get(
  '/estatisticas',
  [
    query('dataInicio').optional().isISO8601(),
    query('dataFim').optional().isISO8601()
  ],
  validateRequest,
  orcamentoController.obterEstatisticas
);

/**
 * @swagger
 * /api/orcamentos/aprovado:
 *   get:
 *     summary: Obtém o orçamento aprovado para um ano específico
 *     tags: [Orçamentos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: ano
 *         required: true
 *         schema:
 *           type: integer
 *           minimum: 2020
 *           maximum: 2100
 *         description: Ano do orçamento aprovado
 *     responses:
 *       200:
 *         description: Orçamento aprovado retornado com sucesso
 *       400:
 *         description: Ano obrigatório
 *       401:
 *         description: Não autorizado
 *       500:
 *         description: Erro interno do servidor
 */
router.get(
  '/aprovado',
  [
    query('ano').isInt({ min: 2020, max: 2100 }).withMessage('Ano inválido')
  ],
  validateRequest,
  orcamentoController.obterOrcamentoAprovado
);

/**
 * @swagger
 * /api/orcamentos/{id}:
 *   get:
 *     summary: Obtém um orçamento específico
 *     tags: [Orçamentos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID do orçamento
 *     responses:
 *       200:
 *         description: Orçamento retornado com sucesso
 *       404:
 *         description: Orçamento não encontrado
 */
router
  .route('/:id')
  .get(
    [
      param('id').isInt().withMessage('ID do orçamento inválido')
    ],
    validateRequest,
    orcamentoController.obterOrcamento
  )
  .patch(
    [
      param('id').isInt().withMessage('ID do orçamento inválido'),
      body('nome').optional().trim().notEmpty(),
      body('descricao').optional().isString().trim(),
      body('dataInicio').optional().isISO8601(),
      body('dataFim').optional().isISO8601(),
      body('status').optional().isIn(['rascunho', 'pendente', 'aprovado', 'rejeitado', 'ativo', 'concluido', 'arquivado']),
      body('temSazonalidade').optional().isBoolean(),
      body('mesesSazonais').optional().isArray(),
      body('observacoes').optional().isString().trim()
    ],
    validateRequest,
    orcamentoController.atualizarOrcamento
  )
  .delete(
    [
      param('id').isInt().withMessage('ID do orçamento inválido')
    ],
    validateRequest,
    orcamentoController.excluirOrcamento
  );

/**
 * @swagger
 * /api/orcamentos/{id}/aprovar:
 *   patch:
 *     summary: Aprova um orçamento
 *     tags: [Orçamentos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID do orçamento
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               observacoes:
 *                 type: string
 *     responses:
 *       200:
 *         description: Orçamento aprovado com sucesso
 *       404:
 *         description: Orçamento não encontrado
 */
router.patch(
  '/:id/aprovar',
  [
    param('id').isInt().withMessage('ID do orçamento inválido'),
    body('observacoes').optional().isString().trim()
  ],
  validateRequest,
  orcamentoController.aprovarOrcamento
);

/**
 * @swagger
 * /api/orcamentos/{id}/rejeitar:
 *   patch:
 *     summary: Rejeita um orçamento
 *     tags: [Orçamentos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID do orçamento
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               motivo:
 *                 type: string
 *     responses:
 *       200:
 *         description: Orçamento rejeitado
 *       404:
 *         description: Orçamento não encontrado
 */
router.patch(
  '/:id/rejeitar',
  [
    param('id').isInt().withMessage('ID do orçamento inválido'),
    body('motivo').notEmpty().withMessage('Motivo da rejeição é obrigatório')
  ],
  validateRequest,
  orcamentoController.rejeitarOrcamento
);

module.exports = router;
