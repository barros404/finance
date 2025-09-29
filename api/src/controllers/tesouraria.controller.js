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


// Adicione estas funções auxiliares no início do controller

/**
 * Verifica se existe orçamento aprovado para o ano
 */
const verificarOrcamentoAprovado = async (empresaId, ano) => {
  const orcamento = await Orcamento.findOne({
    where: {
      empresaId,
      ano,
      status: 'aprovado'
    },
    include: [
      { model: Receita, as: 'receitas' },
      { model: Custo, as: 'custos' }
    ]
  });

  return orcamento;
};

/**
 * Calcula totais do orçamento
 */
const calcularTotaisOrcamento = (orcamento) => {
  const totalReceitas = orcamento.receitas.reduce((sum, receita) =>
    sum + parseFloat(receita.valor || 0), 0);

  const totalCustos = orcamento.custos.reduce((sum, custo) =>
    sum + parseFloat(custo.valor || 0), 0);

  return {
    totalReceitas,
    totalCustos,
    saldoOrcamento: totalReceitas - totalCustos
  };
};

/**
 * Valida se o saldo inicial não excede o orçamento
 */
const validarSaldoInicial = (saldoInicial, saldoOrcamento) => {
  return parseFloat(saldoInicial) <= saldoOrcamento;
};

/**
 * Calcula necessidade de financiamento
 */
const calcularNecessidadeFinanciamento = (saldoInicial, totalEntradas, totalSaidas, saldoOrcamento) => {
  const saldoProjetado = parseFloat(saldoInicial) + parseFloat(totalEntradas) - parseFloat(totalSaidas);

  if (saldoProjetado >= 0) {
    return 0; // Não precisa de financiamento
  }

  return Math.abs(saldoProjetado); // Retorna o valor absoluto do deficit
};

// Modifique a função criarPlano
const criarPlano = async (req, res) => {
  try {
    const {
      mes,
      ano,
      saldoInicial = 0,
      observacoes,
      entradas = [],
      saidas = [],
      financiamentos = []
    } = req.body;

    // 1. Verificar se existe orçamento aprovado para o ano
    const orcamentoAprovado = await verificarOrcamentoAprovado(req.user.empresaId, ano);

    if (!orcamentoAprovado) {
      return res.status(400).json({
        success: false,
        message: `Não existe orçamento aprovado para o ano ${ano}. É necessário criar e aprovar um orçamento primeiro.`
      });
    }
    //verifica se ja existe um plano para o mes e ano
    const planoExistente = await PlanoTesouraria.findOne({
      where: {
        empresaId: req.user.empresaId,
        mes,
        ano
      }
    });
    if (planoExistente) {
      return res.status(400).json({
        success: false,
        message: `Já existe um plano de tesouraria para  ${mes}/${ano}.`
      });
    }

    // 2. Calcular totais do orçamento
    const totaisOrcamento = calcularTotaisOrcamento(orcamentoAprovado);

    // 3. Validar se saldo inicial não excede o orçamento
    if (!validarSaldoInicial(saldoInicial, totaisOrcamento.saldoOrcamento)) {
      return res.status(400).json({
        success: false,
        message: `Saldo inicial (${saldoInicial}) não pode exceder o saldo do orçamento (${totaisOrcamento.saldoOrcamento})`
      });
    }

    // 4. Calcular totais de entradas e saídas
    const totalEntradas = entradas.reduce((sum, entrada) =>
      sum + parseFloat(entrada.valor || 0), 0);

    const totalSaidas = saidas.reduce((sum, saida) =>
      sum + parseFloat(saida.valor || 0), 0);

    // 5. Calcular necessidade de financiamento
    const necessidadeFinanciamento = calcularNecessidadeFinanciamento(
      saldoInicial, totalEntradas, totalSaidas, totaisOrcamento.saldoOrcamento
    );

    // 6. Criar plano
    const plano = await PlanoTesouraria.create({
      nome: `Plano de Tesouraria ${mes}/${ano}`,
      descricao: `Plano baseado no orçamento do ano ${orcamentoAprovado.ano}`,
      mes,
      ano,
      saldoInicial,
      necessidadeFinanciamento,
      observacoes: observacoes || `Necessidade de financiamento: ${necessidadeFinanciamento}`,
      orcamentoId: orcamentoAprovado.id,
      empresaId: req.user.empresaId,
      criadoPor: req.user.id,
      status: necessidadeFinanciamento > 0 ? 'pendente' : 'rascunho'
    });

    // Resto do código para criar entradas, saídas e financiamentos...
    // [Mantém o código existente para criar os itens relacionados]

    // 7. Se houver necessidade de financiamento, adicionar mensagem
    let mensagem = 'Plano de tesouraria criado com sucesso';
    if (necessidadeFinanciamento > 0) {
      mensagem += `. Necessidade de financiamento identificada: ${necessidadeFinanciamento}`;
    }

    res.status(201).json({
      success: true,
      message: mensagem,
      data: plano,
      necessidadeFinanciamento
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

// Modifique a função criarPlanoCompleto de forma similar
const criarPlanoCompleto = async (req, res) => {
  try {
    const {
      metadata,
      initialBalance = 0,
      inflows = [],
      outflows = [],
      financing = {}
    } = req.body;

    const { month, year } = metadata;

    // 1. Verificar orçamento aprovado
    const orcamentoAprovado = await verificarOrcamentoAprovado(req.user.empresaId, year);

    if (!orcamentoAprovado) {
      return res.status(400).json({
        success: false,
        message: `Não existe orçamento aprovado para o ano ${year}. É necessário criar e aprovar um orçamento primeiro.`
      });
    }

    // 2. Validar saldo inicial
    const totaisOrcamento = calcularTotaisOrcamento(orcamentoAprovado);

    if (!validarSaldoInicial(initialBalance, totaisOrcamento.saldoOrcamento)) {
      return res.status(400).json({
        success: false,
        message: `Saldo inicial (${initialBalance}) não pode exceder o saldo do orçamento (${totaisOrcamento.saldoOrcamento})`
      });
    }

    // 3. Calcular necessidade de financiamento
    const totalEntradas = inflows.reduce((sum, inflow) =>
      sum + parseFloat(inflow.amount || 0), 0);

    const totalSaidas = outflows.reduce((sum, outflow) =>
      sum + parseFloat(outflow.amount || 0), 0);

    const necessidadeFinanciamento = calcularNecessidadeFinanciamento(
      initialBalance, totalEntradas, totalSaidas, totaisOrcamento.saldoOrcamento
    );

    // Resto da função de criação...
    // [Mantém o código existente adaptando para incluir a necessidade de financiamento]

  } catch (error) {
    // Tratamento de erro
  }
};

// Adicione esta função para importar automaticamente do orçamento
const importarAutomaticamenteOrcamento = async (planoId, orcamentoId, mes) => {
  try {
    const orcamento = await Orcamento.findByPk(orcamentoId, {
      include: [
        { model: Receita, as: 'receitas' },
        { model: Custo, as: 'custos' }
      ]
    });

    // Filtrar receitas e custos do mês específico
    const receitasMes = orcamento.receitas.filter(receita => receita.mes === mes);
    const custosMes = orcamento.custos.filter(custo => custo.mes === mes);

    // Criar entradas a partir das receitas
    const entradasData = receitasMes.map(receita => ({
      nome: `REC: ${receita.nome}`,
      descricao: `Receita importada do orçamento: ${receita.descricao || ''}`,
      valor: receita.valor,
      dataPrevista: new Date(new Date().getFullYear(), mes - 1, 15), // Dia 15 do mês
      categoria: receita.categoria || 'Receitas Orçamento',
      status: 'pendente',
      planoId: planoId
    }));

    // Criar saídas a partir dos custos
    const saidasData = custosMes.map(custo => ({
      nome: `CUSTO: ${custo.nome}`,
      descricao: `Custo importado do orçamento: ${custo.descricao || ''}`,
      valor: custo.valor,
      dataPrevista: new Date(new Date().getFullYear(), mes - 1, 10), // Dia 10 do mês
      categoria: custo.categoria || 'Custos Orçamento',
      status: 'pendente',
      planoId: planoId
    }));

    await EntradaTesouraria.bulkCreate(entradasData);
    await SaidaTesouraria.bulkCreate(saidasData);

    return {
      receitasImportadas: receitasMes.length,
      custosImportados: custosMes.length
    };

  } catch (error) {
    console.error('Erro ao importar automaticamente do orçamento:', error);
    throw error;
  }
};
/**
 * Lista todos os planos de tesouraria
 */
const listarPlanos = async (req, res) => {
  console.log('os daods', req.body)
  try {
    const {
      ano,
      status,
      pagina = 1,
      limite = 10,
      ordenarPor = 'createdAt',
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
          as: 'empresas',
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

/**
 * Lista planos de tesouraria por orçamento específico
 * @route GET /api/tesouraria/planos-por-orcamento
 */
const listarPlanosPorOrcamento = async (req, res) => {
  try {
    const {
      orcamentoId,
      pagina = 1,
      limite = 10,
      ordenacao = 'createdAt'
    } = req.query;

    if (!orcamentoId) {
      return res.status(400).json({
        success: false,
        message: 'ID do orçamento é obrigatório'
      });
    }

    const where = {
      empresaId: req.user.empresaId,
      orcamentoId: parseInt(orcamentoId)
    };

    const offset = (pagina - 1) * limite;

    const { count, rows } = await PlanoTesouraria.findAndCountAll({
      where,
      include: [
        {
          model: Empresa,
          as: 'empresas',
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
      order: [[ordenacao, 'DESC']],
      limit: parseInt(limite),
      offset
    });

    // Calcular totais para cada plano
    const planosComTotais = rows.map(plano => {
      const planoJson = plano.toJSON();
      const totalEntradas = planoJson.entradas?.reduce((sum, entrada) => sum + parseFloat(entrada.valor || 0), 0) || 0;
      const totalSaidas = planoJson.saidas?.reduce((sum, saida) => sum + parseFloat(saida.valor || 0), 0) || 0;
      const totalFinanciamentos = planoJson.financiamentos?.reduce((sum, fin) => sum + parseFloat(fin.valor || 0), 0) || 0;

      return {
        ...planoJson,
        totalEntradas: parseFloat(totalEntradas.toFixed(2)),
        totalSaidas: parseFloat(totalSaidas.toFixed(2)),
        totalFinanciamentos: parseFloat(totalFinanciamentos.toFixed(2)),
        saldoLiquido: parseFloat((totalEntradas - totalSaidas + totalFinanciamentos).toFixed(2))
      };
    });

    res.json({
      success: true,
      data: {
        planos: planosComTotais,
        paginacao: {
          paginaAtual: parseInt(pagina),
          totalPaginas: Math.ceil(count / limite),
          totalItens: count,
          itensPorPagina: parseInt(limite)
        }
      }
    });
  } catch (error) {
    console.error('Erro ao listar planos por orçamento:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: error.message
    });
  }
};

/**
 * Obtém atividades recentes relacionadas à execução orçamental
 * @route GET /api/tesouraria/atividades-recentes
 */
const obterAtividadesRecentes = async (req, res) => {
  try {
    const { limite = 10 } = req.query;

    // Buscar planos de tesouraria recentes da empresa
    const planosRecentes = await PlanoTesouraria.findAll({
      where: {
        empresaId: req.user.empresaId
      },
      include: [
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
          model: Orcamento,
          as: 'orcamentos', // <-- Corrigido
          attributes: ['id', 'nome', 'ano', 'status']
        }
      ],
      order: [['createdAt', 'DESC']],
      limit: parseInt(limite) * 2 // Buscar mais para ter diversidade
    });

    // Buscar orçamentos recentes da empresa
    const orcamentosRecentes = await Orcamento.findAll({
      where: {
        empresaId: req.user.empresaId
      },
      include: [
        {
          model: Usuario,
          as: 'criador',
          attributes: ['id', 'nome', 'email']
        }
      ],
      order: [['createdAt', 'DESC']],
      limit: parseInt(limite)
    });

    // Combinar e formatar atividades
    const atividades = [];

    // Adicionar atividades de planos de tesouraria
    planosRecentes.forEach(plano => {
      const tipoAtividade = plano.status === 'aprovado' ? 'plano_aprovado' :
        plano.status === 'rejeitado' ? 'plano_rejeitado' :
          plano.status === 'em_analise' ? 'plano_analise' : 'plano_criado';

      atividades.push({
        id: `plano_${plano.id}`,
        tipo: tipoAtividade,
        titulo: getTituloAtividade(tipoAtividade, plano),
        descricao: getDescricaoAtividade(tipoAtividade, plano),
        timestamp: plano.createdAt,
        status: mapearStatusAtividade(plano.status),
        usuario: plano.criador?.nome || 'Sistema',
        entidade: 'plano_tesouraria',
        entidadeId: plano.id,
        dadosAdicionais: {
          orcamentoNome: plano.orcamentos?.nome,
          orcamentoAno: plano.orcamentos?.ano
        }
      });
    });

    // Adicionar atividades de orçamentos
    orcamentosRecentes.forEach(orcamento => {
      const tipoAtividade = orcamento.status === 'aprovado' ? 'orcamento_aprovado' :
        orcamento.status === 'rejeitado' ? 'orcamento_rejeitado' :
          orcamento.status === 'em_analise' ? 'orcamento_analise' : 'orcamento_criado';

      atividades.push({
        id: `orcamento_${orcamento.id}`,
        tipo: tipoAtividade,
        titulo: getTituloAtividade(tipoAtividade, orcamento),
        descricao: getDescricaoAtividade(tipoAtividade, orcamento),
        timestamp: orcamento.createdAt,
        status: mapearStatusAtividade(orcamento.status),
        usuario: orcamento.criador?.nome || 'Sistema',
        entidade: 'orcamento',
        entidadeId: orcamento.id,
        dadosAdicionais: {
          ano: orcamento.ano
        }
      });
    });

    // Ordenar por timestamp (mais recente primeiro) e limitar
    atividades.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    const atividadesLimitadas = atividades.slice(0, parseInt(limite));

    res.json({
      success: true,
      data: {
        atividades: atividadesLimitadas,
        total: atividadesLimitadas.length
      }
    });
  } catch (error) {
    console.error('Erro ao obter atividades recentes:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: error.message
    });
  }
};

// Funções auxiliares para formatação de atividades
const getTituloAtividade = (tipo, entidade) => {
  const titulos = {
    'plano_criado': 'Novo plano de tesouraria criado',
    'plano_aprovado': 'Plano de tesouraria aprovado',
    'plano_rejeitado': 'Plano de tesouraria rejeitado',
    'plano_analise': 'Plano de tesouraria em análise',
    'orcamento_criado': 'Novo orçamento criado',
    'orcamento_aprovado': 'Orçamento aprovado',
    'orcamento_rejeitado': 'Orçamento rejeitado',
    'orcamento_analise': 'Orçamento em análise'
  };
  return titulos[tipo] || 'Atividade executada';
};

const getDescricaoAtividade = (tipo, entidade) => {
  if (entidade.orcamentos) {
    // É um plano de tesouraria
    const nomeOrcamento = entidade.orcamentos.nome || `Orçamento ${entidade.orcamentos.ano}`;
    return `${entidade.nome || 'Plano de tesouraria'} - ${nomeOrcamento}`;
  } else {
    // É um orçamento
    return `${entidade.nome || 'Orçamento'} - Ano ${entidade.ano}`;
  }
};

const mapearStatusAtividade = (status) => {
  const mapeamento = {
    'rascunho': 'rascunho',
    'em_analise': 'analise',
    'aprovado': 'sucesso',
    'rejeitado': 'erro',
    'ativo': 'sucesso',
    'concluido': 'concluido'
  };
  return mapeamento[status] || 'info';
};

/**
 * Obtém estatísticas de tesouraria
 * @route GET /api/tesouraria/estatisticas
 */
const obterEstatisticas = async (req, res) => {
  try {
    console.log('🔄 Carregando estatísticas de tesouraria...');

    const empresaId = req.usuario.empresaId;

    // Buscar estatísticas
    const [
      totalPlanos,
      planosAtivos,
      totalEntradas,
      totalSaidas
    ] = await Promise.all([
      PlanoTesouraria.count({ where: { empresaId } }),
      PlanoTesouraria.count({ where: { empresaId, status: 'ativo' } }),
      EntradaTesouraria.sum('valor', { where: { empresaId } }) || 0,
      SaidaTesouraria.sum('valor', { where: { empresaId } }) || 0
    ]);

    const saldoAtual = totalEntradas - totalSaidas;
    const saldoProjetado = saldoAtual * 1.1; // Projeção de 10% de crescimento

    const estatisticas = {
      total: totalPlanos,
      saldoAtual: parseFloat(saldoAtual.toFixed(2)),
      recebimentosPrevistos: parseFloat(totalEntradas.toFixed(2)),
      pagamentosPrevistos: parseFloat(totalSaidas.toFixed(2)),
      saldoProjetado: parseFloat(saldoProjetado.toFixed(2))
    };

    console.log('✅ Estatísticas de tesouraria carregadas:', estatisticas);

    res.status(200).json({
      status: 'success',
      data: estatisticas
    });

  } catch (error) {
    console.error('❌ Erro ao carregar estatísticas de tesouraria:', error);

    res.status(500).json({
      status: 'error',
      message: 'Erro interno do servidor',
      error: error.message
    });
  }
};

module.exports = {
  listarPlanos,
  listarPlanosPorOrcamento,
  criarPlano,
  criarPlanoCompleto,
  obterPlano,
  atualizarPlano,
  excluirPlano,
  aprovarPlano,
  rejeitarPlano,
  obterFluxoCaixa,
  importarDoOrcamento,
  importarAutomaticamenteOrcamento,
  obterAtividadesRecentes,
  obterEstatisticas
}