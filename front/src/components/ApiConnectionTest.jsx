import React, { useState, useEffect } from 'react';
import { runAllTests } from '../utils/connectionTest';
import { API_CONFIG } from '../config/apiConfig';

const ApiConnectionTest = () => {
  const [testResults, setTestResults] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  const runTests = async () => {
    setIsLoading(true);
    try {
      const results = await runAllTests();
      setTestResults(results);
    } catch (error) {
      console.error('Erro ao executar testes:', error);
      setTestResults({
        basic: { success: false, error: error.message },
        cors: { success: false, error: error.message },
        auth: { success: false, error: error.message },
        allPassed: false
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Executar testes automaticamente quando o componente é montado
    runTests();
  }, []);

  if (!isVisible) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <button
          onClick={() => setIsVisible(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg shadow-lg hover:bg-blue-700 transition-colors"
        >
          🔗 Testar API
        </button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 bg-white border border-gray-300 rounded-lg shadow-lg p-4 max-w-md">
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-lg font-semibold text-gray-800">🔗 Teste de API</h3>
        <button
          onClick={() => setIsVisible(false)}
          className="text-gray-500 hover:text-gray-700"
        >
          ✕
        </button>
      </div>
      
      <div className="mb-3">
        <p className="text-sm text-gray-600">
          <strong>URL da API:</strong> {API_CONFIG.API_BASE_URL}
        </p>
      </div>

      {isLoading && (
        <div className="flex items-center justify-center py-4">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
          <span className="ml-2 text-gray-600">Testando conexão...</span>
        </div>
      )}

      {testResults && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Conectividade:</span>
            <span className={`text-sm ${testResults.basic.success ? 'text-green-600' : 'text-red-600'}`}>
              {testResults.basic.success ? '✅ OK' : '❌ FALHOU'}
            </span>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">CORS:</span>
            <span className={`text-sm ${testResults.cors.success ? 'text-green-600' : 'text-red-600'}`}>
              {testResults.cors.success ? '✅ OK' : '❌ FALHOU'}
            </span>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Autenticação:</span>
            <span className={`text-sm ${testResults.auth.success ? 'text-green-600' : 'text-red-600'}`}>
              {testResults.auth.success ? '✅ OK' : '❌ FALHOU'}
            </span>
          </div>

          {testResults.basic.error && (
            <div className="text-xs text-red-600 bg-red-50 p-2 rounded">
              <strong>Erro de conexão:</strong> {testResults.basic.error}
            </div>
          )}

          {testResults.cors.error && (
            <div className="text-xs text-red-600 bg-red-50 p-2 rounded">
              <strong>Erro CORS:</strong> {testResults.cors.error}
            </div>
          )}

          {testResults.auth.error && (
            <div className="text-xs text-red-600 bg-red-50 p-2 rounded">
              <strong>Erro de autenticação:</strong> {testResults.auth.error}
            </div>
          )}

          <div className="mt-3 pt-2 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Status Geral:</span>
              <span className={`text-sm font-bold ${testResults.allPassed ? 'text-green-600' : 'text-red-600'}`}>
                {testResults.allPassed ? '✅ CONECTADO' : '❌ PROBLEMAS'}
              </span>
            </div>
          </div>

          <button
            onClick={runTests}
            disabled={isLoading}
            className="w-full mt-3 bg-blue-600 text-white px-3 py-2 rounded text-sm hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            {isLoading ? 'Testando...' : '🔄 Testar Novamente'}
          </button>
        </div>
      )}
    </div>
  );
};

export default ApiConnectionTest;
