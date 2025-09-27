/**
 * Serviço de API - EndiAgro FinancePro
 * 
 * Este arquivo centraliza todas as comunicações com a API backend,
 * baseado nas rotas e controladores reais do sistema.
 * 
 * @author Antonio Emiliano Barros
 * @version 2.1.0
 */

// Importa as configurações da API
import { API_CONFIG, API_ENDPOINTS } from '../config/apiConfig';

/**
 * Classe para gerenciar requisições HTTP
 */
class ApiClient {
  constructor() {
    this.baseURL = API_CONFIG.API_BASE_URL;
    this.defaultHeaders = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };
    this.timeout = API_CONFIG.TIMEOUT;
  }

  /**
   * Obtém o token de autenticação do localStorage
   */
  getAuthToken() {
    return localStorage.getItem(API_CONFIG.AUTH.TOKEN_KEY);
  }

  /**
   * Configura headers com autenticação
   */
  getHeaders(includeAuth = true) {
    const headers = { ...this.defaultHeaders };
    
    if (includeAuth) {
      const token = this.getAuthToken();
      if (token) {
        headers.Authorization = `${API_CONFIG.AUTH.TOKEN_PREFIX}${token}`;
      }
    }
    
    return headers;
  }

  /**
   * Método genérico para requisições HTTP
   */
  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);
    
    const config = {
      ...options,
      headers: this.getHeaders(options.includeAuth !== false),
      signal: controller.signal,
    };

    try {
      console.log(`📤 ${config.method || 'GET'} ${url}`);
      if (config.body) {
        console.log('📦 Body:', typeof config.body === 'string' ? JSON.parse(config.body) : config.body);
      }

      const response = await fetch(url, config);
      clearTimeout(timeoutId);
      
      console.log(`📥 Response Status: ${response.status}`);
      
      // Verifica se a resposta é válida
      if (!response.ok) {
        let errorData = {};
        try {
          errorData = await response.json();
          console.error('❌ Error Response:', errorData);
        } catch (e) {
          console.error('❌ Error parsing error response:', e);
        }
        
        const error = new Error(errorData.message || `HTTP Error: ${response.status}`);
        error.status = response.status;
        error.data = errorData;
        throw error;
      }

      // Retorna os dados se a resposta não estiver vazia
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        const data = await response.json();
        console.log('📥 Response Data:', data);
        return data;
      }
      
      return response;
    } catch (error) {
      console.error(`❌ API Request failed for ${endpoint}:`, error);
      throw error;
    }
  }

  /**
   * Métodos HTTP básicos
   */
  async get(endpoint, options = {}) {
    return this.request(endpoint, { method: 'GET', ...options });
  }

  async post(endpoint, data, options = {}) {
    return this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
      ...options,
    });
  }

  async put(endpoint, data, options = {}) {
    return this.request(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
      ...options,
    });
  }

  async patch(endpoint, data, options = {}) {
    return this.request(endpoint, {
      method: 'PATCH',
      body: JSON.stringify(data),
      ...options,
    });
  }

  async delete(endpoint, options = {}) {
    return this.request(endpoint, { method: 'DELETE', ...options });
  }
}

// Instância global do cliente API
const apiClient = new ApiClient();

/**
 * ========================================
 * SERVIÇOS DE AUTENTICAÇÃO
 * ========================================
 */

/**
 * API de Autenticação - Baseada em auth.routes.js e auth.controller.js
 */
const authApi = {
  /**
   * Registra um novo usuário
   * @param {Object} userData - Dados do usuário (name, email, password, companyName)
   * @returns {Promise<Object>} Dados do usuário e token
   */
  async register(userData) {
    try {
      const response = await apiClient.post(
        API_ENDPOINTS.AUTH.REGISTER,
        userData,
        { includeAuth: false }
      );
      
      // Salvar token se retornado
      if (response.data?.token) {
        localStorage.setItem(API_CONFIG.AUTH.TOKEN_KEY, response.data.token);
        if (response.data.user) {
          localStorage.setItem(API_CONFIG.AUTH.USER_KEY, JSON.stringify(response.data.user));
        }
      }
      
      return response;
    } catch (error) {
      console.error('Erro no registro:', error);
      throw error;
    }
  },

  /**
   * Realiza login do usuário
   * @param {Object} credentials - Email e senha
   * @returns {Promise<Object>} Dados do usuário e token
   */
  async login(credentials) {
    try {
      const response = await apiClient.post(API_ENDPOINTS.AUTH.LOGIN, credentials, {
        includeAuth: false
      });
      
      // Salvar token baseado na estrutura real do controlador (auth.controller.js)
      if (response.status === 'success' && response.data?.token) {
        localStorage.setItem(API_CONFIG.AUTH.TOKEN_KEY, response.data.token);
        if (response.data.user) {
          localStorage.setItem(API_CONFIG.AUTH.USER_KEY, JSON.stringify(response.data.user));
        }
      }
      
      return response;
    } catch (error) {
      console.error('Erro no login:', error);
      throw error;
    }
  },

  /**
   * Obtém dados do usuário atual
   * @returns {Promise<Object>} Dados do usuário
   */
  async getMe() {
    try {
      return await apiClient.get(API_ENDPOINTS.AUTH.ME);
    } catch (error) {
      console.error('Erro ao obter dados do usuário:', error);
      throw error;
    }
  },

  /**
   * Solicita recuperação de senha
   * @param {string} email - Email do usuário
   * @returns {Promise<Object>} Resposta da API
   */
  async forgotPassword(email) {
    try {
      return await apiClient.post(
        API_ENDPOINTS.AUTH.FORGOT_PASSWORD,
        { email },
        { includeAuth: false }
      );
    } catch (error) {
      console.error('Erro ao solicitar recuperação de senha:', error);
      throw error;
    }
  },

  /**
   * Redefine a senha usando token
   * @param {string} token - Token de redefinição
   * @param {string} password - Nova senha
   * @returns {Promise<Object>} Resposta da API
   */
  async resetPassword(token, password) {
    try {
      return await apiClient.patch(
        `${API_ENDPOINTS.AUTH.RESET_PASSWORD}/${token}`,
        { password },
        { includeAuth: false }
      );
    } catch (error) {
      console.error('Erro ao redefinir senha:', error);
      throw error;
    }
  },

  /**
   * Atualiza a senha do usuário logado
   * @param {string} currentPassword - Senha atual
   * @param {string} newPassword - Nova senha
   * @returns {Promise<Object>} Resposta da API
   */
  async updatePassword(currentPassword, newPassword) {
    try {
      const response = await apiClient.patch(
        API_ENDPOINTS.AUTH.UPDATE_PASSWORD,
        { currentPassword, newPassword }
      );

      // Atualizar token se retornado
      if (response.data?.token) {
        localStorage.setItem(API_CONFIG.AUTH.TOKEN_KEY, response.data.token);
      }

      return response;
    } catch (error) {
      console.error('Erro ao atualizar senha:', error);
      throw error;
    }
  },

  /**
   * Realiza logout do usuário
   * @returns {Promise<void>}
   */
  async logout() {
    try {
      await apiClient.post(API_ENDPOINTS.AUTH.LOGOUT);
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
      throw error;
    } finally {
      localStorage.removeItem(API_CONFIG.AUTH.TOKEN_KEY);
      localStorage.removeItem(API_CONFIG.AUTH.USER_KEY);
    }
  },

  /**
   * Verifica se o usuário está autenticado
   * @returns {boolean} Verdadeiro se o token for válido e não estiver expirado
   */
  isAuthenticated: function() {
    const token = this.getToken();
    if (!token) return false;
    
    try {
      // Verifica se o token JWT está expirado
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.exp * 1000 > Date.now();
    } catch (e) {
      console.error('Erro ao verificar token:', e);
      return false;
    }
  },

  /**
   * Obtém o token de autenticação
   * @returns {string|null} Token ou null
   */
  getToken() {
    return localStorage.getItem(API_CONFIG.AUTH.TOKEN_KEY);
  },

  /**
   * Obtém dados do usuário do localStorage
   * @returns {Object|null} Dados do usuário ou null
   */
  getUser() {
    try {
      const user = localStorage.getItem(API_CONFIG.AUTH.USER_KEY);
      return user ? JSON.parse(user) : null;
    } catch (e) {
      console.error('Erro ao recuperar dados do usuário:', e);
      return null;
    }
  }
};

/**
 * ========================================
 * SERVIÇOS DE ORÇAMENTOS
 * ========================================
 */

/**
 * API de Orçamentos - Baseada em orcamento.routes.js e orcamento.controller.js
 */
const orcamentoApi = {
  /**
   * Lista todos os orçamentos com filtros e paginação
   * @param {Object} params - Parâmetros de filtro (status, busca, pagina, limite, etc.)
   * @returns {Promise<Object>} Lista paginada de orçamentos
   */
  async listarOrcamentos(params = {}) {
    const queryParams = new URLSearchParams();
    
    // Adicionar parâmetros válidos baseados nas rotas
    const validParams = ['status', 'busca', 'pagina', 'limite', 'dataInicio', 'dataFim', 'ordenarPor', 'ordem'];
    validParams.forEach(param => {
      if (params[param] !== undefined && params[param] !== null && params[param] !== '') {
        queryParams.append(param, params[param]);
      }
    });

    const endpoint = `/orcamentos${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    return apiClient.get(endpoint);
  },

  /**
   * Obtém um orçamento específico por ID
   * @param {string|number} id - ID do orçamento
   * @returns {Promise<Object>} Dados completos do orçamento
   */
  async obterOrcamento(id) {
    return apiClient.get(`/orcamentos/${id}`);
  },

  /**
   * Cria um novo orçamento básico
   * @param {Object} dadosOrcamento - Dados do orçamento
   * @returns {Promise<Object>} Orçamento criado
   */
  async criarOrcamento(dadosOrcamento) {
    return apiClient.post('/orcamentos', dadosOrcamento);
  },

  /**
   * Cria um orçamento completo a partir do formulário
   * @param {Object} dadosFormulario - Dados completos do formulário
   * @returns {Promise<Object>} Orçamento criado
   */
  async criarOrcamentoCompleto(dadosFormulario) {
    return apiClient.post('/orcamentos/novo-orcamento', dadosFormulario);
  },

  /**
   * Atualiza um orçamento existente
   * @param {string|number} id - ID do orçamento
   * @param {Object} dadosOrcamento - Dados atualizados
   * @returns {Promise<Object>} Orçamento atualizado
   */
  async atualizarOrcamento(id, dadosOrcamento) {
    return apiClient.patch(`/orcamentos/${id}`, dadosOrcamento);
  },

  /**
   * Exclui um orçamento
   * @param {string|number} id - ID do orçamento
   * @returns {Promise<Object>} Confirmação da exclusão
   */
  async excluirOrcamento(id) {
    return apiClient.delete(`/orcamentos/${id}`);
  },

  /**
   * Aprova um orçamento
   * @param {string|number} id - ID do orçamento
   * @param {string} observacoes - Observações da aprovação (opcional)
   * @returns {Promise<Object>} Orçamento aprovado
   */
  async aprovarOrcamento(id, observacoes = '') {
    return apiClient.patch(`/orcamentos/${id}/aprovar`, { observacoes });
  },

  /**
   * Rejeita um orçamento
   * @param {string|number} id - ID do orçamento
   * @param {string} motivo - Motivo da rejeição
   * @returns {Promise<Object>} Orçamento rejeitado
   */
  async rejeitarOrcamento(id, motivo) {
    return apiClient.patch(`/orcamentos/${id}/rejeitar`, { motivo });
  },

  /**
   * Obtém estatísticas dos orçamentos
   * @param {Object} filtros - Filtros de período (dataInicio, dataFim)
   * @returns {Promise<Object>} Estatísticas dos orçamentos
   */
  async obterEstatisticas(filtros = {}) {
    const queryParams = new URLSearchParams();
    if (filtros.dataInicio) queryParams.append('dataInicio', filtros.dataInicio);
    if (filtros.dataFim) queryParams.append('dataFim', filtros.dataFim);

    const endpoint = `/orcamentos/estatisticas${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    return apiClient.get(endpoint);
  },

  /**
   * Obtém o orçamento aprovado para um ano específico
   * @param {Object} params - Parâmetros (ano)
   * @returns {Promise<Object>} Orçamento aprovado
   */
  async obterOrcamentoAprovado(params = {}) {
    const queryParams = new URLSearchParams();
    if (params.ano) queryParams.append('ano', params.ano);

    const endpoint = `/orcamentos/aprovado${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    return apiClient.get(endpoint);
  }
};

/**
 * ========================================
 * SERVIÇOS DE TESOURARIA
 * ========================================
 */

/**
 * API de Tesouraria - Baseada em tesouraria.routes.js e tesouraria.controller.js
 */
const tesourariaApi = {
  /**
   * Lista os planos de tesouraria
   * @param {Object} params - Parâmetros de filtro (ano, mes, status, pagina, limite)
   * @returns {Promise<Object>} Lista paginada de planos
   */
  async listarPlanos(params = {}) {
    const queryParams = new URLSearchParams();
    
    const validParams = ['ano', 'mes', 'status', 'pagina', 'limite', 'ordenarPor', 'ordem'];
    validParams.forEach(param => {
      if (params[param] !== undefined && params[param] !== null && params[param] !== '') {
        queryParams.append(param, params[param]);
      }
    });

    const endpoint = `/tesouraria/planos${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    return apiClient.get(endpoint);
  },

  /**
   * Cria um novo plano de tesouraria básico
   * @param {Object} dadosPlano - Dados do plano
   * @returns {Promise<Object>} Plano criado
   */
  async criarPlano(dadosPlano) {
    return apiClient.post('/tesouraria/planos', dadosPlano);
  },

  /**
   * Cria um plano de tesouraria completo a partir do formulário
   * @param {Object} dadosFormulario - Dados completos do formulário
   * @returns {Promise<Object>} Plano criado
   */
  async criarPlanoComDados(dadosPlano) {
    return apiClient.post('/tesouraria/planos/completo', dadosPlano);
  },

  /**
   * Obtém um plano de tesouraria específico
   * @param {string|number} id - ID do plano
   * @returns {Promise<Object>} Dados completos do plano
   */
  async obterPlano(id) {
    return apiClient.get(`/tesouraria/planos/${id}`);
  },

  /**
   * Atualiza um plano de tesouraria
   * @param {string|number} id - ID do plano
   * @param {Object} dadosPlano - Dados atualizados
   * @returns {Promise<Object>} Plano atualizado
   */
  async atualizarPlano(id, dadosPlano) {
    return apiClient.put(`/tesouraria/planos/${id}`, dadosPlano);
  },

  /**
   * Exclui um plano de tesouraria
   * @param {string|number} id - ID do plano
   * @returns {Promise<Object>} Confirmação da exclusão
   */
  async excluirPlano(id) {
    return apiClient.delete(`/tesouraria/planos/${id}`);
  },

  /**
   * Aprova um plano de tesouraria
   * @param {string|number} id - ID do plano
   * @param {string} observacoes - Observações da aprovação (opcional)
   * @returns {Promise<Object>} Plano aprovado
   */
  async aprovarPlano(id, observacoes = '') {
    return apiClient.patch(`/tesouraria/planos/${id}/aprovar`, { observacoes });
  },

  /**
   * Rejeita um plano de tesouraria
   * @param {string|number} id - ID do plano
   * @param {string} motivo - Motivo da rejeição
   * @returns {Promise<Object>} Plano rejeitado
   */
  async rejeitarPlano(id, motivo) {
    return apiClient.patch(`/tesouraria/planos/${id}/rejeitar`, { motivo });
  },

  /**
   * Obtém o fluxo de caixa
   * @param {Object} filtros - Filtros (dataInicio, dataFim, planoId, tipo)
   * @returns {Promise<Object>} Dados do fluxo de caixa
   */
  async obterFluxoCaixa(filtros = {}) {
    const queryParams = new URLSearchParams();
    
    const validParams = ['dataInicio', 'dataFim', 'planoId', 'tipo'];
    validParams.forEach(param => {
      if (filtros[param] !== undefined && filtros[param] !== null && filtros[param] !== '') {
        queryParams.append(param, filtros[param]);
      }
    });

    const endpoint = `/tesouraria/fluxo-caixa${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    return apiClient.get(endpoint);
  },

  /**
   * Importa dados de um orçamento para o plano de tesouraria
   * @param {string|number} id - ID do plano
   * @param {string|number} orcamentoId - ID do orçamento
   * @param {number} mesReferencia - Mês de referência (opcional)
   * @returns {Promise<Object>} Dados importados
   */
  async importarDoOrcamento(id, orcamentoId, mesReferencia = null) {
    const dados = { orcamentoId };
    if (mesReferencia) dados.mesReferencia = mesReferencia;
    return apiClient.post(`/tesouraria/planos/${id}/importar-orcamento`, dados);
  },

  /**
   * Lista planos de tesouraria por orçamento específico
   * @param {Object} params - Parâmetros de filtro (orcamentoId, pagina, limite, ordenacao)
   * @returns {Promise<Object>} Lista paginada de planos
   */
  async listarPlanosPorOrcamento(params = {}) {
    const queryParams = new URLSearchParams();

    const validParams = ['orcamentoId', 'pagina', 'limite', 'ordenacao'];
    validParams.forEach(param => {
      if (params[param] !== undefined && params[param] !== null && params[param] !== '') {
        queryParams.append(param, params[param]);
      }
    });

    const endpoint = `/tesouraria/planos-por-orcamento${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    return apiClient.get(endpoint);
  },

  /**
   * Obtém atividades recentes relacionadas à execução orçamental
   * @param {Object} params - Parâmetros (limite)
   * @returns {Promise<Object>} Lista de atividades recentes
   */
  async obterAtividadesRecentes(params = {}) {
    const queryParams = new URLSearchParams();

    const validParams = ['limite'];
    validParams.forEach(param => {
      if (params[param] !== undefined && params[param] !== null && params[param] !== '') {
        queryParams.append(param, params[param]);
      }
    });

    const endpoint = `/tesouraria/atividades-recentes${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    return apiClient.get(endpoint);
  }
};

/**
 * ========================================
 * SERVIÇOS DE USUÁRIOS
 * ========================================
 */

/**
 * API de Usuários - Baseada em usuario.controller.js
 */
const usuarioApi = {
  /**
   * Lista todos os usuários (apenas admin)
   * @param {Object} params - Parâmetros de filtro
   * @returns {Promise<Object>} Lista paginada de usuários
   */
  async listarUsuarios(params = {}) {
    const queryParams = new URLSearchParams();
    
    const validParams = ['pagina', 'limite', 'busca', 'empresaId', 'perfil', 'ativo'];
    validParams.forEach(param => {
      if (params[param] !== undefined && params[param] !== null && params[param] !== '') {
        queryParams.append(param, params[param]);
      }
    });

    const endpoint = `/usuarios${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    return apiClient.get(endpoint);
  },

  /**
   * Cria um novo usuário (apenas admin)
   * @param {Object} dadosUsuario - Dados do usuário
   * @returns {Promise<Object>} Usuário criado
   */
  async criarUsuario(dadosUsuario) {
    return apiClient.post('/usuarios', dadosUsuario);
  },

  /**
   * Obtém um usuário específico por ID
   * @param {string|number} id - ID do usuário
   * @returns {Promise<Object>} Dados do usuário
   */
  async obterUsuario(id) {
    return apiClient.get(`/usuarios/${id}`);
  },

  /**
   * Atualiza um usuário
   * @param {string|number} id - ID do usuário
   * @param {Object} dadosUsuario - Dados atualizados
   * @returns {Promise<Object>} Usuário atualizado
   */
  async atualizarUsuario(id, dadosUsuario) {
    return apiClient.put(`/usuarios/${id}`, dadosUsuario);
  },

  /**
   * Remove um usuário (apenas admin)
   * @param {string|number} id - ID do usuário
   * @returns {Promise<Object>} Confirmação da remoção
   */
  async removerUsuario(id) {
    return apiClient.delete(`/usuarios/${id}`);
  },

  /**
   * Atualiza a senha de um usuário
   * @param {string|number} id - ID do usuário
   * @param {string} senhaAtual - Senha atual
   * @param {string} novaSenha - Nova senha
   * @returns {Promise<Object>} Confirmação da atualização
   */
  async atualizarSenha(id, senhaAtual, novaSenha) {
    return apiClient.put(`/usuarios/${id}/senha`, {
      senhaAtual,
      novaSenha
    });
  }
};

/**
 * ========================================
 * SERVIÇOS DE PGC-AO
 * ========================================
 */

/**
 * API de PGC-AO - Classificação e Validação de Contas
 */
const pgcApi = {
  /**
   * Lista documentos pendentes de classificação
   * @param {Object} params - Parâmetros de filtro
   * @returns {Promise<Object>} Lista paginada de documentos
   */
  async listarDocumentosPendentes(params = {}) {
    const queryParams = new URLSearchParams();
    
    const validParams = ['status', 'tipo', 'confianca', 'pagina', 'limite', 'busca'];
    validParams.forEach(param => {
      if (params[param] !== undefined && params[param] !== null && params[param] !== '') {
        queryParams.append(param, params[param]);
      }
    });

    const endpoint = `/pgc/documentos${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    return apiClient.get(endpoint);
  },

  /**
   * Classifica um documento como Receita ou Custo
   * @param {string|number} documentoId - ID do documento
   * @param {Object} classificacao - Dados da classificação
   * @returns {Promise<Object>} Confirmação da classificação
   */
  async classificarDocumento(documentoId, classificacao) {
    return apiClient.post(`/pgc/documentos/${documentoId}/classificar`, classificacao);
  },

  /**
   * Lista mapeamentos de contas PGC-AO
   * @param {Object} params - Parâmetros de filtro
   * @returns {Promise<Object>} Lista paginada de mapeamentos
   */
  async listarMapeamentos(params = {}) {
    const queryParams = new URLSearchParams();
    
    const validParams = ['tipo', 'contaPgc', 'status', 'pagina', 'limite', 'busca'];
    validParams.forEach(param => {
      if (params[param] !== undefined && params[param] !== null && params[param] !== '') {
        queryParams.append(param, params[param]);
      }
    });

    const endpoint = `/pgc/mapeamentos${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    return apiClient.get(endpoint);
  },

  /**
   * Cria um novo mapeamento de conta PGC-AO
   * @param {Object} mapeamento - Dados do mapeamento
   * @returns {Promise<Object>} Mapeamento criado
   */
  async criarMapeamento(mapeamento) {
    return apiClient.post('/pgc/mapeamentos', mapeamento);
  },

  /**
   * Atualiza um mapeamento de conta PGC-AO
   * @param {string|number} id - ID do mapeamento
   * @param {Object} mapeamento - Dados atualizados
   * @returns {Promise<Object>} Mapeamento atualizado
   */
  async atualizarMapeamento(id, mapeamento) {
    return apiClient.put(`/pgc/mapeamentos/${id}`, mapeamento);
  },

  /**
   * Remove um mapeamento de conta PGC-AO
   * @param {string|number} id - ID do mapeamento
   * @returns {Promise<Object>} Confirmação da remoção
   */
  async removerMapeamento(id) {
    return apiClient.delete(`/pgc/mapeamentos/${id}`);
  },

  /**
   * Valida uma classificação PGC-AO
   * @param {string|number} documentoId - ID do documento
   * @param {Object} validacao - Dados da validação
   * @returns {Promise<Object>} Confirmação da validação
   */
  async validarClassificacao(documentoId, validacao) {
    return apiClient.post(`/pgc/documentos/${documentoId}/validar`, validacao);
  },

  /**
   * Lista contas PGC-AO disponíveis
   * @param {Object} params - Parâmetros de filtro
   * @returns {Promise<Object>} Lista de contas PGC-AO
   */
  async listarContasPGC(params = {}) {
    const queryParams = new URLSearchParams();
    
    const validParams = ['categoria', 'busca', 'pagina', 'limite'];
    validParams.forEach(param => {
      if (params[param] !== undefined && params[param] !== null && params[param] !== '') {
        queryParams.append(param, params[param]);
      }
    });

    const endpoint = `/pgc/contas${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    return apiClient.get(endpoint);
  },

  /**
   * Obtém estatísticas de classificação PGC-AO
   * @param {Object} params - Parâmetros de filtro
   * @returns {Promise<Object>} Estatísticas
   */
  async obterEstatisticas(params = {}) {
    const queryParams = new URLSearchParams();
    
    const validParams = ['periodo', 'tipo', 'status'];
    validParams.forEach(param => {
      if (params[param] !== undefined && params[param] !== null && params[param] !== '') {
        queryParams.append(param, params[param]);
      }
    });

    const endpoint = `/pgc/estatisticas${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    return apiClient.get(endpoint);
  },

  /**
   * Exporta dados de classificação PGC-AO
   * @param {Object} params - Parâmetros de exportação
   * @returns {Promise<Object>} Dados para exportação
   */
  async exportarDados(params = {}) {
    const queryParams = new URLSearchParams();
    
    const validParams = ['formato', 'periodo', 'tipo', 'status'];
    validParams.forEach(param => {
      if (params[param] !== undefined && params[param] !== null && params[param] !== '') {
        queryParams.append(param, params[param]);
      }
    });

    const endpoint = `/pgc/exportar${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    return apiClient.get(endpoint);
  },

  /**
   * Processa lote de documentos para classificação
   * @param {Array} documentoIds - IDs dos documentos
   * @param {Object} configuracao - Configuração do processamento
   * @returns {Promise<Object>} Resultado do processamento
   */
  async processarLote(documentoIds, configuracao = {}) {
    return apiClient.post('/pgc/processar-lote', {
      documentoIds,
      configuracao
    });
  },

  /**
   * Obtém histórico de classificações
   * @param {Object} params - Parâmetros de filtro
   * @returns {Promise<Object>} Lista paginada do histórico
   */
  async obterHistorico(params = {}) {
    const queryParams = new URLSearchParams();
    
    const validParams = ['documentoId', 'usuarioId', 'dataInicio', 'dataFim', 'pagina', 'limite'];
    validParams.forEach(param => {
      if (params[param] !== undefined && params[param] !== null && params[param] !== '') {
        queryParams.append(param, params[param]);
      }
    });

    const endpoint = `/pgc/historico${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    return apiClient.get(endpoint);
  }
};

/**
 * ========================================
 * SERVIÇOS DE APROVAÇÃO CENTRALIZADA
 * ========================================
 */

/**
 * API de Aprovação Centralizada - Para a página de Aprovação
 */
const aprovacaoApi = {
  /**
   * Lista todos os itens pendentes de aprovação (orçamentos e planos)
   * @param {Object} params - Parâmetros de filtro
   * @returns {Promise<Object>} Lista paginada de itens pendentes
   */
  async listarItensPendentes(params = {}) {
    const queryParams = new URLSearchParams();
    
    const validParams = ['tipo', 'status', 'departamento', 'dataInicio', 'dataFim', 'pagina', 'limite', 'busca'];
    validParams.forEach(param => {
      if (params[param] !== undefined && params[param] !== null && params[param] !== '') {
        queryParams.append(param, params[param]);
      }
    });

    const endpoint = `/aprovacao/pendentes${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    return apiClient.get(endpoint);
  },

  /**
   * Aprova um item (orçamento ou plano)
   * @param {string|number} itemId - ID do item
   * @param {string} tipo - Tipo do item ('orcamento' ou 'plano')
   * @param {string} observacoes - Observações da aprovação (opcional)
   * @returns {Promise<Object>} Item aprovado
   */
  async aprovarItem(itemId, tipo, observacoes = '') {
    return apiClient.patch(`/aprovacao/${tipo}/${itemId}/aprovar`, { observacoes });
  },

  /**
   * Rejeita um item (orçamento ou plano)
   * @param {string|number} itemId - ID do item
   * @param {string} tipo - Tipo do item ('orcamento' ou 'plano')
   * @param {string} motivo - Motivo da rejeição
   * @returns {Promise<Object>} Item rejeitado
   */
  async rejeitarItem(itemId, tipo, motivo) {
    return apiClient.patch(`/aprovacao/${tipo}/${itemId}/rejeitar`, { motivo });
  },

  /**
   * Aprova múltiplos itens em lote
   * @param {Array} itens - Array de itens para aprovar [{id, tipo, observacoes}]
   * @returns {Promise<Object>} Resultado da aprovação em lote
   */
  async aprovarLote(itens) {
    return apiClient.post('/aprovacao/aprovar-lote', { itens });
  },

  /**
   * Rejeita múltiplos itens em lote
   * @param {Array} itens - Array de itens para rejeitar [{id, tipo, motivo}]
   * @returns {Promise<Object>} Resultado da rejeição em lote
   */
  async rejeitarLote(itens) {
    return apiClient.post('/aprovacao/rejeitar-lote', { itens });
  },

  /**
   * Obtém estatísticas de aprovação
   * @param {Object} filtros - Filtros de período
   * @returns {Promise<Object>} Estatísticas de aprovação
   */
  async obterEstatisticas(filtros = {}) {
    const queryParams = new URLSearchParams();
    if (filtros.dataInicio) queryParams.append('dataInicio', filtros.dataInicio);
    if (filtros.dataFim) queryParams.append('dataFim', filtros.dataFim);
    if (filtros.departamento) queryParams.append('departamento', filtros.departamento);

    const endpoint = `/aprovacao/estatisticas${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    return apiClient.get(endpoint);
  },

  /**
   * Obtém histórico de aprovações
   * @param {Object} params - Parâmetros de filtro
   * @returns {Promise<Object>} Lista paginada do histórico
   */
  async obterHistorico(params = {}) {
    const queryParams = new URLSearchParams();
    
    const validParams = ['tipo', 'status', 'usuarioId', 'dataInicio', 'dataFim', 'pagina', 'limite'];
    validParams.forEach(param => {
      if (params[param] !== undefined && params[param] !== null && params[param] !== '') {
        queryParams.append(param, params[param]);
      }
    });

    const endpoint = `/aprovacao/historico${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    return apiClient.get(endpoint);
  }
};

/**
 * ========================================
 * SERVIÇOS DE VALIDAÇÃO DE CONTAS PGC
 * ========================================
 */

/**
 * API de Validação de Contas PGC
 */
const validacaoContasApi = {
  /**
   * Lista contas PGC para validação
   * @param {Object} params - Parâmetros de filtro
   * @returns {Promise<Object>} Lista paginada de contas PGC
   */
  async listarContasPGC(params = {}) {
    const queryParams = new URLSearchParams();
    
    const validParams = ['classe', 'status', 'tipo', 'busca', 'pagina', 'limite'];
    validParams.forEach(param => {
      if (params[param] !== undefined && params[param] !== null && params[param] !== '') {
        queryParams.append(param, params[param]);
      }
    });

    const endpoint = `/validacao-contas/contas${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    return apiClient.get(endpoint);
  },

  /**
   * Valida uma conta PGC
   * @param {string|number} contaId - ID da conta
   * @param {Object} validacao - Dados da validação
   * @returns {Promise<Object>} Conta validada
   */
  async validarConta(contaId, validacao) {
    return apiClient.patch(`/validacao-contas/contas/${contaId}/validar`, validacao);
  },

  /**
   * Rejeita uma conta PGC
   * @param {string|number} contaId - ID da conta
   * @param {string} motivo - Motivo da rejeição
   * @returns {Promise<Object>} Conta rejeitada
   */
  async rejeitarConta(contaId, motivo) {
    return apiClient.patch(`/validacao-contas/contas/${contaId}/rejeitar`, { motivo });
  },

  /**
   * Obtém detalhes de uma conta PGC
   * @param {string|number} contaId - ID da conta
   * @returns {Promise<Object>} Detalhes da conta
   */
  async obterConta(contaId) {
    return apiClient.get(`/validacao-contas/contas/${contaId}`);
  },

  /**
   * Obtém estatísticas de validação de contas
   * @param {Object} filtros - Filtros de período
   * @returns {Promise<Object>} Estatísticas de validação
   */
  async obterEstatisticas(filtros = {}) {
    const queryParams = new URLSearchParams();
    if (filtros.dataInicio) queryParams.append('dataInicio', filtros.dataInicio);
    if (filtros.dataFim) queryParams.append('dataFim', filtros.dataFim);
    if (filtros.classe) queryParams.append('classe', filtros.classe);

    const endpoint = `/validacao-contas/estatisticas${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    return apiClient.get(endpoint);
  },

  /**
   * Exporta relatório de validação
   * @param {Object} params - Parâmetros de exportação
   * @returns {Promise<Blob>} Arquivo do relatório
   */
  async exportarRelatorio(params = {}) {
    const queryParams = new URLSearchParams();
    
    const validParams = ['formato', 'periodo', 'classe', 'status'];
    validParams.forEach(param => {
      if (params[param] !== undefined && params[param] !== null && params[param] !== '') {
        queryParams.append(param, params[param]);
      }
    });

    const response = await fetch(`${API_CONFIG.API_BASE_URL}/validacao-contas/exportar?${queryParams.toString()}`, {
      headers: {
        'Authorization': `Bearer ${apiClient.getAuthToken()}`,
      },
    });
    
    if (!response.ok) {
      throw new Error(`Erro ao exportar relatório: ${response.statusText}`);
    }
    
    return response.blob();
  },

};

/**
 * ========================================
 * SERVIÇOS DE UPLOAD E PROCESSAMENTO
 * ========================================
 */

/**
 * API de Upload e Processamento de Documentos
 */
const uploadApi = {
  /**
   * Faz upload de um arquivo
   * @param {File} arquivo - Arquivo para upload
   * @param {Object} metadados - Metadados do arquivo
   * @returns {Promise<Object>} Resultado do upload
   */
  async uploadArquivo(arquivo, metadados = {}) {
    const formData = new FormData();
    formData.append('arquivo', arquivo);
    
    // Adicionar metadados se fornecidos
    Object.entries(metadados).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        formData.append(key, value);
      }
    });

    return apiClient.post('/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  /**
   * Faz upload de múltiplos arquivos
   * @param {FileList|Array} arquivos - Arquivos para upload
   * @param {Object} metadados - Metadados dos arquivos
   * @returns {Promise<Object>} Resultado do upload em lote
   */
  async uploadMultiplosArquivos(arquivos, metadados = {}) {
    const formData = new FormData();
    
    // Adicionar todos os arquivos
    Array.from(arquivos).forEach((arquivo) => {
      formData.append(`arquivos`, arquivo);
    });
    
    // Adicionar metadados se fornecidos
    Object.entries(metadados).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        formData.append(key, value);
      }
    });

    return apiClient.post('/upload/lote', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  /**
   * Lista arquivos enviados
   * @param {Object} params - Parâmetros de filtro
   * @returns {Promise<Object>} Lista paginada de arquivos
   */
  async listarArquivos(params = {}) {
    const queryParams = new URLSearchParams();
    
    const validParams = ['status', 'tipo', 'dataInicio', 'dataFim', 'pagina', 'limite', 'busca'];
    validParams.forEach(param => {
      if (params[param] !== undefined && params[param] !== null && params[param] !== '') {
        queryParams.append(param, params[param]);
      }
    });

    const endpoint = `/upload/arquivos${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    return apiClient.get(endpoint);
  },

  /**
   * Obtém detalhes de um arquivo específico
   * @param {string|number} arquivoId - ID do arquivo
   * @returns {Promise<Object>} Detalhes do arquivo
   */
  async obterArquivo(arquivoId) {
    return apiClient.get(`/upload/arquivos/${arquivoId}`);
  },

  /**
   * Remove um arquivo
   * @param {string|number} arquivoId - ID do arquivo
   * @returns {Promise<Object>} Confirmação da remoção
   */
  async removerArquivo(arquivoId) {
    return apiClient.delete(`/upload/arquivos/${arquivoId}`);
  },

  /**
   * Processa um arquivo (OCR e extração de texto)
   * @param {string|number} arquivoId - ID do arquivo
   * @param {Object} configuracao - Configuração do processamento
   * @returns {Promise<Object>} Resultado do processamento
   */
  async processarArquivo(arquivoId, configuracao = {}) {
    return apiClient.post(`/upload/arquivos/${arquivoId}/processar`, configuracao);
  },

  /**
   * Reprocessa um arquivo
   * @param {string|number} arquivoId - ID do arquivo
   * @param {Object} configuracao - Nova configuração
   * @returns {Promise<Object>} Resultado do reprocessamento
   */
  async reprocessarArquivo(arquivoId, configuracao = {}) {
    return apiClient.post(`/upload/arquivos/${arquivoId}/reprocessar`, configuracao);
  },

  /**
   * Obtém status do processamento de um arquivo
   * @param {string|number} arquivoId - ID do arquivo
   * @returns {Promise<Object>} Status do processamento
   */
  async obterStatusProcessamento(arquivoId) {
    return apiClient.get(`/upload/arquivos/${arquivoId}/status`);
  },

  /**
   * Baixa um arquivo processado
   * @param {string|number} arquivoId - ID do arquivo
   * @param {string} formato - Formato de download (original, pdf, txt)
   * @returns {Promise<Blob>} Arquivo para download
   */
  async baixarArquivo(arquivoId, formato = 'original') {
    const response = await fetch(`${API_CONFIG.API_BASE_URL}/upload/arquivos/${arquivoId}/download?formato=${formato}`, {
      headers: {
        'Authorization': `Bearer ${apiClient.getAuthToken()}`,
      },
    });
    
    if (!response.ok) {
      throw new Error(`Erro ao baixar arquivo: ${response.statusText}`);
    }
    
    return response.blob();
  },

  /**
   * Lista documentos para classificação
   * @param {Object} params - Parâmetros de filtro
   * @returns {Promise<Object>} Lista de documentos para classificação
   */
  async listarDocumentosParaClassificacao(params = {}) {
    const queryParams = new URLSearchParams();
    
    const validParams = ['status', 'tipo', 'confianca', 'pagina', 'limite', 'busca'];
    validParams.forEach(param => {
      if (params[param] !== undefined && params[param] !== null && params[param] !== '') {
        queryParams.append(param, params[param]);
      }
    });

    const endpoint = `/upload/documentos-classificacao${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    return apiClient.get(endpoint);
  },

  /**
   * Obtém texto extraído de um arquivo
   * @param {string|number} arquivoId - ID do arquivo
   * @returns {Promise<Object>} Texto extraído
   */
  async obterTextoExtraido(arquivoId) {
    return apiClient.get(`/upload/arquivos/${arquivoId}/texto`);
  },

  /**
   * Obtém estatísticas de upload e processamento
   * @param {Object} params - Parâmetros de filtro
   * @returns {Promise<Object>} Estatísticas
   */
  async obterEstatisticas(params = {}) {
    const queryParams = new URLSearchParams();
    
    const validParams = ['periodo', 'tipo', 'status'];
    validParams.forEach(param => {
      if (params[param] !== undefined && params[param] !== null && params[param] !== '') {
        queryParams.append(param, params[param]);
      }
    });

    const endpoint = `/upload/estatisticas${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    return apiClient.get(endpoint);
  },

  /**
   * Processa lote de arquivos
   * @param {Array} arquivoIds - IDs dos arquivos
   * @param {Object} configuracao - Configuração do processamento
   * @returns {Promise<Object>} Resultado do processamento em lote
   */
  async processarLote(arquivoIds, configuracao = {}) {
    return apiClient.post('/upload/processar-lote', {
      arquivoIds,
      configuracao
    });
  },

  /**
   * Obtém histórico de uploads
   * @param {Object} params - Parâmetros de filtro
   * @returns {Promise<Object>} Lista paginada do histórico
   */
  async obterHistorico(params = {}) {
    const queryParams = new URLSearchParams();
    
    const validParams = ['usuarioId', 'dataInicio', 'dataFim', 'status', 'pagina', 'limite'];
    validParams.forEach(param => {
      if (params[param] !== undefined && params[param] !== null && params[param] !== '') {
        queryParams.append(param, params[param]);
      }
    });

    const endpoint = `/upload/historico${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    return apiClient.get(endpoint);
  },

  /**
   * Valida formato de arquivo
   * @param {File} arquivo - Arquivo para validar
   * @returns {Promise<Object>} Resultado da validação
   */
  async validarFormatoArquivo(arquivo) {
    const formData = new FormData();
    formData.append('arquivo', arquivo);

    return apiClient.post('/upload/validar-formato', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  /**
   * Obtém tipos de arquivo suportados
   * @returns {Promise<Object>} Lista de tipos suportados
   */
  async obterTiposSuportados() {
    return apiClient.get('/upload/tipos-suportados');
  }
};

/**
 * ========================================
 * UTILITÁRIOS
 * ========================================
 */

/**
 * Utilitários para manipulação de dados da API
 */
const apiUtils = {
  /**
   * Formata erros da API para exibição
   * @param {Error} error - Erro da API
   * @returns {string} Mensagem formatada
   */
  formatarErro(error) {
    if (error.message) {
      return error.message;
    }
    return 'Ocorreu um erro inesperado. Tente novamente.';
  },

  /**
   * Verifica se o erro é de autenticação
   * @param {Error} error - Erro da API
   * @returns {boolean} True se for erro de autenticação
   */
  isAuthError(error) {
    return error.message?.includes('401') || 
           error.message?.includes('Unauthorized') ||
           error.message?.includes('não autorizado') ||
           error.message?.includes('Token');
  },

  /**
   * Verifica se o erro é de permissão
   * @param {Error} error - Erro da API
   * @returns {boolean} True se for erro de permissão
   */
  isPermissionError(error) {
    return error.message?.includes('403') || 
           error.message?.includes('Forbidden') ||
           error.message?.includes('permissão');
  },

  /**
   * Formata parâmetros de consulta removendo valores vazios
   * @param {Object} params - Parâmetros
   * @returns {URLSearchParams} Parâmetros formatados
   */
  formatQueryParams(params) {
    const queryParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        queryParams.append(key, value);
      }
    });
    return queryParams;
  },

  /**
   * Formata dados de data para ISO string
   * @param {Date|string} date - Data
   * @returns {string} Data formatada
   */
  formatDate(date) {
    if (!date) return null;
    return new Date(date).toISOString();
  },

  /**
   * Valida campos obrigatórios
   * @param {Object} data - Dados para validar
   * @param {Array} requiredFields - Campos obrigatórios
   * @throws {Error} Se algum campo obrigatório estiver ausente
   */
  validateRequiredFields(data, requiredFields) {
    const missingFields = requiredFields.filter(field => 
      !data[field] || (typeof data[field] === 'string' && data[field].trim() === '')
    );
    
    if (missingFields.length > 0) {
      throw new Error(`Campos obrigatórios ausentes: ${missingFields.join(', ')}`);
    }
  }
};

/**
 * ========================================
 * INTERCEPTADOR DE RESPOSTA GLOBAL
 * ========================================
 */

/**
 * Intercepta todas as respostas da API para tratamento global
 */
const setupApiInterceptors = () => {
  // Interceptar erros de autenticação globalmente
  window.addEventListener('unhandledrejection', (event) => {
    if (apiUtils.isAuthError(event.reason)) {
      console.log('🔒 Erro de autenticação detectado, redirecionando para login...');
      authApi.logout();
      window.location.href = '/login';
    }
  });
};

// Configurar interceptadores
setupApiInterceptors();

// Importa os serviços adicionais
import aprovacaoService from './aprovacaoService';
import validacaoContasService from './validacaoContasService';
import tesourariaService from './tesourariaService';

// Exporta todos os serviços
const api = {
  // Cliente HTTP base
  apiClient,
  
  // Serviços de autenticação
  auth: authApi,
  
  // Serviços de orçamento
  orcamento: orcamentoApi,
  
  // Serviços de tesouraria
  tesouraria: tesourariaApi,
  
  // Serviços de usuário
  usuario: usuarioApi,
  
  // Serviços PGC-AO
  pgc: pgcApi,
  
  // Serviços de aprovação
  aprovacao: aprovacaoApi,
  aprovacaoService, // Novo serviço de aprovação
  
  // Serviços de validação de contas
  validacaoContas: validacaoContasApi,
  validacaoContasService, // Novo serviço de validação de contas
  
  // Serviços de upload
  upload: uploadApi,
  
  // Utilitários
  utils: apiUtils,
  
  // Serviço de tesouraria (novo)
  tesourariaService
};

// Exporta o cliente API para uso direto se necessário
export default api;

// Exportações nomeadas para compatibilidade com imports existentes
export {
  apiClient,
  authApi,
  orcamentoApi,
  tesourariaApi,
  usuarioApi,
  pgcApi,
  aprovacaoApi,
  validacaoContasApi,
  uploadApi,
  apiUtils,
  aprovacaoService,
  validacaoContasService,
  tesourariaService
};