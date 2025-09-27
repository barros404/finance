/**
 * Controlador de Upload - EndiAgro FinancePro
 * 
 * Este controlador gerencia todas as operações relacionadas ao upload
 * e processamento de documentos com mapeamento PGC-AO.
 * 
 * @author Antonio Emiliano Barros
 * @version 1.0.0
 */

const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;
const logger = require('../utils/logger');
const { constants, errorMessages, successMessages } = require('../config/api.config');
const DocumentProcessingService = require('../services/documentProcessingService');
const PGCMappingService = require('../services/pgcMappingService');
const { Documento, DocumentoItem, DocumentoFeedback } = require('../models');
const ClassificationService = require('../services/classificationService');

// Helpers simples para extrair beneficiário/fornecedor
function extractPartyFromText(text) {
  const t = (text || '').split('\n').slice(0, 50).join('\n'); // olhar primeiras linhas
  const patterns = [
    /(benefici[áa]rio)\s*[:|-]\s*(.+)/i,
    /(fornecedor|emitente)\s*[:|-]\s*(.+)/i,
    /(cliente)\s*[:|-]\s*(.+)/i,
    /(empresa)\s*[:|-]\s*(.+)/i
  ];
  for (const rx of patterns) {
    const m = t.match(rx);
    if (m && m[2]) {
      const value = m[2].split(/\s{2,}|\t|\r|\n/)[0].trim();
      if (/fornecedor|emitente/i.test(m[1])) return { fornecedor: value };
      if (/benefici/i.test(m[1])) return { beneficiario: value };
      if (/cliente|empresa/i.test(m[1])) return { beneficiario: value };
    }
  }
  // fallback: tentar capturar um nome em caixa alta no topo
  const upper = t.split('\n').map(l => l.trim()).filter(l => l && l === l.toUpperCase() && l.length > 3);
  if (upper.length) return { fornecedor: upper[0].slice(0, 120) };
  return null;
}

function formatAKZ(value) {
  if (value == null || isNaN(value)) return null;
  // pt-AO: separador milhar ponto, decimal vírgula
  const parts = value.toFixed(2).split('.');
  const inteiro = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  const decimal = parts[1];
  return `Kz ${inteiro},${decimal}`;
}

// Configuração do multer para upload
const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../../uploads');
    try {
      await fs.mkdir(uploadDir, { recursive: true });
      cb(null, uploadDir);
    } catch (error) {
      cb(error);
    }
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = [
    'application/pdf',
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/tiff'
  ];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Tipo de arquivo não suportado'), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB
  }
});

/**
 * Upload de arquivo único
 * @route POST /api/upload/documento
 */
exports.uploadFile = [
  upload.single('file'),
  async (req, res, next) => {
    try {
      if (!req.file) {
        return res.status(400).json({
          status: 'error',
          message: 'Nenhum arquivo foi enviado'
        });
      }

      // Persistir documento
      const novoDoc = await Documento.create({
        filename: req.file.originalname,
        path: req.file.path,
        mimetype: req.file.mimetype,
        size: req.file.size,
        uploadedBy: req.usuario?.id || null,
        status: 'uploaded'
      });

      logger.info('Arquivo enviado com sucesso', {
        fileId: novoDoc.id,
        filename: novoDoc.filename,
        userId: req.usuario?.id
      });

      res.status(201).json({
        status: 'success',
        message: 'Arquivo enviado com sucesso',
        data: {
          file: {
            id: novoDoc.id,
            originalName: req.file.originalname,
            filename: novoDoc.filename,
            path: novoDoc.path,
            size: novoDoc.size,
            mimetype: novoDoc.mimetype,
            uploadedAt: novoDoc.createdAt,
            uploadedBy: novoDoc.uploadedBy,
            status: novoDoc.status
          }
        }
      });

    } catch (error) {
      logger.error('Erro no upload de arquivo:', error);
      next(error);
    }
  }
];

/**
 * Upload de múltiplos arquivos
 * @route POST /api/upload/lote
 */
exports.uploadBatch = [
  upload.array('files', 10),
  async (req, res, next) => {
    try {
      if (!req.files || req.files.length === 0) {
        return res.status(400).json({
          status: 'error',
          message: 'Nenhum arquivo foi enviado'
        });
      }

      // Persistir documentos em lote
      const created = [];
      for (const file of req.files) {
        const doc = await Documento.create({
          filename: file.originalname,
          path: file.path,
          mimetype: file.mimetype,
          size: file.size,
          uploadedBy: req.usuario?.id || null,
          status: 'uploaded'
        });
        created.push({
          id: doc.id,
          originalName: file.originalname,
          filename: doc.filename,
          path: doc.path,
          size: doc.size,
          mimetype: doc.mimetype,
          uploadedAt: doc.createdAt,
          uploadedBy: doc.uploadedBy,
          status: doc.status
        });
      }

      logger.info('Lote de arquivos enviado com sucesso', {
        count: created.length,
        userId: req.usuario?.id
      });

      res.status(201).json({
        status: 'success',
        message: `${created.length} arquivos enviados com sucesso`,
        data: {
          files: created
        }
      });

    } catch (error) {
      logger.error('Erro no upload em lote:', error);
      next(error);
    }
  }
];

/**
 * Processar arquivo
 * @route POST /api/upload/processar/:id
 */
exports.processFile = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Buscar documento no banco
    const doc = await Documento.findByPk(id);
    if (!doc) {
      return res.status(404).json({ status: 'error', message: 'Documento não encontrado' });
    }

    // Atualizar status para processing
    await doc.update({ status: 'processing' });

    // Inicializar serviços
    const documentProcessingService = new DocumentProcessingService();
    const pgcMappingService = new PGCMappingService();
    const classificationService = new ClassificationService();

    // Extrair texto
    const extractedText = await documentProcessingService.extractText(doc.path);

    // Classificação sugerida (tende para 'saida' conforme regra de negócio)
    const classif = await classificationService.classify(extractedText);
    if (classif && classif.tipoDocumento === 'entrada') {
      // Se não houver sinais claros de entrada, favorecer 'saida'
      const entradaSignals = /(venda|receita|nota\s*de\s*cr[eé]dito|cliente)/i;
      if (!entradaSignals.test(extractedText)) {
        classif.tipoDocumento = 'saida';
        classif.confianca = Math.max(classif.confianca, 60);
      }
    }

    // Mapear para PGC-AO
    const pgcMappingResult = await pgcMappingService.processarTexto(extractedText);

    // Persistir resultados no Documento
    await doc.update({
      extractedText,
      ocrConfidence: Math.round((pgcMappingResult.estatisticas?.confiancaMedia || 0)),
      suggestedSummary: {
        tipoDocumentoSugerido: classif.tipoDocumento,
        classificacaoConfianca: classif.confianca,
        estatisticas: pgcMappingResult.estatisticas
      },
      processedAt: new Date(),
      status: 'awaiting_validation'
    });

    // Criar/atualizar feedback com sugestão
    await DocumentoFeedback.upsert({
      documentId: doc.id,
      tipoDocumentoSugerido: classif.tipoDocumento,
      classificacaoConfianca: classif.confianca
    }, { where: { documentId: doc.id } });

    // Persistir itens sugeridos
    const itens = pgcMappingResult.itensMapeados || [];
    const createdItems = [];
    for (const item of itens) {
      const created = await DocumentoItem.create({
        documentId: doc.id,
        descricaoOriginal: item?.textoCompleto || item?.descricao || '',
        valor: item?.valor ?? null,
        contaPgcSugerida: item?.pgcMapping?.contaPgc || null,
        nomeContaPgcSugerida: item?.pgcMapping?.nomeContaPgc || null,
        confiancaSugestao: item?.pgcMapping?.confianca ?? null
      });
      createdItems.push(created);
    }

    // Montar retorno resumido conforme necessidade do front
    const summarizedItems = (pgcMappingResult.itensMapeados || []).map(it => ({
      beneficiario: this.extractBeneficiario?.(extractedText) || null, // placeholder; será inferido abaixo
      fornecedor: this.extractFornecedor?.(extractedText) || null, // placeholder
      valor: it.valor ?? null,
      quantidade: 1,
      descricao: it.descricao || (it.textoCompleto || '').trim(),
      nome: it.pgcMapping?.nomeContaPgc || null,
      contaPgc: it.pgcMapping?.contaPgc || null,
      confianca: it.pgcMapping?.confianca ?? null
    }));

    // Tentativa simples de extrair beneficiário/fornecedor do texto completo
    const beneficiarioFornecedor = extractPartyFromText(extractedText);
    const result = {
      fileId: doc.id,
      tipoDocumentoSugerido: classif.tipoDocumento,
      extractedText,
      itens: summarizedItems.map(si => ({
        beneficiario: beneficiarioFornecedor?.beneficiario || null,
        fornecedor: beneficiarioFornecedor?.fornecedor || null,
        valor: formatAKZ(si.valor),
        quantidade: si.quantidade,
        descricao: si.descricao,
        nome: si.descricao ? String(si.descricao).slice(0, 120) : null,
        contaPgc: si.contaPgc,
        confianca: si.confianca
      })),
      processedAt: doc.processedAt,
      status: doc.status
    };

    res.status(200).json({
      status: 'success',
      message: 'Processamento concluído; aguardando validação humana',
      data: result
    });

  } catch (error) {
    logger.error('Erro no processamento do arquivo:', error);
    next(error);
  }
};

/**
 * Obter status do processamento
 * @route GET /api/upload/:id/status
 */
exports.getProcessingStatus = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Simular status do processamento
    const status = {
      fileId: id,
      status: 'completed',
      progress: 100,
      message: 'Processamento concluído',
      lastUpdated: new Date()
    };

    res.status(200).json({
      status: 'success',
      data: status
    });

  } catch (error) {
    logger.error('Erro ao obter status:', error);
    next(error);
  }
};

/**
 * Obter histórico de uploads
 * @route GET /api/upload/historico
 */
exports.getUploadHistory = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, status } = req.query;

    // Simular histórico de uploads
    const history = [
      {
        id: 1,
        originalName: 'fatura-001.pdf',
        size: 1024000,
        status: 'completed',
        uploadedAt: new Date(Date.now() - 86400000),
        processedAt: new Date(Date.now() - 86300000),
        pgcMapping: {
          confidence: 95,
          totalItems: 8
        }
      },
      {
        id: 2,
        originalName: 'nota-compra-002.pdf',
        size: 512000,
        status: 'processing',
        uploadedAt: new Date(Date.now() - 3600000),
        processedAt: null,
        pgcMapping: null
      }
    ];

    const filteredHistory = status 
      ? history.filter(item => item.status === status)
      : history;

    res.status(200).json({
      status: 'success',
      data: {
        uploads: filteredHistory,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: filteredHistory.length,
          pages: Math.ceil(filteredHistory.length / limit)
        }
      }
    });

  } catch (error) {
    logger.error('Erro ao obter histórico:', error);
    next(error);
  }
};

/**
 * Download de resultado
 * @route GET /api/upload/:id/download
 */
exports.downloadResult = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Simular download
    res.status(200).json({
      status: 'success',
      message: 'Download iniciado',
      data: {
        downloadUrl: `/api/upload/${id}/file`,
        expiresAt: new Date(Date.now() + 3600000) // 1 hora
      }
    });

  } catch (error) {
    logger.error('Erro no download:', error);
    next(error);
  }
};

/**
 * Deletar arquivo
 * @route DELETE /api/upload/:id
 */
exports.deleteFile = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Simular exclusão
    logger.info('Arquivo excluído', { fileId: id, userId: req.usuario?.id });

    res.status(200).json({
      status: 'success',
      message: 'Arquivo excluído com sucesso'
    });

  } catch (error) {
    logger.error('Erro ao deletar arquivo:', error);
    next(error);
  }
};

/**
 * Obter estatísticas de upload
 * @route GET /api/upload/stats
 */
exports.getUploadStats = async (req, res, next) => {
  try {
    const stats = {
      totalUploads: 247,
      totalProcessed: 234,
      totalErrors: 13,
      averageProcessingTime: 3.2,
      totalSize: 125000000, // bytes
      successRate: 94.7,
      lastUpload: new Date(Date.now() - 1800000) // 30 minutos atrás
    };

    res.status(200).json({
      status: 'success',
      data: stats
    });

  } catch (error) {
    logger.error('Erro ao obter estatísticas:', error);
    next(error);
  }
};

/**
 * Validar arquivo
 * @route POST /api/upload/validar
 */
exports.validateFile = [
  upload.single('file'),
  async (req, res, next) => {
    try {
      if (!req.file) {
        return res.status(400).json({
          status: 'error',
          message: 'Nenhum arquivo foi enviado'
        });
      }

      const validation = {
        isValid: true,
        file: {
          name: req.file.originalname,
          size: req.file.size,
          type: req.file.mimetype
        },
        warnings: [],
        errors: []
      };

      // Verificar tamanho
      if (req.file.size > 10 * 1024 * 1024) {
        validation.isValid = false;
        validation.errors.push('Arquivo muito grande (máximo 10MB)');
      }

      // Verificar tipo (somente PDF e imagens)
      const allowedTypes = [
        'application/pdf',
        'image/jpeg',
        'image/jpg',
        'image/png',
        'image/tiff'
      ];

      if (!allowedTypes.includes(req.file.mimetype)) {
        validation.isValid = false;
        validation.errors.push('Tipo de arquivo não suportado (apenas PDF ou imagens)');
      }

      // Limpar arquivo temporário
      await fs.unlink(req.file.path);

      res.status(200).json({
        status: 'success',
        data: validation
      });

    } catch (error) {
      logger.error('Erro na validação:', error);
      next(error);
    }
  }
];

/**
 * Obter tipos de arquivo suportados
 * @route GET /api/upload/tipos-suportados
 */
exports.getSupportedFileTypes = async (req, res, next) => {
  try {
    const supportedTypes = {
      documents: [
        { extension: '.pdf', mimeType: 'application/pdf', description: 'PDF Document' }
      ],
      images: [
        { extension: '.jpg', mimeType: 'image/jpeg', description: 'JPEG Image' },
        { extension: '.jpeg', mimeType: 'image/jpeg', description: 'JPEG Image' },
        { extension: '.png', mimeType: 'image/png', description: 'PNG Image' },
        { extension: '.tiff', mimeType: 'image/tiff', description: 'TIFF Image' }
      ],
      limits: {
        maxFileSize: 10 * 1024 * 1024, // 10MB
        maxFilesPerBatch: 10
      }
    };

    res.status(200).json({
      status: 'success',
      data: supportedTypes
    });

  } catch (error) {
    logger.error('Erro ao obter tipos suportados:', error);
    next(error);
  }
};

/**
 * Processar múltiplos arquivos
 * @route POST /api/upload/processar-lote
 */
exports.processBatch = async (req, res, next) => {
  try {
    const { fileIds } = req.body || {};

    if (!Array.isArray(fileIds) || fileIds.length === 0) {
      return res.status(400).json({
        status: 'error',
        message: 'IDs dos arquivos são obrigatórios (array)'
      });
    }

    if (fileIds.length > 10) {
      return res.status(400).json({
        status: 'error',
        message: 'Máximo de 10 arquivos por lote'
      });
    }

    const documentProcessingService = new DocumentProcessingService();
    const pgcMappingService = new PGCMappingService();

    const results = [];

    for (const id of fileIds) {
      // Simular dados do arquivo e processamento semelhante ao processFile
      const fileData = {
        id,
        originalName: `documento-${id}.pdf`,
        path: '/uploads/documento-exemplo.pdf',
        status: 'processing'
      };

      logger.info('Iniciando processamento do arquivo (lote)', { fileId: id });

      // 1. Extrair texto
      const extractedText = await documentProcessingService.extractText(fileData.path);

      // 2. Mapear para PGC-AO
      const pgcMappingResult = await pgcMappingService.processarTexto(extractedText);

      results.push({
        fileId: id,
        extractedText,
        pgcMapping: {
          confidence: pgcMappingResult.estatisticas.confiancaMedia,
          mappedAccounts: Object.values(pgcMappingResult.resumoPorClasse).flatMap(classe =>
            Object.values(classe.contas).map(conta => `${conta.codigo} - ${conta.nome}`)
          ),
          totalItems: pgcMappingResult.estatisticas.totalItens,
          totalValue: pgcMappingResult.estatisticas.totalValor,
          compliance: pgcMappingResult.conformidade,
          detailedMapping: pgcMappingResult.itensMapeados
        },
        processingTime: Math.floor(Math.random() * 5) + 2,
        processedAt: new Date(),
        status: 'completed'
      });

      logger.info('Processamento concluído (lote)', { fileId: id });
    }

    res.status(200).json({
      status: 'success',
      message: 'Arquivos processados com sucesso',
      data: { results, count: results.length }
    });
  } catch (error) {
    logger.error('Erro no processamento em lote:', error);
    next(error);
  }
};

/**
 * Reprocessar arquivo
 * @route POST /api/upload/reprocessar/:id
 */
exports.reprocessFile = async (req, res, next) => {
  try {
    const { id } = req.params;

    logger.info('Reprocessando arquivo', { fileId: id });

    const doc = await Documento.findByPk(id);
    if (!doc) return res.status(404).json({ status: 'error', message: 'Documento não encontrado' });

    const documentProcessingService = new DocumentProcessingService();
    const pgcMappingService = new PGCMappingService();

    const extractedText = await documentProcessingService.extractText(doc.path);
    const pgcMappingResult = await pgcMappingService.processarTexto(extractedText);

    await doc.update({ extractedText, processedAt: new Date(), status: 'awaiting_validation' });

    res.status(200).json({
      status: 'success',
      message: 'Arquivo reprocessado; aguardando validação humana',
      data: {
        fileId: id,
        extractedText,
        itens: (pgcMappingResult.itensMapeados || []).map(it => ({
          valor: it.valor ?? null,
          quantidade: 1,
          descricao: it.descricao || (it.textoCompleto || '').trim(),
          nome: it.pgcMapping?.nomeContaPgc || null,
          contaPgc: it.pgcMapping?.contaPgc || null,
          confianca: it.pgcMapping?.confianca ?? null
        })),
        processedAt: doc.processedAt,
        status: doc.status
      }
    });
  } catch (error) {
    logger.error('Erro ao reprocessar arquivo:', error);
    next(error);
  }
};

/**
 * Confirmar validação humana e salvar classificações definitivas
 * @route POST /api/upload/:id/confirmar
 */
exports.confirmFile = async (req, res, next) => {
  try {
    const { id } = req.params;
    // payload esperado: { tipoDocumento, itens: [{ itemId, contaPgc, nomeContaPgc }], beneficiario?, fornecedor? }
    const { tipoDocumento, itens = [] } = req.body || {};

    const doc = await Documento.findByPk(id);
    if (!doc) return res.status(404).json({ status: 'error', message: 'Documento não encontrado' });

    // Atualizar feedback com confirmação
    const [feedback] = await DocumentoFeedback.findOrCreate({ where: { documentId: id }, defaults: { documentId: id } });
    feedback.tipoDocumentoConfirmado = tipoDocumento || feedback.tipoDocumentoConfirmado || 'saida';
    feedback.confirmadoPor = req.usuario?.id || null;
    await feedback.save();

    // Atualizar itens confirmados
    for (const it of itens) {
      if (!it.itemId) continue;
      await DocumentoItem.update({
        contaPgcConfirmada: it.contaPgc || null,
        nomeContaPgcConfirmada: it.nomeContaPgc || null
      }, { where: { id: it.itemId, documentId: id } });
    }

    // Marcar documento como validado
    await doc.update({ status: 'validated' });

    // Aprendizado: usar o texto extraído com o rótulo confirmado
    try {
      const classifier = new ClassificationService();
      await classifier.learn(doc.extractedText || '', feedback.tipoDocumentoConfirmado || 'saida');
    } catch (e) {
      logger.warn('Falha ao aprender com classificador', { error: e.message });
    }

    return res.status(200).json({ status: 'success', message: 'Documento validado e salvo com sucesso' });
  } catch (error) {
    logger.error('Erro ao confirmar documento:', error);
    next(error);
  }
};

module.exports = exports;





