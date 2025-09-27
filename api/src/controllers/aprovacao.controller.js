/**
 * Controlador de Aprovação - EndiAgro FinancePro
 *
 * Este arquivo contém a lógica de negócio para o sistema unificado de aprovação.
 *
 * @author António Emiliano Barros
 * @version 1.0.0
 */

const { Orcamento, PlanoTesouraria, Execucao, Usuario } = require('../models');
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
  if (query.departamento) filtros.departamento = query.departamento;
  if (query.busca) {
    filtros[require('sequelize').Op.or] = [
      { nome: { [require('sequelize').Op.iLike]: `%${query.busca}%` } },
      { descricao: { [require('sequelize').Op.iLike]: `%${query.busca}%` } }
    ];
  }

  return filtros;
};

/**
 * Busca item por tipo e ID
 */
const buscarItemPorTipo = async (tipo, itemId) => {
  let Model;
  switch (tipo) {
    case 'orcamento':
      Model = Orcamento;
      break;
    case 'tesouraria':
      Model = PlanoTesouraria;
      break;
    case 'execucao':
      Model = Execucao;
      break;
    default:
      throw new Error('Tipo de item inválido');
  }

  const item = await Model.findByPk(itemId, {
    include: [
      {
        model: Usuario,
        as: 'criadoPor',
        attributes: ['id', 'nome', 'email']
      }
    ]
  });

  if (!item) {
    throw new Error('Item não encontrado');
  }

  return { item, Model };
};

/**
 * Verifica permissões de aprovação
 */
const verificarPermissaoAprovacao = (user, item) => {
  // Lógica de permissões - pode ser expandida
  if (user.perfil === 'admin') return true;
  if (user.perfil === 'gestor' && user.departamento === item.departamento) return true;

  // Verificações específicas por valor/tipo podem ser adicionadas aqui
  return false;
};

/**
 * ========================================
 * CONTROLADORES
 * ========================================
 */

/**
 * Lista itens pendentes de aprovação
 */
const listarItensPendentes = async (req, res) => {
  try {
    const {
      pagina = 1,
      limite = 20,
      ordenarPor = 'createdAt',
      ordem = 'DESC',
      ...filtrosQuery
    } = req.query;

    const offset = (pagina - 1) * limite;

    // Buscar itens pendentes de diferentes módulos
    const filtros = montarFiltros(filtrosQuery);

    const [orcamentos, planosTesouraria, execucoes] = await Promise.all([
      Orcamento.findAll({
        where: { ...filtros, status: 'pendente' },
        include: [{ model: Usuario, as: 'criadoPor', attributes: ['id', 'nome', 'email'] }],
        limit: limite,
        offset: offset,
        order: [[ordenarPor, ordem]]
      }),
      PlanoTesouraria.findAll({
        where: { ...filtros, status: 'pendente' },
        include: [{ model: Usuario, as: 'criadoPor', attributes: ['id', 'nome', 'email'] }],
        limit: limite,
        offset: offset,
        order: [[ordenarPor, ordem]]
      }),
      Execucao.findAll({
        where: { ...filtros, status: 'pendente' },
        include: [{ model: Usuario, as: 'criadoPor', attributes: ['id', 'nome', 'email'] }],
        limit: limite,
        offset: offset,
        order: [[ordenarPor, ordem]]
      })
    ]);

    // Combinar e formatar resultados
    const itensPendentes = [
      ...orcamentos.map(item => ({ ...item.toJSON(), tipo: 'orcamento' })),
      ...planosTesouraria.map(item => ({ ...item.toJSON(), tipo: 'tesouraria' })),
      ...execucoes.map(item => ({ ...item.toJSON(), tipo: 'execucao' }))
    ];

    // Ordenar final
    itensPendentes.sort((a, b) => {
      if (ordem === 'DESC') {
        return new Date(b.createdAt) - new Date(a.createdAt);
      }
      return new Date(a.createdAt) - new Date(b.createdAt);
    });

    // Paginação
    const totalItens = itensPendentes.length;
    const itensPaginados = itensPendentes.slice(0, limite);
    const totalPaginas = Math.ceil(totalItens / limite);

    res.status(200).json({
      status: 'success',
      data: itensPaginados,
      pagination: {
        pagina: parseInt(pagina),
        limite: parseInt(limite),
        totalItens: totalItens,
        totalPaginas: totalPaginas,
        temProxima: pagina < totalPaginas,
        temAnterior: pagina > 1
      }
    });
  } catch (error) {
    logger.error('Erro ao listar itens pendentes:', error);
    res.status(500).json({
      status: 'error',
      message: 'Erro interno do servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Aprova um item
 */
const aprovarItem = async (req, res) => {
  try {
    const { itemId } = req.params;
    const { tipo } = req.query;
    const { observacoes } = req.body;

    const { item, Model } = await buscarItemPorTipo(tipo, itemId);

    // Verificar permissões
    if (!verificarPermissaoAprovacao(req.user, item)) {
      return res.status(403).json({
        status: 'error',
        message: 'Você não tem permissão para aprovar este item'
      });
    }

    // Verificar se já foi processado
    if (item.status !== 'pendente') {
      return res.status(400).json({
        status: 'error',
        message: 'Este item já foi processado'
      });
    }

    // Atualizar item
    await item.update({
      status: 'aprovado',
      dataAprovacao: new Date(),
      aprovadoPor: req.user.id,
      observacoes: observacoes || item.observacoes
    });

    res.status(200).json({
      status: 'success',
      message: `${tipo.charAt(0).toUpperCase() + tipo.slice(1)} aprovado com sucesso`,
      data: item
    });
  } catch (error) {
    logger.error('Erro ao aprovar item:', error);
    res.status(500).json({
      status: 'error',
      message: 'Erro interno do servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Rejeita um item
 */
const rejeitarItem = async (req, res) => {
  try {
    const { itemId } = req.params;
    const { tipo } = req.query;
    const { motivo } = req.body;

    const { item, Model } = await buscarItemPorTipo(tipo, itemId);

    // Verificar permissões
    if (!verificarPermissaoAprovacao(req.user, item)) {
      return res.status(403).json({
        status: 'error',
        message: 'Você não tem permissão para rejeitar este item'
      });
    }

    // Verificar se já foi processado
    if (item.status !== 'pendente') {
      return res.status(400).json({
        status: 'error',
        message: 'Este item já foi processado'
      });
    }

    // Atualizar item
    await item.update({
      status: 'rejeitado',
      dataRejeicao: new Date(),
      rejeitadoPor: req.user.id,
      motivoRejeicao: motivo
    });

    res.status(200).json({
      status: 'success',
      message: `${tipo.charAt(0).toUpperCase() + tipo.slice(1)} rejeitado com sucesso`,
      data: item
    });
  } catch (error) {
    logger.error('Erro ao rejeitar item:', error);
    res.status(500).json({
      status: 'error',
      message: 'Erro interno do servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Obtém histórico de aprovações
 */
const obterHistorico = async (req, res) => {
  try {
    const {
      pagina = 1,
      limite = 20,
      ordenarPor = 'dataAprovacao',
      ordem = 'DESC',
      ...filtrosQuery
    } = req.query;

    const offset = (pagina - 1) * limite;

    // Buscar itens aprovados/rejeitados de diferentes módulos
    const filtros = {};
    if (filtrosQuery.tipo) filtros.tipo = filtrosQuery.tipo;
    if (filtrosQuery.status) filtros.status = filtrosQuery.status;
    if (filtrosQuery.dataInicio || filtrosQuery.dataFim) {
      filtros.createdAt = {};
      if (filtrosQuery.dataInicio) filtros.createdAt.$gte = new Date(filtrosQuery.dataInicio);
      if (filtrosQuery.dataFim) filtros.createdAt.$lte = new Date(filtrosQuery.dataFim);
    }

    const [orcamentos, planosTesouraria, execucoes] = await Promise.all([
      Orcamento.findAll({
        where: {
          ...filtros,
          status: { [require('sequelize').Op.in]: ['aprovado', 'rejeitado'] }
        },
        include: [
          { model: Usuario, as: 'criadoPor', attributes: ['id', 'nome', 'email'] },
          { model: Usuario, as: 'aprovadoPor', attributes: ['id', 'nome', 'email'] },
          { model: Usuario, as: 'rejeitadoPor', attributes: ['id', 'nome', 'email'] }
        ],
        limit: limite,
        offset: offset,
        order: [[ordenarPor, ordem]]
      }),
      PlanoTesouraria.findAll({
        where: {
          ...filtros,
          status: { [require('sequelize').Op.in]: ['aprovado', 'rejeitado'] }
        },
        include: [
          { model: Usuario, as: 'criadoPor', attributes: ['id', 'nome', 'email'] },
          { model: Usuario, as: 'aprovadoPor', attributes: ['id', 'nome', 'email'] },
          { model: Usuario, as: 'rejeitadoPor', attributes: ['id', 'nome', 'email'] }
        ],
        limit: limite,
        offset: offset,
        order: [[ordenarPor, ordem]]
      }),
      Execucao.findAll({
        where: {
          ...filtros,
          status: { [require('sequelize').Op.in]: ['aprovado', 'rejeitado'] }
        },
        include: [
          { model: Usuario, as: 'criadoPor', attributes: ['id', 'nome', 'email'] },
          { model: Usuario, as: 'aprovadoPor', attributes: ['id', 'nome', 'email'] },
          { model: Usuario, as: 'rejeitadoPor', attributes: ['id', 'nome', 'email'] }
        ],
        limit: limite,
        offset: offset,
        order: [[ordenarPor, ordem]]
      })
    ]);

    // Combinar resultados
    const historico = [
      ...orcamentos.map(item => ({ ...item.toJSON(), tipo: 'orcamento' })),
      ...planosTesouraria.map(item => ({ ...item.toJSON(), tipo: 'tesouraria' })),
      ...execucoes.map(item => ({ ...item.toJSON(), tipo: 'execucao' }))
    ];

    // Ordenar
    historico.sort((a, b) => {
      const dateA = new Date(a.dataAprovacao || a.dataRejeicao || a.createdAt);
      const dateB = new Date(b.dataAprovacao || b.dataRejeicao || b.createdAt);
      return ordem === 'DESC' ? dateB - dateA : dateA - dateB;
    });

    const totalItens = historico.length;
    const itensPaginados = historico.slice(0, limite);
    const totalPaginas = Math.ceil(totalItens / limite);

    res.status(200).json({
      status: 'success',
      data: itensPaginados,
      pagination: {
        pagina: parseInt(pagina),
        limite: parseInt(limite),
        totalItens: totalItens,
        totalPaginas: totalPaginas,
        temProxima: pagina < totalPaginas,
        temAnterior: pagina > 1
      }
    });
  } catch (error) {
    logger.error('Erro ao obter histórico:', error);
    res.status(500).json({
      status: 'error',
      message: 'Erro interno do servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Obtém estatísticas de aprovação
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

    // Contar por status em cada módulo
    const [orcamentosStats, tesourariaStats, execucoesStats] = await Promise.all([
      Orcamento.findAll({
        where: filtros,
        attributes: [
          'status',
          [require('sequelize').fn('COUNT', require('sequelize').col('id')), 'quantidade']
        ],
        group: ['status']
      }),
      PlanoTesouraria.findAll({
        where: filtros,
        attributes: [
          'status',
          [require('sequelize').fn('COUNT', require('sequelize').col('id')), 'quantidade']
        ],
        group: ['status']
      }),
      Execucao.findAll({
        where: filtros,
        attributes: [
          'status',
          [require('sequelize').fn('COUNT', require('sequelize').col('id')), 'quantidade']
        ],
        group: ['status']
      })
    ]);

    // Processar estatísticas
    const stats = {
      total: 0,
      pendentes: 0,
      aprovados: 0,
      rejeitados: 0,
      porModulo: {
        orcamentos: { pendentes: 0, aprovados: 0, rejeitados: 0 },
        tesouraria: { pendentes: 0, aprovados: 0, rejeitados: 0 },
        execucoes: { pendentes: 0, aprovados: 0, rejeitados: 0 }
      }
    };

    // Processar orçamentos
    orcamentosStats.forEach(stat => {
      const { status, quantidade } = stat.dataValues;
      const qtd = parseInt(quantidade);
      stats.total += qtd;
      if (status === 'pendente') {
        stats.pendentes += qtd;
        stats.porModulo.orcamentos.pendentes += qtd;
      } else if (status === 'aprovado') {
        stats.aprovados += qtd;
        stats.porModulo.orcamentos.aprovados += qtd;
      } else if (status === 'rejeitado') {
        stats.rejeitados += qtd;
        stats.porModulo.orcamentos.rejeitados += qtd;
      }
    });

    // Processar tesouraria
    tesourariaStats.forEach(stat => {
      const { status, quantidade } = stat.dataValues;
      const qtd = parseInt(quantidade);
      stats.total += qtd;
      if (status === 'pendente') {
        stats.pendentes += qtd;
        stats.porModulo.tesouraria.pendentes += qtd;
      } else if (status === 'aprovado') {
        stats.aprovados += qtd;
        stats.porModulo.tesouraria.aprovados += qtd;
      } else if (status === 'rejeitado') {
        stats.rejeitados += qtd;
        stats.porModulo.tesouraria.rejeitados += qtd;
      }
    });

    // Processar execuções
    execucoesStats.forEach(stat => {
      const { status, quantidade } = stat.dataValues;
      const qtd = parseInt(quantidade);
      stats.total += qtd;
      if (status === 'pendente') {
        stats.pendentes += qtd;
        stats.porModulo.execucoes.pendentes += qtd;
      } else if (status === 'aprovado') {
        stats.aprovados += qtd;
        stats.porModulo.execucoes.aprovados += qtd;
      } else if (status === 'rejeitado') {
        stats.rejeitados += qtd;
        stats.porModulo.execucoes.rejeitados += qtd;
      }
    });

    res.status(200).json({
      status: 'success',
      data: stats
    });
  } catch (error) {
    logger.error('Erro ao obter estatísticas:', error);
    res.status(500).json({
      status: 'error',
      message: 'Erro interno do servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Obtém dados para dashboard de aprovação
 */
const obterDashboard = async (req, res) => {
  try {
    // Obter estatísticas gerais
    const stats = await obterEstatisticas(req, { json: (data) => data });

    // Obter itens mais recentes pendentes
    const itensRecentes = await listarItensPendentes({ ...req, query: { ...req.query, limite: 5 } }, { json: (data) => data });

    res.status(200).json({
      status: 'success',
      data: {
        estatisticas: stats.data,
        itensRecentes: itensRecentes.data,
        resumo: {
          necessitaAtencao: stats.data.pendentes > 10,
          taxaAprovacao: stats.data.total > 0 ? (stats.data.aprovados / stats.data.total * 100).toFixed(1) : 0
        }
      }
    });
  } catch (error) {
    logger.error('Erro ao obter dashboard:', error);
    res.status(500).json({
      status: 'error',
      message: 'Erro interno do servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

module.exports = {
  listarItensPendentes,
  aprovarItem,
  rejeitarItem,
  obterHistorico,
  obterEstatisticas,
  obterDashboard
};