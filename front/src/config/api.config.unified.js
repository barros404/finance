/**
 * Configuração Unificada da API - EndiAgro FinancePro
 * 
 * Este arquivo centraliza TODAS as configurações da API em um local único,
 * eliminando conflitos e inconsistências.
 * 
 * @author Antonio Emiliano Barros
 * @version 3.0.0
 */

// Configuração do ambiente
const isDevelopment = import.meta.env.MODE === 'development';
const isProduction = import.meta.env.MODE === 'production';

/**
 * ========================================
 * CONFIGURAÇÃO PRINCIPAL DA API
 * ========================================
 */
export const API_CONFIG = {
  // URL base da API
  BASE_URL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  
  // Configurações de timeout
  TIMEOUT: 30000, // 30 segundos
  
  // Configurações de retry
  MAX_RETRIES: 3,
  RETRY_DELAY: 1000, // 1 segundo
  
  // Configurações de autenticação
  AUTH: {
    TOKEN_KEY: 'authToken',
    USER_KEY: 'user',
    TOKEN_PREFIX: 'Bearer ',
  },
  
  // Headers padrão
  DEFAULT_HEADERS: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  
  // Configurações de ambiente
  ENVIRONMENT: {
    isDevelopment,
    isProduction,
    NODE_ENV: import.meta.env.MODE || 'development'
  }
};

/**
 * ========================================
 * ENDPOINTS DA API
 * ========================================
 */
export const API_ENDPOINTS = {
  // Autenticação
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    LOGOUT: '/auth/logout',
    ME: '/auth/me',
    FORGOT_PASSWORD: '/auth/forgot-password',
    RESET_PASSWORD: '/auth/reset-password',
    UPDATE_PASSWORD: '/auth/update-password',
    REFRESH_TOKEN: '/auth/refresh-token'
  },
  
  // Orçamentos
  ORCAMENTOS: {
    LIST: '/orcamentos',
    CREATE: '/orcamentos',
    GET: '/orcamentos/:id',
    UPDATE: '/orcamentos/:id',
    DELETE: '/orcamentos/:id',
    APPROVE: '/orcamentos/:id/aprovar',
    REJECT: '/orcamentos/:id/rejeitar',
    STATS: '/orcamentos/estatisticas',
    APPROVED: '/orcamentos/aprovado',
    COMPLETE: '/orcamentos/novo-orcamento'
  },
  
  // Tesouraria
  TESOURARIA: {
    PLANOS: '/tesouraria/planos',
    PLANO: '/tesouraria/planos/:id',
    FLUXO_CAIXA: '/tesouraria/fluxo-caixa',
    ESTATISTICAS: '/tesouraria/estatisticas',
    ATIVIDADES: '/tesouraria/atividades-recentes',
    PLANOS_POR_ORCAMENTO: '/tesouraria/planos-por-orcamento',
    IMPORTAR_ORCAMENTO: '/tesouraria/planos/:id/importar-orcamento'
  },
  
  // Usuários
  USUARIOS: {
    LIST: '/usuarios',
    CREATE: '/usuarios',
    GET: '/usuarios/:id',
    UPDATE: '/usuarios/:id',
    DELETE: '/usuarios/:id'
  },
  
  // Aprovação
  APROVACAO: {
    PENDENTES: '/aprovacao/pendentes',
    APPROVE: '/aprovacao/:tipo/:id/aprovar',
    REJECT: '/aprovacao/:tipo/:id/rejeitar',
    BATCH_APPROVE: '/aprovacao/aprovar-lote',
    BATCH_REJECT: '/aprovacao/rejeitar-lote',
    STATS: '/aprovacao/estatisticas',
    HISTORICO: '/aprovacao/historico'
  },
  
  // Upload
  UPLOAD: {
    UPLOAD: '/upload',
    FILES: '/upload/arquivos',
    FILE: '/upload/arquivos/:id',
    PROCESS: '/upload/arquivos/:id/processar',
    STATUS: '/upload/arquivos/:id/status',
    DOWNLOAD: '/upload/arquivos/:id/download'
  },
  
  // PGC
  PGC: {
    DOCUMENTOS: '/pgc/documentos',
    MAPEAMENTOS: '/pgc/mapeamentos',
    CONTAS: '/pgc/contas',
    ESTATISTICAS: '/pgc/estatisticas',
    EXPORTAR: '/pgc/exportar'
  },
  
  // Health Check
  HEALTH: '/health'
};

/**
 * ========================================
 * CONFIGURAÇÕES DE VALIDAÇÃO
 * ========================================
 */
export const VALIDATION_CONFIG = {
  // Validação de senha
  PASSWORD: {
    MIN_LENGTH: 8,
    REQUIRE_UPPERCASE: true,
    REQUIRE_LOWERCASE: true,
    REQUIRE_NUMBER: true,
    REQUIRE_SPECIAL_CHAR: true
  },
  
  // Validação de e-mail
  EMAIL: {
    REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  },
  
  // Validação de CPF
  CPF: {
    REGEX: /^\d{3}\.?\d{3}\.?\d{3}\-?\d{2}$/
  },
  
  // Validação de CNPJ
  CNPJ: {
    REGEX: /^\d{2}\.?\d{3}\.?\d{3}\/?\d{4}\-?\d{2}$/
  }
};

/**
 * ========================================
 * MENSAGENS DO SISTEMA
 * ========================================
 */
export const MESSAGES = {
  SUCCESS: {
    SAVED: 'Dados salvos com sucesso!',
    UPDATED: 'Dados atualizados com sucesso!',
    DELETED: 'Item excluído com sucesso!',
    APPROVED: 'Item aprovado com sucesso!',
    REJECTED: 'Item rejeitado com sucesso!',
    LOGIN: 'Login realizado com sucesso!',
    LOGOUT: 'Logout realizado com sucesso!'
  },
  
  ERROR: {
    GENERIC: 'Ocorreu um erro inesperado. Tente novamente.',
    NETWORK: 'Erro de conexão. Verifique sua internet.',
    UNAUTHORIZED: 'Sessão expirada. Faça login novamente.',
    FORBIDDEN: 'Você não tem permissão para esta ação.',
    NOT_FOUND: 'Item não encontrado.',
    VALIDATION: 'Dados inválidos. Verifique os campos.',
    LOGIN_FAILED: 'Email ou senha incorretos.',
    SERVER_ERROR: 'Erro interno do servidor. Tente novamente mais tarde.'
  },
  
  LOADING: {
    LOADING: 'Carregando...',
    SAVING: 'Salvando...',
    UPLOADING: 'Enviando arquivo...',
    PROCESSING: 'Processando...',
    VALIDATING: 'Validando...'
  }
};

/**
 * ========================================
 * UTILITÁRIOS
 * ========================================
 */

/**
 * Verifica se está em modo de desenvolvimento
 */
//export const isDevelopment = () => API_CONFIG.ENVIRONMENT.isDevelopment;

/**
 * Verifica se está em modo de produção
 */
//export const isProduction = () => API_CONFIG.ENVIRONMENT.isProduction;

/**
 * Obtém a URL base da API
 */
export const getApiBaseUrl = () => API_CONFIG.BASE_URL;

/**
 * Obtém configurações de timeout
 */
export const getTimeout = () => API_CONFIG.TIMEOUT;

/**
 * Obtém configurações de autenticação
 */
export const getAuthConfig = () => API_CONFIG.AUTH;

/**
 * Obtém headers padrão
 */
export const getDefaultHeaders = () => API_CONFIG.DEFAULT_HEADERS;

/**
 * Formata endpoint com parâmetros
 */
export const formatEndpoint = (endpoint, params = {}) => {
  let formattedEndpoint = endpoint;
  
  Object.entries(params).forEach(([key, value]) => {
    formattedEndpoint = formattedEndpoint.replace(`:${key}`, value);
  });
  
  return formattedEndpoint;
};

/**
 * Verifica se a API está acessível
 */
export const checkApiHealth = async () => {
  try {
    const response = await fetch(`${API_CONFIG.BASE_URL}${API_ENDPOINTS.HEALTH}`);
    return response.ok;
  } catch (error) {
    console.error('Erro ao verificar saúde da API:', error);
    return false;
  }
};

// Exportação padrão
export default {
  API_CONFIG,
  API_ENDPOINTS,
  VALIDATION_CONFIG,
  MESSAGES,
  isDevelopment,
  isProduction,
  getApiBaseUrl,
  getTimeout,
  getAuthConfig,
  getDefaultHeaders,
  formatEndpoint,
  checkApiHealth
};
