/**
 * Configurações da API - EndiAgro FinancePro
 * 
 * Este arquivo centraliza todas as configurações da API,
 * incluindo constantes, validações e configurações de ambiente.
 * 
 * @author EndiAgro Development Team
 * @version 1.0.0
 */

// Configurações de ambiente
const config = {
  // Configurações da API
  api: {
    name: 'EndiAgro FinancePro API',
    version: '1.0.0',
    description: 'API para sistema de gestão financeira e orçamentos',
    baseUrl: process.env.API_BASE_URL || 'http://localhost:3001',
    port: process.env.PORT || 3001,
    environment: process.env.NODE_ENV || 'development'
  },

  // Configurações de banco de dados
  database: {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    name: process.env.DB_NAME || 'endiagro_financepro',
    username: process.env.DB_USERNAME || 'postgres',
    password: process.env.DB_PASSWORD || 'password',
    dialect: 'postgres',
    logging: process.env.NODE_ENV === 'development' ? console.log : false,
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    }
  },

  // Configurações de autenticação
  auth: {
    jwtSecret: process.env.JWT_SECRET || 'endiagro-financepro-secret-key-2024',
    jwtExpiresIn: process.env.JWT_EXPIRES_IN || '24h',
    refreshTokenExpiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN || '7d',
    bcryptRounds: parseInt(process.env.BCRYPT_ROUNDS) || 12
  },

  // Configurações de upload
  upload: {
    maxFileSize: 10 * 1024 * 1024, // 10MB
    allowedMimeTypes: [
      'application/pdf',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'text/csv'
    ],
    uploadPath: process.env.UPLOAD_PATH || './uploads'
  },

  // Configurações de paginação
  pagination: {
    defaultLimit: 10,
    maxLimit: 100,
    defaultPage: 1
  },

  // Configurações de cache
  cache: {
    ttl: 300, // 5 minutos
    maxKeys: 1000
  },

  // Configurações de email (para notificações)
  email: {
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: process.env.EMAIL_PORT || 587,
    secure: process.env.EMAIL_SECURE === 'true',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  },

  // Configurações de logging
  logging: {
    level: process.env.LOG_LEVEL || 'info',
    format: process.env.LOG_FORMAT || 'combined',
    file: {
      enabled: process.env.LOG_FILE_ENABLED === 'true',
      path: process.env.LOG_FILE_PATH || './logs/app.log',
      maxSize: process.env.LOG_FILE_MAX_SIZE || '10m',
      maxFiles: process.env.LOG_FILE_MAX_FILES || '5'
    }
  }
};

// Constantes do sistema
const constants = {
  // Status de orçamento
  BUDGET_STATUS: {
    DRAFT: 'rascunho',
    PENDING: 'pendente',
    APPROVED: 'aprovado',
    REJECTED: 'rejeitado',
    ACTIVE: 'ativo',
    COMPLETED: 'concluido',
    ARCHIVED: 'arquivado'
  },

  // Status de tesouraria
  TREASURY_STATUS: {
    DRAFT: 'rascunho',
    PENDING: 'pendente',
    APPROVED: 'aprovado',
    REJECTED: 'rejeitado',
    ACTIVE: 'ativo',
    COMPLETED: 'concluido'
  },

  // Tipos de custo
  COST_TYPES: {
    MATERIAL: 'material',
    SERVICE: 'servico',
    PERSONNEL: 'pessoal',
    FIXED: 'fixo',
    VARIABLE: 'variavel'
  },

  // Tipos de receita
  REVENUE_TYPES: {
    SALE: 'venda',
    SERVICE: 'servico',
    INVESTMENT: 'investimento',
    OTHER: 'outro'
  },

  // Tipos de ativo
  ASSET_TYPES: {
    EQUIPMENT: 'equipamento',
    PROPERTY: 'imovel',
    VEHICLE: 'veiculo',
    OTHER: 'outro'
  },

  // Moedas suportadas
  CURRENCIES: {
    AOA: 'AOA', // Kwanza Angolano
    USD: 'USD', // Dólar Americano
    EUR: 'EUR', // Euro
    BRL: 'BRL'  // Real Brasileiro
  },

  // Frequências
  FREQUENCIES: {
    DAILY: 'diario',
    WEEKLY: 'semanal',
    MONTHLY: 'mensal',
    QUARTERLY: 'trimestral',
    YEARLY: 'anual',
    ONE_TIME: 'unico'
  },

  // Prioridades
  PRIORITIES: {
    LOW: 1,
    MEDIUM: 2,
    HIGH: 3,
    CRITICAL: 4
  },

  // Códigos PGC-AO (exemplos)
  PGC_CODES: {
    REVENUES: {
      '711': 'Vendas de Mercadorias',
      '712': 'Vendas de Produtos Acabados',
      '714': 'Vendas de Produtos Agrícolas',
      '715': 'Vendas de Produtos Pecuários',
      '72': 'Prestação de Serviços',
      '78': 'Proveitos Financeiros',
      '79': 'Proveitos Extraordinários'
    },
    COSTS: {
      '611': 'Matérias-Primas',
      '612': 'Materiais Diversos',
      '613': 'Combustíveis e Lubrificantes',
      '621': 'Subcontratos',
      '622': 'Serviços Especializados',
      '624': 'Energia e Fluidos',
      '625': 'Deslocações, Estadas e Transportes',
      '632': 'Remunerações do Pessoal',
      '635': 'Encargos sobre Remunerações',
      '641': 'Amortizações do Exercício'
    }
  }
};

// Mensagens de erro padronizadas
const errorMessages = {
  // Erros de autenticação
  AUTH: {
    UNAUTHORIZED: 'Token de acesso inválido ou expirado',
    FORBIDDEN: 'Acesso negado. Permissões insuficientes',
    INVALID_CREDENTIALS: 'Credenciais inválidas',
    TOKEN_EXPIRED: 'Token expirado',
    USER_NOT_FOUND: 'Usuário não encontrado'
  },

  // Erros de validação
  VALIDATION: {
    REQUIRED_FIELD: 'Campo obrigatório não informado',
    INVALID_FORMAT: 'Formato inválido',
    INVALID_VALUE: 'Valor inválido',
    MIN_LENGTH: 'Valor muito curto',
    MAX_LENGTH: 'Valor muito longo',
    INVALID_EMAIL: 'Email inválido',
    INVALID_DATE: 'Data inválida',
    INVALID_NUMBER: 'Número inválido'
  },

  // Erros de recursos
  RESOURCE: {
    NOT_FOUND: 'Recurso não encontrado',
    ALREADY_EXISTS: 'Recurso já existe',
    CONFLICT: 'Conflito de dados',
    DELETED: 'Recurso já foi excluído',
    INACTIVE: 'Recurso inativo'
  },

  // Erros de banco de dados
  DATABASE: {
    CONNECTION_ERROR: 'Erro de conexão com o banco de dados',
    QUERY_ERROR: 'Erro na consulta ao banco de dados',
    CONSTRAINT_ERROR: 'Violação de restrição do banco de dados',
    TRANSACTION_ERROR: 'Erro na transação do banco de dados'
  },

  // Erros de sistema
  SYSTEM: {
    INTERNAL_ERROR: 'Erro interno do servidor',
    SERVICE_UNAVAILABLE: 'Serviço temporariamente indisponível',
    TIMEOUT: 'Tempo limite excedido',
    RATE_LIMIT: 'Limite de requisições excedido'
  }
};

// Mensagens de sucesso padronizadas
const successMessages = {
  CREATED: 'Recurso criado com sucesso',
  UPDATED: 'Recurso atualizado com sucesso',
  DELETED: 'Recurso excluído com sucesso',
  RETRIEVED: 'Recurso recuperado com sucesso',
  LOGIN_SUCCESS: 'Login realizado com sucesso',
  LOGOUT_SUCCESS: 'Logout realizado com sucesso',
  PASSWORD_RESET: 'Senha redefinida com sucesso',
  EMAIL_SENT: 'Email enviado com sucesso'
};

// Configurações de validação
const validation = {
  // Validações de usuário
  user: {
    name: {
      minLength: 2,
      maxLength: 100
    },
    email: {
      pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    },
    password: {
      minLength: 8,
      maxLength: 128,
      pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/
    }
  },

  // Validações de orçamento
  budget: {
    name: {
      minLength: 3,
      maxLength: 200
    },
    description: {
      maxLength: 1000
    },
    amount: {
      min: 0,
      max: 999999999.99
    }
  },

  // Validações de tesouraria
  treasury: {
    description: {
      maxLength: 500
    },
    amount: {
      min: 0.01,
      max: 999999999.99
    }
  }
};

module.exports = {
  config,
  constants,
  errorMessages,
  successMessages,
  validation
};
