import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Target,
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
  Clock,
  Activity,
  Check,
  X,
  AlertTriangle
} from 'lucide-react';
import { mockAprovacaoApi } from '../../services/mock/mockApi.js';

const PlanoExecucao = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [planosExecucao, setPlanosExecucao] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filtros, setFiltros] = useState({
    status: 'todos',
    periodo: 'todos',
    busca: '',
    pagina: 1,
    limite: 10
  });
  const [paginacao, setPaginacao] = useState({
    totalItens: 0,
    totalPaginas: 0,
    paginaAtual: 1
  });
  const [estatisticas, setEstatisticas] = useState({
    totalPlanos: 0,
    planosAtivos: 0,
    valorTotalExecutado: 0,
    percentualTotalExecutado: 0
  });
  const [mostrarFiltros, setMostrarFiltros] = useState(false);

  // Função para formatar valores monetários
  const formatarValor = (valor) => {
    if (!valor && valor !== 0) return 'Kz 0,00';
    const numeroFormatado = parseFloat(valor).toLocaleString('pt-AO', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
    return `Kz ${numeroFormatado}`;
  };

  // Função para formatar data
  const formatarData = (data) => {
    if (!data) return 'N/A';
    return new Date(data).toLocaleDateString('pt-AO', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  // Função para mapear status
  const mapearStatus = (status) => {
    const statusMap = {
      'pendente': 'Pendente',
      'aprovado': 'Aprovado',
      'rejeitado': 'Rejeitado',
      'em_execucao': 'Em Execução',
      'concluido': 'Concluído'
    };
    return statusMap[status] || 'Desconhecido';
  };

  // Função para obter cor do status
  const obterCorStatus = (status) => {
    const cores = {
      'pendente': 'text-yellow-400 bg-yellow-500/20 border-yellow-500/30',
      'aprovado': 'text-green-400 bg-green-500/20 border-green-500/30',
      'rejeitado': 'text-red-400 bg-red-500/20 border-red-500/30',
      'em_execucao': 'text-blue-400 bg-blue-500/20 border-blue-500/30',
      'concluido': 'text-purple-400 bg-purple-500/20 border-purple-500/30'
    };
    return cores[status] || 'text-gray-400 bg-gray-500/20 border-gray-500/30';
  };

  // Carregar planos em execução
  const carregarPlanosExecucao = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      console.log('🔄 Carregando planos em execução...');

      // Usar mock API para desenvolvimento
      const response = await mockAprovacaoApi.listarItensPendentes({ ...filtros, tipo: 'plano_execucao' });
      const planos = response.data;

      // Filtrar apenas planos de execução
      const planosFiltrados = planos.filter(item => item.tipo === 'plano_execucao');

      // Aplicar filtros adicionais
      let itensFiltrados = planosFiltrados;

      if (filtros.status !== 'todos') {
        itensFiltrados = itensFiltrados.filter(i => i.status === filtros.status);
      }

      if (filtros.busca) {
        itensFiltrados = itensFiltrados.filter(i =>
          i.nome.toLowerCase().includes(filtros.busca.toLowerCase()) ||
          i.descricao.toLowerCase().includes(filtros.busca.toLowerCase())
        );
      }

      // Paginação
      const inicio = (filtros.pagina - 1) * filtros.limite;
      const fim = inicio + filtros.limite;
      const itensPaginados = itensFiltrados.slice(inicio, fim);

      setPlanosExecucao(itensPaginados);
      setPaginacao({
        totalItens: itensFiltrados.length,
        totalPaginas: Math.ceil(itensFiltrados.length / filtros.limite),
        paginaAtual: filtros.pagina
      });

      // Calcular estatísticas
      const stats = {
        totalPlanos: planosFiltrados.length,
        planosAtivos: planosFiltrados.filter(p => p.status === 'aprovado' || p.status === 'em_execucao').length,
        valorTotalExecutado: planosFiltrados.reduce((total, plano) => total + (plano.valor || 0), 0),
        percentualTotalExecutado: 75.5 // Mock data
      };
      setEstatisticas(stats);

      console.log('✅ Planos em execução carregados:', itensPaginados);
    } catch (err) {
      console.error('❌ Erro ao carregar planos em execução:', err);
      setError(`Erro ao carregar planos em execução: ${err.message}`);
      setPlanosExecucao([]);
      setPaginacao({ totalItens: 0, totalPaginas: 0, paginaAtual: 1 });
    } finally {
      setIsLoading(false);
    }
  }, [filtros]);

  useEffect(() => {
    carregarPlanosExecucao();
  }, [carregarPlanosExecucao]);

  const handleVisualizarPlano = (plano) => {
    navigate(`/visualizar-plano-execucao/${plano.id}`, { state: { item: plano } });
  };

  const handleMudarPagina = (pagina) => {
    setFiltros(prev => ({ ...prev, pagina }));
  };

  const handleFiltroChange = (campo, valor) => {
    setFiltros(prev => ({ ...prev, [campo]: valor, pagina: 1 }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f0c29] via-[#302b63] to-[#24243e] text-white overflow-x-hidden">
      {/* Header */}
      <header className="bg-white/5 backdrop-blur-md border-b border-white/10 py-5 px-10 fixed w-full top-0 z-40 animate-slideDown">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center text-2xl shadow-lg shadow-orange-500/30">
              <Target className="w-6 h-6" />
            </div>
            <div className="flex flex-col">
              <h1 className="text-2xl font-bold bg-gradient-to-b from-white to-gray-200 bg-clip-text text-transparent">PLANO EM EXECUÇÃO</h1>
              <p className="text-xs text-white/60">Gestão e acompanhamento de planos de tesouraria</p>
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
              onClick={carregarPlanosExecucao}
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
              <AlertCircle className="w-5 h-5 text-red-400 mr-2" />
              <p className="text-red-200">{error}</p>
            </div>
          </div>
        )}

        {/* Cards de Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6 transition-all hover:-translate-y-1 hover:bg-white/8 hover:shadow-2xl hover:shadow-black/30">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-white/80 mb-1">Total de Planos</p>
                <p className="text-3xl font-bold bg-gradient-to-b from-white to-gray-200 bg-clip-text text-transparent">
                  {estatisticas.totalPlanos}
                </p>
                <p className="text-xs text-white/60 mt-1">Planos registrados</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center text-2xl shadow-lg shadow-orange-500/30">
                <Target className="w-6 h-6" />
              </div>
            </div>
          </div>

          <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6 transition-all hover:-translate-y-1 hover:bg-white/8 hover:shadow-2xl hover:shadow-black/30">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-white/80 mb-1">Planos Ativos</p>
                <p className="text-3xl font-bold bg-gradient-to-b from-white to-gray-200 bg-clip-text text-transparent">
                  {estatisticas.planosAtivos}
                </p>
                <p className="text-xs text-white/60 mt-1">Em execução ou aprovados</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center text-2xl shadow-lg shadow-green-500/30">
                <Activity className="w-6 h-6" />
              </div>
            </div>
          </div>

          <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6 transition-all hover:-translate-y-1 hover:bg-white/8 hover:shadow-2xl hover:shadow-black/30">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-white/80 mb-1">Valor Executado</p>
                <p className="text-2xl font-bold bg-gradient-to-b from-white to-gray-200 bg-clip-text text-transparent">
                  {formatarValor(estatisticas.valorTotalExecutado)}
                </p>
                <p className="text-xs text-white/60 mt-1">Total em execução</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center text-2xl shadow-lg shadow-blue-500/30">
                <DollarSign className="w-6 h-6" />
              </div>
            </div>
          </div>

          <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6 transition-all hover:-translate-y-1 hover:bg-white/8 hover:shadow-2xl hover:shadow-black/30">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-white/80 mb-1">Execução Geral</p>
                <p className="text-3xl font-bold bg-gradient-to-b from-white to-gray-200 bg-clip-text text-transparent">
                  {estatisticas.percentualTotalExecutado}%
                </p>
                <p className="text-xs text-white/60 mt-1">Percentual executado</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center text-2xl shadow-lg shadow-purple-500/30">
                <Percent className="w-6 h-6" />
              </div>
            </div>
          </div>
        </div>

        {/* Filtros */}
        {mostrarFiltros && (
          <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6 mb-6 animate-fadeIn">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">Status</label>
                <select
                  value={filtros.status}
                  onChange={(e) => handleFiltroChange('status', e.target.value)}
                  className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  <option value="todos">Todos os status</option>
                  <option value="pendente">Pendente</option>
                  <option value="aprovado">Aprovado</option>
                  <option value="rejeitado">Rejeitado</option>
                  <option value="em_execucao">Em Execução</option>
                  <option value="concluido">Concluído</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">Buscar</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/40 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Buscar por nome ou descrição..."
                    value={filtros.busca}
                    onChange={(e) => handleFiltroChange('busca', e.target.value)}
                    className="w-full pl-10 pr-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">Período</label>
                <select
                  value={filtros.periodo}
                  onChange={(e) => handleFiltroChange('periodo', e.target.value)}
                  className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  <option value="todos">Todos os períodos</option>
                  <option value="janeiro">Janeiro 2025</option>
                  <option value="fevereiro">Fevereiro 2025</option>
                  <option value="marco">Março 2025</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Lista de Planos em Execução */}
        <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl overflow-hidden">
          <div className="p-6 border-b border-white/10">
            <h2 className="text-xl font-bold text-white">Planos em Execução</h2>
            <p className="text-white/60 text-sm">Lista completa dos planos de tesouraria em execução</p>
          </div>

          {isLoading ? (
            <div className="p-8 text-center">
              <RefreshCw className="w-8 h-8 animate-spin text-white/40 mx-auto mb-4" />
              <p className="text-white/60">Carregando planos em execução...</p>
            </div>
          ) : planosExecucao.length === 0 ? (
            <div className="p-8 text-center">
              <Target className="w-12 h-12 text-white/20 mx-auto mb-4" />
              <p className="text-white/60">Nenhum plano em execução encontrado</p>
            </div>
          ) : (
            <div className="divide-y divide-white/10">
              {planosExecucao.map((plano) => (
                <div key={plano.id} className="p-6 hover:bg-white/5 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-white">{plano.nome}</h3>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium border ${obterCorStatus(plano.status)}`}>
                          {mapearStatus(plano.status)}
                        </span>
                      </div>

                      <p className="text-white/60 text-sm mb-3">{plano.descricao}</p>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                        <div className="flex items-center gap-2">
                          <DollarSign className="w-4 h-4 text-white/40" />
                          <span className="text-sm text-white/80">Valor: {formatarValor(plano.valor)}</span>
                        </div>

                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-white/40" />
                          <span className="text-sm text-white/80">Vencimento: {formatarData(plano.dataVencimento)}</span>
                        </div>

                        <div className="flex items-center gap-2">
                          <Wallet className="w-4 h-4 text-white/40" />
                          <span className="text-sm text-white/80">Criado por: {plano.criadoPor}</span>
                        </div>
                      </div>

                      {plano.acoes && plano.acoes.length > 0 && (
                        <div className="bg-white/5 rounded-lg p-3">
                          <p className="text-sm text-white/80 mb-2">Ações do plano:</p>
                          <div className="space-y-1">
                            {plano.acoes.slice(0, 3).map((acao, index) => (
                              <div key={index} className="flex items-center justify-between text-sm">
                                <span className="text-white/60">{acao.descricao}</span>
                                <span className={`px-2 py-1 rounded text-xs ${
                                  acao.status === 'concluido' ? 'bg-green-500/20 text-green-400' :
                                  acao.status === 'pendente' ? 'bg-yellow-500/20 text-yellow-400' :
                                  'bg-blue-500/20 text-blue-400'
                                }`}>
                                  {acao.status === 'concluido' ? 'Concluído' :
                                   acao.status === 'pendente' ? 'Pendente' : 'Em Andamento'}
                                </span>
                              </div>
                            ))}
                            {plano.acoes.length > 3 && (
                              <p className="text-xs text-white/40">+{plano.acoes.length - 3} ações adicionais</p>
                            )}
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-3 ml-6">
                      <button
                        onClick={() => handleVisualizarPlano(plano)}
                        className="flex items-center gap-2 px-4 py-2 bg-orange-500/20 text-orange-400 rounded-lg hover:bg-orange-500/30 transition-all"
                      >
                        <Eye className="w-4 h-4" />
                        Visualizar
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Paginação */}
        {paginacao.totalPaginas > 1 && (
          <div className="flex justify-center items-center gap-2 mt-8">
            <button
              onClick={() => handleMudarPagina(paginacao.paginaAtual - 1)}
              disabled={paginacao.paginaAtual === 1}
              className="px-3 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Anterior
            </button>

            {Array.from({ length: paginacao.totalPaginas }, (_, i) => i + 1).map((pagina) => (
              <button
                key={pagina}
                onClick={() => handleMudarPagina(pagina)}
                className={`px-3 py-2 rounded-lg transition-all ${
                  pagina === paginacao.paginaAtual
                    ? 'bg-orange-500 text-white'
                    : 'bg-white/10 text-white hover:bg-white/20'
                }`}
              >
                {pagina}
              </button>
            ))}

            <button
              onClick={() => handleMudarPagina(paginacao.paginaAtual + 1)}
              disabled={paginacao.paginaAtual === paginacao.totalPaginas}
              className="px-3 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Próximo
            </button>
          </div>
        )}
      </main>
    </div>
  );
};

export default PlanoExecucao;