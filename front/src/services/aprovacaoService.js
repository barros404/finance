import { apiClient } from './httpService';

/**
 * Serviço de Aprovação
 * Fornece métodos para interagir com o módulo de aprovação da API
 */
const aprovacaoService = {
  /**
   * Obtém estatísticas de aprovação para o dashboard
   * @param {Object} filtros - Filtros opcionais (dataInicio, dataFim, departamento)
   * @returns {Promise<Object>} Estatísticas de aprovação
   */
  async obterEstatisticas(filtros = {}) {
    try {
      const queryParams = new URLSearchParams();
      
      // Adiciona filtros à query string se fornecidos
      if (filtros.dataInicio) queryParams.append('dataInicio', filtros.dataInicio);
      if (filtros.dataFim) queryParams.append('dataFim', filtros.dataFim);
      if (filtros.departamento) queryParams.append('departamento', filtros.departamento);

      const endpoint = `/aprovacao/estatisticas${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
      const response = await apiClient.get(endpoint);
      
      // Mapeia a resposta da API para o formato esperado pelo dashboard
      return {
        itensPendentes: response.pendentes || 0,
        itensAprovados: response.aprovados || 0,
        itensRejeitados: response.rejeitados || 0,
        planosPendentes: response.planosPendentes || 0,
        orcamentosPendentes: response.orcamentosPendentes || 0,
        totalAprovacoes: response.totalAprovacoes || 0
      };
    } catch (error) {
      console.error('Erro ao obter estatísticas de aprovação:', error);
      throw error;
    }
  },

  /**
   * Lista itens pendentes de aprovação
   * @param {Object} params - Parâmetros de filtro (tipo, status, departamento, etc.)
   * @returns {Promise<Array>} Lista de itens pendentes
   */
  async listarItensPendentes(params = {}) {
    try {
      const queryParams = new URLSearchParams();
      
      // Adiciona parâmetros à query string se fornecidos
      const validParams = ['tipo', 'status', 'departamento', 'dataInicio', 'dataFim', 'pagina', 'limite', 'busca'];
      validParams.forEach(param => {
        if (params[param] !== undefined && params[param] !== null && params[param] !== '') {
          queryParams.append(param, params[param]);
        }
      });

      const endpoint = `/aprovacao/pendentes${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
      const response = await apiClient.get(endpoint);
      
      return response.data || [];
    } catch (error) {
      console.error('Erro ao listar itens pendentes:', error);
      throw error;
    }
  },

  /**
   * Aprova um item específico
   * @param {string|number} itemId - ID do item a ser aprovado
   * @param {string} tipo - Tipo do item ('orcamento' ou 'plano')
   * @param {string} observacoes - Observações opcionais
   * @returns {Promise<Object>} Item aprovado
   */
  async aprovarItem(itemId, tipo, observacoes = '') {
    try {
      const response = await apiClient.patch(`/aprovacao/${tipo}/${itemId}/aprovar`, { observacoes });
      return response.data;
    } catch (error) {
      console.error('Erro ao aprovar item:', error);
      throw error;
    }
  },

  /**
   * Rejeita um item específico
   * @param {string|number} itemId - ID do item a ser rejeitado
   * @param {string} tipo - Tipo do item ('orcamento' ou 'plano')
   * @param {string} motivo - Motivo da rejeição
   * @returns {Promise<Object>} Item rejeitado
   */
  async rejeitarItem(itemId, tipo, motivo) {
    try {
      const response = await apiClient.patch(`/aprovacao/${tipo}/${itemId}/rejeitar`, { motivo });
      return response.data;
    } catch (error) {
      console.error('Erro ao rejeitar item:', error);
      throw error;
    }
  },

  /**
   * Obtém o histórico de aprovações
   * @param {Object} params - Parâmetros de filtro
   * @returns {Promise<Object>} Histórico de aprovações
   */
  async obterHistorico(params = {}) {
    try {
      const queryParams = new URLSearchParams();
      
      const validParams = ['tipo', 'status', 'usuarioId', 'dataInicio', 'dataFim', 'pagina', 'limite'];
      validParams.forEach(param => {
        if (params[param] !== undefined && params[param] !== null && params[param] !== '') {
          queryParams.append(param, params[param]);
        }
      });

      const endpoint = `/aprovacao/historico${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
      const response = await apiClient.get(endpoint);
      
      return response.data || [];
    } catch (error) {
      console.error('Erro ao obter histórico de aprovações:', error);
      throw error;
    }
  }
};

export default aprovacaoService;
