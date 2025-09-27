/**
 * Rotas de Riscos - EndiAgro FinancePro
 *
 * Este arquivo define todas as rotas relacionadas à análise de riscos e contingências,
 * incluindo validações, middleware de autenticação e documentação.
 *
 * @author António Emiliano Barros
 * @version 1.0.0
 */

const express = require('express');
const router = express.Router();
const riscosController = require('../controllers/riscos.controller');
const { protect } = require('../middleware/auth.middleware');
const { body, param, query } = require('express-validator');
const { validateRequest } = require('../middleware/validateRequest');

// Aplicar middleware de autenticação em todas as rotas
router.use(protect);

/**
 * @swagger
 * tags:
 *   name: Riscos
 *   description: Gerenciamento de análise de riscos e contingências
 */

/**
 * @swagger
 * /api/riscos:
 *   get:
 *     summary: Lista todos os riscos
 *     tags: [Riscos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: tipo
 *         schema:
 *           type: string
 *           enum: [operacional, financeiro, mercado, regulatorio, estrategico]
 *         description: Filtrar por tipo de risco
 *       - in: query
 *         name: severidade
 *         schema:
 *           type: string
 *           enum: [baixa, media, alta, critica]
 *         description: Filtrar por severidade
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [identificado, avaliado, mitigado, monitorado, fechado]
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
 *         description: Lista de riscos retornada com sucesso
 *       401:
 *         description: Não autorizado
 *       500:
 *         description: Erro interno do servidor
 */
router
  .route('/')
  .get(
    [
      query('tipo').optional().isIn(['operacional', 'financeiro', 'mercado', 'regulatorio', 'estrategico']),
      query('severidade').optional().isIn(['baixa', 'media', 'alta', 'critica']),
      query('status').optional().isIn(['identificado', 'avaliado', 'mitigado', 'monitorado', 'fechado']),
      query('dataInicio').optional().isISO8601(),
      query('dataFim').optional().isISO8601(),
      query('pagina').optional().isInt({ min: 1 }).toInt(),
      query('limite').optional().isInt({ min: 1, max: 100 }).toInt(),
      query('ordenarPor').optional().isIn(['titulo', 'tipo', 'severidade', 'probabilidade', 'impacto', 'status', 'criadoEm']),
      query('ordem').optional().isIn(['ASC', 'DESC'])
    ],
    validateRequest,
    riscosController.listarRiscos
  )
  .post(
    [
      body('titulo').trim().notEmpty().withMessage('Título do risco é obrigatório'),
      body('descricao').trim().notEmpty().withMessage('Descrição do risco é obrigatória'),
      body('tipo').isIn(['operacional', 'financeiro', 'mercado', 'regulatorio', 'estrategico']).withMessage('Tipo de risco inválido'),
      body('severidade').isIn(['baixa', 'media', 'alta', 'critica']).withMessage('Severidade inválida'),
      body('probabilidade').isInt({ min: 1, max: 5 }).withMessage('Probabilidade deve ser entre 1 e 5'),
      body('impacto').isInt({ min: 1, max: 5 }).withMessage('Impacto deve ser entre 1 e 5'),
      body('categoria').optional().isString().trim(),
      body('fonte').optional().isString().trim(),
      body('dataIdentificacao').optional().isISO8601(),
      body('responsavel').optional().isString().trim(),
      body('observacoes').optional().isString().trim()
    ],
    validateRequest,
    riscosController.criarRisco
  );

/**
 * @swagger
 * /api/riscos/analise:
 *   post:
 *     summary: Realiza análise de riscos automática
 *     tags: [Riscos]
 *     security:
 *       - bearerAuth: []
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
 *               modulos:
 *                 type: array
 *                 items:
 *                   type: string
 *                   enum: [orcamento, tesouraria, execucao]
 *               criterios:
 *                 type: object
 *     responses:
 *       200:
 *         description: Análise realizada com sucesso
 *       400:
 *         description: Dados inválidos
 *       401:
 *         description: Não autorizado
 */
router.post(
  '/analise',
  [
    body('periodo').optional().isObject(),
    body('periodo.inicio').optional().isISO8601(),
    body('periodo.fim').optional().isISO8601(),
    body('modulos').optional().isArray(),
    body('modulos.*').optional().isIn(['orcamento', 'tesouraria', 'execucao']),
    body('criterios').optional().isObject()
  ],
  validateRequest,
  riscosController.realizarAnalise
);

/**
 * @swagger
 * /api/riscos/estatisticas:
 *   get:
 *     summary: Obtém estatísticas dos riscos
 *     tags: [Riscos]
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
  riscosController.obterEstatisticas
);

/**
 * @swagger
 * /api/riscos/{id}:
 *   get:
 *     summary: Obtém um risco específico
 *     tags: [Riscos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID do risco
 *     responses:
 *       200:
 *         description: Risco retornado com sucesso
 *       404:
 *         description: Risco não encontrado
 *       401:
 *         description: Não autorizado
 */
router
  .route('/:id')
  .get(
    [
      param('id').isInt().withMessage('ID do risco inválido')
    ],
    validateRequest,
    riscosController.obterRisco
  )
  .patch(
    [
      param('id').isInt().withMessage('ID do risco inválido'),
      body('titulo').optional().trim().notEmpty(),
      body('descricao').optional().trim(),
      body('tipo').optional().isIn(['operacional', 'financeiro', 'mercado', 'regulatorio', 'estrategico']),
      body('severidade').optional().isIn(['baixa', 'media', 'alta', 'critica']),
      body('probabilidade').optional().isInt({ min: 1, max: 5 }),
      body('impacto').optional().isInt({ min: 1, max: 5 }),
      body('status').optional().isIn(['identificado', 'avaliado', 'mitigado', 'monitorado', 'fechado']),
      body('categoria').optional().isString().trim(),
      body('fonte').optional().isString().trim(),
      body('responsavel').optional().isString().trim(),
      body('observacoes').optional().isString().trim()
    ],
    validateRequest,
    riscosController.atualizarRisco
  )
  .delete(
    [
      param('id').isInt().withMessage('ID do risco inválido')
    ],
    validateRequest,
    riscosController.excluirRisco
  );

/**
 * @swagger
 * /api/riscos/{id}/mitigacao:
 *   post:
 *     summary: Adiciona plano de mitigação ao risco
 *     tags: [Riscos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID do risco
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               planoMitigacao:
 *                 type: string
 *                 description: Plano de mitigação
 *               responsavel:
 *                 type: string
 *                 description: Responsável pela mitigação
 *               prazo:
 *                 type: string
 *                 format: date
 *                 description: Prazo para implementação
 *               custoEstimado:
 *                 type: number
 *                 description: Custo estimado da mitigação
 *     responses:
 *       200:
 *         description: Plano de mitigação adicionado com sucesso
 *       404:
 *         description: Risco não encontrado
 *       400:
 *         description: Dados inválidos
 */
router.post(
  '/:id/mitigacao',
  [
    param('id').isInt().withMessage('ID do risco inválido'),
    body('planoMitigacao').trim().notEmpty().withMessage('Plano de mitigação é obrigatório'),
    body('responsavel').optional().isString().trim(),
    body('prazo').optional().isISO8601(),
    body('custoEstimado').optional().isFloat({ min: 0 })
  ],
  validateRequest,
  riscosController.adicionarMitigacao
);

/**
 * @swagger
 * /api/riscos/{id}/monitoramento:
 *   post:
 *     summary: Adiciona registro de monitoramento ao risco
 *     tags: [Riscos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID do risco
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               observacao:
 *                 type: string
 *                 description: Observação do monitoramento
 *               statusAtual:
 *                 type: string
 *                 enum: [identificado, avaliado, mitigado, monitorado, fechado]
 *                 description: Status atual do risco
 *               proximaRevisao:
 *                 type: string
 *                 format: date
 *                 description: Data da próxima revisão
 *     responses:
 *       200:
 *         description: Monitoramento registrado com sucesso
 *       404:
 *         description: Risco não encontrado
 *       400:
 *         description: Dados inválidos
 */
router.post(
  '/:id/monitoramento',
  [
    param('id').isInt().withMessage('ID do risco inválido'),
    body('observacao').trim().notEmpty().withMessage('Observação é obrigatória'),
    body('statusAtual').optional().isIn(['identificado', 'avaliado', 'mitigado', 'monitorado', 'fechado']),
    body('proximaRevisao').optional().isISO8601()
  ],
  validateRequest,
  riscosController.adicionarMonitoramento
);

module.exports = router;