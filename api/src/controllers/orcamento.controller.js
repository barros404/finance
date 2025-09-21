/**
 * Controlador de Orçamentos - EndiAgro FinancePro
 * 
 * Este controlador gerencia todas as operações relacionadas a orçamentos,
 * incluindo CRUD completo, validações e integração com o frontend.
 * 
 * @author EndiAgro Development Team
 * @version 1.0.0
 */

const { Orcamento, Receita, Custo, Ativo, Usuario, Empresa } = require('../models');
const { Op } = require('sequelize');
const logger = require('../utils/logger');
const { constants, errorMessages, successMessages } = require('../config/api.config');
const { Console } = require('winston/lib/winston/transports');



/**
 * Lista todos os orçamentos com filtros e paginação
 * @route GET /api/orcamentos
 */
exports.listarOrcamentos = async (req, res, next) => {
  try {
    const { 
      status, 
      busca, 
      pagina = 1, 
      limite = 10,
      dataInicio,
      dataFim,
      ordenarPor = 'ano',
      ordem = 'DESC'
    } = req.query;
    
    const offset = (pagina - 1) * limite;
    
    // Construir filtros
    const where = {
      empresaId: req.usuario.empresaId
    };
    
    if (status) {
      where.status = status;
    }
    
    if (busca) {
      where[Op.or] = [
        { nome: { [Op.iLike]: `%${busca}%` } },
        { descricao: { [Op.iLike]: `%${busca}%` } }
      ];
    }
    
    if (dataInicio && dataFim) {
      where.dataInicio = {
        [Op.between]: [dataInicio, dataFim]
      };
    }
    
    // Buscar orçamentos
    const { count, rows: orcamentos } = await Orcamento.findAndCountAll({
      where,
      limit: parseInt(limite),
      offset: parseInt(offset),
      order: [[ordenarPor, ordem.toUpperCase()]],
      include: [
        {
          model: Receita,
          as: 'receitas',
          attributes: ['id', 'descricao', 'valor', 'quantidade', 'precoUnitario']
        },
        {
          model: Custo,
          as: 'custos',
          attributes: ['id', 'nome', 'descricao', 'tipoCusto', 'valor', 'quantidade', 'custoUnitario', 'frequencia', 'cargo', 'tipoContratacao', 'salario']
        },
        {
          model: Ativo,
          as: 'ativos',
          attributes: ['id', 'nome', 'valor', 'tipo']
        },
        {
          model: Usuario,
          as: 'criador',
          attributes: ['id', 'nome', 'email']
        }
      ]
    });
    
    // Calcular totais para cada orçamento
    const orcamentosComTotais = orcamentos.map(orcamento => {
      const orcamentoJson = orcamento.toJSON();
      
      const totalReceita = orcamentoJson.receitas.reduce((sum, rev) => sum + parseFloat(rev.valor || 0), 0);
      const totalCusto = orcamentoJson.custos.reduce((sum, cost) => sum + parseFloat(cost.valor || 0), 0);
      const totalAtivos = orcamentoJson.ativos.reduce((sum, asset) => sum + parseFloat(asset.valor || 0), 0);
      const resultadoLiquido = totalReceita - totalCusto;
      const margem = totalReceita > 0 ? (resultadoLiquido / totalReceita) * 100 : 0;
      
      return {
        ...orcamentoJson,
        totalReceita: parseFloat(totalReceita.toFixed(2)),
        totalCusto: parseFloat(totalCusto.toFixed(2)),
        totalAtivos: parseFloat(totalAtivos.toFixed(2)),
        resultadoLiquido: parseFloat(resultadoLiquido.toFixed(2)),
        margem: parseFloat(margem.toFixed(2))
      };
    });
    
    res.status(200).json({
      status: 'success',
      message: successMessages.RETRIEVED,
      data: {
        orcamentos: orcamentosComTotais,
        pagination: {
          currentPage: parseInt(pagina),
          totalPages: Math.ceil(count / limite),
          totalItems: count,
          itemsPerPage: parseInt(limite)
        }
      }
    });
  } catch (error) {
    logger.error(`Erro ao listar orçamentos: ${error.message}`, { error, userId: req.usuario?.id });
    next(error);
  }
};

/**
 * Cria um orçamento completo a partir do formulário do frontend
 * @route POST /api/orcamentos/novo-orcamento
 */
exports.criarOrcamentoCompleto = async (req, res, next) => {
  const transaction = await Orcamento.sequelize.transaction();
  
  try {
    const { 
      nome,
      descricao,
      ano,
      observacoes,
      receitas = [],
      custos = { materials: [], services: [], personnel: [], fixed: [] },
      ativos = [],
      sazonalidade = { hasSeasonality: false, months: [] }
    } = req.body;

    console.log('Dados recebidos para orçamento:', {
      nome, descricao, ano, observacoes,
      receitasCount: receitas.length,
      materialsCount: custos.materials.length,
      servicesCount: custos.services.length,
      personnelCount: custos.personnel.length,
      fixedCount: custos.fixed.length
    });

    // 1. Criar o orçamento base
    const orcamento = await Orcamento.create({
      nome: nome || 'Novo Orçamento',
      descricao: descricao || '',
      ano: ano || new Date().getFullYear(),
     // dataInicio: new Date(ano || new Date().getFullYear(), 0, 1),
     // dataFim: new Date(ano || new Date().getFullYear(), 11, 31),
      moeda: 'AOA',
      temSazonalidade: sazonalidade.hasSeasonality || false,
      mesesSazonais: sazonalidade.months || Array(12).fill({ percentual: 8.33 }),
      observacoes: observacoes || '',
      empresaId: req.usuario.empresaId,
      criadoPor: req.usuario.id,
      status: constants.BUDGET_STATUS.DRAFT
    }, { transaction });

    // 2. Adicionar receitas
    const receitasCriadas = await Promise.all(
      receitas.map(receita => 
        Receita.create({
          nome: receita.description || 'Nova Receita',
          descricao: receita.description || 'Adicionada via formulário de orçamento',
          categoria: 'venda',
          quantidade: receita.quantity || 0,
          precoUnitario: receita.unitPrice || 0,
          valor: receita.total || (receita.quantity || 0) * (receita.unitPrice || 0),
          orcamentoId: orcamento.id,
          empresaId: req.usuario.empresaId,
          usuarioId: req.usuario.id
        }, { transaction })
      )
    );

    // 3. Adicionar custos por tipo - NOVA ESTRUTURA
    const custosCriados = [];
    
    // Função para mapear custos do frontend para o banco
    const mapearCusto = (tipo, item) => {
      const baseCusto = {
        tipoCusto: tipo,
        orcamentoId: orcamento.id,
        empresaId: req.usuario.empresaId,
        usuarioId: req.usuario.id,
        mes: item.mes || 1, // Mês padrão se não especificado
        frequencia: item.frequency || 'Mensal'
      };

      switch (tipo) {
        case 'material':
        case 'servico':
        case 'fixo':
          return {
            ...baseCusto,
            nome: item.description || `Custo ${tipo}`,
            descricao: item.description || '',
            quantidade: item.quantity || 1,
            custoUnitario: item.unitCost || 0,
            valor: item.total || (item.quantity || 0) * (item.unitCost || 0)
          };

        case 'pessoal':
          return {
            ...baseCusto,
            nome: item.role || `Custo ${tipo}`,
            cargo: item.role || '',
            quantidade: item.quantity || 1,
            salario: item.salary || 0,
            tipoContratacao: item.type || 'Permanente',
            valor: item.total || (item.quantity || 0) * (item.salary || 0)
          };

        default:
          return baseCusto;
      }
    };

    // Processar cada tipo de custo
    const processarCustos = async (tipo, itens) => {
      return Promise.all(
        itens.map(item => 
          Custo.create(mapearCusto(tipo, item), { transaction })
        )
      );
    };

    // Adicionar custos de cada tipo
    const [materiais, servicos, pessoal, fixos] = await Promise.all([
      processarCustos('material', custos.materials || []),
      processarCustos('servico', custos.services || []),
      processarCustos('pessoal', custos.personnel || []),
      processarCustos('fixo', custos.fixed || [])
    ]);

    custosCriados.push(...materiais, ...servicos, ...pessoal, ...fixos);

    // 4. Adicionar ativos (se houver)
    const ativosCriados = await Promise.all(
      (ativos || []).map(ativo => 
        Ativo.create({
          nome: ativo.description || 'Novo Ativo',
          descricao: ativo.description || 'Adicionado via formulário de orçamento',
          valor: ativo.value || 0,
          tipo: ativo.type || 'outros',
          vidaUtil: ativo.usefulLife || 5,
          orcamentoId: orcamento.id,
          empresaId: req.usuario.empresaId,
          usuarioId: req.usuario.id
        }, { transaction })
      )
    );

    // 5. Calcular e atualizar totais do orçamento
    const receitaTotal = receitasCriadas.reduce((sum, r) => sum + parseFloat(r.valor || 0), 0);
    const custoTotal = custosCriados.reduce((sum, c) => sum + parseFloat(c.valor || 0), 0);
    const resultadoLiquido = receitaTotal - custoTotal;
    const margem = receitaTotal > 0 ? (resultadoLiquido / receitaTotal) * 100 : 0;

    await orcamento.update({
      receitaTotal: parseFloat(receitaTotal.toFixed(2)),
      custoTotal: parseFloat(custoTotal.toFixed(2)),
      resultadoLiquido: parseFloat(resultadoLiquido.toFixed(2)),
      margem: parseFloat(margem.toFixed(2))
    }, { transaction });

    await transaction.commit();

    // Buscar o orçamento completo com os dados atualizados
    const orcamentoCompleto = await Orcamento.findByPk(orcamento.id, {
      include: [
        { 
          model: Receita, 
          as: 'receitas',
          attributes: ['id', 'nome', 'descricao', 'quantidade', 'precoUnitario', 'valor', 'categoria']
        },
        { 
          model: Custo, 
          as: 'custos',
          attributes: ['id', 'nome', 'descricao', 'tipoCusto', 'quantidade', 'custoUnitario', 'salario', 'valor', 'frequencia', 'cargo', 'tipoContratacao']
        },
        { 
          model: Ativo, 
          as: 'ativos',
          attributes: ['id', 'nome', 'descricao', 'valor', 'tipo', 'vidaUtil']
        }
      ]
    });

    logger.info(`Orçamento criado com sucesso: ${orcamento.id}`, {
      userId: req.usuario.id,
      empresaId: req.usuario.empresaId,
      receitas: receitasCriadas.length,
      custos: custosCriados.length,
      ativos: ativosCriados.length
    });

    res.status(201).json({
      status: 'success',
      message: successMessages.CREATED,
      data: {
        orcamento: orcamentoCompleto
      }
    });

  } catch (error) {
    await transaction.rollback();
    logger.error(`Erro ao criar orçamento completo: ${error.message}`, { 
      error, 
      userId: req.usuario?.id,
      body: req.body 
    });
    next(error);
  }
};

/**
 * Obtém um orçamento específico por ID
 * @route GET /api/orcamentos/:id
 */
exports.obterOrcamento = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    const orcamento = await Orcamento.findOne({
      where: {
        id,
        empresaId: req.usuario.empresaId
      },
      include: [
        {
          model: Receita,
          as: 'receitas',
          attributes: ['id', 'descricao', 'valor', 'quantidade', 'precoUnitario']
        },
        {
          model: Custo,
          as: 'custos',
          attributes: ['id', 'nome', 'descricao', 'tipoCusto', 'valor', 'quantidade', 'custoUnitario', 'frequencia', 'cargo', 'tipoContratacao', 'salario']
        },
        {
          model: Ativo,
          as: 'ativos',
          attributes: ['id', 'nome', 'valor', 'tipo']
        },
        {
          model: Usuario,
          as: 'criador',
          attributes: ['id', 'nome', 'email']
        }
      ]
    });
    
    if (!orcamento) {
      return res.status(404).json({
        status: 'error',
        message: errorMessages.RESOURCE.NOT_FOUND
      });
    }
    
    // Calcular totais
    const orcamentoJson = orcamento.toJSON();
    const totalReceita = orcamentoJson.receitas.reduce((sum, rev) => sum + parseFloat(rev.valor || 0), 0);
    const totalCusto = orcamentoJson.custos.reduce((sum, cost) => sum + parseFloat(cost.valor || 0), 0);
    const totalAtivos = orcamentoJson.ativos.reduce((sum, asset) => sum + parseFloat(asset.valor || 0), 0);
    const resultadoLiquido = totalReceita - totalCusto;
    const margem = totalReceita > 0 ? (resultadoLiquido / totalReceita) * 100 : 0;
    
    const response = {
      ...orcamentoJson,
      totalReceita: parseFloat(totalReceita.toFixed(2)),
      totalCusto: parseFloat(totalCusto.toFixed(2)),
      totalAtivos: parseFloat(totalAtivos.toFixed(2)),
      resultadoLiquido: parseFloat(resultadoLiquido.toFixed(2)),
      margem: parseFloat(margem.toFixed(2))
    };
    
    res.status(200).json({
      status: 'success',
      message: successMessages.RETRIEVED,
      data: {
        orcamento: response
      }
    });
  } catch (error) {
    logger.error(`Erro ao obter orçamento: ${error.message}`, { error, userId: req.usuario?.id, orcamentoId: req.params.id });
    next(error);
  }
};


/**
 * Cria um novo orçamento
 * @route POST /api/orcamentos
 */
exports.criarOrcamento = async (req, res, next) => {
  const transaction = await Orcamento.sequelize.transaction();
  
  try {
    const { 
      nome, 
      descricao, 
      dataInicio, 
      dataFim, 
      moeda = 'AOA',
      temSazonalidade = false,
      mesesSazonais = [],
      observacoes,
      receitas = [],
      custos = [],
      ativos = []
    } = req.body;
    
    // Criar o orçamento base
    const orcamento = await Orcamento.create({
      nome,
      descricao,
      dataInicio,
      dataFim,
      moeda,
      temSazonalidade,
      mesesSazonais,
      observacoes,
      empresaId: req.usuario.empresaId,
      usuarioId: req.usuario.id,
      status: constants.BUDGET_STATUS.DRAFT
    }, { transaction });
    
    // Adicionar receitas se fornecidas
    if (receitas && receitas.length > 0) {
      await Promise.all(
        receitas.map(receita => 
          Receita.create({
            nome: receita.nome || receita.descricao,
            descricao: receita.descricao || '',
            categoria: receita.categoria || 'venda',
            quantidade: receita.quantidade || 1,
            precoUnitario: receita.precoUnitario || receita.unitPrice || 0,
            valor: receita.valor || receita.total || 0,
            orcamentoId: orcamento.id,
            empresaId: req.usuario.empresaId,
            usuarioId: req.usuario.id
          }, { transaction })
        )
      );
    }
    
    // Adicionar custos se fornecidos
    if (custos && custos.length > 0) {
      await Promise.all(
        custos.map(custo => 
          Custo.create({
            nome: custo.nome || custo.descricao,
            descricao: custo.descricao || '',
            tipo: custo.tipo || 'material',
            valor: custo.valor || custo.total || 0,
            quantidade: custo.quantidade || 1,
            precoUnitario: custo.precoUnitario || custo.unitCost || 0,
            orcamentoId: orcamento.id,
            empresaId: req.usuario.empresaId,
            usuarioId: req.usuario.id
          }, { transaction })
        )
      );
    }
    
    // Adicionar ativos se fornecidos
    if (ativos && ativos.length > 0) {
      await Promise.all(
        ativos.map(ativo => 
          Ativo.create({
            nome: ativo.nome || ativo.descricao,
            descricao: ativo.descricao || '',
            valor: ativo.valor || 0,
            tipo: ativo.tipo || 'outro',
            vidaUtil: ativo.vidaUtil || 5,
            orcamentoId: orcamento.id,
            empresaId: req.usuario.empresaId,
            usuarioId: req.usuario.id
          }, { transaction })
        )
      );
    }
    
    await transaction.commit();
    
    // Buscar o orçamento criado com relacionamentos
    const orcamentoCompleto = await Orcamento.findByPk(orcamento.id, {
      include: [
        { model: Receita, as: 'receitas' },
        { model: Custo, as: 'custos' },
        { model: Ativo, as: 'ativos' }
      ]
    });
    
    res.status(201).json({
      status: 'success',
      message: successMessages.CREATED,
      data: {
        orcamento: orcamentoCompleto
      }
    });
  } catch (error) {
    await transaction.rollback();
    logger.error(`Erro ao criar orçamento: ${error.message}`, { error, userId: req.usuario?.id });
    next(error);
  }
};


/**
 * Atualiza um orçamento existente
 * @route PATCH /api/orcamentos/:id
 */
exports.atualizarOrcamento = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { 
      nome, 
      descricao, 
      dataInicio, 
      dataFim, 
      status, 
      temSazonalidade, 
      mesesSazonais,
      observacoes 
    } = req.body;
    
    const orcamento = await Orcamento.findOne({
      where: {
        id,
        empresaId: req.usuario.empresaId
      }
    });
    
    if (!orcamento) {
      return res.status(404).json({
        status: 'error',
        message: errorMessages.RESOURCE.NOT_FOUND
      });
    }
    
    // Atualizar campos
    if (nome) orcamento.nome = nome;
    if (descricao !== undefined) orcamento.descricao = descricao;
    if (dataInicio) orcamento.dataInicio = dataInicio;
    if (dataFim) orcamento.dataFim = dataFim;
    if (status) orcamento.status = status;
    if (temSazonalidade !== undefined) orcamento.temSazonalidade = temSazonalidade;
    if (mesesSazonais) orcamento.mesesSazonais = mesesSazonais;
    if (observacoes !== undefined) orcamento.observacoes = observacoes;
    
    await orcamento.save();
    
    res.status(200).json({
      status: 'success',
      message: successMessages.UPDATED,
      data: {
        orcamento
      }
    });
  } catch (error) {
    logger.error(`Erro ao atualizar orçamento: ${error.message}`, { error, userId: req.usuario?.id, orcamentoId: req.params.id });
    next(error);
  }
};

/**
 * Exclui um orçamento
 * @route DELETE /api/orcamentos/:id
 */
exports.excluirOrcamento = async (req, res, next) => {
  const transaction = await Orcamento.sequelize.transaction();
  
  try {
    const { id } = req.params;
    
    const orcamento = await Orcamento.findOne({
      where: {
        id,
        empresaId: req.usuario.empresaId
      }
    });
    
    if (!orcamento) {
      return res.status(404).json({
        status: 'error',
        message: errorMessages.RESOURCE.NOT_FOUND
      });
    }
    
    // Excluir registros relacionados
    await Receita.destroy({
      where: { orcamentoId: id },
      transaction
    });
    
    await Custo.destroy({
      where: { orcamentoId: id },
      transaction
    });
    
    await Ativo.destroy({
      where: { orcamentoId: id },
      transaction
    });
    
    // Excluir o orçamento
    await orcamento.destroy({ transaction });
    
    await transaction.commit();
    
    res.status(204).json({
      status: 'success',
      message: successMessages.DELETED,
      data: null
    });
  } catch (error) {
    await transaction.rollback();
    logger.error(`Erro ao excluir orçamento: ${error.message}`, { error, userId: req.usuario?.id, orcamentoId: req.params.id });
    next(error);
  }
};

/**
 * Aprova um orçamento
 * @route PATCH /api/orcamentos/:id/aprovar
 */
exports.aprovarOrcamento = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { observacoes } = req.body;
    
    const orcamento = await Orcamento.findOne({
      where: {
        id,
        empresaId: req.usuario.empresaId
      }
    });
    
    if (!orcamento) {
      return res.status(404).json({
        status: 'error',
        message: errorMessages.RESOURCE.NOT_FOUND
      });
    }
    
    orcamento.status = constants.BUDGET_STATUS.APPROVED;
    orcamento.aprovadoPor = req.usuario.id;
    orcamento.dataAprovacao = new Date();
    if (observacoes) orcamento.observacoesAprovacao = observacoes;
    
    await orcamento.save();
    
    res.status(200).json({
      status: 'success',
      message: 'Orçamento aprovado com sucesso',
      data: {
        orcamento
      }
    });
  } catch (error) {
    logger.error(`Erro ao aprovar orçamento: ${error.message}`, { error, userId: req.usuario?.id, orcamentoId: req.params.id });
    next(error);
  }
};

/**
 * Rejeita um orçamento
 * @route PATCH /api/orcamentos/:id/rejeitar
 */
exports.rejeitarOrcamento = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { motivo } = req.body;
    
    const orcamento = await Orcamento.findOne({
      where: {
        id,
        empresaId: req.usuario.empresaId
      }
    });
    
    if (!orcamento) {
      return res.status(404).json({
        status: 'error',
        message: errorMessages.RESOURCE.NOT_FOUND
      });
    }
    
    orcamento.status = constants.BUDGET_STATUS.REJECTED;
    orcamento.rejeitadoPor = req.usuario.id;
    orcamento.dataRejeicao = new Date();
    orcamento.motivoRejeicao = motivo;
    
    await orcamento.save();
    
    res.status(200).json({
      status: 'success',
      message: 'Orçamento rejeitado',
      data: {
        orcamento
      }
    });
  } catch (error) {
    logger.error(`Erro ao rejeitar orçamento: ${error.message}`, { error, userId: req.usuario?.id, orcamentoId: req.params.id });
    next(error);
  }
};

/**
 * Obtém estatísticas dos orçamentos
 * @route GET /api/orcamentos/estatisticas
 */
exports.obterEstatisticas = async (req, res, next) => {
  try {
    const { dataInicio, dataFim } = req.query;
    
    const where = {
      empresaId: req.usuario.empresaId
    };
    
    if (dataInicio && dataFim) {
      where.dataInicio = {
        [Op.between]: [dataInicio, dataFim]
      };
    }
    
    const orcamentos = await Orcamento.findAll({
      where,
      include: [
        { model: Receita, as: 'receitas' },
        { model: Custo, as: 'custos' }
      ]
    });
    
    const estatisticas = {
      total: orcamentos.length,
      porStatus: {},
      receitaTotal: 0,
      custoTotal: 0,
      margemMedia: 0
    };
    
    let totalMargem = 0;
    
    orcamentos.forEach(orcamento => {
      const orcamentoJson = orcamento.toJSON();
      const receita = orcamentoJson.receitas.reduce((sum, r) => sum + parseFloat(r.valor || 0), 0);
      const custo = orcamentoJson.custos.reduce((sum, c) => sum + parseFloat(c.valor || 0), 0);
      const margem = receita > 0 ? ((receita - custo) / receita) * 100 : 0;
      
      estatisticas.receitaTotal += receita;
      estatisticas.custoTotal += custo;
      totalMargem += margem;
      
      if (!estatisticas.porStatus[orcamento.status]) {
        estatisticas.porStatus[orcamento.status] = 0;
      }
      estatisticas.porStatus[orcamento.status]++;
    });
    
    estatisticas.margemMedia = orcamentos.length > 0 ? totalMargem / orcamentos.length : 0;
    estatisticas.resultadoLiquido = estatisticas.receitaTotal - estatisticas.custoTotal;
    
    res.status(200).json({
      status: 'success',
      message: successMessages.RETRIEVED,
      data: {
        estatisticas
      }
    });
  } catch (error) {
    logger.error(`Erro ao obter estatísticas: ${error.message}`, { error, userId: req.usuario?.id });
    next(error);
  }
};
