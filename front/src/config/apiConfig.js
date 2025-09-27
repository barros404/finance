/**
 * Configuração da API - EndiAgro FinancePro
 * 
 * Este arquivo centraliza as configurações da API e permite
 * alternar facilmente entre modo de desenvolvimento (mock) e produção (API real).
 * 
 * @author Antonio Emiliano Barros
 * @version 2.0.0
 */

/**
 * ========================================
 * CONFIGURAÇÕES DA API
 * ========================================
 */

// Configuração do ambiente
export const API_CONFIG = {
  // Modo de desenvolvimento (true = mock, false = API real)
  USE_MOCK: false,
  
  // URL base da API real
  API_BASE_URL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  
  // Configurações de timeout
  TIMEOUT: 30000, // 30 segundos
  
  // Configurações de retry
  MAX_RETRIES: 3,
  RETRY_DELAY: 1000, // 1 segundo
  
  // Configurações de mock
  MOCK_DELAY: 500, // Delay simulado em ms
  
  // Configurações de cache
  CACHE_ENABLED: true,
  CACHE_DURATION: 5 * 60 * 1000, // 5 minutos
  
  // Configurações de autenticação
  AUTH: {
    TOKEN_KEY: 'authToken',
    USER_KEY: 'user',
    TOKEN_PREFIX: 'Bearer ',
  },
};

/**
 * Verifica se está em modo de desenvolvimento
 * @returns {boolean} True se estiver em modo de desenvolvimento
 */
export const isDevelopment = () => {
  return import.meta.env.MODE === 'development';
};

/**
 * Verifica se deve usar mock
 * @returns {boolean} True se deve usar mock
 */
export const shouldUseMock = () => {
  return API_CONFIG.USE_MOCK;
};

/**
 * Obtém a URL base da API
 * @returns {string} URL base da API
 */
export const getApiBaseUrl = () => {
  return API_CONFIG.API_BASE_URL;
};

/**
 * Obtém configurações de timeout
 * @returns {number} Timeout em ms
 */
export const getTimeout = () => {
  return API_CONFIG.TIMEOUT;
};

/**
 * Obtém configurações de retry
 * @returns {Object} Configurações de retry
 */
export const getRetryConfig = () => {
  return {
    maxRetries: API_CONFIG.MAX_RETRIES,
    retryDelay: API_CONFIG.RETRY_DELAY
  };
};

/**
 * Obtém configurações de mock
 * @returns {Object} Configurações de mock
 */
export const getMockConfig = () => {
  return {
    delay: API_CONFIG.MOCK_DELAY,
    enabled: shouldUseMock()
  };
};

/**
 * Obtém configurações de cache
 * @returns {Object} Configurações de cache
 */
export const getCacheConfig = () => {
  return {
    enabled: API_CONFIG.CACHE_ENABLED,
    duration: API_CONFIG.CACHE_DURATION
  };
};

/**
 * ========================================
 * CONFIGURAÇÕES POR AMBIENTE
 * ========================================
 */

// Configurações específicas por ambiente
export const ENV_CONFIG = {
  development: {
    USE_MOCK: true,
    API_BASE_URL: 'http://localhost:5000/api',
    MOCK_DELAY: 500,
    LOG_LEVEL: 'debug'
  },
  
  staging: {
    USE_MOCK: false,
    API_BASE_URL: 'https://staging-api.endiagro.com/api',
    MOCK_DELAY: 200,
    LOG_LEVEL: 'info'
  },
  
  production: {
    USE_MOCK: false,
    API_BASE_URL: 'https://api.endiagro.com/api',
    MOCK_DELAY: 100,
    LOG_LEVEL: 'error'
  }
};

/**
 * Obtém configurações do ambiente atual
 * @returns {Object} Configurações do ambiente
 */
export const getEnvironmentConfig = () => {
  const env = import.meta.env.MODE || 'development';
  return ENV_CONFIG[env] || ENV_CONFIG.development;
};

/**
 * ========================================
 * CONFIGURAÇÕES DE ENDPOINTS
 * ========================================
 */

// Endpoints da API
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
  
  // Usuários
  USUARIOS: {
    LIST: '/usuarios',
    CREATE: '/usuarios',
    GET: '/usuarios/:id',
    UPDATE: '/usuarios/:id',
    DELETE: '/usuarios/:id',
    UPDATE_PROFILE: '/usuarios/perfil',
    UPDATE_PASSWORD: '/usuarios/alterar-senha',
    ROLES: '/usuarios/roles',
    PERMISSOES: '/usuarios/permissoes',
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
    CATEGORIAS: '/orcamentos/categorias',
    ITENS: '/orcamentos/:id/itens',
    ITEM: '/orcamentos/:orcamentoId/itens/:itemId',
    ANEXOS: '/orcamentos/:id/anexos',
    HISTORICO: '/orcamentos/:id/historico',
    RELATORIOS: '/orcamentos/relatorios',
    IMPORTAR: '/orcamentos/importar',
    EXPORTAR: '/orcamentos/exportar'
  },
  
  // Planos de Tesouraria
  PLANOS: {
    LIST: '/tesouraria/planos',
    CREATE: '/tesouraria/planos',
    GET: '/tesouraria/planos/:id',
    UPDATE: '/tesouraria/planos/:id',
    DELETE: '/tesouraria/planos/:id',
    APPROVE: '/tesouraria/planos/:id/aprovar',
    REJECT: '/tesouraria/planos/:id/rejeitar',
    FLUXO_CAIXA: '/tesouraria/fluxo-caixa',
    CATEGORIAS: '/tesouraria/categorias',
    ITENS: '/tesouraria/planos/:id/itens',
    ITEM: '/tesouraria/planos/:planoId/itens/:itemId',
    ANEXOS: '/tesouraria/planos/:id/anexos',
    HISTORICO: '/tesouraria/planos/:id/historico',
    RELATORIOS: '/tesouraria/relatorios',
    IMPORTAR: '/tesouraria/importar',
    EXPORTAR: '/tesouraria/exportar'
  },
  
  // Aprovação Centralizada
  APROVACAO: {
    PENDENTES: '/aprovacao/pendentes',
    APPROVE: '/aprovacao/:tipo/:id/aprovar',
    REJECT: '/aprovacao/:tipo/:id/rejeitar',
    BATCH_APPROVE: '/aprovacao/aprovar-lote',
    BATCH_REJECT: '/aprovacao/rejeitar-lote',
    STATS: '/aprovacao/estatisticas',
    HISTORICO: '/aprovacao/historico',
    CONFIGURACOES: '/aprovacao/configuracoes',
    WORKFLOW: '/aprovacao/workflow',
    NOTIFICACOES: '/aprovacao/notificacoes',
    HISTORY: '/aprovacao/historico'
  },
  
  // Validação de Contas PGC
  VALIDACAO_CONTAS: {
    LIST: '/validacao-contas/contas',
    GET: '/validacao-contas/contas/:id',
    VALIDATE: '/validacao-contas/contas/:id/validar',
    REJECT: '/validacao-contas/contas/:id/rejeitar',
    STATS: '/validacao-contas/estatisticas',
    EXPORT: '/validacao-contas/exportar'
  },
  
  // Upload e Processamento de Arquivos
  UPLOAD: {
    UPLOAD: '/upload',
    BATCH_UPLOAD: '/upload/lote',
    FILES: '/arquivos',
    FILE: '/arquivos/:id',
    PROCESS: '/processar/:id',
    REPROCESS: '/reprocessar/:id',
    STATUS: '/status/:id',
    DOWNLOAD: '/download/:id',
    CLASSIFICACAO: '/classificacao',
    HISTORICO: '/historico',
    TIPOS_SUPORTADOS: '/tipos-suportados'
  },
  
  // Relatórios
  RELATORIOS: {
    ORCAMENTO: '/relatorios/orcamento',
    TESOURARIA: '/relatorios/tesouraria',
    APROVACOES: '/relatorios/aprovacoes',
    CUSTOMIZADO: '/relatorios/customizado',
    TEMPLATES: '/relatorios/templates',
    GERAR: '/relatorios/gerar',
    AGENDAR: '/relatorios/agendar'
  },
  
  // Configurações
  CONFIGURACOES: {
    GERAL: '/configuracoes/geral',
    USUARIOS: '/configuracoes/usuarios',
    PERFIS: '/configuracoes/perfis',
    PERMISSOES: '/configuracoes/permissoes',
    INTEGRACOES: '/configuracoes/integracoes',
    BACKUP: '/configuracoes/backup',
    LOGS: '/configuracoes/logs'
  }
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
  },
  
  // Validação de telefone
  PHONE: {
    REGEX: /^\(?[1-9]{2}\)? ?(?:[2-8]|9[1-9])[0-9]{3}\-?[0-9]{4}$/
  },
  
  // Validação de CEP
  CEP: {
    REGEX: /^\d{5}-?\d{3}$/
  }
};

/**
 * ========================================
 * CONFIGURAÇÕES DE MENSAGENS
 * ========================================
 */

// Mensagens padrão do sistema
export const MESSAGES = {
  SUCCESS: {
    SAVED: 'Dados salvos com sucesso!',
    UPDATED: 'Dados atualizados com sucesso!',
    DELETED: 'Item excluído com sucesso!',
    APPROVED: 'Item aprovado com sucesso!',
    REJECTED: 'Item rejeitado com sucesso!',
    VALIDATED: 'Conta validada com sucesso!'
  },
  
  ERROR: {
    GENERIC: 'Ocorreu um erro inesperado. Tente novamente.',
    NETWORK: 'Erro de conexão. Verifique sua internet.',
    UNAUTHORIZED: 'Sessão expirada. Faça login novamente.',
    FORBIDDEN: 'Você não tem permissão para esta ação.',
    NOT_FOUND: 'Item não encontrado.',
    VALIDATION: 'Dados inválidos. Verifique os campos.',
    FILE_TOO_LARGE: 'Arquivo muito grande. Máximo 10MB.',
    INVALID_FILE_TYPE: 'Tipo de arquivo não permitido.'
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
 * Exportação padrão
 */
export default {
  API_CONFIG,
  VALIDATION_CONFIG,
  MESSAGES,
  isDevelopment,
  shouldUseMock,
  getApiBaseUrl,
  getTimeout,
  getRetryConfig,
  getMockConfig,
  getCacheConfig,
  getEnvironmentConfig
};

