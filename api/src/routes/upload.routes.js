/**
 * Rotas de Upload - EndiAgro FinancePro
 * 
 * Este arquivo define todas as rotas relacionadas ao upload
 * e processamento de documentos.
 * 
 * @author Antonio Emiliano Barros
 * @version 1.0.0
 */

const express = require('express');
const router = express.Router();
const uploadController = require('../controllers/upload.controller');
const { protect } = require('../middleware/auth.middleware');
const { body, param, query } = require('express-validator');
const { validateRequest } = require('../middleware/validateRequest');

// Aplicar middleware de autenticação em todas as rotas
router.use(protect);

/**
 * @swagger
 * tags:
 *   name: Upload
 *   description: Gerenciamento de upload e processamento de documentos
 */

/**
 * @swagger
 * /api/upload/documento:
 *   post:
 *     summary: Upload de arquivo único
 *     tags: [Upload]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *                 description: Arquivo para upload (PDF, JPG, JPEG, PNG, TIFF)
 *     responses:
 *       201:
 *         description: Arquivo enviado com sucesso
 *       400:
 *         description: Erro no upload
 *       401:
 *         description: Não autorizado
 *       500:
 *         description: Erro interno do servidor
 */
router.post('/documento', uploadController.uploadFile);

/**
 * @swagger
 * /api/upload/lote:
 *   post:
 *     summary: Upload de múltiplos arquivos
 *     tags: [Upload]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               files:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *                 description: Arquivos para upload (máximo 10)
 *     responses:
 *       201:
 *         description: Arquivos enviados com sucesso
 *       400:
 *         description: Erro no upload
 *       401:
 *         description: Não autorizado
 */
router.post('/lote', uploadController.uploadBatch);

/**
 * @swagger
 * /api/upload/processar/{id}:
 *   post:
 *     summary: Processar arquivo
 *     tags: [Upload]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID do arquivo
 *     responses:
 *       200:
 *         description: Arquivo processado com sucesso
 *       404:
 *         description: Arquivo não encontrado
 *       401:
 *         description: Não autorizado
 */
router.post(
  '/processar/:id',
  [
    param('id').notEmpty().withMessage('ID do arquivo é obrigatório')
  ],
  validateRequest,
  uploadController.processFile
);

/**
 * @swagger
 * /api/upload/processar-lote:
 *   post:
 *     summary: Processar múltiplos arquivos
 *     tags: [Upload]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               fileIds:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: IDs dos arquivos para processar
 *     responses:
 *       200:
 *         description: Arquivos processados com sucesso
 *       400:
 *         description: Erro no processamento
 *       401:
 *         description: Não autorizado
 */
router.post(
  '/processar-lote',
  [
    body('fileIds').isArray().withMessage('IDs dos arquivos devem ser um array'),
    body('fileIds.*').isString().withMessage('Cada ID deve ser uma string')
  ],
  validateRequest,
  uploadController.processBatch
);

/**
 * @swagger
 * /api/upload/{id}/status:
 *   get:
 *     summary: Obter status do processamento
 *     tags: [Upload]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID do arquivo
 *     responses:
 *       200:
 *         description: Status obtido com sucesso
 *       404:
 *         description: Arquivo não encontrado
 *       401:
 *         description: Não autorizado
 */
router.get(
  '/:id/status',
  [
    param('id').notEmpty().withMessage('ID do arquivo é obrigatório')
  ],
  validateRequest,
  uploadController.getProcessingStatus
);

/**
 * @swagger
 * /api/upload/historico:
 *   get:
 *     summary: Obter histórico de uploads
 *     tags: [Upload]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: Número da página
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *         description: Itens por página
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [uploaded, processing, completed, error]
 *         description: Filtrar por status
 *     responses:
 *       200:
 *         description: Histórico obtido com sucesso
 *       401:
 *         description: Não autorizado
 */
router.get(
  '/historico',
  [
    query('page').optional().isInt({ min: 1 }).toInt(),
    query('limit').optional().isInt({ min: 1, max: 100 }).toInt(),
    query('status').optional().isIn(['uploaded', 'processing', 'completed', 'error'])
  ],
  validateRequest,
  uploadController.getUploadHistory
);

/**
 * @swagger
 * /api/upload/{id}/download:
 *   get:
 *     summary: Download de resultado
 *     tags: [Upload]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID do arquivo
 *     responses:
 *       200:
 *         description: Download iniciado
 *       404:
 *         description: Arquivo não encontrado
 *       401:
 *         description: Não autorizado
 */
router.get(
  '/:id/download',
  [
    param('id').notEmpty().withMessage('ID do arquivo é obrigatório')
  ],
  validateRequest,
  uploadController.downloadResult
);

/**
 * @swagger
 * /api/upload/{id}:
 *   delete:
 *     summary: Deletar arquivo
 *     tags: [Upload]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID do arquivo
 *     responses:
 *       200:
 *         description: Arquivo deletado com sucesso
 *       404:
 *         description: Arquivo não encontrado
 *       401:
 *         description: Não autorizado
 */
router.delete(
  '/:id',
  [
    param('id').notEmpty().withMessage('ID do arquivo é obrigatório')
  ],
  validateRequest,
  uploadController.deleteFile
);

/**
 * @swagger
 * /api/upload/stats:
 *   get:
 *     summary: Obter estatísticas de upload
 *     tags: [Upload]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Estatísticas obtidas com sucesso
 *       401:
 *         description: Não autorizado
 */
router.get('/stats', uploadController.getUploadStats);

/**
 * @swagger
 * /api/upload/validar:
 *   post:
 *     summary: Validar arquivo antes do upload
 *     tags: [Upload]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *                 description: Arquivo para validação
 *     responses:
 *       200:
 *         description: Validação realizada com sucesso
 *       400:
 *         description: Arquivo inválido
 *       401:
 *         description: Não autorizado
 */
router.post('/validar', uploadController.validateFile);

/**
 * @swagger
 * /api/upload/tipos-suportados:
 *   get:
 *     summary: Obter tipos de arquivo suportados
 *     tags: [Upload]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Tipos suportados obtidos com sucesso
 *       401:
 *         description: Não autorizado
 */
router.get('/tipos-suportados', uploadController.getSupportedFileTypes);

/**
 * @swagger
 * /api/upload/reprocessar/{id}:
 *   post:
 *     summary: Reprocessar arquivo
 *     tags: [Upload]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID do arquivo
 *     responses:
 *       200:
 *         description: Arquivo reprocessado com sucesso
 *       404:
 *         description: Arquivo não encontrado
 *       401:
 *         description: Não autorizado
 */
router.post(
  '/reprocessar/:id',
  [
    param('id').notEmpty().withMessage('ID do arquivo é obrigatório')
  ],
  validateRequest,
  uploadController.reprocessFile
);

/**
 * @swagger
 * /api/upload/{id}/confirmar:
 *   post:
 *     summary: Confirmar validação humana do processamento
 *     tags: [Upload]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID do arquivo
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               tipoDocumento:
 *                 type: string
 *                 enum: [entrada, saida, contrato, desconhecido]
 *               itens:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     itemId:
 *                       type: integer
 *                     contaPgc:
 *                       type: string
 *                     nomeContaPgc:
 *                       type: string
 *     responses:
 *       200:
 *         description: Documento validado e salvo
 *       400:
 *         description: Requisição inválida
 *       404:
 *         description: Documento não encontrado
 */
router.post(
  '/:id/confirmar',
  [
    param('id').notEmpty().withMessage('ID do arquivo é obrigatório')
  ],
  validateRequest,
  uploadController.confirmFile
);

module.exports = router;





