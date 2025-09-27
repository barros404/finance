/**
 * Controlador de Riscos - EndiAgro FinancePro
 *
 * Este arquivo contém a lógica de negócio para gerenciamento de análise de riscos e contingências.
 *
 * @author António Emiliano Barros
 * @version 1.0.0
 */

const { Risco, Usuario } = require('../models');
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

  if (query.tipo) filtros.tipo = query.tipo;
  if (query.severidade) filtros.severidade = query.severidade;
  if (query.status) filtros.status = query.status;
  if (query.dataInicio || query.dataFim) {
    filtros.createdAt = {};
    if (query.dataInicio) filtros.createdAt.$gte = new Date(query.dataInicio);
    if (query.dataFim) filtros.createdAt.$lte = new Date(query.dataFim);
  }

  return filtros;
};

/**
 * Calcula o nível de risco baseado em probabilidade e impacto
 */
const calcularNivelRisco = (probabilidade, impacto) => {
  const matriz = {
    1: { 1: 'baixa', 2: 'baixa', 3: 'media', 4: 'media', 5: 'alta' },
    2: { 1: 'baixa', 2: 'media', 3: 'media', 4: 'alta', 5: 'alta' },
    3: { 1: 'media', 2: 'media', 3: 'alta', 4: 'alta', 5: 'critica' },
    4: { 1: 'media', 2: 'alta', 3: 'alta', 4: 'critica', 5: 'critica' },
    5: { 1: 'alta', 2: 'alta', 3: 'critica', 4: 'critica', 5: 'critica' }
  };

  return matriz[probabilidade]?.[impacto] || 'baixa';
};

/**
 * ========================================
 * CONTROLADORES
 * ========================================
 */

/**
 * Lista todos os riscos
 */
const listarRiscos = async (req, res) => {
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

    const { count, rows: riscos } = await Risco.findAndCountAll({
      where: filtros,
      include: [
        {
          model: Usuario,
          as: 'criadoPor',
          attributes: ['id', 'nome', 'email']
        }
      ],
      limit: parseInt(limite),
      offset: offset,
      order: [[ordenarPor, ordem]]
    });

    const totalPaginas = Math.ceil(count / limite);

    res.status(200).json({
      status: 'success',
      data: riscos,
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
    logger.error('Erro ao listar riscos:', error);
    res.status(500).json({
      status: 'error',
      message: 'Erro interno do servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Obtém um risco específico
 */
const obterRisco = async (req, res) => {
  try {
    const { id } = req.params;

    const risco = await Risco.findByPk(id, {
      include: [
        {
          model: Usuario,
          as: 'criadoPor',
          attributes: ['id', 'nome', 'email']
        }
      ]
    });

    if (!risco) {
      return res.status(404).json({
        status: 'error',
        message: 'Risco não encontrado'
      });
    }

    res.status(200).json({
      status: 'success',
      data: risco
    });
  } catch (error) {
    logger.error('Erro ao obter risco:', error);
    res.status(500).json({
      status: 'error',
      message: 'Erro interno do servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Cria um novo risco
 */
const criarRisco = async (req, res) => {
  try {
    const dadosRisco = {
      ...req.body,
      usuarioId: req.user.id,
      status: 'identificado',
      nivelRisco: calcularNivelRisco(req.body.probabilidade, req.body.impacto)
    };

    const risco = await Risco.create(dadosRisco);

    // Buscar o risco criado com associações
    const riscoCriado = await Risco.findByPk(risco.id, {
      include: [
        {
          model: Usuario,
          as: 'criadoPor',
          attributes: ['id', 'nome', 'email']
        }
      ]
    });

    res.status(201).json({
      status: 'success',
      message: 'Risco criado com sucesso',
      data: riscoCriado
    });
  } catch (error) {
    logger.error('Erro ao criar risco:', error);
    res.status(500).json({
      status: 'error',
      message: 'Erro interno do servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Atualiza um risco
 */
const atualizarRisco = async (req, res) => {
  try {
    const { id } = req.params;
    const dadosAtualizacao = req.body;

    const risco = await Risco.findByPk(id);

    if (!risco) {
      return res.status(404).json({
        status: 'error',
        message: 'Risco não encontrado'
      });
    }

    // Recalcular nível de risco se probabilidade ou impacto foram alterados
    if (dadosAtualizacao.probabilidade || dadosAtualizacao.impacto) {
      const probabilidade = dadosAtualizacao.probabilidade || risco.probabilidade;
      const impacto = dadosAtualizacao.impacto || risco.impacto;
      dadosAtualizacao.nivelRisco = calcularNivelRisco(probabilidade, impacto);
    }

    await risco.update(dadosAtualizacao);

    // Buscar o risco atualizado
    const riscoAtualizado = await Risco.findByPk(id, {
      include: [
        {
          model: Usuario,
          as: 'criadoPor',
          attributes: ['id', 'nome', 'email']
        }
      ]
    });

    res.status(200).json({
      status: 'success',
      message: 'Risco atualizado com sucesso',
      data: riscoAtualizado
    });
  } catch (error) {
    logger.error('Erro ao atualizar risco:', error);
    res.status(500).json({
      status: 'error',
      message: 'Erro interno do servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Exclui um risco
 */
const excluirRisco = async (req, res) => {
  try {
    const { id } = req.params;

    const risco = await Risco.findByPk(id);

    if (!risco) {
      return res.status(404).json({
        status: 'error',
        message: 'Risco não encontrado'
      });
    }

    await risco.destroy();

    res.status(200).json({
      status: 'success',
      message: 'Risco excluído com sucesso'
    });
  } catch (error) {
    logger.error('Erro ao excluir risco:', error);
    res.status(500).json({
      status: 'error',
      message: 'Erro interno do servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Realiza análise de riscos automática
 */
const realizarAnalise = async (req, res) => {
  try {
    const { periodo, modulos, criterios } = req.body;

    // Aqui seria implementada a lógica de análise automática
    // baseada nos dados dos módulos selecionados

    const analise = {
      periodo,
      modulos: modulos || ['orcamento', 'tesouraria', 'execucao'],
      criterios: criterios || {},
      riscosIdentificados: [],
      dataAnalise: new Date()
    };

    // Simulação de identificação de riscos baseada nos dados
    // Em uma implementação real, isso consultaria os dados dos módulos

    res.status(200).json({
      status: 'success',
      message: 'Análise de riscos realizada com sucesso',
      data: analise
    });
  } catch (error) {
    logger.error('Erro ao realizar análise de riscos:', error);
    res.status(500).json({
      status: 'error',
      message: 'Erro interno do servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Adiciona plano de mitigação ao risco
 */
const adicionarMitigacao = async (req, res) => {
  try {
    const { id } = req.params;
    const { planoMitigacao, responsavel, prazo, custoEstimado } = req.body;

    const risco = await Risco.findByPk(id);

    if (!risco) {
      return res.status(404).json({
        status: 'error',
        message: 'Risco não encontrado'
      });
    }

    const mitigacao = {
      planoMitigacao,
      responsavel,
      prazo: prazo ? new Date(prazo) : null,
      custoEstimado,
      dataMitigacao: new Date()
    };

    await risco.update({
      status: 'mitigado',
      mitigacao
    });

    res.status(200).json({
      status: 'success',
      message: 'Plano de mitigação adicionado com sucesso',
      data: mitigacao
    });
  } catch (error) {
    logger.error('Erro ao adicionar mitigação:', error);
    res.status(500).json({
      status: 'error',
      message: 'Erro interno do servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Adiciona registro de monitoramento ao risco
 */
const adicionarMonitoramento = async (req, res) => {
  try {
    const { id } = req.params;
    const { observacao, statusAtual, proximaRevisao } = req.body;

    const risco = await Risco.findByPk(id);

    if (!risco) {
      return res.status(404).json({
        status: 'error',
        message: 'Risco não encontrado'
      });
    }

    const monitoramento = {
      observacao,
      dataMonitoramento: new Date(),
      proximaRevisao: proximaRevisao ? new Date(proximaRevisao) : null
    };

    // Adicionar ao histórico de monitoramento
    const historicoAtual = risco.monitoramento || [];
    historicoAtual.push(monitoramento);

    const dadosAtualizacao = {
      monitoramento: historicoAtual,
      status: statusAtual || risco.status,
      ultimaRevisao: new Date()
    };

    await risco.update(dadosAtualizacao);

    res.status(200).json({
      status: 'success',
      message: 'Monitoramento registrado com sucesso',
      data: monitoramento
    });
  } catch (error) {
    logger.error('Erro ao adicionar monitoramento:', error);
    res.status(500).json({
      status: 'error',
      message: 'Erro interno do servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Obtém estatísticas dos riscos
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

    const estatisticas = await Risco.findAll({
      where: filtros,
      attributes: [
        'tipo',
        'severidade',
        'status',
        [require('sequelize').fn('COUNT', require('sequelize').col('id')), 'quantidade']
      ],
      group: ['tipo', 'severidade', 'status']
    });

    // Processar estatísticas
    const statsProcessadas = {
      total: 0,
      porTipo: {},
      porSeveridade: {},
      porStatus: {},
      nivelRisco: {
        baixa: 0,
        media: 0,
        alta: 0,
        critica: 0
      }
    };

    estatisticas.forEach(stat => {
      const { tipo, severidade, status, quantidade } = stat.dataValues;
      const qtd = parseInt(quantidade);

      statsProcessadas.total += qtd;

      // Por tipo
      if (!statsProcessadas.porTipo[tipo]) statsProcessadas.porTipo[tipo] = 0;
      statsProcessadas.porTipo[tipo] += qtd;

      // Por severidade
      if (!statsProcessadas.porSeveridade[severidade]) statsProcessadas.porSeveridade[severidade] = 0;
      statsProcessadas.porSeveridade[severidade] += qtd;

      // Por status
      if (!statsProcessadas.porStatus[status]) statsProcessadas.porStatus[status] = 0;
      statsProcessadas.porStatus[status] += qtd;
    });

    res.status(200).json({
      status: 'success',
      data: statsProcessadas
    });
  } catch (error) {
    logger.error('Erro ao obter estatísticas dos riscos:', error);
    res.status(500).json({
      status: 'error',
      message: 'Erro interno do servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

module.exports = {
  listarRiscos,
  obterRisco,
  criarRisco,
  atualizarRisco,
  excluirRisco,
  realizarAnalise,
  adicionarMitigacao,
  adicionarMonitoramento,
  obterEstatisticas
};