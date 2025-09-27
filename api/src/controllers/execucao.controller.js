const { Execucao, Orcamento, Receita, Custo, Ativo, Usuario } = require('../models');
const { Op } = require('sequelize');

/**
 * Lista todas as execuções com filtros opcionais
 */
exports.listarExecucoes = async (req, res) => {
  try {
    const {
      orcamentoId,
      tipo,
      status,
      dataInicio,
      dataFim,
      pagina = 1,
      limite = 10,
      ordenarPor = 'dataExecucao',
      ordem = 'DESC'
    } = req.query;

    const where = {};
    if (orcamentoId) where.orcamentoId = orcamentoId;
    if (tipo) where.tipo = tipo;
    if (status) where.status = status;
    if (dataInicio || dataFim) {
      where.dataExecucao = {};
      if (dataInicio) where.dataExecucao[Op.gte] = new Date(dataInicio);
      if (dataFim) where.dataExecucao[Op.lte] = new Date(dataFim);
    }

    const offset = (pagina - 1) * limite;

    const { count, rows: execucoes } = await Execucao.findAndCountAll({
      where,
      include: [
        {
          model: Orcamento,
          as: 'orcamento',
          attributes: ['id', 'nome', 'ano']
        },
        {
          model: Usuario,
          as: 'executor',
          attributes: ['id', 'nome']
        },
        {
          model: Usuario,
          as: 'aprovador',
          attributes: ['id', 'nome']
        }
      ],
      order: [[ordenarPor, ordem.toUpperCase()]],
      limit: parseInt(limite),
      offset: parseInt(offset)
    });

    res.json({
      success: true,
      data: execucoes,
      meta: {
        total: count,
        pagina: parseInt(pagina),
        limite: parseInt(limite),
        totalPaginas: Math.ceil(count / limite)
      }
    });
  } catch (error) {
    console.error('Erro ao listar execuções:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

/**
 * Obtém uma execução específica
 */
exports.obterExecucao = async (req, res) => {
  try {
    const { id } = req.params;

    const execucao = await Execucao.findByPk(id, {
      include: [
        {
          model: Orcamento,
          as: 'orcamento',
          attributes: ['id', 'nome', 'ano', 'status']
        },
        {
          model: Receita,
          as: 'receita',
          required: false,
          attributes: ['id', 'nome', 'valor']
        },
        {
          model: Custo,
          as: 'custo',
          required: false,
          attributes: ['id', 'nome', 'valor']
        },
        {
          model: Ativo,
          as: 'ativo',
          required: false,
          attributes: ['id', 'nome', 'valor']
        },
        {
          model: Usuario,
          as: 'executor',
          attributes: ['id', 'nome']
        },
        {
          model: Usuario,
          as: 'aprovador',
          attributes: ['id', 'nome']
        }
      ]
    });

    if (!execucao) {
      return res.status(404).json({
        success: false,
        message: 'Execução não encontrada'
      });
    }

    res.json({
      success: true,
      data: execucao
    });
  } catch (error) {
    console.error('Erro ao obter execução:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

/**
 * Cria uma nova execução
 */
exports.criarExecucao = async (req, res) => {
  try {
    const {
      orcamentoId,
      tipo,
      itemId,
      valorExecutado,
      dataExecucao,
      observacoes
    } = req.body;

    // Verificar se o orçamento existe e está aprovado
    const orcamento = await Orcamento.findByPk(orcamentoId);
    if (!orcamento) {
      return res.status(404).json({
        success: false,
        message: 'Orçamento não encontrado'
      });
    }

    if (orcamento.status !== 'aprovado') {
      return res.status(400).json({
        success: false,
        message: 'Só é possível executar orçamentos aprovados'
      });
    }

    // Verificar se o item existe
    let item;
    if (tipo === 'receita') {
      item = await Receita.findOne({ where: { id: itemId, orcamentoId } });
    } else if (tipo === 'custo') {
      item = await Custo.findOne({ where: { id: itemId, orcamentoId } });
    } else if (tipo === 'ativo') {
      item = await Ativo.findOne({ where: { id: itemId, orcamentoId } });
    }

    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Item não encontrado no orçamento'
      });
    }

    const execucao = await Execucao.create({
      orcamentoId,
      tipo,
      itemId,
      valorExecutado,
      dataExecucao: new Date(dataExecucao),
      observacoes,
      executadoPor: req.user.id
    });

    const execucaoCompleta = await Execucao.findByPk(execucao.id, {
      include: [
        {
          model: Orcamento,
          as: 'orcamento',
          attributes: ['id', 'nome', 'ano']
        },
        {
          model: Usuario,
          as: 'executor',
          attributes: ['id', 'nome']
        }
      ]
    });

    res.status(201).json({
      success: true,
      data: execucaoCompleta,
      message: 'Execução criada com sucesso'
    });
  } catch (error) {
    console.error('Erro ao criar execução:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

/**
 * Atualiza uma execução
 */
exports.atualizarExecucao = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      valorExecutado,
      dataExecucao,
      observacoes,
      status
    } = req.body;

    const execucao = await Execucao.findByPk(id);
    if (!execucao) {
      return res.status(404).json({
        success: false,
        message: 'Execução não encontrada'
      });
    }

    // Só permitir atualização se estiver pendente
    if (execucao.status !== 'pendente') {
      return res.status(400).json({
        success: false,
        message: 'Não é possível atualizar execuções já processadas'
      });
    }

    await execucao.update({
      valorExecutado: valorExecutado || execucao.valorExecutado,
      dataExecucao: dataExecucao ? new Date(dataExecucao) : execucao.dataExecucao,
      observacoes: observacoes !== undefined ? observacoes : execucao.observacoes,
      status: status || execucao.status
    });

    const execucaoAtualizada = await Execucao.findByPk(id, {
      include: [
        {
          model: Orcamento,
          as: 'orcamento',
          attributes: ['id', 'nome', 'ano']
        },
        {
          model: Usuario,
          as: 'executor',
          attributes: ['id', 'nome']
        }
      ]
    });

    res.json({
      success: true,
      data: execucaoAtualizada,
      message: 'Execução atualizada com sucesso'
    });
  } catch (error) {
    console.error('Erro ao atualizar execução:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

/**
 * Exclui uma execução
 */
exports.excluirExecucao = async (req, res) => {
  try {
    const { id } = req.params;

    const execucao = await Execucao.findByPk(id);
    if (!execucao) {
      return res.status(404).json({
        success: false,
        message: 'Execução não encontrada'
      });
    }

    // Só permitir exclusão se estiver pendente
    if (execucao.status !== 'pendente') {
      return res.status(400).json({
        success: false,
        message: 'Não é possível excluir execuções já processadas'
      });
    }

    await execucao.destroy();

    res.json({
      success: true,
      message: 'Execução excluída com sucesso'
    });
  } catch (error) {
    console.error('Erro ao excluir execução:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

/**
 * Aprova uma execução
 */
exports.aprovarExecucao = async (req, res) => {
  try {
    const { id } = req.params;
    const { observacoes } = req.body;

    const execucao = await Execucao.findByPk(id);
    if (!execucao) {
      return res.status(404).json({
        success: false,
        message: 'Execução não encontrada'
      });
    }

    if (execucao.status !== 'pendente') {
      return res.status(400).json({
        success: false,
        message: 'Execução já foi processada'
      });
    }

    await execucao.update({
      status: 'aprovado',
      aprovadoPor: req.user.id,
      aprovadoEm: new Date(),
      observacoes: observacoes || execucao.observacoes
    });

    res.json({
      success: true,
      message: 'Execução aprovada com sucesso'
    });
  } catch (error) {
    console.error('Erro ao aprovar execução:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

/**
 * Rejeita uma execução
 */
exports.rejeitarExecucao = async (req, res) => {
  try {
    const { id } = req.params;
    const { motivo } = req.body;

    const execucao = await Execucao.findByPk(id);
    if (!execucao) {
      return res.status(404).json({
        success: false,
        message: 'Execução não encontrada'
      });
    }

    if (execucao.status !== 'pendente') {
      return res.status(400).json({
        success: false,
        message: 'Execução já foi processada'
      });
    }

    await execucao.update({
      status: 'rejeitado',
      observacoes: motivo
    });

    res.json({
      success: true,
      message: 'Execução rejeitada com sucesso'
    });
  } catch (error) {
    console.error('Erro ao rejeitar execução:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

/**
 * Obtém estatísticas das execuções
 */
exports.obterEstatisticas = async (req, res) => {
  try {
    const { orcamentoId, dataInicio, dataFim } = req.query;

    const where = {};
    if (orcamentoId) where.orcamentoId = orcamentoId;
    if (dataInicio || dataFim) {
      where.dataExecucao = {};
      if (dataInicio) where.dataExecucao[Op.gte] = new Date(dataInicio);
      if (dataFim) where.dataExecucao[Op.lte] = new Date(dataFim);
    }

    const estatisticas = await Execucao.findAll({
      where,
      attributes: [
        'tipo',
        'status',
        [require('sequelize').fn('COUNT', require('sequelize').col('id')), 'total'],
        [require('sequelize').fn('SUM', require('sequelize').col('valorExecutado')), 'valorTotal']
      ],
      group: ['tipo', 'status'],
      raw: true
    });

    res.json({
      success: true,
      data: estatisticas
    });
  } catch (error) {
    console.error('Erro ao obter estatísticas:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};