/**
 * Teste de Conectividade da API
 * 
 * Este arquivo testa especificamente a conectividade entre frontend e API
 */

// Função para testar a conectividade básica
export const testBasicConnection = async () => {
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
  
  try {
    console.log('🔍 Testando conectividade básica...');
    console.log('📍 URL:', API_URL);
    
    const response = await fetch(`${API_URL}/health`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Conectividade OK:', data);
      return { success: true, data };
    } else {
      console.error('❌ Erro HTTP:', response.status);
      return { success: false, error: `HTTP ${response.status}` };
    }
  } catch (error) {
    console.error('❌ Erro de conectividade:', error);
    return { success: false, error: error.message };
  }
};

// Função para testar CORS
export const testCorsConnection = async () => {
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
  
  try {
    console.log('🔍 Testando CORS...');
    
    const response = await fetch(`${API_URL}/health`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Origin': window.location.origin
      }
    });
    
    const corsHeader = response.headers.get('Access-Control-Allow-Origin');
    console.log('📋 CORS Header:', corsHeader);
    
    if (response.ok) {
      console.log('✅ CORS OK');
      return { success: true, corsHeader };
    } else {
      console.error('❌ Erro CORS:', response.status);
      return { success: false, error: `HTTP ${response.status}` };
    }
  } catch (error) {
    console.error('❌ Erro CORS:', error);
    return { success: false, error: error.message };
  }
};

// Função para testar endpoint de autenticação
export const testAuthEndpoint = async () => {
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
  
  try {
    console.log('🔍 Testando endpoint de autenticação...');
    
    const response = await fetch(`${API_URL}/auth/login`, {
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
    console.log('📊 Resposta auth:', data);
    
    // Esperamos um erro 401 (credenciais inválidas) ou 400 (validação)
    if (response.status === 401 || response.status === 400) {
      console.log('✅ Endpoint de autenticação funcionando');
      return { success: true, message: 'Endpoint funcionando (erro esperado)' };
    } else if (response.ok) {
      console.log('✅ Login realizado com sucesso');
      return { success: true, data };
    } else {
      console.log('⚠️ Resposta inesperada:', response.status);
      return { success: false, error: `HTTP ${response.status}` };
    }
  } catch (error) {
    console.error('❌ Erro auth:', error);
    return { success: false, error: error.message };
  }
};

// Função principal para executar todos os testes
export const runAllTests = async () => {
  console.log('🚀 Iniciando testes de integração...');
  console.log('=====================================');
  
  const results = {
    basic: await testBasicConnection(),
    cors: await testCorsConnection(),
    auth: await testAuthEndpoint()
  };
  
  const allPassed = results.basic.success && results.cors.success && results.auth.success;
  
  console.log('=====================================');
  console.log('📋 Resultados:');
  console.log('🔗 Conectividade:', results.basic.success ? '✅ OK' : '❌ FALHOU');
  console.log('🌐 CORS:', results.cors.success ? '✅ OK' : '❌ FALHOU');
  console.log('🔐 Autenticação:', results.auth.success ? '✅ OK' : '❌ FALHOU');
  console.log('🎯 Status Geral:', allPassed ? '✅ CONECTADO' : '❌ PROBLEMAS');
  
  return { ...results, allPassed };
};
