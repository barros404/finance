import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

// Desestrutura os serviços necessários
const { aprovacaoService } = api;
import {
  CheckCircle,
  XCircle,
  Clock,
  FileText,
  Calendar,
  User,
  Eye,
  Check,
  X,
  Filter,
  Search,
  RefreshCw,
  AlertCircle,
  BarChart3,
  Grid,
  List,
  ExternalLink,
  MessageSquare,
  Activity,
  Target
} from 'lucide-react';

const Aprovacao = () => {
  const navigate = useNavigate();
  const [itensPendentes, setItensPendentes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [filtros, setFiltros] = useState({
    tipo: '', // orcamento, plano, ''
    status: 'em_analise', // em_analise, aprovado, rejeitado, todos
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
    totalPendentes: 0,
    orcamentosPendentes: 0,
    planosPendentes: 0,
    execucoesPendentes: 0,
    planosExecucaoPendentes: 0,
    aprovadosHoje: 0,
    rejeitadosHoje: 0,
    tempoMedioAprovacao: 0
  });
  const [viewMode, setViewMode] = useState('grid');
  const [selectedItems, setSelectedItems] = useState([]);
  const [mostrarFiltros, setMostrarFiltros] = useState(false);
  const [mostrarModalAprovacao, setMostrarModalAprovacao] = useState(false);
  const [itemSelecionado, setItemSelecionado] = useState(null);
  const [motivoReprovacao, setMotivoReprovacao] = useState('');
  const [mostrarCampoMotivo, setMostrarCampoMotivo] = useState(false);

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

  const getIconeTipo = (tipo) => {
    const icones = {
      orcamento: <FileText className="w-5 h-5" />,
      plano: <BarChart3 className="w-5 h-5" />,
      execucao_orcamental: <Activity className="w-5 h-5" />,
      plano_execucao: <Target className="w-5 h-5" />
    };
    return icones[tipo] || <FileText className="w-5 h-5" />;
  };

  const getCorStatus = (status) => {
    const cores = {
      em_analise: 'text-yellow-400 bg-yellow-500/20 border-yellow-500/30',
      aprovado: 'text-green-400 bg-green-500/20 border-green-500/30',
      rejeitado: 'text-red-400 bg-red-500/20 border-red-500/30',
      pendente: 'text-yellow-400 bg-yellow-500/20 border-yellow-500/30'
    };
    return cores[status] || 'text-gray-400 bg-gray-500/20 border-gray-500/30';
  };

  const getNomeStatus = (status) => {
    const nomes = {
      em_analise: 'Em Análise',
      aprovado: 'Aprovado',
      rejeitado: 'Rejeitado',
      pendente: 'Pendente'
    };
    return nomes[status] || 'Desconhecido';
  };

  // Mapear dados da API para o formato esperado pelo componente
  const mapearItemAPI = (item) => {
    return {
      id: item.id,
      nome: item.nome,
      descricao: item.descricao || 'Sem descrição',
      tipo: item.tipo,
      status: item.status,
      valor: item.valor || 0,
      prioridade: item.prioridade || 'media',
      solicitante: item.criador?.nome || 'N/A',
      departamento: item.departamento || 'Geral',
      dataEnvio: item.createdAt,
      observacoes: item.observacoes || '',
      tags: item.tags || [],
      anexos: item.anexos || []
    };
  };

  // Carregar itens pendentes de aprovação
  const carregarItensPendentes = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      console.log('🔄 Carregando itens pendentes de aprovação:', filtros);
      
      // Usar o serviço de aprovação
      const response = await aprovacaoService.listarItensPendentes(filtros);
      console.log('✅ Resposta completa da API:', response);
      
      if (!response || !response.data) {
        throw new Error('Resposta da API inválida');
      }

      const itensDaAPI = response.data;
      console.log('✅ Itens recebidos da API:', itensDaAPI);

      // Mapear os itens para o formato esperado
      const itensMapeados = itensDaAPI.map(mapearItemAPI);
      console.log('✅ Itens mapeados:', itensMapeados);

      // Aplicar filtros locais (se necessário)
      let itensFiltrados = itensMapeados;
      
      if (filtros.tipo && filtros.tipo !== 'todos') {
        itensFiltrados = itensFiltrados.filter(i => i.tipo === filtros.tipo);
      }
      
      if (filtros.status && filtros.status !== 'todos') {
        itensFiltrados = itensFiltrados.filter(i => i.status === filtros.status);
      }
      
      if (filtros.busca) {
        const buscaLower = filtros.busca.toLowerCase();
        itensFiltrados = itensFiltrados.filter(i => 
          i.nome.toLowerCase().includes(buscaLower) ||
          i.descricao.toLowerCase().includes(buscaLower) ||
          i.solicitante.toLowerCase().includes(buscaLower) ||
          (i.tags && i.tags.some(tag => tag.toLowerCase().includes(buscaLower)))
        );
      }

      console.log('✅ Itens após filtros:', itensFiltrados);

      // Usar paginação da API se disponível, caso contrário usar paginação local
      const paginacaoAPI = response.pagination;
      let itensPaginados = itensFiltrados;
      let infoPaginacao;

      if (paginacaoAPI) {
        // API já fez a paginação
        infoPaginacao = {
          totalItens: paginacaoAPI.totalItens,
          totalPaginas: paginacaoAPI.totalPaginas,
          paginaAtual: paginacaoAPI.pagina
        };
      } else {
        // Paginação local
        const inicio = (filtros.pagina - 1) * filtros.limite;
        const fim = inicio + filtros.limite;
        itensPaginados = itensFiltrados.slice(inicio, fim);
        
        infoPaginacao = {
          totalItens: itensFiltrados.length,
          totalPaginas: Math.ceil(itensFiltrados.length / filtros.limite),
          paginaAtual: filtros.pagina
        };
      }

      setItensPendentes(itensPaginados);
      setPaginacao(infoPaginacao);

      // Calcular estatísticas
      const stats = {
        totalPendentes: itensMapeados.filter(i => i.status === 'em_analise' || i.status === 'pendente').length,
        orcamentosPendentes: itensMapeados.filter(i => i.tipo === 'orcamento' && (i.status === 'em_analise' || i.status === 'pendente')).length,
        planosPendentes: itensMapeados.filter(i => i.tipo === 'plano' && (i.status === 'em_analise' || i.status === 'pendente')).length,
        execucoesPendentes: itensMapeados.filter(i => i.tipo === 'execucao_orcamental' && (i.status === 'em_analise' || i.status === 'pendente')).length,
        planosExecucaoPendentes: itensMapeados.filter(i => i.tipo === 'plano_execucao' && (i.status === 'em_analise' || i.status === 'pendente')).length,
        aprovadosHoje: itensMapeados.filter(i => i.status === 'aprovado').length, // Simplificado
        rejeitadosHoje: itensMapeados.filter(i => i.status === 'rejeitado').length, // Simplificado
        tempoMedioAprovacao: 2.5
      };
      setEstatisticas(stats);

      console.log('✅ Itens pendentes carregados com sucesso:', itensPaginados);
    } catch (err) {
      console.error('❌ Erro ao carregar itens pendentes:', err);
      setError(`Erro ao carregar itens pendentes: ${err.message}`);
      setItensPendentes([]);
      setPaginacao({ totalItens: 0, totalPaginas: 0, paginaAtual: 1 });
    } finally {
      setIsLoading(false);
    }
  }, [filtros]);

  useEffect(() => {
    carregarItensPendentes();
  }, [carregarItensPendentes]);

  // Handlers
  const handleFiltrarTipo = (tipo) => {
    setFiltros(prev => ({ ...prev, tipo: tipo === 'todos' ? '' : tipo, pagina: 1 }));
  };

  const handleFiltrarStatus = (status) => {
    setFiltros(prev => ({ ...prev, status: status === 'todos' ? '' : status, pagina: 1 }));
  };

  const handleBuscar = (busca) => {
    setFiltros(prev => ({ ...prev, busca, pagina: 1 }));
  };

  const handleMudarPagina = (pagina) => {
    setFiltros(prev => ({ ...prev, pagina }));
  };

  const handleVisualizarItem = (item) => {
    setItemSelecionado(item);
    setMostrarModalAprovacao(true);
  };

  const handleAprovarItem = async (itemId, observacoes = '') => {
    try {
      console.log('✅ Aprovando item:', itemId, observacoes);
      
      
      // Encontrar o item original para obter o tipo
      const item = itensPendentes.find(item => item.id === itemId);
      console.log('Daod',item.tipo)
      if (item) {
        await aprovacaoService.aprovarItem(itemId, item.tipo, observacoes);
      }
      
      setSuccess('Item aprovado com sucesso!');
      setTimeout(() => setSuccess(null), 3000);
      setMostrarModalAprovacao(false);
      setMostrarCampoMotivo(false);
      setMotivoReprovacao('');
      carregarItensPendentes();
    } catch (err) {
      console.error('❌ Erro ao aprovar item:', err);
      setError(`Erro ao aprovar item: ${err.message}`);
    }
  };

  const handleRejeitarItem = async (itemId, motivo = '') => {
    try {
      if (!motivo.trim()) {
        setError('Por favor, informe o motivo da reprovação.');
        return;
      }
      
      console.log('❌ Rejeitando item:', itemId, motivo);
      
      // Encontrar o item original para obter o tipo
      const item = itensPendentes.find(item => item.id === itemId);
      if (item) {
        await aprovacaoService.rejeitarItem(itemId, item.tipo, motivo);
      }
      
      setSuccess('Item rejeitado com sucesso!');
      setTimeout(() => setSuccess(null), 3000);
      setMostrarModalAprovacao(false);
      setMostrarCampoMotivo(false);
      setMotivoReprovacao('');
      carregarItensPendentes();
    } catch (err) {
      console.error('❌ Erro ao rejeitar item:', err);
      setError(`Erro ao rejeitar item: ${err.message}`);
    }
  };

  const handleVerDetalhes = (item) => {
    setMostrarModalAprovacao(false);
    // Navegação baseada no tipo do item
    const rotas = {
      orcamento: `/visualizar-orcamento/${item.id}`,
      plano: `/visualizar-plano/${item.id}`,
      execucao_orcamental: `/visualizar-execucao-orcamental/${item.id}`,
      plano_execucao: `/visualizar-plano-execucao/${item.id}`
    };
    
    const rota = rotas[item.tipo];
    if (rota) {
      navigate(rota, { state: { item, fromApproval: true } });
    }
  };

  const handleIniciarReprovacao = () => {
    setMostrarCampoMotivo(true);
  };

  const handleCancelarReprovacao = () => {
    setMostrarCampoMotivo(false);
    setMotivoReprovacao('');
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

  const handleAprovarSelecionados = async () => {
    try {
      for (const itemId of selectedItems) {
        const item = itensPendentes.find(item => item.id === itemId);
        if (item) {
          await aprovacaoService.aprovarItem(itemId, item.tipo);
        }
      }
      
      setSuccess(`${selectedItems.length} itens aprovados com sucesso!`);
      setTimeout(() => setSuccess(null), 3000);
      setSelectedItems([]);
      carregarItensPendentes();
    } catch (err) {
      console.error('❌ Erro ao aprovar itens selecionados:', err);
      setError(`Erro ao aprovar itens: ${err.message}`);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f0c29] via-[#302b63] to-[#24243e] text-white overflow-x-hidden">
      {/* Header */}
      <header className="bg-white/5 backdrop-blur-md border-b border-white/10 py-5 px-10 fixed w-full top-0 z-40 animate-slideDown">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-[#667eea] to-[#764ba2] rounded-xl flex items-center justify-center text-2xl shadow-lg shadow-[#667eea]/30">
              <CheckCircle className="w-6 h-6" />
            </div>
            <div className="flex flex-col">
              <h1 className="text-2xl font-bold bg-gradient-to-b from-white to-gray-200 bg-clip-text text-transparent">APROVAÇÃO</h1>
              <p className="text-xs text-white/60">Central de aprovação de orçamentos e planos</p>
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
              onClick={carregarItensPendentes}
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

        {success && (
          <div className="mb-6 p-4 bg-green-500/20 border border-green-500/30 rounded-xl backdrop-blur-md animate-fadeIn">
            <div className="flex items-center">
              <CheckCircle className="w-5 h-5 text-green-400 mr-2" />
              <p className="text-green-200">{success}</p>
            </div>
          </div>
        )}

        {/* Cards de Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6 transition-all hover:-translate-y-1 hover:bg-white/8 hover:shadow-2xl hover:shadow-black/30">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-white/80 mb-1">Total Pendentes</p>
                <p className="text-3xl font-bold bg-gradient-to-b from-white to-gray-200 bg-clip-text text-transparent">
                  {estatisticas.totalPendentes}
                </p>
                <p className="text-xs text-white/60 mt-1">Aguardando aprovação</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-[#667eea] to-[#764ba2] rounded-xl flex items-center justify-center text-2xl shadow-lg shadow-[#667eea]/30">
                <Clock className="w-6 h-6" />
              </div>
            </div>
          </div>
          
          <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6 transition-all hover:-translate-y-1 hover:bg-white/8 hover:shadow-2xl hover:shadow-black/30">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-white/80 mb-1">Orçamentos Pendentes</p>
                <p className="text-3xl font-bold bg-gradient-to-b from-blue-400 to-blue-300 bg-clip-text text-transparent">
                  {estatisticas.orcamentosPendentes}
                </p>
                <p className="text-xs text-white/60 mt-1">Orçamentos aguardando</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-[#3b82f6] to-[#1d4ed8] rounded-xl flex items-center justify-center text-2xl shadow-lg shadow-[#3b82f6]/30">
                <FileText className="w-6 h-6" />
              </div>
            </div>
          </div>
          
          <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6 transition-all hover:-translate-y-1 hover:bg-white/8 hover:shadow-2xl hover:shadow-black/30">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-white/80 mb-1">Planos Pendentes</p>
                <p className="text-3xl font-bold bg-gradient-to-b from-green-400 to-green-300 bg-clip-text text-transparent">
                  {estatisticas.planosPendentes}
                </p>
                <p className="text-xs text-white/60 mt-1">Planos aguardando</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-[#10b981] to-[#059669] rounded-xl flex items-center justify-center text-2xl shadow-lg shadow-[#10b981]/30">
                <BarChart3 className="w-6 h-6" />
              </div>
            </div>
          </div>

          

          
          
          <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6 transition-all hover:-translate-y-1 hover:bg-white/8 hover:shadow-2xl hover:shadow-black/30">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-white/80 mb-1">Tempo Médio</p>
                <p className="text-3xl font-bold bg-gradient-to-b from-purple-400 to-purple-300 bg-clip-text text-transparent">
                  {estatisticas.tempoMedioAprovacao}h
                </p>
                <p className="text-xs text-white/60 mt-1">Tempo médio de aprovação</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-[#8b5cf6] to-[#7c3aed] rounded-xl flex items-center justify-center text-2xl shadow-lg shadow-[#8b5cf6]/30">
                <Clock className="w-6 h-6" />
              </div>
            </div>
          </div>
        </div>

        {/* Filtros */}
        {mostrarFiltros && (
          <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6 mb-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-semibold text-white/80 mb-2">Tipo</label>
                <select
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-white"
                  value={filtros.tipo}
                  onChange={(e) => handleFiltrarTipo(e.target.value)}
                >
                  <option value="">Todos os Tipos</option>
                  <option value="orcamento">Orçamentos</option>
                  <option value="plano">Planos</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-white/80 mb-2">Status</label>
                <select
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-white"
                  value={filtros.status}
                  onChange={(e) => handleFiltrarStatus(e.target.value)}
                >
                  <option value="">Todos os Status</option>
                  <option value="em_analise">Pendente</option>
                  <option value="aprovado">Aprovado</option>
                  <option value="rejeitado">Rejeitado</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-white/80 mb-2">Data Início</label>
                <input
                  type="date"
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-white"
                  value={filtros.dataInicio}
                  onChange={(e) => setFiltros(prev => ({ ...prev, dataInicio: e.target.value }))}
                />
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-white/80 mb-2">Buscar</label>
                <div className="relative">
                  <input
                    type="text"
                    className="w-full px-4 py-3 pl-10 bg-white/5 border border-white/10 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-white placeholder-white/50"
                    placeholder="Buscar itens..."
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
            <h2 className="text-xl font-bold text-white">Itens Pendentes de Aprovação</h2>
            <span className="px-3 py-1 bg-white/10 text-white/80 rounded-full text-sm">
              {paginacao.totalItens} itens
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
                <button 
                  onClick={handleAprovarSelecionados}
                  className="px-3 py-1 bg-green-500/20 text-green-400 rounded-lg text-sm hover:bg-green-500/30 transition-all"
                >
                  Aprovar Selecionados
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Lista de Itens Pendentes */}
        {isLoading ? (
          <div className="flex justify-center items-center py-20">
            <RefreshCw className="w-8 h-8 animate-spin text-white/60" />
            <span className="ml-3 text-white/60">Carregando itens pendentes...</span>
          </div>
        ) : itensPendentes.length === 0 ? (
          <div className="text-center py-20">
            <CheckCircle className="w-16 h-16 text-white/30 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white/60 mb-2">Nenhum item pendente encontrado</h3>
            <p className="text-white/40">Todos os itens foram processados ou tente ajustar os filtros</p>
          </div>
        ) : (
          <div className={`grid gap-6 ${
            viewMode === 'grid' 
              ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' 
              : 'grid-cols-1'
          }`}>
            {itensPendentes.map(item => (
              <div
                key={item.id}
                className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6 transition-all hover:-translate-y-1 hover:bg-white/8 hover:shadow-2xl hover:shadow-black/30 group"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center">
                      {getIconeTipo(item.tipo)}
                    </div>
                    <div>
                      <h3 className="font-semibold text-white group-hover:text-blue-400 transition-colors">
                        {item.nome}
                      </h3>
                      <p className="text-xs text-white/60 capitalize">
                        {item.tipo} • {item.departamento}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleSelecionarItem(item.id)}
                      className={`p-2 rounded-lg transition-all ${
                        selectedItems.includes(item.id)
                          ? 'text-blue-400 bg-blue-500/20' 
                          : 'text-white/40 hover:text-blue-400'
                      }`}
                    >
                      <CheckCircle className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                
                <p className="text-sm text-white/70 mb-4 line-clamp-2">
                  {item.descricao}
                </p>
                
                <div className="flex flex-wrap gap-2 mb-4">
                  {item.tags.map(tag => (
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
                      {formatarValor(item.valor)}
                    </p>
                  </div>
                  
                  <div>
                    <p className="text-xs text-white/60 mb-1">Prioridade</p>
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                      item.prioridade === 'alta' ? 'bg-red-500/20 text-red-400' :
                      item.prioridade === 'media' ? 'bg-yellow-500/20 text-yellow-400' :
                      'bg-green-500/20 text-green-400'
                    }`}>
                      {item.prioridade?.charAt(0).toUpperCase() + item.prioridade?.slice(1)}
                    </span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between text-xs text-white/60 mb-4">
                  <div className="flex items-center gap-4">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {formatarData(item.dataEnvio)}
                    </span>
                    <span className="flex items-center gap-1">
                      <User className="w-3 h-3" />
                      {item.solicitante}
                    </span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getCorStatus(item.status)}`}>
                    {getNomeStatus(item.status)}
                  </span>
                  
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleVisualizarItem(item)}
                      className="p-2 text-white/60 hover:text-white hover:bg-white/10 rounded-lg transition-all"
                      title="Visualizar"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    
                    <button
                      onClick={() => handleAprovarItem(item.id)}
                      className="p-2 text-green-400 hover:text-green-300 hover:bg-green-500/20 rounded-lg transition-all"
                      title="Aprovar"
                    >
                      <Check className="w-4 h-4" />
                    </button>
                    
                    <button
                      onClick={() => handleRejeitarItem(item.id)}
                      className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/20 rounded-lg transition-all"
                      title="Rejeitar"
                    >
                      <X className="w-4 h-4" />
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

       {/* Modal de Aprovação */}
       {mostrarModalAprovacao && itemSelecionado && (
         <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
           <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 max-w-3xl w-full max-h-[90vh] overflow-y-auto">
             <div className="flex items-center justify-between mb-6">
               <div className="flex items-center gap-3">
                 <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center">
                   {getIconeTipo(itemSelecionado.tipo)}
                 </div>
                 <div>
                   <h3 className="text-xl font-bold text-white">Aprovação de {itemSelecionado.nome}</h3>
                   <p className="text-white/60 text-sm capitalize">{itemSelecionado.tipo} • {itemSelecionado.departamento}</p>
                 </div>
               </div>
               <button
                 onClick={() => {
                   setMostrarModalAprovacao(false);
                   setMostrarCampoMotivo(false);
                   setMotivoReprovacao('');
                 }}
                 className="p-2 text-white/60 hover:text-white hover:bg-white/10 rounded-lg transition-all"
               >
                 <X className="w-5 h-5" />
               </button>
             </div>
             
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
               <div className="space-y-4">
                 <div>
                   <p className="text-sm text-white/80 mb-2">Descrição:</p>
                   <p className="text-white text-sm">{itemSelecionado.descricao}</p>
                 </div>
                 
                 <div>
                   <p className="text-sm text-white/80 mb-2">Valor:</p>
                   <p className="text-white font-semibold text-lg">{formatarValor(itemSelecionado.valor)}</p>
                 </div>
                 
                 <div>
                   <p className="text-sm text-white/80 mb-2">Solicitante:</p>
                   <p className="text-white">{itemSelecionado.solicitante}</p>
                 </div>
                 
                 <div>
                   <p className="text-sm text-white/80 mb-2">Data de Envio:</p>
                   <p className="text-white">{formatarData(itemSelecionado.dataEnvio)}</p>
                 </div>
               </div>
               
               <div className="space-y-4">
                 <div>
                   <p className="text-sm text-white/80 mb-2">Prioridade:</p>
                   <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                     itemSelecionado.prioridade === 'alta' ? 'bg-red-500/20 text-red-400' :
                     itemSelecionado.prioridade === 'media' ? 'bg-yellow-500/20 text-yellow-400' :
                     'bg-green-500/20 text-green-400'
                   }`}>
                     {itemSelecionado.prioridade?.charAt(0).toUpperCase() + itemSelecionado.prioridade?.slice(1)}
                   </span>
                 </div>
                 
                 <div>
                   <p className="text-sm text-white/80 mb-2">Status:</p>
                   <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getCorStatus(itemSelecionado.status)}`}>
                     {getNomeStatus(itemSelecionado.status)}
                   </span>
                 </div>
                 
                 <div>
                   <p className="text-sm text-white/80 mb-2">Observações:</p>
                   <p className="text-white text-sm">{itemSelecionado.observacoes}</p>
                 </div>
                 
                 <div>
                   <p className="text-sm text-white/80 mb-2">Anexos:</p>
                   <div className="flex flex-wrap gap-2">
                     {itemSelecionado.anexos.map((anexo, index) => (
                       <span key={index} className="px-2 py-1 bg-white/10 text-white/60 rounded-lg text-xs">
                         {anexo}
                       </span>
                     ))}
                   </div>
                 </div>
               </div>
             </div>

             {/* Campo de motivo para reprovação */}
             {mostrarCampoMotivo && (
               <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl">
                 <div className="flex items-center gap-2 mb-3">
                   <MessageSquare className="w-4 h-4 text-red-400" />
                   <p className="text-sm font-semibold text-red-400">Motivo da Reprovação</p>
                 </div>
                 <textarea
                   value={motivoReprovacao}
                   onChange={(e) => setMotivoReprovacao(e.target.value)}
                   placeholder="Descreva o motivo da reprovação..."
                   className="w-full px-3 py-2 bg-white/5 border border-red-500/30 rounded-lg text-white placeholder-white/50 focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all resize-none"
                   rows={3}
                 />
                 <div className="flex items-center gap-2 mt-3">
                   <button
                     onClick={() => handleRejeitarItem(itemSelecionado.id, motivoReprovacao)}
                     className="px-3 py-1 bg-red-500/20 text-red-400 rounded-lg text-sm hover:bg-red-500/30 transition-all"
                   >
                     Confirmar Reprovação
                   </button>
                   <button
                     onClick={handleCancelarReprovacao}
                     className="px-3 py-1 bg-white/10 text-white/60 rounded-lg text-sm hover:bg-white/20 transition-all"
                   >
                     Cancelar
                   </button>
                 </div>
               </div>
             )}
             
             <div className="flex items-center justify-between gap-3">
               <button
                 onClick={() => handleVerDetalhes(itemSelecionado)}
                 className="flex items-center gap-2 px-4 py-2 bg-blue-500/20 text-blue-400 rounded-xl hover:bg-blue-500/30 transition-all"
               >
                 <ExternalLink className="w-4 h-4" />
                 Ver Detalhes Completos
               </button>
               
               <div className="flex items-center gap-3">
                 {!mostrarCampoMotivo ? (
                   <>
                     <button
                       onClick={handleIniciarReprovacao}
                       className="px-4 py-2 bg-red-500/20 text-red-400 rounded-xl hover:bg-red-500/30 transition-all"
                     >
                       Rejeitar
                     </button>
                     <button
                       onClick={() => handleAprovarItem(itemSelecionado.id)}
                       className="px-4 py-2 bg-green-500/20 text-green-400 rounded-xl hover:bg-green-500/30 transition-all"
                     >
                       Aprovar
                     </button>
                   </>
                 ) : null}
               </div>
             </div>
           </div>
         </div>
       )}

      {/* Footer */}
      <footer className="text-center py-10 text-white/40 text-sm border-t border-white/10 mt-16">
        <p>© 2025 FINANCE PRO - Sistema Integrado de Gestão Financeira</p>
        <p className="mt-1">Versão 2.0.1 | Última atualização: 18/09/2025</p>
      </footer>
    </div>
  );
};

export default Aprovacao;
