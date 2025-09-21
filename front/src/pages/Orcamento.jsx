import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Plus, Search, FileText, Download, Calendar, Eye, AlertCircle, Edit } from 'lucide-react';
import { orcamentoApi } from '../services/api';

const Orcamento = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [orcamentos, setOrcamentos] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filtros, setFiltros] = useState({
    busca: '',
    status: '',
    pagina: 1,
    limite: 10
  });
  const [paginacao, setPaginacao] = useState({
    totalItens: 0,
    totalPaginas: 0,
    paginaAtual: 1
  });
  const [estatisticas, setEstatisticas] = useState({
    totalOrcamentos: 0,
    estatisticasStatus: [],
    valoresPorAno: []
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
      'arquivado': 'Arquivado'
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
      'arquivado': 'bg-gray-500/20 text-gray-400 border-gray-500/30'
    };
    return cores[status] || 'bg-white/10 text-white/80 border-white/20';
  };

  // Carregar orçamentos da API
  const carregarOrcamentos = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      console.log('🔄 Carregando orçamentos com filtros:', filtros);
      const response = await orcamentoApi.listarOrcamentos(filtros);
      
      console.log('📥 Resposta da API de orçamentos:', response);
      console.log('O que vem do console',response)
      
      if (response.status=='success' && response.data) {
        const { orcamentos: listaOrcamentos, pagination: dadosPaginacao } = response.data;
        
        // Processar os dados da API
        const orcamentosProcessados = listaOrcamentos.map(orcamento => ({
          ...orcamento,
          statusFormatado: mapearStatus(orcamento.status),
          statusCor: corDoStatus(orcamento.status),
          valorFormatado: formatarValor(orcamento.totalReceita|| 0),
          criadoEmFormatado: new Date(orcamento.createdAt).toLocaleDateString('pt-AO'),
          ano: orcamento.ano || new Date(orcamento.createdAt).getFullYear()
        }));
        
        setOrcamentos(orcamentosProcessados);
        setPaginacao({
          totalItens: dadosPaginacao.totalItens,
          totalPaginas: dadosPaginacao.totalPaginas,
          paginaAtual: dadosPaginacao.paginaAtual
        });
        
        console.log('✅ Orçamentos carregados:', orcamentosProcessados);
      } else {
        throw new Error('Formato de resposta inválido');
      }
    } catch (err) {
      console.error('❌ Erro ao carregar orçamentos:', err);
      setError(`Erro ao carregar orçamentos: ${err.message}`);
      setOrcamentos([]);
      setPaginacao({ totalItens: 0, totalPaginas: 0, paginaAtual: 1 });
    } finally {
      setIsLoading(false);
    }
  }, [filtros]);

  // Carregar estatísticas
  const carregarEstatisticas = useCallback(async () => {
    try {
      console.log('🔄 Carregando estatísticas...');
      const response = await orcamentoApi.obterEstatisticas();
      
      console.log('📥 Resposta da API de estatísticas:', response);
      
      if (response.success && response.data) {
        setEstatisticas(response.data);
        console.log('✅ Estatísticas carregadas:', response.data);
      }
    } catch (err) {
      console.error('❌ Erro ao carregar estatísticas:', err);
      // Usar valores padrão em caso de erro
      setEstatisticas({
        totalOrcamentos: 0,
        estatisticasStatus: [],
        valoresPorAno: []
      });
    }
  }, []);

  // Carregar dados ao montar o componente
  useEffect(() => {
    carregarOrcamentos();
    carregarEstatisticas();
  }, [carregarOrcamentos, carregarEstatisticas]);

  // Verificar mensagem de sucesso da navegação
  useEffect(() => {
    if (location.state?.message) {
      console.log('✅ Mensagem de sucesso:', location.state.message);
      // Aqui você pode mostrar uma notificação de sucesso
      // Limpar o state após mostrar a mensagem
      navigate(location.pathname, { replace: true });
    }
  }, [location.state, navigate, location.pathname]);

  const handleNovoOrcamento = () => {
    navigate('/novo-orcamento');
  };

  const handleBuscar = (valor) => {
    setFiltros(prev => ({ ...prev, busca: valor, pagina: 1 }));
  };

  const handleFiltrarStatus = (status) => {
    setFiltros(prev => ({ ...prev, status, pagina: 1 }));
  };

  const handleVisualizarOrcamento = (orcamentoId) => {
    // Navegar para página de detalhes do orçamento
    navigate(`/orcamento/${orcamentoId}`);
  };

  const handleEditarOrcamento = (orcamentoId) => {
    // Navegar para página de edição do orçamento
    navigate(`/orcamento/${orcamentoId}/editar`);
  };

  const handleBaixarOrcamento = async (orcamentoId) => {
    try {
      console.log('📄 Baixando orçamento:', orcamentoId);
      const response = await orcamentoApi.exportarOrcamento(orcamentoId, 'pdf');
      
      // Criar link para download
      const blob = new Blob([response], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `orcamento-${orcamentoId}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      console.log('✅ Download concluído');
    } catch (error) {
      console.error('❌ Erro ao baixar orçamento:', error);
      alert('Erro ao baixar o orçamento. Tente novamente.');
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
              📋
            </div>
            <div className="flex flex-col">
              <h1 className="text-2xl font-bold bg-gradient-to-b from-white to-gray-200 bg-clip-text text-transparent">GESTÃO DE ORÇAMENTOS</h1>
              <p className="text-xs text-white/60">Controle completo dos seus planos financeiros</p>
            </div>
          </div>
          
          <button
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#667eea] to-[#764ba2] text-white rounded-xl hover:from-[#5a67d8] hover:to-[#6b46c1] transition-all duration-300 shadow-lg shadow-[#667eea]/30 transform hover:scale-105 font-semibold"
            onClick={handleNovoOrcamento}
          >
            <Plus className="w-5 h-5" />
            Novo Orçamento
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto mt-28 px-10 pb-10">

        {/* Dashboard de Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6 transition-all hover:-translate-y-1 hover:bg-white/8 hover:shadow-2xl hover:shadow-black/30">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-white/80 mb-1">Total de Orçamentos</p>
                <p className="text-3xl font-bold bg-gradient-to-b from-white to-gray-200 bg-clip-text text-transparent">
                  {estatisticas.totalOrcamentos || 0}
                </p>
                <p className="text-xs text-white/60 mt-1">Criados no sistema</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-[#667eea] to-[#764ba2] rounded-xl flex items-center justify-center text-2xl shadow-lg shadow-[#667eea]/30">
                📊
              </div>
            </div>
          </div>
          
          <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6 transition-all hover:-translate-y-1 hover:bg-white/8 hover:shadow-2xl hover:shadow-black/30">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-white/80 mb-1">Aprovados</p>
                <p className="text-3xl font-bold bg-gradient-to-b from-white to-gray-200 bg-clip-text text-transparent">
                  {estatisticas.estatisticasStatus?.find(s => s.status === 'aprovado')?.total || 0}
                </p>
                <p className="text-xs text-white/60 mt-1">Orçamentos aprovados</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-[#10b981] to-[#059669] rounded-xl flex items-center justify-center text-2xl shadow-lg shadow-[#10b981]/30">
                ✅
              </div>
            </div>
          </div>
          
          <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6 transition-all hover:-translate-y-1 hover:bg-white/8 hover:shadow-2xl hover:shadow-black/30">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-white/80 mb-1">Em Análise</p>
                <p className="text-3xl font-bold bg-gradient-to-b from-white to-gray-200 bg-clip-text text-transparent">
                  {estatisticas.estatisticasStatus?.find(s => s.status === 'em_analise')?.total || 0}
                </p>
                <p className="text-xs text-white/60 mt-1">Aguardando aprovação</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-[#f59e0b] to-[#d97706] rounded-xl flex items-center justify-center text-2xl shadow-lg shadow-[#f59e0b]/30">
                🔍
              </div>
            </div>
          </div>
          
          <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6 transition-all hover:-translate-y-1 hover:bg-white/8 hover:shadow-2xl hover:shadow-black/30">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-white/80 mb-1">Este Ano</p>
                <p className="text-3xl font-bold bg-gradient-to-b from-white to-gray-200 bg-clip-text text-transparent">
                  {estatisticas.valoresPorAno?.find(v => v.ano === new Date().getFullYear())?.total || 0}
                </p>
                <p className="text-xs text-white/60 mt-1">Orçamentos de {new Date().getFullYear()}</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-[#8b5cf6] to-[#7c3aed] rounded-xl flex items-center justify-center text-2xl shadow-lg shadow-[#8b5cf6]/30">
                📅
              </div>
            </div>
          </div>
        </div>

        {/* Lista de Orçamentos */}
        <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl shadow-2xl shadow-black/30 overflow-hidden">
          <div className="p-6 border-b border-white/10 bg-gradient-to-r from-white/5 to-white/10">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <h2 className="text-xl font-bold text-white">Meus Orçamentos</h2>
              <div className="flex flex-col md:flex-row gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/60 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Buscar orçamentos..."
                    value={filtros.busca}
                    onChange={(e) => handleBuscar(e.target.value)}
                    className="pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-xl focus:ring-2 focus:ring-[#667eea] focus:border-[#667eea] transition-all text-white placeholder-white/50 backdrop-blur-md text-sm"
                  />
                </div>
                <select
                  value={filtros.status}
                  onChange={(e) => handleFiltrarStatus(e.target.value)}
                  className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-all font-semibold text-gray-800 backdrop-blur-md text-sm"
                >
                  <option value="">Todos os status</option>
                  <option value="rascunho">Rascunho</option>
                  <option value="em_analise">Em Análise</option>
                  <option value="aprovado">Aprovado</option>
                  <option value="rejeitado">Rejeitado</option>
                  <option value="arquivado">Arquivado</option>
                </select>
              </div>
            </div>
          </div>

          <div className="p-6">
            {isLoading && (
              <div className="flex justify-center items-center py-12">
                <div className="w-8 h-8 border-4 border-white/30 border-t-white rounded-full animate-spin"></div>
                <span className="ml-3 text-white/80">Carregando orçamentos...</span>
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

            {!isLoading && !error && orcamentos.length === 0 && (
              <div className="text-center py-16">
                <div className="w-20 h-20 bg-white/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <FileText className="w-10 h-10 text-white/60" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Nenhum orçamento encontrado</h3>
                <p className="text-white/70 mb-6">
                  {filtros.busca || filtros.status 
                    ? 'Tente ajustar os filtros de busca' 
                    : 'Crie seu primeiro orçamento para começar a planejar suas finanças'
                  }
                </p>
                {!filtros.busca && !filtros.status && (
                  <button
                    onClick={handleNovoOrcamento}
                    className="px-6 py-3 bg-gradient-to-r from-[#667eea] to-[#764ba2] text-white rounded-xl hover:from-[#5a67d8] hover:to-[#6b46c1] transition-all duration-300 shadow-lg shadow-[#667eea]/30 transform hover:scale-105 font-semibold"
                  >
                    Criar Primeiro Orçamento
                  </button>
                )}
              </div>
            )}

            {!isLoading && !error && orcamentos.length > 0 && (
              <>
                <div className="grid gap-4 mb-6">
                  {orcamentos.map((orcamento) => (
                    <div key={orcamento.id} className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6 hover:shadow-2xl hover:shadow-black/30 transition-all duration-300 transform hover:-translate-y-1 hover:bg-white/8 relative overflow-hidden group">
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent to-white/5 transform -translate-x-full group-hover:translate-x-full transition-transform duration-600"></div>
                      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 relative">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-3">
                            <h4 className="font-bold text-white text-lg">{orcamento.nome}</h4>
                            <span className={`inline-flex items-center px-3 py-1 rounded-xl text-xs font-semibold border ${orcamento.statusCor}`}>
                              {orcamento.statusFormatado}
                            </span>
                            <span className="inline-flex items-center px-2 py-1 rounded-lg text-xs font-medium bg-white/10 text-white/80">
                              {orcamento.ano}
                            </span>
                          </div>
                          {orcamento.descricao && (
                            <p className="text-white/70 mb-3">{orcamento.descricao}</p>
                          )}
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                            <div>
                              <p className="text-white/60">Valor Total</p>
                              <p className="font-bold text-white">{orcamento.valorFormatado}</p>
                            </div>
                            <div>
                              <p className="text-white/60">Criado em</p>
                              <p className="font-bold text-white/90">{orcamento.criadoEmFormatado}</p>
                            </div>
                            <div>
                              <p className="text-white/60">Ano</p>
                              <p className="font-bold text-blue-400">{orcamento.ano}</p>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="flex gap-2">
                            <button 
                              onClick={() => handleVisualizarOrcamento(orcamento.id)}
                              className="p-2 text-white/70 hover:bg-white/10 rounded-xl transition-all" 
                              title="Visualizar"
                            >
                              <Eye className="w-5 h-5" />
                            </button>
                            {(orcamento.status !== 'arquivado' && orcamento.status !== 'aprovado') && (
                              <button 
                                onClick={() => handleEditarOrcamento(orcamento.id)}
                                className="p-2 text-white/70 hover:bg-white/10 rounded-xl transition-all" 
                                title="Editar"
                              >
                                <Edit className="w-5 h-5" />
                              </button>
                            )}
                            <button 
                              onClick={() => handleBaixarOrcamento(orcamento.id)}
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
  );
};

export default Orcamento;