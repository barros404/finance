import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import {
  ArrowLeft,
  Download,
  Calendar,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Activity,
  User,
  AlertCircle,
  CheckCircle,
  XCircle,
  Clock,
  Archive,
  Search,
  Filter,
  Edit2,
  Check,
  X,
  AlertTriangle,
  Info,
  ArrowRight,
  Target,
  BarChart3,
  PieChart,
  FileText,
  RefreshCw
} from 'lucide-react';
import { mockAprovacaoApi } from '../services/mock/mockApi.js';

const VisualizarExecucaoOrcamental = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [execucao, setExecucao] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [fromApproval, setFromApproval] = useState(false);

  useEffect(() => {
    // Verificar se veio da página de aprovação
    if (location.state?.fromApproval) {
      setFromApproval(true);
      if (location.state.item) {
        setExecucao(location.state.item);
        setIsLoading(false);
        return;
      }
    }

    carregarExecucao();
  }, [id, location.state]);

  const carregarExecucao = async () => {
    setIsLoading(true);
    setError(null);
    try {
      // Simular carregamento de execução orçamental
      const response = await mockAprovacaoApi.obterItemPorId(id, 'execucao_orcamental');
      setExecucao(response.data);
    } catch (err) {
      console.error('Erro ao carregar execução orçamental:', err);
      setError('Erro ao carregar execução orçamental');
    } finally {
      setIsLoading(false);
    }
  };

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
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
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
    return statusMap[status] || status;
  };

  const getCorStatus = (status) => {
    const cores = {
      pendente: 'text-yellow-400 bg-yellow-500/20 border-yellow-500/30',
      aprovado: 'text-green-400 bg-green-500/20 border-green-500/30',
      rejeitado: 'text-red-400 bg-red-500/20 border-red-500/30',
      em_execucao: 'text-blue-400 bg-blue-500/20 border-blue-500/30',
      concluido: 'text-green-400 bg-green-500/20 border-green-500/30'
    };
    return cores[status] || 'text-gray-400 bg-gray-500/20 border-gray-500/30';
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0f0c29] via-[#302b63] to-[#24243e] text-white flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-400" />
          <p className="text-white/60">Carregando execução orçamental...</p>
        </div>
      </div>
    );
  }

  if (error || !execucao) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0f0c29] via-[#302b63] to-[#24243e] text-white flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Erro ao carregar</h2>
          <p className="text-white/60 mb-4">{error || 'Execução orçamental não encontrada'}</p>
          <button
            onClick={() => navigate(fromApproval ? '/aprovacao' : '/dashboard')}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-xl transition-colors"
          >
            Voltar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f0c29] via-[#302b63] to-[#24243e] text-white overflow-x-hidden">
      {/* Header */}
      <header className="bg-white/5 backdrop-blur-md border-b border-white/10 py-5 px-10 fixed w-full top-0 z-40">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate(fromApproval ? '/aprovacao' : '/dashboard')}
              className="p-2 bg-white/10 rounded-xl hover:bg-white/20 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center text-2xl shadow-lg shadow-purple-500/30">
              <Activity className="w-6 h-6" />
            </div>
            <div className="flex flex-col">
              <h1 className="text-2xl font-bold bg-gradient-to-b from-white to-gray-200 bg-clip-text text-transparent">
                EXECUÇÃO ORÇAMENTAL
              </h1>
              <p className="text-xs text-white/60">Visualização detalhada da execução</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className={`px-4 py-2 rounded-xl text-sm font-semibold ${getCorStatus(execucao.status)}`}>
              {mapearStatus(execucao.status)}
            </div>
            <button className="flex items-center gap-2 px-4 py-2 bg-white/10 text-white rounded-xl hover:bg-white/20 transition-all">
              <Download className="w-4 h-4" />
              Exportar
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto mt-28 px-10 pb-10">
        {/* Informações Básicas */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Card Principal */}
          <div className="lg:col-span-2 bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6">
            <h3 className="text-xl font-semibold mb-4 flex items-center gap-3">
              <FileText className="w-5 h-5 text-purple-400" />
              Informações da Execução
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-white/60">Nome</label>
                <p className="text-lg font-semibold">{execucao.nome}</p>
              </div>
              <div>
                <label className="text-sm text-white/60">Código</label>
                <p className="text-lg font-semibold">{execucao.id}</p>
              </div>
              <div>
                <label className="text-sm text-white/60">Valor Previsto</label>
                <p className="text-lg font-semibold text-green-400">{formatarValor(execucao.valorPrevisto || 0)}</p>
              </div>
              <div>
                <label className="text-sm text-white/60">Valor Executado</label>
                <p className="text-lg font-semibold text-blue-400">{formatarValor(execucao.valorExecutado || 0)}</p>
              </div>
              <div>
                <label className="text-sm text-white/60">Data de Início</label>
                <p className="text-lg font-semibold">{formatarData(execucao.dataInicio)}</p>
              </div>
              <div>
                <label className="text-sm text-white/60">Data de Fim</label>
                <p className="text-lg font-semibold">{formatarData(execucao.dataFim)}</p>
              </div>
            </div>
          </div>

          {/* Card do Solicitante */}
          <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6">
            <h3 className="text-xl font-semibold mb-4 flex items-center gap-3">
              <User className="w-5 h-5 text-blue-400" />
              Solicitante
            </h3>
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-3">
                <User className="w-8 h-8" />
              </div>
              <p className="font-semibold">{execucao.solicitante}</p>
              <p className="text-sm text-white/60">{execucao.cargo || 'Responsável'}</p>
              <p className="text-xs text-white/40 mt-2">Solicitado em {formatarData(execucao.dataCriacao)}</p>
            </div>
          </div>
        </div>

        {/* Descrição */}
        <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6 mb-8">
          <h3 className="text-xl font-semibold mb-4 flex items-center gap-3">
            <Info className="w-5 h-5 text-green-400" />
            Descrição
          </h3>
          <p className="text-white/80 leading-relaxed">{execucao.descricao}</p>
        </div>

        {/* Estatísticas de Execução */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-white/80 mb-1">Percentual Executado</p>
                <p className="text-3xl font-bold bg-gradient-to-b from-blue-400 to-blue-300 bg-clip-text text-transparent">
                  {execucao.percentualExecutado || 0}%
                </p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
                <Target className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>

          <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-white/80 mb-1">Valor Restante</p>
                <p className="text-3xl font-bold bg-gradient-to-b from-orange-400 to-orange-300 bg-clip-text text-transparent">
                  {formatarValor((execucao.valorPrevisto || 0) - (execucao.valorExecutado || 0))}
                </p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>

          <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-white/80 mb-1">Dias Restantes</p>
                <p className="text-3xl font-bold bg-gradient-to-b from-red-400 to-red-300 bg-clip-text text-transparent">
                  {execucao.diasRestantes || 0}
                </p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-red-600 rounded-xl flex items-center justify-center">
                <Clock className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
        </div>

        {/* Detalhes da Execução */}
        <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6">
          <h3 className="text-xl font-semibold mb-6 flex items-center gap-3">
            <BarChart3 className="w-5 h-5 text-purple-400" />
            Detalhes da Execução
          </h3>

          {/* Mock data para detalhes */}
          <div className="space-y-4">
            <div className="border border-white/10 rounded-xl p-4">
              <div className="flex justify-between items-start mb-2">
                <h4 className="font-semibold">Execução Mensal - Janeiro 2024</h4>
                <span className="px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-sm">Concluído</span>
              </div>
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="text-white/60">Previsto:</span>
                  <span className="ml-2 font-semibold">{formatarValor(150000)}</span>
                </div>
                <div>
                  <span className="text-white/60">Executado:</span>
                  <span className="ml-2 font-semibold text-green-400">{formatarValor(148500)}</span>
                </div>
                <div>
                  <span className="text-white/60">Diferença:</span>
                  <span className="ml-2 font-semibold text-red-400">{formatarValor(1500)}</span>
                </div>
              </div>
            </div>

            <div className="border border-white/10 rounded-xl p-4">
              <div className="flex justify-between items-start mb-2">
                <h4 className="font-semibold">Execução Mensal - Fevereiro 2024</h4>
                <span className="px-3 py-1 bg-blue-500/20 text-blue-400 rounded-full text-sm">Em Andamento</span>
              </div>
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="text-white/60">Previsto:</span>
                  <span className="ml-2 font-semibold">{formatarValor(160000)}</span>
                </div>
                <div>
                  <span className="text-white/60">Executado:</span>
                  <span className="ml-2 font-semibold text-blue-400">{formatarValor(120000)}</span>
                </div>
                <div>
                  <span className="text-white/60">Diferença:</span>
                  <span className="ml-2 font-semibold text-orange-400">{formatarValor(40000)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default VisualizarExecucaoOrcamental;