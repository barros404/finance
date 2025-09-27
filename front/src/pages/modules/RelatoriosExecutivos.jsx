import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  BarChart3, 
  TrendingUp, 
  Download, 
  FileText, 
  Calendar, 
  Filter, 
  Search,
  RefreshCw,
  Eye,
  Share2,
  Archive,
  Clock,
  CheckCircle,
  AlertCircle,
  X,
  Plus,
  Settings,
  Database,
  FileSpreadsheet,
  FileImage,
  File,
  Users,
  DollarSign,
  Target,
  Activity,
  BookOpen,
  ClipboardList,
  BarChart2,
  LineChart,
  PieChart,
  TrendingDown,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  Zap,
  Star,
  Bookmark,
  Tag,
  Layers,
  Grid,
  List,
  Shield // <- este substitui o FileShield
} from 'lucide-react';
import { FaFilePdf as FilePdf } from "react-icons/fa";


const RelatoriosExecutivos = () => {
  const navigate = useNavigate();
  const [relatorios, setRelatorios] = useState([]);
  const [relatoriosBaixados, setRelatoriosBaixados] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filtros, setFiltros] = useState({
    categoria: 'todos', // orcamento, tesouraria, documentos, atividades, todos
    tipo: 'todos', // pdf, excel, csv, todos
    status: 'todos', // disponivel, baixado, processando, todos
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
    totalRelatorios: 0,
    relatoriosDisponiveis: 0,
    relatoriosBaixados: 0,
    relatoriosProcessando: 0,
    totalDownloads: 0,
    relatoriosFavoritos: 0
  });
  const [viewMode, setViewMode] = useState('grid'); // grid ou list
  const [selectedRelatorios, setSelectedRelatorios] = useState([]);
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

  const formatarTamanho = (bytes) => {
    if (!bytes) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getIconeCategoria = (categoria) => {
    const icones = {
      orcamento: <BarChart3 className="w-5 h-5" />,
      tesouraria: <DollarSign className="w-5 h-5" />,
      documentos: <FileText className="w-5 h-5" />,
      atividades: <Activity className="w-5 h-5" />,
      financeiro: <TrendingUp className="w-5 h-5" />,
      operacional: <Target className="w-5 h-5" />,
      gerencial: <Users className="w-5 h-5" />,
      compliance: <Shield className="w-5 h-5" />
    };
    return icones[categoria] || <FileText className="w-5 h-5" />;
  };

  const getIconeTipo = (tipo) => {
    const icones = {
      pdf: <FilePdf className="w-5 h-5" />,
      excel: <FileSpreadsheet className="w-5 h-5" />,
      csv: <FileText className="w-5 h-5" />,
      imagem: <FileImage className="w-5 h-5" />,
      documento: <File className="w-5 h-5" />
    };
    return icones[tipo] || <File className="w-5 h-5" />;
  };

  const getCorStatus = (status) => {
    const cores = {
      disponivel: 'text-green-400 bg-green-500/20 border-green-500/30',
      baixado: 'text-blue-400 bg-blue-500/20 border-blue-500/30',
      processando: 'text-yellow-400 bg-yellow-500/20 border-yellow-500/30',
      erro: 'text-red-400 bg-red-500/20 border-red-500/30',
      expirado: 'text-gray-400 bg-gray-500/20 border-gray-500/30'
    };
    return cores[status] || 'text-gray-400 bg-gray-500/20 border-gray-500/30';
  };

  const getNomeStatus = (status) => {
    const nomes = {
      disponivel: 'Disponível',
      baixado: 'Baixado',
      processando: 'Processando',
      erro: 'Erro',
      expirado: 'Expirado'
    };
    return nomes[status] || 'Desconhecido';
  };

  // Carregar relatórios
  const carregarRelatorios = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      console.log('🔄 Carregando relatórios executivos com filtros:', filtros);
      
      // Simular dados de relatórios (substituir por chamada real da API)
      const relatoriosSimulados = [
        {
          id: 1,
          nome: 'Relatório de Orçamento Anual 2024',
          categoria: 'orcamento',
          tipo: 'pdf',
          status: 'disponivel',
          tamanho: 2048576,
          dataCriacao: '2024-01-15T10:30:00Z',
          dataAtualizacao: '2024-01-15T10:30:00Z',
          downloads: 45,
          favorito: true,
          descricao: 'Relatório consolidado do orçamento anual com análise de receitas e despesas',
          tags: ['orçamento', 'anual', 'consolidado'],
          autor: 'Sistema Financeiro',
          versao: '1.0'
        },
        {
          id: 2,
          nome: 'Plano de Tesouraria - Janeiro 2024',
          categoria: 'tesouraria',
          tipo: 'excel',
          status: 'baixado',
          tamanho: 1024000,
          dataCriacao: '2024-01-10T14:20:00Z',
          dataAtualizacao: '2024-01-10T14:20:00Z',
          downloads: 23,
          favorito: false,
          descricao: 'Plano detalhado de tesouraria para o mês de janeiro',
          tags: ['tesouraria', 'mensal', 'fluxo de caixa'],
          autor: 'Tesouraria',
          versao: '1.2'
        },
        {
          id: 3,
          nome: 'Análise de Documentos Processados',
          categoria: 'documentos',
          tipo: 'csv',
          status: 'processando',
          tamanho: 512000,
          dataCriacao: '2024-01-20T09:15:00Z',
          dataAtualizacao: '2024-01-20T09:15:00Z',
          downloads: 0,
          favorito: false,
          descricao: 'Análise dos documentos processados pelo sistema OCR',
          tags: ['documentos', 'ocr', 'análise'],
          autor: 'Sistema OCR',
          versao: '0.8'
        },
        {
          id: 4,
          nome: 'Relatório de Atividades do Sistema',
          categoria: 'atividades',
          tipo: 'pdf',
          status: 'disponivel',
          tamanho: 1536000,
          dataCriacao: '2024-01-18T16:45:00Z',
          dataAtualizacao: '2024-01-18T16:45:00Z',
          downloads: 12,
          favorito: true,
          descricao: 'Relatório de todas as atividades realizadas no sistema',
          tags: ['atividades', 'sistema', 'auditoria'],
          autor: 'Sistema de Auditoria',
          versao: '2.1'
        },
        {
          id: 5,
          nome: 'Dashboard Financeiro Executivo',
          categoria: 'financeiro',
          tipo: 'excel',
          status: 'disponivel',
          tamanho: 3072000,
          dataCriacao: '2024-01-12T11:30:00Z',
          dataAtualizacao: '2024-01-12T11:30:00Z',
          downloads: 67,
          favorito: true,
          descricao: 'Dashboard executivo com indicadores financeiros principais',
          tags: ['financeiro', 'executivo', 'dashboard'],
          autor: 'Direção Financeira',
          versao: '3.0'
        }
      ];

      // Aplicar filtros
      let relatoriosFiltrados = relatoriosSimulados;
      
      if (filtros.categoria !== 'todos') {
        relatoriosFiltrados = relatoriosFiltrados.filter(r => r.categoria === filtros.categoria);
      }
      
      if (filtros.tipo !== 'todos') {
        relatoriosFiltrados = relatoriosFiltrados.filter(r => r.tipo === filtros.tipo);
      }
      
      if (filtros.status !== 'todos') {
        relatoriosFiltrados = relatoriosFiltrados.filter(r => r.status === filtros.status);
      }
      
      if (filtros.busca) {
        relatoriosFiltrados = relatoriosFiltrados.filter(r => 
          r.nome.toLowerCase().includes(filtros.busca.toLowerCase()) ||
          r.descricao.toLowerCase().includes(filtros.busca.toLowerCase()) ||
          r.tags.some(tag => tag.toLowerCase().includes(filtros.busca.toLowerCase()))
        );
      }

      // Paginação
      const inicio = (filtros.pagina - 1) * filtros.limite;
      const fim = inicio + filtros.limite;
      const relatoriosPaginados = relatoriosFiltrados.slice(inicio, fim);

      setRelatorios(relatoriosPaginados);
      setPaginacao({
        totalItens: relatoriosFiltrados.length,
        totalPaginas: Math.ceil(relatoriosFiltrados.length / filtros.limite),
        paginaAtual: filtros.pagina
      });

      // Calcular estatísticas
      const stats = {
        totalRelatorios: relatoriosSimulados.length,
        relatoriosDisponiveis: relatoriosSimulados.filter(r => r.status === 'disponivel').length,
        relatoriosBaixados: relatoriosSimulados.filter(r => r.status === 'baixado').length,
        relatoriosProcessando: relatoriosSimulados.filter(r => r.status === 'processando').length,
        totalDownloads: relatoriosSimulados.reduce((sum, r) => sum + r.downloads, 0),
        relatoriosFavoritos: relatoriosSimulados.filter(r => r.favorito).length
      };
      setEstatisticas(stats);

      console.log('✅ Relatórios carregados:', relatoriosPaginados);
    } catch (err) {
      console.error('❌ Erro ao carregar relatórios:', err);
      setError(`Erro ao carregar relatórios: ${err.message}`);
      setRelatorios([]);
      setPaginacao({ totalItens: 0, totalPaginas: 0, paginaAtual: 1 });
    } finally {
      setIsLoading(false);
    }
  }, [filtros]);

  // Carregar relatórios baixados
  const carregarRelatoriosBaixados = useCallback(async () => {
    try {
      // Simular dados de relatórios baixados
      const baixadosSimulados = [
        {
          id: 1,
          nome: 'Relatório de Orçamento Anual 2024',
          categoria: 'orcamento',
          tipo: 'pdf',
          dataDownload: '2024-01-15T10:30:00Z',
          tamanho: 2048576,
          localizacao: '/downloads/orcamento_2024.pdf'
        },
        {
          id: 2,
          nome: 'Plano de Tesouraria - Janeiro 2024',
          categoria: 'tesouraria',
          tipo: 'excel',
          dataDownload: '2024-01-10T14:20:00Z',
          tamanho: 1024000,
          localizacao: '/downloads/tesouraria_jan_2024.xlsx'
        }
      ];
      
      setRelatoriosBaixados(baixadosSimulados);
    } catch (err) {
      console.error('❌ Erro ao carregar relatórios baixados:', err);
    }
  }, []);

  useEffect(() => {
    carregarRelatorios();
    carregarRelatoriosBaixados();
  }, [carregarRelatorios, carregarRelatoriosBaixados]);

  // Handlers
  const handleFiltrarCategoria = (categoria) => {
    setFiltros(prev => ({ ...prev, categoria, pagina: 1 }));
  };

  const handleFiltrarTipo = (tipo) => {
    setFiltros(prev => ({ ...prev, tipo, pagina: 1 }));
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

  const handleDownloadRelatorio = async (relatorioId) => {
    try {
      console.log('📥 Baixando relatório:', relatorioId);
      // Implementar download real
      // await relatoriosApi.downloadRelatorio(relatorioId);
    } catch (err) {
      console.error('❌ Erro ao baixar relatório:', err);
      setError(`Erro ao baixar relatório: ${err.message}`);
    }
  };

  const handleVisualizarRelatorio = (relatorioId) => {
    console.log('👁️ Visualizando relatório:', relatorioId);
    // Implementar visualização
  };

  const handleCompartilharRelatorio = (relatorioId) => {
    console.log('📤 Compartilhando relatório:', relatorioId);
    // Implementar compartilhamento
  };

  const handleFavoritarRelatorio = (relatorioId) => {
    console.log('⭐ Favoritando relatório:', relatorioId);
    // Implementar favoritar
  };

  const handleSelecionarRelatorio = (relatorioId) => {
    setSelectedRelatorios(prev => {
      if (prev.includes(relatorioId)) {
        return prev.filter(id => id !== relatorioId);
      } else {
        return [...prev, relatorioId];
      }
    });
  };

  const handleSelecionarTodos = () => {
    if (selectedRelatorios.length === relatorios.length) {
      setSelectedRelatorios([]);
    } else {
      setSelectedRelatorios(relatorios.map(r => r.id));
    }
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
              <h1 className="text-2xl font-bold bg-gradient-to-b from-white to-gray-200 bg-clip-text text-transparent">RELATÓRIOS EXECUTIVOS</h1>
              <p className="text-xs text-white/60">Centro de relatórios e indicadores do sistema</p>
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
              onClick={carregarRelatorios}
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
                <p className="text-sm font-semibold text-white/80 mb-1">Total de Relatórios</p>
                <p className="text-3xl font-bold bg-gradient-to-b from-white to-gray-200 bg-clip-text text-transparent">
                  {estatisticas.totalRelatorios}
                </p>
                <p className="text-xs text-white/60 mt-1">Relatórios disponíveis</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-[#667eea] to-[#764ba2] rounded-xl flex items-center justify-center text-2xl shadow-lg shadow-[#667eea]/30">
                <FileText className="w-6 h-6" />
              </div>
            </div>
          </div>
          
          <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6 transition-all hover:-translate-y-1 hover:bg-white/8 hover:shadow-2xl hover:shadow-black/30">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-white/80 mb-1">Disponíveis</p>
                <p className="text-3xl font-bold bg-gradient-to-b from-green-400 to-green-300 bg-clip-text text-transparent">
                  {estatisticas.relatoriosDisponiveis}
                </p>
                <p className="text-xs text-white/60 mt-1">Prontos para download</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-[#10b981] to-[#059669] rounded-xl flex items-center justify-center text-2xl shadow-lg shadow-[#10b981]/30">
                <CheckCircle className="w-6 h-6" />
              </div>
            </div>
          </div>
          
          <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6 transition-all hover:-translate-y-1 hover:bg-white/8 hover:shadow-2xl hover:shadow-black/30">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-white/80 mb-1">Baixados</p>
                <p className="text-3xl font-bold bg-gradient-to-b from-blue-400 to-blue-300 bg-clip-text text-transparent">
                  {estatisticas.relatoriosBaixados}
                </p>
                <p className="text-xs text-white/60 mt-1">Relatórios baixados</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-[#3b82f6] to-[#1d4ed8] rounded-xl flex items-center justify-center text-2xl shadow-lg shadow-[#3b82f6]/30">
                <Download className="w-6 h-6" />
              </div>
            </div>
          </div>
          
          <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6 transition-all hover:-translate-y-1 hover:bg-white/8 hover:shadow-2xl hover:shadow-black/30">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-white/80 mb-1">Processando</p>
                <p className="text-3xl font-bold bg-gradient-to-b from-yellow-400 to-yellow-300 bg-clip-text text-transparent">
                  {estatisticas.relatoriosProcessando}
                </p>
                <p className="text-xs text-white/60 mt-1">Em processamento</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-[#f59e0b] to-[#d97706] rounded-xl flex items-center justify-center text-2xl shadow-lg shadow-[#f59e0b]/30">
                <Clock className="w-6 h-6" />
              </div>
            </div>
          </div>
          
          <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6 transition-all hover:-translate-y-1 hover:bg-white/8 hover:shadow-2xl hover:shadow-black/30">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-white/80 mb-1">Total Downloads</p>
                <p className="text-3xl font-bold bg-gradient-to-b from-purple-400 to-purple-300 bg-clip-text text-transparent">
                  {estatisticas.totalDownloads}
                </p>
                <p className="text-xs text-white/60 mt-1">Downloads realizados</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-[#8b5cf6] to-[#7c3aed] rounded-xl flex items-center justify-center text-2xl shadow-lg shadow-[#8b5cf6]/30">
                <TrendingUp className="w-6 h-6" />
              </div>
            </div>
          </div>
          
          <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6 transition-all hover:-translate-y-1 hover:bg-white/8 hover:shadow-2xl hover:shadow-black/30">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-white/80 mb-1">Favoritos</p>
                <p className="text-3xl font-bold bg-gradient-to-b from-pink-400 to-pink-300 bg-clip-text text-transparent">
                  {estatisticas.relatoriosFavoritos}
                </p>
                <p className="text-xs text-white/60 mt-1">Relatórios favoritos</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-[#ec4899] to-[#be185d] rounded-xl flex items-center justify-center text-2xl shadow-lg shadow-[#ec4899]/30">
                <Star className="w-6 h-6" />
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
                  <option value="orcamento">Orçamento</option>
                  <option value="tesouraria">Tesouraria</option>
                  <option value="documentos">Documentos</option>
                  <option value="atividades">Atividades</option>
                  <option value="financeiro">Financeiro</option>
                  <option value="operacional">Operacional</option>
                  <option value="gerencial">Gerencial</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-white/80 mb-2">Tipo</label>
                <select
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-white"
                  value={filtros.tipo}
                  onChange={(e) => handleFiltrarTipo(e.target.value)}
                >
                  <option value="todos">Todos os Tipos</option>
                  <option value="pdf">PDF</option>
                  <option value="excel">Excel</option>
                  <option value="csv">CSV</option>
                  <option value="imagem">Imagem</option>
                  <option value="documento">Documento</option>
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
                  <option value="disponivel">Disponível</option>
                  <option value="baixado">Baixado</option>
                  <option value="processando">Processando</option>
                  <option value="erro">Erro</option>
                  <option value="expirado">Expirado</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-white/80 mb-2">Buscar</label>
                <div className="relative">
                  <input
                    type="text"
                    className="w-full px-4 py-3 pl-10 bg-white/5 border border-white/10 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-white placeholder-white/50"
                    placeholder="Buscar relatórios..."
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
            <h2 className="text-xl font-bold text-white">Relatórios Disponíveis</h2>
            <span className="px-3 py-1 bg-white/10 text-white/80 rounded-full text-sm">
              {paginacao.totalItens} relatórios
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
            
            {selectedRelatorios.length > 0 && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-white/80">
                  {selectedRelatorios.length} selecionados
                </span>
                <button className="px-3 py-1 bg-red-500/20 text-red-400 rounded-lg text-sm hover:bg-red-500/30 transition-all">
                  Remover
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Lista de Relatórios */}
        {isLoading ? (
          <div className="flex justify-center items-center py-20">
            <RefreshCw className="w-8 h-8 animate-spin text-white/60" />
            <span className="ml-3 text-white/60">Carregando relatórios...</span>
          </div>
        ) : relatorios.length === 0 ? (
          <div className="text-center py-20">
            <FileText className="w-16 h-16 text-white/30 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white/60 mb-2">Nenhum relatório encontrado</h3>
            <p className="text-white/40">Tente ajustar os filtros ou criar um novo relatório</p>
          </div>
        ) : (
          <div className={`grid gap-6 ${
            viewMode === 'grid' 
              ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' 
              : 'grid-cols-1'
          }`}>
            {relatorios.map(relatorio => (
              <div
                key={relatorio.id}
                className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6 transition-all hover:-translate-y-1 hover:bg-white/8 hover:shadow-2xl hover:shadow-black/30 group"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center">
                      {getIconeCategoria(relatorio.categoria)}
                    </div>
                    <div>
                      <h3 className="font-semibold text-white group-hover:text-blue-400 transition-colors">
                        {relatorio.nome}
                      </h3>
                      <p className="text-xs text-white/60 capitalize">
                        {relatorio.categoria} • {relatorio.tipo.toUpperCase()}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleFavoritarRelatorio(relatorio.id)}
                      className={`p-2 rounded-lg transition-all ${
                        relatorio.favorito 
                          ? 'text-yellow-400 hover:text-yellow-300' 
                          : 'text-white/40 hover:text-yellow-400'
                      }`}
                    >
                      <Star className={`w-4 h-4 ${relatorio.favorito ? 'fill-current' : ''}`} />
                    </button>
                    
                    <button
                      onClick={() => handleSelecionarRelatorio(relatorio.id)}
                      className={`p-2 rounded-lg transition-all ${
                        selectedRelatorios.includes(relatorio.id)
                          ? 'text-blue-400 bg-blue-500/20' 
                          : 'text-white/40 hover:text-blue-400'
                      }`}
                    >
                      <CheckCircle className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                
                <p className="text-sm text-white/70 mb-4 line-clamp-2">
                  {relatorio.descricao}
                </p>
                
                <div className="flex flex-wrap gap-2 mb-4">
                  {relatorio.tags.map(tag => (
                    <span
                      key={tag}
                      className="px-2 py-1 bg-white/10 text-white/60 rounded-lg text-xs"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
                
                <div className="flex items-center justify-between text-xs text-white/60 mb-4">
                  <div className="flex items-center gap-4">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {formatarData(relatorio.dataCriacao)}
                    </span>
                    <span className="flex items-center gap-1">
                      <Download className="w-3 h-3" />
                      {relatorio.downloads}
                    </span>
                  </div>
                  <span className="flex items-center gap-1">
                    {getIconeTipo(relatorio.tipo)}
                    {formatarTamanho(relatorio.tamanho)}
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getCorStatus(relatorio.status)}`}>
                    {getNomeStatus(relatorio.status)}
                  </span>
                  
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleVisualizarRelatorio(relatorio.id)}
                      className="p-2 text-white/60 hover:text-white hover:bg-white/10 rounded-lg transition-all"
                      title="Visualizar"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    
                    <button
                      onClick={() => handleDownloadRelatorio(relatorio.id)}
                      disabled={relatorio.status !== 'disponivel'}
                      className="p-2 text-white/60 hover:text-white hover:bg-white/10 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                      title="Download"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                    
                    <button
                      onClick={() => handleCompartilharRelatorio(relatorio.id)}
                      className="p-2 text-white/60 hover:text-white hover:bg-white/10 rounded-lg transition-all"
                      title="Compartilhar"
                    >
                      <Share2 className="w-4 h-4" />
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

export default RelatoriosExecutivos;
