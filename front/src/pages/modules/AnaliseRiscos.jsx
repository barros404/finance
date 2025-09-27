import  { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AlertTriangle,
  AlertCircle,
  Shield,
  Target,
  Activity,
  DollarSign,
  TrendingUp,
  Database,
  Users,
  Building2,
  Filter,
  RefreshCw,
  CheckCircle,
  Grid,
  List,
  Calendar,
  Eye,
  Edit3,
  Search
} from "lucide-react";


const AnaliseRiscos = () => {
  const navigate = useNavigate();
  const [riscos, setRiscos] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filtros, setFiltros] = useState({
    categoria: 'todos',
    nivel: 'todos',
    status: 'todos',
    dataInicio: '',
    dataFim: '',
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
    totalRiscos: 0,
    riscosAtivos: 0,
    riscosMitigados: 0,
    riscosResolvidos: 0,
    riscosCriticos: 0,
    riscosAltos: 0
  });
  const [viewMode, setViewMode] = useState('grid');
  const [selectedRiscos, setSelectedRiscos] = useState([]);
  const [mostrarFiltros, setMostrarFiltros] = useState(false);

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

  const getIconeCategoria = (categoria) => {
    const icones = {
      operacional: <Activity className="w-5 h-5" />,
      financeiro: <DollarSign className="w-5 h-5" />,
      mercado: <TrendingUp className="w-5 h-5" />,
      compliance: <Shield className="w-5 h-5" />,
      tecnologico: <Database className="w-5 h-5" />,
      reputacional: <Users className="w-5 h-5" />,
      ambiental: <Building2 className="w-5 h-5" />
    };
    return icones[categoria] || <AlertTriangle className="w-5 h-5" />;
  };

  const getCorNivel = (nivel) => {
    const cores = {
      baixo: 'text-green-400 bg-green-500/20 border-green-500/30',
      medio: 'text-yellow-400 bg-yellow-500/20 border-yellow-500/30',
      alto: 'text-orange-400 bg-orange-500/20 border-orange-500/30',
      critico: 'text-red-400 bg-red-500/20 border-red-500/30'
    };
    return cores[nivel] || 'text-gray-400 bg-gray-500/20 border-gray-500/30';
  };

  const getNomeNivel = (nivel) => {
    const nomes = {
      baixo: 'Baixo',
      medio: 'Médio',
      alto: 'Alto',
      critico: 'Crítico'
    };
    return nomes[nivel] || 'Desconhecido';
  };

  const getCorStatus = (status) => {
    const cores = {
      ativo: 'text-red-400 bg-red-500/20 border-red-500/30',
      mitigado: 'text-yellow-400 bg-yellow-500/20 border-yellow-500/30',
      resolvido: 'text-green-400 bg-green-500/20 border-green-500/30'
    };
    return cores[status] || 'text-gray-400 bg-gray-500/20 border-gray-500/30';
  };

  const getNomeStatus = (status) => {
    const nomes = {
      ativo: 'Ativo',
      mitigado: 'Mitigado',
      resolvido: 'Resolvido'
    };
    return nomes[status] || 'Desconhecido';
  };

  // Carregar riscos
  const carregarRiscos = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      console.log('🔄 Carregando análise de riscos com filtros:', filtros);
      
      // Simular dados de riscos
      const riscosSimulados = [
        {
          id: 1,
          titulo: 'Variação Cambial',
          categoria: 'financeiro',
          nivel: 'alto',
          status: 'ativo',
          probabilidade: 75,
          impacto: 80,
          valorExposicao: 2500000,
          dataIdentificacao: '2024-01-15T10:30:00Z',
          dataUltimaAtualizacao: '2024-01-20T14:20:00Z',
          responsavel: 'Direção Financeira',
          descricao: 'Risco de variação cambial que pode impactar significativamente os custos operacionais',
          mitigacoes: [
            'Hedge cambial',
            'Diversificação de moedas',
            'Contratos de longo prazo'
          ],
          contingencia: 'Reserva de emergência de 10% do orçamento',
          tags: ['cambio', 'financeiro', 'externo']
        },
        {
          id: 2,
          titulo: 'Falha de Sistema',
          categoria: 'tecnologico',
          nivel: 'critico',
          status: 'mitigado',
          probabilidade: 30,
          impacto: 95,
          valorExposicao: 5000000,
          dataIdentificacao: '2024-01-10T09:15:00Z',
          dataUltimaAtualizacao: '2024-01-18T16:45:00Z',
          responsavel: 'TI',
          descricao: 'Risco de falha crítica do sistema principal que pode paralisar operações',
          mitigacoes: [
            'Backup automático',
            'Sistema redundante',
            'Monitoramento 24/7'
          ],
          contingencia: 'Plano de recuperação de desastres',
          tags: ['sistema', 'tecnologia', 'operacional']
        },
        {
          id: 3,
          titulo: 'Mudança Regulatória',
          categoria: 'compliance',
          nivel: 'medio',
          status: 'ativo',
          probabilidade: 60,
          impacto: 70,
          valorExposicao: 1500000,
          dataIdentificacao: '2024-01-12T11:30:00Z',
          dataUltimaAtualizacao: '2024-01-19T10:15:00Z',
          responsavel: 'Jurídico',
          descricao: 'Risco de mudanças regulatórias que podem exigir ajustes operacionais',
          mitigacoes: [
            'Monitoramento regulatório',
            'Consultoria jurídica',
            'Plano de adaptação'
          ],
          contingencia: 'Reserva para adequação regulatória',
          tags: ['regulacao', 'compliance', 'legal']
        },
        {
          id: 4,
          titulo: 'Flutuação de Preços',
          categoria: 'mercado',
          nivel: 'alto',
          status: 'ativo',
          probabilidade: 80,
          impacto: 65,
          valorExposicao: 3200000,
          dataIdentificacao: '2024-01-08T14:20:00Z',
          dataUltimaAtualizacao: '2024-01-17T09:30:00Z',
          responsavel: 'Comercial',
          descricao: 'Risco de flutuação nos preços de commodities que afetam os custos',
          mitigacoes: [
            'Contratos de fornecimento',
            'Diversificação de fornecedores',
            'Análise de mercado'
          ],
          contingencia: 'Reserva para variação de preços',
          tags: ['precos', 'mercado', 'commodities']
        },
        {
          id: 5,
          titulo: 'Perda de Talentos',
          categoria: 'operacional',
          nivel: 'medio',
          status: 'resolvido',
          probabilidade: 40,
          impacto: 55,
          valorExposicao: 800000,
          dataIdentificacao: '2024-01-05T16:45:00Z',
          dataUltimaAtualizacao: '2024-01-16T13:20:00Z',
          responsavel: 'RH',
          descricao: 'Risco de perda de funcionários-chave que podem impactar operações',
          mitigacoes: [
            'Programa de retenção',
            'Plano de sucessão',
            'Desenvolvimento interno'
          ],
          contingencia: 'Contratação emergencial',
          tags: ['rh', 'talentos', 'operacional']
        }
      ];

      // Aplicar filtros
      let riscosFiltrados = riscosSimulados;
      
      if (filtros.categoria !== 'todos') {
        riscosFiltrados = riscosFiltrados.filter(r => r.categoria === filtros.categoria);
      }
      
      if (filtros.nivel !== 'todos') {
        riscosFiltrados = riscosFiltrados.filter(r => r.nivel === filtros.nivel);
      }
      
      if (filtros.status !== 'todos') {
        riscosFiltrados = riscosFiltrados.filter(r => r.status === filtros.status);
      }
      
      if (filtros.busca) {
        riscosFiltrados = riscosFiltrados.filter(r => 
          r.titulo.toLowerCase().includes(filtros.busca.toLowerCase()) ||
          r.descricao.toLowerCase().includes(filtros.busca.toLowerCase()) ||
          r.tags.some(tag => tag.toLowerCase().includes(filtros.busca.toLowerCase()))
        );
      }

      // Paginação
      const inicio = (filtros.pagina - 1) * filtros.limite;
      const fim = inicio + filtros.limite;
      const riscosPaginados = riscosFiltrados.slice(inicio, fim);

      setRiscos(riscosPaginados);
      setPaginacao({
        totalItens: riscosFiltrados.length,
        totalPaginas: Math.ceil(riscosFiltrados.length / filtros.limite),
        paginaAtual: filtros.pagina
      });

      // Calcular estatísticas
      const stats = {
        totalRiscos: riscosSimulados.length,
        riscosAtivos: riscosSimulados.filter(r => r.status === 'ativo').length,
        riscosMitigados: riscosSimulados.filter(r => r.status === 'mitigado').length,
        riscosResolvidos: riscosSimulados.filter(r => r.status === 'resolvido').length,
        riscosCriticos: riscosSimulados.filter(r => r.nivel === 'critico').length,
        riscosAltos: riscosSimulados.filter(r => r.nivel === 'alto').length
      };
      setEstatisticas(stats);

      console.log('✅ Riscos carregados:', riscosPaginados);
    } catch (err) {
      console.error('❌ Erro ao carregar riscos:', err);
      setError(`Erro ao carregar riscos: ${err.message}`);
      setRiscos([]);
      setPaginacao({ totalItens: 0, totalPaginas: 0, paginaAtual: 1 });
    } finally {
      setIsLoading(false);
    }
  }, [filtros]);

  useEffect(() => {
    carregarRiscos();
  }, [carregarRiscos]);

  // Handlers
  const handleFiltrarCategoria = (categoria) => {
    setFiltros(prev => ({ ...prev, categoria, pagina: 1 }));
  };

  const handleFiltrarNivel = (nivel) => {
    setFiltros(prev => ({ ...prev, nivel, pagina: 1 }));
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

  const handleVisualizarRisco = (riscoId) => {
    console.log('👁️ Visualizando risco:', riscoId);
  };

  const handleEditarRisco = (riscoId) => {
    console.log('✏️ Editando risco:', riscoId);
  };

  const handleSelecionarRisco = (riscoId) => {
    setSelectedRiscos(prev => {
      if (prev.includes(riscoId)) {
        return prev.filter(id => id !== riscoId);
      } else {
        return [...prev, riscoId];
      }
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f0c29] via-[#302b63] to-[#24243e] text-white overflow-x-hidden">
      {/* Header */}
      <header className="bg-white/5 backdrop-blur-md border-b border-white/10 py-5 px-10 fixed w-full top-0 z-40 animate-slideDown">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-[#667eea] to-[#764ba2] rounded-xl flex items-center justify-center text-2xl shadow-lg shadow-[#667eea]/30">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div className="flex flex-col">
              <h1 className="text-2xl font-bold bg-gradient-to-b from-white to-gray-200 bg-clip-text text-transparent">ANÁLISE DE RISCOS</h1>
              <p className="text-xs text-white/60">Dashboard de riscos e contingências</p>
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
              onClick={carregarRiscos}
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6 transition-all hover:-translate-y-1 hover:bg-white/8 hover:shadow-2xl hover:shadow-black/30">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-white/80 mb-1">Total de Riscos</p>
                <p className="text-3xl font-bold bg-gradient-to-b from-white to-gray-200 bg-clip-text text-transparent">
                  {estatisticas.totalRiscos}
                </p>
                <p className="text-xs text-white/60 mt-1">Riscos identificados</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-[#667eea] to-[#764ba2] rounded-xl flex items-center justify-center text-2xl shadow-lg shadow-[#667eea]/30">
                <AlertTriangle className="w-6 h-6" />
              </div>
            </div>
          </div>
          
          <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6 transition-all hover:-translate-y-1 hover:bg-white/8 hover:shadow-2xl hover:shadow-black/30">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-white/80 mb-1">Riscos Ativos</p>
                <p className="text-3xl font-bold bg-gradient-to-b from-red-400 to-red-300 bg-clip-text text-transparent">
                  {estatisticas.riscosAtivos}
                </p>
                <p className="text-xs text-white/60 mt-1">Requerem atenção</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-[#ef4444] to-[#dc2626] rounded-xl flex items-center justify-center text-2xl shadow-lg shadow-[#ef4444]/30">
                <AlertCircle className="w-6 h-6" />
              </div>
            </div>
          </div>
          
          <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6 transition-all hover:-translate-y-1 hover:bg-white/8 hover:shadow-2xl hover:shadow-black/30">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-white/80 mb-1">Riscos Críticos</p>
                <p className="text-3xl font-bold bg-gradient-to-b from-orange-400 to-orange-300 bg-clip-text text-transparent">
                  {estatisticas.riscosCriticos}
                </p>
                <p className="text-xs text-white/60 mt-1">Prioridade máxima</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-[#f97316] to-[#ea580c] rounded-xl flex items-center justify-center text-2xl shadow-lg shadow-[#f97316]/30">
                <Shield className="w-6 h-6" />
              </div>
            </div>
          </div>
          
          <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6 transition-all hover:-translate-y-1 hover:bg-white/8 hover:shadow-2xl hover:shadow-black/30">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-white/80 mb-1">Riscos Altos</p>
                <p className="text-3xl font-bold bg-gradient-to-b from-yellow-400 to-yellow-300 bg-clip-text text-transparent">
                  {estatisticas.riscosAltos}
                </p>
                <p className="text-xs text-white/60 mt-1">Monitoramento intenso</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-[#eab308] to-[#ca8a04] rounded-xl flex items-center justify-center text-2xl shadow-lg shadow-[#eab308]/30">
                <Target className="w-6 h-6" />
              </div>
            </div>
          </div>
          
          <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6 transition-all hover:-translate-y-1 hover:bg-white/8 hover:shadow-2xl hover:shadow-black/30">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-white/80 mb-1">Mitigados</p>
                <p className="text-3xl font-bold bg-gradient-to-b from-blue-400 to-blue-300 bg-clip-text text-transparent">
                  {estatisticas.riscosMitigados}
                </p>
                <p className="text-xs text-white/60 mt-1">Controles implementados</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-[#3b82f6] to-[#1d4ed8] rounded-xl flex items-center justify-center text-2xl shadow-lg shadow-[#3b82f6]/30">
                <CheckCircle className="w-6 h-6" />
              </div>
            </div>
          </div>
          
          <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6 transition-all hover:-translate-y-1 hover:bg-white/8 hover:shadow-2xl hover:shadow-black/30">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-white/80 mb-1">Resolvidos</p>
                <p className="text-3xl font-bold bg-gradient-to-b from-green-400 to-green-300 bg-clip-text text-transparent">
                  {estatisticas.riscosResolvidos}
                </p>
                <p className="text-xs text-white/60 mt-1">Riscos eliminados</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-[#10b981] to-[#059669] rounded-xl flex items-center justify-center text-2xl shadow-lg shadow-[#10b981]/30">
                <Shield className="w-6 h-6" />
              </div>
            </div>
          </div>
        </div>

        {/* Filtros */}
        {mostrarFiltros && (
          <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6 mb-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-semibold text-white/80 mb-2">Categoria</label>
                <select
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-white"
                  value={filtros.categoria}
                  onChange={(e) => handleFiltrarCategoria(e.target.value)}
                >
                  <option value="todos">Todas as Categorias</option>
                  <option value="operacional">Operacional</option>
                  <option value="financeiro">Financeiro</option>
                  <option value="mercado">Mercado</option>
                  <option value="compliance">Compliance</option>
                  <option value="tecnologico">Tecnológico</option>
                  <option value="reputacional">Reputacional</option>
                  <option value="ambiental">Ambiental</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-white/80 mb-2">Nível</label>
                <select
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-white"
                  value={filtros.nivel}
                  onChange={(e) => handleFiltrarNivel(e.target.value)}
                >
                  <option value="todos">Todos os Níveis</option>
                  <option value="baixo">Baixo</option>
                  <option value="medio">Médio</option>
                  <option value="alto">Alto</option>
                  <option value="critico">Crítico</option>
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
                  <option value="ativo">Ativo</option>
                  <option value="mitigado">Mitigado</option>
                  <option value="resolvido">Resolvido</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-white/80 mb-2">Buscar</label>
                <div className="relative">
                  <input
                    type="text"
                    className="w-full px-4 py-3 pl-10 bg-white/5 border border-white/10 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-white placeholder-white/50"
                    placeholder="Buscar riscos..."
                    value={filtros.busca}
                    onChange={(e) => handleBuscar(e.target.value)}
                  />
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-white/50" />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Controles de Visualização */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-4">
            <h2 className="text-xl font-bold text-white">Riscos Identificados</h2>
            <span className="px-3 py-1 bg-white/10 text-white/80 rounded-full text-sm">
              {paginacao.totalItens} riscos
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
            
            {selectedRiscos.length > 0 && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-white/80">
                  {selectedRiscos.length} selecionados
                </span>
                <button className="px-3 py-1 bg-red-500/20 text-red-400 rounded-lg text-sm hover:bg-red-500/30 transition-all">
                  Remover
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Lista de Riscos */}
        {isLoading ? (
          <div className="flex justify-center items-center py-20">
            <RefreshCw className="w-8 h-8 animate-spin text-white/60" />
            <span className="ml-3 text-white/60">Carregando riscos...</span>
          </div>
        ) : riscos.length === 0 ? (
          <div className="text-center py-20">
            <AlertTriangle className="w-16 h-16 text-white/30 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white/60 mb-2">Nenhum risco encontrado</h3>
            <p className="text-white/40">Tente ajustar os filtros ou adicionar novos riscos</p>
          </div>
        ) : (
          <div className={`grid gap-6 ${
            viewMode === 'grid' 
              ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' 
              : 'grid-cols-1'
          }`}>
            {riscos.map(risco => (
              <div
                key={risco.id}
                className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6 transition-all hover:-translate-y-1 hover:bg-white/8 hover:shadow-2xl hover:shadow-black/30 group"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center">
                      {getIconeCategoria(risco.categoria)}
                    </div>
                    <div>
                      <h3 className="font-semibold text-white group-hover:text-blue-400 transition-colors">
                        {risco.titulo}
                      </h3>
                      <p className="text-xs text-white/60 capitalize">
                        {risco.categoria} • {risco.responsavel}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleSelecionarRisco(risco.id)}
                      className={`p-2 rounded-lg transition-all ${
                        selectedRiscos.includes(risco.id)
                          ? 'text-blue-400 bg-blue-500/20' 
                          : 'text-white/40 hover:text-blue-400'
                      }`}
                    >
                      <CheckCircle className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                
                <p className="text-sm text-white/70 mb-4 line-clamp-2">
                  {risco.descricao}
                </p>
                
                <div className="flex flex-wrap gap-2 mb-4">
                  {risco.tags.map(tag => (
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
                    <p className="text-xs text-white/60 mb-1">Probabilidade</p>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-white/10 rounded-full h-2">
                        <div 
                          className="bg-gradient-to-r from-blue-500 to-blue-400 h-2 rounded-full transition-all"
                          style={{ width: `${risco.probabilidade}%` }}
                        ></div>
                      </div>
                      <span className="text-xs text-white/80">{risco.probabilidade}%</span>
                    </div>
                  </div>
                  
                  <div>
                    <p className="text-xs text-white/60 mb-1">Impacto</p>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-white/10 rounded-full h-2">
                        <div 
                          className="bg-gradient-to-r from-red-500 to-red-400 h-2 rounded-full transition-all"
                          style={{ width: `${risco.impacto}%` }}
                        ></div>
                      </div>
                      <span className="text-xs text-white/80">{risco.impacto}%</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center justify-between text-xs text-white/60 mb-4">
                  <div className="flex items-center gap-4">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {formatarData(risco.dataIdentificacao)}
                    </span>
                    <span className="flex items-center gap-1">
                      <DollarSign className="w-3 h-3" />
                      {formatarValor(risco.valorExposicao)}
                    </span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getCorNivel(risco.nivel)}`}>
                      {getNomeNivel(risco.nivel)}
                    </span>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getCorStatus(risco.status)}`}>
                      {getNomeStatus(risco.status)}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleVisualizarRisco(risco.id)}
                      className="p-2 text-white/60 hover:text-white hover:bg-white/10 rounded-lg transition-all"
                      title="Visualizar"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    
                    <button
                      onClick={() => handleEditarRisco(risco.id)}
                      className="p-2 text-white/60 hover:text-white hover:bg-white/10 rounded-lg transition-all"
                      title="Editar"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
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

export default AnaliseRiscos;
