import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Eye, EyeOff, Mail, Lock, Plus, Search, Filter, FileText, Download, 
  Calendar, TrendingUp, TrendingDown, ChevronRight, Trash2, Save, 
  AlertCircle, CheckCircle, Edit2, X, ArrowRight, Database,
  BarChart3, DollarSign, Users, Building2, Home, LogOut, Menu,
  Settings, Bell, User, Loader2
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

// Componente de Login
const Login = ({ onRecuperarSenha }) => {
  const [credenciais, setCredenciais] = useState({
    email: '',
    senha: ''
  });
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [lembrar, setLembrar] = useState(false);
  const [error, setError] = useState('');
  const { login, loading } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      // Validar campos
      if (!credenciais.email || !credenciais.senha) {
        throw new Error('Por favor, preencha todos os campos');
      }

      // Fazer login usando o contexto
      await login({
        email: credenciais.email,
        senha: credenciais.senha
      });
      
      // Login bem-sucedido, navegar para dashboard
      navigate('/dashboard');
    } catch (error) {
      console.error('Erro no login:', error);
      setError(error.message || 'Erro ao fazer login. Verifique suas credenciais.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-100 via-purple-50 to-blue-100 p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl overflow-hidden">
        <div className="bg-gradient-to-r from-indigo-600 to-purple-700 p-8 text-white text-center">
          <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <Building2 className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold">Sistema de Gestão Financeira</h1>
          <p className="text-indigo-100 mt-2">Orçamentos e Tesouraria - PGC-AO</p>
        </div>
        
        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center">
                <AlertCircle className="w-5 h-5 text-red-500 mr-2" />
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              E-mail
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="email"
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                placeholder="seu@email.com"
                value={credenciais.email}
                onChange={(e) => setCredenciais({...credenciais, email: e.target.value})}
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Senha
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type={mostrarSenha ? "text" : "password"}
                className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                placeholder="Sua senha"
                value={credenciais.senha}
                onChange={(e) => setCredenciais({...credenciais, senha: e.target.value})}
                required
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                onClick={() => setMostrarSenha(!mostrarSenha)}
              >
                {mostrarSenha ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <label className="flex items-center">
              <input
                type="checkbox"
                className="rounded text-indigo-600 focus:ring-indigo-500"
                checked={lembrar}
                onChange={(e) => setLembrar(e.target.checked)}
              />
              <span className="ml-2 text-sm text-gray-600">Lembrar-me</span>
            </label>
            
            <button
              type="button"
              className="text-sm text-indigo-600 hover:text-indigo-800 font-medium"
              onClick={onRecuperarSenha}
            >
              Esqueceu a senha?
            </button>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-indigo-600 to-purple-700 text-white py-3 px-4 rounded-lg hover:from-indigo-700 hover:to-purple-800 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-all font-medium shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Entrando...
              </>
            ) : (
              'Entrar no Sistema'
            )}
          </button>
        </form>

        <div className="bg-gray-50 p-6 text-center border-t">
          <p className="text-sm text-gray-600">
            Sistema Híbrido de Gestão Financeira - Conformidade PGC-AO
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;