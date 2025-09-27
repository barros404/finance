/**
 * Rotas de Tesouraria - EndiAgro FinancePro
 * 
 * Este arquivo define todas as rotas relacionadas a tesouraria,
 * incluindo planos, entradas, saídas e financiamentos.
 * 
 * @author António Emiliano Barros
 * @version 1.0.0
 */

const express = require('express');
const router = express.Router();
const tesourariaController = require('../controllers/tesouraria.controller');
const { protect } = require('../middleware/auth.middleware');
const { body, param, query } = require('express-validator');
const { validateRequest } = require('../middleware/validateRequest');
const { verificarOrcamentoAprovado } = require('../middleware/verificarOrcamento');

// Aplicar middleware de autenticação em todas as rotas
router.use(protect);

/**
 * @swagger
 * tags:
 *   name: Tesouraria
 *   description: Gerenciamento de tesouraria e fluxo de caixa
 */

/**
 * @swagger
 * /api/tesouraria/planos:
 *   get:
 *     summary: Lista todos os planos de tesouraria
 *     tags: [Tesouraria]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: ano
 *         schema:
 *           type: integer
 *         description: Filtrar por ano
 *       - in: query
 *         name: mes
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 12
 *         description: Filtrar por mês
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [rascunho, pendente, aprovado, rejeitado, ativo, concluido]
 *         description: Filtrar por status
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
 *         description: Lista de planos retornada com sucesso
 *       401:
 *         description: Não autorizado
 *       500:
 *         description: Erro interno do servidor
 */
router
  .route('/planos')
  .get(
    [
      query('ano').optional(),
      query('mes').optional().isInt({ min: 1, max: 12 }).toInt(),
      query('status').optional().isIn(['rascunho', 'pendente', 'aprovado', 'rejeitado', 'ativo', 'concluido']),
      query('pagina').optional().isInt({ min: 1 }).toInt(),
      query('limite').optional().isInt({ min: 1, max: 100 }).toInt(),
      query('ordenarPor').optional().isIn(['ano', 'mes', 'status', 'criadoEm']),
      query('ordem').optional().isIn(['ASC', 'DESC'])
    ],
    validateRequest,
    verificarOrcamentoAprovado, // Novo middleware
    tesourariaController.listarPlanos
  )
  .post(
    [
      body('mes').isInt({ min: 1, max: 12 }).withMessage('Mês inválido (1-12)'),
      body('ano').isInt({ min: 2000, max: 2100 }).withMessage('Ano inválido'),
      body('saldoInicial').optional().isFloat({ min: 0 }).withMessage('Saldo inicial deve ser um número positivo'),
      body('orcamentoId').optional().isInt().withMessage('ID do orçamento deve ser um número inteiro'),
      body('observacoes').optional().isString().trim(),
      body('entradas').optional().isArray(),
      body('saidas').optional().isArray(),
      body('financiamentos').optional().isArray()
    ],
    validateRequest,
    verificarOrcamentoAprovado, // Novo middleware
    tesourariaController.criarPlano
  );

/**
 * @swagger
 * /api/tesouraria/novo-plano:
 *   post:
 *     summary: Cria um plano de tesouraria completo a partir do formulário
 *     tags: [Tesouraria]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               metadata:
 *                 type: object
 *                 properties:
 *                   month:
 *                     type: integer
 *                   year:
 *                     type: integer
 *                   company:
 *                     type: string
 *                   preparedBy:
 *                     type: string
 *                   approvedBy:
 *                     type: string
 *                   budgetReference:
 *                     type: string
 *                   budgetImportDate:
 *                     type: string
 *                     format: date
 *               initialBalance:
 *                 type: number
 *               inflows:
 *                 type: array
 *                 items:
 *                   type: object
 *               outflows:
 *                 type: array
 *                 items:
 *                   type: object
 *               financing:
 *                 type: object
 *     responses:
 *       201:
 *         description: Plano de tesouraria criado com sucesso
 *       400:
 *         description: Dados inválidos
 *       401:
 *         description: Não autorizado
 */
router.post(
    '/planos/completo',
  [
    body('nome').isString().notEmpty(),
    body('ano').isInt({ min: 2000, max: 2100 }),
    body('mes').isInt({ min: 1, max: 12 }),
    body('orcamentoId').isInt(),
    body('metadata').isObject().withMessage('Metadados são obrigatórios'),
    body('metadata.month').isInt({ min: 1, max: 12 }).withMessage('Mês inválido'),
    body('metadata.year').isInt({ min: 2000, max: 2100 }).withMessage('Ano inválido'),
    body('metadata.company').optional().isString().trim(),
    body('metadata.preparedBy').optional().isString().trim(),
    body('metadata.approvedBy').optional().isString().trim(),
    body('metadata.budgetReference').optional().isString().trim(),
    body('metadata.budgetImportDate').optional().isISO8601(),
    body('initialBalance').optional().isFloat({ min: 0 }),
    body('inflows').optional().isArray(),
    body('outflows').optional().isArray(),
    body('financing').optional().isObject()
  ],
  validateRequest,
  tesourariaController.criarPlanoCompleto
);

/**
 * @swagger
 * /api/tesouraria/fluxo-caixa:
 *   get:
 *     summary: Obtém o fluxo de caixa
 *     tags: [Tesouraria]
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
 *       - in: query
 *         name: planoId
 *         schema:
 *           type: integer
 *         description: ID do plano específico
 *       - in: query
 *         name: tipo
 *         schema:
 *           type: string
 *           enum: [mensal, trimestral, anual]
 *         description: Tipo de agrupamento
 *     responses:
 *       200:
 *         description: Fluxo de caixa retornado com sucesso
 */
router.get(
  '/fluxo-caixa',
  [
    
    query('planoId').optional().isInt(),
    query('tipo').optional().isIn(['mensal', 'trimestral', 'anual'])
  ],
  validateRequest,
  tesourariaController.obterFluxoCaixa
);

/**
 * @swagger
 * /api/tesouraria/planos/{id}:
 *   get:
 *     summary: Obtém um plano de tesouraria específico
 *     tags: [Tesouraria]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID do plano
 *     responses:
 *       200:
 *         description: Plano retornado com sucesso
 *       404:
 *         description: Plano não encontrado
 */
router
  .route('/planos/:id')
  .get(
    [
      param('id').isInt().withMessage('ID do plano inválido')
    ],
    validateRequest,
    tesourariaController.obterPlano
  )
  .put(
    [
      param('id').isInt().withMessage('ID do plano inválido'),
      body('mes').optional().isInt({ min: 1, max: 12 }).withMessage('Mês inválido (1-12)'),
      body('ano').optional().isInt({ min: 2000, max: 2100 }).withMessage('Ano inválido'),
      body('saldoInicial').optional().isFloat({ min: 0 }).withMessage('Saldo inicial deve ser um número positivo'),
      body('orcamentoId').optional().isInt().withMessage('ID do orçamento deve ser um número inteiro'),
      body('observacoes').optional().isString().trim(),
      body('status').optional().isIn(['rascunho', 'pendente', 'aprovado', 'rejeitado', 'ativo', 'concluido'])
    ],
    validateRequest,
    tesourariaController.atualizarPlano
  )
  .delete(
    [
      param('id').isInt().withMessage('ID do plano inválido')
    ],
    validateRequest,
    tesourariaController.excluirPlano
  );

/**
 * @swagger
 * /api/tesouraria/planos/{id}/aprovar:
 *   patch:
 *     summary: Aprova um plano de tesouraria
 *     tags: [Tesouraria]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID do plano
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
 *         description: Plano aprovado com sucesso
 *       404:
 *         description: Plano não encontrado
 */
router.patch(
  '/planos/:id/aprovar',
  [
    param('id').isInt().withMessage('ID do plano inválido'),
    body('observacoes').optional().isString().trim()
  ],
  validateRequest,
  tesourariaController.aprovarPlano
);

/**
 * @swagger
 * /api/tesouraria/planos/{id}/rejeitar:
 *   patch:
 *     summary: Rejeita um plano de tesouraria
 *     tags: [Tesouraria]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID do plano
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
 *         description: Plano rejeitado
 *       404:
 *         description: Plano não encontrado
 */
router.patch(
  '/planos/:id/rejeitar',
  [
    param('id').isInt().withMessage('ID do plano inválido'),
    body('motivo').notEmpty().withMessage('Motivo da rejeição é obrigatório')
  ],
  validateRequest,
  tesourariaController.rejeitarPlano
);

/**
 * @swagger
 * /api/tesouraria/planos/{id}/importar-orcamento:
 *   post:
 *     summary: Importa dados de um orçamento para o plano de tesouraria
 *     tags: [Tesouraria]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID do plano
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               orcamentoId:
 *                 type: integer
 *               mesReferencia:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 12
 *     responses:
 *       200:
 *         description: Dados importados com sucesso
 *       404:
 *         description: Plano ou orçamento não encontrado
 */
router.post(
  '/planos/:id/importar-orcamento',
  [
    param('id').isInt().withMessage('ID do plano inválido'),
    body('orcamentoId').isInt().withMessage('ID do orçamento é obrigatório'),
    body('mesReferencia').optional().isInt({ min: 1, max: 12 }).withMessage('Mês de referência inválido')
  ],
  validateRequest,
  tesourariaController.importarDoOrcamento
);

/**
 * @swagger
 * /api/tesouraria/planos-por-orcamento:
 *   get:
 *     summary: Lista planos de tesouraria por orçamento específico
 *     tags: [Tesouraria]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: orcamentoId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID do orçamento
 *       - in: query
 *         name: pagina
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Número da página
 *       - in: query
 *         name: limite
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 10
 *         description: Itens por página
 *       - in: query
 *         name: ordenacao
 *         schema:
 *           type: string
 *           enum: [createdAt, mes, ano, status]
 *           default: createdAt
 *         description: Campo para ordenação
 *     responses:
 *       200:
 *         description: Lista de planos retornada com sucesso
 *       400:
 *         description: ID do orçamento obrigatório
 *       401:
 *         description: Não autorizado
 *       500:
 *         description: Erro interno do servidor
 */
router.get(
  '/planos-por-orcamento',
  [
    query('orcamentoId').isInt().withMessage('ID do orçamento é obrigatório'),
    query('pagina').optional().isInt({ min: 1 }).toInt(),
    query('limite').optional().isInt({ min: 1, max: 100 }).toInt(),
    query('ordenacao').optional().isIn(['createdAt', 'mes', 'ano', 'status'])
  ],
  validateRequest,
  tesourariaController.listarPlanosPorOrcamento
);

/**
 * @swagger
 * /api/tesouraria/estatisticas:
 *   get:
 *     summary: Obtém estatísticas de tesouraria
 *     tags: [Tesouraria]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Estatísticas retornadas com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "success"
 *                 data:
 *                   type: object
 *                   properties:
 *                     total:
 *                       type: integer
 *                       example: 10
 *                     saldoAtual:
 *                       type: number
 *                       example: 200000
 *                     recebimentosPrevistos:
 *                       type: number
 *                       example: 500000
 *                     pagamentosPrevistos:
 *                       type: number
 *                       example: 400000
 *                     saldoProjetado:
 *                       type: number
 *                       example: 300000
 *       401:
 *         description: Não autorizado
 *       500:
 *         description: Erro interno do servidor
 */
router.get(
  '/estatisticas',
  tesourariaController.obterEstatisticas
);

/**
 * @swagger
 * /api/tesouraria/atividades-recentes:
 *   get:
 *     summary: Obtém atividades recentes relacionadas à execução orçamental
 *     tags: [Tesouraria]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: limite
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 50
 *           default: 10
 *         description: Número máximo de atividades a retornar
 *     responses:
 *       200:
 *         description: Atividades recentes retornadas com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     atividades:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                             example: "plano_123"
 *                           tipo:
 *                             type: string
 *                             example: "plano_criado"
 *                           titulo:
 *                             type: string
 *                             example: "Novo plano de tesouraria criado"
 *                           descricao:
 *                             type: string
 *                             example: "Plano Mensal Janeiro - Orçamento 2024"
 *                           timestamp:
 *                             type: string
 *                             format: date-time
 *                           status:
 *                             type: string
 *                             example: "sucesso"
 *                           usuario:
 *                             type: string
 *                             example: "João Silva"
 *                           entidade:
 *                             type: string
 *                             example: "plano_tesouraria"
 *                           entidadeId:
 *                             type: integer
 *                             example: 123
 *                           dadosAdicionais:
 *                             type: object
 *                             properties:
 *                               orcamentoNome:
 *                                 type: string
 *                               orcamentoAno:
 *                                 type: integer
 *                     total:
 *                       type: integer
 *                       example: 5
 *       401:
 *         description: Não autorizado
 *       500:
 *         description: Erro interno do servidor
 */
router.get(
  '/atividades-recentes',
  [
    query('limite').optional().isInt({ min: 1, max: 50 }).toInt()
  ],
  validateRequest,
  tesourariaController.obterAtividadesRecentes
);

module.exports = router;