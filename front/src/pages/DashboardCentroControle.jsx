import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown,
  Users, 
  DollarSign, 
  Activity, 
  Shield, 
  Target, 
  Calendar, 
  Filter, 
  Search,
  RefreshCw,
  Eye,
  Edit3,
  CheckCircle,
  AlertCircle,
  
  Database,
  Grid,
  List,
 
  Monitor,
 
  Bell
} from 'lucide-react';

const DashboardCentroControle = () => {
  const navigate = useNavigate();
  const [indicadores, setIndicadores] = useState([]);
  const [atividades, setAtividades] = useState([]);
  const [alertas, setAlertas] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filtros, setFiltros] = useState({
    periodo: 'hoje',
    categoria: 'todos',
    status: 'todos',
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
    totalIndicadores: 0,
    indicadoresAtivos: 0,
    indicadoresCriticos: 0,
    alertasAtivos: 0,
    atividadesHoje: 0,
    sistemaOnline: true
  });
  const [viewMode, setViewMode] = useState('grid');
  const [selectedItems, setSelectedItems] = useState([]);
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
      financeiro: <DollarSign className="w-5 h-5" />,
      operacional: <Activity className="w-5 h-5" />,
      sistema: <Database className="w-5 h-5" />,
      usuarios: <Users className="w-5 h-5" />,
      seguranca: <Shield className="w-5 h-5" />,
      performance: <BarChart3 className="w-5 h-5" />
    };
    return icones[categoria] || <Target className="w-5 h-5" />;
  };

  const getCorStatus = (status) => {
    const cores = {
      ativo: 'text-green-400 bg-green-500/20 border-green-500/30',
      inativo: 'text-gray-400 bg-gray-500/20 border-gray-500/30',
      pendente: 'text-yellow-400 bg-yellow-500/20 border-yellow-500/30',
      critico: 'text-red-400 bg-red-500/20 border-red-500/30',
      aviso: 'text-orange-400 bg-orange-500/20 border-orange-500/30'
    };
    return cores[status] || 'text-gray-400 bg-gray-500/20 border-gray-500/30';
  };

  const getNomeStatus = (status) => {
    const nomes = {
      ativo: 'Ativo',
      inativo: 'Inativo',
      pendente: 'Pendente',
      critico: 'Crítico',
      aviso: 'Aviso'
    };
    return nomes[status] || 'Desconhecido';
  };

  // Carregar dados do centro de controle
  const carregarDados = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      console.log('🔄 Carregando dados do centro de controle:', filtros);
      
      // Simular dados de indicadores
      const indicadoresSimulados = [
        {
          id: 1,
          nome: 'Receita Total',
          categoria: 'financeiro',
          status: 'ativo',
          valor: 25000000,
          variacao: 12.5,
          tendencia: 'up',
          dataAtualizacao: '2024-01-20T10:30:00Z',
          responsavel: 'Direção Financeira',
          descricao: 'Receita total acumulada no período',
          meta: 30000000,
          unidade: 'AOA',
          tags: ['receita', 'financeiro', 'vendas']
        },
        {
          id: 2,
          nome: 'Usuários Ativos',
          categoria: 'usuarios',
          status: 'ativo',
          valor: 1250,
          variacao: 8.3,
          tendencia: 'up',
          dataAtualizacao: '2024-01-20T09:15:00Z',
          responsavel: 'TI',
          descricao: 'Número de usuários ativos no sistema',
          meta: 1500,
          unidade: 'usuários',
          tags: ['usuarios', 'sistema', 'ativo']
        },
        {
          id: 3,
          nome: 'Tempo de Resposta',
          categoria: 'sistema',
          status: 'critico',
          valor: 3.2,
          variacao: -15.8,
          tendencia: 'down',
          dataAtualizacao: '2024-01-20T11:45:00Z',
          responsavel: 'TI',
          descricao: 'Tempo médio de resposta do sistema',
          meta: 2.0,
          unidade: 'segundos',
          tags: ['performance', 'sistema', 'resposta']
        },
        {
          id: 4,
          nome: 'Documentos Processados',
          categoria: 'operacional',
          status: 'ativo',
          valor: 850,
          variacao: 25.7,
          tendencia: 'up',
          dataAtualizacao: '2024-01-20T14:20:00Z',
          responsavel: 'Operações',
          descricao: 'Documentos processados via OCR',
          meta: 1000,
          unidade: 'documentos',
          tags: ['documentos', 'ocr', 'processamento']
        },
        {
          id: 5,
          nome: 'Taxa de Erro',
          categoria: 'sistema',
          status: 'aviso',
          valor: 2.1,
          variacao: 5.2,
          tendencia: 'up',
          dataAtualizacao: '2024-01-20T13:30:00Z',
          responsavel: 'TI',
          descricao: 'Taxa de erro do sistema',
          meta: 1.0,
          unidade: '%',
          tags: ['erro', 'sistema', 'qualidade']
        }
      ];

      // Simular dados de atividades
      const atividadesSimuladas = [
        {
          id: 1,
          tipo: 'login',
          usuario: 'João Silva',
          acao: 'Login realizado',
          timestamp: '2024-01-20T15:30:00Z',
          status: 'sucesso',
          detalhes: 'Login realizado com sucesso'
        },
        {
          id: 2,
          tipo: 'upload',
          usuario: 'Maria Santos',
          acao: 'Upload de documento',
          timestamp: '2024-01-20T15:25:00Z',
          status: 'sucesso',
          detalhes: 'Documento orcamento_2024.pdf enviado'
        },
        {
          id: 3,
          tipo: 'erro',
          usuario: 'Sistema',
          acao: 'Erro de processamento',
          timestamp: '2024-01-20T15:20:00Z',
          status: 'erro',
          detalhes: 'Falha no processamento OCR do documento'
        },
        {
          id: 4,
          tipo: 'relatorio',
          usuario: 'Carlos Pereira',
          acao: 'Relatório gerado',
          timestamp: '2024-01-20T15:15:00Z',
          status: 'sucesso',
          detalhes: 'Relatório de orçamento mensal gerado'
        },
        {
          id: 5,
          tipo: 'configuracao',
          usuario: 'Admin',
          acao: 'Configuração alterada',
          timestamp: '2024-01-20T15:10:00Z',
          status: 'sucesso',
          detalhes: 'Configurações de segurança atualizadas'
        }
      ];

      // Simular dados de alertas
      const alertasSimulados = [
        {
          id: 1,
          tipo: 'critico',
          titulo: 'Tempo de Resposta Alto',
          descricao: 'O tempo de resposta do sistema está acima do limite aceitável',
          timestamp: '2024-01-20T15:00:00Z',
          status: 'ativo',
          prioridade: 'alta'
        },
        {
          id: 2,
          tipo: 'aviso',
          titulo: 'Taxa de Erro Aumentando',
          descricao: 'A taxa de erro do sistema está aumentando gradualmente',
          timestamp: '2024-01-20T14:45:00Z',
          status: 'ativo',
          prioridade: 'media'
        },
        {
          id: 3,
          tipo: 'info',
          titulo: 'Backup Concluído',
          descricao: 'Backup automático do sistema concluído com sucesso',
          timestamp: '2024-01-20T14:30:00Z',
          status: 'resolvido',
          prioridade: 'baixa'
        }
      ];

      // Aplicar filtros
      let indicadoresFiltrados = indicadoresSimulados;
      
      if (filtros.categoria !== 'todos') {
        indicadoresFiltrados = indicadoresFiltrados.filter(i => i.categoria === filtros.categoria);
      }
      
      if (filtros.status !== 'todos') {
        indicadoresFiltrados = indicadoresFiltrados.filter(i => i.status === filtros.status);
      }
      
      if (filtros.busca) {
        indicadoresFiltrados = indicadoresFiltrados.filter(i => 
          i.nome.toLowerCase().includes(filtros.busca.toLowerCase()) ||
          i.descricao.toLowerCase().includes(filtros.busca.toLowerCase()) ||
          i.tags.some(tag => tag.toLowerCase().includes(filtros.busca.toLowerCase()))
        );
      }

      // Paginação
      const inicio = (filtros.pagina - 1) * filtros.limite;
      const fim = inicio + filtros.limite;
      const indicadoresPaginados = indicadoresFiltrados.slice(inicio, fim);

      setIndicadores(indicadoresPaginados);
      setAtividades(atividadesSimuladas);
      setAlertas(alertasSimulados);
      setPaginacao({
        totalItens: indicadoresFiltrados.length,
        totalPaginas: Math.ceil(indicadoresFiltrados.length / filtros.limite),
        paginaAtual: filtros.pagina
      });

      // Calcular estatísticas
      const stats = {
        totalIndicadores: indicadoresSimulados.length,
        indicadoresAtivos: indicadoresSimulados.filter(i => i.status === 'ativo').length,
        indicadoresCriticos: indicadoresSimulados.filter(i => i.status === 'critico').length,
        alertasAtivos: alertasSimulados.filter(a => a.status === 'ativo').length,
        atividadesHoje: atividadesSimuladas.length,
        sistemaOnline: true
      };
      setEstatisticas(stats);

      console.log('✅ Dados do centro de controle carregados:', indicadoresPaginados);
    } catch (err) {
      console.error('❌ Erro ao carregar dados:', err);
      setError(`Erro ao carregar dados: ${err.message}`);
      setIndicadores([]);
      setPaginacao({ totalItens: 0, totalPaginas: 0, paginaAtual: 1 });
    } finally {
      setIsLoading(false);
    }
  }, [filtros]);

  useEffect(() => {
    carregarDados();
  }, [carregarDados]);

  // Handlers
  const handleFiltrarCategoria = (categoria) => {
    setFiltros(prev => ({ ...prev, categoria, pagina: 1 }));
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

  const handleVisualizarIndicador = (indicadorId) => {
    console.log('👁️ Visualizando indicador:', indicadorId);
  };

  const handleEditarIndicador = (indicadorId) => {
    console.log('✏️ Editando indicador:', indicadorId);
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
              <h1 className="text-2xl font-bold bg-gradient-to-b from-white to-gray-200 bg-clip-text text-transparent">CENTRO DE CONTROLE</h1>
              <p className="text-xs text-white/60">Dashboard principal do sistema</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-2 bg-white/10 rounded-xl">
              <div className={`w-2 h-2 rounded-full ${estatisticas.sistemaOnline ? 'bg-green-400' : 'bg-red-400'}`}></div>
              <span className="text-sm text-white/80">
                {estatisticas.sistemaOnline ? 'Online' : 'Offline'}
              </span>
            </div>
            
            <button
              onClick={() => setMostrarFiltros(!mostrarFiltros)}
              className="flex items-center gap-2 px-4 py-2 bg-white/10 text-white rounded-xl hover:bg-white/20 transition-all"
            >
              <Filter className="w-4 h-4" />
              Filtros
            </button>
            
            <button
              onClick={carregarDados}
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
                <p className="text-sm font-semibold text-white/80 mb-1">Total de Indicadores</p>
                <p className="text-3xl font-bold bg-gradient-to-b from-white to-gray-200 bg-clip-text text-transparent">
                  {estatisticas.totalIndicadores}
                </p>
                <p className="text-xs text-white/60 mt-1">Indicadores monitorados</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-[#667eea] to-[#764ba2] rounded-xl flex items-center justify-center text-2xl shadow-lg shadow-[#667eea]/30">
                <BarChart3 className="w-6 h-6" />
              </div>
            </div>
          </div>
          
          <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6 transition-all hover:-translate-y-1 hover:bg-white/8 hover:shadow-2xl hover:shadow-black/30">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-white/80 mb-1">Indicadores Ativos</p>
                <p className="text-3xl font-bold bg-gradient-to-b from-green-400 to-green-300 bg-clip-text text-transparent">
                  {estatisticas.indicadoresAtivos}
                </p>
                <p className="text-xs text-white/60 mt-1">Funcionando normalmente</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-[#10b981] to-[#059669] rounded-xl flex items-center justify-center text-2xl shadow-lg shadow-[#10b981]/30">
                <CheckCircle className="w-6 h-6" />
              </div>
            </div>
          </div>
          
          <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6 transition-all hover:-translate-y-1 hover:bg-white/8 hover:shadow-2xl hover:shadow-black/30">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-white/80 mb-1">Indicadores Críticos</p>
                <p className="text-3xl font-bold bg-gradient-to-b from-red-400 to-red-300 bg-clip-text text-transparent">
                  {estatisticas.indicadoresCriticos}
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
                <p className="text-sm font-semibold text-white/80 mb-1">Alertas Ativos</p>
                <p className="text-3xl font-bold bg-gradient-to-b from-orange-400 to-orange-300 bg-clip-text text-transparent">
                  {estatisticas.alertasAtivos}
                </p>
                <p className="text-xs text-white/60 mt-1">Alertas pendentes</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-[#f97316] to-[#ea580c] rounded-xl flex items-center justify-center text-2xl shadow-lg shadow-[#f97316]/30">
                <Bell className="w-6 h-6" />
              </div>
            </div>
          </div>
          
          <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6 transition-all hover:-translate-y-1 hover:bg-white/8 hover:shadow-2xl hover:shadow-black/30">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-white/80 mb-1">Atividades Hoje</p>
                <p className="text-3xl font-bold bg-gradient-to-b from-blue-400 to-blue-300 bg-clip-text text-transparent">
                  {estatisticas.atividadesHoje}
                </p>
                <p className="text-xs text-white/60 mt-1">Atividades registradas</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-[#3b82f6] to-[#1d4ed8] rounded-xl flex items-center justify-center text-2xl shadow-lg shadow-[#3b82f6]/30">
                <Activity className="w-6 h-6" />
              </div>
            </div>
          </div>
          
          <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6 transition-all hover:-translate-y-1 hover:bg-white/8 hover:shadow-2xl hover:shadow-black/30">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-white/80 mb-1">Status do Sistema</p>
                <p className={`text-3xl font-bold bg-gradient-to-b ${estatisticas.sistemaOnline ? 'from-green-400 to-green-300' : 'from-red-400 to-red-300'} bg-clip-text text-transparent`}>
                  {estatisticas.sistemaOnline ? 'Online' : 'Offline'}
                </p>
                <p className="text-xs text-white/60 mt-1">Sistema operacional</p>
              </div>
              <div className={`w-12 h-12 bg-gradient-to-br ${estatisticas.sistemaOnline ? 'from-[#10b981] to-[#059669]' : 'from-[#ef4444] to-[#dc2626]'} rounded-xl flex items-center justify-center text-2xl shadow-lg ${estatisticas.sistemaOnline ? 'shadow-[#10b981]/30' : 'shadow-[#ef4444]/30'}`}>
                <Monitor className="w-6 h-6" />
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
                  <option value="financeiro">Financeiro</option>
                  <option value="operacional">Operacional</option>
                  <option value="sistema">Sistema</option>
                  <option value="usuarios">Usuários</option>
                  <option value="seguranca">Segurança</option>
                  <option value="performance">Performance</option>
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
                  <option value="inativo">Inativo</option>
                  <option value="pendente">Pendente</option>
                  <option value="critico">Crítico</option>
                  <option value="aviso">Aviso</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-white/80 mb-2">Período</label>
                <select
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-white"
                  value={filtros.periodo}
                  onChange={(e) => setFiltros(prev => ({ ...prev, periodo: e.target.value }))}
                >
                  <option value="hoje">Hoje</option>
                  <option value="semana">Esta Semana</option>
                  <option value="mes">Este Mês</option>
                  <option value="trimestre">Este Trimestre</option>
                  <option value="ano">Este Ano</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-white/80 mb-2">Buscar</label>
                <div className="relative">
                  <input
                    type="text"
                    className="w-full px-4 py-3 pl-10 bg-white/5 border border-white/10 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-white placeholder-white/50"
                    placeholder="Buscar indicadores..."
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
            <h2 className="text-xl font-bold text-white">Indicadores de Performance</h2>
            <span className="px-3 py-1 bg-white/10 text-white/80 rounded-full text-sm">
              {paginacao.totalItens} indicadores
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
                  {selectedItems.length} selecionados
                </span>
                <button className="px-3 py-1 bg-red-500/20 text-red-400 rounded-lg text-sm hover:bg-red-500/30 transition-all">
                  Remover
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Lista de Indicadores */}
        {isLoading ? (
          <div className="flex justify-center items-center py-20">
            <RefreshCw className="w-8 h-8 animate-spin text-white/60" />
            <span className="ml-3 text-white/60">Carregando indicadores...</span>
          </div>
        ) : indicadores.length === 0 ? (
          <div className="text-center py-20">
            <BarChart3 className="w-16 h-16 text-white/30 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white/60 mb-2">Nenhum indicador encontrado</h3>
            <p className="text-white/40">Tente ajustar os filtros ou adicionar novos indicadores</p>
          </div>
        ) : (
          <div className={`grid gap-6 ${
            viewMode === 'grid' 
              ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' 
              : 'grid-cols-1'
          }`}>
            {indicadores.map(indicador => (
              <div
                key={indicador.id}
                className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6 transition-all hover:-translate-y-1 hover:bg-white/8 hover:shadow-2xl hover:shadow-black/30 group"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center">
                      {getIconeCategoria(indicador.categoria)}
                    </div>
                    <div>
                      <h3 className="font-semibold text-white group-hover:text-blue-400 transition-colors">
                        {indicador.nome}
                      </h3>
                      <p className="text-xs text-white/60 capitalize">
                        {indicador.categoria} • {indicador.responsavel}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleSelecionarItem(indicador.id)}
                      className={`p-2 rounded-lg transition-all ${
                        selectedItems.includes(indicador.id)
                          ? 'text-blue-400 bg-blue-500/20' 
                          : 'text-white/40 hover:text-blue-400'
                      }`}
                    >
                      <CheckCircle className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                
                <p className="text-sm text-white/70 mb-4 line-clamp-2">
                  {indicador.descricao}
                </p>
                
                <div className="flex flex-wrap gap-2 mb-4">
                  {indicador.tags.map(tag => (
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
                    <p className="text-xs text-white/60 mb-1">Valor Atual</p>
                    <p className="text-lg font-bold text-white">
                      {indicador.unidade === 'AOA' ? formatarValor(indicador.valor) : `${indicador.valor} ${indicador.unidade}`}
                    </p>
                  </div>
                  
                  <div>
                    <p className="text-xs text-white/60 mb-1">Variação</p>
                    <div className="flex items-center gap-1">
                      {indicador.tendencia === 'up' ? (
                        <TrendingUp className="w-4 h-4 text-green-400" />
                      ) : (
                        <TrendingDown className="w-4 h-4 text-red-400" />
                      )}
                      <span className={`text-sm font-semibold ${indicador.tendencia === 'up' ? 'text-green-400' : 'text-red-400'}`}>
                        {indicador.variacao > 0 ? '+' : ''}{indicador.variacao}%
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center justify-between text-xs text-white/60 mb-4">
                  <div className="flex items-center gap-4">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {formatarData(indicador.dataAtualizacao)}
                    </span>
                    <span className="flex items-center gap-1">
                      <Target className="w-3 h-3" />
                      Meta: {indicador.unidade === 'AOA' ? formatarValor(indicador.meta) : `${indicador.meta} ${indicador.unidade}`}
                    </span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getCorStatus(indicador.status)}`}>
                    {getNomeStatus(indicador.status)}
                  </span>
                  
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleVisualizarIndicador(indicador.id)}
                      className="p-2 text-white/60 hover:text-white hover:bg-white/10 rounded-lg transition-all"
                      title="Visualizar"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    
                    <button
                      onClick={() => handleEditarIndicador(indicador.id)}
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

export default DashboardCentroControle;
