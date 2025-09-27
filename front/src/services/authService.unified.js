/**
 * Serviço de Autenticação Unificado - EndiAgro FinancePro
 * 
 * Este serviço centraliza TODAS as operações de autenticação,
 * com tratamento correto de erros e estrutura de dados.
 * 
 * @author Antonio Emiliano Barros
 * @version 3.0.0
 */

import { httpService } from './httpService.unified';
import { API_ENDPOINTS, MESSAGES } from '../config/api.config.unified';

class AuthService {
  /**
   * Realiza o login do usuário
   * @param {string} email - Email do usuário
   * @param {string} password - Senha do usuário
   * @returns {Promise<Object>} Dados do usuário e token de autenticação
   */
  async login(email, password) {
    try {
      console.log('🔐 Tentando fazer login...');
      
      const response = await httpService.post(
        API_ENDPOINTS.AUTH.LOGIN,
        { email, senha: password }, // ✅ Campo correto: 'senha'
        { includeAuth: false }
      );

      console.log('📥 Resposta do login:', response);

      // Verifica a estrutura da resposta baseada no controller real
      if (response.status === 'success' && response.data?.token) {
        this.setAuthToken(response.data.token);
        if (response.data.user) {
          this.setUser(response.data.user);
        }
        console.log('✅ Login realizado com sucesso');
        return response;
      } else if (response.token) {
        // Estrutura alternativa
        this.setAuthToken(response.token);
        if (response.user) {
          this.setUser(response.user);
        }
        console.log('✅ Login realizado com sucesso (estrutura alternativa)');
        return response;
      } else {
        throw new Error('Resposta de login inválida');
      }
    } catch (error) {
      console.error('❌ Erro ao fazer login:', error);
      
      // Tratamento específico de erros de login
      if (error.type === 'VALIDATION_ERROR') {
        throw new Error('Email ou senha incorretos');
      } else if (error.type === 'AUTH_ERROR') {
        throw new Error('Credenciais inválidas');
      }
      
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
      console.log('📝 Registrando novo usuário...');
      
      const response = await httpService.post(
        API_ENDPOINTS.AUTH.REGISTER,
        userData,
        { includeAuth: false }
      );

      console.log('📥 Resposta do registro:', response);

      // Verifica a estrutura da resposta
      if (response.status === 'success' && response.data?.token) {
        this.setAuthToken(response.data.token);
        if (response.data.user) {
          this.setUser(response.data.user);
        }
        console.log('✅ Usuário registrado com sucesso');
        return response;
      } else if (response.token) {
        // Estrutura alternativa
        this.setAuthToken(response.token);
        if (response.user) {
          this.setUser(response.user);
        }
        console.log('✅ Usuário registrado com sucesso (estrutura alternativa)');
        return response;
      } else {
        throw new Error('Resposta de registro inválida');
      }
    } catch (error) {
      console.error('❌ Erro ao registrar usuário:', error);
      throw error;
    }
  }

  /**
   * Realiza o logout do usuário
   * @returns {Promise<void>}
   */
  async logout() {
    try {
      console.log('🚪 Fazendo logout...');
      
      // Tenta fazer logout no servidor
      try {
        await httpService.post(API_ENDPOINTS.AUTH.LOGOUT);
        console.log('✅ Logout realizado no servidor');
      } catch (error) {
        console.warn('⚠️ Erro ao fazer logout no servidor (continuando):', error);
      }
    } catch (error) {
      console.error('❌ Erro ao fazer logout:', error);
    } finally {
      // Sempre limpa os dados locais
      this.clearAuth();
      console.log('🧹 Dados de autenticação limpos');
    }
  }

  /**
   * Obtém os dados do usuário atual
   * @returns {Promise<Object>} Dados do usuário
   */
  async getCurrentUser() {
    try {
      console.log('👤 Obtendo dados do usuário atual...');
      
      const response = await httpService.get(API_ENDPOINTS.AUTH.ME);
      
      console.log('📥 Dados do usuário:', response);
      
      if (response.status === 'success' && response.data) {
        this.setUser(response.data);
        return response;
      } else if (response.user) {
        this.setUser(response.user);
        return response;
      } else {
        throw new Error('Resposta de usuário inválida');
      }
    } catch (error) {
      console.error('❌ Erro ao obter dados do usuário:', error);
      
      // Se for erro de autenticação, limpa os dados locais
      if (error.type === 'AUTH_ERROR') {
        this.clearAuth();
      }
      
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
      console.log('🔑 Solicitando recuperação de senha...');
      
      const response = await httpService.post(
        API_ENDPOINTS.AUTH.FORGOT_PASSWORD,
        { email },
        { includeAuth: false }
      );
      
      console.log('📥 Resposta da recuperação de senha:', response);
      return response;
    } catch (error) {
      console.error('❌ Erro ao solicitar recuperação de senha:', error);
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
      console.log('🔑 Redefinindo senha...');
      
      const response = await httpService.patch(
        `${API_ENDPOINTS.AUTH.RESET_PASSWORD}/${token}`,
        { password },
        { includeAuth: false }
      );
      
      console.log('📥 Resposta da redefinição de senha:', response);
      return response;
    } catch (error) {
      console.error('❌ Erro ao redefinir senha:', error);
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
      console.log('🔑 Atualizando senha...');
      
      const response = await httpService.patch(
        API_ENDPOINTS.AUTH.UPDATE_PASSWORD,
        { currentPassword, newPassword }
      );

      console.log('📥 Resposta da atualização de senha:', response);
      
      // Atualizar token se retornado
      if (response.data?.token) {
        this.setAuthToken(response.data.token);
      } else if (response.token) {
        this.setAuthToken(response.token);
      }

      return response;
    } catch (error) {
      console.error('❌ Erro ao atualizar senha:', error);
      throw error;
    }
  }

  /**
   * Verifica se o usuário está autenticado
   * @returns {boolean} Verdadeiro se o usuário estiver autenticado
   */
  isAuthenticated() {
    return httpService.isAuthenticated();
  }

  /**
   * Obtém o token de autenticação
   * @returns {string|null} Token de autenticação ou null
   */
  getAuthToken() {
    return localStorage.getItem('authToken');
  }

  /**
   * Define o token de autenticação
   * @param {string} token - Token de autenticação
   */
  setAuthToken(token) {
    localStorage.setItem('authToken', token);
  }

  /**
   * Obtém os dados do usuário atual
   * @returns {Object|null} Dados do usuário ou null
   */
  getUser() {
    try {
      const user = localStorage.getItem('user');
      return user ? JSON.parse(user) : null;
    } catch (e) {
      console.error('Erro ao recuperar dados do usuário:', e);
      return null;
    }
  }

  /**
   * Define os dados do usuário
   * @param {Object} user - Dados do usuário
   */
  setUser(user) {
    localStorage.setItem('user', JSON.stringify(user));
  }

  /**
   * Limpa os dados de autenticação
   */
  clearAuth() {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
  }

  /**
   * Verifica se o token está expirado
   * @returns {boolean} Verdadeiro se o token estiver expirado
   */
  isTokenExpired() {
    const token = this.getAuthToken();
    if (!token) return true;
    
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.exp * 1000 <= Date.now();
    } catch (e) {
      console.error('Erro ao verificar expiração do token:', e);
      return true;
    }
  }

  /**
   * Renova o token de autenticação
   * @returns {Promise<Object>} Novo token
   */
  async refreshToken() {
    try {
      console.log('🔄 Renovando token...');
      
      const response = await httpService.post(API_ENDPOINTS.AUTH.REFRESH_TOKEN);
      
      if (response.data?.token) {
        this.setAuthToken(response.data.token);
        console.log('✅ Token renovado com sucesso');
        return response;
      } else if (response.token) {
        this.setAuthToken(response.token);
        console.log('✅ Token renovado com sucesso (estrutura alternativa)');
        return response;
      } else {
        throw new Error('Resposta de renovação de token inválida');
      }
    } catch (error) {
      console.error('❌ Erro ao renovar token:', error);
      this.clearAuth();
      throw error;
    }
  }
}

// Instância global do serviço de autenticação
export const authService = new AuthService();

export default authService;
