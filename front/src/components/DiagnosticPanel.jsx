/**
 * Painel de Diagnóstico - EndiAgro FinancePro
 * 
 * Este componente fornece uma interface para testar e diagnosticar
 * problemas de integração entre frontend e backend.
 * 
 * @author Antonio Emiliano Barros
 * @version 1.0.0
 */

import React, { useState, useEffect } from 'react';
import { 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  RefreshCw, 
  Wifi, 
  Shield, 
  Database,
  Settings
} from 'lucide-react';
import { runAllTests, generateProblemReport } from '../utils/testIntegration';
import { API_CONFIG } from '../config/api.config.unified';

const DiagnosticPanel = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [testResults, setTestResults] = useState(null);
  const [problems, setProblems] = useState([]);
  const [lastRun, setLastRun] = useState(null);

  // Executa todos os testes
  const runDiagnostics = async () => {
    setIsRunning(true);
    setTestResults(null);
    setProblems([]);
    
    try {
      console.log('🚀 Iniciando diagnóstico...');
      const results = await runAllTests();
      setTestResults(results);
      
      const problemList = generateProblemReport(results);
      setProblems(problemList);
      
      setLastRun(new Date());
      console.log('✅ Diagnóstico concluído');
    } catch (error) {
      console.error('❌ Erro durante diagnóstico:', error);
    } finally {
      setIsRunning(false);
    }
  };

  // Executa diagnóstico automaticamente ao carregar
  useEffect(() => {
    runDiagnostics();
  }, []);

  // Função para obter ícone baseado no status
  const getStatusIcon = (success) => {
    if (success === true) return <CheckCircle className="w-5 h-5 text-green-500" />;
    if (success === false) return <XCircle className="w-5 h-5 text-red-500" />;
    return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
  };

  // Função para obter cor baseada na severidade
  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'CRITICAL': return 'text-red-600 bg-red-50 border-red-200';
      case 'HIGH': return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'MEDIUM': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'LOW': return 'text-blue-600 bg-blue-50 border-blue-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Cabeçalho */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <Settings className="w-6 h-6" />
              Diagnóstico de Integração
            </h1>
            <p className="text-gray-600 mt-1">
              Teste a comunicação entre frontend e backend
            </p>
          </div>
          <button
            onClick={runDiagnostics}
            disabled={isRunning}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <RefreshCw className={`w-4 h-4 ${isRunning ? 'animate-spin' : ''}`} />
            {isRunning ? 'Executando...' : 'Executar Testes'}
          </button>
        </div>
        
        {lastRun && (
          <div className="mt-4 text-sm text-gray-500">
            Última execução: {lastRun.toLocaleString()}
          </div>
        )}
      </div>

      {/* Informações da API */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Wifi className="w-5 h-5" />
          Configuração da API
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-gray-700">URL Base</label>
            <p className="text-sm text-gray-900 font-mono bg-gray-50 p-2 rounded">
              {API_CONFIG.BASE_URL}
            </p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">Timeout</label>
            <p className="text-sm text-gray-900">
              {API_CONFIG.TIMEOUT}ms
            </p>
          </div>
        </div>
      </div>

      {/* Resultados dos Testes */}
      {testResults && (
        <div className="space-y-6">
          {/* Conectividade */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Wifi className="w-5 h-5" />
              Conectividade
            </h2>
            <div className="flex items-center gap-3">
              {getStatusIcon(testResults.connectivity?.success)}
              <span className="text-sm text-gray-700">
                {testResults.connectivity?.success 
                  ? 'API está acessível' 
                  : 'API não está acessível'
                }
              </span>
            </div>
            {testResults.connectivity?.error && (
              <p className="text-sm text-red-600 mt-2">
                Erro: {testResults.connectivity.error}
              </p>
            )}
          </div>

          {/* Autenticação */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Shield className="w-5 h-5" />
              Autenticação
            </h2>
            {testResults.auth && (
              <div className="space-y-2">
                {Object.entries(testResults.auth).map(([test, result]) => (
                  <div key={test} className="flex items-center gap-3">
                    {getStatusIcon(result.success)}
                    <span className="text-sm text-gray-700">{test}</span>
                    {result.error && (
                      <span className="text-xs text-red-600">({result.error})</span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Orçamentos */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Database className="w-5 h-5" />
              Orçamentos
            </h2>
            {testResults.orcamentos && (
              <div className="space-y-2">
                {Object.entries(testResults.orcamentos).map(([test, result]) => (
                  <div key={test} className="flex items-center gap-3">
                    {getStatusIcon(result.success)}
                    <span className="text-sm text-gray-700">{test}</span>
                    {result.error && (
                      <span className="text-xs text-red-600">({result.error})</span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Tesouraria */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Database className="w-5 h-5" />
              Tesouraria
            </h2>
            {testResults.tesouraria && (
              <div className="space-y-2">
                {Object.entries(testResults.tesouraria).map(([test, result]) => (
                  <div key={test} className="flex items-center gap-3">
                    {getStatusIcon(result.success)}
                    <span className="text-sm text-gray-700">{test}</span>
                    {result.error && (
                      <span className="text-xs text-red-600">({result.error})</span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Problemas Identificados */}
      {problems.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5" />
            Problemas Identificados
          </h2>
          <div className="space-y-3">
            {problems.map((problem, index) => (
              <div 
                key={index}
                className={`p-4 rounded-lg border ${getSeverityColor(problem.severity)}`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium">{problem.category}</span>
                      <span className={`text-xs px-2 py-1 rounded ${getSeverityColor(problem.severity)}`}>
                        {problem.severity}
                      </span>
                    </div>
                    <p className="text-sm mb-2">{problem.issue}</p>
                    <p className="text-xs text-gray-600">
                      <strong>Solução:</strong> {problem.solution}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Resumo */}
      {testResults && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Resumo dos Testes
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                {Object.values(testResults).reduce((acc, category) => {
                  if (category && typeof category === 'object') {
                    return acc + Object.values(category).filter(test => test.success).length;
                  }
                  return acc;
                }, 0)}
              </div>
              <div className="text-sm text-green-700">Testes Passaram</div>
            </div>
            <div className="text-center p-4 bg-red-50 rounded-lg">
              <div className="text-2xl font-bold text-red-600">
                {Object.values(testResults).reduce((acc, category) => {
                  if (category && typeof category === 'object') {
                    return acc + Object.values(category).filter(test => !test.success).length;
                  }
                  return acc;
                }, 0)}
              </div>
              <div className="text-sm text-red-700">Testes Falharam</div>
            </div>
            <div className="text-center p-4 bg-yellow-50 rounded-lg">
              <div className="text-2xl font-bold text-yellow-600">
                {problems.length}
              </div>
              <div className="text-sm text-yellow-700">Problemas Encontrados</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DiagnosticPanel;
