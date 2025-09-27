/**
 * Rotas de Relatórios - EndiAgro FinancePro
 *
 * Este arquivo define todas as rotas relacionadas a relatórios executivos,
 * incluindo validações, middleware de autenticação e documentação.
 *
 * @author António Emiliano Barros
 * @version 1.0.0
 */

const express = require('express');
const router = express.Router();
const relatoriosController = require('../controllers/relatorios.controller');
const { protect } = require('../middleware/auth.middleware');
const { body, param, query } = require('express-validator');
const { validateRequest } = require('../middleware/validateRequest');

// Aplicar middleware de autenticação em todas as rotas
router.use(protect);

/**
 * @swagger
 * tags:
 *   name: Relatórios
 *   description: Gerenciamento de relatórios executivos e consolidados
 */

/**
 * @swagger
 * /api/relatorios:
 *   get:
 *     summary: Lista todos os relatórios
 *     tags: [Relatórios]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: tipo
 *         schema:
 *           type: string
 *           enum: [orcamento, tesouraria, execucao, consolidado]
 *         description: Filtrar por tipo de relatório
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [rascunho, gerado, enviado, arquivado]
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
 *         description: Lista de relatórios retornada com sucesso
 *       401:
 *         description: Não autorizado
 *       500:
 *         description: Erro interno do servidor
 */
router
  .route('/')
  .get(
    [
      query('tipo').optional().isIn(['orcamento', 'tesouraria', 'execucao', 'consolidado']),
      query('status').optional().isIn(['rascunho', 'gerado', 'enviado', 'arquivado']),
      query('dataInicio').optional().isISO8601(),
      query('dataFim').optional().isISO8601(),
      query('pagina').optional().isInt({ min: 1 }).toInt(),
      query('limite').optional().isInt({ min: 1, max: 100 }).toInt(),
      query('ordenarPor').optional().isIn(['titulo', 'tipo', 'status', 'dataGeracao', 'criadoEm']),
      query('ordem').optional().isIn(['ASC', 'DESC'])
    ],
    validateRequest,
    relatoriosController.listarRelatorios
  )
  .post(
    [
      body('titulo').trim().notEmpty().withMessage('Título do relatório é obrigatório'),
      body('tipo').isIn(['orcamento', 'tesouraria', 'execucao', 'consolidado']).withMessage('Tipo de relatório inválido'),
      body('descricao').optional().isString().trim(),
      body('parametros').optional().isObject(),
      body('filtros').optional().isObject(),
      body('formato').optional().isIn(['pdf', 'excel', 'csv']).withMessage('Formato inválido'),
      body('destinatarios').optional().isArray(),
      body('observacoes').optional().isString().trim()
    ],
    validateRequest,
    relatoriosController.criarRelatorio
  );

/**
 * @swagger
 * /api/relatorios/gerar/{tipo}:
 *   post:
 *     summary: Gera um relatório automático
 *     tags: [Relatórios]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: tipo
 *         required: true
 *         schema:
 *           type: string
 *           enum: [orcamento, tesouraria, execucao, consolidado]
 *         description: Tipo do relatório a gerar
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               periodo:
 *                 type: object
 *                 properties:
 *                   inicio:
 *                     type: string
 *                     format: date
 *                   fim:
 *                     type: string
 *                     format: date
 *               filtros:
 *                 type: object
 *               formato:
 *                 type: string
 *                 enum: [pdf, excel, csv]
 *     responses:
 *       201:
 *         description: Relatório gerado com sucesso
 *       400:
 *         description: Dados inválidos
 *       401:
 *         description: Não autorizado
 */
router.post(
  '/gerar/:tipo',
  [
    param('tipo').isIn(['orcamento', 'tesouraria', 'execucao', 'consolidado']).withMessage('Tipo de relatório inválido'),
    body('periodo').optional().isObject(),
    body('periodo.inicio').optional().isISO8601(),
    body('periodo.fim').optional().isISO8601(),
    body('filtros').optional().isObject(),
    body('formato').optional().isIn(['pdf', 'excel', 'csv'])
  ],
  validateRequest,
  relatoriosController.gerarRelatorioAutomatico
);

/**
 * @swagger
 * /api/relatorios/estatisticas:
 *   get:
 *     summary: Obtém estatísticas dos relatórios
 *     tags: [Relatórios]
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
  relatoriosController.obterEstatisticas
);

/**
 * @swagger
 * /api/relatorios/{id}:
 *   get:
 *     summary: Obtém um relatório específico
 *     tags: [Relatórios]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID do relatório
 *     responses:
 *       200:
 *         description: Relatório retornado com sucesso
 *       404:
 *         description: Relatório não encontrado
 *       401:
 *         description: Não autorizado
 */
router
  .route('/:id')
  .get(
    [
      param('id').isInt().withMessage('ID do relatório inválido')
    ],
    validateRequest,
    relatoriosController.obterRelatorio
  )
  .patch(
    [
      param('id').isInt().withMessage('ID do relatório inválido'),
      body('titulo').optional().trim().notEmpty(),
      body('descricao').optional().isString().trim(),
      body('status').optional().isIn(['rascunho', 'gerado', 'enviado', 'arquivado']),
      body('observacoes').optional().isString().trim()
    ],
    validateRequest,
    relatoriosController.atualizarRelatorio
  )
  .delete(
    [
      param('id').isInt().withMessage('ID do relatório inválido')
    ],
    validateRequest,
    relatoriosController.excluirRelatorio
  );

/**
 * @swagger
 * /api/relatorios/{id}/download:
 *   get:
 *     summary: Download do relatório
 *     tags: [Relatórios]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID do relatório
 *     responses:
 *       200:
 *         description: Download iniciado
 *       404:
 *         description: Relatório não encontrado
 *       401:
 *         description: Não autorizado
 */
router.get(
  '/:id/download',
  [
    param('id').isInt().withMessage('ID do relatório inválido')
  ],
  validateRequest,
  relatoriosController.downloadRelatorio
);

/**
 * @swagger
 * /api/relatorios/{id}/enviar:
 *   post:
 *     summary: Envia relatório por email
 *     tags: [Relatórios]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID do relatório
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               destinatarios:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: email
 *               assunto:
 *                 type: string
 *               mensagem:
 *                 type: string
 *     responses:
 *       200:
 *         description: Relatório enviado com sucesso
 *       404:
 *         description: Relatório não encontrado
 *       400:
 *         description: Dados inválidos
 */
router.post(
  '/:id/enviar',
  [
    param('id').isInt().withMessage('ID do relatório inválido'),
    body('destinatarios').isArray().withMessage('Destinatários devem ser um array'),
    body('destinatarios.*').isEmail().withMessage('Email inválido'),
    body('assunto').trim().notEmpty().withMessage('Assunto é obrigatório'),
    body('mensagem').optional().isString().trim()
  ],
  validateRequest,
  relatoriosController.enviarRelatorio
);

module.exports = router;