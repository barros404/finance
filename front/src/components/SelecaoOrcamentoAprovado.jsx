// components/SelecaoOrcamentoAprovado.jsx
import React, { useState, useEffect } from 'react';
import { AlertCircle, FileText, CheckCircle } from 'lucide-react';
import { orcamentoApi } from '../services/api';

const SelecaoOrcamentoAprovado = ({ onOrcamentoSelecionado, onProximo }) => {
  const [orcamentosAprovados, setOrcamentosAprovados] = useState([]);
  const [orcamentoSelecionado, setOrcamentoSelecionado] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    carregarOrcamentosAprovados();
  }, []);

  const carregarOrcamentosAprovados = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      console.log('🔄 Carregando orçamentos aprovados...');
      const response = await orcamentoApi.listarOrcamentos({ 
        status: 'aprovado',
        limite: 50 
      });
      
      console.log('📥 Resposta da API:', response);
      
      if (response.status === 'success' && response.data) {
        setOrcamentosAprovados(response.data.orcamentos || []);
        console.log('✅ Orçamentos aprovados carregados:', response.data.orcamentos?.length || 0);
      } else {
        throw new Error(response.message || 'Erro ao carregar orçamentos');
      }
    } catch (err) {
      console.error('❌ Erro ao carregar orçamentos aprovados:', err);
      setError(err.message || 'Erro ao carregar orçamentos aprovados');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelecionarOrcamento = (orcamento) => {
    setOrcamentoSelecionado(orcamento);
    onOrcamentoSelecionado(orcamento);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        <span className="ml-3">Carregando orçamentos...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-red-600" />
          <p className="text-red-700">{error}</p>
        </div>
      </div>
    );
  }

  if (orcamentosAprovados.length === 0) {
    return (
      <div className="text-center py-12 bg-gray-50 rounded-lg">
        <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Nenhum orçamento aprovado encontrado
        </h3>
        <p className="text-gray-600 mb-4">
          Você precisa ter pelo menos um orçamento aprovado para criar um plano de tesouraria.
        </p>
        <button
          onClick={() => window.location.href = '/orcamentos'}
          className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
        >
          Criar Orçamento
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-blue-900">Pré-requisito</p>
            <p className="text-sm text-blue-700 mt-1">
              Selecione um orçamento aprovado para basear o plano de tesouraria.
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-4">
        {orcamentosAprovados.map((orcamento) => (
          <div
            key={orcamento.id}
            className={`border rounded-lg p-4 cursor-pointer transition-all ${
              orcamentoSelecionado?.id === orcamento.id
                ? 'border-indigo-600 bg-indigo-50'
                : 'border-gray-200 hover:border-indigo-300'
            }`}
            onClick={() => handleSelecionarOrcamento(orcamento)}
          >
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <h4 className="font-semibold text-gray-900">{orcamento.nome}</h4>
                <p className="text-sm text-gray-600">{orcamento.descricao}</p>
                <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                  <span>Ano: {orcamento.ano}</span>
                  <span>Status: Aprovado</span>
                  <span>
                    Criado em: {new Date(orcamento.createdAt).toLocaleDateString('pt-AO')}
                  </span>
                </div>
              </div>
              {orcamentoSelecionado?.id === orcamento.id && (
                <CheckCircle className="w-6 h-6 text-indigo-600" />
              )}
            </div>
          </div>
        ))}
      </div>

      {orcamentoSelecionado && (
        <div className="flex justify-end">
          <button
            onClick={onProximo}
            className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
          >
            Próximo
          </button>
        </div>
      )}
    </div>
  );
};

export default SelecaoOrcamentoAprovado;