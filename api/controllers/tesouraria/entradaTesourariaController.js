'use strict';

const { EntradaTesouraria, PlanoTesouraria, Orcamento, Usuario } = require('../../models');
const { Op } = require('sequelize');

/**
 * Controlador para gerenciar operações relacionadas a Entradas de Tesouraria
 */
class EntradaTesourariaController {
  /**
   * Lista todas as entradas de um plano de tesouraria com paginação
   * @param {Object} req - Objeto de requisição do Express
   * @param {Object} res - Objeto de resposta do Express
   */
  static async listarEntradas(req, res) {
    try {
      const { plano_tesouraria_id } = req.params;
      const { pagina = 1, limite = 10, data_inicio, data_fim, tipo, status } = req.query;
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
        whereClause.data_entrada = {
          [Op.between]: [new Date(data_inicio), new Date(data_fim)]
        };
      } else if (data_inicio) {
        whereClause.data_entrada = { [Op.gte]: new Date(data_inicio) };
      } else if (data_fim) {
        whereClause.data_entrada = { [Op.lte]: new Date(data_fim) };
      }
      
      if (tipo) whereClause.tipo = tipo;
      if (status) whereClause.status = status;
      
      const { count, rows: entradas } = await EntradaTesouraria.findAndCountAll({
        where: whereClause,
        include: [
          { model: PlanoTesouraria, as: 'plano_tesouraria', attributes: ['id', 'mes', 'ano'] },
          { model: Orcamento, as: 'orcamento_origem', attributes: ['id', 'descricao', 'ano'] },
          { model: Usuario, as: 'criador', attributes: ['id', 'nome', 'email'] }
        ],
        attributes: { exclude: ['deleted_at'] },
        limit: parseInt(limite),
        offset: parseInt(offset),
        order: [['data_entrada', 'ASC'], ['created_at', 'DESC']]
      });
      
      const totalPaginas = Math.ceil(count / limite);
      
      return res.status(200).json({
        sucesso: true,
        total: count,
        totalPaginas,
        paginaAtual: parseInt(pagina),
        itensPorPagina: parseInt(limite),
        dados: entradas
      });
      
    } catch (error) {
      console.error('Erro ao listar entradas de tesouraria:', error);
      return res.status(500).json({
        sucesso: false,
        mensagem: 'Erro ao listar entradas de tesouraria',
        erro: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
  
  /**
   * Obtém uma entrada de tesouraria pelo ID
   * @param {Object} req - Objeto de requisição do Express
   * @param {Object} res - Objeto de resposta do Express
   */
  static async obterPorId(req, res) {
    try {
      const { id, plano_tesouraria_id } = req.params;
      
      const entrada = await EntradaTesouraria.findOne({
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
      
      if (!entrada) {
        return res.status(404).json({
          sucesso: false,
          mensagem: 'Entrada de tesouraria não encontrada para o plano especificado'
        });
      }
      
      return res.status(200).json({
        sucesso: true,
        dados: entrada
      });
      
    } catch (error) {
      console.error('Erro ao obter entrada de tesouraria:', error);
      return res.status(500).json({
        sucesso: false,
        mensagem: 'Erro ao obter entrada de tesouraria',
        erro: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
  
  /**
   * Cria uma nova entrada no plano de tesouraria
   * @param {Object} req - Objeto de requisição do Express
   * @param {Object} res - Objeto de resposta do Express
   */
  static async criar(req, res) {
    const transaction = await EntradaTesouraria.sequelize.transaction();
    
    try {
      const { plano_tesouraria_id } = req.params;
      const { 
        tipo, 
        descricao, 
        valor, 
        data_entrada, 
        origem, 
        orcamento_id, 
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
          mensagem: 'Não é possível adicionar entradas a um plano que não está em rascunho ou em aprovação'
        });
      }
      
      // Cria a entrada
      const novaEntrada = await EntradaTesouraria.create({
        plano_tesouraria_id,
        tipo,
        descricao,
        valor,
        data_entrada: data_entrada || new Date(),
        origem: origem || null,
        orcamento_id: orcamento_id || null,
        status: 'pendente',
        observacoes: observacoes || null,
        criado_por: req.usuarioId,
        atualizado_por: req.usuarioId
      }, { transaction });
      
      await transaction.commit();
      
      // Busca a entrada criada com os relacionamentos
      const entradaCompleta = await EntradaTesouraria.findByPk(novaEntrada.id, {
        include: [
          { model: PlanoTesouraria, as: 'plano_tesouraria', attributes: ['id', 'mes', 'ano'] },
          { model: Orcamento, as: 'orcamento_origem', attributes: ['id', 'descricao', 'ano'] },
          { model: Usuario, as: 'criador', attributes: ['id', 'nome', 'email'] }
        ],
        attributes: { exclude: ['deleted_at'] }
      });
      
      return res.status(201).json({
        sucesso: true,
        mensagem: 'Entrada adicionada ao plano de tesouraria com sucesso',
        dados: entradaCompleta
      });
      
    } catch (error) {
      await transaction.rollback();
      console.error('Erro ao adicionar entrada ao plano de tesouraria:', error);
      return res.status(500).json({
        sucesso: false,
        mensagem: 'Erro ao adicionar entrada ao plano de tesouraria',
        erro: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
  
  /**
   * Atualiza uma entrada de tesouraria existente
   * @param {Object} req - Objeto de requisição do Express
   * @param {Object} res - Objeto de resposta do Express
   */
  static async atualizar(req, res) {
    const transaction = await EntradaTesouraria.sequelize.transaction();
    
    try {
      const { id, plano_tesouraria_id } = req.params;
      const { 
        tipo, 
        descricao, 
        valor, 
        data_entrada, 
        origem, 
        orcamento_id, 
        status, 
        observacoes 
      } = req.body;
      
      // Busca a entrada existente
      const entrada = await EntradaTesouraria.findOne({
        where: { 
          id,
          plano_tesouraria_id
        },
        transaction
      });
      
      if (!entrada) {
        await transaction.rollback();
        return res.status(404).json({
          sucesso: false,
          mensagem: 'Entrada de tesouraria não encontrada para o plano especificado'
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
          mensagem: 'Não é possível atualizar entradas de um plano que não está em rascunho ou em aprovação'
        });
      }
      
      // Atualiza os campos
      const camposAtualizacao = {};
      if (tipo !== undefined) camposAtualizacao.tipo = tipo;
      if (descricao !== undefined) camposAtualizacao.descricao = descricao;
      if (valor !== undefined) camposAtualizacao.valor = valor;
      if (data_entrada !== undefined) camposAtualizacao.data_entrada = data_entrada;
      if (origem !== undefined) camposAtualizacao.origem = origem;
      if (orcamento_id !== undefined) camposAtualizacao.orcamento_id = orcamento_id || null;
      if (status !== undefined) camposAtualizacao.status = status;
      if (observacoes !== undefined) camposAtualizacao.observacoes = observacoes;
      
      // Atualiza o registro
      await EntradaTesouraria.update(
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
      
      // Busca a entrada atualizada com os relacionamentos
      const entradaAtualizada = await EntradaTesouraria.findByPk(id, {
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
        mensagem: 'Entrada de tesouraria atualizada com sucesso',
        dados: entradaAtualizada
      });
      
    } catch (error) {
      await transaction.rollback();
      console.error('Erro ao atualizar entrada de tesouraria:', error);
      return res.status(500).json({
        sucesso: false,
        mensagem: 'Erro ao atualizar entrada de tesouraria',
        erro: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
  
  /**
   * Remove uma entrada de tesouraria (soft delete)
   * @param {Object} req - Objeto de requisição do Express
   * @param {Object} res - Objeto de resposta do Express
   */
  static async excluir(req, res) {
    const transaction = await EntradaTesouraria.sequelize.transaction();
    
    try {
      const { id, plano_tesouraria_id } = req.params;
      
      // Verifica se a entrada existe
      const entrada = await EntradaTesouraria.findOne({
        where: { 
          id,
          plano_tesouraria_id
        },
        transaction
      });
      
      if (!entrada) {
        await transaction.rollback();
        return res.status(404).json({
          sucesso: false,
          mensagem: 'Entrada de tesouraria não encontrada para o plano especificado'
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
          mensagem: 'Não é possível excluir entradas de um plano que não está em rascunho ou em aprovação'
        });
      }
      
      // Realiza o soft delete
      await EntradaTesouraria.destroy({
        where: { 
          id,
          plano_tesouraria_id
        },
        transaction
      });
      
      await transaction.commit();
      
      return res.status(200).json({
        sucesso: true,
        mensagem: 'Entrada de tesouraria removida com sucesso'
      });
      
    } catch (error) {
      await transaction.rollback();
      console.error('Erro ao remover entrada de tesouraria:', error);
      return res.status(500).json({
        sucesso: false,
        mensagem: 'Erro ao remover entrada de tesouraria',
        erro: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
  
  /**
   * Atualiza o status de uma entrada de tesouraria
   * @param {Object} req - Objeto de requisição do Express
   * @param {Object} res - Objeto de resposta do Express
   */
  static async atualizarStatus(req, res) {
    const transaction = await EntradaTesouraria.sequelize.transaction();
    
    try {
      const { id, plano_tesouraria_id } = req.params;
      const { status } = req.body;
      
      // Valida o status informado
      const statusValidos = ['pendente', 'confirmado', 'cancelado'];
      if (!statusValidos.includes(status)) {
        await transaction.rollback();
        return res.status(400).json({
          sucesso: false,
          mensagem: 'Status inválido',
          statusValidos
        });
      }
      
      // Busca a entrada existente
      const entrada = await EntradaTesouraria.findOne({
        where: { 
          id,
          plano_tesouraria_id
        },
        transaction
      });
      
      if (!entrada) {
        await transaction.rollback();
        return res.status(404).json({
          sucesso: false,
          mensagem: 'Entrada de tesouraria não encontrada para o plano especificado'
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
          mensagem: 'Não é possível alterar o status de entradas em um plano que não está em rascunho, em aprovação ou ativo'
        });
      }
      
      // Atualiza o status
      await EntradaTesouraria.update(
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
      
      // Busca a entrada atualizada com os relacionamentos
      const entradaAtualizada = await EntradaTesouraria.findByPk(id, {
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
        mensagem: `Status da entrada de tesouraria atualizado para "${status}" com sucesso`,
        dados: entradaAtualizada
      });
      
    } catch (error) {
      await transaction.rollback();
      console.error('Erro ao atualizar status da entrada de tesouraria:', error);
      return res.status(500).json({
        sucesso: false,
        mensagem: 'Erro ao atualizar status da entrada de tesouraria',
        erro: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
}

module.exports = EntradaTesourariaController;
