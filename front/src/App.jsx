import React, { useState } from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import RecuperarSenha from './pages/RecuperarSenha';
import Layout from './components/Layout';
import Orcamento from './pages/Orcamento';
import Tesouraria from './pages/Tesouraria';
import Relatorios from './pages/Relatorios';
import Configuracoes from './pages/Configuracoes';
import NovoOrcamento from './pages/NovoOrcamento';
import NovoTesouraria from './pages/NovoTesouraria';
import OutputCenter from './pages/OutputCenter';
import VerOrcamento from './components/VerOrcamento';
import EditarOrcamento from './components/EditarOrcamento';

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
        <Route path="/" element={<Dashboard />} />
        <Route path="*" element={<h1>Página não encontrada</h1>} />
      </Routes>
    </Layout>
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