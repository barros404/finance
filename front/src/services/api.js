/**
 * Serviço de API - EndiAgro FinancePro
 * 
 * Este arquivo centraliza todas as comunicações com a API backend,
 * baseado nas rotas e controladores reais do sistema.
 * 
 * @author Antonio Emiliano Barros
 * @version 2.0.0
 */

// Configuração base da API
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

/**
 * Classe para gerenciar requisições HTTP
 */
class ApiClient {
  constructor() {
    this.baseURL = API_BASE_URL;
    this.defaultHeaders = {
      'Content-Type': 'application/json',
    };
  }

  /**
   * Obtém o token de autenticação do localStorage
   */
  getAuthToken() {
    return localStorage.getItem('authToken');
  }

  /**
   * Configura headers com autenticação
   */
  getHeaders(includeAuth = true) {
    const headers = { ...this.defaultHeaders };
    
    if (includeAuth) {
      const token = this.getAuthToken();
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }
    }
    
    return headers;
  }

  /**
   * Método genérico para requisições HTTP
   */
  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const config = {
      headers: this.getHeaders(options.includeAuth !== false),
      ...options,
    };

    try {
      console.log(`📤 ${config.method || 'GET'} ${url}`);
      if (config.body) {
        console.log('📦 Body:', JSON.parse(config.body));
      }

      const response = await fetch(url, config);
      
      console.log(`📥 Response Status: ${response.status}`);
      
      // Verifica se a resposta é válida
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('❌ Error Response:', errorData);
        throw new Error(errorData.message || `HTTP Error: ${response.status}`);
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
export const authApi = {
  /**
   * Registra um novo usuário
   * @param {Object} userData - Dados do usuário (name, email, password, companyName)
   * @returns {Promise<Object>} Dados do usuário e token
   */
  async register(userData) {
    const response = await apiClient.post('/auth/register', userData, { includeAuth: false });
    
    // Salvar token se retornado
    if (response.data?.token) {
      localStorage.setItem('authToken', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    
    return response;
  },

  /**
   * Realiza login do usuário
   * @param {Object} credentials - Email e senha
   * @returns {Promise<Object>} Dados do usuário e token
   */
  async login(credentials) {
    const response = await apiClient.post('/auth/login', credentials, { includeAuth: false });
    
    // Salvar token baseado na estrutura real do controlador (auth.controller.js)
    if (response.status === 'success' && response.data?.token) {
      localStorage.setItem('authToken', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    
    return response;
  },

  /**
   * Obtém dados do usuário atual
   * @returns {Promise<Object>} Dados do usuário
   */
  async getMe() {
    return apiClient.get('/auth/me');
  },

  /**
   * Solicita recuperação de senha
   * @param {string} email - Email do usuário
   * @returns {Promise<Object>} Resposta da API
   */
  async forgotPassword(email) {
    return apiClient.post('/auth/forgot-password', { email }, { includeAuth: false });
  },

  /**
   * Redefine a senha usando token
   * @param {string} token - Token de redefinição
   * @param {string} password - Nova senha
   * @returns {Promise<Object>} Resposta da API
   */
  async resetPassword(token, password) {
    return apiClient.patch(`/auth/reset-password/${token}`, { password }, { includeAuth: false });
  },

  /**
   * Atualiza a senha do usuário logado
   * @param {string} currentPassword - Senha atual
   * @param {string} newPassword - Nova senha
   * @returns {Promise<Object>} Resposta da API
   */
  async updatePassword(currentPassword, newPassword) {
    const response = await apiClient.patch('/auth/update-password', {
      currentPassword,
      newPassword
    });

    // Atualizar token se retornado
    if (response.token) {
      localStorage.setItem('authToken', response.token);
    }

    return response;
  },

  /**
   * Realiza logout do usuário
   */
  async logout() {
    try {
      // Não há endpoint de logout no backend, apenas limpa dados locais
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
    } catch (error) {
      console.error('Erro no logout:', error);
    }
  },

  /**
   * Verifica se o usuário está autenticado
   * @returns {boolean} True se autenticado
   */
  isAuthenticated() {
    return !!localStorage.getItem('authToken');
  },

  /**
   * Obtém o token de autenticação
   * @returns {string|null} Token ou null
   */
  getToken() {
    return localStorage.getItem('authToken');
  },

  /**
   * Obtém dados do usuário do localStorage
   * @returns {Object|null} Dados do usuário ou null
   */
  getUser() {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
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
export const orcamentoApi = {
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
export const tesourariaApi = {
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
  async criarPlanoCompleto(dadosFormulario) {
    return apiClient.post('/tesouraria/novo-plano', dadosFormulario);
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
export const usuarioApi = {
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
 * UTILITÁRIOS
 * ========================================
 */

/**
 * Utilitários para manipulação de dados da API
 */
export const apiUtils = {
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

// Exporta o cliente API para uso direto se necessário
export default apiClient;