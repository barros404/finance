import { apiClient } from './httpService';

/**
 * Serviço de Validação de Contas
 * Fornece métodos para interagir com o módulo de validação de contas da API
 */
const validacaoContasService = {
  /**
   * Obtém estatísticas de validação de contas para o dashboard
   * @param {Object} filtros - Filtros opcionais (dataInicio, dataFim, departamento)
   * @returns {Promise<Object>} Estatísticas de validação de contas
   */
  async obterEstatisticas(filtros = {}) {
    try {
      const queryParams = new URLSearchParams();
      
      // Adiciona filtros à query string se fornecidos
      if (filtros.dataInicio) queryParams.append('dataInicio', filtros.dataInicio);
      if (filtros.dataFim) queryParams.append('dataFim', filtros.dataFim);
      if (filtros.departamento) queryParams.append('departamento', filtros.departamento);

      const endpoint = `/validacao-contas/estatisticas${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
      const response = await apiClient.get(endpoint);
      
      // Mapeia a resposta da API para o formato esperado pelo dashboard
      return {
        contasPendentes: response.pendentes || 0,
        contasValidadas: response.validadas || 0,
        contasRejeitadas: response.rejeitadas || 0,
        totalContas: response.total || 0
      };
    } catch (error) {
      console.error('Erro ao obter estatísticas de validação de contas:', error);
      throw error;
    }
  },
  async dashboard()
{
    const endpoint=`/dashboard`;
  const response=await apiClient.get(endpoint);
  return response;
  },

  /**
   * Lista contas para validação
   * @param {Object} params - Parâmetros de filtro (status, departamento, etc.)
   * @returns {Promise<Array>} Lista de contas para validação
   */
  async listarContas(params = {}) {
    try {
      const queryParams = new URLSearchParams();
      
      // Adiciona parâmetros à query string se fornecidos
      const validParams = ['status', 'departamento', 'dataInicio', 'dataFim', 'pagina', 'limite', 'busca'];
      validParams.forEach(param => {
        if (params[param] !== undefined && params[param] !== null && params[param] !== '') {
          queryParams.append(param, params[param]);
        }
      });

      const endpoint = `/validacao-contas${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
      const response = await apiClient.get(endpoint);
      
      return response.data || [];
    } catch (error) {
      console.error('Erro ao listar contas para validação:', error);
      throw error;
    }
  },

  /**
   * Valida uma conta específica
   * @param {string|number} contaId - ID da conta a ser validada
   * @param {Object} dadosValidacao - Dados da validação
   * @returns {Promise<Object>} Conta validada
   */
  async validarConta(contaId, dadosValidacao) {
    try {
      const response = await apiClient.patch(`/validacao-contas/${contaId}/validar`, dadosValidacao);
      return response.data;
    } catch (error) {
      console.error('Erro ao validar conta:', error);
      throw error;
    }
  },

  /**
   * Rejeita uma conta específica
   * @param {string|number} contaId - ID da conta a ser rejeitada
   * @param {string} motivo - Motivo da rejeição
   * @returns {Promise<Object>} Conta rejeitada
   */
  async rejeitarConta(contaId, motivo) {
    try {
      const response = await apiClient.patch(`/validacao-contas/${contaId}/rejeitar`, { motivo });
      return response.data;
    } catch (error) {
      console.error('Erro ao rejeitar conta:', error);
      throw error;
    }
  },

  /**
   * Obtém o histórico de validações
   * @param {Object} params - Parâmetros de filtro
   * @returns {Promise<Object>} Histórico de validações
   */
  async obterHistorico(params = {}) {
    try {
      const queryParams = new URLSearchParams();
      
      const validParams = ['usuarioId', 'dataInicio', 'dataFim', 'pagina', 'limite', 'tipo'];
      validParams.forEach(param => {
        if (params[param] !== undefined && params[param] !== null && params[param] !== '') {
          queryParams.append(param, params[param]);
        }
      });

      const endpoint = `/validacao-contas/historico${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
      const response = await apiClient.get(endpoint);
      
      return response.data || [];
    } catch (error) {
      console.error('Erro ao obter histórico de validações:', error);
      throw error;
    }
  },

  /**
   * Obtém detalhes de uma conta específica
   * @param {string|number} contaId - ID da conta
   * @returns {Promise<Object>} Detalhes da conta
   */
  async obterConta(contaId) {
    try {
      const response = await apiClient.get(`/validacao-contas/${contaId}`);
      return response.data;
    } catch (error) {
      console.error('Erro ao obter detalhes da conta:', error);
      throw error;
    }
  }
};

export default validacaoContasService;
