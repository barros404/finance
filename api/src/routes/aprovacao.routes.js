/**
 * Rotas de Aprovação - EndiAgro FinancePro
 *
 * Este arquivo define todas as rotas relacionadas ao sistema unificado de aprovação,
 * incluindo validações, middleware de autenticação e autorização.
 *
 * @author António Emiliano Barros
 * @version 1.0.0
 */

const express = require('express');
const router = express.Router();
const aprovacaoController = require('../controllers/aprovacao.controller');
const { protect } = require('../middleware/auth.middleware');
const { body, param, query } = require('express-validator');
const { validateRequest } = require('../middleware/validateRequest');

// Aplicar middleware de autenticação em todas as rotas
router.use(protect);

/**
 * @swagger
 * tags:
 *   name: Aprovação
 *   description: Sistema unificado de aprovação de itens
 */

/**
 * @swagger
 * /api/aprovacao/pendentes:
 *   get:
 *     summary: Lista todos os itens pendentes de aprovação
 *     tags: [Aprovação]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: tipo
 *         schema:
 *           type: string
 *           enum: [orcamento, tesouraria, execucao]
 *         description: Filtrar por tipo de item
 *       - in: query
 *         name: departamento
 *         schema:
 *           type: string
 *         description: Filtrar por departamento
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
 *         description: Lista de itens pendentes retornada com sucesso
 *       401:
 *         description: Não autorizado
 *       500:
 *         description: Erro interno do servidor
 */
router.get(
  '/pendentes',
  [
    query('tipo').optional().isIn(['orcamento', 'tesouraria', 'execucao']),
    query('departamento').optional().isString().trim(),
    query('busca').optional().isString().trim(),
    query('pagina').optional().isInt({ min: 1 }).toInt(),
    query('limite').optional().isInt({ min: 1, max: 100 }).toInt(),
    query('ordenarPor').optional().isIn(['dataCriacao', 'tipo', 'prioridade', 'valor']),
    query('ordem').optional().isIn(['ASC', 'DESC'])
  ],
  validateRequest,
  aprovacaoController.listarItensPendentes
);

/**
 * @swagger
 * /api/aprovacao/{itemId}/aprovar:
 *   patch:
 *     summary: Aprova um item específico
 *     tags: [Aprovação]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: itemId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID do item
 *       - in: query
 *         name: tipo
 *         required: true
 *         schema:
 *           type: string
 *           enum: [orcamento, tesouraria, execucao]
 *         description: Tipo do item
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               observacoes:
 *                 type: string
 *                 description: Observações da aprovação
 *     responses:
 *       200:
 *         description: Item aprovado com sucesso
 *       400:
 *         description: Dados inválidos
 *       403:
 *         description: Sem permissão para aprovar
 *       404:
 *         description: Item não encontrado
 */
router.patch(
  '/:itemId/aprovar',
  [
    param('itemId').notEmpty().withMessage('ID do item é obrigatório'),
    query('tipo').isIn(['orcamento', 'tesouraria', 'execucao']).withMessage('Tipo inválido'),
    body('observacoes').optional().isString().trim()
  ],
  validateRequest,
  aprovacaoController.aprovarItem
);

/**
 * @swagger
 * /api/aprovacao/{itemId}/rejeitar:
 *   patch:
 *     summary: Rejeita um item específico
 *     tags: [Aprovação]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: itemId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID do item
 *       - in: query
 *         name: tipo
 *         required: true
 *         schema:
 *           type: string
 *           enum: [orcamento, tesouraria, execucao]
 *         description: Tipo do item
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
 *         description: Item rejeitado com sucesso
 *       400:
 *         description: Dados inválidos
 *       403:
 *         description: Sem permissão para rejeitar
 *       404:
 *         description: Item não encontrado
 */
router.patch(
  '/:itemId/rejeitar',
  [
    param('itemId').notEmpty().withMessage('ID do item é obrigatório'),
    query('tipo').isIn(['orcamento', 'tesouraria', 'execucao']).withMessage('Tipo inválido'),
    body('motivo').notEmpty().withMessage('Motivo da rejeição é obrigatório')
  ],
  validateRequest,
  aprovacaoController.rejeitarItem
);

/**
 * @swagger
 * /api/aprovacao/historico:
 *   get:
 *     summary: Obtém histórico de aprovações
 *     tags: [Aprovação]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: tipo
 *         schema:
 *           type: string
 *           enum: [orcamento, tesouraria, execucao]
 *         description: Filtrar por tipo
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [aprovado, rejeitado]
 *         description: Filtrar por status da decisão
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
 *         description: Histórico retornado com sucesso
 *       401:
 *         description: Não autorizado
 *       500:
 *         description: Erro interno do servidor
 */
router.get(
  '/historico',
  [
    query('tipo').optional().isIn(['orcamento', 'tesouraria', 'execucao']),
    query('status').optional().isIn(['aprovado', 'rejeitado']),
    query('dataInicio').optional().isISO8601(),
    query('dataFim').optional().isISO8601(),
    query('pagina').optional().isInt({ min: 1 }).toInt(),
    query('limite').optional().isInt({ min: 1, max: 100 }).toInt(),
    query('ordenarPor').optional().isIn(['dataDecisao', 'tipo', 'status']),
    query('ordem').optional().isIn(['ASC', 'DESC'])
  ],
  validateRequest,
  aprovacaoController.obterHistorico
);

/**
 * @swagger
 * /api/aprovacao/estatisticas:
 *   get:
 *     summary: Obtém estatísticas de aprovação
 *     tags: [Aprovação]
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
 *       401:
 *         description: Não autorizado
 */
router.get(
  '/estatisticas',
  [
    query('dataInicio').optional().isISO8601(),
    query('dataFim').optional().isISO8601()
  ],
  validateRequest,
  aprovacaoController.obterEstatisticas
);

/**
 * @swagger
 * /api/aprovacao/dashboard:
 *   get:
 *     summary: Obtém dados para dashboard de aprovação
 *     tags: [Aprovação]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dados do dashboard retornados com sucesso
 *       401:
 *         description: Não autorizado
 */
router.get('/dashboard', aprovacaoController.obterDashboard);

module.exports = router;