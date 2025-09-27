import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Trash2, Save, AlertCircle, ChevronRight, DollarSign, FileText, CheckCircle, TrendingUp, TrendingDown } from 'lucide-react';
import { tesourariaApi, orcamentoApi } from '../services/api';
import SelecaoOrcamentoAprovado from '../components/SelecaoOrcamentoAprovado';
import { formatCurrencyAOA as formatCurrency } from '../utils/format';
import { pgcMapping } from '../utils/pgc';
import Layout from '../components/Layout';

const FormularioPlanoTesouraria = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [orcamentoSelecionado, setOrcamentoSelecionado] = useState(null);
  const [dadosOrcamento, setDadosOrcamento] = useState(null);

  const [formData, setFormData] = useState({
    metadata: {
      month: new Date().getMonth() + 1,
      year: new Date().getFullYear(),
      company: '',
      preparedBy: '',
      approvedBy: '',
      budgetReference: '',
      orcamentoId: null
    },
    initialBalance: 0,
    inflows: [],
    outflows: [],
    financing: {
      necessidade: 0,
      endiama: 0,
      bank: 0,
      other: 0
    }
  });

  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    { id: 0, title: 'Selecionar Orçamento', icon: '📋' },
    { id: 1, title: 'Informações Básicas', icon: '📝' },
    { id: 2, title: 'Saldo Inicial', icon: '💰' },
    { id: 3, title: 'Entradas', icon: '📈' },
    { id: 4, title: 'Saídas', icon: '📉' },
    { id: 5, title: 'Financiamento', icon: '🏦' },
    { id: 6, title: 'Revisão', icon: '✅' }
  ];

  // Carregar dados do orçamento selecionado
  useEffect(() => {
    if (orcamentoSelecionado) {
      carregarDadosOrcamento(orcamentoSelecionado.id);
    }
  }, [orcamentoSelecionado]);

  const carregarDadosOrcamento = async (orcamentoId) => {
    try {
      const response = await orcamentoApi.obterOrcamento(orcamentoId);
      if (response.status === 'success') {
        setDadosOrcamento(response.data);
        
        // Preencher automaticamente os dados do formulário
        setFormData(prev => ({
          ...prev,
          metadata: {
            ...prev.metadata,
            company: response.data.empresa?.nome || '',
            budgetReference: response.data.referencia || `ORC/${response.data.ano}/${response.data.id}`,
            orcamentoId: response.data.id
          }
        }));
      }
    } catch (err) {
      setError('Erro ao carregar dados do orçamento');
      console.error('Erro:', err);
    }
  };

  // Calcular totais
  const calculateTotals = () => {
    const totalInflows = formData.inflows.reduce((sum, inf) => sum + (parseFloat(inf.amount) || 0), 0);
    const totalOutflows = formData.outflows.reduce((sum, out) => sum + (parseFloat(out.amount) || 0), 0);
    const totalFinancing = parseFloat(formData.financing.endiama || 0) +
                         parseFloat(formData.financing.bank || 0) +
                         parseFloat(formData.financing.other || 0);

    const netFlow = totalInflows + totalFinancing - totalOutflows;
    const finalBalance = parseFloat(formData.initialBalance || 0) + netFlow;
    
    // Calcular necessidade de financiamento
    const necessidade = Math.max(0, totalOutflows - (totalInflows + parseFloat(formData.initialBalance || 0)));

    return {
      totalInflows,
      totalOutflows,
      totalFinancing,
      netFlow,
      finalBalance,
      necessidadeFinanciamento: necessidade
    };
  };

  // Importar dados do orçamento
  const importarDadosOrcamento = () => {
    if (!dadosOrcamento) return;

    const { receitas, custos } = dadosOrcamento;
    const mes = formData.metadata.month;

    // Converter receitas
    const entradas = receitas?.map(receita => ({
      id: Date.now() + Math.random(),
      pgcCode: receita.contaPgc,
      pgcName: receita.nomeContaPgc,
      description: receita.descricao,
      amount: calcularValorMensal(receita.valor, receita.periodicidade, mes),
      expectedDate: new Date(formData.metadata.year, mes - 1, 15).toISOString().split('T')[0],
      probability: 90,
      source: 'Orçamento',
      fromBudget: true
    })) || [];

    // Converter custos
    const saidas = custos?.map(custo => ({
      id: Date.now() + Math.random(),
      pgcCode: custo.contaPgc,
      pgcName: custo.nomeContaPgc,
      description: custo.descricao,
      amount: calcularValorMensal(custo.valor, custo.periodicidade, mes),
      scheduledDate: new Date(formData.metadata.year, mes - 1, 10).toISOString().split('T')[0],
      priority: determinarPrioridade(custo.contaPgc),
      supplier: 'Diversos',
      fromBudget: true
    })) || [];

    setFormData(prev => ({
      ...prev,
      inflows: entradas,
      outflows: saidas,
      importedFromBudget: true,
    }));
  };

  const calcularValorMensal = (valorAnual, periodicidade, mes) => {
    if (periodicidade === 'mensal') {
      return parseFloat(valorAnual) || 0;
    }
    
    // Para anual, dividir por 12
    return (parseFloat(valorAnual) || 0) / 12;
  };

  const determinarPrioridade = (contaPgc = '') => {
    // Lógica para determinar prioridade baseada no PGC
    if (contaPgc.startsWith('63')) return 1; // Custos com pessoal
    if (contaPgc.startsWith('62')) return 2; // Serviços externos
    return 3; // Demais custos
  };

  const handleFinalizar = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const totals = calculateTotals();
      
      const dadosPlano = {
        nome: `Plano Tesouraria ${formData.metadata.month}/${formData.metadata.year}`,
        descricao: `Baseado no orçamento ${formData.metadata.budgetReference}`,
        ano: formData.metadata.year,
        mes: formData.metadata.month,
        saldoInicial: formData.initialBalance,
        orcamentoId: formData.metadata.orcamentoId,
        necessidadeFinanciamento: totals.necessidadeFinanciamento,
        entradas: formData.inflows,
        saidas: formData.outflows,
        financiamentos: Object.entries(formData.financing)
          .filter(([key, value]) => key !== 'necessidade' && parseFloat(value) > 0)
          .map(([tipo, valor]) => ({
            tipo: tipo === 'endiama' ? 'suprimento' : tipo,
            valor: parseFloat(valor),
            descricao: `Financiamento ${tipo}`
          }))
      };

      const response = await tesourariaApi.criarPlano(dadosPlano);

      if (response.status === 'success') {
        navigate('/dashboard-tesouraria', {
          state: {
            message: 'Plano de tesouraria criado com sucesso!',
            type: 'success'
          }
        });
      }
    } catch (err) {
      setError(err.message || 'Erro ao criar plano de tesouraria');
    } finally {
      setIsLoading(false);
    }
  };

  // ===== Helpers e mapeamentos (via utils) =====
  const addInflow = () => setFormData(prev => ({
    ...prev,
    inflows: [...prev.inflows, {
      id: Date.now() + Math.random(),
      pgcCode: Object.keys(pgcMapping.revenues)[0] || '',
      pgcName: '',
      description: '',
      amount: 0,
      expectedDate: '',
      probability: 100,
      source: '',
      fromBudget: false,
    }],
  }));
  const updateInflow = (id, field, value) => setFormData(prev => ({
    ...prev,
    inflows: prev.inflows.map(i => {
      if (i.id !== id) return i;
      const next = { ...i, [field]: value };
      if (field === 'pgcCode') next.pgcName = pgcMapping.revenues[value]?.name || '';
      if (field === 'amount') next.amount = parseFloat(value) || 0;
      if (field === 'probability') next.probability = parseInt(value) || 0;
      return next;
    }),
  }));
  const removeInflow = (id) => setFormData(prev => ({
    ...prev,
    inflows: prev.inflows.filter(i => i.id !== id),
  }));
  const addOutflow = () => setFormData(prev => ({
    ...prev,
    outflows: [...prev.outflows, {
      id: Date.now() + Math.random(),
      pgcCode: Object.keys(pgcMapping.costs)[0] || '',
      pgcName: '',
      description: '',
      amount: 0,
      scheduledDate: '',
      priority: 3,
      supplier: '',
      fromBudget: false,
    }],
  }));
  const updateOutflow = (id, field, value) => setFormData(prev => ({
    ...prev,
    outflows: prev.outflows.map(o => {
      if (o.id !== id) return o;
      const next = { ...o, [field]: value };
      if (field === 'pgcCode') next.pgcName = pgcMapping.costs[value]?.name || '';
      if (field === 'amount') next.amount = parseFloat(value) || 0;
      if (field === 'priority') next.priority = parseInt(value) || 0;
      return next;
    }),
  }));
  const removeOutflow = (id) => setFormData(prev => ({
    ...prev,
    outflows: prev.outflows.filter(o => o.id !== id),
  }));

  const handleNextStep = () => {
    setCurrentStep(Math.min(steps.length - 1, currentStep + 1));
  };

  const handlePrevStep = () => {
    setCurrentStep(Math.max(0, currentStep - 1));
  };

  const handleVoltar = () => {
    navigate(-1);
  };

  const renderStepContent = () => {
    const totals = calculateTotals();

    switch (currentStep) {
      case 0:
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-800">Selecionar Orçamento Aprovado</h3>
            <SelecaoOrcamentoAprovado
              onOrcamentoSelecionado={setOrcamentoSelecionado}
              onProximo={() => setCurrentStep(1)}
            />
          </div>
        );

      case 1:
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-800">Informações Básicas</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Mês</label>
                <select
                  value={formData.metadata.month}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    metadata: { ...prev.metadata, month: parseInt(e.target.value) }
                  }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                >
                  {[...Array(12)].map((_, i) => (
                    <option key={i + 1} value={i + 1}>
                      {new Date(2024, i).toLocaleString('pt-AO', { month: 'long' })}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Ano</label>
                <input
                  type="number"
                  value={formData.metadata.year}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    metadata: { ...prev.metadata, year: parseInt(e.target.value) }
                  }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>
            </div>

            {orcamentoSelecionado && (
              <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <span className="text-green-800">Orçamento selecionado: {orcamentoSelecionado.nome}</span>
                </div>
              </div>
            )}
          </div>
        );

      case 2: // Saldo Inicial
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-800">Saldo Inicial de Tesouraria</h3>
            
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-blue-900">Informação Importante</p>
                  <p className="text-sm text-blue-700 mt-1">
                    O saldo inicial deve refletir o valor disponível em caixa e bancos no primeiro dia do mês.
                  </p>
                </div>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Saldo Inicial (Kz)
              </label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="number"
                  className="w-full pl-10 pr-4 py-3 text-lg border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="0,00"
                  value={formData.initialBalance}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    initialBalance: parseFloat(e.target.value) || 0
                  }))}
                />
              </div>
              {formData.initialBalance > 0 && (
                <p className="mt-2 text-sm text-gray-600">
                  Valor formatado: {formatCurrency(formData.initialBalance)}
                </p>
              )}
            </div>
          </div>
        );

      case 3: // Entradas Previstas
        return (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-800">Entradas Previstas (Classe 7 - Proveitos)</h3>
              <div className="flex gap-2">
                {dadosOrcamento && (
                  <button
                    onClick={importarDadosOrcamento}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <FileText className="w-4 h-4" />
                    Importar do Orçamento
                  </button>
                )}
                <button
                  onClick={addInflow}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Adicionar Entrada
                </button>
              </div>
            </div>

            {formData.importedFromBudget && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-sm text-blue-700">
                  ℹ️ Entradas marcadas com 📥 foram importadas do orçamento
                </p>
              </div>
            )}

            {formData.inflows.length === 0 ? (
              <div className="text-center py-12 bg-gray-50 rounded-lg">
                <TrendingUp className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">Nenhuma entrada prevista</p>
                <p className="text-sm text-gray-400 mt-1">Importe do orçamento ou adicione manualmente</p>
              </div>
            ) : (
              <div className="space-y-4">
                {formData.inflows.map((inflow, index) => (
                  <div key={inflow.id} className={`border rounded-lg p-4 hover:shadow-md transition-shadow ${
                    inflow.fromBudget ? 'bg-green-50 border-green-200' : 'bg-white border-gray-200'
                  }`}>
                    <div className="flex justify-between items-start mb-3">
                      <h4 className="font-medium text-gray-900 flex items-center gap-2">
                        Entrada #{index + 1}
                        {inflow.fromBudget && <span title="Importado do orçamento">📥</span>}
                      </h4>
                      <button
                        onClick={() => removeInflow(inflow.id)}
                        className="text-red-600 hover:bg-red-50 p-1 rounded"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">
                          Conta PGC
                        </label>
                        <select
                          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                          value={inflow.pgcCode}
                          onChange={(e) => updateInflow(inflow.id, 'pgcCode', e.target.value)}
                        >
                          {Object.entries(pgcMapping.revenues).map(([code, info]) => (
                            <option key={code} value={code}>
                              {code} - {info.name}
                            </option>
                          ))}
                        </select>
                      </div>
                      
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">
                          Descrição
                        </label>
                        <input
                          type="text"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                          placeholder="Detalhe da entrada"
                          value={inflow.description}
                          onChange={(e) => updateInflow(inflow.id, 'description', e.target.value)}
                        />
                      </div>
                      
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">
                          Valor (Kz)
                        </label>
                        <input
                          type="number"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                          placeholder="0,00"
                          value={inflow.amount}
                          onChange={(e) => updateInflow(inflow.id, 'amount', e.target.value)}
                        />
                      </div>
                      
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">
                          Data Prevista
                        </label>
                        <input
                          type="date"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                          value={inflow.expectedDate}
                          onChange={(e) => updateInflow(inflow.id, 'expectedDate', e.target.value)}
                        />
                      </div>
                      
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">
                          Probabilidade (%)
                        </label>
                        <select
                          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                          value={inflow.probability}
                          onChange={(e) => updateInflow(inflow.id, 'probability', parseInt(e.target.value))}
                        >
                          <option value="100">100% - Confirmado</option>
                          <option value="90">90% - Muito Provável</option>
                          <option value="75">75% - Provável</option>
                          <option value="50">50% - Incerto</option>
                        </select>
                      </div>
                      
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">
                          Origem/Cliente
                        </label>
                        <input
                          type="text"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                          placeholder="Nome do cliente/origem"
                          value={inflow.source}
                          onChange={(e) => updateInflow(inflow.id, 'source', e.target.value)}
                        />
                      </div>
                    </div>
                    
                    {inflow.amount > 0 && (
                      <div className="mt-3 pt-3 border-t">
                        <p className="text-sm text-gray-600">
                          Valor esperado: {formatCurrency(inflow.amount * (inflow.probability / 100))}
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        );

      case 4: // Saídas Previstas
        return (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-800">Saídas Previstas (Classe 6 - Custos)</h3>
              <button
                onClick={addOutflow}
                className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                <Plus className="w-4 h-4" />
                Adicionar Saída
              </button>
            </div>

            {formData.importedFromBudget && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-sm text-blue-700">
                  ℹ️ Saídas marcadas com 📥 foram importadas do orçamento
                </p>
              </div>
            )}

            {formData.outflows.length === 0 ? (
              <div className="text-center py-12 bg-gray-50 rounded-lg">
                <TrendingDown className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">Nenhuma saída prevista</p>
                <p className="text-sm text-gray-400 mt-1">Importe do orçamento ou adicione manualmente</p>
              </div>
            ) : (
              <div className="space-y-4">
                {formData.outflows.map((outflow, index) => (
                  <div key={outflow.id} className={`border rounded-lg p-4 hover:shadow-md transition-shadow ${
                    outflow.fromBudget ? 'bg-red-50 border-red-200' : 'bg-white border-gray-200'
                  }`}>
                    <div className="flex justify-between items-start mb-3">
                      <h4 className="font-medium text-gray-900 flex items-center gap-2">
                        Saída #{index + 1}
                        {outflow.fromBudget && <span title="Importado do orçamento">📥</span>}
                        {outflow.priority === 1 && <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded">Crítica</span>}
                      </h4>
                      <button
                        onClick={() => removeOutflow(outflow.id)}
                        className="text-red-600 hover:bg-red-50 p-1 rounded"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">
                          Conta PGC
                        </label>
                        <select
                          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                          value={outflow.pgcCode}
                          onChange={(e) => updateOutflow(outflow.id, 'pgcCode', e.target.value)}
                        >
                          {Object.entries(pgcMapping.costs).map(([code, info]) => (
                            <option key={code} value={code}>
                              {code} - {info.name}
                            </option>
                          ))}
                        </select>
                      </div>
                      
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">
                          Descrição
                        </label>
                        <input
                          type="text"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                          placeholder="Detalhe da saída"
                          value={outflow.description}
                          onChange={(e) => updateOutflow(outflow.id, 'description', e.target.value)}
                        />
                      </div>
                      
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">
                          Valor (Kz)
                        </label>
                        <input
                          type="number"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                          placeholder="0,00"
                          value={outflow.amount}
                          onChange={(e) => updateOutflow(outflow.id, 'amount', e.target.value)}
                        />
                      </div>
                      
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">
                          Data Programada
                        </label>
                        <input
                          type="date"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                          value={outflow.scheduledDate}
                          onChange={(e) => updateOutflow(outflow.id, 'scheduledDate', e.target.value)}
                        />
                      </div>
                      
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">
                          Prioridade
                        </label>
                        <select
                          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                          value={outflow.priority}
                          onChange={(e) => updateOutflow(outflow.id, 'priority', parseInt(e.target.value))}
                        >
                          <option value="1">1 - Crítica (Folha, INSS)</option>
                          <option value="2">2 - Alta (Juros, Energia)</option>
                          <option value="3">3 - Média (Fornecedores)</option>
                          <option value="4">4 - Baixa (Adiável)</option>
                        </select>
                      </div>
                      
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">
                          Fornecedor
                        </label>
                        <input
                          type="text"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                          placeholder="Nome do fornecedor"
                          value={outflow.supplier}
                          onChange={(e) => updateOutflow(outflow.id, 'supplier', e.target.value)}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        );

      case 5: // Financiamento
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-800">Necessidades de Financiamento</h3>
            
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-yellow-900">Análise Preliminar</p>
                  <p className="text-sm text-yellow-700 mt-1">
                    Com base nos dados inseridos, o sistema calculará automaticamente a necessidade de financiamento.
                  </p>
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Suprimentos ENDIAMA E.P. (Kz)
                </label>
                <input
                  type="number"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="0,00"
                  value={formData.financing.endiama}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    financing: { ...prev.financing, endiama: parseFloat(e.target.value) || 0 }
                  }))}
                />
                <p className="text-xs text-gray-500 mt-1">Conta PGC: 80 - Suprimentos/Empréstimos</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Financiamento Bancário (Kz)
                </label>
                <input
                  type="number"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="0,00"
                  value={formData.financing.bank}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    financing: { ...prev.financing, bank: parseFloat(e.target.value) || 0 }
                  }))}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Outras Fontes (Kz)
                </label>
                <input
                  type="number"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="0,00"
                  value={formData.financing.other}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    financing: { ...prev.financing, other: parseFloat(e.target.value) || 0 }
                  }))}
                />
              </div>
            </div>
          </div>
        );

      case 6:
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-800">Revisão Final</h3>
            
            <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl p-6 text-white">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-sm opacity-90">Total Entradas</p>
                  <p className="text-2xl font-bold">{formatCurrency(totals.totalInflows)}</p>
                </div>
                <div>
                  <p className="text-sm opacity-90">Total Saídas</p>
                  <p className="text-2xl font-bold">{formatCurrency(totals.totalOutflows)}</p>
                </div>
                <div>
                  <p className="text-sm opacity-90">Financiamentos</p>
                  <p className="text-2xl font-bold">{formatCurrency(totals.totalFinancing)}</p>
                </div>
                <div>
                  <p className="text-sm opacity-90">Saldo Final</p>
                  <p className="text-2xl font-bold">{formatCurrency(totals.finalBalance)}</p>
                </div>
              </div>
            </div>
            
            {totals.necessidadeFinanciamento > 0 && (
              <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-yellow-600" />
                  <p className="text-yellow-800">
                    Necessidade de financiamento: {formatCurrency(totals.necessidadeFinanciamento)}
                  </p>
                </div>
              </div>
            )}

            <div className="flex gap-3">
              <button 
                onClick={handleFinalizar}
                disabled={isLoading}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Processando...
                  </>
                ) : (
                  <>
                    <Save className="w-5 h-5" />
                    Finalizar Plano
                  </>
                )}
              </button>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <button
            onClick={handleVoltar}
            className="flex items-center text-indigo-600 hover:text-indigo-800 mb-6 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Voltar para Tesouraria
          </button>
          
          <div className="max-w-6xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden">
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-8 py-6">
              <h1 className="text-2xl font-bold text-white">Formulário de Plano de Tesouraria</h1>
              <p className="text-indigo-100">Preencha as informações do plano de tesouraria</p>
              <div className="mt-6 flex items-center justify-between">
                {steps.map((step, index) => (
                  <div key={step.id} className="flex items-center">
                    <div
                      className={`flex items-center justify-center w-10 h-10 rounded-full transition-all ${
                        currentStep === index
                          ? 'bg-white text-indigo-600 scale-110 border-2 border-indigo-600'
                          : currentStep > index
                          ? 'bg-green-500 text-white'
                          : 'bg-gray-200 text-gray-500'
                      }`}
                    >
                      {currentStep > index ? (
                        <CheckCircle className="w-5 h-5" />
                      ) : (
                        <span className="text-lg">{step.icon}</span>
                      )}
                    </div>
                    {index < steps.length - 1 && (
                      <div
                        className={`w-full h-1 mx-2 transition-all ${
                          currentStep > index ? 'bg-green-500' : 'bg-gray-300'
                        }`}
                        style={{ width: '60px' }}
                      />
                    )}
                  </div>
                ))}
              </div>
              <div className="mt-4 flex justify-between text-xs">
                {steps.map((step) => (
                  <div
                    key={step.id}
                    className={`text-center ${currentStep === step.id ? 'font-semibold text-white' : 'text-gray-200'}`}
                    style={{ width: '100px' }}
                  >
                    {step.title}
                  </div>
                ))}
              </div>
            </div>
            
            <div className="p-8">
              {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3">
                  <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                  <p className="text-red-700 font-medium">{error}</p>
                </div>
              )}
              
              <div className="mb-6 flex justify-between items-center">
                <h2 className="text-xl font-bold text-gray-800">
                  {steps[currentStep].title}
                </h2>
                <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                  Passo {currentStep + 1} de {steps.length}
                </span>
              </div>
              
              {renderStepContent()}
            </div>
            
            <div className="flex justify-between items-center px-8 py-4 bg-gray-50 border-t">
              <button
                onClick={handlePrevStep}
                disabled={currentStep === 0}
                className={`px-6 py-2 rounded-lg transition-colors flex items-center gap-2 ${
                  currentStep === 0
                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    : 'bg-gray-300 text-gray-700 hover:bg-gray-400'
                }`}
              >
                <ChevronRight className="w-4 h-4 transform rotate-180" />
                Anterior
              </button>
              
              <div className="flex gap-2">
                {steps.map((step) => (
                  <button
                    key={step.id}
                    onClick={() => setCurrentStep(step.id)}
                    className={`w-2 h-2 rounded-full transition-all ${
                      currentStep === step.id 
                        ? 'w-8 bg-indigo-600' 
                        : step.id < currentStep
                        ? 'bg-green-500'
                        : 'bg-gray-300'
                    }`}
                  />
                ))}
              </div>
              
              {currentStep < steps.length - 1 ? (
                <button
                  onClick={handleNextStep}
                  className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-2"
                >
                  Próximo
                  <ChevronRight className="w-4 h-4" />
                </button>
              ) : (
                <div className="flex gap-3">
                  <button
                    onClick={handleFinalizar}
                    disabled={isLoading}
                    className={`px-6 py-2 rounded-lg transition-colors flex items-center gap-2 ${
                      isLoading 
                        ? 'bg-gray-400 text-white cursor-not-allowed' 
                        : 'bg-green-600 text-white hover:bg-green-700'
                    }`}
                  >
                    {isLoading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Processando...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="w-4 h-4" />
                        Finalizar Plano
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default FormularioPlanoTesouraria;