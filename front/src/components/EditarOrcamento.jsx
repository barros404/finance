import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Save, 
  Plus, 
  Trash2, 
  Calendar, 
  DollarSign, 
  TrendingUp, 
  TrendingDown,
  FileText,
  AlertCircle,
  CheckCircle
} from 'lucide-react';
import { orcamentoApi } from '../services/api';

const EditarOrcamento = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [orcamento, setOrcamento] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');

  // Estados para os formulários
  const [formData, setFormData] = useState({
    nome: '',
    descricao: '',
    dataInicio: '',
    dataFim: '',
    observacoes: '',
    receitas: [],
    custos: [],
    ativos: []
  });

  // Função para formatar valores monetários
  const formatarValor = (valor) => {
    if (!valor && valor !== 0) return 'Kz 0,00';
    const numeroFormatado = parseFloat(valor).toLocaleString('pt-AO', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
    return `Kz ${numeroFormatado}`;
  };

  // Carregar dados do orçamento
  useEffect(() => {
    const carregarOrcamento = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        console.log('🔄 Carregando orçamento para edição:', id);
        const response = await orcamentoApi.obterOrcamento(id);
        
        console.log('📥 Resposta da API:', response);
        
        if (response.status=='success' && response.data) {
          const orcamentoData = response.data.orcamento;
          
          // Verificar se pode ser editado
          if (orcamentoData.status === 'arquivado' || orcamentoData.status === 'aprovado') {
            setError('Este orçamento não pode ser editado pois está arquivado ou aprovado.');
            return;
          }
          
          // Processar os dados para o formulário
          setOrcamento(orcamentoData);
          setFormData({
            nome: orcamentoData.nome || '',
            descricao: orcamentoData.descricao || '',
            dataInicio: orcamentoData.dataInicio ? new Date(orcamentoData.dataInicio).toISOString().split('T')[0] : '',
            dataFim: orcamentoData.dataFim ? new Date(orcamentoData.dataFim).toISOString().split('T')[0] : '',
            observacoes: orcamentoData.observacoes || '',
            receitas: orcamentoData.receitas || [],
            custos: orcamentoData.custos || [],
            ativos: orcamentoData.ativos || []
          });
          
          console.log('✅ Orçamento carregado para edição:', orcamentoData);
        } else {
          throw new Error('Formato de resposta inválido');
        }
      } catch (err) {
        console.error('❌ Erro ao carregar orçamento:', err);
        setError(`Erro ao carregar orçamento: ${err.message}`);
      } finally {
        setIsLoading(false);
      }
    };

    if (id) {
      carregarOrcamento();
    }
  }, [id]);

  const handleVoltar = () => {
    navigate('/orcamentos');
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Funções para gerenciar receitas
  const adicionarReceita = () => {
    setFormData(prev => ({
      ...prev,
      receitas: [...prev.receitas, {
        id: Date.now(), // ID temporário
        descricao: '',
        categoria: 'venda',
        quantidade: 1,
        precoUnitario: 0,
        valor: 0
      }]
    }));
  };

  const atualizarReceita = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      receitas: prev.receitas.map((receita, i) => 
        i === index ? { ...receita, [field]: value } : receita
      )
    }));
  };

  const removerReceita = (index) => {
    setFormData(prev => ({
      ...prev,
      receitas: prev.receitas.filter((_, i) => i !== index)
    }));
  };

  // Funções para gerenciar custos
  const adicionarCusto = () => {
    setFormData(prev => ({
      ...prev,
      custos: [...prev.custos, {
        id: Date.now(), // ID temporário
        descricao: '',
        tipo: 'material',
        quantidade: 1,
        precoUnitario: 0,
        valor: 0
      }]
    }));
  };

  const atualizarCusto = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      custos: prev.custos.map((custo, i) => 
        i === index ? { ...custo, [field]: value } : custo
      )
    }));
  };

  const removerCusto = (index) => {
    setFormData(prev => ({
      ...prev,
      custos: prev.custos.filter((_, i) => i !== index)
    }));
  };

  // Funções para gerenciar ativos
  const adicionarAtivo = () => {
    setFormData(prev => ({
      ...prev,
      ativos: [...prev.ativos, {
        id: Date.now(), // ID temporário
        nome: '',
        descricao: '',
        tipo: 'outro',
        valor: 0,
        vidaUtil: 5
      }]
    }));
  };

  const atualizarAtivo = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      ativos: prev.ativos.map((ativo, i) => 
        i === index ? { ...ativo, [field]: value } : ativo
      )
    }));
  };

  const removerAtivo = (index) => {
    setFormData(prev => ({
      ...prev,
      ativos: prev.ativos.filter((_, i) => i !== index)
    }));
  };

  // Calcular totais
  const calcularTotais = () => {
    const totalReceita = formData.receitas.reduce((sum, r) => sum + parseFloat(r.valor || 0), 0);
    const totalCusto = formData.custos.reduce((sum, c) => sum + parseFloat(c.valor || 0), 0);
    const totalAtivos = formData.ativos.reduce((sum, a) => sum + parseFloat(a.valor || 0), 0);
    const resultadoLiquido = totalReceita - totalCusto;
    const margem = totalReceita > 0 ? (resultadoLiquido / totalReceita) * 100 : 0;

    return {
      totalReceita,
      totalCusto,
      totalAtivos,
      resultadoLiquido,
      margem
    };
  };

  const totais = calcularTotais();

  // Salvar alterações
  const handleSalvar = async () => {
    setIsSaving(true);
    setError(null);
    setSuccessMessage('');

    try {
      console.log('💾 Salvando alterações do orçamento:', id);
      
      const dadosAtualizacao = {
        nome: formData.nome,
        descricao: formData.descricao,
        dataInicio: formData.dataInicio,
        dataFim: formData.dataFim,
        observacoes: formData.observacoes
      };

      const response = await orcamentoApi.atualizarOrcamento(id, dadosAtualizacao);
      
      console.log('📥 Resposta da API:', response);
      
      if (response.success) {
        setSuccessMessage('Orçamento atualizado com sucesso!');
        setTimeout(() => {
          navigate('/orcamentos');
        }, 2000);
      } else {
        throw new Error('Erro ao salvar alterações');
      }
    } catch (err) {
      console.error('❌ Erro ao salvar orçamento:', err);
      setError(`Erro ao salvar alterações: ${err.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0f0c29] via-[#302b63] to-[#24243e] text-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-white/30 border-t-white rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white/80">Carregando orçamento...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0f0c29] via-[#302b63] to-[#24243e] text-white flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-6">
          <div className="w-16 h-16 bg-red-500/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <AlertCircle className="w-8 h-8 text-red-400" />
          </div>
          <h2 className="text-xl font-bold text-white mb-4">Erro ao carregar orçamento</h2>
          <p className="text-white/70 mb-6">{error}</p>
          <button
            onClick={handleVoltar}
            className="px-6 py-3 bg-gradient-to-r from-[#667eea] to-[#764ba2] text-white rounded-xl hover:from-[#5a67d8] hover:to-[#6b46c1] transition-all duration-300 shadow-lg shadow-[#667eea]/30 transform hover:scale-105 font-semibold"
          >
            Voltar para Lista
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f0c29] via-[#302b63] to-[#24243e] text-white">
      {/* Header */}
      <header className="bg-white/5 backdrop-blur-md border-b border-white/10 py-5 px-10 fixed w-full top-0 z-40">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={handleVoltar}
              className="p-2 text-white/70 hover:bg-white/10 rounded-xl transition-all"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-[#667eea] to-[#764ba2] rounded-xl flex items-center justify-center text-2xl shadow-lg shadow-[#667eea]/30">
                ✏️
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-b from-white to-gray-200 bg-clip-text text-transparent">
                  Editar Orçamento
                </h1>
                <p className="text-sm text-white/60">Modifique as informações do orçamento</p>
              </div>
            </div>
          </div>
          
          <button
            onClick={handleSalvar}
            disabled={isSaving}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#10b981] to-[#059669] text-white rounded-xl hover:from-[#059669] hover:to-[#047857] transition-all duration-300 shadow-lg shadow-[#10b981]/30 transform hover:scale-105 font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSaving ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
            ) : (
              <Save className="w-5 h-5" />
            )}
            {isSaving ? 'Salvando...' : 'Salvar Alterações'}
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto mt-28 px-10 pb-10">
        {/* Mensagens */}
        {error && (
          <div className="mb-6 p-4 bg-red-500/20 border border-red-500/30 rounded-xl backdrop-blur-md">
            <div className="flex items-center">
              <AlertCircle className="w-5 h-5 text-red-400 mr-2" />
              <p className="text-red-200">{error}</p>
            </div>
          </div>
        )}

        {successMessage && (
          <div className="mb-6 p-4 bg-green-500/20 border border-green-500/30 rounded-xl backdrop-blur-md">
            <div className="flex items-center">
              <CheckCircle className="w-5 h-5 text-green-400 mr-2" />
              <p className="text-green-200">{successMessage}</p>
            </div>
          </div>
        )}

        {/* Formulário Principal */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Formulário de Informações Básicas */}
          <div className="lg:col-span-2 bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6">
            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Informações Básicas
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="text-sm font-semibold text-white/80 block mb-2">Nome do Orçamento *</label>
                <input
                  type="text"
                  value={formData.nome}
                  onChange={(e) => handleInputChange('nome', e.target.value)}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:ring-2 focus:ring-[#667eea] focus:border-[#667eea] transition-all text-white placeholder-white/50 backdrop-blur-md"
                  placeholder="Digite o nome do orçamento"
                />
              </div>
              
              <div>
                <label className="text-sm font-semibold text-white/80 block mb-2">Ano</label>
                <input
                  type="number"
                  value={new Date(formData.dataInicio || new Date()).getFullYear()}
                  readOnly
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white/70 backdrop-blur-md cursor-not-allowed"
                />
              </div>
              
              <div>
                <label className="text-sm font-semibold text-white/80 block mb-2">Data de Início *</label>
                <input
                  type="date"
                  value={formData.dataInicio}
                  onChange={(e) => handleInputChange('dataInicio', e.target.value)}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:ring-2 focus:ring-[#667eea] focus:border-[#667eea] transition-all text-white backdrop-blur-md"
                />
              </div>
              
              <div>
                <label className="text-sm font-semibold text-white/80 block mb-2">Data de Fim *</label>
                <input
                  type="date"
                  value={formData.dataFim}
                  onChange={(e) => handleInputChange('dataFim', e.target.value)}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:ring-2 focus:ring-[#667eea] focus:border-[#667eea] transition-all text-white backdrop-blur-md"
                />
              </div>
              
              <div className="md:col-span-2">
                <label className="text-sm font-semibold text-white/80 block mb-2">Descrição</label>
                <textarea
                  value={formData.descricao}
                  onChange={(e) => handleInputChange('descricao', e.target.value)}
                  rows={3}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:ring-2 focus:ring-[#667eea] focus:border-[#667eea] transition-all text-white placeholder-white/50 backdrop-blur-md resize-none"
                  placeholder="Descreva o orçamento..."
                />
              </div>
              
              <div className="md:col-span-2">
                <label className="text-sm font-semibold text-white/80 block mb-2">Observações</label>
                <textarea
                  value={formData.observacoes}
                  onChange={(e) => handleInputChange('observacoes', e.target.value)}
                  rows={3}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:ring-2 focus:ring-[#667eea] focus:border-[#667eea] transition-all text-white placeholder-white/50 backdrop-blur-md resize-none"
                  placeholder="Observações adicionais..."
                />
              </div>
            </div>
          </div>

          {/* Resumo Financeiro */}
          <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6">
            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <DollarSign className="w-5 h-5" />
              Resumo Financeiro
            </h2>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-green-500/10 border border-green-500/20 rounded-xl">
                <div className="flex items-center gap-3">
                  <TrendingUp className="w-5 h-5 text-green-400" />
                  <span className="text-white/80 font-medium">Total Receitas</span>
                </div>
                <span className="text-green-400 font-bold text-lg">
                  {formatarValor(totais.totalReceita)}
                </span>
              </div>
              
              <div className="flex items-center justify-between p-4 bg-red-500/10 border border-red-500/20 rounded-xl">
                <div className="flex items-center gap-3">
                  <TrendingDown className="w-5 h-5 text-red-400" />
                  <span className="text-white/80 font-medium">Total Custos</span>
                </div>
                <span className="text-red-400 font-bold text-lg">
                  {formatarValor(totais.totalCusto)}
                </span>
              </div>
              
              <div className="flex items-center justify-between p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl">
                <div className="flex items-center gap-3">
                  <DollarSign className="w-5 h-5 text-blue-400" />
                  <span className="text-white/80 font-medium">Total Ativos</span>
                </div>
                <span className="text-blue-400 font-bold text-lg">
                  {formatarValor(totais.totalAtivos)}
                </span>
              </div>
              
              <div className="border-t border-white/10 pt-4">
                <div className="flex items-center justify-between p-4 bg-white/5 border border-white/10 rounded-xl">
                  <span className="text-white font-medium">Resultado Líquido</span>
                  <span className={`font-bold text-lg ${
                    totais.resultadoLiquido >= 0 ? 'text-green-400' : 'text-red-400'
                  }`}>
                    {formatarValor(totais.resultadoLiquido)}
                  </span>
                </div>
                
                <div className="flex items-center justify-between p-4 bg-white/5 border border-white/10 rounded-xl mt-2">
                  <span className="text-white font-medium">Margem</span>
                  <span className={`font-bold text-lg ${
                    totais.margem >= 0 ? 'text-green-400' : 'text-red-400'
                  }`}>
                    {totais.margem.toFixed(2)}%
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Seção de Receitas */}
        <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6 mb-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-green-400" />
              Receitas ({formData.receitas.length})
            </h2>
            <button
              onClick={adicionarReceita}
              className="flex items-center gap-2 px-4 py-2 bg-green-500/20 hover:bg-green-500/30 border border-green-500/30 rounded-xl transition-all text-green-400 hover:text-green-300"
            >
              <Plus className="w-4 h-4" />
              Adicionar Receita
            </button>
          </div>
          
          <div className="space-y-4">
            {formData.receitas.map((receita, index) => (
              <div key={index} className="p-4 bg-green-500/10 border border-green-500/20 rounded-xl">
                <div className="grid grid-cols-1 md:grid-cols-6 gap-4 items-end">
                  <div className="md:col-span-2">
                    <label className="text-sm font-semibold text-white/80 block mb-2">Descrição</label>
                    <input
                      type="text"
                      value={receita.descricao}
                      onChange={(e) => atualizarReceita(index, 'descricao', e.target.value)}
                      className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all text-white placeholder-white/50 backdrop-blur-md text-sm"
                      placeholder="Descrição da receita"
                    />
                  </div>
                  
                  <div>
                    <label className="text-sm font-semibold text-white/80 block mb-2">Categoria</label>
                    <select
                      value={receita.categoria}
                      onChange={(e) => atualizarReceita(index, 'categoria', e.target.value)}
                      className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all text-white backdrop-blur-md text-sm"
                    >
                      <option value="venda">Venda</option>
                      <option value="servico">Serviço</option>
                      <option value="outro">Outro</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="text-sm font-semibold text-white/80 block mb-2">Quantidade</label>
                    <input
                      type="number"
                      value={receita.quantidade}
                      onChange={(e) => atualizarReceita(index, 'quantidade', parseFloat(e.target.value) || 0)}
                      className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all text-white backdrop-blur-md text-sm"
                      min="0"
                      step="0.01"
                    />
                  </div>
                  
                  <div>
                    <label className="text-sm font-semibold text-white/80 block mb-2">Preço Unitário</label>
                    <input
                      type="number"
                      value={receita.precoUnitario}
                      onChange={(e) => {
                        const preco = parseFloat(e.target.value) || 0;
                        const quantidade = receita.quantidade || 0;
                        atualizarReceita(index, 'precoUnitario', preco);
                        atualizarReceita(index, 'valor', preco * quantidade);
                      }}
                      className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all text-white backdrop-blur-md text-sm"
                      min="0"
                      step="0.01"
                    />
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <div className="flex-1">
                      <label className="text-sm font-semibold text-white/80 block mb-2">Valor Total</label>
                      <input
                        type="number"
                        value={receita.valor}
                        onChange={(e) => atualizarReceita(index, 'valor', parseFloat(e.target.value) || 0)}
                        className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all text-white backdrop-blur-md text-sm"
                        min="0"
                        step="0.01"
                      />
                    </div>
                    <button
                      onClick={() => removerReceita(index)}
                      className="p-2 text-red-400 hover:bg-red-500/20 rounded-lg transition-all"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
            
            {formData.receitas.length === 0 && (
              <div className="text-center py-8">
                <p className="text-white/60">Nenhuma receita cadastrada</p>
                <p className="text-white/40 text-sm">Clique em "Adicionar Receita" para começar</p>
              </div>
            )}
          </div>
        </div>

        {/* Seção de Custos */}
        <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6 mb-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <TrendingDown className="w-5 h-5 text-red-400" />
              Custos ({formData.custos.length})
            </h2>
            <button
              onClick={adicionarCusto}
              className="flex items-center gap-2 px-4 py-2 bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 rounded-xl transition-all text-red-400 hover:text-red-300"
            >
              <Plus className="w-4 h-4" />
              Adicionar Custo
            </button>
          </div>
          
          <div className="space-y-4">
            {formData.custos.map((custo, index) => (
              <div key={index} className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl">
                <div className="grid grid-cols-1 md:grid-cols-6 gap-4 items-end">
                  <div className="md:col-span-2">
                    <label className="text-sm font-semibold text-white/80 block mb-2">Descrição</label>
                    <input
                      type="text"
                      value={custo.descricao}
                      onChange={(e) => atualizarCusto(index, 'descricao', e.target.value)}
                      className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all text-white placeholder-white/50 backdrop-blur-md text-sm"
                      placeholder="Descrição do custo"
                    />
                  </div>
                  
                  <div>
                    <label className="text-sm font-semibold text-white/80 block mb-2">Tipo</label>
                    <select
                      value={custo.tipo}
                      onChange={(e) => atualizarCusto(index, 'tipo', e.target.value)}
                      className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all text-white backdrop-blur-md text-sm"
                    >
                      <option value="material">Material</option>
                      <option value="servico">Serviço</option>
                      <option value="pessoal">Pessoal</option>
                      <option value="fixo">Fixo</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="text-sm font-semibold text-white/80 block mb-2">Quantidade</label>
                    <input
                      type="number"
                      value={custo.quantidade}
                      onChange={(e) => atualizarCusto(index, 'quantidade', parseFloat(e.target.value) || 0)}
                      className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all text-white backdrop-blur-md text-sm"
                      min="0"
                      step="0.01"
                    />
                  </div>
                  
                  <div>
                    <label className="text-sm font-semibold text-white/80 block mb-2">Preço Unitário</label>
                    <input
                      type="number"
                      value={custo.precoUnitario}
                      onChange={(e) => {
                        const preco = parseFloat(e.target.value) || 0;
                        const quantidade = custo.quantidade || 0;
                        atualizarCusto(index, 'precoUnitario', preco);
                        atualizarCusto(index, 'valor', preco * quantidade);
                      }}
                      className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all text-white backdrop-blur-md text-sm"
                      min="0"
                      step="0.01"
                    />
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <div className="flex-1">
                      <label className="text-sm font-semibold text-white/80 block mb-2">Valor Total</label>
                      <input
                        type="number"
                        value={custo.valor}
                        onChange={(e) => atualizarCusto(index, 'valor', parseFloat(e.target.value) || 0)}
                        className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all text-white backdrop-blur-md text-sm"
                        min="0"
                        step="0.01"
                      />
                    </div>
                    <button
                      onClick={() => removerCusto(index)}
                      className="p-2 text-red-400 hover:bg-red-500/20 rounded-lg transition-all"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
            
            {formData.custos.length === 0 && (
              <div className="text-center py-8">
                <p className="text-white/60">Nenhum custo cadastrado</p>
                <p className="text-white/40 text-sm">Clique em "Adicionar Custo" para começar</p>
              </div>
            )}
          </div>
        </div>

        {/* Seção de Ativos */}
        <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-blue-400" />
              Ativos ({formData.ativos.length})
            </h2>
            <button
              onClick={adicionarAtivo}
              className="flex items-center gap-2 px-4 py-2 bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/30 rounded-xl transition-all text-blue-400 hover:text-blue-300"
            >
              <Plus className="w-4 h-4" />
              Adicionar Ativo
            </button>
          </div>
          
          <div className="space-y-4">
            {formData.ativos.map((ativo, index) => (
              <div key={index} className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl">
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
                  <div>
                    <label className="text-sm font-semibold text-white/80 block mb-2">Nome</label>
                    <input
                      type="text"
                      value={ativo.nome}
                      onChange={(e) => atualizarAtivo(index, 'nome', e.target.value)}
                      className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-white placeholder-white/50 backdrop-blur-md text-sm"
                      placeholder="Nome do ativo"
                    />
                  </div>
                  
                  <div>
                    <label className="text-sm font-semibold text-white/80 block mb-2">Tipo</label>
                    <select
                      value={ativo.tipo}
                      onChange={(e) => atualizarAtivo(index, 'tipo', e.target.value)}
                      className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-white backdrop-blur-md text-sm"
                    >
                      <option value="equipamento">Equipamento</option>
                      <option value="veiculo">Veículo</option>
                      <option value="imovel">Imóvel</option>
                      <option value="outro">Outro</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="text-sm font-semibold text-white/80 block mb-2">Valor</label>
                    <input
                      type="number"
                      value={ativo.valor}
                      onChange={(e) => atualizarAtivo(index, 'valor', parseFloat(e.target.value) || 0)}
                      className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-white backdrop-blur-md text-sm"
                      min="0"
                      step="0.01"
                    />
                  </div>
                  
                  <div>
                    <label className="text-sm font-semibold text-white/80 block mb-2">Vida Útil (anos)</label>
                    <input
                      type="number"
                      value={ativo.vidaUtil}
                      onChange={(e) => atualizarAtivo(index, 'vidaUtil', parseInt(e.target.value) || 0)}
                      className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-white backdrop-blur-md text-sm"
                      min="1"
                    />
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <div className="flex-1">
                      <label className="text-sm font-semibold text-white/80 block mb-2">Descrição</label>
                      <input
                        type="text"
                        value={ativo.descricao}
                        onChange={(e) => atualizarAtivo(index, 'descricao', e.target.value)}
                        className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-white placeholder-white/50 backdrop-blur-md text-sm"
                        placeholder="Descrição do ativo"
                      />
                    </div>
                    <button
                      onClick={() => removerAtivo(index)}
                      className="p-2 text-red-400 hover:bg-red-500/20 rounded-lg transition-all"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
            
            {formData.ativos.length === 0 && (
              <div className="text-center py-8">
                <p className="text-white/60">Nenhum ativo cadastrado</p>
                <p className="text-white/40 text-sm">Clique em "Adicionar Ativo" para começar</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default EditarOrcamento;
