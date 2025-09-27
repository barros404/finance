/**
 * Controlador de Relatórios - EndiAgro FinancePro
 *
 * Este arquivo contém a lógica de negócio para gerenciamento de relatórios executivos.
 *
 * @author António Emiliano Barros
 * @version 1.0.0
 */

const { Relatorio, Usuario } = require('../models');
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
  if (query.status) filtros.status = query.status;
  if (query.dataInicio || query.dataFim) {
    filtros.createdAt = {};
    if (query.dataInicio) filtros.createdAt.$gte = new Date(query.dataInicio);
    if (query.dataFim) filtros.createdAt.$lte = new Date(query.dataFim);
  }

  return filtros;
};

/**
 * ========================================
 * CONTROLADORES
 * ========================================
 */

/**
 * Lista todos os relatórios
 */
const listarRelatorios = async (req, res) => {
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

    const { count, rows: relatorios } = await Relatorio.findAndCountAll({
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
      data: relatorios,
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
    logger.error('Erro ao listar relatórios:', error);
    res.status(500).json({
      status: 'error',
      message: 'Erro interno do servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Obtém um relatório específico
 */
const obterRelatorio = async (req, res) => {
  try {
    const { id } = req.params;

    const relatorio = await Relatorio.findByPk(id, {
      include: [
        {
          model: Usuario,
          as: 'criadoPor',
          attributes: ['id', 'nome', 'email']
        }
      ]
    });

    if (!relatorio) {
      return res.status(404).json({
        status: 'error',
        message: 'Relatório não encontrado'
      });
    }

    res.status(200).json({
      status: 'success',
      data: relatorio
    });
  } catch (error) {
    logger.error('Erro ao obter relatório:', error);
    res.status(500).json({
      status: 'error',
      message: 'Erro interno do servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Cria um novo relatório
 */
const criarRelatorio = async (req, res) => {
  try {
    const dadosRelatorio = {
      ...req.body,
      usuarioId: req.user.id,
      status: 'rascunho',
      dataGeracao: new Date()
    };

    const relatorio = await Relatorio.create(dadosRelatorio);

    // Buscar o relatório criado com associações
    const relatorioCriado = await Relatorio.findByPk(relatorio.id, {
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
      message: 'Relatório criado com sucesso',
      data: relatorioCriado
    });
  } catch (error) {
    logger.error('Erro ao criar relatório:', error);
    res.status(500).json({
      status: 'error',
      message: 'Erro interno do servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Atualiza um relatório
 */
const atualizarRelatorio = async (req, res) => {
  try {
    const { id } = req.params;
    const dadosAtualizacao = req.body;

    const relatorio = await Relatorio.findByPk(id);

    if (!relatorio) {
      return res.status(404).json({
        status: 'error',
        message: 'Relatório não encontrado'
      });
    }

    await relatorio.update(dadosAtualizacao);

    // Buscar o relatório atualizado
    const relatorioAtualizado = await Relatorio.findByPk(id, {
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
      message: 'Relatório atualizado com sucesso',
      data: relatorioAtualizado
    });
  } catch (error) {
    logger.error('Erro ao atualizar relatório:', error);
    res.status(500).json({
      status: 'error',
      message: 'Erro interno do servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Exclui um relatório
 */
const excluirRelatorio = async (req, res) => {
  try {
    const { id } = req.params;

    const relatorio = await Relatorio.findByPk(id);

    if (!relatorio) {
      return res.status(404).json({
        status: 'error',
        message: 'Relatório não encontrado'
      });
    }

    await relatorio.destroy();

    res.status(200).json({
      status: 'success',
      message: 'Relatório excluído com sucesso'
    });
  } catch (error) {
    logger.error('Erro ao excluir relatório:', error);
    res.status(500).json({
      status: 'error',
      message: 'Erro interno do servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Gera relatório automático
 */
const gerarRelatorioAutomatico = async (req, res) => {
  try {
    const { tipo } = req.params;
    const { periodo, filtros, formato = 'pdf' } = req.body;

    // Aqui seria implementada a lógica de geração automática
    // baseada no tipo de relatório solicitado

    const dadosRelatorio = {
      titulo: `Relatório ${tipo.charAt(0).toUpperCase() + tipo.slice(1)} - ${new Date().toLocaleDateString('pt-BR')}`,
      tipo,
      formato,
      parametros: { periodo, filtros },
      usuarioId: req.user.id,
      status: 'gerado',
      dataGeracao: new Date()
    };

    const relatorio = await Relatorio.create(dadosRelatorio);

    res.status(201).json({
      status: 'success',
      message: 'Relatório gerado com sucesso',
      data: relatorio
    });
  } catch (error) {
    logger.error('Erro ao gerar relatório automático:', error);
    res.status(500).json({
      status: 'error',
      message: 'Erro interno do servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Download do relatório
 */
const downloadRelatorio = async (req, res) => {
  try {
    const { id } = req.params;

    const relatorio = await Relatorio.findByPk(id);

    if (!relatorio) {
      return res.status(404).json({
        status: 'error',
        message: 'Relatório não encontrado'
      });
    }

    // Aqui seria implementada a lógica de geração do arquivo
    // Por enquanto, retorna uma resposta simulada

    res.status(200).json({
      status: 'success',
      message: 'Download iniciado',
      data: {
        relatorioId: id,
        url: `/api/relatorios/${id}/arquivo` // URL simulada
      }
    });
  } catch (error) {
    logger.error('Erro ao fazer download do relatório:', error);
    res.status(500).json({
      status: 'error',
      message: 'Erro interno do servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Envia relatório por email
 */
const enviarRelatorio = async (req, res) => {
  try {
    const { id } = req.params;
    const { destinatarios, assunto, mensagem } = req.body;

    const relatorio = await Relatorio.findByPk(id);

    if (!relatorio) {
      return res.status(404).json({
        status: 'error',
        message: 'Relatório não encontrado'
      });
    }

    // Aqui seria implementada a lógica de envio por email
    // Por enquanto, simula o envio

    // Atualizar status do relatório
    await relatorio.update({
      status: 'enviado',
      destinatarios: destinatarios,
      dataEnvio: new Date()
    });

    res.status(200).json({
      status: 'success',
      message: 'Relatório enviado com sucesso',
      data: {
        relatorioId: id,
        destinatarios: destinatarios.length,
        dataEnvio: new Date()
      }
    });
  } catch (error) {
    logger.error('Erro ao enviar relatório:', error);
    res.status(500).json({
      status: 'error',
      message: 'Erro interno do servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Obtém estatísticas dos relatórios
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

    const estatisticas = await Relatorio.findAll({
      where: filtros,
      attributes: [
        'tipo',
        'status',
        [require('sequelize').fn('COUNT', require('sequelize').col('id')), 'quantidade']
      ],
      group: ['tipo', 'status']
    });

    // Processar estatísticas
    const statsProcessadas = {
      total: 0,
      porTipo: {},
      porStatus: {}
    };

    estatisticas.forEach(stat => {
      const { tipo, status, quantidade } = stat.dataValues;
      statsProcessadas.total += parseInt(quantidade);

      if (!statsProcessadas.porTipo[tipo]) {
        statsProcessadas.porTipo[tipo] = 0;
      }
      statsProcessadas.porTipo[tipo] += parseInt(quantidade);

      if (!statsProcessadas.porStatus[status]) {
        statsProcessadas.porStatus[status] = 0;
      }
      statsProcessadas.porStatus[status] += parseInt(quantidade);
    });

    res.status(200).json({
      status: 'success',
      data: statsProcessadas
    });
  } catch (error) {
    logger.error('Erro ao obter estatísticas dos relatórios:', error);
    res.status(500).json({
      status: 'error',
      message: 'Erro interno do servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

module.exports = {
  listarRelatorios,
  obterRelatorio,
  criarRelatorio,
  atualizarRelatorio,
  excluirRelatorio,
  gerarRelatorioAutomatico,
  downloadRelatorio,
  enviarRelatorio,
  obterEstatisticas
};