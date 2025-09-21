const { Orcamento, Receita, Custo, Ativo, Usuario, Empresa } = require('../models');
const { Op } = require('sequelize');
const logger = require('../utils/logger');

/**
 * Cria um novo orçamento
 * @route POST /api/orcamentos
 */
exports.criarOrcamento = async (req, res, next) => {
  try {
    const { nome, descricao, dataInicio, dataFim, moeda, temSazonalidade, mesesSazonais } = req.body;
    
    const orcamento = await Orcamento.create({
      nome,
      descricao,
      dataInicio,
      dataFim,
      moeda,
      temSazonalidade,
      mesesSazonais,
      empresaId: req.usuario.empresaId,
      usuarioId: req.usuario.id,
      status: 'rascunho'
    });

    res.status(201).json({
      status: 'success',
      data: {
        orcamento
      }
    });
  } catch (error) {
    console.error('=== ERRO EM criarOrcamento ===');
    console.error('Mensagem de erro:', error.message);
    
    // Verificar se é um erro de validação do Sequelize
    if (error.name === 'SequelizeValidationError' || error.name === 'SequelizeDatabaseError') {
      console.error('Erro de banco de dados:', {
        name: error.name,
        message: error.message,
        errors: error.errors ? error.errors.map(e => ({
          message: e.message,
          type: e.type,
          path: e.path,
          value: e.value
        })) : 'Nenhum erro detalhado disponível'
      });
      
      return res.status(400).json({
        status: 'error',
        message: 'Erro de validação nos dados da requisição',
        details: error.errors ? error.errors.map(e => ({
          field: e.path,
          message: e.message
        })) : [error.message]
      });
    }
    
    // Log do erro completo para depuração
    console.error('Stack trace completo:', error.stack);
    
    // Log do erro usando o logger
    logger.error(`Error creating budget: ${error.message}`, { 
      error: {
        name: error.name,
        message: error.message,
        stack: error.stack
      },
      query: req.query,
      user: req.usuario ? {
        id: req.usuario.id,
        empresaId: req.usuario.empresaId,
        email: req.usuario.email
      } : 'Nenhum usuário autenticado'
    });
    
    // Resposta de erro genérica para o cliente
    res.status(500).json({
      status: 'error',
      message: 'Ocorreu um erro ao processar sua solicitação. Por favor, tente novamente mais tarde.'
    });
  }
};

/**
 * Get all budgets for the authenticated user's company
 * @route GET /api/orcamentos
 */
exports.listarOrcamentos = async (req, res, next) => {
 
  try {
    console.log('=== listarOrcamentos INICIO ===');
    console.log('Query params recebidos:', req.query);
    console.log('Usuário autenticado:', {
      id: req.usuario?.id,
      empresaId: req.usuario?.empresaId,
      email: req.usuario?.email
    });
    
    const { status, busca, pagina = 1, limite = 10 } = req.query;
    const offset = (pagina - 1) * limite;
    
    // Log dos parâmetros processados
    console.log('Parâmetros processados:', { status, busca, pagina, limite, offset });
    
    // Verificar se empresaId está definido
    if (!req.usuario?.empresaId) {
      console.error('Erro: empresaId não está definido no usuário');
      return res.status(400).json({
        status: 'error',
        message: 'Usuário não está associado a nenhuma empresa.'
      });
    }
    
    const where = {
      empresaId: req.usuario.empresaId
    };
    
    console.log('Condição WHERE inicial:', JSON.stringify(where, null, 2));
    
    // Apply filters
    if (status) {
      where.status = status;
    }
    
    if (busca) {
      where[Op.or] = [
        { nome: { [Op.like]: `%${busca}%` } },
        { descricao: { [Op.like]: `%${busca}%` } }
      ];
      console.log('Condição WHERE após busca:', JSON.stringify(where, null, 2));
    }
    
    const order = [];
    if (ordenarPor) {
      order.push([ordenarPor, ordem]);
    }
    
    console.log('Opções da consulta:', {
      where,
      order,
      limit: parseInt(limite),
      offset: parseInt(offset),
      raw: true
    });
    
    console.log('Executando consulta no banco de dados...');
    const { count, rows: orcamentos } = await Orcamento.findAndCountAll({
      where,
      order,
      limit: parseInt(limite),
      offset: parseInt(offset),
      raw: true
    }).catch(error => {
      console.error('Erro na consulta ao banco de dados:', error);
      throw error;
    });
    
    console.log(`Consulta retornou ${count} orçamentos`);
    
    // Se chegou até aqui, a consulta foi bem-sucedida
    console.log('Consulta ao banco de dados concluída com sucesso');
    
    // Se não há orçamentos, retornar array vazio em vez de erro
    if (count === 0) {
      console.log('Nenhum orçamento encontrado para os critérios fornecidos');
      return res.status(200).json({
        status: 'success',
        results: 0,
        data: []
      });
    }
    
    // Calculate totals for each budget
    const orcamentosComTotais = orcamentos.map(orcamento => {
      const orcamentoJson = orcamento.toJSON();
      
      const totalReceita = orcamentoJson.receitas.reduce((sum, rev) => sum + parseFloat(rev.valor), 0);
      const totalCusto = orcamentoJson.custos.reduce((sum, cost) => sum + parseFloat(cost.valor), 0);
      const resultadoLiquido = totalReceita - totalCusto;
      const margem = totalReceita > 0 ? (resultadoLiquido / totalReceita) * 100 : 0;
      
      return {
        ...orcamentoJson,
        totalReceita,
        totalCusto,
        resultadoLiquido,
        margem: parseFloat(margem.toFixed(2))
      };
    });
    
    // Log da resposta que será enviada
    console.log('Preparando resposta com sucesso');
    
    const response = {
      status: 'success',
      results: orcamentosComTotais.length,
      data: orcamentosComTotais,
      pagination: {
        total: count,
        page: parseInt(pagina),
        limit: parseInt(limite),
        totalPages: Math.ceil(count / limite)
      }
    };
    
    console.log('Resposta preparada com sucesso');
    res.status(200).json(response);
  } catch (error) {
    console.error('=== ERRO EM listarOrcamentos ===');
    console.error('Mensagem de erro:', error.message);
    
    // Verificar se é um erro de validação do Sequelize
    if (error.name === 'SequelizeValidationError' || error.name === 'SequelizeDatabaseError') {
      console.error('Erro de banco de dados:', {
        name: error.name,
        message: error.message,
        errors: error.errors ? error.errors.map(e => ({
          message: e.message,
          type: e.type,
          path: e.path,
          value: e.value
        })) : 'Nenhum erro detalhado disponível'
      });
      
      return res.status(400).json({
        status: 'error',
        message: 'Erro de validação nos dados da requisição',
        details: error.errors ? error.errors.map(e => ({
          field: e.path,
          message: e.message
        })) : [error.message]
      });
    }
    
    // Log do erro completo para depuração
    console.error('Stack trace completo:', error.stack);
    
    // Log do erro usando o logger
    logger.error(`Error listing budgets: ${error.message}`, { 
      error: {
        name: error.name,
        message: error.message,
        stack: error.stack
      },
      query: req.query,
      user: req.usuario ? {
        id: req.usuario.id,
        empresaId: req.usuario.empresaId,
        email: req.usuario.email
      } : 'Nenhum usuário autenticado'
    });
    
    // Resposta de erro genérica para o cliente
    res.status(500).json({
      status: 'error',
      message: 'Ocorreu um erro ao processar sua solicitação. Por favor, tente novamente mais tarde.'
    });
  }
};

/**
 * Get a single budget by ID
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
          attributes: { exclude: ['orcamentoId', 'criadoEm', 'atualizadoEm'] }
        },
        {
          model: Custo,
          as: 'custos',
          attributes: { exclude: ['orcamentoId', 'criadoEm', 'atualizadoEm'] }
        },
        {
          model: Ativo,
          as: 'ativos',
          attributes: { exclude: ['orcamentoId', 'criadoEm', 'atualizadoEm'] }
        }
      ]
    });
    
    if (!orcamento) {
      return res.status(404).json({
        status: 'error',
        message: 'Budget not found'
      });
    }
    
    // Calculate totals
    const orcamentoJson = orcamento.toJSON();
    const totalReceita = orcamentoJson.receitas.reduce((sum, rev) => sum + parseFloat(rev.valor), 0);
    const totalCusto = orcamentoJson.custos.reduce((sum, cost) => sum + parseFloat(cost.valor), 0);
    const resultadoLiquido = totalReceita - totalCusto;
    const margem = totalReceita > 0 ? (resultadoLiquido / totalReceita) * 100 : 0;
    
    const response = {
      ...orcamentoJson,
      totalReceita,
      totalCusto,
      resultadoLiquido,
      margem: parseFloat(margem.toFixed(2))
    };
    
    res.status(200).json({
      status: 'success',
      data: {
        orcamento: response
      }
    });
  } catch (error) {
    logger.error(`Error fetching budget: ${error.message}`, { error });
    next(error);
  }
};

/**
 * Update a budget
 * @route PATCH /api/orcamentos/:id
 */
exports.atualizarOrcamento = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { nome, descricao, dataInicio, dataFim, status, temSazonalidade, mesesSazonais } = req.body;
    
    const orcamento = await Orcamento.findOne({
      where: {
        id,
        empresaId: req.usuario.empresaId
      }
    });
    
    if (!orcamento) {
      return res.status(404).json({
        status: 'error',
        message: 'Budget not found'
      });
    }
    
    // Update budget fields
    if (nome) orcamento.nome = nome;
    if (descricao !== undefined) orcamento.descricao = descricao;
    if (dataInicio) orcamento.dataInicio = dataInicio;
    if (dataFim) orcamento.dataFim = dataFim;
    if (status) orcamento.status = status;
    if (temSazonalidade !== undefined) orcamento.temSazonalidade = temSazonalidade;
    if (mesesSazonais) orcamento.mesesSazonais = mesesSazonais;
    
    await orcamento.save();
    
    res.status(200).json({
      status: 'success',
      data: {
        orcamento
      }
    });
  } catch (error) {
    logger.error(`Error updating budget: ${error.message}`, { error });
    next(error);
  }
};

/**
 * Delete a budget
 * @route DELETE /api/orcamentos/:id
 */
exports.excluirOrcamento = async (req, res, next) => {
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
        message: 'Budget not found'
      });
    }
    
    // Use transaction to ensure data consistency
    const transaction = await Orcamento.sequelize.transaction();
    
    try {
      // Delete related records first
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
      
      // Finally, delete the budget
      await orcamento.destroy({ transaction });
      
      await transaction.commit();
      
      res.status(204).json({
        status: 'success',
        data: null
      });
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  } catch (error) {
    logger.error(`Error deleting budget: ${error.message}`, { error });
    next(error);
  }
};

// Revenue related controllers

/**
 * Add revenue to a budget
 * @route POST /api/orcamentos/:orcamentoId/receitas
 */
exports.adicionarReceita = async (req, res, next) => {
  try {
    const { orcamentoId } = req.params;
    const { descricao, categoria, valor, quantidade, unidade, recorrente, frequencia, dataInicio, dataFim, observacoes } = req.body;
    
    // Check if budget exists and belongs to user's company
    const orcamento = await Orcamento.findOne({
      where: {
        id: orcamentoId,
        empresaId: req.usuario.empresaId
      }
    });
    
    if (!orcamento) {
      return res.status(404).json({
        status: 'error',
        message: 'Budget not found'
      });
    }
    
    // Calculate total
    const valorTotal = parseFloat((valor * quantidade).toFixed(2));
    
    const receita = await Receita.create({
      descricao,
      categoria,
      valor: valorTotal,
      quantidade,
      unidade,
      recorrente,
      frequencia,
      dataInicio,
      dataFim,
      observacoes,
      orcamentoId,
      criadoPor: req.usuario.id,
      atualizadoPor: req.usuario.id
    });
    
    res.status(201).json({
      status: 'success',
      data: {
        receita
      }
    });
  } catch (error) {
    logger.error(`Error adding revenue: ${error.message}`, { error });
    next(error);
  }
};

/**
 * Cria um novo orçamento a partir do formulário de orçamento
 * @route POST /api/orcamentos/novo-orcamento
 */
exports.criarOrcamentoCompleto = async (req, res, next) => {
  const t = await Orcamento.sequelize.transaction();
  
  try {
    const { 
      companyInfo, 
      revenues = [], 
      costs = { materials: [], services: [], personnel: [], fixed: [] },
      assets = [],
      seasonality = { hasSeasonality: false, months: [] }
    } = req.body;

    // 1. Criar o orçamento base
    const orcamento = await Orcamento.create({
      nome: companyInfo.name || 'Novo Orçamento',
      descricao: companyInfo.type || '',
      dataInicio: new Date(), // Data atual como data de início
      dataFim: new Date(new Date().setFullYear(new Date().getFullYear() + 1)), // Um ano a partir de agora
      moeda: 'AOA',
      possuiSazonalidade: seasonality.hasSeasonality || false,
      mesesSazonais: seasonality.months || [],
      empresaId: req.usuario.empresaId,
      usuarioId: req.usuario.id,
      status: 'rascunho',
      metadados: {
        setoresAtuacao: companyInfo.sectors || []
      }
    }, { transaction: t });

    // 2. Adicionar receitas
    const receitasCriadas = await Promise.all(
      revenues.map(receita => 
        Receita.create({
          nome: receita.description || 'Nova Receita',
          descricao: 'Adicionada via formulário de orçamento',
          categoria: 'venda',
          quantidade: receita.quantity || 0,
          precoUnitario: receita.unitPrice || 0,
          valor: receita.total || 0,
          orcamentoId: orcamento.id,
          empresaId: req.usuario.empresaId,
          usuarioId: req.usuario.id
        }, { transaction: t })
      )
    );

    // 3. Adicionar custos (materiais, serviços, pessoal, fixos)
    const custosCriados = [];
    
    // Função auxiliar para adicionar custos por tipo
    const adicionarCustos = async (tipo, itens) => {
      return Promise.all(
        itens.map(item => 
          Custo.create({
            nome: item.description || item.role || `Custo ${tipo}`,
            descricao: `Custo de ${tipo} adicionado via formulário`,
            tipo,
            valor: item.total || 0,
            quantidade: item.quantity || 1,
            precoUnitario: item.unitCost || item.salary || 0,
            orcamentoId: orcamento.id,
            empresaId: req.usuario.empresaId,
            usuarioId: req.usuario.id,
            metadados: {
              tipoContrato: item.type || 'Permanente'
            }
          }, { transaction: t })
        )
      );
    };

    // Adicionar custos de cada tipo
    const [materiais, servicos, pessoal, fixos] = await Promise.all([
      adicionarCustos('material', costs.materials || []),
      adicionarCustos('servico', costs.services || []),
      adicionarCustos('pessoal', costs.personnel || []),
      adicionarCustos('fixo', costs.fixed || [])
    ]);

    custosCriados.push(...materiais, ...servicos, ...pessoal, ...fixos);

    // 4. Adicionar ativos (se houver)
    const ativosCriados = await Promise.all(
      assets.map(ativo => 
        Ativo.create({
          nome: ativo.description || 'Novo Ativo',
          descricao: 'Adicionado via formulário de orçamento',
          valor: ativo.value || 0,
          tipo: ativo.type || 'outros',
          vidaUtil: ativo.usefulLife || 5, // 5 anos por padrão
          orcamentoId: orcamento.id,
          empresaId: req.usuario.empresaId,
          usuarioId: req.usuario.id
        }, { transaction: t })
      )
    );

    // 5. Atualizar totais do orçamento
    const receitaTotal = receitasCriadas.reduce((sum, r) => sum + (r.valor || 0), 0);
    const custoTotal = custosCriados.reduce((sum, c) => sum + (c.valor || 0), 0);
    const resultadoLiquido = receitaTotal - custoTotal;
    const margem = receitaTotal > 0 ? (resultadoLiquido / receitaTotal) * 100 : 0;

    await orcamento.update({
      receitaTotal,
      custoTotal,
      resultadoLiquido,
      margem: parseFloat(margem.toFixed(2))
    }, { transaction: t });

    // Commit da transação
    await t.commit();

    // Buscar o orçamento com os relacionamentos
    const orcamentoCompleto = await Orcamento.findByPk(orcamento.id, {
      include: [
        { model: Receita, as: 'receitas' },
        { model: Custo, as: 'custos' },
        { model: Ativo, as: 'ativos' }
      ]
    });

    res.status(201).json({
      status: 'success',
      data: {
        orcamento: orcamentoCompleto
      }
    });
  } catch (error) {
    // Rollback em caso de erro
    await t.rollback();
    logger.error(`Erro ao criar orçamento completo: ${error.message}`, { error });
    next(error);
  }
};
