/**
 * Controller de Tesouraria - EndiAgro FinancePro
 * 
 * Este arquivo implementa todas as operações relacionadas a tesouraria,
 * incluindo planos, entradas, saídas e financiamentos.
 * 
 * @author António Emiliano Barros
 * @version 1.0.0
 */

const { Op } = require('sequelize');
const { 
  PlanoTesouraria, 
  EntradaTesouraria, 
  SaidaTesouraria, 
  FinanciamentoTesouraria,
  Orcamento,
  Receita,
  Custo,
  Empresa, 
  Usuario 
} = require('../models');

/**
 * Lista todos os planos de tesouraria
 */
const listarPlanos = async (req, res) => {
  try {
    const { 
      ano, 
      status, 
      pagina = 1, 
      limite = 10,
      ordenarPor = 'criadoEm',
      ordem = 'DESC'
    } = req.query;

    const where = {
      empresaId: req.user.empresaId
    };

    if (ano) {
      where.ano = ano;
    }

    if (status) {
      where.status = status;
    }

    const offset = (pagina - 1) * limite;

    const { count, rows } = await PlanoTesouraria.findAndCountAll({
      where,
      include: [
        {
          model: Empresa,
          as: 'empresa',
          attributes: ['id', 'nome']
        },
        {
          model: Usuario,
          as: 'criador',
          attributes: ['id', 'nome', 'email']
        },
        {
          model: Usuario,
          as: 'aprovador',
          attributes: ['id', 'nome', 'email']
        },
        {
          model: EntradaTesouraria,
          as: 'entradas',
          attributes: ['id', 'nome', 'valor', 'status']
        },
        {
          model: SaidaTesouraria,
          as: 'saidas',
          attributes: ['id', 'nome', 'valor', 'status']
        },
        {
          model: FinanciamentoTesouraria,
          as: 'financiamentos',
          attributes: ['id', 'nome', 'valor', 'tipo', 'status']
        }
      ],
      order: [[ordenarPor, ordem]],
      limit: parseInt(limite),
      offset
    });

    res.json({
      success: true,
      data: {
        planos: rows,
        paginacao: {
          paginaAtual: parseInt(pagina),
          totalPaginas: Math.ceil(count / limite),
          totalItens: count,
          itensPorPagina: parseInt(limite)
        }
      }
    });

  } catch (error) {
    console.error('Erro ao listar planos:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: error.message
    });
  }
};

/**
 * Cria um novo plano de tesouraria
 */
const criarPlano = async (req, res) => {
  try {
    const {
      nome,
      descricao,
      ano,
      observacoes,
      entradas = [],
      saidas = [],
      financiamentos = []
    } = req.body;

    // Verificar se já existe plano para o ano
    const planoExistente = await PlanoTesouraria.findOne({
      where: {
        ano,
        empresaId: req.user.empresaId,
        status: { [Op.not]: 'arquivado' }
      }
    });

    if (planoExistente) {
      return res.status(400).json({
        success: false,
        message: `Já existe um plano de tesouraria ativo para o ano ${ano}`
      });
    }

    // Criar plano
    const plano = await PlanoTesouraria.create({
      nome: nome || `Plano de Tesouraria ${ano}`,
      descricao,
      ano,
      observacoes,
      empresaId: req.user.empresaId,
      criadoPor: req.user.id
    });

    // Criar entradas
    if (entradas.length > 0) {
      const entradasData = entradas.map(entrada => ({
        ...entrada,
        planoId: plano.id
      }));
      await EntradaTesouraria.bulkCreate(entradasData);
    }

    // Criar saídas
    if (saidas.length > 0) {
      const saidasData = saidas.map(saida => ({
        ...saida,
        planoId: plano.id
      }));
      await SaidaTesouraria.bulkCreate(saidasData);
    }

    // Criar financiamentos
    if (financiamentos.length > 0) {
      const financiamentosData = financiamentos.map(financiamento => ({
        ...financiamento,
        planoId: plano.id
      }));
      await FinanciamentoTesouraria.bulkCreate(financiamentosData);
    }

    // Buscar plano completo
    const planoCompleto = await PlanoTesouraria.findByPk(plano.id, {
      include: [
        { model: EntradaTesouraria, as: 'entradas' },
        { model: SaidaTesouraria, as: 'saidas' },
        { model: FinanciamentoTesouraria, as: 'financiamentos' },
        { model: Empresa, as: 'empresa', attributes: ['id', 'nome'] },
        { model: Usuario, as: 'criador', attributes: ['id', 'nome'] }
      ]
    });

    res.status(201).json({
      success: true,
      message: 'Plano de tesouraria criado com sucesso',
      data: planoCompleto
    });

  } catch (error) {
    console.error('Erro ao criar plano:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: error.message
    });
  }
};

/**
 * Cria um plano de tesouraria completo a partir do formulário
 */
const criarPlanoCompleto = async (req, res) => {
  try {
    const {
      metadata,
      initialBalance = 0,
      inflows = [],
      outflows = [],
      financing = {}
    } = req.body;

    const { month, year, company, preparedBy, approvedBy, budgetReference } = metadata;

    // Verificar se já existe plano para o ano
    const planoExistente = await PlanoTesouraria.findOne({
      where: {
        ano: year,
        empresaId: req.user.empresaId,
        status: { [Op.not]: 'arquivado' }
      }
    });

    if (planoExistente) {
      return res.status(400).json({
        success: false,
        message: `Já existe um plano de tesouraria ativo para o ano ${year}`
      });
    }

    // Criar plano
    const nome = `Plano de Tesouraria - ${month}/${year}`;
    const descricao = [
      company && `Empresa: ${company}`,
      preparedBy && `Preparado por: ${preparedBy}`,
      approvedBy && `Aprovado por: ${approvedBy}`,
      budgetReference && `Referência orçamental: ${budgetReference}`
    ].filter(Boolean).join(' | ');

    const plano = await PlanoTesouraria.create({
      nome,
      descricao,
      ano: year,
      observacoes: `Saldo inicial: ${initialBalance}`,
      empresaId: req.user.empresaId,
      criadoPor: req.user.id
    });

    // Processar entradas
    if (inflows.length > 0) {
      const entradasData = inflows.map((entrada, index) => ({
        nome: entrada.name || `Entrada ${index + 1}`,
        descricao: entrada.description || null,
        valor: parseFloat(entrada.amount) || 0,
        dataPrevista: entrada.date ? new Date(entrada.date) : new Date(),
        categoria: entrada.category || 'Geral',
        status: entrada.status || 'pendente',
        planoId: plano.id
      }));
      await EntradaTesouraria.bulkCreate(entradasData);
    }

    // Processar saídas
    if (outflows.length > 0) {
      const saidasData = outflows.map((saida, index) => ({
        nome: saida.name || `Saída ${index + 1}`,
        descricao: saida.description || null,
        valor: parseFloat(saida.amount) || 0,
        dataPrevista: saida.date ? new Date(saida.date) : new Date(),
        categoria: saida.category || 'Geral',
        status: saida.status || 'pendente',
        planoId: plano.id
      }));
      await SaidaTesouraria.bulkCreate(saidasData);
    }

    // Processar financiamentos
    if (financing.loans?.length > 0 || financing.investments?.length > 0) {
      const financiamentosData = [];
      
      if (financing.loans?.length > 0) {
        financing.loans.forEach((emprestimo, index) => {
          financiamentosData.push({
            nome: emprestimo.name || `Empréstimo ${index + 1}`,
            descricao: emprestimo.description || null,
            valor: parseFloat(emprestimo.amount) || 0,
            dataInicio: emprestimo.startDate ? new Date(emprestimo.startDate) : new Date(),
            dataVencimento: emprestimo.endDate ? new Date(emprestimo.endDate) : new Date(),
            tipo: 'emprestimo',
            status: emprestimo.status || 'ativo',
            planoId: plano.id
          });
        });
      }

      if (financing.investments?.length > 0) {
        financing.investments.forEach((investimento, index) => {
          financiamentosData.push({
            nome: investimento.name || `Investimento ${index + 1}`,
            descricao: investimento.description || null,
            valor: parseFloat(investimento.amount) || 0,
            dataInicio: investimento.startDate ? new Date(investimento.startDate) : new Date(),
            dataVencimento: investimento.endDate ? new Date(investimento.endDate) : new Date(),
            tipo: 'investimento',
            status: investimento.status || 'ativo',
            planoId: plano.id
          });
        });
      }

      if (financiamentosData.length > 0) {
        await FinanciamentoTesouraria.bulkCreate(financiamentosData);
      }
    }

    // Buscar plano completo
    const planoCompleto = await PlanoTesouraria.findByPk(plano.id, {
      include: [
        { model: EntradaTesouraria, as: 'entradas' },
        { model: SaidaTesouraria, as: 'saidas' },
        { model: FinanciamentoTesouraria, as: 'financiamentos' },
        { model: Empresa, as: 'empresa', attributes: ['id', 'nome'] },
        { model: Usuario, as: 'criador', attributes: ['id', 'nome'] }
      ]
    });

    res.status(201).json({
      success: true,
      message: 'Plano de tesouraria completo criado com sucesso',
      data: planoCompleto
    });

  } catch (error) {
    console.error('Erro ao criar plano completo:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: error.message
    });
  }
};

/**
 * Obtém um plano de tesouraria específico
 */
const obterPlano = async (req, res) => {
  try {
    const { id } = req.params;

    const plano = await PlanoTesouraria.findOne({
      where: {
        id,
        empresaId: req.user.empresaId
      },
      include: [
        { model: EntradaTesouraria, as: 'entradas' },
        { model: SaidaTesouraria, as: 'saidas' },
        { model: FinanciamentoTesouraria, as: 'financiamentos' },
        { model: Empresa, as: 'empresa', attributes: ['id', 'nome'] },
        { model: Usuario, as: 'criador', attributes: ['id', 'nome', 'email'] },
        { model: Usuario, as: 'aprovador', attributes: ['id', 'nome', 'email'] }
      ]
    });

    if (!plano) {
      return res.status(404).json({
        success: false,
        message: 'Plano de tesouraria não encontrado'
      });
    }

    res.json({
      success: true,
      data: plano
    });

  } catch (error) {
    console.error('Erro ao obter plano:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: error.message
    });
  }
};

/**
 * Atualiza um plano de tesouraria
 */
const atualizarPlano = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const plano = await PlanoTesouraria.findOne({
      where: {
        id,
        empresaId: req.user.empresaId
      }
    });

    if (!plano) {
      return res.status(404).json({
        success: false,
        message: 'Plano de tesouraria não encontrado'
      });
    }

    // Verificar se pode atualizar
    if (plano.status === 'aprovado' && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Não é possível atualizar um plano aprovado'
      });
    }

    await plano.update(updateData);

    const planoAtualizado = await PlanoTesouraria.findByPk(id, {
      include: [
        { model: EntradaTesouraria, as: 'entradas' },
        { model: SaidaTesouraria, as: 'saidas' },
        { model: FinanciamentoTesouraria, as: 'financiamentos' },
        { model: Empresa, as: 'empresa', attributes: ['id', 'nome'] },
        { model: Usuario, as: 'criador', attributes: ['id', 'nome'] }
      ]
    });

    res.json({
      success: true,
      message: 'Plano atualizado com sucesso',
      data: planoAtualizado
    });

  } catch (error) {
    console.error('Erro ao atualizar plano:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: error.message
    });
  }
};

/**
 * Exclui um plano de tesouraria
 */
const excluirPlano = async (req, res) => {
  try {
    const { id } = req.params;

    const plano = await PlanoTesouraria.findOne({
      where: {
        id,
        empresaId: req.user.empresaId
      }
    });

    if (!plano) {
      return res.status(404).json({
        success: false,
        message: 'Plano de tesouraria não encontrado'
      });
    }

    // Verificar se pode excluir
    if (plano.status === 'aprovado') {
      return res.status(403).json({
        success: false,
        message: 'Não é possível excluir um plano aprovado'
      });
    }

    // Excluir itens relacionados
    await Promise.all([
      EntradaTesouraria.destroy({ where: { planoId: id } }),
      SaidaTesouraria.destroy({ where: { planoId: id } }),
      FinanciamentoTesouraria.destroy({ where: { planoId: id } })
    ]);

    await plano.destroy();

    res.json({
      success: true,
      message: 'Plano de tesouraria excluído com sucesso'
    });

  } catch (error) {
    console.error('Erro ao excluir plano:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: error.message
    });
  }
};

/**
 * Aprova um plano de tesouraria
 */
const aprovarPlano = async (req, res) => {
  try {
    const { id } = req.params;
    const { observacoes } = req.body;

    const plano = await PlanoTesouraria.findOne({
      where: {
        id,
        empresaId: req.user.empresaId
      }
    });

    if (!plano) {
      return res.status(404).json({
        success: false,
        message: 'Plano de tesouraria não encontrado'
      });
    }

    // Verificar permissão
    if (!['admin', 'gerente'].includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Sem permissão para aprovar planos de tesouraria'
      });
    }

    await plano.update({
      status: 'aprovado',
      aprovadoPor: req.user.id,
      aprovadoEm: new Date(),
      observacoes: observacoes || plano.observacoes
    });

    const planoAtualizado = await PlanoTesouraria.findByPk(id, {
      include: [
        { model: Usuario, as: 'aprovador', attributes: ['id', 'nome'] }
      ]
    });

    res.json({
      success: true,
      message: 'Plano de tesouraria aprovado com sucesso',
      data: planoAtualizado
    });

  } catch (error) {
    console.error('Erro ao aprovar plano:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: error.message
    });
  }
};

/**
 * Rejeita um plano de tesouraria
 */
const rejeitarPlano = async (req, res) => {
  try {
    const { id } = req.params;
    const { motivo } = req.body;

    const plano = await PlanoTesouraria.findOne({
      where: {
        id,
        empresaId: req.user.empresaId
      }
    });

    if (!plano) {
      return res.status(404).json({
        success: false,
        message: 'Plano de tesouraria não encontrado'
      });
    }

    // Verificar permissão
    if (!['admin', 'gerente'].includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Sem permissão para rejeitar planos de tesouraria'
      });
    }

    await plano.update({
      status: 'rejeitado',
      observacoes: `REJEITADO: ${motivo}`
    });

    res.json({
      success: true,
      message: 'Plano de tesouraria rejeitado com sucesso'
    });

  } catch (error) {
    console.error('Erro ao rejeitar plano:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: error.message
    });
  }
};

/**
 * Obtém o fluxo de caixa
 */
const obterFluxoCaixa = async (req, res) => {
  try {
    const { dataInicio, dataFim, planoId, tipo = 'mensal' } = req.query;

    const where = {
      empresaId: req.user.empresaId
    };

    if (planoId) {
      where.id = planoId;
    }

    if (dataInicio && dataFim) {
      where.createdAt = {
        [Op.between]: [new Date(dataInicio), new Date(dataFim)]
      };
    }

    const planos = await PlanoTesouraria.findAll({
      where,
      include: [
        { model: EntradaTesouraria, as: 'entradas' },
        { model: SaidaTesouraria, as: 'saidas' },
        { model: FinanciamentoTesouraria, as: 'financiamentos' }
      ]
    });

    const fluxoCaixa = planos.map(plano => {
      const totalEntradas = plano.entradas.reduce((sum, entrada) => sum + parseFloat(entrada.valor), 0);
      const totalSaidas = plano.saidas.reduce((sum, saida) => sum + parseFloat(saida.valor), 0);
      const totalFinanciamentos = plano.financiamentos.reduce((sum, fin) => sum + parseFloat(fin.valor), 0);
      
      const saldoLiquido = totalEntradas - totalSaidas + totalFinanciamentos;

      return {
        planoId: plano.id,
        nome: plano.nome,
        ano: plano.ano,
        totalEntradas,
        totalSaidas,
        totalFinanciamentos,
        saldoLiquido,
        status: plano.status
      };
    });

    res.json({
      success: true,
      data: {
        fluxoCaixa,
        resumo: {
          totalPlanos: planos.length,
          totalEntradas: fluxoCaixa.reduce((sum, item) => sum + item.totalEntradas, 0),
          totalSaidas: fluxoCaixa.reduce((sum, item) => sum + item.totalSaidas, 0),
          totalFinanciamentos: fluxoCaixa.reduce((sum, item) => sum + item.totalFinanciamentos, 0),
          saldoGeralLiquido: fluxoCaixa.reduce((sum, item) => sum + item.saldoLiquido, 0)
        }
      }
    });

  } catch (error) {
    console.error('Erro ao obter fluxo de caixa:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: error.message
    });
  }
};

/**
 * Importa dados de um orçamento para o plano de tesouraria
 */
const importarDoOrcamento = async (req, res) => {
  try {
    const { id } = req.params;
    const { orcamentoId, mesReferencia = 1 } = req.body;

    const plano = await PlanoTesouraria.findOne({
      where: {
        id,
        empresaId: req.user.empresaId
      }
    });

    if (!plano) {
      return res.status(404).json({
        success: false,
        message: 'Plano de tesouraria não encontrado'
      });
    }

    const orcamento = await Orcamento.findOne({
      where: {
        id: orcamentoId,
        empresaId: req.user.empresaId
      },
      include: [
        { model: Receita, as: 'receitas' },
        { model: Custo, as: 'custos' }
      ]
    });

    if (!orcamento) {
      return res.status(404).json({
        success: false,
        message: 'Orçamento não encontrado'
      });
    }

    // Importar receitas como entradas
    const receitas = orcamento.receitas.filter(receita => receita.mes === mesReferencia);
    if (receitas.length > 0) {
      const entradasData = receitas.map(receita => ({
        nome: receita.nome,
        descricao: `Importado do orçamento: ${receita.descricao || ''}`,
        valor: receita.valor,
        dataPrevista: new Date(),
        categoria: receita.categoria || 'Receitas',
        status: 'pendente',
        planoId: plano.id
      }));
      await EntradaTesouraria.bulkCreate(entradasData);
    }

    // Importar custos como saídas
    const custos = orcamento.custos.filter(custo => custo.mes === mesReferencia);
    if (custos.length > 0) {
      const saidasData = custos.map(custo => ({
        nome: custo.nome,
        descricao: `Importado do orçamento: ${custo.descricao || ''}`,
        valor: custo.valor,
        dataPrevista: new Date(),
        categoria: custo.categoria || 'Custos',
        status: 'pendente',
        planoId: plano.id
      }));
      await SaidaTesouraria.bulkCreate(saidasData);
    }

    // Buscar plano atualizado
    const planoAtualizado = await PlanoTesouraria.findByPk(id, {
      include: [
        { model: EntradaTesouraria, as: 'entradas' },
        { model: SaidaTesouraria, as: 'saidas' }
      ]
    });

    res.json({
      success: true,
      message: `Dados do orçamento importados com sucesso. ${receitas.length} receitas e ${custos.length} custos adicionados.`,
      data: planoAtualizado
    });

  } catch (error) {
    console.error('Erro ao importar do orçamento:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: error.message
    });
  }
};

module.exports = {
  listarPlanos,
  criarPlano,
  criarPlanoCompleto,
  obterPlano,
  atualizarPlano,
  excluirPlano,
  aprovarPlano,
  rejeitarPlano,
  obterFluxoCaixa,
  importarDoOrcamento
}