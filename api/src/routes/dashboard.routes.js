/**
 * Rotas do Dashboard - EndiAgro FinancePro
 * 
 * Este arquivo define todas as rotas relacionadas ao dashboard,
 * incluindo estatísticas e atividades recentes.
 * 
 * @author António Emiliano Barros
 * @version 1.0.0
 */

const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboard.controller');
const { protect } = require('../middleware/auth.middleware');
const { query } = require('express-validator');
const { validateRequest } = require('../middleware/validateRequest');

// Aplicar middleware de autenticação em todas as rotas
router.use(protect);

/**
 * @swagger
 * tags:
 *   name: Dashboard
 *   description: Estatísticas e dados do dashboard
 */

/**
 * @swagger
 * /api/dashboard/estatisticas:
 *   get:
 *     summary: Obtém estatísticas do dashboard
 *     tags: [Dashboard]
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
 *                     orcamentosPendentes:
 *                       type: integer
 *                       example: 5
 *                     planosPendentes:
 *                       type: integer
 *                       example: 3
 *                     contasPendentes:
 *                       type: integer
 *                       example: 12
 *                     totalAprovacoes:
 *                       type: integer
 *                       example: 25
 *                     atividadesRecentes:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: integer
 *                           tipo:
 *                             type: string
 *                           titulo:
 *                             type: string
 *                           descricao:
 *                             type: string
 *                           data:
 *                             type: string
 *                             format: date-time
 *                           status:
 *                             type: string
 *                           usuario:
 *                             type: string
 *       401:
 *         description: Não autorizado
 *       500:
 *         description: Erro interno do servidor
 */
router.get(
  '/estatisticas',
  dashboardController.obterEstatisticas
);

/**
 * @swagger
 * /api/dashboard/atividades-recentes:
 *   get:
 *     summary: Obtém atividades recentes do sistema
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: limite
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 50
 *           default: 5
 *         description: Número máximo de atividades a retornar
 *     responses:
 *       200:
 *         description: Atividades recentes retornadas com sucesso
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
  dashboardController.obterAtividadesRecentes
);

module.exports = router;
