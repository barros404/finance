import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Percent,
  Calendar,
  Eye,
  Download,
  AlertCircle,
  CheckCircle,
  Wallet,
  BarChart3,
  PieChart,
  ArrowUpDown,
  Filter,
  Search,
  RefreshCw,
  Clock
} from 'lucide-react';
import { orcamentoApi, tesourariaApi } from '../../services/api.js';

const ExecucaoOrcamental = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [orcamentoAprovado, setOrcamentoAprovado] = useState(null);
  const [planosTesouraria, setPlanosTesouraria] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filtros, setFiltros] = useState({
    ano: new Date().getFullYear(),
    ordenacao: 'decrescente', // decrescente ou crescente
    pagina: 1,
    limite: 10
  });
  const [paginacao, setPaginacao] = useState({
    totalItens: 0,
    totalPaginas: 0,
    paginaAtual: 1
  });
  const [estatisticas, setEstatisticas] = useState({
    totalReceitas: 0,
    totalCustos: 0,
    resultadoLiquido: 0,
    margem: 0
  });
  const [atividadesRecentes, setAtividadesRecentes] = useState([]);

  // Função para formatar valores monetários
  const formatarValor = (valor) => {
    if (!valor && valor !== 0) return 'Kz 0,00';
    const numeroFormatado = parseFloat(valor).toLocaleString('pt-AO', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
    return `Kz ${numeroFormatado}`;
  };

  // Função para formatar percentual
  const formatarPercentual = (valor) => {
    if (!valor && valor !== 0) return '0,00%';
    return `${parseFloat(valor).toFixed(2)}%`;
  };

  // Função para mapear status da API para português
  const mapearStatus = (status) => {
    const statusMap = {
      'rascunho': 'Rascunho',
      'em_analise': 'Em Análise',
      'aprovado': 'Aprovado',
      'rejeitado': 'Rejeitado',
      'ativo': 'Ativo',
      'concluido': 'Concluído'
    };
    return statusMap[status] || status;
  };

  // Função para determinar cor do status
  const corDoStatus = (status) => {
    const cores = {
      'rascunho': 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
      'em_analise': 'bg-blue-500/20 text-blue-400 border-blue-500/30',
      'aprovado': 'bg-green-500/20 text-green-400 border-green-500/30',
      'rejeitado': 'bg-red-500/20 text-red-400 border-red-500/30',
      'ativo': 'bg-purple-500/20 text-purple-400 border-purple-500/30',
      'concluido': 'bg-gray-500/20 text-gray-400 border-gray-500/30'
    };
    return cores[status] || 'bg-white/10 text-white/80 border-white/20';
  };

  // Função para obter nome do mês
  const nomeMes = (numeroMes) => {
    const meses = [
      'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
      'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
    ];
    return meses[numeroMes - 1] || numeroMes;
  };

  // Função para obter ícone do tipo de atividade
  const getTipoIcon = (tipo) => {
    const icones = {
      'plano_criado': '📊',
      'plano_aprovado': '✅',
      'plano_rejeitado': '❌',
      'plano_analise': '⏳',
      'orcamento_criado': '📋',
      'orcamento_aprovado': '✅',
      'orcamento_rejeitado': '❌',
      'orcamento_analise': '⏳'
    };
    return icones[tipo] || '📝';
  };

  // Função para formatar tempo relativo
  const formatarTempo = (timestamp) => {
    const agora = new Date();
    const dataAtividade = new Date(timestamp);
    const diferencaMs = agora - dataAtividade;
    const diferencaMin = Math.floor(diferencaMs / (1000 * 60));
    const diferencaHoras = Math.floor(diferencaMin / 60);
    const diferencaDias = Math.floor(diferencaHoras / 24);

    if (diferencaMin < 1) return 'agora mesmo';
    if (diferencaMin < 60) return `${diferencaMin}min atrás`;
    if (diferencaHoras < 24) return `${diferencaHoras}h atrás`;
    if (diferencaDias < 7) return `${diferencaDias}d atrás`;

    return dataAtividade.toLocaleDateString('pt-AO');
  };

  // Função para obter cor do status da atividade
  const getStatusColor = (status) => {
    const cores = {
      'rascunho': 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
      'analise': 'bg-blue-500/20 text-blue-400 border-blue-500/30',
      'sucesso': 'bg-green-500/20 text-green-400 border-green-500/30',
      'erro': 'bg-red-500/20 text-red-400 border-red-500/30',
      'concluido': 'bg-gray-500/20 text-gray-400 border-gray-500/30'
    };
    return cores[status] || 'bg-white/10 text-white/80 border-white/20';
  };

  // Carregar orçamento aprovado
  const carregarOrcamentoAprovado = useCallback(async () => {
    try {
      console.log('🔄 Carregando orçamento aprovado...');
      const response = await orcamentoApi.obterOrcamentoAprovado({
        ano: filtros.ano
      });
      
      console.log('📥 Resposta da API de orçamento aprovado:', response);

      if ((response.status === 'success' || response.success) && response.data) {
        const orcamento = response.data;
        
        // Calcular estatísticas do orçamento
        const totalReceitas = orcamento.receitas?.reduce((sum, receita) => sum + parseFloat(receita.valor || 0), 0) || 0;
        const totalCustos = orcamento.custos?.reduce((sum, custo) => sum + parseFloat(custo.valor || 0), 0) || 0;
        const resultadoLiquido = totalReceitas - totalCustos;
        const margem = totalReceitas > 0 ? (resultadoLiquido / totalReceitas) * 100 : 0;

        setOrcamentoAprovado(orcamento);
        setEstatisticas({
          totalReceitas,
          totalCustos,
          resultadoLiquido,
          margem
        });
        
        console.log('✅ Orçamento aprovado carregado:', orcamento);
      } else {
        throw new Error('Nenhum orçamento aprovado encontrado');
      }
    } catch (err) {
      console.error('❌ Erro ao carregar orçamento aprovado:', err);
      setError(`Erro ao carregar orçamento aprovado: ${err.message}`);
      setOrcamentoAprovado(null);
    }
  }, [filtros.ano]);

  // Carregar planos de tesouraria do orçamento aprovado
  const carregarPlanosTesouraria = useCallback(async () => {
    if (!orcamentoAprovado) return;
    
    try {
      console.log('🔄 Carregando planos de tesouraria do orçamento...');
      const response = await tesourariaApi.listarPlanosPorOrcamento({
        orcamentoId: orcamentoAprovado.id,
        ordenacao: filtros.ordenacao,
        pagina: filtros.pagina,
        limite: filtros.limite
      });
      
      console.log('📥 Resposta da API de planos de tesouraria:', response);

      if ((response.status === 'success' || response.success) && response.data) {
        const { planos: listaPlanos, paginacao: dadosPaginacao } = response.data;
        
        // Processar os dados da API
        const planosProcessados = listaPlanos.map(plano => ({
          ...plano,
          statusFormatado: mapearStatus(plano.status),
          statusCor: corDoStatus(plano.status),
          criadoEmFormatado: new Date(plano.createdAt).toLocaleDateString('pt-AO'),
          mesFormatado: nomeMes(plano.mes || new Date().getMonth() + 1),
          // Calcular totais financeiros
          totalEntradas: plano.entradas?.reduce((sum, entrada) => sum + parseFloat(entrada.valor || 0), 0) || 0,
          totalSaidas: plano.saidas?.reduce((sum, saida) => sum + parseFloat(saida.valor || 0), 0) || 0,
          totalFinanciamentos: plano.financiamentos?.reduce((sum, fin) => sum + parseFloat(fin.valor || 0), 0) || 0
        }));

        // Calcular saldo líquido para cada plano
        planosProcessados.forEach(plano => {
          plano.saldoLiquido = plano.totalEntradas - plano.totalSaidas + plano.totalFinanciamentos;
        });
        
        setPlanosTesouraria(planosProcessados);
        setPaginacao({
          totalItens: dadosPaginacao?.totalItens || 0,
          totalPaginas: dadosPaginacao?.totalPaginas || 0,
          paginaAtual: dadosPaginacao?.paginaAtual || 1
        });
        
        console.log('✅ Planos de tesouraria carregados:', planosProcessados);
      } else {
        throw new Error('Formato de resposta inválido');
      }
    } catch (err) {
      console.error('❌ Erro ao carregar planos de tesouraria:', err);
      setError(`Erro ao carregar planos de tesouraria: ${err.message}`);
      setPlanosTesouraria([]);
      setPaginacao({ totalItens: 0, totalPaginas: 0, paginaAtual: 1 });
    }
  }, [orcamentoAprovado, filtros]);

  // Carregar dados ao montar o componente
  useEffect(() => {
    const carregarDados = async () => {
      setIsLoading(true);
      setError(null);

      try {
        await carregarOrcamentoAprovado();
      } catch (err) {
        console.error('❌ Erro ao carregar dados:', err);
      } finally {
        setIsLoading(false);
      }
    };

    carregarDados();
  }, [carregarOrcamentoAprovado]);

  // Carregar atividades recentes ao montar o componente
  useEffect(() => {
    carregarAtividadesRecentes();
  }, [carregarAtividadesRecentes]);

  // Carregar planos quando o orçamento for carregado
  useEffect(() => {
    if (orcamentoAprovado) {
      carregarPlanosTesouraria();
    }
  }, [carregarPlanosTesouraria]);

  // Carregar atividades recentes
  const carregarAtividadesRecentes = useCallback(async () => {
    try {
      console.log('🔄 Carregando atividades recentes...');
      const response = await tesourariaApi.obterAtividadesRecentes({
        limite: 8 // Limitar a 8 atividades para o dashboard
      });

      console.log('📥 Resposta da API de atividades recentes:', response);

      if ((response.status === 'success' || response.success) && response.data) {
        const { atividades } = response.data;
        setAtividadesRecentes(atividades);
        console.log('✅ Atividades recentes carregadas:', atividades);
      } else {
        throw new Error('Formato de resposta inválido');
      }
    } catch (err) {
      console.error('❌ Erro ao carregar atividades recentes:', err);
      setAtividadesRecentes([]);
    }
  }, []);

  // Verificar mensagem de sucesso da navegação
  useEffect(() => {
    if (location.state?.message) {
      console.log('✅ Mensagem de sucesso:', location.state.message);
      navigate(location.pathname, { replace: true });
    }
  }, [location.state, navigate, location.pathname]);

  const handleFiltrarAno = (ano) => {
    setFiltros(prev => ({ ...prev, ano: parseInt(ano), pagina: 1 }));
  };

  const handleAlterarOrdenacao = () => {
    setFiltros(prev => ({ 
      ...prev, 
      ordenacao: prev.ordenacao === 'decrescente' ? 'crescente' : 'decrescente',
      pagina: 1 
    }));
  };

  const handleVisualizarPlano = (planoId) => {
    navigate(`/tesouraria/${planoId}`, { 
      state: { 
        mostrarDetalhes: true,
        dadosFinanceiros: true 
      } 
    });
  };

  const handleBaixarPlano = async (planoId) => {
    try {
      console.log('📄 Baixando plano:', planoId);
      // Implementar export quando disponível na API
      alert('Funcionalidade de export em desenvolvimento');
    } catch (error) {
      console.error('❌ Erro ao baixar plano:', error);
      alert('Erro ao baixar o plano. Tente novamente.');
    }
  };

  const handleMudarPagina = (novaPagina) => {
    setFiltros(prev => ({ ...prev, pagina: novaPagina }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f0c29] via-[#302b63] to-[#24243e] text-white overflow-x-hidden">
      {/* Header */}
      <header className="bg-white/5 backdrop-blur-md border-b border-white/10 py-5 px-10 fixed w-full top-0 z-40 animate-slideDown">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-[#667eea] to-[#764ba2] rounded-xl flex items-center justify-center text-2xl shadow-lg shadow-[#667eea]/30">
              <BarChart3 className="w-6 h-6" />
            </div>
            <div className="flex flex-col">
              <h1 className="text-2xl font-bold bg-gradient-to-b from-white to-gray-200 bg-clip-text text-transparent">EXECUÇÃO ORÇAMENTAL</h1>
              <p className="text-xs text-white/60">Acompanhamento da execução do orçamento aprovado</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <button
              onClick={handleAlterarOrdenacao}
              className="flex items-center gap-2 px-4 py-2 bg-white/10 text-white rounded-xl hover:bg-white/20 transition-all"
              title={`Ordenar ${filtros.ordenacao === 'decrescente' ? 'crescente' : 'decrescente'}`}
            >
              <ArrowUpDown className="w-4 h-4" />
              {filtros.ordenacao === 'decrescente' ? 'Maior → Menor' : 'Menor → Maior'}
            </button>
            
            <button
              onClick={() => window.location.reload()}
              className="flex items-center gap-2 px-4 py-2 bg-white/10 text-white rounded-xl hover:bg-white/20 transition-all"
              title="Atualizar dados"
            >
              <RefreshCw className="w-4 h-4" />
              Atualizar
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto mt-28 px-10 pb-10">
        {/* Alertas */}
        {error && (
          <div className="mb-6 p-4 bg-red-500/20 border border-red-500/30 rounded-xl backdrop-blur-md animate-fadeIn">
            <div className="flex items-center">
              <AlertCircle className="w-5 h-5 text-red-400 mr-2" />
              <p className="text-red-200">{error}</p>
            </div>
          </div>
        )}

        {/* Dashboard de Estatísticas do Orçamento */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6 transition-all hover:-translate-y-1 hover:bg-white/8 hover:shadow-2xl hover:shadow-black/30">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-white/80 mb-1">Total Receitas</p>
                <p className="text-3xl font-bold bg-gradient-to-b from-green-400 to-green-300 bg-clip-text text-transparent">
                  {formatarValor(estatisticas.totalReceitas)}
                </p>
                <p className="text-xs text-white/60 mt-1">Receitas previstas</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-[#10b981] to-[#059669] rounded-xl flex items-center justify-center text-2xl shadow-lg shadow-[#10b981]/30">
                <TrendingUp className="w-6 h-6" />
              </div>
            </div>
          </div>
          
          <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6 transition-all hover:-translate-y-1 hover:bg-white/8 hover:shadow-2xl hover:shadow-black/30">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-white/80 mb-1">Total Custos</p>
                <p className="text-3xl font-bold bg-gradient-to-b from-red-400 to-red-300 bg-clip-text text-transparent">
                  {formatarValor(estatisticas.totalCustos)}
                </p>
                <p className="text-xs text-white/60 mt-1">Custos previstos</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-[#ef4444] to-[#dc2626] rounded-xl flex items-center justify-center text-2xl shadow-lg shadow-[#ef4444]/30">
                <TrendingDown className="w-6 h-6" />
              </div>
            </div>
          </div>
          
          <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6 transition-all hover:-translate-y-1 hover:bg-white/8 hover:shadow-2xl hover:shadow-black/30">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-white/80 mb-1">Resultado Líquido</p>
                <p className={`text-3xl font-bold bg-gradient-to-b ${estatisticas.resultadoLiquido >= 0 ? 'from-green-400 to-green-300' : 'from-red-400 to-red-300'} bg-clip-text text-transparent`}>
                  {formatarValor(estatisticas.resultadoLiquido)}
                </p>
                <p className="text-xs text-white/60 mt-1">Lucro/Prejuízo</p>
              </div>
              <div className={`w-12 h-12 bg-gradient-to-br ${estatisticas.resultadoLiquido >= 0 ? 'from-[#10b981] to-[#059669]' : 'from-[#ef4444] to-[#dc2626]'} rounded-xl flex items-center justify-center text-2xl shadow-lg`}>
                <DollarSign className="w-6 h-6" />
              </div>
            </div>
          </div>
          
          <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6 transition-all hover:-translate-y-1 hover:bg-white/8 hover:shadow-2xl hover:shadow-black/30">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-white/80 mb-1">Margem</p>
                <p className={`text-3xl font-bold bg-gradient-to-b ${estatisticas.margem >= 0 ? 'from-blue-400 to-blue-300' : 'from-red-400 to-red-300'} bg-clip-text text-transparent`}>
                  {formatarPercentual(estatisticas.margem)}
                </p>
                <p className="text-xs text-white/60 mt-1">Margem de lucro</p>
              </div>
              <div className={`w-12 h-12 bg-gradient-to-br ${estatisticas.margem >= 0 ? 'from-[#3b82f6] to-[#1d4ed8]' : 'from-[#ef4444] to-[#dc2626]'} rounded-xl flex items-center justify-center text-2xl shadow-lg`}>
                <Percent className="w-6 h-6" />
              </div>
            </div>
          </div>
        </div>

        {/* Informações do Orçamento Aprovado */}
        {orcamentoAprovado && (
          <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6 mb-8">
            <div className="flex items-center gap-3 mb-4">
              <CheckCircle className="w-6 h-6 text-green-400" />
              <h2 className="text-xl font-bold text-white">Orçamento Aprovado - {orcamentoAprovado.nome}</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <p className="text-white/60">Ano</p>
                <p className="font-bold text-white">{orcamentoAprovado.ano}</p>
              </div>
              <div>
                <p className="text-white/60">Status</p>
                <p className="font-bold text-green-400">Aprovado</p>
              </div>
              <div>
                <p className="text-white/60">Criado em</p>
                <p className="font-bold text-white">{new Date(orcamentoAprovado.createdAt).toLocaleDateString('pt-AO')}</p>
              </div>
            </div>
          </div>
        )}

        {/* Lista de Planos de Tesouraria */}
        <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl shadow-2xl shadow-black/30 overflow-hidden">
          <div className="p-6 border-b border-white/10 bg-gradient-to-r from-white/5 to-white/10">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <h2 className="text-xl font-bold text-white">Planos de Tesouraria</h2>
              <div className="flex flex-col md:flex-row gap-4">
                <select
                  value={filtros.ano}
                  onChange={(e) => handleFiltrarAno(e.target.value)}
                  className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-all font-semibold text-white backdrop-blur-md text-sm"
                >
                  <option value={new Date().getFullYear() - 1}>{new Date().getFullYear() - 1}</option>
                  <option value={new Date().getFullYear()}>{new Date().getFullYear()}</option>
                  <option value={new Date().getFullYear() + 1}>{new Date().getFullYear() + 1}</option>
                </select>
              </div>
            </div>
          </div>

          <div className="p-6">
            {isLoading && (
              <div className="flex justify-center items-center py-12">
                <div className="w-8 h-8 border-4 border-white/30 border-t-white rounded-full animate-spin"></div>
                <span className="ml-3 text-white/80">Carregando dados...</span>
              </div>
            )}

            {!isLoading && !error && planosTesouraria.length === 0 && (
              <div className="text-center py-16">
                <div className="w-20 h-20 bg-white/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <Wallet className="w-10 h-10 text-white/60" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Nenhum plano encontrado</h3>
                <p className="text-white/70 mb-6">
                  Não há planos de tesouraria associados ao orçamento aprovado para o ano selecionado
                </p>
              </div>
            )}

            {!isLoading && !error && planosTesouraria.length > 0 && (
              <>
                <div className="grid gap-4 mb-6">
                  {planosTesouraria.map((plano) => (
                    <div key={plano.id} className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6 hover:shadow-2xl hover:shadow-black/30 transition-all duration-300 transform hover:-translate-y-1 hover:bg-white/8 relative overflow-hidden group">
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent to-white/5 transform -translate-x-full group-hover:translate-x-full transition-transform duration-600"></div>
                      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 relative">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-3">
                            <h4 className="font-bold text-white text-lg">{plano.nome}</h4>
                            <span className={`inline-flex items-center px-3 py-1 rounded-xl text-xs font-semibold border ${plano.statusCor}`}>
                              {plano.statusFormatado}
                            </span>
                            <span className="inline-flex items-center px-2 py-1 rounded-lg text-xs font-medium bg-white/10 text-white/80">
                              {plano.mesFormatado} {plano.ano}
                            </span>
                          </div>
                          {plano.descricao && (
                            <p className="text-white/70 mb-3">{plano.descricao}</p>
                          )}
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                            <div>
                              <p className="text-white/60">Entradas</p>
                              <p className="font-bold text-green-400">{formatarValor(plano.totalEntradas)}</p>
                            </div>
                            <div>
                              <p className="text-white/60">Saídas</p>
                              <p className="font-bold text-red-400">{formatarValor(plano.totalSaidas)}</p>
                            </div>
                            <div>
                              <p className="text-white/60">Financiamentos</p>
                              <p className="font-bold text-yellow-400">{formatarValor(plano.totalFinanciamentos)}</p>
                            </div>
                            <div>
                              <p className="text-white/60">Saldo Líquido</p>
                              <p className={`font-bold ${plano.saldoLiquido >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                {formatarValor(plano.saldoLiquido)}
                              </p>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="text-right text-sm text-white/70">
                            <p>Criado em:</p>
                            <p className="font-medium text-white/90">{plano.criadoEmFormatado}</p>
                          </div>
                          <div className="flex gap-2">
                            <button 
                              onClick={() => handleVisualizarPlano(plano.id)}
                              className="p-2 text-white/70 hover:bg-white/10 rounded-xl transition-all" 
                              title="Visualizar"
                            >
                              <Eye className="w-5 h-5" />
                            </button>
                            <button 
                              onClick={() => handleBaixarPlano(plano.id)}
                              className="p-2 text-white/70 hover:bg-white/10 rounded-xl transition-all" 
                              title="Baixar"
                            >
                              <Download className="w-5 h-5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Paginação */}
                {paginacao.totalPaginas > 1 && (
                  <div className="flex justify-center items-center gap-2">
                    <button
                      onClick={() => handleMudarPagina(paginacao.paginaAtual - 1)}
                      disabled={paginacao.paginaAtual === 1}
                      className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-all font-semibold text-white backdrop-blur-md text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Anterior
                    </button>
                    
                    <span className="px-4 py-2 text-white/80 text-sm">
                      Página {paginacao.paginaAtual} de {paginacao.totalPaginas}
                    </span>
                    
                    <button
                      onClick={() => handleMudarPagina(paginacao.paginaAtual + 1)}
                      disabled={paginacao.paginaAtual === paginacao.totalPaginas}
                      className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-all font-semibold text-white backdrop-blur-md text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Próxima
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* Atividades Recentes */}
        <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-8 mt-8">
          <h3 className="text-xl font-semibold text-white mb-6 flex items-center gap-3">
            <Clock className="w-6 h-6 text-green-400" />
            Atividades Recentes
          </h3>
          <div className="space-y-4">
            {atividadesRecentes.length > 0 ? (
              atividadesRecentes.map((atividade) => (
                <div key={atividade.id} className="bg-white/5 border border-white/10 rounded-xl p-4 hover:bg-white/10 transition-all">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center text-lg">
                      {getTipoIcon(atividade.tipo)}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-white">{atividade.titulo}</h4>
                      <p className="text-white/60 text-sm">{atividade.descricao}</p>
                      <div className="flex items-center gap-4 mt-2 text-xs text-white/50">
                        <span>por {atividade.usuario}</span>
                        <span>•</span>
                        <span>{formatarTempo(atividade.timestamp)}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(atividade.status)}`}>
                        {atividade.status}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-white/60">
                <Clock className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Nenhuma atividade recente encontrada</p>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="text-center py-10 text-white/40 text-sm border-t border-white/10 mt-16">
        <p>© 2025 FINANCE PRO - Sistema Integrado de Gestão Financeira</p>
        <p className="mt-1">Versão 2.0.1 | Última atualização: 18/09/2025</p>
      </footer>
    </div>
  );
};

export default ExecucaoOrcamental;
