/**
 * Serviço de Autenticação - EndiAgro FinancePro
 * 
 * Este serviço lida com a autenticação do usuário, incluindo login, registro,
 * recuperação de senha e gerenciamento de tokens.
 * 
 * @author Antonio Emiliano Barros
 * @version 2.0.0
 */

import { httpService } from './httpService';
import { API_CONFIG, API_ENDPOINTS } from '../config/apiConfig';

class AuthService {
  /**
   * Realiza o login do usuário
   * @param {string} email - Email do usuário
   * @param {string} password - Senha do usuário
   * @returns {Promise<Object>} Dados do usuário e token de autenticação
   */
  async login(email, password) {
    try {
      const response = await httpService.post(
        API_ENDPOINTS.AUTH.LOGIN,
        { email, senha: password },
        { includeAuth: false }
      );

      if (response.data?.token) {
        this.setAuthToken(response.data.token);
        if (response.data.user) {
          this.setUser(response.data.user);
        }
      }

      return response;
    } catch (error) {
      console.error('Erro ao fazer login:', error);
      throw error;
    }
  }

  /**
   * Registra um novo usuário
   * @param {Object} userData - Dados do usuário
   * @returns {Promise<Object>} Dados do usuário registrado
   */
  async register(userData) {
    try {
      const response = await httpService.post(
        API_ENDPOINTS.AUTH.REGISTER,
        userData,
        { includeAuth: false }
      );

      if (response.data?.token) {
        this.setAuthToken(response.data.token);
        if (response.data.user) {
          this.setUser(response.data.user);
        }
      }

      return response;
    } catch (error) {
      console.error('Erro ao registrar usuário:', error);
      throw error;
    }
  }

  /**
   * Realiza o logout do usuário
   * @returns {Promise<void>}
   */
  async logout() {
    try {
      await httpService.post(API_ENDPOINTS.AUTH.LOGOUT);
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    } finally {
      this.clearAuth();
    }
  }

  /**
   * Obtém os dados do usuário atual
   * @returns {Promise<Object>} Dados do usuário
   */
  async getCurrentUser() {
    try {
      const response = await httpService.get(API_ENDPOINTS.AUTH.ME);
      if (response.data) {
        this.setUser(response.data);
      }
      return response;
    } catch (error) {
      console.error('Erro ao obter dados do usuário:', error);
      this.clearAuth();
      throw error;
    }
  }

  /**
   * Solicita a recuperação de senha
   * @param {string} email - Email do usuário
   * @returns {Promise<Object>} Resposta da API
   */
  async forgotPassword(email) {
    try {
      return await httpService.post(
        API_ENDPOINTS.AUTH.FORGOT_PASSWORD,
        { email },
        { includeAuth: false }
      );
    } catch (error) {
      console.error('Erro ao solicitar recuperação de senha:', error);
      throw error;
    }
  }

  /**
   * Redefine a senha do usuário
   * @param {string} token - Token de redefinição de senha
   * @param {string} password - Nova senha
   * @returns {Promise<Object>} Resposta da API
   */
  async resetPassword(token, password) {
    try {
      return await httpService.post(
        `${API_ENDPOINTS.AUTH.RESET_PASSWORD}/${token}`,
        { password },
        { includeAuth: false }
      );
    } catch (error) {
      console.error('Erro ao redefinir senha:', error);
      throw error;
    }
  }

  /**
   * Atualiza a senha do usuário logado
   * @param {string} currentPassword - Senha atual
   * @param {string} newPassword - Nova senha
   * @returns {Promise<Object>} Resposta da API
   */
  async updatePassword(currentPassword, newPassword) {
    try {
      return await httpService.put(
        API_ENDPOINTS.AUTH.UPDATE_PASSWORD,
        { currentPassword, newPassword }
      );
    } catch (error) {
      console.error('Erro ao atualizar senha:', error);
      throw error;
    }
  }

  /**
   * Verifica se o usuário está autenticado
   * @returns {boolean} Verdadeiro se o usuário estiver autenticado
   */
  isAuthenticated() {
    return !!this.getAuthToken();
  }

  /**
   * Obtém o token de autenticação
   * @returns {string|null} Token de autenticação ou null
   */
  getAuthToken() {
    return localStorage.getItem(API_CONFIG.AUTH.TOKEN_KEY);
  }

  /**
   * Define o token de autenticação
   * @param {string} token - Token de autenticação
   */
  setAuthToken(token) {
    localStorage.setItem(API_CONFIG.AUTH.TOKEN_KEY, token);
  }

  /**
   * Obtém os dados do usuário atual
   * @returns {Object|null} Dados do usuário ou null
   */
  getUser() {
    const user = localStorage.getItem(API_CONFIG.AUTH.USER_KEY);
    return user ? JSON.parse(user) : null;
  }

  /**
   * Define os dados do usuário
   * @param {Object} user - Dados do usuário
   */
  setUser(user) {
    localStorage.setItem(API_CONFIG.AUTH.USER_KEY, JSON.stringify(user));
  }

  /**
   * Limpa os dados de autenticação
   */
  clearAuth() {
    localStorage.removeItem(API_CONFIG.AUTH.TOKEN_KEY);
    localStorage.removeItem(API_CONFIG.AUTH.USER_KEY);
  }
}

export const authService = new AuthService();

export default authService;
