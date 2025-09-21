'use strict';

const { PlanoTesouraria, Empresa, Orcamento, Usuario } = require('../../models');
const { Op } = require('sequelize');

/**
 * Controlador para gerenciar operações relacionadas a Planos de Tesouraria
 */
class PlanoTesourariaController {
  /**
   * Lista todos os planos de tesouraria com paginação
   * @param {Object} req - Objeto de requisição do Express
   * @param {Object} res - Objeto de resposta do Express
   */
  static async listarPlanos(req, res) {
    try {
      const { pagina = 1, limite = 10, empresaId, ano, mes, status } = req.query;
      const offset = (pagina - 1) * limite;
      
      const whereClause = {};
      
      if (empresaId) whereClause.empresa_id = empresaId;
      if (ano) whereClause.ano = ano;
      if (mes) whereClause.mes = mes;
      if (status) whereClause.status = status;
      
      const { count, rows: planos } = await PlanoTesouraria.findAndCountAll({
        where: whereClause,
        include: [
          { model: Empresa, as: 'empresa', attributes: ['id', 'nome', 'cnpj'] },
          { model: Orcamento, as: 'orcamento', attributes: ['id', 'descricao', 'ano'] },
          { model: Usuario, as: 'criador', attributes: ['id', 'nome', 'email'] }
        ],
        attributes: { exclude: ['deleted_at'] },
        limit: parseInt(limite),
        offset: parseInt(offset),
        order: [['created_at', 'DESC']]
      });
      
      const totalPaginas = Math.ceil(count / limite);
      
      return res.status(200).json({
        sucesso: true,
        total: count,
        totalPaginas,
        paginaAtual: parseInt(pagina),
        itensPorPagina: parseInt(limite),
        dados: planos
      });
      
    } catch (error) {
      console.error('Erro ao listar planos de tesouraria:', error);
      return res.status(500).json({
        sucesso: false,
        mensagem: 'Erro ao listar planos de tesouraria',
        erro: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
  
  /**
   * Obtém um plano de tesouraria pelo ID
   * @param {Object} req - Objeto de requisição do Express
   * @param {Object} res - Objeto de resposta do Express
   */
  static async obterPorId(req, res) {
    try {
      const { id } = req.params;
      
      const plano = await PlanoTesouraria.findByPk(id, {
        include: [
          { model: Empresa, as: 'empresa', attributes: ['id', 'nome', 'cnpj'] },
          { model: Orcamento, as: 'orcamento', attributes: ['id', 'descricao', 'ano'] },
          { model: Usuario, as: 'criador', attributes: ['id', 'nome', 'email'] },
          { model: Usuario, as: 'ultimo_editor', attributes: ['id', 'nome', 'email'] }
        ],
        attributes: { exclude: ['deleted_at'] }
      });
      
      if (!plano) {
        return res.status(404).json({
          sucesso: false,
          mensagem: 'Plano de tesouraria não encontrado'
        });
      }
      
      return res.status(200).json({
        sucesso: true,
        dados: plano
      });
      
    } catch (error) {
      console.error('Erro ao obter plano de tesouraria:', error);
      return res.status(500).json({
        sucesso: false,
        mensagem: 'Erro ao obter plano de tesouraria',
        erro: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
  
  /**
   * Cria um novo plano de tesouraria
   * @param {Object} req - Objeto de requisição do Express
   * @param {Object} res - Objeto de resposta do Express
   */
  static async criar(req, res) {
    const transaction = await PlanoTesouraria.sequelize.transaction();
    
    try {
      const { 
        mes, 
        ano, 
        saldo_inicial, 
        empresa_id, 
        orcamento_id, 
        elaborado_por, 
        aprovado_por, 
        observacoes 
      } = req.body;
      
      // Verifica se já existe um plano para o mesmo mês/ano/empresa
      const planoExistente = await PlanoTesouraria.findOne({
        where: {
          mes,
          ano,
          empresa_id,
          status: { [Op.ne]: 'cancelado' }
        },
        transaction
      });
      
      if (planoExistente) {
        await transaction.rollback();
        return res.status(400).json({
          sucesso: false,
          mensagem: 'Já existe um plano de tesouraria para este mês/ano e empresa',
          dados: { planoExistente: { id: planoExistente.id, mes, ano } }
        });
      }
      
      // Cria o plano
      const novoPlano = await PlanoTesouraria.create({
        mes,
        ano,
        saldo_inicial: saldo_inicial || 0,
        empresa_id,
        orcamento_id: orcamento_id || null,
        elaborado_por,
        aprovado_por: aprovado_por || null,
        status: 'rascunho',
        observacoes,
        criado_por: req.usuarioId, // ID do usuário autenticado
        atualizado_por: req.usuarioId
      }, { transaction });
      
      await transaction.commit();
      
      // Busca o plano criado com os relacionamentos
      const planoCompleto = await PlanoTesouraria.findByPk(novoPlano.id, {
        include: [
          { model: Empresa, as: 'empresa', attributes: ['id', 'nome', 'cnpj'] },
          { model: Orcamento, as: 'orcamento', attributes: ['id', 'descricao', 'ano'] },
          { model: Usuario, as: 'criador', attributes: ['id', 'nome', 'email'] }
        ],
        attributes: { exclude: ['deleted_at'] }
      });
      
      return res.status(201).json({
        sucesso: true,
        mensagem: 'Plano de tesouraria criado com sucesso',
        dados: planoCompleto
      });
      
    } catch (error) {
      await transaction.rollback();
      console.error('Erro ao criar plano de tesouraria:', error);
      return res.status(500).json({
        sucesso: false,
        mensagem: 'Erro ao criar plano de tesouraria',
        erro: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
  
  /**
   * Atualiza um plano de tesouraria existente
   * @param {Object} req - Objeto de requisição do Express
   * @param {Object} res - Objeto de resposta do Express
   */
  static async atualizar(req, res) {
    const transaction = await PlanoTesouraria.sequelize.transaction();
    
    try {
      const { id } = req.params;
      const { 
        mes, 
        ano, 
        saldo_inicial, 
        orcamento_id, 
        elaborado_por, 
        aprovado_por, 
        status, 
        observacoes 
      } = req.body;
      
      // Busca o plano existente
      const plano = await PlanoTesouraria.findByPk(id, { transaction });
      
      if (!plano) {
        await transaction.rollback();
        return res.status(404).json({
          sucesso: false,
          mensagem: 'Plano de tesouraria não encontrado'
        });
      }
      
      // Verifica se o plano pode ser atualizado
      if (plano.status === 'aprovado' || plano.status === 'encerrado') {
        await transaction.rollback();
        return res.status(400).json({
          sucesso: false,
          mensagem: 'Não é possível atualizar um plano que já foi aprovado ou encerrado'
        });
      }
      
      // Verifica se já existe outro plano para o mesmo mês/ano/empresa
      if (mes !== undefined && ano !== undefined && 
          (mes !== plano.mes || ano !== plano.ano)) {
        const planoExistente = await PlanoTesouraria.findOne({
          where: {
            id: { [Op.ne]: id },
            mes,
            ano,
            empresa_id: plano.empresa_id,
            status: { [Op.ne]: 'cancelado' }
          },
          transaction
        });
        
        if (planoExistente) {
          await transaction.rollback();
          return res.status(400).json({
            sucesso: false,
            mensagem: 'Já existe outro plano de tesouraria para este mês/ano e empresa',
            dados: { planoExistente: { id: planoExistente.id, mes, ano } }
          });
        }
      }
      
      // Atualiza os campos
      const camposAtualizacao = {};
      if (mes !== undefined) camposAtualizacao.mes = mes;
      if (ano !== undefined) camposAtualizacao.ano = ano;
      if (saldo_inicial !== undefined) camposAtualizacao.saldo_inicial = saldo_inicial;
      if (orcamento_id !== undefined) camposAtualizacao.orcamento_id = orcamento_id || null;
      if (elaborado_por !== undefined) camposAtualizacao.elaborado_por = elaborado_por;
      if (aprovado_por !== undefined) camposAtualizacao.aprovado_por = aprovado_por || null;
      if (status !== undefined) camposAtualizacao.status = status;
      if (observacoes !== undefined) camposAtualizacao.observacoes = observacoes;
      
      // Atualiza o registro
      await PlanoTesouraria.update(
        {
          ...camposAtualizacao,
          atualizado_por: req.usuarioId // ID do usuário autenticado
        },
        { 
          where: { id },
          transaction
        }
      );
      
      await transaction.commit();
      
      // Busca o plano atualizado com os relacionamentos
      const planoAtualizado = await PlanoTesouraria.findByPk(id, {
        include: [
          { model: Empresa, as: 'empresa', attributes: ['id', 'nome', 'cnpj'] },
          { model: Orcamento, as: 'orcamento', attributes: ['id', 'descricao', 'ano'] },
          { model: Usuario, as: 'criador', attributes: ['id', 'nome', 'email'] },
          { model: Usuario, as: 'ultimo_editor', attributes: ['id', 'nome', 'email'] }
        ],
        attributes: { exclude: ['deleted_at'] }
      });
      
      return res.status(200).json({
        sucesso: true,
        mensagem: 'Plano de tesouraria atualizado com sucesso',
        dados: planoAtualizado
      });
      
    } catch (error) {
      await transaction.rollback();
      console.error('Erro ao atualizar plano de tesouraria:', error);
      return res.status(500).json({
        sucesso: false,
        mensagem: 'Erro ao atualizar plano de tesouraria',
        erro: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
  
  /**
   * Remove um plano de tesouraria (soft delete)
   * @param {Object} req - Objeto de requisição do Express
   * @param {Object} res - Objeto de resposta do Express
   */
  static async excluir(req, res) {
    const transaction = await PlanoTesouraria.sequelize.transaction();
    
    try {
      const { id } = req.params;
      
      // Verifica se o plano existe
      const plano = await PlanoTesouraria.findByPk(id, { transaction });
      
      if (!plano) {
        await transaction.rollback();
        return res.status(404).json({
          sucesso: false,
          mensagem: 'Plano de tesouraria não encontrado'
        });
      }
      
      // Verifica se o plano pode ser excluído
      if (plano.status === 'aprovado' || plano.status === 'encerrado') {
        await transaction.rollback();
        return res.status(400).json({
          sucesso: false,
          mensagem: 'Não é possível excluir um plano que já foi aprovado ou encerrado. Considere cancelá-lo.'
        });
      }
      
      // Realiza o soft delete
      await PlanoTesouraria.destroy({
        where: { id },
        transaction
      });
      
      await transaction.commit();
      
      return res.status(200).json({
        sucesso: true,
        mensagem: 'Plano de tesouraria excluído com sucesso'
      });
      
    } catch (error) {
      await transaction.rollback();
      console.error('Erro ao excluir plano de tesouraria:', error);
      return res.status(500).json({
        sucesso: false,
        mensagem: 'Erro ao excluir plano de tesouraria',
        erro: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
  
  /**
   * Atualiza o status de um plano de tesouraria
   * @param {Object} req - Objeto de requisição do Express
   * @param {Object} res - Objeto de resposta do Express
   */
  static async atualizarStatus(req, res) {
    const transaction = await PlanoTesouraria.sequelize.transaction();
    
    try {
      const { id } = req.params;
      const { status, aprovado_por } = req.body;
      
      // Valida o status informado
      const statusValidos = ['rascunho', 'em_aprovacao', 'aprovado', 'rejeitado', 'ativo', 'encerrado'];
      if (!statusValidos.includes(status)) {
        await transaction.rollback();
        return res.status(400).json({
          sucesso: false,
          mensagem: 'Status inválido',
          statusValidos
        });
      }
      
      // Busca o plano existente
      const plano = await PlanoTesouraria.findByPk(id, { transaction });
      
      if (!plano) {
        await transaction.rollback();
        return res.status(404).json({
          sucesso: false,
          mensagem: 'Plano de tesouraria não encontrado'
        });
      }
      
      // Valida a transição de status
      const transicoesValidas = {
        'rascunho': ['em_aprovacao'],
        'em_aprovacao': ['aprovado', 'rejeitado'],
        'aprovado': ['ativo'],
        'rejeitado': ['rascunho'],
        'ativo': ['encerrado'],
        'encerrado': []
      };
      
      if (!transicoesValidas[plano.status].includes(status)) {
        await transaction.rollback();
        return res.status(400).json({
          sucesso: false,
          mensagem: `Transição de status inválida. Status atual: ${plano.status}, Status desejado: ${status}`,
          transicoesValidas: transicoesValidas[plano.status]
        });
      }
      
      // Verifica se é necessário informar o aprovador
      if (status === 'aprovado' && !aprovado_por) {
        await transaction.rollback();
        return res.status(400).json({
          sucesso: false,
          mensagem: 'O campo "aprovado_por" é obrigatório ao aprovar um plano'
        });
      }
      
      // Atualiza o status
      const camposAtualizacao = {
        status,
        atualizado_por: req.usuarioId // ID do usuário autenticado
      };
      
      if (status === 'aprovado' && aprovado_por) {
        camposAtualizacao.aprovado_por = aprovado_por;
      }
      
      await PlanoTesouraria.update(
        camposAtualizacao,
        { 
          where: { id },
          transaction
        }
      );
      
      await transaction.commit();
      
      // Busca o plano atualizado com os relacionamentos
      const planoAtualizado = await PlanoTesouraria.findByPk(id, {
        include: [
          { model: Empresa, as: 'empresa', attributes: ['id', 'nome', 'cnpj'] },
          { model: Orcamento, as: 'orcamento', attributes: ['id', 'descricao', 'ano'] },
          { model: Usuario, as: 'criador', attributes: ['id', 'nome', 'email'] },
          { model: Usuario, as: 'ultimo_editor', attributes: ['id', 'nome', 'email'] }
        ],
        attributes: { exclude: ['deleted_at'] }
      });
      
      return res.status(200).json({
        sucesso: true,
        mensagem: `Status do plano de tesouraria atualizado para "${status}" com sucesso`,
        dados: planoAtualizado
      });
      
    } catch (error) {
      await transaction.rollback();
      console.error('Erro ao atualizar status do plano de tesouraria:', error);
      return res.status(500).json({
        sucesso: false,
        mensagem: 'Erro ao atualizar status do plano de tesouraria',
        erro: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
  
  /**
   * Importa dados de um orçamento para o plano de tesouraria
   * @param {Object} req - Objeto de requisição do Express
   * @param {Object} res - Objeto de resposta do Express
   */
  static async importarDoOrcamento(req, res) {
    const transaction = await PlanoTesouraria.sequelize.transaction();
    
    try {
      const { id } = req.params;
      const { orcamento_id } = req.body;
      
      // Validação básica
      if (!orcamento_id) {
        await transaction.rollback();
        return res.status(400).json({
          sucesso: false,
          mensagem: 'O ID do orçamento é obrigatório'
        });
      }
      
      // Busca o plano
      const plano = await PlanoTesouraria.findByPk(id, { transaction });
      
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
      
      // Busca o orçamento e seus itens
      // NOTA: Esta é uma implementação simplificada. Na prática, você precisará adaptar
      // conforme a estrutura do seu modelo de Orçamento e como os dados devem ser importados
      
      // Aqui você implementaria a lógica para importar receitas, despesas, etc. do orçamento
      // para o plano de tesouraria, criando os registros nas tabelas de entradas e saídas
      
      // Exemplo simplificado:
      // 1. Buscar receitas do orçamento
      // 2. Criar entradas de tesouraria baseadas nas receitas
      // 3. Buscar despesas do orçamento
      // 4. Criar saídas de tesouraria baseadas nas despesas
      
      // Atualiza o plano para referenciar o orçamento
      await PlanoTesouraria.update(
        {
          orcamento_id,
          atualizado_por: req.usuarioId
        },
        { 
          where: { id },
          transaction
        }
      );
      
      await transaction.commit();
      
      // Busca o plano atualizado com os relacionamentos
      const planoAtualizado = await PlanoTesouraria.findByPk(id, {
        include: [
          { model: Empresa, as: 'empresa', attributes: ['id', 'nome', 'cnpj'] },
          { model: Orcamento, as: 'orcamento', attributes: ['id', 'descricao', 'ano'] },
          { model: Usuario, as: 'criador', attributes: ['id', 'nome', 'email'] },
          { model: Usuario, as: 'ultimo_editor', attributes: ['id', 'nome', 'email'] }
        ],
        attributes: { exclude: ['deleted_at'] }
      });
      
      return res.status(200).json({
        sucesso: true,
        mensagem: 'Dados do orçamento importados com sucesso para o plano de tesouraria',
        dados: planoAtualizado,
        // Incluir aqui informações sobre os itens importados, se necessário
        // itensImportados: { receitas: [...], despesas: [...] }
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

module.exports = PlanoTesourariaController;
