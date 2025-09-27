/**
 * Rotas de PGC - EndiAgro FinancePro
 *
 * Este arquivo define todas as rotas relacionadas ao Plano Geral de Contas (PGC),
 * incluindo validação de contas e classificação PGC-AO.
 *
 * @author António Emiliano Barros
 * @version 1.0.0
 */

const express = require('express');
const router = express.Router();
const pgcController = require('../controllers/pgc.controller');
const { protect } = require('../middleware/auth.middleware');
const { body, param, query } = require('express-validator');
const { validateRequest } = require('../middleware/validateRequest');

// Aplicar middleware de autenticação em todas as rotas
router.use(protect);

/**
 * @swagger
 * tags:
 *   name: PGC
 *   description: Gerenciamento do Plano Geral de Contas (PGC) e validação de contas
 */

/**
 * @swagger
 * /api/pgc/contas:
 *   get:
 *     summary: Lista contas PGC para validação
 *     tags: [PGC]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: classe
 *         schema:
 *           type: string
 *         description: Filtrar por classe (1, 2, 3, etc.)
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pendente, validada, erro, revisao]
 *         description: Filtrar por status de validação
 *       - in: query
 *         name: busca
 *         schema:
 *           type: string
 *         description: Buscar por código ou descrição
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
 *         description: Lista de contas PGC retornada com sucesso
 *       401:
 *         description: Não autorizado
 *       500:
 *         description: Erro interno do servidor
 */
router
  .route('/contas')
  .get(
    [
      query('classe').optional().isString(),
      query('status').optional().isIn(['pendente', 'validada', 'erro', 'revisao']),
      query('busca').optional().isString().trim(),
      query('pagina').optional().isInt({ min: 1 }).toInt(),
      query('limite').optional().isInt({ min: 1, max: 100 }).toInt(),
      query('ordenarPor').optional().isIn(['codigo', 'descricao', 'classe', 'status', 'createdAt']),
      query('ordem').optional().isIn(['ASC', 'DESC'])
    ],
    validateRequest,
    pgcController.listarContasPGC
  )
  .post(
    [
      body('codigo').trim().notEmpty().withMessage('Código da conta é obrigatório'),
      body('descricao').trim().notEmpty().withMessage('Descrição da conta é obrigatória'),
      body('classe').isInt({ min: 1, max: 8 }).withMessage('Classe deve ser entre 1 e 8'),
      body('tipo').optional().isIn(['debito', 'credito']).withMessage('Tipo deve ser débito ou crédito'),
      body('categoria').optional().isString().trim(),
      body('subcategoria').optional().isString().trim(),
      body('observacoes').optional().isString().trim()
    ],
    validateRequest,
    pgcController.criarContaPGC
  );

/**
 * @swagger
 * /api/pgc/contas/validar:
 *   post:
 *     summary: Valida múltiplas contas PGC
 *     tags: [PGC]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               contas:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                     status:
 *                       type: string
 *                       enum: [validada, erro]
 *                     observacoes:
 *                       type: string
 *     responses:
 *       200:
 *         description: Contas validadas com sucesso
 *       400:
 *         description: Dados inválidos
 *       401:
 *         description: Não autorizado
 */
router.post(
  '/contas/validar',
  [
    body('contas').isArray().withMessage('Contas devem ser um array'),
    body('contas.*.id').isInt().withMessage('ID da conta deve ser um número inteiro'),
    body('contas.*.status').isIn(['validada', 'erro']).withMessage('Status deve ser validada ou erro'),
    body('contas.*.observacoes').optional().isString().trim()
  ],
  validateRequest,
  pgcController.validarContasPGC
);

/**
 * @swagger
 * /api/pgc/contas/{id}:
 *   get:
 *     summary: Obtém uma conta PGC específica
 *     tags: [PGC]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID da conta PGC
 *     responses:
 *       200:
 *         description: Conta PGC retornada com sucesso
 *       404:
 *         description: Conta não encontrada
 *       401:
 *         description: Não autorizado
 */
router
  .route('/contas/:id')
  .get(
    [
      param('id').isInt().withMessage('ID da conta inválido')
    ],
    validateRequest,
    pgcController.obterContaPGC
  )
  .patch(
    [
      param('id').isInt().withMessage('ID da conta inválido'),
      body('codigo').optional().trim().notEmpty(),
      body('descricao').optional().trim(),
      body('classe').optional().isInt({ min: 1, max: 8 }),
      body('tipo').optional().isIn(['debito', 'credito']),
      body('categoria').optional().isString().trim(),
      body('subcategoria').optional().isString().trim(),
      body('status').optional().isIn(['pendente', 'validada', 'erro', 'revisao']),
      body('observacoes').optional().isString().trim()
    ],
    validateRequest,
    pgcController.atualizarContaPGC
  )
  .delete(
    [
      param('id').isInt().withMessage('ID da conta inválido')
    ],
    validateRequest,
    pgcController.excluirContaPGC
  );

/**
 * @swagger
 * /api/pgc/contas/{id}/validar:
 *   patch:
 *     summary: Valida uma conta PGC específica
 *     tags: [PGC]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID da conta PGC
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [validada, erro]
 *               observacoes:
 *                 type: string
 *     responses:
 *       200:
 *         description: Conta validada com sucesso
 *       400:
 *         description: Dados inválidos
 *       404:
 *         description: Conta não encontrada
 */
router.patch(
  '/contas/:id/validar',
  [
    param('id').isInt().withMessage('ID da conta inválido'),
    body('status').isIn(['validada', 'erro']).withMessage('Status deve ser validada ou erro'),
    body('observacoes').optional().isString().trim()
  ],
  validateRequest,
  pgcController.validarContaPGC
);

/**
 * @swagger
 * /api/pgc/contas/{id}/rejeitar:
 *   patch:
 *     summary: Rejeita uma conta PGC específica
 *     tags: [PGC]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID da conta PGC
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
 *         description: Conta rejeitada com sucesso
 *       400:
 *         description: Dados inválidos
 *       404:
 *         description: Conta não encontrada
 */
router.patch(
  '/contas/:id/rejeitar',
  [
    param('id').isInt().withMessage('ID da conta inválido'),
    body('motivo').notEmpty().withMessage('Motivo da rejeição é obrigatório')
  ],
  validateRequest,
  pgcController.rejeitarContaPGC
);

/**
 * @swagger
 * /api/pgc/classificacao:
 *   post:
 *     summary: Classifica documento usando PGC-AO
 *     tags: [PGC]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               documentoId:
 *                 type: string
 *                 description: ID do documento processado
 *               dadosExtraidos:
 *                 type: object
 *                 description: Dados extraídos do OCR
 *               regrasClassificacao:
 *                 type: object
 *                 description: Regras para classificação automática
 *     responses:
 *       200:
 *         description: Documento classificado com sucesso
 *       400:
 *         description: Dados inválidos
 *       401:
 *         description: Não autorizado
 */
router.post(
  '/classificacao',
  [
    body('documentoId').notEmpty().withMessage('ID do documento é obrigatório'),
    body('dadosExtraidos').optional().isObject(),
    body('regrasClassificacao').optional().isObject()
  ],
  validateRequest,
  pgcController.classificarDocumento
);

/**
 * @swagger
 * /api/pgc/mapeamento:
 *   get:
 *     summary: Lista mapeamentos PGC
 *     tags: [PGC]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: tipoDocumento
 *         schema:
 *           type: string
 *         description: Filtrar por tipo de documento
 *       - in: query
 *         name: contaPGC
 *         schema:
 *           type: string
 *         description: Filtrar por conta PGC
 *     responses:
 *       200:
 *         description: Mapeamentos retornados com sucesso
 *       401:
 *         description: Não autorizado
 */
router.get(
  '/mapeamento',
  [
    query('tipoDocumento').optional().isString().trim(),
    query('contaPGC').optional().isString().trim()
  ],
  validateRequest,
  pgcController.listarMapeamentosPGC
);

/**
 * @swagger
 * /api/pgc/estatisticas:
 *   get:
 *     summary: Obtém estatísticas de validação PGC
 *     tags: [PGC]
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
  pgcController.obterEstatisticas
);

module.exports = router;