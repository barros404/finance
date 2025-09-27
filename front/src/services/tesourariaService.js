import { apiClient } from './httpService';

/**
 * Serviço de Tesouraria
 * Fornece métodos para interagir com o módulo de tesouraria da API
 */
const tesourariaService = {
  /**
   * Obtém atividades recentes da tesouraria para o dashboard
   * @param {Object} params - Parâmetros de filtro (limite, tipo, dataInicio, dataFim)
   * @returns {Promise<Array>} Lista de atividades recentes
   */
  async obterAtividadesRecentes(params = {}) {
    try {
      const queryParams = new URLSearchParams();
      
      // Define valores padrão
      const { limite = 5, ...filtros } = params;
      
      // Adiciona parâmetros à query string
      queryParams.append('limite', limite);
      
      // Adiciona outros filtros se fornecidos
      const validParams = ['tipo', 'dataInicio', 'dataFim', 'usuarioId'];
      validParams.forEach(param => {
        if (filtros[param] !== undefined && filtros[param] !== null && filtros[param] !== '') {
          queryParams.append(param, filtros[param]);
        }
      });

      const endpoint = `/tesouraria/atividades-recentes${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
      const response = await apiClient.get(endpoint);
      
      // Mapeia a resposta da API para o formato esperado pelo dashboard
      return (response.data || []).map((atividade, index) => ({
        id: atividade.id || `temp-${index}`,
        tipo: this.mapearTipoAtividade(atividade.tipo),
        titulo: this.gerarTituloAtividade(atividade),
        descricao: atividade.descricao || 'Nova atividade registrada',
        timestamp: new Date(atividade.data || Date.now() - (index * 3600000)),
        status: this.mapearStatusAtividade(atividade.status),
        usuario: atividade.usuario || 'Sistema',
        valor: atividade.valor,
        moeda: atividade.moeda || 'BRL'
      }));
    } catch (error) {
      console.error('Erro ao obter atividades recentes da tesouraria:', error);
      // Retorna um array vazio em caso de erro para não quebrar a UI
      return [];
    }
  },

  /**
   * Mapeia o tipo de atividade para um formato mais amigável
   * @private
   */
  mapearTipoAtividade(tipo) {
    const tipos = {
      'PAGAMENTO': 'payment',
      'RECEBIMENTO': 'revenue',
      'TRANSFERENCIA': 'transfer',
      'APROVACAO': 'approval',
      'CONCILIACAO': 'reconciliation',
      'OUTRO': 'info'
    };
    
    return tipos[tipo?.toUpperCase()] || 'info';
  },

  /**
   * Mapeia o status da atividade para um formato padronizado
   * @private
   */
  mapearStatusAtividade(status) {
    const statusMap = {
      'APROVADO': 'success',
      'PENDENTE': 'warning',
      'REJEITADO': 'error',
      'CANCELADO': 'default',
      'CONCLUIDO': 'success',
      'EM_ANALISE': 'info'
    };
    
    return statusMap[status?.toUpperCase()] || 'info';
  },

  /**
   * Gera um título descritivo para a atividade
   * @private
   */
  gerarTituloAtividade(atividade) {
    const { tipo, descricao } = atividade;
    
    if (descricao) return descricao;
    
    const titulos = {
      'PAGAMENTO': 'Pagamento realizado',
      'RECEBIMENTO': 'Recebimento registrado',
      'TRANSFERENCIA': 'Transferência realizada',
      'APROVACAO': 'Aprovação de transação',
      'CONCILIACAO': 'Conciliação bancária',
      'OUTRO': 'Nova atividade'
    };
    
    return titulos[tipo?.toUpperCase()] || 'Nova atividade registrada';
  },

  /**
   * Obtém o saldo atual da tesouraria
   * @returns {Promise<Object>} Dados do saldo
   */
  async obterSaldo() {
    try {
      const response = await apiClient.get('/tesouraria/saldo');
      return response.data || { saldo: 0, moeda: 'BRL' };
    } catch (error) {
      console.error('Erro ao obter saldo da tesouraria:', error);
      throw error;
    }
  },

  /**
   * Lista transações da tesouraria
   * @param {Object} params - Parâmetros de filtro
   * @returns {Promise<Object>} Lista paginada de transações
   */
  async listarTransacoes(params = {}) {
    try {
      const queryParams = new URLSearchParams();
      
      // Adiciona parâmetros à query string se fornecidos
      const validParams = ['tipo', 'dataInicio', 'dataFim', 'categoria', 'contaId', 'pagina', 'limite', 'ordenarPor', 'ordem'];
      validParams.forEach(param => {
        if (params[param] !== undefined && params[param] !== null && params[param] !== '') {
          queryParams.append(param, params[param]);
        }
      });

      const endpoint = `/tesouraria/transacoes${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
      const response = await apiClient.get(endpoint);
      
      return response.data || [];
    } catch (error) {
      console.error('Erro ao listar transações da tesouraria:', error);
      throw error;
    }
  },

  /**
   * Cria uma nova transação na tesouraria
   * @param {Object} transacao - Dados da transação
   * @returns {Promise<Object>} Transação criada
   */
  async criarTransacao(transacao) {
    try {
      const response = await apiClient.post('/tesouraria/transacoes', transacao);
      return response.data;
    } catch (error) {
      console.error('Erro ao criar transação na tesouraria:', error);
      throw error;
    }
  },

  /**
   * Atualiza uma transação existente
   * @param {string|number} transacaoId - ID da transação
   * @param {Object} dadosAtualizados - Dados atualizados da transação
   * @returns {Promise<Object>} Transação atualizada
   */
  async atualizarTransacao(transacaoId, dadosAtualizados) {
    try {
      const response = await apiClient.put(`/tesouraria/transacoes/${transacaoId}`, dadosAtualizados);
      return response.data;
    } catch (error) {
      console.error('Erro ao atualizar transação na tesouraria:', error);
      throw error;
    }
  },

  /**
   * Exclui uma transação
   * @param {string|number} transacaoId - ID da transação
   * @returns {Promise<Object>} Confirmação da exclusão
   */
  async excluirTransacao(transacaoId) {
    try {
      const response = await apiClient.delete(`/tesouraria/transacoes/${transacaoId}`);
      return response.data;
    } catch (error) {
      console.error('Erro ao excluir transação da tesouraria:', error);
      throw error;
    }
  },

  /**
   * Obtém categorias de transação
   * @returns {Promise<Array>} Lista de categorias
   */
  async obterCategorias() {
    try {
      const response = await apiClient.get('/tesouraria/categorias');
      return response.data || [];
    } catch (error) {
      console.error('Erro ao obter categorias da tesouraria:', error);
      return [];
    }
  },

  /**
   * Obtém contas bancárias
   * @returns {Promise<Array>} Lista de contas bancárias
   */
  async obterContasBancarias() {
    try {
      const response = await apiClient.get('/tesouraria/contas');
      return response.data || [];
    } catch (error) {
      console.error('Erro ao obter contas bancárias:', error);
      return [];
    }
  }
};

export default tesourariaService;
