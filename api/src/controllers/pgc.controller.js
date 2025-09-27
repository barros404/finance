/**
 * Controlador de PGC - EndiAgro FinancePro
 *
 * Este arquivo contém a lógica de negócio para gerenciamento do Plano Geral de Contas (PGC)
 * e validação de contas.
 *
 * @author António Emiliano Barros
 * @version 1.0.0
 */

const { Pgcconta, PgcMapping, Documento, Usuario } = require('../models');
const { logger } = require('../utils/logger');

/**
 * ========================================
 * FUNÇÕES AUXILIARES
 * ========================================
 */

/**
 * Monta filtros para consultas
 */
const montarFiltros = (query) => {
  const filtros = {};

  if (query.classe) filtros.classe = query.classe;
  if (query.status) filtros.status = query.status;
  if (query.busca) {
    filtros[require('sequelize').Op.or] = [
      { codigo: { [require('sequelize').Op.iLike]: `%${query.busca}%` } },
      { descricao: { [require('sequelize').Op.iLike]: `%${query.busca}%` } }
    ];
  }

  return filtros;
};

/**
 * ========================================
 * CONTROLADORES
 * ========================================
 */

/**
 * Lista contas PGC
 */
const listarContasPGC = async (req, res) => {
  try {
    const {
      pagina = 1,
      limite = 20,
      ordenarPor = 'createdAt',
      ordem = 'DESC',
      ...filtrosQuery
    } = req.query;

    const offset = (pagina - 1) * limite;
    const filtros = montarFiltros(filtrosQuery);

    const { count, rows: contas } = await Pgcconta.findAndCountAll({
      where: filtros,
      include: [
        {
          model: Usuario,
          as: 'validadoPor',
          attributes: ['id', 'nome', 'email'],
          required: false
        }
      ],
      limit: parseInt(limite),
      offset: offset,
      order: [[ordenarPor, ordem]]
    });

    const totalPaginas = Math.ceil(count / limite);

    res.status(200).json({
      status: 'success',
      data: contas,
      pagination: {
        pagina: parseInt(pagina),
        limite: parseInt(limite),
        totalItens: count,
        totalPaginas: totalPaginas,
        temProxima: pagina < totalPaginas,
        temAnterior: pagina > 1
      }
    });
  } catch (error) {
    logger.error('Erro ao listar contas PGC:', error);
    res.status(500).json({
      status: 'error',
      message: 'Erro interno do servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Obtém uma conta PGC específica
 */
const obterContaPGC = async (req, res) => {
  try {
    const { id } = req.params;

    const conta = await PgcConta.findByPk(id, {
      include: [
        {
          model: Usuario,
          as: 'validadoPor',
          attributes: ['id', 'nome', 'email'],
          required: false
        }
      ]
    });

    if (!conta) {
      return res.status(404).json({
        status: 'error',
        message: 'Conta PGC não encontrada'
      });
    }

    res.status(200).json({
      status: 'success',
      data: conta
    });
  } catch (error) {
    logger.error('Erro ao obter conta PGC:', error);
    res.status(500).json({
      status: 'error',
      message: 'Erro interno do servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Cria uma nova conta PGC
 */
const criarContaPGC = async (req, res) => {
  try {
    const dadosConta = {
      ...req.body,
      status: 'pendente',
      criadoPor: req.user.id
    };

    const conta = await PgcConta.create(dadosConta);

    // Buscar a conta criada com associações
    const contaCriada = await PgcConta.findByPk(conta.id, {
      include: [
        {
          model: Usuario,
          as: 'validadoPor',
          attributes: ['id', 'nome', 'email'],
          required: false
        }
      ]
    });

    res.status(201).json({
      status: 'success',
      message: 'Conta PGC criada com sucesso',
      data: contaCriada
    });
  } catch (error) {
    logger.error('Erro ao criar conta PGC:', error);
    res.status(500).json({
      status: 'error',
      message: 'Erro interno do servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Atualiza uma conta PGC
 */
const atualizarContaPGC = async (req, res) => {
  try {
    const { id } = req.params;
    const dadosAtualizacao = req.body;

    const conta = await PgcConta.findByPk(id);

    if (!conta) {
      return res.status(404).json({
        status: 'error',
        message: 'Conta PGC não encontrada'
      });
    }

    await conta.update(dadosAtualizacao);

    // Buscar a conta atualizada
    const contaAtualizada = await PgcConta.findByPk(id, {
      include: [
        {
          model: Usuario,
          as: 'validadoPor',
          attributes: ['id', 'nome', 'email'],
          required: false
        }
      ]
    });

    res.status(200).json({
      status: 'success',
      message: 'Conta PGC atualizada com sucesso',
      data: contaAtualizada
    });
  } catch (error) {
    logger.error('Erro ao atualizar conta PGC:', error);
    res.status(500).json({
      status: 'error',
      message: 'Erro interno do servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Exclui uma conta PGC
 */
const excluirContaPGC = async (req, res) => {
  try {
    const { id } = req.params;

    const conta = await PgcConta.findByPk(id);

    if (!conta) {
      return res.status(404).json({
        status: 'error',
        message: 'Conta PGC não encontrada'
      });
    }

    await conta.destroy();

    res.status(200).json({
      status: 'success',
      message: 'Conta PGC excluída com sucesso'
    });
  } catch (error) {
    logger.error('Erro ao excluir conta PGC:', error);
    res.status(500).json({
      status: 'error',
      message: 'Erro interno do servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Valida uma conta PGC específica
 */
const validarContaPGC = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, observacoes } = req.body;

    const conta = await PgcConta.findByPk(id);

    if (!conta) {
      return res.status(404).json({
        status: 'error',
        message: 'Conta PGC não encontrada'
      });
    }

    await conta.update({
      status,
      observacoes: observacoes || conta.observacoes,
      validadoPor: req.user.id,
      dataValidacao: new Date()
    });

    res.status(200).json({
      status: 'success',
      message: 'Conta PGC validada com sucesso',
      data: conta
    });
  } catch (error) {
    logger.error('Erro ao validar conta PGC:', error);
    res.status(500).json({
      status: 'error',
      message: 'Erro interno do servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Rejeita uma conta PGC específica
 */
const rejeitarContaPGC = async (req, res) => {
  try {
    const { id } = req.params;
    const { motivo } = req.body;

    const conta = await PgcConta.findByPk(id);

    if (!conta) {
      return res.status(404).json({
        status: 'error',
        message: 'Conta PGC não encontrada'
      });
    }

    await conta.update({
      status: 'erro',
      observacoes: motivo,
      validadoPor: req.user.id,
      dataValidacao: new Date()
    });

    res.status(200).json({
      status: 'success',
      message: 'Conta PGC rejeitada com sucesso',
      data: conta
    });
  } catch (error) {
    logger.error('Erro ao rejeitar conta PGC:', error);
    res.status(500).json({
      status: 'error',
      message: 'Erro interno do servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Valida múltiplas contas PGC
 */
const validarContasPGC = async (req, res) => {
  try {
    const { contas } = req.body;
    const resultados = [];

    for (const contaValidacao of contas) {
      try {
        const conta = await PgcConta.findByPk(contaValidacao.id);
        if (conta) {
          await conta.update({
            status: contaValidacao.status,
            observacoes: contaValidacao.observacoes || conta.observacoes,
            validadoPor: req.user.id,
            dataValidacao: new Date()
          });
          resultados.push({
            id: contaValidacao.id,
            sucesso: true,
            status: contaValidacao.status
          });
        } else {
          resultados.push({
            id: contaValidacao.id,
            sucesso: false,
            erro: 'Conta não encontrada'
          });
        }
      } catch (error) {
        resultados.push({
          id: contaValidacao.id,
          sucesso: false,
          erro: error.message
        });
      }
    }

    res.status(200).json({
      status: 'success',
      message: 'Validação em lote concluída',
      data: {
        totalProcessado: contas.length,
        resultados
      }
    });
  } catch (error) {
    logger.error('Erro ao validar contas PGC em lote:', error);
    res.status(500).json({
      status: 'error',
      message: 'Erro interno do servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Classifica documento usando PGC-AO
 */
const classificarDocumento = async (req, res) => {
  try {
    const { documentoId, dadosExtraidos, regrasClassificacao } = req.body;

    // Aqui seria implementada a lógica de classificação automática
    // baseada nos dados extraídos e regras de mapeamento PGC

    const classificacao = {
      documentoId,
      contasIdentificadas: [],
      confiancaClassificacao: 0,
      dataClassificacao: new Date()
    };

    // Simulação de classificação
    // Em uma implementação real, isso consultaria as regras de mapeamento

    res.status(200).json({
      status: 'success',
      message: 'Documento classificado com sucesso',
      data: classificacao
    });
  } catch (error) {
    logger.error('Erro ao classificar documento:', error);
    res.status(500).json({
      status: 'error',
      message: 'Erro interno do servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Lista mapeamentos PGC
 */
const listarMapeamentosPGC = async (req, res) => {
  try {
    const { tipoDocumento, contaPGC } = req.query;

    const filtros = {};
    if (tipoDocumento) filtros.tipoDocumento = tipoDocumento;
    if (contaPGC) filtros.contaPGC = contaPGC;

    const mapeamentos = await PgcMapping.findAll({
      where: filtros,
      order: [['tipoDocumento', 'ASC'], ['prioridade', 'ASC']]
    });

    res.status(200).json({
      status: 'success',
      data: mapeamentos
    });
  } catch (error) {
    logger.error('Erro ao listar mapeamentos PGC:', error);
    res.status(500).json({
      status: 'error',
      message: 'Erro interno do servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Obtém estatísticas de validação PGC
 */
const obterEstatisticas = async (req, res) => {
  try {
    const { dataInicio, dataFim } = req.query;

    const filtros = {};
    if (dataInicio || dataFim) {
      filtros.createdAt = {};
      if (dataInicio) filtros.createdAt.$gte = new Date(dataInicio);
      if (dataFim) filtros.createdAt.$lte = new Date(dataFim);
    }

    const estatisticas = await PgcConta.findAll({
      where: filtros,
      attributes: [
        'status',
        'classe',
        [require('sequelize').fn('COUNT', require('sequelize').col('id')), 'quantidade']
      ],
      group: ['status', 'classe']
    });

    // Processar estatísticas
    const statsProcessadas = {
      total: 0,
      porStatus: {},
      porClasse: {},
      conformidade: 0
    };

    estatisticas.forEach(stat => {
      const { status, classe, quantidade } = stat.dataValues;
      const qtd = parseInt(quantidade);

      statsProcessadas.total += qtd;

      // Por status
      if (!statsProcessadas.porStatus[status]) {
        statsProcessadas.porStatus[status] = 0;
      }
      statsProcessadas.porStatus[status] += qtd;

      // Por classe
      if (!statsProcessadas.porClasse[classe]) {
        statsProcessadas.porClasse[classe] = 0;
      }
      statsProcessadas.porClasse[classe] += qtd;
    });

    // Calcular conformidade (contas validadas / total)
    const validadas = statsProcessadas.porStatus.validada || 0;
    statsProcessadas.conformidade = statsProcessadas.total > 0 ?
      ((validadas / statsProcessadas.total) * 100).toFixed(1) : 0;

    res.status(200).json({
      status: 'success',
      data: statsProcessadas
    });
  } catch (error) {
    logger.error('Erro ao obter estatísticas PGC:', error);
    res.status(500).json({
      status: 'error',
      message: 'Erro interno do servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

module.exports = {
  listarContasPGC,
  obterContaPGC,
  criarContaPGC,
  atualizarContaPGC,
  excluirContaPGC,
  validarContaPGC,
  rejeitarContaPGC,
  validarContasPGC,
  classificarDocumento,
  listarMapeamentosPGC,
  obterEstatisticas
};