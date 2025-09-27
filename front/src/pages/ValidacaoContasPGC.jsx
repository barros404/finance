import React, { useState, useEffect, useCallback } from 'react';
import api from '../services/api';

// Desestrutura os serviços necessários
const { validacaoContasService } = api;
import {
  Filter,
  RefreshCw,
  Shield,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Database,
  Target,
  TrendingUp,
  TrendingDown,
  Activity,
  Building2,
  Clock,
  Check,
  X,
  Eye,
  Calendar,
  User,
  Grid,
  List
} from 'lucide-react';

const ValidacaoContasPGC = () => {
  const [contasPGC, setContasPGC] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [filtros, setFiltros] = useState({
    classe: 'todos',
    status: 'todos',
    busca: '',
    pagina: 1,
    limite: 20
  });
  const [paginacao, setPaginacao] = useState({
    totalItens: 0,
    totalPaginas: 0,
    paginaAtual: 1
  });
  const [estatisticas, setEstatisticas] = useState({
    totalContas: 0,
    contasValidadas: 0,
    contasPendentes: 0,
    contasComErro: 0,
    conformidadeMedia: 0
  });
  const [viewMode, setViewMode] = useState('grid');
  const [selectedItems, setSelectedItems] = useState([]);
  const [mostrarFiltros, setMostrarFiltros] = useState(false);
  const [mostrarModalValidacao, setMostrarModalValidacao] = useState(false);
  const [contaSelecionada, setContaSelecionada] = useState(null);

  // Funções auxiliares
  const formatarValor = (valor) => {
    if (typeof valor !== 'number') return '0';
    return new Intl.NumberFormat('pt-AO', {
      style: 'currency',
      currency: 'AOA',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(valor);
  };

  const formatarData = (data) => {
    if (!data) return 'N/A';
    return new Date(data).toLocaleDateString('pt-AO', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getIconeClasse = (classe) => {
    const icones = {
      '1': <Building2 className="w-5 h-5" />,
      '2': <Building2 className="w-5 h-5" />,
      '3': <Building2 className="w-5 h-5" />,
      '4': <Building2 className="w-5 h-5" />,
      '5': <Building2 className="w-5 h-5" />,
      '6': <TrendingDown className="w-5 h-5" />,
      '7': <TrendingUp className="w-5 h-5" />,
      '8': <Activity className="w-5 h-5" />
    };
    return icones[classe] || <Database className="w-5 h-5" />;
  };

  const getCorStatus = (status) => {
    const cores = {
      validada: 'text-green-400 bg-green-500/20 border-green-500/30',
      pendente: 'text-yellow-400 bg-yellow-500/20 border-yellow-500/30',
      erro: 'text-red-400 bg-red-500/20 border-red-500/30',
      revisao: 'text-orange-400 bg-orange-500/20 border-orange-500/30'
    };
    return cores[status] || 'text-gray-400 bg-gray-500/20 border-gray-500/30';
  };

  const getNomeStatus = (status) => {
    const nomes = {
      validada: 'Validada',
      pendente: 'Pendente',
      erro: 'Com Erro',
      revisao: 'Em Revisão'
    };
    return nomes[status] || 'Desconhecido';
  };

  // Carregar estatísticas
  const carregarEstatisticas = useCallback(async () => {
    try {
      setCarregandoEstatisticas(true);
      const stats = await validacaoContasService.obterEstatisticas();
      setEstatisticas(stats);
    } catch (err) {
      console.error('Erro ao carregar estatísticas:', err);
      setError('Erro ao carregar estatísticas');
    } finally {
      setCarregandoEstatisticas(false);
    }
  }, []);

  // Carregar contas PGC
  const carregarContasPGC = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      console.log('🔄 Carregando contas PGC:', filtros);
      
      // Usar o serviço de validação de contas
      const response = await validacaoContasService.listarContas(filtros);
      setContasPGC(response.data);
      setPaginacao(response.pagination);
      
      // Carregar estatísticas
      await carregarEstatisticas();
      
      console.log('✅ Contas PGC carregadas:', response.data);
    } catch (err) {
      console.error('❌ Erro ao carregar contas PGC:', err);
      setError(`Erro ao carregar contas PGC: ${err.message}`);
      setContasPGC([]);
      setPaginacao({ totalItens: 0, totalPaginas: 0, paginaAtual: 1 });
    } finally {
      setIsLoading(false);
    }
  }, [filtros]);

  useEffect(() => {
    carregarContasPGC();
  }, [carregarContasPGC]);

  // Handlers
  const handleFiltrarClasse = (classe) => {
    setFiltros(prev => ({ ...prev, classe, pagina: 1 }));
  };

  const handleFiltrarStatus = (status) => {
    setFiltros(prev => ({ ...prev, status, pagina: 1 }));
  };

  const handleBuscar = (busca) => {
    setFiltros(prev => ({ ...prev, busca, pagina: 1 }));
  };

  const handleMudarPagina = (pagina) => {
    setFiltros(prev => ({ ...prev, pagina }));
  };

  const handleValidarConta = async (contaId) => {
    try {
      console.log('✅ Validando conta:', contaId);
      await validacaoContasService.validarConta(contaId, { 
        observacoes: 'Validada via sistema',
        status: 'validada'
      });
      setSuccess('Conta validada com sucesso!');
      setTimeout(() => setSuccess(null), 3000);
      await carregarContasPGC();
    } catch (err) {
      console.error('❌ Erro ao validar conta:', err);
      setError(`Erro ao validar conta: ${err.message}`);
    }
  };

  const handleRejeitarConta = async (contaId, motivo = '') => {
    try {
      console.log('❌ Rejeitando conta:', contaId, motivo);
      await validacaoContasService.validarConta(contaId, { 
        observacoes: motivo || 'Rejeitada via sistema',
        status: 'rejeitada'
      });
      setSuccess('Conta rejeitada com sucesso!');
      setTimeout(() => setSuccess(null), 3000);
      await carregarContasPGC();
    } catch (err) {
      console.error('❌ Erro ao rejeitar conta:', err);
      setError(`Erro ao rejeitar conta: ${err.message}`);
    }
  };

  const handleSelecionarItem = (itemId) => {
    setSelectedItems(prev => {
      if (prev.includes(itemId)) {
        return prev.filter(id => id !== itemId);
      } else {
        return [...prev, itemId];
      }
    });
  };

  const handleVisualizarConta = (conta) => {
    setContaSelecionada(conta);
    setMostrarModalValidacao(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f0c29] via-[#302b63] to-[#24243e] text-white overflow-x-hidden">
      {/* Header */}
      <header className="bg-white/5 backdrop-blur-md border-b border-white/10 py-5 px-10 fixed w-full top-0 z-40 animate-slideDown">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-[#667eea] to-[#764ba2] rounded-xl flex items-center justify-center text-2xl shadow-lg shadow-[#667eea]/30">
              <Shield className="w-6 h-6" />
            </div>
            <div className="flex flex-col">
              <h1 className="text-2xl font-bold bg-gradient-to-b from-white to-gray-200 bg-clip-text text-transparent">VALIDAÇÃO CONTAS PGC</h1>
              <p className="text-xs text-white/60">Validação e conformidade com PGC-AO</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMostrarFiltros(!mostrarFiltros)}
              className="flex items-center gap-2 px-4 py-2 bg-white/10 text-white rounded-xl hover:bg-white/20 transition-all"
            >
              <Filter className="w-4 h-4" />
              Filtros
            </button>
            
            <button
              onClick={() => {}}
              disabled={isLoading}
              className="flex items-center gap-2 px-4 py-2 bg-white/10 text-white rounded-xl hover:bg-white/20 transition-all disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
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
              <AlertTriangle className="w-5 h-5 text-red-400 mr-2" />
              <p className="text-red-200">{error}</p>
            </div>
          </div>
        )}

        {success && (
          <div className="mb-6 p-4 bg-green-500/20 border border-green-500/30 rounded-xl backdrop-blur-md animate-fadeIn">
            <div className="flex items-center">
              <CheckCircle className="w-5 h-5 text-green-400 mr-2" />
              <p className="text-green-200">{success}</p>
            </div>
          </div>
        )}

        {/* Cards de Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6 transition-all hover:-translate-y-1 hover:bg-white/8 hover:shadow-2xl hover:shadow-black/30">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-white/80 mb-1">Total Contas</p>
                <p className="text-3xl font-bold bg-gradient-to-b from-white to-gray-200 bg-clip-text text-transparent">
                  {estatisticas.totalContas}
                </p>
                <p className="text-xs text-white/60 mt-1">Contas PGC</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-[#667eea] to-[#764ba2] rounded-xl flex items-center justify-center text-2xl shadow-lg shadow-[#667eea]/30">
                <Database className="w-6 h-6" />
              </div>
            </div>
          </div>
          
          <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6 transition-all hover:-translate-y-1 hover:bg-white/8 hover:shadow-2xl hover:shadow-black/30">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-white/80 mb-1">Validadas</p>
                <p className="text-3xl font-bold bg-gradient-to-b from-green-400 to-green-300 bg-clip-text text-transparent">
                  {estatisticas.contasValidadas}
                </p>
                <p className="text-xs text-white/60 mt-1">Contas validadas</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-[#10b981] to-[#059669] rounded-xl flex items-center justify-center text-2xl shadow-lg shadow-[#10b981]/30">
                <CheckCircle className="w-6 h-6" />
              </div>
            </div>
          </div>
          
          <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6 transition-all hover:-translate-y-1 hover:bg-white/8 hover:shadow-2xl hover:shadow-black/30">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-white/80 mb-1">Pendentes</p>
                <p className="text-3xl font-bold bg-gradient-to-b from-yellow-400 to-yellow-300 bg-clip-text text-transparent">
                  {estatisticas.contasPendentes}
                </p>
                <p className="text-xs text-white/60 mt-1">Aguardando validação</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-[#f59e0b] to-[#d97706] rounded-xl flex items-center justify-center text-2xl shadow-lg shadow-[#f59e0b]/30">
                <Clock className="w-6 h-6" />
              </div>
            </div>
          </div>
          
          <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6 transition-all hover:-translate-y-1 hover:bg-white/8 hover:shadow-2xl hover:shadow-black/30">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-white/80 mb-1">Com Erro</p>
                <p className="text-3xl font-bold bg-gradient-to-b from-red-400 to-red-300 bg-clip-text text-transparent">
                  {estatisticas.contasComErro}
                </p>
                <p className="text-xs text-white/60 mt-1">Precisam correção</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-[#ef4444] to-[#dc2626] rounded-xl flex items-center justify-center text-2xl shadow-lg shadow-[#ef4444]/30">
                <XCircle className="w-6 h-6" />
              </div>
            </div>
          </div>
          
          <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6 transition-all hover:-translate-y-1 hover:bg-white/8 hover:shadow-2xl hover:shadow-black/30">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-white/80 mb-1">Conformidade</p>
                <p className="text-3xl font-bold bg-gradient-to-b from-blue-400 to-blue-300 bg-clip-text text-transparent">
                  {estatisticas.conformidadeMedia}%
                </p>
                <p className="text-xs text-white/60 mt-1">Média geral</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-[#3b82f6] to-[#1d4ed8] rounded-xl flex items-center justify-center text-2xl shadow-lg shadow-[#3b82f6]/30">
                <Target className="w-6 h-6" />
              </div>
            </div>
          </div>
        </div>

        {/* Filtros */}
        {mostrarFiltros && (
          <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6 mb-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-semibold text-white/80 mb-2">Classe PGC</label>
                <select
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-white"
                  value={filtros.classe}
                  onChange={(e) => handleFiltrarClasse(e.target.value)}
                >
                  <option value="todos">Todas as Classes</option>
                  <option value="1">Classe 1 - Financiamentos Próprios</option>
                  <option value="2">Classe 2 - Ativos Fixos</option>
                  <option value="3">Classe 3 - Ativos Correntes</option>
                  <option value="4">Classe 4 - Financiamentos Alheios</option>
                  <option value="5">Classe 5 - Capitais Próprios</option>
                  <option value="6">Classe 6 - Custos e Perdas</option>
                  <option value="7">Classe 7 - Proveitos e Ganhos</option>
                  <option value="8">Classe 8 - Contas de Gestão</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-white/80 mb-2">Status</label>
                <select
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-white"
                  value={filtros.status}
                  onChange={(e) => handleFiltrarStatus(e.target.value)}
                >
                  <option value="todos">Todos os Status</option>
                  <option value="validada">Validada</option>
                  <option value="pendente">Pendente</option>
                  <option value="erro">Com Erro</option>
                  <option value="revisao">Em Revisão</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-white/80 mb-2">Buscar</label>
                <div className="relative">
                  <input
                    type="text"
                    className="w-full px-4 py-3 pl-10 bg-white/5 border border-white/10 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-white placeholder-white/50"
                    placeholder="Buscar contas..."
                    value={filtros.busca}
                    onChange={(e) => handleBuscar(e.target.value)}
                  />
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-white/50" />
                </div>
              </div>
              
              <div className="flex items-end">
                <button
                  onClick={() => setFiltros({ classe: 'todos', status: 'todos', busca: '', pagina: 1, limite: 20 })}
                  className="w-full px-4 py-3 bg-white/10 text-white rounded-xl hover:bg-white/20 transition-all"
                >
                  Limpar Filtros
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Controles de Visualização */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-4">
            <h2 className="text-xl font-bold text-white">Contas PGC</h2>
            <span className="px-3 py-1 bg-white/10 text-white/80 rounded-full text-sm">
              {paginacao.totalItens} contas
            </span>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-white/10 rounded-xl p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-lg transition-all ${
                  viewMode === 'grid' 
                    ? 'bg-white/20 text-white' 
                    : 'text-white/60 hover:text-white'
                }`}
              >
                <Grid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-lg transition-all ${
                  viewMode === 'list' 
                    ? 'bg-white/20 text-white' 
                    : 'text-white/60 hover:text-white'
                }`}
              >
                <List className="w-4 h-4" />
              </button>
            </div>
            
            {selectedItems.length > 0 && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-white/80">
                  {selectedItems.length} selecionadas
                </span>
                <button className="px-3 py-1 bg-green-500/20 text-green-400 rounded-lg text-sm hover:bg-green-500/30 transition-all">
                  Validar Selecionadas
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Lista de Contas PGC */}
        {isLoading ? (
          <div className="flex justify-center items-center py-20">
            <RefreshCw className="w-8 h-8 animate-spin text-white/60" />
            <span className="ml-3 text-white/60">Carregando contas PGC...</span>
          </div>
        ) : contasPGC.length === 0 ? (
          <div className="text-center py-20">
            <Database className="w-16 h-16 text-white/30 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white/60 mb-2">Nenhuma conta encontrada</h3>
            <p className="text-white/40">Tente ajustar os filtros ou adicionar novas contas</p>
          </div>
        ) : (
          <div className={`grid gap-6 ${
            viewMode === 'grid' 
              ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' 
              : 'grid-cols-1'
          }`}>
            {contasPGC.map(conta => (
              <div
                key={conta.id}
                className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6 transition-all hover:-translate-y-1 hover:bg-white/8 hover:shadow-2xl hover:shadow-black/30 group"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center">
                      {getIconeClasse(conta.classe)}
                    </div>
                    <div>
                      <h3 className="font-semibold text-white group-hover:text-blue-400 transition-colors">
                        {conta.codigo} - {conta.nome}
                      </h3>
                      <p className="text-xs text-white/60 capitalize">
                        Classe {conta.classe} • {conta.tipo}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleSelecionarItem(conta.id)}
                      className={`p-2 rounded-lg transition-all ${
                        selectedItems.includes(conta.id)
                          ? 'text-blue-400 bg-blue-500/20' 
                          : 'text-white/40 hover:text-blue-400'
                      }`}
                    >
                      <CheckCircle className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                
                <p className="text-sm text-white/70 mb-4 line-clamp-2">
                  {conta.descricao}
                </p>
                
                <div className="flex flex-wrap gap-2 mb-4">
                  {conta.tags.map(tag => (
                    <span
                      key={tag}
                      className="px-2 py-1 bg-white/10 text-white/60 rounded-lg text-xs"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
                
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <p className="text-xs text-white/60 mb-1">Valor</p>
                    <p className="text-lg font-bold text-white">
                      {formatarValor(conta.valor)}
                    </p>
                  </div>
                  
                  <div>
                    <p className="text-xs text-white/60 mb-1">Conformidade</p>
                    <div className="flex items-center gap-2">
                      <div className="w-full bg-white/10 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full ${
                            conta.conformidade >= 90 ? 'bg-green-400' :
                            conta.conformidade >= 70 ? 'bg-yellow-400' : 'bg-red-400'
                          }`}
                          style={{ width: `${conta.conformidade}%` }}
                        ></div>
                      </div>
                      <span className="text-sm font-semibold text-white">
                        {conta.conformidade}%
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center justify-between text-xs text-white/60 mb-4">
                  <div className="flex items-center gap-4">
                    {conta.dataValidacao && (
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {formatarData(conta.dataValidacao)}
                      </span>
                    )}
                    {conta.validadoPor && (
                      <span className="flex items-center gap-1">
                        <User className="w-3 h-3" />
                        {conta.validadoPor}
                      </span>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getCorStatus(conta.status)}`}>
                    {getNomeStatus(conta.status)}
                  </span>
                  
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleVisualizarConta(conta)}
                      className="p-2 text-white/60 hover:text-white hover:bg-white/10 rounded-lg transition-all"
                      title="Visualizar"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    
                    {conta.status === 'pendente' && (
                      <>
                        <button
                          onClick={() => handleValidarConta(conta.id)}
                          className="p-2 text-green-400 hover:text-green-300 hover:bg-green-500/20 rounded-lg transition-all"
                          title="Validar"
                        >
                          <Check className="w-4 h-4" />
                        </button>
                        
                        <button
                          onClick={() => handleRejeitarConta(conta.id)}
                          className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/20 rounded-lg transition-all"
                          title="Rejeitar"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Paginação */}
        {paginacao.totalPaginas > 1 && (
          <div className="flex justify-center items-center gap-2 mt-8">
            <button
              onClick={() => handleMudarPagina(paginacao.paginaAtual - 1)}
              disabled={paginacao.paginaAtual === 1}
              className="px-4 py-2 bg-white/10 text-white rounded-xl hover:bg-white/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Anterior
            </button>
            
            {Array.from({ length: paginacao.totalPaginas }, (_, i) => i + 1).map(pagina => (
              <button
                key={pagina}
                onClick={() => handleMudarPagina(pagina)}
                className={`px-4 py-2 rounded-xl transition-all ${
                  pagina === paginacao.paginaAtual
                    ? 'bg-gradient-to-r from-[#667eea] to-[#764ba2] text-white'
                    : 'bg-white/10 text-white/60 hover:bg-white/20 hover:text-white'
                }`}
              >
                {pagina}
              </button>
            ))}
            
            <button
              onClick={() => handleMudarPagina(paginacao.paginaAtual + 1)}
              disabled={paginacao.paginaAtual === paginacao.totalPaginas}
              className="px-4 py-2 bg-white/10 text-white rounded-xl hover:bg-white/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Próxima
            </button>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="text-center py-10 text-white/40 text-sm border-t border-white/10 mt-16">
        <p>© 2025 FINANCE PRO - Sistema Integrado de Gestão Financeira</p>
        <p className="mt-1">Versão 2.0.1 | Última atualização: 18/09/2025</p>
      </footer>
    </div>
  );
};

export default ValidacaoContasPGC;