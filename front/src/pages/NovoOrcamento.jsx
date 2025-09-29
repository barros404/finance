import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight, Plus, Trash2, Save, AlertCircle, CheckCircle, ArrowLeft } from 'lucide-react';
import { orcamentoApi } from '../services/api';

const NovoOrcamento = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    nome: '',
    descricao: '',
    ano: new Date().getFullYear(),
    observacoes: '',
    receitas: [],
    custos: {
      materials: [],
      services: [],
      personnel: [],
      fixed: []
    },
    ativos: [],
    sazonalidade: Array(12).fill(8.33) // Array simples com percentuais
  });

  const steps = [
    { id: 0, title: 'Informações do Orçamento', icon: '📋' },
    { id: 1, title: 'Receitas', icon: '💰' },
    { id: 2, title: 'Custos com Materiais', icon: '📦' },
    { id: 3, title: 'Custos com Serviços', icon: '🔧' },
    { id: 4, title: 'Custos com Pessoal', icon: '👥' },
    { id: 5, title: 'Ativos', icon: '🏭' },
    { id: 6, title: 'Sazonalidade', icon: '📊' },
    { id: 7, title: 'Revisão e Envio', icon: '✅' }
  ];

  // Carregar dados salvos localmente ao inicializar
  useEffect(() => {
    const savedData = localStorage.getItem('novoOrcamentoDraft');
    if (savedData) {
      try {
        setFormData(JSON.parse(savedData));
      } catch (e) {
        console.error('Erro ao carregar rascunho:', e);
      }
    }
  }, []);

  // Salvar dados localmente sempre que houver mudanças
  useEffect(() => {
    localStorage.setItem('novoOrcamentoDraft', JSON.stringify(formData));
  }, [formData]);

  // Validação antes de avançar para a próxima etapa
  const validateStep = (step) => {
    switch(step) {
      case 0:
        if (!formData.nome.trim()) {
          setError('Nome do orçamento é obrigatório');
          return false;
        }
        if (!formData.ano || formData.ano < 2020 || formData.ano > 2100) {
          setError('Ano do orçamento deve estar entre 2020 and 2100');
          return false;
        }
        break;
      case 1:
        if (formData.receitas.length === 0) {
          setError('Pelo menos uma receita deve ser adicionada');
          return false;
        }
        for (let i = 0; i < formData.receitas.length; i++) {
          const revenue = formData.receitas[i];
          if (!revenue.description.trim()) {
            setError(`A receita ${i + 1} precisa de uma descrição`);
            return false;
          }
          if (revenue.quantity <= 0 || revenue.unitPrice <= 0) {
            setError(`Verifique os valores da receita ${i + 1}`);
            return false;
          }
        }
        break;
      case 6:
        const totalPercentual = formData.sazonalidade.reduce((sum, percent) => sum + parseFloat(percent || 0), 0);
        if (Math.abs(totalPercentual - 100) > 0.1) {
          setError(`A soma dos percentuais deve ser 100%. Atual: ${totalPercentual.toFixed(2)}%`);
          return false;
        }
        break;
    }
    setError(null);
    return true;
  };

  const handleNextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(Math.min(steps.length - 1, currentStep + 1));
    }
  };

  const handlePrevStep = () => {
    setCurrentStep(Math.max(0, currentStep - 1));
    setError(null);
  };

  const addRevenue = () => {
    setFormData(prev => ({
      ...prev,
      receitas: [...prev.receitas, { description: '', quantity: 0, unitPrice: 0, total: 0 }]
    }));
  };

  const updateRevenue = (index, field, value) => {
    const newRevenues = [...formData.receitas];
    newRevenues[index][field] = value;
    
    if (field === 'quantity' || field === 'unitPrice') {
      newRevenues[index].total = newRevenues[index].quantity * newRevenues[index].unitPrice;
    }
    
    setFormData(prev => ({ ...prev, receitas: newRevenues }));
  };

  const removeRevenue = (index) => {
    setFormData(prev => ({
      ...prev,
      receitas: prev.receitas.filter((_, i) => i !== index)
    }));
  };

  const addCost = (type) => {
    const newCost = type === 'personnel' 
      ? { role: '', quantity: 1, salary: 0, type: 'Permanente', total: 0 }
      : { description: '', quantity: 0, unitCost: 0, frequency: 'Mensal', total: 0 };
    
    setFormData(prev => ({
      ...prev,
      custos: {
        ...prev.custos,
        [type]: [...prev.custos[type], newCost]
      }
    }));
  };

  const updateCostItem = (costType, index, field, value) => {
    setFormData(prev => {
      const updatedCosts = { ...prev.custos };
      const costItems = [...updatedCosts[costType]];
      
      costItems[index] = { ...costItems[index], [field]: value };
      
      if (field === 'quantity' || field === 'unitCost' || field === 'salary') {
        const quantity = field === 'quantity' ? value : costItems[index].quantity;
        const unitValue = costType === 'personnel' 
          ? (field === 'salary' ? value : costItems[index].salary)
          : (field === 'unitCost' ? value : costItems[index].unitCost);
        
        costItems[index].total = quantity * unitValue;
      }
      
      return {
        ...prev,
        custos: {
          ...updatedCosts,
          [costType]: costItems
        }
      };
    });
  };

  const removeCostItem = (costType, index) => {
    setFormData(prev => ({
      ...prev,
      custos: {
        ...prev.custos,
        [costType]: prev.custos[costType].filter((_, i) => i !== index)
      }
    }));
  };

  const updateSazonalidade = (index, value) => {
    setFormData(prev => {
      const newSazonalidade = [...prev.sazonalidade];
      newSazonalidade[index] = parseFloat(value) || 0;
      
      return {
        ...prev,
        sazonalidade: newSazonalidade
      };
    });
  };

  const calculateTotals = () => {
    const revenueTotal = formData.receitas.reduce((sum, r) => sum + (r.total || 0), 0);
    const materialsCosts = formData.custos.materials.reduce((sum, c) => sum + (c.total || 0), 0);
    const servicesCosts = formData.custos.services.reduce((sum, c) => sum + (c.total || 0), 0);
    const personnelCosts = formData.custos.personnel.reduce((sum, c) => sum + (c.total || 0), 0);
    const fixedCosts = formData.custos.fixed.reduce((sum, c) => sum + (c.total || 0), 0);
    
    const totalCosts = materialsCosts + servicesCosts + personnelCosts + fixedCosts;
    const netResult = revenueTotal - totalCosts;
    const margin = revenueTotal > 0 ? (netResult / revenueTotal * 100).toFixed(1) : 0;
    
    const receitaMensal = formData.sazonalidade.map(percentual => 
      (revenueTotal * (percentual / 100)).toFixed(2)
    );
    
    return { revenueTotal, totalCosts, netResult, margin, receitaMensal };
  };

  const renderStepContent = () => {
    switch(currentStep) {
      case 0:
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nome do Orçamento *
              </label>
              <input
                type="text"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="Ex: Orçamento 2024"
                value={formData.nome}
                onChange={(e) => setFormData(prev => ({ ...prev, nome: e.target.value }))}
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ano do Orçamento *
              </label>
              <input
                type="number"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                min="2020"
                max="2100"
                value={formData.ano}
                onChange={(e) => setFormData(prev => ({ ...prev, ano: parseInt(e.target.value) }))}
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Descrição
              </label>
              <textarea
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                rows="4"
                placeholder="Descreva o propósito deste orçamento..."
                value={formData.descricao}
                onChange={(e) => setFormData(prev => ({ ...prev, descricao: e.target.value }))}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Observações
              </label>
              <textarea
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                rows="3"
                placeholder="Observações adicionais..."
                value={formData.observacoes}
                onChange={(e) => setFormData(prev => ({ ...prev, observacoes: e.target.value }))}
              />
            </div>
          </div>
        );
      
      case 1:
        return (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Produtos/Serviços e Receitas</h3>
              <button
                onClick={addRevenue}
                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
              >
                <Plus className="w-4 h-4" />
                Adicionar Produto
              </button>
            </div>
            
            {formData.receitas.map((revenue, index) => (
              <div key={index} className="p-4 border border-gray-200 rounded-lg space-y-3">
                <div className="flex justify-between items-start">
                  <div className="flex-1 grid grid-cols-1 md:grid-cols-4 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">
                        Descrição
                      </label>
                      <input
                        type="text"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                        placeholder="Nome do produto"
                        value={revenue.description}
                        onChange={(e) => updateRevenue(index, 'description', e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">
                        Quantidade/Ano
                      </label>
                      <input
                        type="number"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                        placeholder="0"
                        value={revenue.quantity}
                        onChange={(e) => updateRevenue(index, 'quantity', parseFloat(e.target.value) || 0)}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">
                        Preço Unitário (Kz)
                      </label>
                      <input
                        type="number"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                        placeholder="0"
                        value={revenue.unitPrice}
                        onChange={(e) => updateRevenue(index, 'unitPrice', parseFloat(e.target.value) || 0)}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">
                        Total (Kz)
                      </label>
                      <div className="px-3 py-2 bg-gray-100 rounded-md text-sm font-semibold">
                        {revenue.total.toLocaleString('pt-AO')}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => removeRevenue(index)}
                    className="ml-3 p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
            
            {formData.receitas.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <p>Nenhum produto adicionado ainda.</p>
                <p className="text-sm mt-2">Clique em "Adicionar Produto" para começar.</p>
              </div>
            )}
          </div>
        );
      
      case 2:
      case 3:
      case 4:
      case 5:
        const costType = currentStep === 2 ? 'materials' : 
                        currentStep === 3 ? 'services' : 
                        currentStep === 4 ? 'personnel' : 'fixed';
        const costTitle = currentStep === 2 ? 'Materiais e Matérias-Primas' :
                         currentStep === 3 ? 'Serviços Externos' :
                         currentStep === 4 ? 'Pessoal' : 'Ativos Fixos';
        
        return (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">{costTitle}</h3>
              <button
                onClick={() => addCost(costType)}
                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
              >
                <Plus className="w-4 h-4" />
                Adicionar Item
              </button>
            </div>
            
            {formData.custos[costType].length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <p>Nenhum item adicionado ainda.</p>
                <p className="text-sm mt-2">Clique em "Adicionar Item" para começar.</p>
              </div>
            ) : (
              formData.custos[costType].map((item, index) => (
                <div key={index} className="p-4 border border-gray-200 rounded-lg mb-4">
                  <div className="flex justify-between items-start mb-3">
                    <h4 className="font-medium">Item {index + 1}</h4>
                    <button
                      onClick={() => removeCostItem(costType, index)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  
                  {costType === 'personnel' ? (
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">Cargo/Função</label>
                        <input
                          type="text"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                          placeholder="Ex: Gerente"
                          value={item.role}
                          onChange={(e) => updateCostItem(costType, index, 'role', e.target.value)}
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">Quantidade</label>
                        <input
                          type="number"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                          min="1"
                          value={item.quantity}
                          onChange={(e) => updateCostItem(costType, index, 'quantity', parseInt(e.target.value) || 0)}
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">Salário (Kz)</label>
                        <input
                          type="number"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                          min="0"
                          step="0.01"
                          value={item.salary}
                          onChange={(e) => updateCostItem(costType, index, 'salary', parseFloat(e.target.value) || 0)}
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">Tipo</label>
                        <select 
                          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                          value={item.type}
                          onChange={(e) => updateCostItem(costType, index, 'type', e.target.value)}
                        >
                          <option value="Permanente">Permanente</option>
                          <option value="Temporário">Temporário</option>
                          <option value="Freelancer">Freelancer</option>
                        </select>
                      </div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">Descrição</label>
                        <input
                          type="text"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                          placeholder={costType === 'materials' ? 'Ex: Sementes' : costType === 'services' ? 'Ex: Consultoria' : 'Ex: Aluguel'}
                          value={item.description}
                          onChange={(e) => updateCostItem(costType, index, 'description', e.target.value)}
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">Quantidade</label>
                        <input
                          type="number"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                          min="0"
                          step="0.01"
                          value={item.quantity}
                          onChange={(e) => updateCostItem(costType, index, 'quantity', parseFloat(e.target.value) || 0)}
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">
                          {costType === 'personnel' ? 'Salário (Kz)' : 'Custo Unitário (Kz)'}
                        </label>
                        <input
                          type="number"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                          min="0"
                          step="0.01"
                          value={costType === 'personnel' ? item.salary : item.unitCost}
                          onChange={(e) => {
                            const value = parseFloat(e.target.value) || 0;
                            if (costType === 'personnel') {
                              updateCostItem(costType, index, 'salary', value);
                            } else {
                              updateCostItem(costType, index, 'unitCost', value);
                            }
                          }}
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">
                          {costType === 'personnel' ? 'Tipo' : 'Frequência'}
                        </label>
                        {costType === 'personnel' ? (
                          <select 
                            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                            value={item.type}
                            onChange={(e) => updateCostItem(costType, index, 'type', e.target.value)}
                          >
                            <option value="Permanente">Permanente</option>
                            <option value="Temporário">Temporário</option>
                            <option value="Freelancer">Freelancer</option>
                          </select>
                        ) : (
                          <select 
                            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                            value={item.frequency}
                            onChange={(e) => updateCostItem(costType, index, 'frequency', e.target.value)}
                          >
                            <option value="Único">Único</option>
                            <option value="Diário">Diário</option>
                            <option value="Semanal">Semanal</option>
                            <option value="Mensal">Mensal</option>
                            <option value="Trimestral">Trimestral</option>
                            <option value="Anual">Anual</option>
                          </select>
                        )}
                      </div>
                      <div className="md:col-span-4">
                        <label className="block text-xs font-medium text-gray-600 mb-1">Total (Kz)</label>
                        <div className="px-3 py-2 bg-gray-50 rounded-md text-sm font-semibold">
                          {((costType === 'personnel' ? item.salary : item.unitCost) * item.quantity).toLocaleString('pt-AO', {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2
                          })}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        );
      
      case 6:
        const totalPercentual = formData.sazonalidade.reduce((sum, percent) => sum + parseFloat(percent || 0), 0);
        
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold">Sazonalidade do Negócio</h3>
            
            <div className="bg-blue-50 p-4 rounded-lg mb-4">
              <p className="text-sm text-blue-700">
                Distribua a receita total pelos meses do ano. A soma deve ser 100%.
              </p>
              <div className="mt-2 flex items-center">
                <span className="text-sm font-medium text-blue-800">
                  Total: {totalPercentual.toFixed(2)}%
                </span>
                {Math.abs(totalPercentual - 100) > 0.1 && (
                  <span className="ml-3 text-sm text-red-600">
                    ⚠️ A soma deve ser exatamente 100%
                  </span>
                )}
              </div>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 
                'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'].map((month, index) => (
                <div key={index} className="border rounded-lg p-3">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {month}
                  </label>
                  <div className="flex items-center">
                    <input
                      type="number"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                      min="0"
                      max="100"
                      step="0.01"
                      value={formData.sazonalidade[index]}
                      onChange={(e) => updateSazonalidade(index, e.target.value)}
                    />
                    <span className="ml-2 text-sm text-gray-500">%</span>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="flex justify-between items-center mt-6">
              <button
                onClick={() => {
                  setFormData(prev => ({
                    ...prev,
                    sazonalidade: Array(12).fill(8.33)
                  }));
                }}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 text-sm"
              >
                Distribuir Uniformemente
              </button>
              
              <button
                onClick={() => {
                  const distribuicaoSazonal = [5, 5, 10, 15, 20, 15, 10, 5, 5, 5, 5, 5];
                  setFormData(prev => ({
                    ...prev,
                    sazonalidade: distribuicaoSazonal
                  }));
                }}
                className="px-4 py-2 bg-indigo-100 text-indigo-700 rounded-lg hover:bg-indigo-200 text-sm"
              >
                Exemplo Sazonal
              </button>
            </div>
          </div>
        );
      
      case 7:
        const totals = calculateTotals();
        
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold">Resumo do Orçamento</h3>
            
            <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl p-6 text-white">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-sm opacity-90">Receita Total</p>
                  <p className="text-2xl font-bold">{totals.revenueTotal.toLocaleString('pt-AO')} Kz</p>
                </div>
                <div>
                  <p className="text-sm opacity-90">Custos Totais</p>
                  <p className="text-2xl font-bold">{totals.totalCosts.toLocaleString('pt-AO')} Kz</p>
                </div>
                <div>
                  <p className="text-sm opacity-90">Resultado Líquido</p>
                  <p className="text-2xl font-bold">{totals.netResult.toLocaleString('pt-AO')} Kz</p>
                </div>
                <div>
                  <p className="text-sm opacity-90">Margem</p>
                  <p className="text-2xl font-bold">{totals.margin}%</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white border rounded-lg p-4">
              <h4 className="font-semibold text-gray-800 mb-3">Distribuição Sazonal da Receita</h4>
              <div className="grid grid-cols-6 gap-2 mb-4">
                {totals.receitaMensal.map((valor, index) => (
                  <div key={index} className="text-center">
                    <div className="text-xs text-gray-500 mb-1">
                      {['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'][index]}
                    </div>
                    <div className="text-sm font-medium">
                      {parseFloat(valor).toLocaleString('pt-AO')} Kz
                    </div>
                    <div className="text-xs text-gray-500">
                      {formData.sazonalidade[index].toFixed(1)}%
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="flex items-end h-20 gap-1 mt-3">
                {totals.receitaMensal.map((valor, index) => {
                  const height = (parseFloat(valor) / Math.max(...totals.receitaMensal.map(v => parseFloat(v)))) * 60;
                  return (
                    <div
                      key={index}
                      className="flex-1 bg-indigo-500 rounded-t hover:bg-indigo-600 transition-colors"
                      style={{ height: `${height}px` }}
                      title={`${['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'][index]}: ${parseFloat(valor).toLocaleString('pt-AO')} Kz (${formData.sazonalidade[index].toFixed(1)}%)`}
                    />
                  );
                })}
              </div>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-start gap-3 p-4 bg-green-50 border border-green-200 rounded-lg">
                <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                <div>
                  <p className="font-medium text-green-900">Dados prontos para processamento</p>
                  <p className="text-sm text-green-700 mt-1">
                    O sistema irá mapear automaticamente para o PGC-AO e gerar relatórios completos
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
                <div>
                  <p className="font-medium text-blue-900">Mapeamento inteligente</p>
                  <p className="text-sm text-blue-700 mt-1">
                    Contas com baixa confiança serão sinalizadas para revisão manual
                  </p>
                </div>
              </div>
            </div>
            
            <div className="flex gap-3">
              <button 
                onClick={handleSaveDraft}
                className="flex-1 px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors flex items-center justify-center gap-2"
              >
                <Save className="w-5 h-5" />
                Guardar Rascunho
              </button>
              <button 
                onClick={handleFinalizar}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
              >
                <Save className="w-5 h-5" />
                Processar e Gerar Relatórios
              </button>
            </div>
          </div>
        );
      
      default:
        return null;
    }
  };

  const handleVoltar = () => {
    navigate(-1);
  };

  const handleSaveDraft = () => {
    alert('Rascunho salvo automaticamente!');
  };

  const handleFinalizar = async () => {
    if (!validateStep(currentStep)) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      if (!formData.nome) {
        throw new Error('Nome do orçamento é obrigatório');
      }
      
      if (!formData.ano) {
        throw new Error('Ano do orçamento é obrigatório');
      }
      
      if (formData.receitas.length === 0) {
        throw new Error('Pelo menos uma receita deve ser adicionada');
      }
      
      const dadosOrcamento = {
        nome: formData.nome,
        descricao: formData.descricao,
        ano: formData.ano,
        observacoes: formData.observacoes,
        receitas: formData.receitas,
        custos: formData.custos,
        ativos: formData.ativos,
        sazonalidade: formData.sazonalidade.map((percentual, index) => ({
          mes: index + 1,
          percentual: parseFloat(percentual) || 0
        }))
      };
      console.log('DADOS A SER ENVIADO NA API',dadosOrcamento)
      const response = await orcamentoApi.criarOrcamentoCompleto(dadosOrcamento);
      
      if (response.data && response.data.orcamento) {
        localStorage.removeItem('novoOrcamentoDraft');
        
        navigate('/tela-orcamento', { 
          state: { 
            message: 'Orçamento criado com sucesso!',
            type: 'success'
          }
        });
      } else {
        throw new Error('Resposta inválida da API');
      }
    } catch (err) {
      setError(err.message || 'Erro ao criar orçamento. Tente novamente.');
      console.error('Erro ao criar orçamento:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <button
          onClick={handleVoltar}
          className="flex items-center text-indigo-600 hover:text-indigo-800 mb-6 transition-colors"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Voltar para Orçamentos
        </button>
        <div className="max-w-6xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-8 py-6">
            <h1 className="text-2xl font-bold text-white">Novo Orçamento</h1>
            <p className="text-indigo-100">Preencha as informações do orçamento</p>
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
                  onClick={() => {
                    if (step.id <= currentStep || validateStep(currentStep)) {
                      setCurrentStep(step.id);
                    }
                  }}
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
                  onClick={handleSaveDraft}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors flex items-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  Guardar Rascunho
                </button>
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
                      Finalizar Orçamento
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
        
        <div className="mt-4 text-center">
          <span className="text-xs text-gray-500 bg-gray-100 px-3 py-1 rounded-full inline-flex items-center">
            <CheckCircle className="w-3 h-3 mr-1 text-green-500" />
            Alterações salvas automaticamente
          </span>
        </div>
      </div>
    </div>
  );
};

export default NovoOrcamento;