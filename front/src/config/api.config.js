/**
 * Configurações da API
 * 
 * Este arquivo contém as configurações de URL base e outros parâmetros
 * necessários para a comunicação com a API do backend.
 */

export const API_CONFIG = {
  // URL base da API - será usada em todos os serviços
  BASE_URL: 'http://localhost:5000/api',
  
  // Configurações de timeout (em milissegundos)
  TIMEOUT: 30000, // 30 segundos
  
  // Configurações de cabeçalhos padrão
  DEFAULT_HEADERS: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  
  // Configurações de autenticação
  AUTH: {
    TOKEN_KEY: 'authToken',
    USER_KEY: 'user',
    TOKEN_PREFIX: 'Bearer ',
  },
  
  // Configurações de roteamento
  ROUTES: {
    AUTH: {
      LOGIN: '/auth/login',
      REGISTER: '/auth/register',
      ME: '/auth/me',
      FORGOT_PASSWORD: '/auth/forgot-password',
      RESET_PASSWORD: '/auth/reset-password',
      LOGOUT: '/auth/logout',
    },
    ORCAMENTOS: '/orcamentos',
    TESOURARIA: '/tesouraria',
    USUARIOS: '/usuarios',
    APROVACOES: '/aprovacoes',
    RELATORIOS: '/relatorios',
  },
};

export default API_CONFIG;
