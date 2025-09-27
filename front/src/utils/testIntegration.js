/**
 * Utilitário de Teste de Integração - EndiAgro FinancePro
 * 
 * Este arquivo fornece funções para testar a integração entre
 * frontend e backend, identificando problemas de comunicação.
 * 
 * @author Antonio Emiliano Barros
 * @version 1.0.0
 */

import { httpService } from '../services/httpService.unified';
import { authService } from '../services/authService.unified';
import { API_CONFIG, API_ENDPOINTS } from '../config/api.config.unified';

/**
 * Testa a conectividade básica com a API
 */
export const testApiConnectivity = async () => {
  console.log('🔍 Testando conectividade com a API...');
  console.log('📍 URL da API:', API_CONFIG.BASE_URL);
  
  try {
    const response = await httpService.checkHealth();
    
    if (response.success) {
      console.log('✅ API está acessível:', response.data);
      return { success: true, data: response.data };
    } else {
      console.error('❌ API não está acessível:', response.error);
      return { success: false, error: response.error };
    }
  } catch (error) {
    console.error('❌ Erro ao testar conectividade:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Testa os endpoints de autenticação
 */
export const testAuthEndpoints = async () => {
  console.log('🔐 Testando endpoints de autenticação...');
  
  const tests = [
    {
      name: 'Health Check',
      endpoint: API_ENDPOINTS.HEALTH,
      method: 'GET',
      includeAuth: false
    },
    {
      name: 'Login (dados inválidos)',
      endpoint: API_ENDPOINTS.AUTH.LOGIN,
      method: 'POST',
      body: { email: 'test@test.com', senha: 'invalid' },
      includeAuth: false,
      expectError: true
    }
  ];
  
  const results = {};
  
  for (const test of tests) {
    try {
      console.log(`🧪 Testando: ${test.name}`);
      
      let response;
      if (test.method === 'GET') {
        response = await httpService.get(test.endpoint, {}, { includeAuth: test.includeAuth });
      } else if (test.method === 'POST') {
        response = await httpService.post(test.endpoint, test.body, { includeAuth: test.includeAuth });
      }
      
      if (test.expectError) {
        // Esperamos um erro para login inválido
        results[test.name] = {
          success: false,
          status: 'Expected error',
          message: 'Login inválido rejeitado corretamente'
        };
      } else {
        results[test.name] = {
          success: true,
          status: 'OK',
          data: response
        };
      }
      
      console.log(`✅ ${test.name}: OK`);
    } catch (error) {
      if (test.expectError) {
        results[test.name] = {
          success: true,
          status: 'Expected error',
          message: 'Erro esperado capturado corretamente',
          error: error.message
        };
        console.log(`✅ ${test.name}: Erro esperado capturado`);
      } else {
        results[test.name] = {
          success: false,
          status: 'Error',
          error: error.message
        };
        console.error(`❌ ${test.name}:`, error.message);
      }
    }
  }
  
  return results;
};

/**
 * Testa os endpoints de orçamentos
 */
export const testOrcamentoEndpoints = async () => {
  console.log('💰 Testando endpoints de orçamentos...');
  
  const tests = [
    {
      name: 'Listar Orçamentos',
      endpoint: API_ENDPOINTS.ORCAMENTOS.LIST,
      method: 'GET'
    },
    {
      name: 'Estatísticas de Orçamentos',
      endpoint: API_ENDPOINTS.ORCAMENTOS.STATS,
      method: 'GET'
    }
  ];
  
  const results = {};
  
  for (const test of tests) {
    try {
      console.log(`🧪 Testando: ${test.name}`);
      
      let response;
      if (test.method === 'GET') {
        response = await httpService.get(test.endpoint);
      }
      
      results[test.name] = {
        success: true,
        status: 'OK',
        data: response
      };
      
      console.log(`✅ ${test.name}: OK`);
    } catch (error) {
      results[test.name] = {
        success: false,
        status: 'Error',
        error: error.message,
        type: error.type
      };
      console.error(`❌ ${test.name}:`, error.message);
    }
  }
  
  return results;
};

/**
 * Testa os endpoints de tesouraria
 */
export const testTesourariaEndpoints = async () => {
  console.log('🏦 Testando endpoints de tesouraria...');
  
  const tests = [
    {
      name: 'Listar Planos',
      endpoint: API_ENDPOINTS.TESOURARIA.PLANOS,
      method: 'GET'
    },
    {
      name: 'Estatísticas de Tesouraria',
      endpoint: API_ENDPOINTS.TESOURARIA.ESTATISTICAS,
      method: 'GET'
    },
    {
      name: 'Atividades Recentes',
      endpoint: API_ENDPOINTS.TESOURARIA.ATIVIDADES,
      method: 'GET'
    }
  ];
  
  const results = {};
  
  for (const test of tests) {
    try {
      console.log(`🧪 Testando: ${test.name}`);
      
      let response;
      if (test.method === 'GET') {
        response = await httpService.get(test.endpoint);
      }
      
      results[test.name] = {
        success: true,
        status: 'OK',
        data: response
      };
      
      console.log(`✅ ${test.name}: OK`);
    } catch (error) {
      results[test.name] = {
        success: false,
        status: 'Error',
        error: error.message,
        type: error.type
      };
      console.error(`❌ ${test.name}:`, error.message);
    }
  }
  
  return results;
};

/**
 * Executa todos os testes de integração
 */
export const runAllTests = async () => {
  console.log('🚀 Iniciando testes de integração completos...');
  
  const results = {
    connectivity: null,
    auth: null,
    orcamentos: null,
    tesouraria: null
  };
  
  try {
    // Teste de conectividade
    console.log('\n📡 Testando conectividade...');
    results.connectivity = await testApiConnectivity();
    
    // Teste de autenticação
    console.log('\n🔐 Testando autenticação...');
    results.auth = await testAuthEndpoints();
    
    // Teste de orçamentos
    console.log('\n💰 Testando orçamentos...');
    results.orcamentos = await testOrcamentoEndpoints();
    
    // Teste de tesouraria
    console.log('\n🏦 Testando tesouraria...');
    results.tesouraria = await testTesourariaEndpoints();
    
    // Resumo dos resultados
    console.log('\n📊 RESUMO DOS TESTES:');
    console.log('====================');
    
    const totalTests = Object.values(results).reduce((acc, category) => {
      if (category && typeof category === 'object') {
        return acc + Object.keys(category).length;
      }
      return acc;
    }, 0);
    
    const successfulTests = Object.values(results).reduce((acc, category) => {
      if (category && typeof category === 'object') {
        return acc + Object.values(category).filter(test => test.success).length;
      }
      return acc;
    }, 0);
    
    console.log(`✅ Testes bem-sucedidos: ${successfulTests}/${totalTests}`);
    console.log(`❌ Testes com falha: ${totalTests - successfulTests}/${totalTests}`);
    
    // Detalhes por categoria
    Object.entries(results).forEach(([category, tests]) => {
      if (tests && typeof tests === 'object') {
        const categorySuccess = Object.values(tests).filter(test => test.success).length;
        const categoryTotal = Object.keys(tests).length;
        console.log(`${category}: ${categorySuccess}/${categoryTotal} testes passaram`);
      }
    });
    
    return results;
  } catch (error) {
    console.error('❌ Erro durante os testes:', error);
    return { error: error.message };
  }
};

/**
 * Gera relatório de problemas encontrados
 */
export const generateProblemReport = (testResults) => {
  const problems = [];
  
  // Verifica conectividade
  if (!testResults.connectivity?.success) {
    problems.push({
      category: 'Conectividade',
      issue: 'API não está acessível',
      solution: 'Verifique se o backend está rodando na porta 3000',
      severity: 'CRITICAL'
    });
  }
  
  // Verifica autenticação
  if (testResults.auth) {
    Object.entries(testResults.auth).forEach(([test, result]) => {
      if (!result.success && result.error) {
        if (result.error.includes('401')) {
          problems.push({
            category: 'Autenticação',
            issue: 'Erro 401 - Não autorizado',
            solution: 'Verifique se o token de autenticação está sendo enviado corretamente',
            severity: 'HIGH'
          });
        } else if (result.error.includes('404')) {
          problems.push({
            category: 'Autenticação',
            issue: 'Endpoint não encontrado',
            solution: 'Verifique se as rotas da API estão corretas',
            severity: 'HIGH'
          });
        }
      }
    });
  }
  
  // Verifica orçamentos
  if (testResults.orcamentos) {
    Object.entries(testResults.orcamentos).forEach(([test, result]) => {
      if (!result.success) {
        problems.push({
          category: 'Orçamentos',
          issue: `Falha no teste: ${test}`,
          solution: 'Verifique se o endpoint está implementado e funcionando',
          severity: 'MEDIUM'
        });
      }
    });
  }
  
  // Verifica tesouraria
  if (testResults.tesouraria) {
    Object.entries(testResults.tesouraria).forEach(([test, result]) => {
      if (!result.success) {
        problems.push({
          category: 'Tesouraria',
          issue: `Falha no teste: ${test}`,
          solution: 'Verifique se o endpoint está implementado e funcionando',
          severity: 'MEDIUM'
        });
      }
    });
  }
  
  return problems;
};

// Exportações para uso em componentes
export default {
  testApiConnectivity,
  testAuthEndpoints,
  testOrcamentoEndpoints,
  testTesourariaEndpoints,
  runAllTests,
  generateProblemReport
};
