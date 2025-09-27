/**
 * Serviço HTTP Unificado - EndiAgro FinancePro
 * 
 * Este serviço centraliza TODAS as comunicações HTTP com a API,
 * incluindo tratamento de erros, autenticação e retry automático.
 * 
 * @author Antonio Emiliano Barros
 * @version 3.0.0
 */

import { API_CONFIG, API_ENDPOINTS, MESSAGES } from '../config/api.config.unified';

class HttpService {
  constructor() {
    this.baseURL = API_CONFIG.BASE_URL;
    this.timeout = API_CONFIG.TIMEOUT;
    this.maxRetries = API_CONFIG.MAX_RETRIES;
    this.retryDelay = API_CONFIG.RETRY_DELAY;
  }

  /**
   * Obtém o token de autenticação do localStorage
   */
  getAuthToken() {
    return localStorage.getItem(API_CONFIG.AUTH.TOKEN_KEY);
  }

  /**
   * Obtém dados do usuário do localStorage
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

  /**
   * Configura headers da requisição
   */
  getHeaders(includeAuth = true, customHeaders = {}) {
    const headers = { ...API_CONFIG.DEFAULT_HEADERS };
    
    if (includeAuth) {
      const token = this.getAuthToken();
      if (token) {
        headers.Authorization = `${API_CONFIG.AUTH.TOKEN_PREFIX}${token}`;
      }
    }
    
    return { ...headers, ...customHeaders };
  }

  /**
   * Trata erros da API de forma unificada
   */
  handleError(error, endpoint) {
    console.error(`❌ Erro na requisição ${endpoint}:`, error);
    
    // Erro de rede
    if (!error.status) {
      return {
        message: MESSAGES.ERROR.NETWORK,
        type: 'NETWORK_ERROR',
        originalError: error
      };
    }
    
    // Erro de autenticação
    if (error.status === 401) {
      this.clearAuth();
      return {
        message: MESSAGES.ERROR.UNAUTHORIZED,
        type: 'AUTH_ERROR',
        originalError: error
      };
    }
    
    // Erro de permissão
    if (error.status === 403) {
      return {
        message: MESSAGES.ERROR.FORBIDDEN,
        type: 'PERMISSION_ERROR',
        originalError: error
      };
    }
    
    // Erro não encontrado
    if (error.status === 404) {
      return {
        message: MESSAGES.ERROR.NOT_FOUND,
        type: 'NOT_FOUND_ERROR',
        originalError: error
      };
    }
    
    // Erro de validação
    if (error.status === 400) {
      return {
        message: error.data?.message || MESSAGES.ERROR.VALIDATION,
        type: 'VALIDATION_ERROR',
        originalError: error,
        details: error.data
      };
    }
    
    // Erro do servidor
    if (error.status >= 500) {
      return {
        message: MESSAGES.ERROR.SERVER_ERROR,
        type: 'SERVER_ERROR',
        originalError: error
      };
    }
    
    // Erro genérico
    return {
      message: error.message || MESSAGES.ERROR.GENERIC,
      type: 'GENERIC_ERROR',
      originalError: error
    };
  }

  /**
   * Limpa dados de autenticação
   */
  clearAuth() {
    localStorage.removeItem(API_CONFIG.AUTH.TOKEN_KEY);
    localStorage.removeItem(API_CONFIG.AUTH.USER_KEY);
  }

  /**
   * Faz uma requisição HTTP com retry automático
   */
  async request(method, endpoint, options = {}) {
    const { 
      body, 
      headers = {}, 
      params = {}, 
      includeAuth = true,
      retryCount = 0 
    } = options;
    
    // Adiciona parâmetros de consulta à URL
    const queryString = Object.keys(params).length
      ? `?${new URLSearchParams(params).toString()}`
      : '';
    
    const url = `${this.baseURL}${endpoint}${queryString}`;
    
    try {
      console.log(`📤 ${method} ${url}`);
      if (body && typeof body === 'object') {
        console.log('📦 Body:', body);
      }
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.timeout);
      
      const response = await fetch(url, {
        method,
        headers: this.getHeaders(includeAuth, headers),
        body: body ? JSON.stringify(body) : undefined,
        signal: controller.signal,
      });
      
      clearTimeout(timeoutId);
      
      console.log(`📥 Response Status: ${response.status}`);
      
      // Verifica se a resposta é válida
      if (!response.ok) {
        let errorData = {};
        try {
          errorData = await response.json();
        } catch (e) {
          console.error('❌ Erro ao fazer parse da resposta de erro:', e);
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
      // Retry automático para erros de rede
      if (retryCount < this.maxRetries && !error.status) {
        console.log(`🔄 Tentativa ${retryCount + 1}/${this.maxRetries} falhou, tentando novamente em ${this.retryDelay}ms...`);
        await new Promise(resolve => setTimeout(resolve, this.retryDelay));
        return this.request(method, endpoint, { ...options, retryCount: retryCount + 1 });
      }
      
      const handledError = this.handleError(error, endpoint);
      throw handledError;
    }
  }

  /**
   * Métodos HTTP básicos
   */
  async get(endpoint, params = {}, options = {}) {
    return this.request('GET', endpoint, { ...options, params });
  }

  async post(endpoint, body = {}, options = {}) {
    return this.request('POST', endpoint, { ...options, body });
  }

  async put(endpoint, body = {}, options = {}) {
    return this.request('PUT', endpoint, { ...options, body });
  }

  async patch(endpoint, body = {}, options = {}) {
    return this.request('PATCH', endpoint, { ...options, body });
  }

  async delete(endpoint, options = {}) {
    return this.request('DELETE', endpoint, options);
  }

  /**
   * Upload de arquivo
   */
  async upload(endpoint, file, metadata = {}) {
    const formData = new FormData();
    formData.append('arquivo', file);
    
    // Adicionar metadados se fornecidos
    Object.entries(metadata).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        formData.append(key, value);
      }
    });

    return this.request('POST', endpoint, {
      body: formData,
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  }

  /**
   * Download de arquivo
   */
  async download(endpoint, filename = 'download') {
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      headers: this.getHeaders(true),
    });
    
    if (!response.ok) {
      throw new Error(`Erro ao baixar arquivo: ${response.statusText}`);
    }
    
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  }

  /**
   * Verifica se o usuário está autenticado
   */
  isAuthenticated() {
    const token = this.getAuthToken();
    if (!token) return false;
    
    try {
      // Verifica se o token JWT está expirado
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.exp * 1000 > Date.now();
    } catch (e) {
      console.error('Erro ao verificar token:', e);
      return false;
    }
  }

  /**
   * Verifica a saúde da API
   */
  async checkHealth() {
    try {
      const response = await this.get(API_ENDPOINTS.HEALTH, {}, { includeAuth: false });
      return { success: true, data: response };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
}

// Instância global do serviço HTTP
export const httpService = new HttpService();

// Exportações para compatibilidade
export const apiClient = httpService;

export default httpService;
