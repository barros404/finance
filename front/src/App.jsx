import React, { useState } from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import RecuperarSenha from './pages/RecuperarSenha';
import Orcamento from './pages/Orcamento';
import Tesouraria from './pages/Tesouraria';
import Relatorios from './pages/Relatorios';
import Configuracoes from './pages/Configuracoes';
import NovoOrcamento from './pages/NovoOrcamento';
import NovoTesouraria from './pages/NovoTesouraria';
import OutputCenter from './pages/OutputCenter';
import UploadDocumentos from './pages/UploadDocumentos';
import VerOrcamento from './components/VerOrcamento';
import EditarOrcamento from './components/EditarOrcamento';
// Importar páginas dos módulos
import CapturaDocumentos from './pages/modules/CapturaDocumentos';
import ClassificacaoPGC from './pages/modules/ClassificacaoPGC';
import AnaliseRiscos from './pages/modules/AnaliseRiscos';
import ExecucaoOrcamental from './pages/modules/ExecucaoOrcamental';
import PlanoExecucao from './pages/modules/PlanoExecucao';
import RelatoriosExecutivos from './pages/modules/RelatoriosExecutivos';
// Importar novas telas
import MenuPrincipal from './components/MenuPrincipal';
import DashboardCentralOutputs from './pages/DashboardCentralOutputs';
import ProcessamentoOCR from './pages/ProcessamentoOCR';
import ValidacaoContasPGC from './pages/ValidacaoContasPGC';
import FormularioOrcamentoAnual from './pages/FormularioOrcamentoAnual';
import RelatorioFinalConsolidado from './pages/RelatorioFinalConsolidado';
import PlanoTesourariaMensal from './pages/PlanoTesourariaMensal';
import FormularioPlanoTesouraria from './pages/FormularioPlanoTesouraria';
import DashboardTesouraria from './pages/DashboardTesouraria';
import DashboardCentroControle from './pages/DashboardCentroControle';
import TelaOrcamento from './pages/TelaOrcamento';
import Aprovacao from './pages/Aprovacao';
import VisualizarExecucaoOrcamental from './pages/VisualizarExecucaoOrcamental';
import VisualizarPlanoExecucao from './pages/VisualizarPlanoExecucao';
import GerenciarUsuarios from './pages/GerenciarUsuarios';
import DiagnosticPage from './pages/DiagnosticPage';
import ApiConnectionTest from './components/ApiConnectionTest';

function AppContent() {
  const { isAuthenticated, loading } = useAuth();
  const [recuperarSenha, setRecuperarSenha] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Extrai o nome da página atual do caminho da URL
  const getPaginaAtual = () => {
    const path = location.pathname.split('/')[1] || 'dashboard';
    return path === '' ? 'dashboard' : path;
  };

  const handleRecuperarSenha = () => {
    setRecuperarSenha(true);
  };

  const handleVoltarLogin = () => {
    setRecuperarSenha(false);
  };

  // Mostrar loading enquanto verifica autenticação
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-100 via-purple-50 to-blue-100">
        <div className="w-20 h-20 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // Se o usuário não estiver autenticado, mostra a tela de login ou recuperação de senha
  if (!isAuthenticated) {
    return recuperarSenha ? (
      <RecuperarSenha onVoltarLogin={handleVoltarLogin} />
    ) : (
      <Login onRecuperarSenha={handleRecuperarSenha} />
    );
  }

  // Se o usuário estiver autenticado, renderiza o layout com as rotas
  return (
    <>
      <Layout paginaAtual={getPaginaAtual()} setPaginaAtual={(pagina) => navigate(`/${pagina}`)}>
        <Routes>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/orcamento" element={<Orcamento />} />
        <Route path="/orcamento/:id" element={<VerOrcamento />} />
        <Route path="/orcamento/:id/editar" element={<EditarOrcamento />} />
        <Route path='/outputCenter' element={<OutputCenter />} />
        <Route path="/tesouraria" element={<Tesouraria />} />
        <Route path="/relatorios" element={<Relatorios />} />
        <Route path="/configuracoes" element={<Configuracoes />} />
        <Route path="/novo-orcamento" element={<NovoOrcamento />} />
        <Route path="/nova-tesouraria" element={<NovoTesouraria />} />
        <Route path="/upload-documentos" element={<UploadDocumentos />} />
        {/* Rotas dos módulos */}
        <Route path="/captura-documentos" element={<CapturaDocumentos />} />
        <Route path="/classificacao-pgc" element={<ClassificacaoPGC />} />
        <Route path="/analise-riscos" element={<AnaliseRiscos />} />
        <Route path="/execucao-orcamental" element={<ExecucaoOrcamental />} />
        <Route path="/plano-execucao" element={<PlanoExecucao />} />
        <Route path="/relatorios-executivos" element={<RelatoriosExecutivos />} />
        {/* Novas rotas */}
        <Route path="/menu-principal" element={<MenuPrincipal />} />
        <Route path="/dashboard-central-outputs" element={<DashboardCentralOutputs />} />
        <Route path="/processamento-ocr" element={<ProcessamentoOCR />} />
        <Route path="/validacao-contas-pgc" element={<ValidacaoContasPGC />} />
        <Route path="/formulario-orcamento-anual" element={<FormularioOrcamentoAnual />} />
        <Route path="/relatorio-final-consolidado" element={<RelatorioFinalConsolidado />} />
        <Route path="/plano-tesouraria-mensal" element={<PlanoTesourariaMensal />} />
        <Route path="/formulario-plano-tesouraria" element={<FormularioPlanoTesouraria />} />
        <Route path="/dashboard-tesouraria" element={<DashboardTesouraria />} />
        <Route path="/dashboard-centro-controle" element={<DashboardCentroControle />} />
        <Route path="/tela-orcamento" element={<TelaOrcamento />} />
        <Route path="/aprovacao" element={<Aprovacao />} />
        <Route path="/visualizar-execucao-orcamental/:id" element={<VisualizarExecucaoOrcamental />} />
        <Route path="/visualizar-plano-execucao/:id" element={<VisualizarPlanoExecucao />} />
        <Route path="/gerenciar-usuarios" element={<GerenciarUsuarios />} />
        <Route path="/diagnostico" element={<DiagnosticPage />} />
        <Route path="/" element={<Dashboard />} />
        <Route path="*" element={<h1>Página não encontrada</h1>} />
      </Routes>
    </Layout>
    <ApiConnectionTest />
    </>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;