/**
 * Teste de Integração da API
 * 
 * Este arquivo testa a comunicação entre o frontend e a API
 */

import { API_CONFIG } from '../config/apiConfig';

/**
 * Testa a conectividade com a API
 */
export const testApiConnection = async () => {
  try {
    console.log('🔍 Testando conexão com a API...');
    console.log('📍 URL da API:', API_CONFIG.API_BASE_URL);
    
    const response = await fetch(`${API_CONFIG.API_BASE_URL}/health`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ API conectada com sucesso!');
      console.log('📊 Resposta:', data);
      return { success: true, data };
    } else {
      console.error('❌ Erro na conexão com a API:', response.status);
      return { success: false, error: `HTTP ${response.status}` };
    }
  } catch (error) {
    console.error('❌ Erro ao conectar com a API:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Testa o endpoint de autenticação
 */
export const testAuthEndpoint = async () => {
  try {
    console.log('🔐 Testando endpoint de autenticação...');
    
    const response = await fetch(`${API_CONFIG.API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        email: 'test@test.com',
        senha: 'test123'
      })
    });
    
    const data = await response.json();
    console.log('📊 Resposta do login:', data);
    
    if (response.status === 401) {
      console.log('✅ Endpoint de autenticação funcionando (credenciais inválidas esperado)');
      return { success: true, message: 'Endpoint funcionando' };
    } else if (response.ok) {
      console.log('✅ Login realizado com sucesso!');
      return { success: true, data };
    } else {
      console.log('⚠️ Resposta inesperada:', response.status);
      return { success: false, error: `HTTP ${response.status}` };
    }
  } catch (error) {
    console.error('❌ Erro ao testar autenticação:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Executa todos os testes de integração
 */
export const runIntegrationTests = async () => {
  console.log('🚀 Iniciando testes de integração...');
  console.log('=====================================');
  
  // Teste 1: Conectividade básica
  const connectionTest = await testApiConnection();
  
  // Teste 2: Endpoint de autenticação
  const authTest = await testAuthEndpoint();
  
  console.log('=====================================');
  console.log('📋 Resultados dos testes:');
  console.log('🔗 Conectividade:', connectionTest.success ? '✅ OK' : '❌ FALHOU');
  console.log('🔐 Autenticação:', authTest.success ? '✅ OK' : '❌ FALHOU');
  
  return {
    connection: connectionTest,
    auth: authTest,
    allPassed: connectionTest.success && authTest.success
  };
};

// Executar testes automaticamente se este arquivo for importado
if (typeof window !== 'undefined') {
  // Executar testes no navegador
  runIntegrationTests();
}
