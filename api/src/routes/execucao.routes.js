/**
 * Rotas de Execução - EndiAgro FinancePro
 *
 * Este arquivo define todas as rotas relacionadas à execução de orçamentos,
 * incluindo validações, middleware de autenticação e documentação.
 *
 * @author António Emiliano Barros
 * @version 1.0.0
 */

const express = require('express');
const router = express.Router();
const execucaoController = require('../controllers/execucao.controller');
const { protect } = require('../middleware/auth.middleware');
const { body, param, query } = require('express-validator');
const { validateRequest } = require('../middleware/validateRequest');

// Aplicar middleware de autenticação em todas as rotas
router.use(protect);

/**
 * @swagger
 * tags:
 *   name: Execuções
 *   description: Gerenciamento da execução de orçamentos e acompanhamento financeiro
 */

/**
 * @swagger
 * /api/execucoes:
 *   get:
 *     summary: Lista todas as execuções
 *     tags: [Execuções]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: orcamentoId
 *         schema:
 *           type: integer
 *         description: Filtrar por ID do orçamento
 *       - in: query
 *         name: tipo
 *         schema:
 *           type: string
 *           enum: [receita, custo, ativo]
 *         description: Filtrar por tipo
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pendente, aprovado, rejeitado, cancelado]
 *         description: Filtrar por status
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
 *         description: Lista de execuções retornada com sucesso
 *       401:
 *         description: Não autorizado
 *       500:
 *         description: Erro interno do servidor
 */
router
  .route('/')
  .get(
    [
      query('orcamentoId').optional().isInt(),
      query('tipo').optional().isIn(['receita', 'custo', 'ativo']),
      query('status').optional().isIn(['pendente', 'aprovado', 'rejeitado', 'cancelado']),
      query('dataInicio').optional().isISO8601(),
      query('dataFim').optional().isISO8601(),
      query('pagina').optional().isInt({ min: 1 }).toInt(),
      query('limite').optional().isInt({ min: 1, max: 100 }).toInt(),
      query('ordenarPor').optional().isIn(['dataExecucao', 'valorExecutado', 'status', 'criadoEm']),
      query('ordem').optional().isIn(['ASC', 'DESC'])
    ],
    validateRequest,
    execucaoController.listarExecucoes
  )
  .post(
    [
      body('orcamentoId').isInt().withMessage('ID do orçamento inválido'),
      body('tipo').isIn(['receita', 'custo', 'ativo']).withMessage('Tipo inválido'),
      body('itemId').isInt().withMessage('ID do item inválido'),
      body('valorExecutado').isFloat({ min: 0 }).withMessage('Valor executado deve ser positivo'),
      body('dataExecucao').isISO8601().withMessage('Data de execução inválida'),
      body('observacoes').optional().isString().trim()
    ],
    validateRequest,
    execucaoController.criarExecucao
  );

/**
 * @swagger
 * /api/execucoes/estatisticas:
 *   get:
 *     summary: Obtém estatísticas das execuções
 *     tags: [Execuções]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: orcamentoId
 *         schema:
 *           type: integer
 *         description: ID do orçamento para filtro
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
 *       401:
 *         description: Não autorizado
 */
router.get(
  '/estatisticas',
  [
    query('orcamentoId').optional().isInt(),
    query('dataInicio').optional().isISO8601(),
    query('dataFim').optional().isISO8601()
  ],
  validateRequest,
  execucaoController.obterEstatisticas
);

/**
 * @swagger
 * /api/execucoes/{id}:
 *   get:
 *     summary: Obtém uma execução específica
 *     tags: [Execuções]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID da execução
 *     responses:
 *       200:
 *         description: Execução retornada com sucesso
 *       404:
 *         description: Execução não encontrada
 *       401:
 *         description: Não autorizado
 */
router
  .route('/:id')
  .get(
    [
      param('id').isInt().withMessage('ID da execução inválido')
    ],
    validateRequest,
    execucaoController.obterExecucao
  )
  .patch(
    [
      param('id').isInt().withMessage('ID da execução inválido'),
      body('valorExecutado').optional().isFloat({ min: 0 }),
      body('dataExecucao').optional().isISO8601(),
      body('observacoes').optional().isString().trim(),
      body('status').optional().isIn(['pendente', 'aprovado', 'rejeitado', 'cancelado'])
    ],
    validateRequest,
    execucaoController.atualizarExecucao
  )
  .delete(
    [
      param('id').isInt().withMessage('ID da execução inválido')
    ],
    validateRequest,
    execucaoController.excluirExecucao
  );

/**
 * @swagger
 * /api/execucoes/{id}/aprovar:
 *   patch:
 *     summary: Aprova uma execução
 *     tags: [Execuções]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID da execução
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
 *         description: Execução aprovada com sucesso
 *       404:
 *         description: Execução não encontrada
 *       400:
 *         description: Execução já processada
 */
router.patch(
  '/:id/aprovar',
  [
    param('id').isInt().withMessage('ID da execução inválido'),
    body('observacoes').optional().isString().trim()
  ],
  validateRequest,
  execucaoController.aprovarExecucao
);

/**
 * @swagger
 * /api/execucoes/{id}/rejeitar:
 *   patch:
 *     summary: Rejeita uma execução
 *     tags: [Execuções]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID da execução
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               motivo:
 *                 type: string
 *                 description: Motivo da rejeição
 *     responses:
 *       200:
 *         description: Execução rejeitada com sucesso
 *       404:
 *         description: Execução não encontrada
 *       400:
 *         description: Execução já processada
 */
router.patch(
  '/:id/rejeitar',
  [
    param('id').isInt().withMessage('ID da execução inválido'),
    body('motivo').notEmpty().withMessage('Motivo da rejeição é obrigatório')
  ],
  validateRequest,
  execucaoController.rejeitarExecucao
);

module.exports = router;