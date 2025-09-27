/**
 * Arquivo de Migração - EndiAgro FinancePro
 * 
 * Este arquivo facilita a migração gradual dos serviços antigos
 * para os novos serviços unificados.
 * 
 * @author Antonio Emiliano Barros
 * @version 1.0.0
 */

// Importa os novos serviços unificados
import { httpService } from './httpService.unified';
import { authService } from './authService.unified';
import { API_ENDPOINTS } from '../config/api.config.unified';

/**
 * API de Orçamentos - Versão Unificada
 * Mantém compatibilidade com a interface antiga
 */
const orcamentoApi = {
  /**
   * Lista todos os orçamentos com filtros e paginação
   */
  async listarOrcamentos(params = {}) {
    try {
      console.log('🔄 [MIGRATED] Listando orçamentos...');
      const response = await httpService.get(API_ENDPOINTS.ORCAMENTOS.LIST, params);
      
      // Garante compatibilidade com estrutura esperada
      if (response.status === 'success' && response.data) {
        return response;
      } else if (response.orcamentos) {
        // Estrutura alternativa
        return {
          status: 'success',
          data: {
            orcamentos: response.orcamentos,
            pagination: response.pagination || {}
          }
        };
      }
      
      return response;
    } catch (error) {
      console.error('❌ [MIGRATED] Erro ao listar orçamentos:', error);
      throw error;
    }
  },

  /**
   * Obtém um orçamento específico por ID
   */
  async obterOrcamento(id) {
    try {
      console.log(`🔄 [MIGRATED] Obtendo orçamento ${id}...`);
      const endpoint = API_ENDPOINTS.ORCAMENTOS.GET.replace(':id', id);
      return await httpService.get(endpoint);
    } catch (error) {
      console.error(`❌ [MIGRATED] Erro ao obter orçamento ${id}:`, error);
      throw error;
    }
  },

  /**
   * Cria um novo orçamento
   */
  async criarOrcamento(dadosOrcamento) {
    try {
      console.log('🔄 [MIGRATED] Criando orçamento...');
      return await httpService.post(API_ENDPOINTS.ORCAMENTOS.CREATE, dadosOrcamento);
    } catch (error) {
      console.error('❌ [MIGRATED] Erro ao criar orçamento:', error);
      throw error;
    }
  },

  /**
   * Cria um orçamento completo
   */
  async criarOrcamentoCompleto(dadosFormulario) {
    try {
      console.log('🔄 [MIGRATED] Criando orçamento completo...');
      return await httpService.post(API_ENDPOINTS.ORCAMENTOS.COMPLETE, dadosFormulario);
    } catch (error) {
      console.error('❌ [MIGRATED] Erro ao criar orçamento completo:', error);
      throw error;
    }
  },

  /**
   * Atualiza um orçamento existente
   */
  async atualizarOrcamento(id, dadosOrcamento) {
    try {
      console.log(`🔄 [MIGRATED] Atualizando orçamento ${id}...`);
      const endpoint = API_ENDPOINTS.ORCAMENTOS.UPDATE.replace(':id', id);
      return await httpService.patch(endpoint, dadosOrcamento);
    } catch (error) {
      console.error(`❌ [MIGRATED] Erro ao atualizar orçamento ${id}:`, error);
      throw error;
    }
  },

  /**
   * Exclui um orçamento
   */
  async excluirOrcamento(id) {
    try {
      console.log(`🔄 [MIGRATED] Excluindo orçamento ${id}...`);
      const endpoint = API_ENDPOINTS.ORCAMENTOS.DELETE.replace(':id', id);
      return await httpService.delete(endpoint);
    } catch (error) {
      console.error(`❌ [MIGRATED] Erro ao excluir orçamento ${id}:`, error);
      throw error;
    }
  },

  /**
   * Aprova um orçamento
   */
  async aprovarOrcamento(id, observacoes = '') {
    try {
      console.log(`🔄 [MIGRATED] Aprovando orçamento ${id}...`);
      const endpoint = API_ENDPOINTS.ORCAMENTOS.APPROVE.replace(':id', id);
      return await httpService.patch(endpoint, { observacoes });
    } catch (error) {
      console.error(`❌ [MIGRATED] Erro ao aprovar orçamento ${id}:`, error);
      throw error;
    }
  },

  /**
   * Rejeita um orçamento
   */
  async rejeitarOrcamento(id, motivo) {
    try {
      console.log(`🔄 [MIGRATED] Rejeitando orçamento ${id}...`);
      const endpoint = API_ENDPOINTS.ORCAMENTOS.REJECT.replace(':id', id);
      return await httpService.patch(endpoint, { motivo });
    } catch (error) {
      console.error(`❌ [MIGRATED] Erro ao rejeitar orçamento ${id}:`, error);
      throw error;
    }
  },

  /**
   * Obtém estatísticas dos orçamentos
   */
  async obterEstatisticas(filtros = {}) {
    try {
      console.log('🔄 [MIGRATED] Obtendo estatísticas...');
      return await httpService.get(API_ENDPOINTS.ORCAMENTOS.STATS, filtros);
    } catch (error) {
      console.error('❌ [MIGRATED] Erro ao obter estatísticas:', error);
      throw error;
    }
  },

  /**
   * Obtém o orçamento aprovado para um ano específico
   */
  async obterOrcamentoAprovado(params = {}) {
    try {
      console.log('🔄 [MIGRATED] Obtendo orçamento aprovado...');
      return await httpService.get(API_ENDPOINTS.ORCAMENTOS.APPROVED, params);
    } catch (error) {
      console.error('❌ [MIGRATED] Erro ao obter orçamento aprovado:', error);
      throw error;
    }
  }
};

/**
 * API de Tesouraria - Versão Unificada
 */
const tesourariaApi = {
  /**
   * Lista os planos de tesouraria
   */
  async listarPlanos(params = {}) {
    try {
      console.log('🔄 [MIGRATED] Listando planos de tesouraria...');
      return await httpService.get(API_ENDPOINTS.TESOURARIA.PLANOS, params);
    } catch (error) {
      console.error('❌ [MIGRATED] Erro ao listar planos:', error);
      throw error;
    }
  },

  /**
   * Cria um novo plano de tesouraria
   */
  async criarPlano(dadosPlano) {
    try {
      console.log('🔄 [MIGRATED] Criando plano de tesouraria...');
      return await httpService.post(API_ENDPOINTS.TESOURARIA.PLANOS, dadosPlano);
    } catch (error) {
      console.error('❌ [MIGRATED] Erro ao criar plano:', error);
      throw error;
    }
  },

  /**
   * Obtém um plano específico
   */
  async obterPlano(id) {
    try {
      console.log(`🔄 [MIGRATED] Obtendo plano ${id}...`);
      const endpoint = API_ENDPOINTS.TESOURARIA.PLANO.replace(':id', id);
      return await httpService.get(endpoint);
    } catch (error) {
      console.error(`❌ [MIGRATED] Erro ao obter plano ${id}:`, error);
      throw error;
    }
  },

  /**
   * Obtém o fluxo de caixa
   */
  async obterFluxoCaixa(filtros = {}) {
    try {
      console.log('🔄 [MIGRATED] Obtendo fluxo de caixa...');
      return await httpService.get(API_ENDPOINTS.TESOURARIA.FLUXO_CAIXA, filtros);
    } catch (error) {
      console.error('❌ [MIGRATED] Erro ao obter fluxo de caixa:', error);
      throw error;
    }
  },

  /**
   * Obtém atividades recentes
   */
  async obterAtividadesRecentes(params = {}) {
    try {
      console.log('🔄 [MIGRATED] Obtendo atividades recentes...');
      return await httpService.get(API_ENDPOINTS.TESOURARIA.ATIVIDADES, params);
    } catch (error) {
      console.error('❌ [MIGRATED] Erro ao obter atividades recentes:', error);
      throw error;
    }
  }
};

/**
 * API de Autenticação - Versão Unificada
 */
const authApi = {
  /**
   * Realiza login do usuário
   */
  async login(credentials) {
    try {
      console.log('🔄 [MIGRATED] Fazendo login...');
      return await authService.login(credentials.email, credentials.password);
    } catch (error) {
      console.error('❌ [MIGRATED] Erro no login:', error);
      throw error;
    }
  },

  /**
   * Registra um novo usuário
   */
  async register(userData) {
    try {
      console.log('🔄 [MIGRATED] Registrando usuário...');
      return await authService.register(userData);
    } catch (error) {
      console.error('❌ [MIGRATED] Erro no registro:', error);
      throw error;
    }
  },

  /**
   * Obtém dados do usuário atual
   */
  async getMe() {
    try {
      console.log('🔄 [MIGRATED] Obtendo dados do usuário...');
      return await authService.getCurrentUser();
    } catch (error) {
      console.error('❌ [MIGRATED] Erro ao obter dados do usuário:', error);
      throw error;
    }
  },

  /**
   * Realiza logout
   */
  async logout() {
    try {
      console.log('🔄 [MIGRATED] Fazendo logout...');
      return await authService.logout();
    } catch (error) {
      console.error('❌ [MIGRATED] Erro no logout:', error);
      throw error;
    }
  },

  /**
   * Verifica se está autenticado
   */
  isAuthenticated() {
    return authService.isAuthenticated();
  },

  /**
   * Obtém dados do usuário
   */
  getUser() {
    return authService.getUser();
  }
};

// Exporta as APIs migradas
export {
  orcamentoApi,
  tesourariaApi,
  authApi
};

// Exporta também os serviços unificados para uso direto
export {
  httpService,
  authService
};

// Exportação padrão para compatibilidade
export default {
  orcamento: orcamentoApi,
  tesouraria: tesourariaApi,
  auth: authApi,
  httpService,
  authService
};
