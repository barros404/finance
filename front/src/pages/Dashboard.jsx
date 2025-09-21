import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { User, Settings, LogOut, ChevronDown } from 'lucide-react';

const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [notificationCount, setNotificationCount] = useState(5);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Simulate page loading
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1500);

    // Simulate real-time notifications
    const notificationInterval = setInterval(() => {
      setNotificationCount(prev => Math.max(0, prev + Math.floor(Math.random() * 3) - 1));
    }, 10000);

    return () => {
      clearTimeout(timer);
      clearInterval(notificationInterval);
    };
  }, []);

  // Close user menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isUserMenuOpen && !event.target.closest('.user-menu')) {
        setIsUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isUserMenuOpen]);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    }
  };

  const handleUserMenuAction = (action) => {
    setIsUserMenuOpen(false);
    switch (action) {
      case 'profile':
        // Por enquanto não faz nada, como solicitado
        break;
      case 'settings':
        navigate('/configuracoes');
        break;
      case 'logout':
        handleLogout();
        break;
      default:
        break;
    }
  };

  const openModule = (module) => {
    switch (module) {
      case 'dashboard':
          navigate('/outputCenter');
        break;
      case 'budget':
          navigate('/orcamento');
        break;
      case 'treasury':
          navigate('/tesouraria'); 
        break;
    
      default:
        alert(module + ' em desenvolvimento');
        break;
    }
   
    //console.log('Opening module:', module);
    //alert(`Navegando para: ${module.toUpperCase()}\n\nEste módulo contém todas as funcionalidades descritas no sistema.`);
  };

  const quickAction = (action) => {
    switch (action) {
      case 'upload':
        alert('Abrindo interface de captura de documentos...');
        break;
      case 'report':  
        alert('Iniciando gerador de relatórios...');
        break;
      case 'budget':
       navigate('/novo-orcamento');
        break;
      case 'alert':
        navigate('/notificacoes');
        break;
      
      default:
        alert('Ação em desenvolvimento');
        break;
    }
    
    
    //  alert(actions[action] || 'Ação em desenvolvimento');
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-gradient-to-br from-[#0f0c29] to-[#302b63] flex justify-center items-center z-50">
        <div className="w-20 h-20 border-4 border-white/10 border-t-white rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f0c29] via-[#302b63] to-[#24243e] text-white overflow-x-hidden">
      {/* Header */}
      <header className="bg-white/5 backdrop-blur-md border-b border-white/10 py-5 px-10 fixed w-full top-0 z-40 animate-slideDown">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-[#667eea] to-[#764ba2] rounded-xl flex items-center justify-center text-2xl shadow-lg shadow-[#667eea]/30">
              💼
            </div>
            <div className="flex flex-col">
              <h1 className="text-2xl font-bold bg-gradient-to-b from-white to-gray-200 bg-clip-text text-transparent">FINANCE PRO</h1>
              <p className="text-xs text-white/60">Sistema Integrado de Gestão Financeira</p>
            </div>
          </div>
          
          <div className="flex items-center gap-5">
            <div className="relative cursor-pointer p-2 transition-transform hover:scale-110">
              <span className={`absolute -top-1 -right-1 text-xs font-bold py-1 px-2 rounded-full ${
                notificationCount > 10 ? 'bg-red-600' : notificationCount > 5 ? 'bg-yellow-500' : 'bg-red-500'
              }`}>
                {notificationCount}
              </span>
              🔔
            </div>
            
            <div className="relative user-menu">
              <div 
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="flex items-center gap-3 py-2 px-4 bg-white/10 rounded-full cursor-pointer transition-all hover:bg-white/15"
              >
                <span>{user?.nome || user?.name || 'Usuário'}</span>
                <div className="w-9 h-9 bg-gradient-to-br from-[#667eea] to-[#764ba2] rounded-full flex items-center justify-center font-bold">
                  {(user?.nome || user?.name || 'U').charAt(0).toUpperCase()}
                </div>
                <ChevronDown className={`w-4 h-4 transition-transform ${isUserMenuOpen ? 'rotate-180' : ''}`} />
              </div>
              
              {/* Dropdown Menu */}
              {isUserMenuOpen && (
                <div className="absolute right-0 top-full mt-2 w-48 bg-white/95 backdrop-blur-md border border-white/20 rounded-xl shadow-2xl shadow-black/20 py-2 z-50">
                  <div className="px-4 py-3 border-b border-white/10">
                    <div className="text-sm font-semibold text-gray-800">{user?.nome || user?.name || 'Usuário'}</div>
                    <div className="text-xs text-gray-600">{user?.email || 'email@exemplo.com'}</div>
                    <div className="text-xs text-gray-500 mt-1">{user?.role || 'Administrador'}</div>
                  </div>
                  
                  <button
                    onClick={() => handleUserMenuAction('profile')}
                    className="w-full flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-white/50 transition-colors"
                  >
                    <User className="w-4 h-4" />
                    Perfil
                  </button>
                  
                  <button
                    onClick={() => handleUserMenuAction('settings')}
                    className="w-full flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-white/50 transition-colors"
                  >
                    <Settings className="w-4 h-4" />
                    Configurações
                  </button>
                  
                  <div className="border-t border-white/10 my-1"></div>
                  
                  <button
                    onClick={() => handleUserMenuAction('logout')}
                    className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-600 hover:bg-red-50 transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    Sair
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto mt-28 px-10 pb-10">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-10">
          <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6 transition-all hover:-translate-y-1 hover:bg-white/8 hover:shadow-2xl hover:shadow-black/30">
            <div className="w-12 h-12 bg-gradient-to-br from-[#667eea] to-[#764ba2] rounded-xl flex items-center justify-center text-2xl mb-4">
              📄
            </div>
            <div className="text-3xl font-bold bg-gradient-to-b from-white to-gray-200 bg-clip-text text-transparent">247</div>
            <div className="text-sm text-white/60 mb-2">Documentos Processados</div>
            <span className="inline-block mt-2 px-3 py-1 rounded-full text-xs font-semibold bg-green-500/20 text-green-400">
              ↑ 15% vs mês anterior
            </span>
          </div>
          
          <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6 transition-all hover:-translate-y-1 hover:bg-white/8 hover:shadow-2xl hover:shadow-black/30">
            <div className="w-12 h-12 bg-gradient-to-br from-[#10b981] to-[#059669] rounded-xl flex items-center justify-center text-2xl mb-4">
              💰
            </div>
            <div className="text-3xl font-bold bg-gradient-to-b from-white to-gray-200 bg-clip-text text-transparent">87.3%</div>
            <div className="text-sm text-white/60 mb-2">Execução Orçamental</div>
            <span className="inline-block mt-2 px-3 py-1 rounded-full text-xs font-semibold bg-red-500/20 text-red-400">
              ↓ 12.7% do plano
            </span>
          </div>
          
          <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6 transition-all hover:-translate-y-1 hover:bg-white/8 hover:shadow-2xl hover:shadow-black/30">
            <div className="w-12 h-12 bg-gradient-to-br from-[#f59e0b] to-[#d97706] rounded-xl flex items-center justify-center text-2xl mb-4">
              📊
            </div>
            <div className="text-3xl font-bold bg-gradient-to-b from-white to-gray-200 bg-clip-text text-transparent">1.2</div>
            <div className="text-sm text-white/60 mb-2">Índice de Liquidez</div>
            <span className="inline-block mt-2 px-3 py-1 rounded-full text-xs font-semibold bg-green-500/20 text-green-400">
              ↑ 0.1 melhor
            </span>
          </div>
          
          <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6 transition-all hover:-translate-y-1 hover:bg-white/8 hover:shadow-2xl hover:shadow-black/30">
            <div className="w-12 h-12 bg-gradient-to-br from-[#ef4444] to-[#dc2626] rounded-xl flex items-center justify-center text-2xl mb-4">
              ⚠️
            </div>
            <div className="text-3xl font-bold bg-gradient-to-b from-white to-gray-200 bg-clip-text text-transparent">3</div>
            <div className="text-sm text-white/60 mb-2">Riscos Críticos</div>
            <span className="inline-block mt-2 px-3 py-1 rounded-full text-xs font-semibold bg-red-500/20 text-red-400">
              ↓ 2 resolvidos
            </span>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-8 mb-10">
          <h3 className="text-lg font-semibold text-white/90 mb-4">Ações Rápidas</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <button 
              onClick={() => quickAction('upload')}
              className="py-4 px-5 bg-white/5 border border-white/10 rounded-xl text-white text-sm cursor-pointer transition-all hover:bg-white/10 hover:-translate-y-0.5 flex items-center gap-3"
            >
              📤 Carregar Documento
            </button>
            <button 
              onClick={() => quickAction('report')}
              className="py-4 px-5 bg-white/5 border border-white/10 rounded-xl text-white text-sm cursor-pointer transition-all hover:bg-white/10 hover:-translate-y-0.5 flex items-center gap-3"
            >
              📈 Gerar Relatório
            </button>
            <button 
              onClick={() => quickAction('budget')}
              className="py-4 px-5 bg-white/5 border border-white/10 rounded-xl text-white text-sm cursor-pointer transition-all hover:bg-white/10 hover:-translate-y-0.5 flex items-center gap-3"
            >
              💵 Novo Orçamento
            </button>
            <button 
              onClick={() => quickAction('alert')}
              className="py-4 px-5 bg-white/5 border border-white/10 rounded-xl text-white text-sm cursor-pointer transition-all hover:bg-white/10 hover:-translate-y-0.5 flex items-center gap-3"
            >
              🔔 Ver Alertas
            </button>
          </div>
        </div>

        {/* Modules Section */}
        <section className="mb-10">
          <h2 className="text-2xl text-white/90 mb-6">Módulos Principais</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Centro de Controle */}
            <div 
              onClick={() => openModule('dashboard')}
              className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-7 cursor-pointer transition-all hover:-translate-y-2 hover:scale-102 hover:bg-white/8 hover:shadow-2xl hover:shadow-black/40 hover:border-white/20 relative overflow-hidden group"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent to-white/5 transform -translate-x-full group-hover:translate-x-full transition-transform duration-600"></div>
              <div className="w-14 h-14 bg-gradient-to-br from-[#667eea] to-[#764ba2] rounded-xl flex items-center justify-center text-2xl mb-5">
                🎯
              </div>
              <h3 className="text-lg font-semibold mb-3">Centro de Controle</h3>
              <p className="text-sm text-white/60 leading-relaxed mb-5">Dashboard principal com visão geral de todos os agentes e métricas em tempo real</p>
              <div className="flex justify-between items-center">
                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-green-500/20 text-green-400">5 Agentes Ativos</span>
                <span className="text-white/40 group-hover:text-white/80 group-hover:translate-x-1 transition-all">→</span>
              </div>
            </div>

            {/* Captura de Documentos */}
            <div 
              onClick={() => openModule('capture')}
              className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-7 cursor-pointer transition-all hover:-translate-y-2 hover:scale-102 hover:bg-white/8 hover:shadow-2xl hover:shadow-black/40 hover:border-white/20 relative overflow-hidden group"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent to-white/5 transform -translate-x-full group-hover:translate-x-full transition-transform duration-600"></div>
              <div className="w-14 h-14 bg-gradient-to-br from-[#3b82f6] to-[#2563eb] rounded-xl flex items-center justify-center text-2xl mb-5">
                📸
              </div>
              <h3 className="text-lg font-semibold mb-3">Captura & OCR</h3>
              <p className="text-sm text-white/60 leading-relaxed mb-5">Upload, digitalização e extração automática de texto de documentos financeiros</p>
              <div className="flex justify-between items-center">
                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-green-500/20 text-green-400">99.2% Precisão</span>
                <span className="text-white/40 group-hover:text-white/80 group-hover:translate-x-1 transition-all">→</span>
              </div>
            </div>

            {/* Classificação PGC-AO */}
            <div 
              onClick={() => openModule('classification')}
              className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-7 cursor-pointer transition-all hover:-translate-y-2 hover:scale-102 hover:bg-white/8 hover:shadow-2xl hover:shadow-black/40 hover:border-white/20 relative overflow-hidden group"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent to-white/5 transform -translate-x-full group-hover:translate-x-full transition-transform duration-600"></div>
              <div className="w-14 h-14 bg-gradient-to-br from-[#f687b3] to-[#ed64a6] rounded-xl flex items-center justify-center text-2xl mb-5">
                🏷️
              </div>
              <h3 className="text-lg font-semibold mb-3">Classificação PGC-AO</h3>
              <p className="text-sm text-white/60 leading-relaxed mb-5">Mapeamento inteligente e automático para o Plano Geral de Contabilidade de Angola</p>
              <div className="flex justify-between items-center">
                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-green-500/20 text-green-400">96.5% Confiança</span>
                <span className="text-white/40 group-hover:text-white/80 group-hover:translate-x-1 transition-all">→</span>
              </div>
            </div>

            {/* Orçamento */}
            <div 
              onClick={() => openModule('budget')}
              className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-7 cursor-pointer transition-all hover:-translate-y-2 hover:scale-102 hover:bg-white/8 hover:shadow-2xl hover:shadow-black/40 hover:border-white/20 relative overflow-hidden group"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent to-white/5 transform -translate-x-full group-hover:translate-x-full transition-transform duration-600"></div>
              <div className="w-14 h-14 bg-gradient-to-br from-[#10b981] to-[#059669] rounded-xl flex items-center justify-center text-2xl mb-5">
                📋
              </div>
              <h3 className="text-lg font-semibold mb-3">Gestão Orçamental</h3>
              <p className="text-sm text-white/60 leading-relaxed mb-5">Criação, validação e acompanhamento de orçamentos anuais e mensais</p>
              <div className="flex justify-between items-center">
                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-green-500/20 text-green-400">ORÇ/2025/001</span>
                <span className="text-white/40 group-hover:text-white/80 group-hover:translate-x-1 transition-all">→</span>
              </div>
            </div>

            {/* Tesouraria */}
            <div 
              onClick={() => openModule('treasury')}
              className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-7 cursor-pointer transition-all hover:-translate-y-2 hover:scale-102 hover:bg-white/8 hover:shadow-2xl hover:shadow-black/40 hover:border-white/20 relative overflow-hidden group"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent to-white/5 transform -translate-x-full group-hover:translate-x-full transition-transform duration-600"></div>
              <div className="w-14 h-14 bg-gradient-to-br from-[#ed8936] to-[#dd6b20] rounded-xl flex items-center justify-center text-2xl mb-5">
                💰
              </div>
              <h3 className="text-lg font-semibold mb-3">Tesouraria</h3>
              <p className="text-sm text-white/60 leading-relaxed mb-5">Gestão de fluxo de caixa, liquidez e planeamento financeiro mensal</p>
              <div className="flex justify-between items-center">
                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-green-500/20 text-green-400">2.5M Kz Saldo</span>
                <span className="text-white/40 group-hover:text-white/80 group-hover:translate-x-1 transition-all">→</span>
              </div>
            </div>

            {/* Análise de Riscos */}
            <div 
              onClick={() => openModule('risks')}
              className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-7 cursor-pointer transition-all hover:-translate-y-2 hover:scale-102 hover:bg-white/8 hover:shadow-2xl hover:shadow-black/40 hover:border-white/20 relative overflow-hidden group"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent to-white/5 transform -translate-x-full group-hover:translate-x-full transition-transform duration-600"></div>
              <div className="w-14 h-14 bg-gradient-to-br from-[#ef4444] to-[#dc2626] rounded-xl flex items-center justify-center text-2xl mb-5">
                ⚠️
              </div>
              <h3 className="text-lg font-semibold mb-3">Análise de Riscos</h3>
              <p className="text-sm text-white/60 leading-relaxed mb-5">Identificação, monitoramento e planos de contingência para riscos financeiros</p>
              <div className="flex justify-between items-center">
                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-green-500/20 text-green-400">Score: 75</span>
                <span className="text-white/40 group-hover:text-white/80 group-hover:translate-x-1 transition-all">→</span>
              </div>
            </div>

            {/* Execução Orçamental */}
            <div 
              onClick={() => openModule('execution')}
              className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-7 cursor-pointer transition-all hover:-translate-y-2 hover:scale-102 hover:bg-white/8 hover:shadow-2xl hover:shadow-black/40 hover:border-white/20 relative overflow-hidden group"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent to-white/5 transform -translate-x-full group-hover:translate-x-full transition-transform duration-600"></div>
              <div className="w-14 h-14 bg-gradient-to-br from-[#48bb78] to-[#38a169] rounded-xl flex items-center justify-center text-2xl mb-5">
                📊
              </div>
              <h3 className="text-lg font-semibold mb-3">Execução Orçamental</h3>
              <p className="text-sm text-white/60 leading-relaxed mb-5">Comparação em tempo real entre orçado e realizado com análise de desvios</p>
              <div className="flex justify-between items-center">
                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-green-500/20 text-green-400">87.3% Executado</span>
                <span className="text-white/40 group-hover:text-white/80 group-hover:translate-x-1 transition-all">→</span>
              </div>
            </div>

            {/* Relatórios */}
            <div 
              onClick={() => openModule('reports')}
              className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-7 cursor-pointer transition-all hover:-translate-y-2 hover:scale-102 hover:bg-white/8 hover:shadow-2xl hover:shadow-black/40 hover:border-white/20 relative overflow-hidden group"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent to-white/5 transform -translate-x-full group-hover:translate-x-full transition-transform duration-600"></div>
              <div className="w-14 h-14 bg-gradient-to-br from-[#8b5cf6] to-[#7c3aed] rounded-xl flex items-center justify-center text-2xl mb-5">
                📑
              </div>
              <h3 className="text-lg font-semibold mb-3">Relatórios Executivos</h3>
              <p className="text-sm text-white/60 leading-relaxed mb-5">Geração automática de relatórios consolidados e dashboards executivos</p>
              <div className="flex justify-between items-center">
                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-green-500/20 text-green-400">12 Modelos</span>
                <span className="text-white/40 group-hover:text-white/80 group-hover:translate-x-1 transition-all">→</span>
              </div>
            </div>

            {/* Configurações */}
            <div 
              onClick={() => openModule('settings')}
              className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-7 cursor-pointer transition-all hover:-translate-y-2 hover:scale-102 hover:bg-white/8 hover:shadow-2xl hover:shadow-black/40 hover:border-white/20 relative overflow-hidden group"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent to-white/5 transform -translate-x-full group-hover:translate-x-full transition-transform duration-600"></div>
              <div className="w-14 h-14 bg-gradient-to-br from-[#6b7280] to-[#4b5563] rounded-xl flex items-center justify-center text-2xl mb-5">
                ⚙️
              </div>
              <h3 className="text-lg font-semibold mb-3">Configurações</h3>
              <p className="text-sm text-white/60 leading-relaxed mb-5">Gestão de utilizadores, permissões e parametrização do sistema</p>
              <div className="flex justify-between items-center">
                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-green-500/20 text-green-400">Sistema</span>
                <span className="text-white/40 group-hover:text-white/80 group-hover:translate-x-1 transition-all">→</span>
              </div>
            </div>
          </div>
        </section>

        {/* Recent Activity */}
        <section>
          <h2 className="text-2xl text-white/90 mb-6">Atividade Recente</h2>
          <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6">
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-4 p-4 bg-white/5 rounded-xl">
                <span className="text-xl">✅</span>
                <div className="flex-1">
                  <div className="text-sm text-white">Factura #2025-142 processada com sucesso</div>
                  <div className="text-xs text-white/50 mt-1">Há 2 minutos</div>
                </div>
                <span className="text-green-400 text-sm">Classificado: 714</span>
              </div>
              
              <div className="flex items-center gap-4 p-4 bg-white/5 rounded-xl">
                <span className="text-xl">⚠️</span>
                <div className="flex-1">
                  <div className="text-sm text-white">Alerta: Liquidez crítica prevista para dia 25</div>
                  <div className="text-xs text-white/50 mt-1">Há 15 minutos</div>
                </div>
                <span className="text-yellow-400 text-sm">Ação Requerida</span>
              </div>
              
              <div className="flex items-center gap-4 p-4 bg-white/5 rounded-xl">
                <span className="text-xl">📊</span>
                <div className="flex-1">
                  <div className="text-sm text-white">Relatório mensal de Outubro gerado</div>
                  <div className="text-xs text-white/50 mt-1">Há 1 hora</div>
                </div>
                <span className="text-purple-400 text-sm">PDF Disponível</span>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="text-center py-10 text-white/40 text-sm border-t border-white/10 mt-16">
        <p>© 2025 FINANCE PRO - Sistema Multi-Agente com Conformidade PGC-AO</p>
        <p className="mt-1">Versão 2.0.1 | Última atualização: 18/09/2025</p>
      </footer>
    </div>
  );
};

export default Dashboard;