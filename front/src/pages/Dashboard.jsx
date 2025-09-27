import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Layout from '../components/Layout';
import api from '../services/api';

// Desestrutura os serviços necessários
const { 
  aprovacaoService, 
  validacaoContasService, 
  orcamento: orcamentoService, 
  tesourariaService 
} = api;
import { 
  Upload, 
  FileText, 
  BarChart3, 
  TrendingUp, 
  Users, 
  Settings, 
  Bell, 
  Search,
  Filter,
  Eye,
  Download,
  Plus,
  Calendar,
  DollarSign,
  PieChart,
  Activity,
  AlertTriangle,
  CheckCircle,
  Clock,
  Target,
  Zap,
  Shield,
  Database,
  FileImage,
  Tag,
  BookOpen,
  CreditCard,
  Banknote,
  TrendingDown,
  ArrowRight,
  ArrowUp,
  ArrowDown,
  Camera,
  FileCheck,
  Calculator,
  AlertCircle,
  Monitor,
  Cpu,
  FileSpreadsheet,
  PieChart as PieChartIcon,
  BarChart2,
  LineChart
} from 'lucide-react';

const Dashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [atividadesRecentes, setAtividadesRecentes] = useState([]);
  const [estatisticas, setEstatisticas] = useState({
    orcamentosPendentes: 0,
    planosPendentes: 0,
    contasPendentes: 0,
    totalAprovacoes: 0
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    carregarDadosDashboard();
  }, []);

  const carregarDadosDashboard = async () => {
    setIsLoading(true);
    try {
      // Carregar estatísticas de aprovação
      const [statsAprovacao, statsValidacao, atividades] = await Promise.all([
        aprovacaoService.obterEstatisticas(),
        validacaoContasService.dashboard(),
        tesourariaService.obterAtividadesRecentes({ limite: 5 })
      ]);

      
      // Combinar estatísticas
      setEstatisticas({
        orcamentosPendentes: statsAprovacao.itensPendentes || 0,
        planosPendentes: statsAprovacao.planosPendentes || 0,
        contasPendentes: statsValidacao.contasPendentes || 0,
        totalAprovacoes: statsAprovacao.itensAprovados || 0
      });

      // Mapear atividades recentes da API
      const atividadesMapeadas = atividades.data.map((atividade, index) => ({
        id: atividade.id || index + 1,
        tipo: atividade.tipo || 'info',
        titulo: atividade.titulo || 'Atividade do sistema',
        descricao: atividade.descricao || 'Nova atividade registrada',
        timestamp: new Date(atividade.data || Date.now() - (index * 300000)),
        status: atividade.status || 'sucesso',
        usuario: atividade.usuario || 'Sistema'
      }));

      // Usar apenas dados da API
      setAtividadesRecentes(atividadesMapeadas);
    } catch (error) {
      console.error('Erro ao carregar dados do dashboard:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const quickAction = (action) => {
    switch (action) {
      case 'carregar-documento':
        navigate('/captura-documentos');
        break;
      case 'gerar-relatorio':
        navigate('/relatorios-executivos');
        break;
      case 'novo-orcamento':
        navigate('/formulario-orcamento-anual');
        break;
      case 'ver-alertas':
        navigate('/analise-riscos');
        break;
      default:
        alert('Ação em desenvolvimento');
        break;
    }
  };

  const openModule = (module) => {
    switch (module) {
      case 'centro-controle':
        navigate('/dashboard-centro-controle');
        break;
      case 'captura-ocr':
        navigate('/captura-documentos');
        break;
      case 'classificacao-pgc':
        navigate('/classificacao-pgc');
        break;
      case 'gestao-orcamental':
        navigate('/tela-orcamento');
        break;
      case 'tesouraria':
        navigate('/dashboard-tesouraria');
        break;
      case 'analise-risco':
        navigate('/analise-riscos');
        break;
      case 'aprovacao':
        navigate('/aprovacao');
        break;
      case 'execucao-orcamental':
        navigate('/execucao-orcamental');
        break;
      case 'plano-execucao':
        navigate('/plano-execucao');
        break;
      case 'relatorios-executivos':
        navigate('/relatorios-executivos');
        break;
      case 'configuracao':
        navigate('/configuracoes');
        break;
      case 'diagnostico':
        navigate('/diagnostico');
        break;
      default:
        alert(module + ' em desenvolvimento');
        break;
    }
  };

  const getTipoIcon = (tipo) => {
    switch (tipo) {
      case 'upload': return '📤';
      case 'classificacao': return '🏷️';
      case 'orcamento': return '💰';
      case 'alerta': return '⚠️';
      case 'relatorio': return '📊';
      default: return '📄';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'sucesso': return 'text-green-400';
      case 'alerta': return 'text-yellow-400';
      case 'erro': return 'text-red-400';
      default: return 'text-blue-400';
    }
  };

  const formatarTempo = (timestamp) => {
    const agora = new Date();
    const diff = agora - timestamp;
    const minutos = Math.floor(diff / 60000);
    
    if (minutos < 1) return 'Agora mesmo';
    if (minutos < 60) return `${minutos} min atrás`;
    
    const horas = Math.floor(minutos / 60);
    if (horas < 24) return `${horas}h atrás`;
    
    const dias = Math.floor(horas / 24);
    return `${dias}d atrás`;
  };

  return (
    <Layout>
      {console.log('API::::',estatisticas)}
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">
              FINANCE PRO - Menu Principal do Sistema
            </h1>
            <p className="text-white/70">
              Bem-vindo, {user?.nome || 'Usuário'}! Sistema Integrado de Gestão Financeira
            </p>
          </div>

          {/* Ações Rápidas */}
          <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-8 mb-10">
            <h3 className="text-xl font-semibold text-white mb-6 flex items-center gap-3">
              <Zap className="w-6 h-6 text-yellow-400" />
              Ações Rápidas
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <button 
                onClick={() => quickAction('carregar-documento')}
                className="group bg-gradient-to-br from-blue-500/20 to-blue-600/20 border border-blue-500/30 rounded-2xl p-6 text-white transition-all hover:from-blue-500/30 hover:to-blue-600/30 hover:scale-105 hover:shadow-lg hover:shadow-blue-500/20"
              >
                <div className="flex items-center gap-4 mb-3">
                  <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center">
                    <Upload className="w-6 h-6 text-blue-400" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-lg">Carregar Documento</h4>
                    <p className="text-white/60 text-sm">Upload e processamento</p>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-blue-400 text-sm">Processar arquivos</span>
                  <ArrowRight className="w-4 h-4 text-blue-400 group-hover:translate-x-1 transition-transform" />
                </div>
              </button>

              <button 
                onClick={() => quickAction('gerar-relatorio')}
                className="group bg-gradient-to-br from-green-500/20 to-green-600/20 border border-green-500/30 rounded-2xl p-6 text-white transition-all hover:from-green-500/30 hover:to-green-600/30 hover:scale-105 hover:shadow-lg hover:shadow-green-500/20"
              >
                <div className="flex items-center gap-4 mb-3">
                  <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center">
                    <FileText className="w-6 h-6 text-green-400" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-lg">Gerar Relatório</h4>
                    <p className="text-white/60 text-sm">Relatórios executivos</p>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-green-400 text-sm">Criar relatório</span>
                  <ArrowRight className="w-4 h-4 text-green-400 group-hover:translate-x-1 transition-transform" />
                </div>
              </button>

              <button 
                onClick={() => quickAction('novo-orcamento')}
                className="group bg-gradient-to-br from-purple-500/20 to-purple-600/20 border border-purple-500/30 rounded-2xl p-6 text-white transition-all hover:from-purple-500/30 hover:to-purple-600/30 hover:scale-105 hover:shadow-lg hover:shadow-purple-500/20"
              >
                <div className="flex items-center gap-4 mb-3">
                  <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center">
                    <Calculator className="w-6 h-6 text-purple-400" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-lg">Novo Orçamento</h4>
                    <p className="text-white/60 text-sm">Criar orçamento anual</p>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-purple-400 text-sm">Planejar orçamento</span>
                  <ArrowRight className="w-4 h-4 text-purple-400 group-hover:translate-x-1 transition-transform" />
                </div>
              </button>

              <button 
                onClick={() => quickAction('ver-alertas')}
                className="group bg-gradient-to-br from-red-500/20 to-red-600/20 border border-red-500/30 rounded-2xl p-6 text-white transition-all hover:from-red-500/30 hover:to-red-600/30 hover:scale-105 hover:shadow-lg hover:shadow-red-500/20"
              >
                <div className="flex items-center gap-4 mb-3">
                  <div className="w-12 h-12 bg-red-500/20 rounded-xl flex items-center justify-center">
                    <Bell className="w-6 h-6 text-red-400" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-lg">Ver Alertas</h4>
                    <p className="text-white/60 text-sm">Análise de riscos</p>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-red-400 text-sm">3 alertas ativos</span>
                  <ArrowRight className="w-4 h-4 text-red-400 group-hover:translate-x-1 transition-transform" />
                </div>
              </button>
            </div>
          </div>

          {/* Módulos Principais */}
          <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-8 mb-10">
            <h3 className="text-xl font-semibold text-white mb-6 flex items-center gap-3">
              <Database className="w-6 h-6 text-blue-400" />
              Módulos Principais
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Centro de Controle */}
              <div 
                onClick={() => openModule('centro-controle')}
                className="group bg-white/5 border border-white/10 rounded-2xl p-6 cursor-pointer transition-all hover:bg-white/10 hover:scale-105 hover:shadow-lg hover:shadow-white/10"
              >
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
                    <Monitor className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-white text-lg">Centro de Controle</h4>
                    <p className="text-white/60 text-sm">Monitoramento central</p>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-blue-400 text-sm">agentes ativos</span>
                  <ArrowRight className="w-4 h-4 text-white/40 group-hover:text-white group-hover:translate-x-1 transition-all" />
                </div>
              </div>

              {/* Captura & OCR */}
              <div 
                onClick={() => openModule('captura-ocr')}
                className="group bg-white/5 border border-white/10 rounded-2xl p-6 cursor-pointer transition-all hover:bg-white/10 hover:scale-105 hover:shadow-lg hover:shadow-white/10"
              >
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center">
                    <Camera className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-white text-lg">Captura & OCR</h4>
                    <p className="text-white/60 text-sm">Digitalização e extração</p>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-green-400 text-sm">docs processados</span>
                  <ArrowRight className="w-4 h-4 text-white/40 group-hover:text-white group-hover:translate-x-1 transition-all" />
                </div>
              </div>

              {/* Classificação PGC-AO */}
              <div 
                onClick={() => openModule('classificacao-pgc')}
                className="group bg-white/5 border border-white/10 rounded-2xl p-6 cursor-pointer transition-all hover:bg-white/10 hover:scale-105 hover:shadow-lg hover:shadow-white/10"
              >
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center">
                    <Tag className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-white text-lg">Classificação PGC-AO</h4>
                    <p className="text-white/60 text-sm">Mapeamento automático</p>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-purple-400 text-sm">95% precisão</span>
                  <ArrowRight className="w-4 h-4 text-white/40 group-hover:text-white group-hover:translate-x-1 transition-all" />
                </div>
              </div>

              {/* Gestão Orçamental */}
              <div 
                onClick={() => openModule('gestao-orcamental')}
                className="group bg-white/5 border border-white/10 rounded-2xl p-6 cursor-pointer transition-all hover:bg-white/10 hover:scale-105 hover:shadow-lg hover:shadow-white/10"
              >
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-xl flex items-center justify-center">
                    <DollarSign className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-white text-lg">Gestão Orçamental</h4>
                    <p className="text-white/60 text-sm">Planejamento financeiro</p>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-yellow-400 text-sm">12 orçamentos</span>
                  <ArrowRight className="w-4 h-4 text-white/40 group-hover:text-white group-hover:translate-x-1 transition-all" />
                </div>
              </div>

              {/* Tesouraria */}
              <div 
                onClick={() => openModule('tesouraria')}
                className="group bg-white/5 border border-white/10 rounded-2xl p-6 cursor-pointer transition-all hover:bg-white/10 hover:scale-105 hover:shadow-lg hover:shadow-white/10"
              >
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl flex items-center justify-center">
                    <Banknote className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-white text-lg">Tesouraria</h4>
                    <p className="text-white/60 text-sm">Gestão de caixa</p>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-indigo-400 text-sm">8 planos ativos</span>
                  <ArrowRight className="w-4 h-4 text-white/40 group-hover:text-white group-hover:translate-x-1 transition-all" />
                </div>
              </div>

              {/* Análise de Risco */}
              <div 
                onClick={() => openModule('analise-risco')}
                className="group bg-white/5 border border-white/10 rounded-2xl p-6 cursor-pointer transition-all hover:bg-white/10 hover:scale-105 hover:shadow-lg hover:shadow-white/10"
              >
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-red-600 rounded-xl flex items-center justify-center">
                    <AlertTriangle className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-white text-lg">Análise de Risco</h4>
                    <p className="text-white/60 text-sm">Monitoramento de riscos</p>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-red-400 text-sm">3 riscos críticos</span>
                  <ArrowRight className="w-4 h-4 text-white/40 group-hover:text-white group-hover:translate-x-1 transition-all" />
                </div>
              </div>

              {/* Aprovação */}
              <div 
                onClick={() => openModule('aprovacao')}
                className="group bg-white/5 border border-white/10 rounded-2xl p-6 cursor-pointer transition-all hover:bg-white/10 hover:scale-105 hover:shadow-lg hover:shadow-white/10"
              >
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center">
                    <CheckCircle className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-white text-lg">Aprovação</h4>
                    <p className="text-white/60 text-sm">Central de aprovações</p>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-orange-400 text-sm">{estatisticas.orcamentosPendentes} itens pendentes</span>
                  <ArrowRight className="w-4 h-4 text-white/40 group-hover:text-white group-hover:translate-x-1 transition-all" />
                </div>
              </div>

              {/* Execução Orçamental */}
              <div 
                onClick={() => openModule('execucao-orcamental')}
                className="group bg-white/5 border border-white/10 rounded-2xl p-6 cursor-pointer transition-all hover:bg-white/10 hover:scale-105 hover:shadow-lg hover:shadow-white/10"
              >
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-teal-500 to-teal-600 rounded-xl flex items-center justify-center">
                    <BarChart2 className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-white text-lg">Execução Orçamental</h4>
                    <p className="text-white/60 text-sm">Acompanhamento orçamental</p>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-teal-400 text-sm">78% executado</span>
                  <ArrowRight className="w-4 h-4 text-white/40 group-hover:text-white group-hover:translate-x-1 transition-all" />
                </div>
              </div>

              {/* Plano em Execução */}
              <div
                onClick={() => openModule('plano-execucao')}
                className="group bg-white/5 border border-white/10 rounded-2xl p-6 cursor-pointer transition-all hover:bg-white/10 hover:scale-105 hover:shadow-lg hover:shadow-white/10"
              >
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center">
                    <Target className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-white text-lg">Plano em Execução</h4>
                    <p className="text-white/60 text-sm">Execução de planos de tesouraria</p>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-orange-400 text-sm">5 planos ativos</span>
                  <ArrowRight className="w-4 h-4 text-white/40 group-hover:text-white group-hover:translate-x-1 transition-all" />
                </div>
              </div>

              {/* Relatórios Executivos */}
              <div 
                onClick={() => openModule('relatorios-executivos')}
                className="group bg-white/5 border border-white/10 rounded-2xl p-6 cursor-pointer transition-all hover:bg-white/10 hover:scale-105 hover:shadow-lg hover:shadow-white/10"
              >
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-pink-500 to-pink-600 rounded-xl flex items-center justify-center">
                    <LineChart className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-white text-lg">Relatórios Executivos</h4>
                    <p className="text-white/60 text-sm">Dashboards gerenciais</p>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-pink-400 text-sm">12 relatórios</span>
                  <ArrowRight className="w-4 h-4 text-white/40 group-hover:text-white group-hover:translate-x-1 transition-all" />
                </div>
              </div>

              {/* Configuração */}
              <div 
                onClick={() => openModule('configuracao')}
                className="group bg-white/5 border border-white/10 rounded-2xl p-6 cursor-pointer transition-all hover:bg-white/10 hover:scale-105 hover:shadow-lg hover:shadow-white/10"
              >
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-gray-500 to-gray-600 rounded-xl flex items-center justify-center">
                    <Settings className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-white text-lg">Configuração</h4>
                    <p className="text-white/60 text-sm">Configurações do sistema</p>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400 text-sm">Sistema</span>
                  <ArrowRight className="w-4 h-4 text-white/40 group-hover:text-white group-hover:translate-x-1 transition-all" />
                </div>
              </div>

              {/* Diagnóstico */}
              <div 
                onClick={() => openModule('diagnostico')}
                className="group bg-white/5 border border-white/10 rounded-2xl p-6 cursor-pointer transition-all hover:bg-white/10 hover:scale-105 hover:shadow-lg hover:shadow-white/10"
              >
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center">
                    <Activity className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-white text-lg">Diagnóstico</h4>
                    <p className="text-white/60 text-sm">Teste de integração</p>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-orange-400 text-sm">API Status</span>
                  <ArrowRight className="w-4 h-4 text-white/40 group-hover:text-white group-hover:translate-x-1 transition-all" />
                </div>
              </div>
            </div>
          </div>

          {/* Atividades Recentes */}
          <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-8">
            <h3 className="text-xl font-semibold text-white mb-6 flex items-center gap-3">
              <Clock className="w-6 h-6 text-green-400" />
              Atividades Recentes
            </h3>
            <div className="space-y-4">
              {atividadesRecentes.map((atividade) => (
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
              ))}
            </div>
          </div>

          {/* Footer */}
          <footer className="text-center py-10 text-white/40 text-sm border-t border-white/10 mt-16">
            <p>© 2025 FINANCE PRO - Sistema Integrado de Gestão Financeira</p>
            <p className="mt-1">Versão 2.0.1 | Última atualização: 18/09/2025</p>   
          </footer>
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;