'use strict';

const { SaidaTesouraria, PlanoTesouraria, Usuario, CategoriaCusto } = require('../../models');
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
        categoria_id, 
        status, 
        data_inicio, 
        data_fim,
        tipo_saida
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
      if (categoria_id) whereClause.categoria_id = categoria_id;
      if (status) whereClause.status = status;
      if (tipo_saida) whereClause.tipo_saida = tipo_saida;
      
      // Filtro por data de vencimento
      if (data_inicio && data_fim) {
        whereClause.data_vencimento = {
          [Op.between]: [new Date(data_inicio), new Date(data_fim)]
        };
      } else if (data_inicio) {
        whereClause.data_vencimento = { [Op.gte]: new Date(data_inicio) };
      } else if (data_fim) {
        whereClause.data_vencimento = { [Op.lte]: new Date(data_fim) };
      }
      
      const { count, rows: saidas } = await SaidaTesouraria.findAndCountAll({
        where: whereClause,
        include: [
          { 
            model: PlanoTesouraria, 
            as: 'plano_tesouraria', 
            attributes: ['id', 'mes', 'ano'] 
          },
          { 
            model: CategoriaCusto, 
            as: 'categoria',
            attributes: ['id', 'nome', 'codigo', 'tipo']
          },
          { 
            model: Usuario, 
            as: 'criador', 
            attributes: ['id', 'nome', 'email'] 
          },
          { 
            model: Usuario, 
            as: 'ultimo_editor', 
            attributes: ['id', 'nome', 'email'] 
          }
        ],
        attributes: { exclude: ['deleted_at'] },
        limit: parseInt(limite),
        offset: parseInt(offset),
        order: [
          ['data_vencimento', 'ASC'],
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
          { 
            model: PlanoTesouraria, 
            as: 'plano_tesouraria', 
            attributes: ['id', 'mes', 'ano'] 
          },
          { 
            model: CategoriaCusto, 
            as: 'categoria',
            attributes: ['id', 'nome', 'codigo', 'tipo']
          },
          { 
            model: Usuario, 
            as: 'criador', 
            attributes: ['id', 'nome', 'email'] 
          },
          { 
            model: Usuario, 
            as: 'ultimo_editor', 
            attributes: ['id', 'nome', 'email'] 
          }
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
        descricao,
        valor,
        data_vencimento,
        data_pagamento,
        categoria_id,
        tipo_saida,
        forma_pagamento,
        numero_documento,
        observacoes,
        status,
        recorrente,
        dia_vencimento,
        quantidade_parcelas,
        parcela_atual
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
      
      if (plano.status !== 'rascunho' && plano.status !== 'em_aprovacao' && plano.status !== 'ativo') {
        await transaction.rollback();
        return res.status(400).json({
          sucesso: false,
          mensagem: 'Não é possível adicionar saídas a um plano que não está em rascunho, em aprovação ou ativo'
        });
      }
      
      // Validação dos dados
      if (!categoria_id) {
        await transaction.rollback();
        return res.status(400).json({
          sucesso: false,
          mensagem: 'É obrigatório informar a categoria da saída'
        });
      }
      
      // Verifica se a categoria existe
      const categoria = await CategoriaCusto.findByPk(categoria_id, { transaction });
      if (!categoria) {
        await transaction.rollback();
        return res.status(400).json({
          sucesso: false,
          mensagem: 'Categoria de custo não encontrada'
        });
      }
      
      // Verifica se a data de vencimento é válida
      const dataVencimento = data_vencimento ? new Date(data_vencimento) : new Date();
      
      // Cria a saída
      const novaSaida = await SaidaTesouraria.create({
        plano_tesouraria_id,
        categoria_id,
        descricao: descricao || null,
        valor,
        data_vencimento: dataVencimento,
        data_pagamento: data_pagamento ? new Date(data_pagamento) : null,
        tipo_saida: tipo_saida || 'variavel',
        forma_pagamento: forma_pagamento || 'dinheiro',
        numero_documento: numero_documento || null,
        observacoes: observacoes || null,
        status: status || 'pendente',
        recorrente: recorrente || false,
        dia_vencimento: dia_vencimento || null,
        quantidade_parcelas: quantidade_parcelas || 1,
        parcela_atual: parcela_atual || 1,
        criado_por: req.usuarioId,
        atualizado_por: req.usuarioId
      }, { transaction });
      
      // Se for uma saída recorrente, cria as parcelas futuras
      if (recorrente && quantidade_parcelas > 1) {
        const parcelas = [];
        
        for (let i = 1; i < quantidade_parcelas; i++) {
          const dataParcela = new Date(dataVencimento);
          dataParcela.setMonth(dataParcela.getMonth() + i);
          
          // Ajusta para o dia de vencimento correto, se necessário
          if (dia_vencimento) {
            const ultimoDiaMes = new Date(dataParcela.getFullYear(), dataParcela.getMonth() + 1, 0).getDate();
            dataParcela.setDate(Math.min(dia_vencimento, ultimoDiaMes));
          }
          
          parcelas.push({
            plano_tesouraria_id,
            categoria_id,
            descricao: `${descripcion || 'Parcela'} ${i + 1}/${quantidade_parcelas}`,
            valor,
            data_vencimento: dataParcela,
            tipo_saida,
            forma_pagamento,
            numero_documento: numero_documento ? `${numero_documento}-${i + 1}` : null,
            observacoes: observacoes || null,
            status: 'pendente',
            recorrente: true,
            dia_vencimento: dia_vencimento || null,
            quantidade_parcelas,
            parcela_atual: i + 1,
            criado_por: req.usuarioId,
            atualizado_por: req.usuarioId
          });
        }
        
        await SaidaTesouraria.bulkCreate(parcelas, { transaction });
      }
      
      await transaction.commit();
      
      // Busca a saída criada com os relacionamentos
      const saidaCompleta = await SaidaTesouraria.findByPk(novaSaida.id, {
        include: [
          { 
            model: PlanoTesouraria, 
            as: 'plano_tesouraria', 
            attributes: ['id', 'mes', 'ano'] 
          },
          { 
            model: CategoriaCusto, 
            as: 'categoria',
            attributes: ['id', 'nome', 'codigo', 'tipo']
          },
          { 
            model: Usuario, 
            as: 'criador', 
            attributes: ['id', 'nome', 'email'] 
          }
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
        descricao,
        valor,
        data_vencimento,
        data_pagamento,
        categoria_id,
        tipo_saida,
        forma_pagamento,
        numero_documento,
        observacoes,
        status,
        recorrente,
        dia_vencimento,
        quantidade_parcelas,
        parcela_atual
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
      
      // Validação dos dados
      if (categoria_id) {
        // Verifica se a categoria existe
        const categoria = await CategoriaCusto.findByPk(categoria_id, { transaction });
        if (!categoria) {
          await transaction.rollback();
          return res.status(400).json({
            sucesso: false,
            mensagem: 'Categoria de custo não encontrada'
          });
        }
      }
      
      // Atualiza os campos
      const camposAtualizacao = {};
      if (descricao !== undefined) camposAtualizacao.descricao = descricao;
      if (valor !== undefined) camposAtualizacao.valor = valor;
      if (data_vencimento !== undefined) camposAtualizacao.data_vencimento = new Date(data_vencimento);
      if (data_pagamento !== undefined) camposAtualizacao.data_pagamento = data_pagamento ? new Date(data_pagamento) : null;
      if (categoria_id !== undefined) camposAtualizacao.categoria_id = categoria_id;
      if (tipo_saida !== undefined) camposAtualizacao.tipo_saida = tipo_saida;
      if (forma_pagamento !== undefined) camposAtualizacao.forma_pagamento = forma_pagamento;
      if (numero_documento !== undefined) camposAtualizacao.numero_documento = numero_documento;
      if (observacoes !== undefined) camposAtualizacao.observacoes = observacoes;
      if (status !== undefined) camposAtualizacao.status = status;
      if (recorrente !== undefined) camposAtualizacao.recorrente = recorrente;
      if (dia_vencimento !== undefined) camposAtualizacao.dia_vencimento = dia_vencimento;
      if (quantidade_parcelas !== undefined) camposAtualizacao.quantidade_parcelas = quantidade_parcelas;
      if (parcela_atual !== undefined) camposAtualizacao.parcela_atual = parcela_atual;
      
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
          { 
            model: PlanoTesouraria, 
            as: 'plano_tesouraria', 
            attributes: ['id', 'mes', 'ano'] 
          },
          { 
            model: CategoriaCusto, 
            as: 'categoria',
            attributes: ['id', 'nome', 'codigo', 'tipo']
          },
          { 
            model: Usuario, 
            as: 'criador', 
            attributes: ['id', 'nome', 'email'] 
          },
          { 
            model: Usuario, 
            as: 'ultimo_editor', 
            attributes: ['id', 'nome', 'email'] 
          }
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
      const statusValidos = ['pendente', 'pago', 'atrasado', 'cancelado'];
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
      
      // Atualiza o status e a data de pagamento, se fornecida
      const camposAtualizacao = {
        status,
        atualizado_por: req.usuarioId // ID do usuário autenticado
      };
      
      // Se estiver marcando como pago e não tiver data de pagamento, usa a data atual
      if (status === 'pago' && !data_pagamento) {
        camposAtualizacao.data_pagamento = new Date();
      } else if (data_pagamento !== undefined) {
        camposAtualizacao.data_pagamento = data_pagamento ? new Date(data_pagamento) : null;
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
          { 
            model: PlanoTesouraria, 
            as: 'plano_tesouraria', 
            attributes: ['id', 'mes', 'ano'] 
          },
          { 
            model: CategoriaCusto, 
            as: 'categoria',
            attributes: ['id', 'nome', 'codigo', 'tipo']
          },
          { 
            model: Usuario, 
            as: 'criador', 
            attributes: ['id', 'nome', 'email'] 
          },
          { 
            model: Usuario, 
            as: 'ultimo_editor', 
            attributes: ['id', 'nome', 'email'] 
          }
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
      const { id } = req.params; // ID do plano de tesouraria
      const { orcamento_id, mes_referencia = 1 } = req.body;
      
      // Verifica se o plano de tesouraria existe
      const plano = await PlanoTesouraria.findByPk(id, { transaction });
      
      if (!plano) {
        await transaction.rollback();
        return res.status(404).json({
          sucesso: false,
          mensagem: 'Plano de tesouraria não encontrado'
        });
      }
      
      // Verifica se o plano de tesouraria está em um status que permite alterações
      if (plano.status !== 'rascunho' && plano.status !== 'em_aprovacao') {
        await transaction.rollback();
        return res.status(400).json({
          sucesso: false,
          mensagem: 'Não é possível importar orçamentos para um plano que não está em rascunho ou em aprovação'
        });
      }
      
      // Aqui você implementaria a lógica para buscar os custos do orçamento
      // e convertê-los em saídas de tesouraria
      // Este é um exemplo simplificado
      
      // Exemplo de lógica de importação (substitua pela sua implementação real):
      // 1. Buscar os custos do orçamento
      // 2. Para cada custo, criar uma saída no plano de tesouraria
      // 3. Retornar o resultado
      
      // Por enquanto, retornamos um erro indicando que a funcionalidade ainda não foi implementada
      await transaction.rollback();
      return res.status(501).json({
        sucesso: false,
        mensagem: 'Importação de orçamento para tesouraria ainda não implementada',
        dados: {
          plano_tesouraria_id: id,
          orcamento_id,
          mes_referencia
        }
      });
      
    } catch (error) {
      await transaction.rollback();
      console.error('Erro ao importar orçamento para tesouraria:', error);
      return res.status(500).json({
        sucesso: false,
        mensagem: 'Erro ao importar orçamento para tesouraria',
        erro: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
}

module.exports = SaidaTesourariaController;
