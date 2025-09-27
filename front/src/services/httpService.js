/**
 * Serviço HTTP - EndiAgro FinancePro
 * 
 * Este serviço encapsula o cliente HTTP e fornece métodos para fazer
 * requisições à API com tratamento de erros e autenticação.
 * 
 * @author Antonio Emiliano Barros
 * @version 2.0.0
 */

import apiConfig from '../config/apiConfig';

class HttpService {
  constructor() {
    this.baseURL = apiConfig.API_CONFIG.API_BASE_URL;
    this.defaultHeaders = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };
  }

  /**
   * Obtém o token de autenticação do localStorage
   * @returns {string|null} Token de autenticação ou null
   */
  getAuthToken() {
    return localStorage.getItem(apiConfig.API_CONFIG.AUTH.TOKEN_KEY);
  }

  /**
   * Configura os headers da requisição
   * @param {Object} headers - Headers adicionais
   * @param {boolean} includeAuth - Incluir token de autenticação
   * @returns {Object} Headers configurados
   */
  getHeaders(headers = {}, includeAuth = true) {
    const authHeaders = {};
    
    if (includeAuth) {
      const token = this.getAuthToken();
      if (token) {
        authHeaders['Authorization'] = `Bearer ${token}`;
      }
    }
    
    return {
      ...this.defaultHeaders,
      ...authHeaders,
      ...headers
    };
  }

  /**
   * Trata erros da API
   * @param {Response} response - Resposta da API
   * @returns {Promise<Object>} Dados da resposta ou lança um erro
   */
  async handleResponse(response) {
    const data = await response.json().catch(() => ({}));
    
    if (!response.ok) {
      const error = new Error(data.message || 'Erro na requisição');
      error.status = response.status;
      error.data = data;
      throw error;
    }
    
    return data;
  }

  /**
   * Faz uma requisição HTTP
   * @param {string} method - Método HTTP (GET, POST, PUT, DELETE, etc.)
   * @param {string} endpoint - Endpoint da API
   * @param {Object} options - Opções adicionais (body, headers, etc.)
   * @returns {Promise<Object>} Resposta da API
   */
  async request(method, endpoint, options = {}) {
    const { body, headers = {}, params = {}, includeAuth = true } = options;
    
    // Adiciona parâmetros de consulta à URL
    const queryString = Object.keys(params).length
      ? `?${new URLSearchParams(params).toString()}`
      : '';
    
    const url = `${this.baseURL}${endpoint}${queryString}`;
    
    try {
      const response = await fetch(url, {
        method,
        headers: this.getHeaders(headers, includeAuth),
        body: body ? JSON.stringify(body) : undefined,
      });
      
      return this.handleResponse(response);
    } catch (error) {
      console.error(`Erro na requisição ${method} ${endpoint}:`, error);
      throw error;
    }
  }

  // Métodos HTTP auxiliares
  get(endpoint, params = {}, options = {}) {
    return this.request('GET', endpoint, { ...options, params });
  }

  post(endpoint, body = {}, options = {}) {
    return this.request('POST', endpoint, { ...options, body });
  }

  put(endpoint, body = {}, options = {}) {
    return this.request('PUT', endpoint, { ...options, body });
  }

  patch(endpoint, body = {}, options = {}) {
    return this.request('PATCH', endpoint, { ...options, body });
  }

  delete(endpoint, options = {}) {
    return this.request('DELETE', endpoint, options);
  }
}

export const httpService = new HttpService();
export const apiClient = httpService;

export default httpService;
