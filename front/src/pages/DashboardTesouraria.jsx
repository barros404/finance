import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Plus, Search, Wallet, Download, Calendar, Eye, AlertCircle, TrendingUp, TrendingDown } from 'lucide-react';
import { tesourariaApi } from '../services/api';
import Layout from '../components/Layout';

const DashboardTesouraria = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [planos, setPlanos] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filtros, setFiltros] = useState({
    ano: new Date().getFullYear(),
    pagina: 1,
    limite: 10
  });
  const [paginacao, setPaginacao] = useState({
    totalItens: 0,
    totalPaginas: 0,
    paginaAtual: 1
  });
  const [fluxoCaixa, setFluxoCaixa] = useState({
    fluxoCaixa: [],
    resumo: {
      totalPlanos: 0,
      totalEntradas: 0,
      totalSaidas: 0,
      totalFinanciamentos: 0,
      saldoGeralLiquido: 0
    }
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

  // Carregar planos de tesouraria da API
  const carregarPlanos = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      console.log('🔄 Carregando planos de tesouraria com filtros:', filtros);
      const response = await tesourariaApi.listarPlanos(filtros);
      
      console.log('📥 Resposta da API de tesouraria:', response);
      
      if (response.success && response.data) {
        const { planos: listaPlanos, paginacao: dadosPaginacao } = response.data;
        
        // Processar os dados da API
        const planosProcessados = listaPlanos.map(plano => ({
          ...plano,
          statusFormatado: mapearStatus(plano.status),
          statusCor: corDoStatus(plano.status),
          criadoEmFormatado: new Date(plano.createdAt).toLocaleDateString('pt-AO'),
          mesFormatado: nomeMes(plano.mes || new Date().getMonth() + 1),
          // Calcular totais se houver dados relacionados
          totalEntradas: plano.entradas?.reduce((sum, entrada) => sum + parseFloat(entrada.valor || 0), 0) || 0,
          totalSaidas: plano.saidas?.reduce((sum, saida) => sum + parseFloat(saida.valor || 0), 0) || 0,
          totalFinanciamentos: plano.financiamentos?.reduce((sum, fin) => sum + parseFloat(fin.valor || 0), 0) || 0
        }));

        // Calcular saldo líquido para cada plano
        planosProcessados.forEach(plano => {
          plano.saldoLiquido = plano.totalEntradas - plano.totalSaidas + plano.totalFinanciamentos;
        });
        
        setPlanos(planosProcessados);
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
      console.error('❌ Erro ao carregar planos:', err);
      setError(`Erro ao carregar planos de tesouraria: ${err.message}`);
      setPlanos([]);
      setPaginacao({ totalItens: 0, totalPaginas: 0, paginaAtual: 1 });
    } finally {
      setIsLoading(false);
    }
  }, [filtros]);

  // Carregar fluxo de caixa
  const carregarFluxoCaixa = useCallback(async () => {
    try {
      console.log('🔄 Carregando fluxo de caixa...');
      const response = await tesourariaApi.obterFluxoCaixa({
        dataInicio: `${filtros.ano}-01-01`,
        dataFim: `${filtros.ano}-12-31`
      });
      
      console.log('📥 Resposta da API de fluxo de caixa:', response);
      
      if (response.success && response.data) {
        setFluxoCaixa(response.data);
        console.log('✅ Fluxo de caixa carregado:', response.data);
      }
    } catch (err) {
      console.error('❌ Erro ao carregar fluxo de caixa:', err);
      // Usar valores padrão em caso de erro
      setFluxoCaixa({
        fluxoCaixa: [],
        resumo: {
          totalPlanos: 0,
          totalEntradas: 0,
          totalSaidas: 0,
          totalFinanciamentos: 0,
          saldoGeralLiquido: 0
        }
      });
    }
  }, [filtros.ano]);

  // Carregar dados ao montar o componente
  useEffect(() => {
    carregarPlanos();
    carregarFluxoCaixa();
  }, [carregarPlanos, carregarFluxoCaixa]);

  // Verificar mensagem de sucesso da navegação
  useEffect(() => {
    if (location.state?.message) {
      console.log('✅ Mensagem de sucesso:', location.state.message);
      navigate(location.pathname, { replace: true });
    }
  }, [location.state, navigate, location.pathname]);

  const handleNovoPlano = () => {
    navigate('/formulario-plano-tesouraria');
  };

  const handleFiltrarStatus = (status) => {
    setFiltros(prev => ({ ...prev, status, pagina: 1 }));
  };

  const handleFiltrarAno = (ano) => {
    setFiltros(prev => ({ ...prev, ano: parseInt(ano), pagina: 1 }));
  };

  const handleVisualizarPlano = (planoId) => {
    navigate(`/tesouraria/${planoId}`);
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
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-[#0f0c29] via-[#302b63] to-[#24243e] text-white overflow-x-hidden">
        {/* Header */}
        <header className="bg-white/5 backdrop-blur-md border-b border-white/10 py-5 px-10 fixed w-full top-0 z-40 animate-slideDown">
          <div className="max-w-7xl mx-auto flex justify-between items-center">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-[#667eea] to-[#764ba2] rounded-xl flex items-center justify-center text-2xl shadow-lg shadow-[#667eea]/30">
                💰
              </div>
              <div className="flex flex-col">
                <h1 className="text-2xl font-bold bg-gradient-to-b from-white to-gray-200 bg-clip-text text-transparent">GESTÃO DE TESOURARIA</h1>
                <p className="text-xs text-white/60">Controle de fluxo de caixa e liquidez</p>
              </div>
            </div>
            
            <button
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#667eea] to-[#764ba2] text-white rounded-xl hover:from-[#5a67d8] hover:to-[#6b46c1] transition-all duration-300 shadow-lg shadow-[#667eea]/30 transform hover:scale-105 font-semibold"
              onClick={handleNovoPlano}
            >
              <Plus className="w-5 h-5" />
              Novo Plano
            </button>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto mt-28 px-10 pb-10">

          {/* Dashboard de Fluxo de Caixa */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6 transition-all hover:-translate-y-1 hover:bg-white/8 hover:shadow-2xl hover:shadow-black/30">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-white/80 mb-1">Total Entradas</p>
                  <p className="text-3xl font-bold bg-gradient-to-b from-white to-gray-200 bg-clip-text text-transparent">
                    {formatarValor(fluxoCaixa.resumo.totalEntradas)}
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
                  <p className="text-sm font-semibold text-white/80 mb-1">Total Saídas</p>
                  <p className="text-3xl font-bold bg-gradient-to-b from-white to-gray-200 bg-clip-text text-transparent">
                    {formatarValor(fluxoCaixa.resumo.totalSaidas)}
                  </p>
                  <p className="text-xs text-white/60 mt-1">Despesas previstas</p>
                </div>
                <div className="w-12 h-12 bg-gradient-to-br from-[#ef4444] to-[#dc2626] rounded-xl flex items-center justify-center text-2xl shadow-lg shadow-[#ef4444]/30">
                  <TrendingDown className="w-6 h-6" />
                </div>
              </div>
            </div>
            
            <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6 transition-all hover:-translate-y-1 hover:bg-white/8 hover:shadow-2xl hover:shadow-black/30">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-white/80 mb-1">Financiamentos</p>
                  <p className="text-3xl font-bold bg-gradient-to-b from-white to-gray-200 bg-clip-text text-transparent">
                    {formatarValor(fluxoCaixa.resumo.totalFinanciamentos)}
                  </p>
                  <p className="text-xs text-white/60 mt-1">Empréstimos e investimentos</p>
                </div>
                <div className="w-12 h-12 bg-gradient-to-br from-[#f59e0b] to-[#d97706] rounded-xl flex items-center justify-center text-2xl shadow-lg shadow-[#f59e0b]/30">
                  💼
                </div>
              </div>
            </div>
            
            <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6 transition-all hover:-translate-y-1 hover:bg-white/8 hover:shadow-2xl hover:shadow-black/30">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-white/80 mb-1">Saldo Líquido</p>
                  <p className={`text-3xl font-bold bg-gradient-to-b ${fluxoCaixa.resumo.saldoGeralLiquido >= 0 ? 'from-green-400 to-green-300' : 'from-red-400 to-red-300'} bg-clip-text text-transparent`}>
                    {formatarValor(fluxoCaixa.resumo.saldoGeralLiquido)}
                  </p>
                  <p className="text-xs text-white/60 mt-1">Resultado geral</p>
                </div>
                <div className={`w-12 h-12 bg-gradient-to-br ${fluxoCaixa.resumo.saldoGeralLiquido >= 0 ? 'from-[#10b981] to-[#059669]' : 'from-[#ef4444] to-[#dc2626]'} rounded-xl flex items-center justify-center text-2xl shadow-lg`}>
                  💰
                </div>
              </div>
            </div>
          </div>

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
                  <select
                    value={filtros.status}
                    onChange={(e) => handleFiltrarStatus(e.target.value)}
                    className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-all font-semibold text-white backdrop-blur-md text-sm"
                  >
                    <option value="">Todos os status</option>
                    <option value="rascunho">Rascunho</option>
                    <option value="em_analise">Em Análise</option>
                    <option value="aprovado">Aprovado</option>
                    <option value="ativo">Ativo</option>
                    <option value="concluido">Concluído</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="p-6">
              {isLoading && (
                <div className="flex justify-center items-center py-12">
                  <div className="w-8 h-8 border-4 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span className="ml-3 text-white/80">Carregando planos...</span>
                </div>
              )}

              {error && (
                <div className="p-4 bg-red-500/20 border border-red-500/30 rounded-xl backdrop-blur-md mb-6">
                  <div className="flex items-center">
                    <AlertCircle className="w-5 h-5 text-red-400 mr-2" />
                    <p className="text-red-200">{error}</p>
                  </div>
                </div>
              )}

              {!isLoading && !error && planos.length === 0 && (
                <div className="text-center py-16">
                  <div className="w-20 h-20 bg-white/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
                    <Wallet className="w-10 h-10 text-white/60" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">Nenhum plano encontrado</h3>
                  <p className="text-white/70 mb-6">
                    {filtros.status || filtros.ano !== new Date().getFullYear()
                      ? 'Tente ajustar os filtros de busca' 
                      : 'Crie seu primeiro plano de tesouraria para controlar o fluxo de caixa'
                    }
                  </p>
                  {!filtros.status && filtros.ano === new Date().getFullYear() && (
                    <button
                      onClick={handleNovoPlano}
                      className="px-6 py-3 bg-gradient-to-r from-[#667eea] to-[#764ba2] text-white rounded-xl hover:from-[#5a67d8] hover:to-[#6b46c1] transition-all duration-300 shadow-lg shadow-[#667eea]/30 transform hover:scale-105 font-semibold"
                    >
                      Criar Primeiro Plano
                    </button>
                  )}
                </div>
              )}

              {!isLoading && !error && planos.length > 0 && (
                <>
                  <div className="grid gap-4 mb-6">
                    {planos.map((plano) => (
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
        </main>

        {/* Footer */}
        <footer className="text-center py-10 text-white/40 text-sm border-t border-white/10 mt-16">
          <p>© 2025 FINANCE PRO - Sistema Integrado de Gestão Financeira</p>
          <p className="mt-1">Versão 2.0.1 | Última atualização: 18/09/2025</p>
        </footer>
      </div>
    </Layout>
  );
};

export default DashboardTesouraria;

