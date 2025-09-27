/**
 * Configuração de Integração da API
 * 
 * Este arquivo garante que o frontend esteja corretamente integrado com a API
 */

// Configurações de integração
export const INTEGRATION_CONFIG = {
  // URL da API
  API_BASE_URL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  
  // Configurações de timeout
  TIMEOUT: 30000,
  
  // Configurações de retry
  MAX_RETRIES: 3,
  RETRY_DELAY: 1000,
  
  // Headers padrão
  DEFAULT_HEADERS: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  },
  
  // Configurações de CORS
  CORS: {
    enabled: true,
    credentials: 'include'
  }
};

/**
 * Verifica se a integração está funcionando
 */
export const checkIntegration = async () => {
  try {
    console.log('🔍 Verificando integração...');
    console.log('📍 API URL:', INTEGRATION_CONFIG.API_BASE_URL);
    
    const response = await fetch(`${INTEGRATION_CONFIG.API_BASE_URL}/health`, {
      method: 'GET',
      headers: INTEGRATION_CONFIG.DEFAULT_HEADERS
    });
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Integração funcionando:', data);
      return { success: true, data };
    } else {
      console.error('❌ Erro na integração:', response.status);
      return { success: false, error: `HTTP ${response.status}` };
    }
  } catch (error) {
    console.error('❌ Erro de integração:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Testa a conectividade com diferentes endpoints
 */
export const testEndpoints = async () => {
  const endpoints = [
    { name: 'Health Check', url: '/health' },
    { name: 'Auth Login', url: '/auth/login', method: 'POST', body: { email: 'test@test.com', senha: 'test123' } }
  ];
  
  const results = {};
  
  for (const endpoint of endpoints) {
    try {
      const config = {
        method: endpoint.method || 'GET',
        headers: INTEGRATION_CONFIG.DEFAULT_HEADERS
      };
      
      if (endpoint.body) {
        config.body = JSON.stringify(endpoint.body);
      }
      
      const response = await fetch(`${INTEGRATION_CONFIG.API_BASE_URL}${endpoint.url}`, config);
      const data = await response.json();
      
      results[endpoint.name] = {
        success: response.ok || response.status === 401 || response.status === 400,
        status: response.status,
        data: data
      };
      
      console.log(`✅ ${endpoint.name}:`, response.status);
    } catch (error) {
      results[endpoint.name] = {
        success: false,
        error: error.message
      };
      console.error(`❌ ${endpoint.name}:`, error.message);
    }
  }
  
  return results;
};

/**
 * Configuração de interceptadores para requisições
 */
export const setupRequestInterceptors = () => {
  // Interceptar requisições fetch para adicionar logs
  const originalFetch = window.fetch;
  
  window.fetch = async (url, options = {}) => {
    console.log(`📤 ${options.method || 'GET'} ${url}`);
    
    try {
      const response = await originalFetch(url, options);
      console.log(`📥 ${response.status} ${url}`);
      return response;
    } catch (error) {
      console.error(`❌ Erro na requisição ${url}:`, error);
      throw error;
    }
  };
};

/**
 * Inicializa a integração
 */
export const initializeIntegration = async () => {
  console.log('🚀 Inicializando integração com a API...');
  
  // Configurar interceptadores
  setupRequestInterceptors();
  
  // Verificar integração
  const integrationCheck = await checkIntegration();
  
  if (integrationCheck.success) {
    console.log('✅ Integração inicializada com sucesso!');
    return true;
  } else {
    console.error('❌ Falha na inicialização da integração:', integrationCheck.error);
    return false;
  }
};

export default {
  INTEGRATION_CONFIG,
  checkIntegration,
  testEndpoints,
  setupRequestInterceptors,
  initializeIntegration
};
