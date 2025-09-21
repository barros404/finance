'use strict';

const { SaidaTesouraria, PlanoTesouraria, Orcamento, Usuario } = require('../../models');
const { Op } = require('sequelize');

/**
 * Controlador para gerenciar operações relacionadas a Saídas de Tesouraria
 */
class SaidaTesourariaController {
  /**
   * Lista todas as saídas de um plano de tesouraria com paginação
   * @param {Object} req - Objeto de requisição do Express
   * @param {Object} res - Objeto de resposta do Express
   */
  static async listarSaidas(req, res) {
    try {
      const { plano_tesouraria_id } = req.params;
      const { 
        pagina = 1, 
        limite = 10, 
        data_inicio, 
        data_fim, 
        pgc_codigo, 
        prioridade, 
        status, 
        recorrente,
        importado_orcamento
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
      if (data_inicio && data_fim) {
        whereClause.data_vencimento = {
          [Op.between]: [new Date(data_inicio), new Date(data_fim)]
        };
      } else if (data_inicio) {
        whereClause.data_vencimento = { [Op.gte]: new Date(data_inicio) };
      } else if (data_fim) {
        whereClause.data_vencimento = { [Op.lte]: new Date(data_fim) };
      }
      
      if (pgc_codigo) whereClause.pgc_codigo = pgc_codigo;
      if (prioridade) whereClause.prioridade = parseInt(prioridade);
      if (status) whereClause.status = status;
      if (recorrente !== undefined) whereClause.recorrente = recorrente === 'true';
      if (importado_orcamento !== undefined) whereClause.importado_orcamento = importado_orcamento === 'true';
      
      const { count, rows: saidas } = await SaidaTesouraria.findAndCountAll({
        where: whereClause,
        include: [
          { model: PlanoTesouraria, as: 'plano_tesouraria', attributes: ['id', 'mes', 'ano'] },
          { model: Orcamento, as: 'orcamento_origem', attributes: ['id', 'descricao', 'ano'] },
          { model: Usuario, as: 'criador', attributes: ['id', 'nome', 'email'] }
        ],
        attributes: { exclude: ['deleted_at'] },
        limit: parseInt(limite),
        offset: parseInt(offset),
        order: [
          ['data_vencimento', 'ASC'],
          ['prioridade', 'ASC'],
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
        dados: saidas
      });
      
    } catch (error) {
      console.error('Erro ao listar saídas de tesouraria:', error);
      return res.status(500).json({
        sucesso: false,
        mensagem: 'Erro ao listar saídas de tesouraria',
        erro: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
  
  /**
   * Obtém uma saída de tesouraria pelo ID
   * @param {Object} req - Objeto de requisição do Express
   * @param {Object} res - Objeto de resposta do Express
   */
  static async obterPorId(req, res) {
    try {
      const { id, plano_tesouraria_id } = req.params;
      
      const saida = await SaidaTesouraria.findOne({
        where: { 
          id,
          plano_tesouraria_id
        },
        include: [
          { model: PlanoTesouraria, as: 'plano_tesouraria', attributes: ['id', 'mes', 'ano'] },
          { model: Orcamento, as: 'orcamento_origem', attributes: ['id', 'descricao', 'ano'] },
          { model: Usuario, as: 'criador', attributes: ['id', 'nome', 'email'] },
          { model: Usuario, as: 'ultimo_editor', attributes: ['id', 'nome', 'email'] }
        ],
        attributes: { exclude: ['deleted_at'] }
      });
      
      if (!saida) {
        return res.status(404).json({
          sucesso: false,
          mensagem: 'Saída de tesouraria não encontrada para o plano especificado'
        });
      }
      
      return res.status(200).json({
        sucesso: true,
        dados: saida
      });
      
    } catch (error) {
      console.error('Erro ao obter saída de tesouraria:', error);
      return res.status(500).json({
        sucesso: false,
        mensagem: 'Erro ao obter saída de tesouraria',
        erro: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
  
  /**
   * Cria uma nova saída no plano de tesouraria
   * @param {Object} req - Objeto de requisição do Express
   * @param {Object} res - Objeto de resposta do Express
   */
  static async criar(req, res) {
    const transaction = await SaidaTesouraria.sequelize.transaction();
    
    try {
      const { plano_tesouraria_id } = req.params;
      const { 
        pgc_codigo,
        pgc_nome,
        descricao,
        valor,
        data_vencimento,
        fornecedor,
        metodo_pagamento,
        prioridade,
        recorrente,
        frequencia,
        orcamento_id,
        orcamento_anual,
        orcamento_trimestral,
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
          mensagem: 'Não é possível adicionar saídas a um plano que não está em rascunho ou em aprovação'
        });
      }
      
      // Verifica se o orçamento existe se for fornecido
      if (orcamento_id) {
        const orcamento = await Orcamento.findByPk(orcamento_id, { transaction });
        if (!orcamento) {
          await transaction.rollback();
          return res.status(404).json({
            sucesso: false,
            mensagem: 'Orçamento não encontrado'
          });
        }
      }
      
      // Cria a saída
      const novaSaida = await SaidaTesouraria.create({
        plano_tesouraria_id,
        pgc_codigo,
        pgc_nome,
        descricao,
        valor,
        data_vencimento: data_vencimento || new Date(),
        fornecedor: fornecedor || null,
        metodo_pagamento: metodo_pagamento || 'TED',
        prioridade: prioridade || 3,
        recorrente: recorrente || false,
        frequencia: recorrente ? (frequencia || 'mensal') : null,
        orcamento_id: orcamento_id || null,
        orcamento_anual: orcamento_anual || null,
        orcamento_trimestral: orcamento_trimestral || null,
        status: 'pendente',
        importado_orcamento: false,
        observacoes: observacoes || null,
        criado_por: req.usuarioId,
        atualizado_por: req.usuarioId
      }, { transaction });
      
      await transaction.commit();
      
      // Busca a saída criada com os relacionamentos
      const saidaCompleta = await SaidaTesouraria.findByPk(novaSaida.id, {
        include: [
          { model: PlanoTesouraria, as: 'plano_tesouraria', attributes: ['id', 'mes', 'ano'] },
          { model: Orcamento, as: 'orcamento_origem', attributes: ['id', 'descricao', 'ano'] },
          { model: Usuario, as: 'criador', attributes: ['id', 'nome', 'email'] }
        ],
        attributes: { exclude: ['deleted_at'] }
      });
      
      return res.status(201).json({
        sucesso: true,
        mensagem: 'Saída adicionada ao plano de tesouraria com sucesso',
        dados: saidaCompleta
      });
      
    } catch (error) {
      await transaction.rollback();
      console.error('Erro ao adicionar saída ao plano de tesouraria:', error);
      return res.status(500).json({
        sucesso: false,
        mensagem: 'Erro ao adicionar saída ao plano de tesouraria',
        erro: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
  
  /**
   * Atualiza uma saída de tesouraria existente
   * @param {Object} req - Objeto de requisição do Express
   * @param {Object} res - Objeto de resposta do Express
   */
  static async atualizar(req, res) {
    const transaction = await SaidaTesouraria.sequelize.transaction();
    
    try {
      const { id, plano_tesouraria_id } = req.params;
      const { 
        pgc_codigo,
        pgc_nome,
        descricao,
        valor,
        data_vencimento,
        fornecedor,
        metodo_pagamento,
        prioridade,
        recorrente,
        frequencia,
        orcamento_id,
        orcamento_anual,
        orcamento_trimestral,
        status,
        data_pagamento,
        observacoes
      } = req.body;
      
      // Busca a saída existente
      const saida = await SaidaTesouraria.findOne({
        where: { 
          id,
          plano_tesouraria_id
        },
        transaction
      });
      
      if (!saida) {
        await transaction.rollback();
        return res.status(404).json({
          sucesso: false,
          mensagem: 'Saída de tesouraria não encontrada para o plano especificado'
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
          mensagem: 'Não é possível atualizar saídas de um plano que não está em rascunho, em aprovação ou ativo'
        });
      }
      
      // Verifica se o orçamento existe se for fornecido
      if (orcamento_id) {
        const orcamento = await Orcamento.findByPk(orcamento_id, { transaction });
        if (!orcamento) {
          await transaction.rollback();
          return res.status(404).json({
            sucesso: false,
            mensagem: 'Orçamento não encontrado'
          });
        }
      }
      
      // Atualiza os campos
      const camposAtualizacao = {};
      if (pgc_codigo !== undefined) camposAtualizacao.pgc_codigo = pgc_codigo;
      if (pgc_nome !== undefined) camposAtualizacao.pgc_nome = pgc_nome;
      if (descricao !== undefined) camposAtualizacao.descricao = descricao;
      if (valor !== undefined) camposAtualizacao.valor = valor;
      if (data_vencimento !== undefined) camposAtualizacao.data_vencimento = data_vencimento;
      if (fornecedor !== undefined) camposAtualizacao.fornecedor = fornecedor;
      if (metodo_pagamento !== undefined) camposAtualizacao.metodo_pagamento = metodo_pagamento;
      if (prioridade !== undefined) camposAtualizacao.prioridade = prioridade;
      if (recorrente !== undefined) camposAtualizacao.recorrente = recorrente;
      if (frequencia !== undefined) camposAtualizacao.frequencia = recorrente ? frequencia : null;
      if (orcamento_id !== undefined) camposAtualizacao.orcamento_id = orcamento_id || null;
      if (orcamento_anual !== undefined) camposAtualizacao.orcamento_anual = orcamento_anual || null;
      if (orcamento_trimestral !== undefined) camposAtualizacao.orcamento_trimestral = orcamento_trimestral || null;
      if (status !== undefined) camposAtualizacao.status = status;
      if (data_pagamento !== undefined) camposAtualizacao.data_pagamento = data_pagamento;
      if (observacoes !== undefined) camposAtualizacao.observacoes = observacoes;
      
      // Atualiza o registro
      await SaidaTesouraria.update(
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
      
      // Busca a saída atualizada com os relacionamentos
      const saidaAtualizada = await SaidaTesouraria.findByPk(id, {
        include: [
          { model: PlanoTesouraria, as: 'plano_tesouraria', attributes: ['id', 'mes', 'ano'] },
          { model: Orcamento, as: 'orcamento_origem', attributes: ['id', 'descricao', 'ano'] },
          { model: Usuario, as: 'criador', attributes: ['id', 'nome', 'email'] },
          { model: Usuario, as: 'ultimo_editor', attributes: ['id', 'nome', 'email'] }
        ],
        attributes: { exclude: ['deleted_at'] }
      });
      
      return res.status(200).json({
        sucesso: true,
        mensagem: 'Saída de tesouraria atualizada com sucesso',
        dados: saidaAtualizada
      });
      
    } catch (error) {
      await transaction.rollback();
      console.error('Erro ao atualizar saída de tesouraria:', error);
      return res.status(500).json({
        sucesso: false,
        mensagem: 'Erro ao atualizar saída de tesouraria',
        erro: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
  
  /**
   * Remove uma saída de tesouraria (soft delete)
   * @param {Object} req - Objeto de requisição do Express
   * @param {Object} res - Objeto de resposta do Express
   */
  static async excluir(req, res) {
    const transaction = await SaidaTesouraria.sequelize.transaction();
    
    try {
      const { id, plano_tesouraria_id } = req.params;
      
      // Verifica se a saída existe
      const saida = await SaidaTesouraria.findOne({
        where: { 
          id,
          plano_tesouraria_id
        },
        transaction
      });
      
      if (!saida) {
        await transaction.rollback();
        return res.status(404).json({
          sucesso: false,
          mensagem: 'Saída de tesouraria não encontrada para o plano especificado'
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
          mensagem: 'Não é possível excluir saídas de um plano que não está em rascunho ou em aprovação'
        });
      }
      
      // Realiza o soft delete
      await SaidaTesouraria.destroy({
        where: { 
          id,
          plano_tesouraria_id
        },
        transaction
      });
      
      await transaction.commit();
      
      return res.status(200).json({
        sucesso: true,
        mensagem: 'Saída de tesouraria removida com sucesso'
      });
      
    } catch (error) {
      await transaction.rollback();
      console.error('Erro ao remover saída de tesouraria:', error);
      return res.status(500).json({
        sucesso: false,
        mensagem: 'Erro ao remover saída de tesouraria',
        erro: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
  
  /**
   * Atualiza o status de uma saída de tesouraria
   * @param {Object} req - Objeto de requisição do Express
   * @param {Object} res - Objeto de resposta do Express
   */
  static async atualizarStatus(req, res) {
    const transaction = await SaidaTesouraria.sequelize.transaction();
    
    try {
      const { id, plano_tesouraria_id } = req.params;
      const { status, data_pagamento } = req.body;
      
      // Valida o status informado
      const statusValidos = ['pendente', 'agendado', 'pago', 'atrasado', 'cancelado'];
      if (!statusValidos.includes(status)) {
        await transaction.rollback();
        return res.status(400).json({
          sucesso: false,
          mensagem: 'Status inválido',
          statusValidos
        });
      }
      
      // Busca a saída existente
      const saida = await SaidaTesouraria.findOne({
        where: { 
          id,
          plano_tesouraria_id
        },
        transaction
      });
      
      if (!saida) {
        await transaction.rollback();
        return res.status(404).json({
          sucesso: false,
          mensagem: 'Saída de tesouraria não encontrada para o plano especificado'
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
          mensagem: 'Não é possível alterar o status de saídas em um plano que não está em rascunho, em aprovação ou ativo'
        });
      }
      
      // Atualiza o status e a data de pagamento se for o caso
      const camposAtualizacao = {
        status,
        atualizado_por: req.usuarioId
      };
      
      if (status === 'pago' && data_pagamento) {
        camposAtualizacao.data_pagamento = data_pagamento;
      } else if (status === 'pago' && !saida.data_pagamento) {
        // Se estiver marcando como pago e não foi informada data de pagamento, usa a data atual
        camposAtualizacao.data_pagamento = new Date();
      } else if (status !== 'pago') {
        // Se não for status 'pago', limpa a data de pagamento
        camposAtualizacao.data_pagamento = null;
      }
      
      // Atualiza o registro
      await SaidaTesouraria.update(
        camposAtualizacao,
        { 
          where: { 
            id,
            plano_tesouraria_id
          },
          transaction
        }
      );
      
      await transaction.commit();
      
      // Busca a saída atualizada com os relacionamentos
      const saidaAtualizada = await SaidaTesouraria.findByPk(id, {
        include: [
          { model: PlanoTesouraria, as: 'plano_tesouraria', attributes: ['id', 'mes', 'ano'] },
          { model: Orcamento, as: 'orcamento_origem', attributes: ['id', 'descricao', 'ano'] },
          { model: Usuario, as: 'criador', attributes: ['id', 'nome', 'email'] },
          { model: Usuario, as: 'ultimo_editor', attributes: ['id', 'nome', 'email'] }
        ],
        attributes: { exclude: ['deleted_at'] }
      });
      
      return res.status(200).json({
        sucesso: true,
        mensagem: `Status da saída de tesouraria atualizado para "${status}" com sucesso`,
        dados: saidaAtualizada
      });
      
    } catch (error) {
      await transaction.rollback();
      console.error('Erro ao atualizar status da saída de tesouraria:', error);
      return res.status(500).json({
        sucesso: false,
        mensagem: 'Erro ao atualizar status da saída de tesouraria',
        erro: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
  
  /**
   * Importa saídas de um orçamento para o plano de tesouraria
   * @param {Object} req - Objeto de requisição do Express
   * @param {Object} res - Objeto de resposta do Express
   */
  static async importarDoOrcamento(req, res) {
    const transaction = await SaidaTesouraria.sequelize.transaction();
    
    try {
      const { plano_tesouraria_id } = req.params;
      const { orcamento_id, mes_referencia } = req.body;
      
      // Validação básica
      if (!orcamento_id) {
        await transaction.rollback();
        return res.status(400).json({
          sucesso: false,
          mensagem: 'O ID do orçamento é obrigatório'
        });
      }
      
      // Busca o plano de tesouraria
      const plano = await PlanoTesouraria.findByPk(plano_tesouraria_id, { transaction });
      
      if (!plano) {
        await transaction.rollback();
        return res.status(404).json({
          sucesso: false,
          mensagem: 'Plano de tesouraria não encontrado'
        });
      }
      
      // Verifica se o plano está em um status que permite importação
      if (plano.status !== 'rascunho' && plano.status !== 'em_aprovacao') {
        await transaction.rollback();
        return res.status(400).json({
          sucesso: false,
          mensagem: 'Só é possível importar dados para planos em rascunho ou aguardando aprovação'
        });
      }
      
      // Busca o orçamento
      const orcamento = await Orcamento.findByPk(orcamento_id, { transaction });
      
      if (!orcamento) {
        await transaction.rollback();
        return res.status(404).json({
          sucesso: false,
          mensagem: 'Orçamento não encontrado'
        });
      }
      
      // Aqui você implementaria a lógica para buscar as despesas do orçamento
      // e criar as saídas correspondentes no plano de tesouraria
      // Este é um exemplo simplificado
      
      // Exemplo de como seria a busca de despesas do orçamento:
      // const despesasOrcamento = await OrcamentoDespesa.findAll({
      //   where: { orcamento_id },
      //   include: [
      //     { model: Pgc, as: 'pgc', attributes: ['codigo', 'nome'] }
      //   ],
      //   transaction
      // });
      
      // Cria as saídas no plano de tesouraria
      // for (const despesa of despesasOrcamento) {
      //   await SaidaTesouraria.create({
      //     plano_tesouraria_id,
      //     pgc_codigo: despesa.pgc.codigo,
      //     pgc_nome: despesa.pgc.nome,
      //     descricao: despesa.descricao,
      //     valor: despesa.valor_mensal[mes_referencia - 1], // Assumindo que o valor_mensal é um array com os 12 meses
      //     data_vencimento: new Date(plano.ano, plano.mes - 1, 10), // Dia 10 do mês, por exemplo
      //     fornecedor: despesa.fornecedor || null,
      //     metodo_pagamento: 'TED', // Valor padrão
      //     prioridade: 3, // Prioridade média
      //     recorrente: true,
      //     frequencia: 'mensal',
      //     orcamento_id,
      //     orcamento_anual: despesa.valor_anual,
      //     orcamento_trimestral: despesa.valor_trimestral,
      //     status: 'pendente',
      //     importado_orcamento: true,
      //     observacoes: `Importado do orçamento ${orcamento.descricao} (${orcamento.ano})`,
      //     criado_por: req.usuarioId,
      //     atualizado_por: req.usuarioId
      //   }, { transaction });
      // }
      
      // Atualiza o plano para referenciar o orçamento se ainda não estiver
      if (!plano.orcamento_id) {
        await PlanoTesouraria.update(
          {
            orcamento_id,
            atualizado_por: req.usuarioId
          },
          { 
            where: { id: plano_tesouraria_id },
            transaction
          }
        );
      }
      
      await transaction.commit();
      
      // Retorna as saídas importadas (no exemplo, retornamos uma lista vazia)
      return res.status(200).json({
        sucesso: true,
        mensagem: 'Dados do orçamento importados com sucesso para o plano de tesouraria',
        dados: {
          // itens_importados: saídasCriadas
        }
      });
      
    } catch (error) {
      await transaction.rollback();
      console.error('Erro ao importar dados do orçamento para o plano de tesouraria:', error);
      return res.status(500).json({
        sucesso: false,
        mensagem: 'Erro ao importar dados do orçamento para o plano de tesouraria',
        erro: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
}

module.exports = SaidaTesourariaController;
