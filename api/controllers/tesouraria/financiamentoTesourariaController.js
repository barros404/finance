'use strict';

const { FinanciamentoTesouraria, PlanoTesouraria, Usuario } = require('../../models');
const { Op } = require('sequelize');

/**
 * Controlador para gerenciar operações relacionadas a Financiamentos de Tesouraria
 */
class FinanciamentoTesourariaController {
  /**
   * Lista todos os financiamentos de um plano de tesouraria com paginação
   * @param {Object} req - Objeto de requisição do Express
   * @param {Object} res - Objeto de resposta do Express
   */
  static async listarFinanciamentos(req, res) {
    try {
      const { plano_tesouraria_id } = req.params;
      const { 
        pagina = 1, 
        limite = 10, 
        tipo_financiamento, 
        status, 
        data_inicio, 
        data_fim 
      } = req.query;
      
      const offset = (pagina - 1) * limite;
      
      // Verifica se o plano de tesouraria existe
      const plano = await PlanoTesouraria.findByPk(plano_tesouraria_id);
      if (!plano) {
        return res.status(404).json({
          sucesso: false,
          mensagem: 'Plano de tesouraria não encontrado'
        });
      }
      
      const whereClause = { plano_tesouraria_id };
      
      // Filtros opcionais
      if (tipo_financiamento) whereClause.tipo_financiamento = tipo_financiamento;
      if (status) whereClause.status = status;
      
      // Filtro por data de contratação
      if (data_inicio && data_fim) {
        whereClause.data_contratacao = {
          [Op.between]: [new Date(data_inicio), new Date(data_fim)]
        };
      } else if (data_inicio) {
        whereClause.data_contratacao = { [Op.gte]: new Date(data_inicio) };
      } else if (data_fim) {
        whereClause.data_contratacao = { [Op.lte]: new Date(data_fim) };
      }
      
      const { count, rows: financiamentos } = await FinanciamentoTesouraria.findAndCountAll({
        where: whereClause,
        include: [
          { model: PlanoTesouraria, as: 'plano_tesouraria', attributes: ['id', 'mes', 'ano'] },
          { model: Usuario, as: 'criador', attributes: ['id', 'nome', 'email'] }
        ],
        attributes: { exclude: ['deleted_at'] },
        limit: parseInt(limite),
        offset: parseInt(offset),
        order: [
          ['data_primeiro_vencimento', 'ASC'],
          ['created_at', 'DESC']
        ]
      });
      
      const totalPaginas = Math.ceil(count / limite);
      
      return res.status(200).json({
        sucesso: true,
        total: count,
        totalPaginas,
        paginaAtual: parseInt(pagina),
        itensPorPagina: parseInt(limite),
        dados: financiamentos
      });
      
    } catch (error) {
      console.error('Erro ao listar financiamentos de tesouraria:', error);
      return res.status(500).json({
        sucesso: false,
        mensagem: 'Erro ao listar financiamentos de tesouraria',
        erro: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
  
  /**
   * Obtém um financiamento de tesouraria pelo ID
   * @param {Object} req - Objeto de requisição do Express
   * @param {Object} res - Objeto de resposta do Express
   */
  static async obterPorId(req, res) {
    try {
      const { id, plano_tesouraria_id } = req.params;
      
      const financiamento = await FinanciamentoTesouraria.findOne({
        where: { 
          id,
          plano_tesouraria_id
        },
        include: [
          { model: PlanoTesouraria, as: 'plano_tesouraria', attributes: ['id', 'mes', 'ano'] },
          { model: Usuario, as: 'criador', attributes: ['id', 'nome', 'email'] },
          { model: Usuario, as: 'ultimo_editor', attributes: ['id', 'nome', 'email'] }
        ],
        attributes: { exclude: ['deleted_at'] }
      });
      
      if (!financiamento) {
        return res.status(404).json({
          sucesso: false,
          mensagem: 'Financiamento de tesouraria não encontrado para o plano especificado'
        });
      }
      
      return res.status(200).json({
        sucesso: true,
        dados: financiamento
      });
      
    } catch (error) {
      console.error('Erro ao obter financiamento de tesouraria:', error);
      return res.status(500).json({
        sucesso: false,
        mensagem: 'Erro ao obter financiamento de tesouraria',
        erro: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
  
  /**
   * Cria um novo financiamento no plano de tesouraria
   * @param {Object} req - Objeto de requisição do Express
   * @param {Object} res - Objeto de resposta do Express
   */
  static async criar(req, res) {
    const transaction = await FinanciamentoTesouraria.sequelize.transaction();
    
    try {
      const { plano_tesouraria_id } = req.params;
      const { 
        tipo_financiamento,
        descricao,
        valor,
        taxa_juros,
        prazo_meses,
        valor_parcela,
        instituicao_financeira,
        data_contratacao,
        data_primeiro_vencimento,
        status,
        observacoes
      } = req.body;
      
      // Verifica se o plano de tesouraria existe e está em um status que permite alterações
      const plano = await PlanoTesouraria.findByPk(plano_tesouraria_id, { transaction });
      
      if (!plano) {
        await transaction.rollback();
        return res.status(404).json({
          sucesso: false,
          mensagem: 'Plano de tesouraria não encontrado'
        });
      }
      
      if (plano.status !== 'rascunho' && plano.status !== 'em_aprovacao') {
        await transaction.rollback();
        return res.status(400).json({
          sucesso: false,
          mensagem: 'Não é possível adicionar financiamentos a um plano que não está em rascunho ou em aprovação'
        });
      }
      
      // Validação dos dados
      if (tipo_financiamento === 'bancario' && !instituicao_financeira) {
        await transaction.rollback();
        return res.status(400).json({
          sucesso: false,
          mensagem: 'Para financiamentos bancários, é obrigatório informar a instituição financeira'
        });
      }
      
      // Cálculo automático do valor da parcela se não informado
      let valorParcelaCalculado = valor_parcela;
      if (!valor_parcela && valor && prazo_meses && prazo_meses > 0) {
        // Cálculo simplificado da parcela (sem considerar juros compostos para este exemplo)
        const jurosMensal = (taxa_juros || 0) / 100;
        valorParcelaCalculado = (valor * (1 + jurosMensal)) / prazo_meses;
      }
      
      // Cria o financiamento
      const novoFinanciamento = await FinanciamentoTesouraria.create({
        plano_tesouraria_id,
        tipo_financiamento,
        descricao: descricao || null,
        valor,
        taxa_juros: taxa_juros || 0,
        prazo_meses,
        valor_parcela: valorParcelaCalculado,
        instituicao_financeira: tipo_financiamento === 'bancario' ? instituicao_financeira : null,
        data_contratacao: data_contratacao || new Date(),
        data_primeiro_vencimento: data_primeiro_vencimento || new Date(),
        status: status || 'proposta',
        observacoes: observacoes || null,
        criado_por: req.usuarioId,
        atualizado_por: req.usuarioId
      }, { transaction });
      
      await transaction.commit();
      
      // Busca o financiamento criado com os relacionamentos
      const financiamentoCompleto = await FinanciamentoTesouraria.findByPk(novoFinanciamento.id, {
        include: [
          { model: PlanoTesouraria, as: 'plano_tesouraria', attributes: ['id', 'mes', 'ano'] },
          { model: Usuario, as: 'criador', attributes: ['id', 'nome', 'email'] }
        ],
        attributes: { exclude: ['deleted_at'] }
      });
      
      return res.status(201).json({
        sucesso: true,
        mensagem: 'Financiamento adicionado ao plano de tesouraria com sucesso',
        dados: financiamentoCompleto
      });
      
    } catch (error) {
      await transaction.rollback();
      console.error('Erro ao adicionar financiamento ao plano de tesouraria:', error);
      return res.status(500).json({
        sucesso: false,
        mensagem: 'Erro ao adicionar financiamento ao plano de tesouraria',
        erro: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
  
  /**
   * Atualiza um financiamento de tesouraria existente
   * @param {Object} req - Objeto de requisição do Express
   * @param {Object} res - Objeto de resposta do Express
   */
  static async atualizar(req, res) {
    const transaction = await FinanciamentoTesouraria.sequelize.transaction();
    
    try {
      const { id, plano_tesouraria_id } = req.params;
      const { 
        tipo_financiamento,
        descricao,
        valor,
        taxa_juros,
        prazo_meses,
        valor_parcela,
        instituicao_financeira,
        data_contratacao,
        data_primeiro_vencimento,
        status,
        observacoes
      } = req.body;
      
      // Busca o financiamento existente
      const financiamento = await FinanciamentoTesouraria.findOne({
        where: { 
          id,
          plano_tesouraria_id
        },
        transaction
      });
      
      if (!financiamento) {
        await transaction.rollback();
        return res.status(404).json({
          sucesso: false,
          mensagem: 'Financiamento de tesouraria não encontrado para o plano especificado'
        });
      }
      
      // Verifica se o plano de tesouraria está em um status que permite alterações
      const plano = await PlanoTesouraria.findByPk(plano_tesouraria_id, { transaction });
      
      if (!plano) {
        await transaction.rollback();
        return res.status(404).json({
          sucesso: false,
          mensagem: 'Plano de tesouraria não encontrado'
        });
      }
      
      if (plano.status !== 'rascunho' && plano.status !== 'em_aprovacao') {
        await transaction.rollback();
        return res.status(400).json({
          sucesso: false,
          mensagem: 'Não é possível atualizar financiamentos de um plano que não está em rascunho ou em aprovação'
        });
      }
      
      // Validação dos dados
      if (tipo_financiamento === 'bancario' && !instituicao_financeira) {
        await transaction.rollback();
        return res.status(400).json({
          sucesso: false,
          mensagem: 'Para financiamentos bancários, é obrigatório informar a instituição financeira'
        });
      }
      
      // Cálculo automático do valor da parcela se não informado
      let valorParcelaAtualizado = valor_parcela;
      if (valor_parcela === undefined && (valor !== undefined || taxa_juros !== undefined || prazo_meses !== undefined)) {
        const valorAtual = valor !== undefined ? valor : financiamento.valor;
        const taxaAtual = taxa_juros !== undefined ? taxa_juros : financiamento.taxa_juros;
        const prazoAtual = prazo_meses !== undefined ? prazo_meses : financiamento.prazo_meses;
        
        if (valorAtual && prazoAtual && prazoAtual > 0) {
          // Cálculo simplificado da parcela (sem considerar juros compostos para este exemplo)
          const jurosMensal = (taxaAtual || 0) / 100;
          valorParcelaAtualizado = (valorAtual * (1 + jurosMensal)) / prazoAtual;
        }
      }
      
      // Atualiza os campos
      const camposAtualizacao = {};
      if (tipo_financiamento !== undefined) camposAtualizacao.tipo_financiamento = tipo_financiamento;
      if (descricao !== undefined) camposAtualizacao.descricao = descricao;
      if (valor !== undefined) camposAtualizacao.valor = valor;
      if (taxa_juros !== undefined) camposAtualizacao.taxa_juros = taxa_juros;
      if (prazo_meses !== undefined) camposAtualizacao.prazo_meses = prazo_meses;
      if (valor_parcela !== undefined || valorParcelaAtualizado !== undefined) {
        camposAtualizacao.valor_parcela = valor_parcela !== undefined ? valor_parcela : valorParcelaAtualizado;
      }
      if (instituicao_financeira !== undefined) {
        camposAtualizacao.instituicao_financeira = tipo_financiamento === 'bancario' ? instituicao_financeira : null;
      }
      if (data_contratacao !== undefined) camposAtualizacao.data_contratacao = data_contratacao;
      if (data_primeiro_vencimento !== undefined) camposAtualizacao.data_primeiro_vencimento = data_primeiro_vencimento;
      if (status !== undefined) camposAtualizacao.status = status;
      if (observacoes !== undefined) camposAtualizacao.observacoes = observacoes;
      
      // Atualiza o registro
      await FinanciamentoTesouraria.update(
        {
          ...camposAtualizacao,
          atualizado_por: req.usuarioId // ID do usuário autenticado
        },
        { 
          where: { 
            id,
            plano_tesouraria_id
          },
          transaction
        }
      );
      
      await transaction.commit();
      
      // Busca o financiamento atualizado com os relacionamentos
      const financiamentoAtualizado = await FinanciamentoTesouraria.findByPk(id, {
        include: [
          { model: PlanoTesouraria, as: 'plano_tesouraria', attributes: ['id', 'mes', 'ano'] },
          { model: Usuario, as: 'criador', attributes: ['id', 'nome', 'email'] },
          { model: Usuario, as: 'ultimo_editor', attributes: ['id', 'nome', 'email'] }
        ],
        attributes: { exclude: ['deleted_at'] }
      });
      
      return res.status(200).json({
        sucesso: true,
        mensagem: 'Financiamento de tesouraria atualizado com sucesso',
        dados: financiamentoAtualizado
      });
      
    } catch (error) {
      await transaction.rollback();
      console.error('Erro ao atualizar financiamento de tesouraria:', error);
      return res.status(500).json({
        sucesso: false,
        mensagem: 'Erro ao atualizar financiamento de tesouraria',
        erro: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
  
  /**
   * Remove um financiamento de tesouraria (soft delete)
   * @param {Object} req - Objeto de requisição do Express
   * @param {Object} res - Objeto de resposta do Express
   */
  static async excluir(req, res) {
    const transaction = await FinanciamentoTesouraria.sequelize.transaction();
    
    try {
      const { id, plano_tesouraria_id } = req.params;
      
      // Verifica se o financiamento existe
      const financiamento = await FinanciamentoTesouraria.findOne({
        where: { 
          id,
          plano_tesouraria_id
        },
        transaction
      });
      
      if (!financiamento) {
        await transaction.rollback();
        return res.status(404).json({
          sucesso: false,
          mensagem: 'Financiamento de tesouraria não encontrado para o plano especificado'
        });
      }
      
      // Verifica se o plano de tesouraria está em um status que permite exclusão
      const plano = await PlanoTesouraria.findByPk(plano_tesouraria_id, { transaction });
      
      if (!plano) {
        await transaction.rollback();
        return res.status(404).json({
          sucesso: false,
          mensagem: 'Plano de tesouraria não encontrado'
        });
      }
      
      if (plano.status !== 'rascunho' && plano.status !== 'em_aprovacao') {
        await transaction.rollback();
        return res.status(400).json({
          sucesso: false,
          mensagem: 'Não é possível excluir financiamentos de um plano que não está em rascunho ou em aprovação'
        });
      }
      
      // Realiza o soft delete
      await FinanciamentoTesouraria.destroy({
        where: { 
          id,
          plano_tesouraria_id
        },
        transaction
      });
      
      await transaction.commit();
      
      return res.status(200).json({
        sucesso: true,
        mensagem: 'Financiamento de tesouraria removido com sucesso'
      });
      
    } catch (error) {
      await transaction.rollback();
      console.error('Erro ao remover financiamento de tesouraria:', error);
      return res.status(500).json({
        sucesso: false,
        mensagem: 'Erro ao remover financiamento de tesouraria',
        erro: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
  
  /**
   * Atualiza o status de um financiamento de tesouraria
   * @param {Object} req - Objeto de requisição do Express
   * @param {Object} res - Objeto de resposta do Express
   */
  static async atualizarStatus(req, res) {
    const transaction = await FinanciamentoTesouraria.sequelize.transaction();
    
    try {
      const { id, plano_tesouraria_id } = req.params;
      const { status } = req.body;
      
      // Valida o status informado
      const statusValidos = ['proposta', 'aprovado', 'contratado', 'liquidado', 'cancelado'];
      if (!statusValidos.includes(status)) {
        await transaction.rollback();
        return res.status(400).json({
          sucesso: false,
          mensagem: 'Status inválido',
          statusValidos
        });
      }
      
      // Busca o financiamento existente
      const financiamento = await FinanciamentoTesouraria.findOne({
        where: { 
          id,
          plano_tesouraria_id
        },
        transaction
      });
      
      if (!financiamento) {
        await transaction.rollback();
        return res.status(404).json({
          sucesso: false,
          mensagem: 'Financiamento de tesouraria não encontrado para o plano especificado'
        });
      }
      
      // Verifica se o plano de tesouraria está em um status que permite alterações
      const plano = await PlanoTesouraria.findByPk(plano_tesouraria_id, { transaction });
      
      if (!plano) {
        await transaction.rollback();
        return res.status(404).json({
          sucesso: false,
          mensagem: 'Plano de tesouraria não encontrado'
        });
      }
      
      if (plano.status !== 'rascunho' && plano.status !== 'em_aprovacao' && plano.status !== 'ativo') {
        await transaction.rollback();
        return res.status(400).json({
          sucesso: false,
          mensagem: 'Não é possível alterar o status de financiamentos em um plano que não está em rascunho, em aprovação ou ativo'
        });
      }
      
      // Valida a transição de status
      const transicoesValidas = {
        'proposta': ['aprovado', 'cancelado'],
        'aprovado': ['contratado', 'cancelado'],
        'contratado': ['liquidado', 'cancelado'],
        'liquidado': [],
        'cancelado': []
      };
      
      if (!transicoesValidas[financiamento.status].includes(status)) {
        await transaction.rollback();
        return res.status(400).json({
          sucesso: false,
          mensagem: `Transição de status inválida. Status atual: ${financiamento.status}, Status desejado: ${status}`,
          transicoesValidas: transicoesValidas[financiamento.status]
        });
      }
      
      // Atualiza o status
      await FinanciamentoTesouraria.update(
        {
          status,
          atualizado_por: req.usuarioId // ID do usuário autenticado
        },
        { 
          where: { 
            id,
            plano_tesouraria_id
          },
          transaction
        }
      );
      
      await transaction.commit();
      
      // Busca o financiamento atualizado com os relacionamentos
      const financiamentoAtualizado = await FinanciamentoTesouraria.findByPk(id, {
        include: [
          { model: PlanoTesouraria, as: 'plano_tesouraria', attributes: ['id', 'mes', 'ano'] },
          { model: Usuario, as: 'criador', attributes: ['id', 'nome', 'email'] },
          { model: Usuario, as: 'ultimo_editor', attributes: ['id', 'nome', 'email'] }
        ],
        attributes: { exclude: ['deleted_at'] }
      });
      
      return res.status(200).json({
        sucesso: true,
        mensagem: `Status do financiamento de tesouraria atualizado para "${status}" com sucesso`,
        dados: financiamentoAtualizado
      });
      
    } catch (error) {
      await transaction.rollback();
      console.error('Erro ao atualizar status do financiamento de tesouraria:', error);
      return res.status(500).json({
        sucesso: false,
        mensagem: 'Erro ao atualizar status do financiamento de tesouraria',
        erro: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
  
  /**
   * Gera o cronograma de pagamentos de um financiamento
   * @param {Object} req - Objeto de requisição do Express
   * @param {Object} res - Objeto de resposta do Express
   */
  static async gerarCronograma(req, res) {
    try {
      const { id, plano_tesouraria_id } = req.params;
      
      // Busca o financiamento
      const financiamento = await FinanciamentoTesouraria.findOne({
        where: { 
          id,
          plano_tesouraria_id
        },
        include: [
          { model: PlanoTesouraria, as: 'plano_tesouraria', attributes: ['id', 'mes', 'ano'] }
        ]
      });
      
      if (!financiamento) {
        return res.status(404).json({
          sucesso: false,
          mensagem: 'Financiamento de tesouraria não encontrado para o plano especificado'
        });
      }
      
      // Verifica se o financiamento está em um status que permite gerar o cronograma
      if (financiamento.status !== 'aprovado' && financiamento.status !== 'contratado') {
        return res.status(400).json({
          sucesso: false,
          mensagem: 'Só é possível gerar o cronograma para financiamentos aprovados ou contratados'
        });
      }
      
      // Gera o cronograma de pagamentos
      const cronograma = [];
      const dataBase = new Date(financiamento.data_primeiro_vencimento);
      
      for (let i = 0; i < financiamento.prazo_meses; i++) {
        const dataVencimento = new Date(dataBase);
        dataVencimento.setMonth(dataBase.getMonth() + i);
        
        // Ajusta para o último dia do mês se necessário
        if (financiamento.dia_vencimento) {
          const ultimoDiaMes = new Date(dataVencimento.getFullYear(), dataVencimento.getMonth() + 1, 0).getDate();
          dataVencimento.setDate(Math.min(financiamento.dia_vencimento, ultimoDiaMes));
        }
        
        cronograma.push({
          numero_parcela: i + 1,
          data_vencimento: dataVencimento.toISOString().split('T')[0],
          valor_parcela: financiamento.valor_parcela,
          saldo_devedor: Math.max(0, financiamento.valor - (i * financiamento.valor_parcela)),
          status: 'pendente' // Seria atualizado conforme os pagamentos forem realizados
        });
      }
      
      return res.status(200).json({
        sucesso: true,
        mensagem: 'Cronograma de pagamentos gerado com sucesso',
        dados: {
          financiamento: {
            id: financiamento.id,
            descricao: financiamento.descricao,
            valor_total: financiamento.valor,
            prazo_meses: financiamento.prazo_meses,
            taxa_juros: financiamento.taxa_juros,
            valor_parcela: financiamento.valor_parcela,
            data_primeiro_vencimento: financiamento.data_primeiro_vencimento
          },
          cronograma
        }
      });
      
    } catch (error) {
      console.error('Erro ao gerar cronograma de pagamentos:', error);
      return res.status(500).json({
        sucesso: false,
        mensagem: 'Erro ao gerar cronograma de pagamentos',
        erro: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
}

module.exports = FinanciamentoTesourariaController;
