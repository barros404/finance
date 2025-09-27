import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { 
  Save, 
  User, 
  Bell, 
  Shield, 
  Database, 
  Palette, 
  Globe, 
  Lock, 
  Eye, 
  EyeOff, 
  Key, 
  AlertCircle, 
  CheckCircle, 
  Settings, 
  Upload, 
  Download, 
  RefreshCw, 
  Trash2, 
  Edit3,
  Camera,
  Mail,
  Phone,
  MapPin,
  Building2,
  Calendar,
  Clock,
  HardDrive,
  Wifi,
  Monitor,
  Smartphone,
  Tablet
} from 'lucide-react';

const Configuracoes = () => {
  const { user, updateUser } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [activeTab, setActiveTab] = useState('perfil');
  const [showPassword, setShowPassword] = useState(false);
  
  const [configuracoes, setConfiguracoes] = useState({
    notificacoes: true,
    notificacoesEmail: true,
    notificacoesPush: false,
    backupAutomatico: true,
    temaEscuro: false,
    idioma: 'pt-AO',
    moedaPadrao: 'AOA',
    formatoData: 'DD/MM/YYYY',
    timezone: 'Africa/Luanda',
    frequenciaBackup: 'diario',
    retencaoBackup: 30,
    sessaoTimeout: 60,
    autenticacao2FA: false,
    logAuditoria: true
  });

  const [perfilUsuario, setPerfilUsuario] = useState({
    nome: user?.nome || 'Administrador',
    email: user?.email || 'admin@financepro.com',
    cargo: user?.cargo || 'Master',
    departamento: user?.departamento || 'IT',
    telefone: user?.telefone || '929995660',
    endereco: user?.endereco || '',
    empresa: user?.empresa?.nome || 'EndiAgro',
    avatar: user?.avatar || null,
    bio: user?.bio || 'Direitor de IT , Densevolvidor e Enginheiro Informatico '
  });

  const [senhaAtual, setSenhaAtual] = useState({
    atual: '',
    nova: '',
    confirmar: ''
  });

  const [dispositivos, setDispositivos] = useState([
    {
      id: 1,
      nome: 'Chrome - Linux Ubunto',
      tipo: 'desktop',
      ultimoAcesso: '2025-09-22T00:30:00Z',
      localizacao: 'Luanda, Angola',
      ativo: true
    },
    {
      id: 2,
      nome: 'Androide 15',
      tipo: 'mobile',
      ultimoAcesso: '2025-09-21T15:45:00Z',
      localizacao: 'Luanda, Angola',
      ativo: true
    },
    {
      id: 3,
      nome: 'Firefox - Linux Ubuntu 22.04',
      tipo: 'desktop',
      ultimoAcesso: '2025-09-19T09:15:00Z',
      localizacao: 'Luanda, Angola',
      ativo: false
    }
  ]);

  const [backupStatus, setBackupStatus] = useState({
    ultimoBackup: '2024-12-01T03:00:00Z',
    proximoBackup: '2024-12-02T03:00:00Z',
    tamanhoTotal: '2.4 GB',
    status: 'ativo',
    backups: [
      { data: '2024-12-01', tamanho: '2.4 GB', status: 'sucesso' },
      { data: '2024-11-30', tamanho: '2.3 GB', status: 'sucesso' },
      { data: '2024-11-29', tamanho: '2.2 GB', status: 'sucesso' }
    ]
  });

  useEffect(() => {
    // Carregar configurações do usuário
    carregarConfiguracoes();
  }, []);

  const carregarConfiguracoes = async () => {
    try {
      setIsLoading(true);
      // Simular carregamento de configurações
      await new Promise(resolve => setTimeout(resolve, 1000));
      console.log('✅ Configurações carregadas');
    } catch (err) {
      setError('Erro ao carregar configurações');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Simular salvamento
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Atualizar perfil do usuário
      if (updateUser) {
        await updateUser(perfilUsuario);
      }
      
      setSuccess('Configurações salvas com sucesso!');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError('Erro ao salvar configurações');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePerfilChange = (campo, valor) => {
    setPerfilUsuario(prev => ({ ...prev, [campo]: valor }));
  };

  const handleConfigChange = (campo, valor) => {
    setConfiguracoes(prev => ({ ...prev, [campo]: valor }));
  };

  const handleSenhaChange = async () => {
    if (senhaAtual.nova !== senhaAtual.confirmar) {
      setError('As senhas não coincidem');
      return;
    }
    
    try {
      setIsLoading(true);
      // Simular alteração de senha
      await new Promise(resolve => setTimeout(resolve, 1500));
      setSuccess('Senha alterada com sucesso!');
      setSenhaAtual({ atual: '', nova: '', confirmar: '' });
    } catch (err) {
      setError('Erro ao alterar senha');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackupNow = async () => {
    try {
      setIsLoading(true);
      // Simular backup
      await new Promise(resolve => setTimeout(resolve, 3000));
      setSuccess('Backup realizado com sucesso!');
    } catch (err) {
      setError('Erro ao realizar backup');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRevokeDevice = (deviceId) => {
    setDispositivos(prev => prev.filter(d => d.id !== deviceId));
    setSuccess('Dispositivo revogado com sucesso!');
  };

  const formatarData = (data) => {
    return new Date(data).toLocaleString('pt-AO');
  };

  const getDeviceIcon = (tipo) => {
    switch (tipo) {
      case 'desktop': return <Monitor className="w-5 h-5" />;
      case 'mobile': return <Smartphone className="w-5 h-5" />;
      case 'tablet': return <Tablet className="w-5 h-5" />;
      default: return <Monitor className="w-5 h-5" />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f0c29] via-[#302b63] to-[#24243e] text-white overflow-x-hidden">
      {/* Header */}
      <header className="bg-white/5 backdrop-blur-md border-b border-white/10 py-5 px-10 fixed w-full top-0 z-40 animate-slideDown">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-[#667eea] to-[#764ba2] rounded-xl flex items-center justify-center text-2xl shadow-lg shadow-[#667eea]/30">
              <Settings className="w-6 h-6" />
            </div>
            <div className="flex flex-col">
              <h1 className="text-2xl font-bold bg-gradient-to-b from-white to-gray-200 bg-clip-text text-transparent">CONFIGURAÇÕES</h1>
              <p className="text-xs text-white/60">Personalize sua experiência no sistema</p>
            </div>
          </div>
          
          <button
            onClick={handleSave}
            disabled={isLoading}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#667eea] to-[#764ba2] text-white rounded-xl hover:from-[#5a67d8] hover:to-[#6b46c1] transition-all duration-300 shadow-lg shadow-[#667eea]/30 transform hover:scale-105 font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <RefreshCw className="w-5 h-5 animate-spin" />
                Salvando...
              </>
            ) : (
              <>
                <Save className="w-5 h-5" />
                Salvar
              </>
            )}
          </button>
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

        {/* Tabs de Navegação */}
        <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-2 mb-8">
          <div className="flex flex-wrap gap-2">
            {[
              { id: 'perfil', label: 'Perfil', icon: User },
              { id: 'seguranca', label: 'Segurança', icon: Shield },
              { id: 'notificacoes', label: 'Notificações', icon: Bell },
              { id: 'sistema', label: 'Sistema', icon: Settings },
              { id: 'backup', label: 'Backup', icon: Database },
              { id: 'dispositivos', label: 'Dispositivos', icon: Monitor }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all font-semibold ${
                  activeTab === tab.id
                    ? 'bg-gradient-to-r from-[#667eea] to-[#764ba2] text-white shadow-lg'
                    : 'text-white/70 hover:text-white hover:bg-white/10'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Conteúdo das Abas */}
        {activeTab === 'perfil' && (
          <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl shadow-2xl shadow-black/30 overflow-hidden">
            <div className="p-6 border-b border-white/10 bg-gradient-to-r from-white/5 to-white/10">
              <div className="flex items-center gap-3">
                <User className="w-6 h-6 text-blue-400" />
                <h2 className="text-xl font-bold text-white">Perfil do Usuário</h2>
              </div>
            </div>
            
            <div className="p-8 space-y-6">
              {/* Avatar */}
              <div className="flex items-center gap-6">
                <div className="w-20 h-20 bg-gradient-to-br from-[#667eea] to-[#764ba2] rounded-2xl flex items-center justify-center text-2xl shadow-lg">
                  {perfilUsuario.avatar ? (
                    <img src={perfilUsuario.avatar} alt="Avatar" className="w-full h-full rounded-2xl object-cover" />
                  ) : (
                    <User className="w-10 h-10 text-white" />
                  )}
                </div>
                <div>
                  <button className="flex items-center gap-2 px-4 py-2 bg-white/10 text-white rounded-xl hover:bg-white/20 transition-all">
                    <Camera className="w-4 h-4" />
                    Alterar Foto
                  </button>
                  <p className="text-xs text-white/60 mt-1">JPG, PNG até 2MB</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-white/80 mb-2">Nome Completo</label>
                  <input
                    type="text"
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-white placeholder-white/50"
                    value={perfilUsuario.nome}
                    onChange={(e) => handlePerfilChange('nome', e.target.value)}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-white/80 mb-2">E-mail</label>
                  <input
                    type="email"
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-white placeholder-white/50"
                    value={perfilUsuario.email}
                    onChange={(e) => handlePerfilChange('email', e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-white/80 mb-2">Cargo</label>
                  <input
                    type="text"
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-white placeholder-white/50"
                    value={perfilUsuario.cargo}
                    onChange={(e) => handlePerfilChange('cargo', e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-white/80 mb-2">Departamento</label>
                  <input
                    type="text"
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-white placeholder-white/50"
                    value={perfilUsuario.departamento}
                    onChange={(e) => handlePerfilChange('departamento', e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-white/80 mb-2">Telefone</label>
                  <input
                    type="tel"
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-white placeholder-white/50"
                    value={perfilUsuario.telefone}
                    onChange={(e) => handlePerfilChange('telefone', e.target.value)}
                    placeholder="+244 999 999 999"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-white/80 mb-2">Empresa</label>
                  <input
                    type="text"
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-white placeholder-white/50"
                    value={perfilUsuario.empresa}
                    onChange={(e) => handlePerfilChange('empresa', e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-white/80 mb-2">Biografia</label>
                <textarea
                  rows={3}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-white placeholder-white/50 resize-none"
                  value={perfilUsuario.bio}
                  onChange={(e) => handlePerfilChange('bio', e.target.value)}
                  placeholder="Conte um pouco sobre você..."
                />
              </div>
            </div>
          </div>
        )}

        {activeTab === 'seguranca' && (
          <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl shadow-2xl shadow-black/30 overflow-hidden">
            <div className="p-6 border-b border-white/10 bg-gradient-to-r from-white/5 to-white/10">
              <div className="flex items-center gap-3">
                <Shield className="w-6 h-6 text-green-400" />
                <h2 className="text-xl font-bold text-white">Segurança</h2>
              </div>
            </div>
            
            <div className="p-8 space-y-6">
              {/* Alterar Senha */}
              <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
                <h3 className="text-lg font-semibold text-white mb-4">Alterar Senha</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-white/80 mb-2">Senha Atual</label>
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-white placeholder-white/50 pr-12"
                        value={senhaAtual.atual}
                        onChange={(e) => setSenhaAtual(prev => ({ ...prev, atual: e.target.value }))}
                        placeholder="Digite sua senha atual"
                      />
                      <button
                        type="button"
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/50 hover:text-white"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-semibold text-white/80 mb-2">Nova Senha</label>
                    <input
                      type="password"
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-white placeholder-white/50"
                      value={senhaAtual.nova}
                      onChange={(e) => setSenhaAtual(prev => ({ ...prev, nova: e.target.value }))}
                      placeholder="Digite sua nova senha"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-semibold text-white/80 mb-2">Confirmar Nova Senha</label>
                    <input
                      type="password"
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-white placeholder-white/50"
                      value={senhaAtual.confirmar}
                      onChange={(e) => setSenhaAtual(prev => ({ ...prev, confirmar: e.target.value }))}
                      placeholder="Confirme sua nova senha"
                    />
                  </div>
                  
                  <button
                    onClick={handleSenhaChange}
                    disabled={isLoading}
                    className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl hover:from-green-700 hover:to-emerald-700 transition-all font-semibold disabled:opacity-50"
                  >
                    <Key className="w-4 h-4" />
                    Alterar Senha
                  </button>
                </div>
              </div>

              {/* Autenticação 2FA */}
              <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-white">Autenticação de Dois Fatores</h3>
                    <p className="text-sm text-white/70 mt-1">Adicione uma camada extra de segurança à sua conta</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      className="sr-only peer"
                      checked={configuracoes.autenticacao2FA}
                      onChange={(e) => handleConfigChange('autenticacao2FA', e.target.checked)}
                    />
                    <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
              </div>

              {/* Timeout de Sessão */}
              <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
                <h3 className="text-lg font-semibold text-white mb-4">Timeout de Sessão</h3>
                <div className="flex items-center gap-4">
                  <label className="text-sm text-white/80">Tempo limite (minutos):</label>
                  <select
                    className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white"
                    value={configuracoes.sessaoTimeout}
                    onChange={(e) => handleConfigChange('sessaoTimeout', parseInt(e.target.value))}
                  >
                    <option value={30}>30 minutos</option>
                    <option value={60}>1 hora</option>
                    <option value={120}>2 horas</option>
                    <option value={240}>4 horas</option>
                    <option value={480}>8 horas</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'notificacoes' && (
          <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl shadow-2xl shadow-black/30 overflow-hidden">
            <div className="p-6 border-b border-white/10 bg-gradient-to-r from-white/5 to-white/10">
              <div className="flex items-center gap-3">
                <Bell className="w-6 h-6 text-yellow-400" />
                <h2 className="text-xl font-bold text-white">Notificações</h2>
              </div>
            </div>
            
            <div className="p-8 space-y-6">
              <div className="space-y-4">
                <label className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/10 hover:bg-white/10 transition-all">
                  <div>
                    <p className="font-semibold text-white">Notificações do Sistema</p>
                    <p className="text-sm text-white/70 mt-1">Receber alertas sobre atividades importantes</p>
                  </div>
                  <input
                    type="checkbox"
                    className="w-5 h-5 rounded text-blue-600 focus:ring-blue-500"
                    checked={configuracoes.notificacoes}
                    onChange={(e) => handleConfigChange('notificacoes', e.target.checked)}
                  />
                </label>
                
                <label className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/10 hover:bg-white/10 transition-all">
                  <div>
                    <p className="font-semibold text-white">Notificações por E-mail</p>
                    <p className="text-sm text-white/70 mt-1">Receber resumos diários e alertas críticos</p>
                  </div>
                  <input
                    type="checkbox"
                    className="w-5 h-5 rounded text-blue-600 focus:ring-blue-500"
                    checked={configuracoes.notificacoesEmail}
                    onChange={(e) => handleConfigChange('notificacoesEmail', e.target.checked)}
                  />
                </label>
                
                <label className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/10 hover:bg-white/10 transition-all">
                  <div>
                    <p className="font-semibold text-white">Notificações Push</p>
                    <p className="text-sm text-white/70 mt-1">Receber notificações no navegador</p>
                  </div>
                  <input
                    type="checkbox"
                    className="w-5 h-5 rounded text-blue-600 focus:ring-blue-500"
                    checked={configuracoes.notificacoesPush}
                    onChange={(e) => handleConfigChange('notificacoesPush', e.target.checked)}
                  />
                </label>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'sistema' && (
          <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl shadow-2xl shadow-black/30 overflow-hidden">
            <div className="p-6 border-b border-white/10 bg-gradient-to-r from-white/5 to-white/10">
              <div className="flex items-center gap-3">
                <Settings className="w-6 h-6 text-purple-400" />
                <h2 className="text-xl font-bold text-white">Preferências do Sistema</h2>
              </div>
            </div>
            
            <div className="p-8 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-white/80 mb-2">Idioma</label>
                  <select 
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-white"
                    value={configuracoes.idioma}
                    onChange={(e) => handleConfigChange('idioma', e.target.value)}
                  >
                    <option value="pt-AO">Português (Angola)</option>
                    <option value="pt-BR">Português (Brasil)</option>
                    <option value="en-US">English</option>
                    <option value="fr-FR">Français</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-white/80 mb-2">Moeda Padrão</label>
                  <select 
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-white"
                    value={configuracoes.moedaPadrao}
                    onChange={(e) => handleConfigChange('moedaPadrao', e.target.value)}
                  >
                    <option value="AOA">Kwanza Angolano (AOA)</option>
                    <option value="USD">Dólar Americano (USD)</option>
                    <option value="EUR">Euro (EUR)</option>
                    <option value="BRL">Real Brasileiro (BRL)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-white/80 mb-2">Formato de Data</label>
                  <select 
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-white"
                    value={configuracoes.formatoData}
                    onChange={(e) => handleConfigChange('formatoData', e.target.value)}
                  >
                    <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                    <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                    <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-white/80 mb-2">Fuso Horário</label>
                  <select 
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-white"
                    value={configuracoes.timezone}
                    onChange={(e) => handleConfigChange('timezone', e.target.value)}
                  >
                    <option value="Africa/Luanda">Luanda (GMT+1)</option>
                    <option value="Africa/Lagos">Lagos (GMT+1)</option>
                    <option value="Europe/Lisbon">Lisboa (GMT+0)</option>
                    <option value="America/New_York">Nova York (GMT-5)</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/10">
                <div>
                  <p className="font-semibold text-white">Tema Escuro</p>
                  <p className="text-sm text-white/70 mt-1">Ativar modo escuro para melhor visualização</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={configuracoes.temaEscuro}
                    onChange={(e) => handleConfigChange('temaEscuro', e.target.checked)}
                  />
                  <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'backup' && (
          <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl shadow-2xl shadow-black/30 overflow-hidden">
            <div className="p-6 border-b border-white/10 bg-gradient-to-r from-white/5 to-white/10">
              <div className="flex items-center gap-3">
                <Database className="w-6 h-6 text-emerald-400" />
                <h2 className="text-xl font-bold text-white">Backup e Segurança</h2>
              </div>
            </div>
            
            <div className="p-8 space-y-6">
              <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/10">
                <div>
                  <p className="font-semibold text-white">Backup Automático</p>
                  <p className="text-sm text-white/70 mt-1">Fazer backup dos dados automaticamente</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={configuracoes.backupAutomatico}
                    onChange={(e) => handleConfigChange('backupAutomatico', e.target.checked)}
                  />
                  <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-white/80 mb-2">Frequência de Backup</label>
                  <select 
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-white"
                    value={configuracoes.frequenciaBackup}
                    onChange={(e) => handleConfigChange('frequenciaBackup', e.target.value)}
                  >
                    <option value="diario">Diariamente</option>
                    <option value="semanal">Semanalmente</option>
                    <option value="mensal">Mensalmente</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-white/80 mb-2">Retenção (dias)</label>
                  <input
                    type="number"
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-white placeholder-white/50"
                    value={configuracoes.retencaoBackup}
                    onChange={(e) => handleConfigChange('retencaoBackup', parseInt(e.target.value))}
                    min="1"
                    max="365"
                  />
                </div>
              </div>

              <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
                <div className="flex items-start gap-3">
                  <Database className="w-6 h-6 text-emerald-400 mt-1" />
                  <div className="flex-1">
                    <h3 className="font-semibold text-white mb-2">Status do Backup</h3>
                    <p className="text-sm text-white/70 mb-3">
                      Último backup: {formatarData(backupStatus.ultimoBackup)}
                    </p>
                    <p className="text-sm text-white/70 mb-4">
                      Próximo backup: {formatarData(backupStatus.proximoBackup)}
                    </p>
                    <div className="flex gap-3">
                      <button 
                        onClick={handleBackupNow}
                        disabled={isLoading}
                        className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-xl text-sm hover:bg-emerald-700 transition-all font-semibold disabled:opacity-50"
                      >
                        <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                        Fazer Backup Agora
                      </button>
                      <button className="flex items-center gap-2 px-4 py-2 border border-white/20 text-white rounded-xl text-sm hover:bg-white/10 transition-all font-semibold">
                        <Download className="w-4 h-4" />
                        Ver Histórico
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'dispositivos' && (
          <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl shadow-2xl shadow-black/30 overflow-hidden">
            <div className="p-6 border-b border-white/10 bg-gradient-to-r from-white/5 to-white/10">
              <div className="flex items-center gap-3">
                <Monitor className="w-6 h-6 text-orange-400" />
                <h2 className="text-xl font-bold text-white">Dispositivos Conectados</h2>
              </div>
            </div>
            
            <div className="p-8">
              <div className="space-y-4">
                {dispositivos.map(dispositivo => (
                  <div key={dispositivo.id} className="bg-white/5 rounded-2xl p-6 border border-white/10 hover:bg-white/10 transition-all">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center">
                          {getDeviceIcon(dispositivo.tipo)}
                        </div>
                        <div>
                          <h3 className="font-semibold text-white">{dispositivo.nome}</h3>
                          <p className="text-sm text-white/70">{dispositivo.localizacao}</p>
                          <p className="text-xs text-white/50">
                            Último acesso: {formatarData(dispositivo.ultimoAcesso)}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          dispositivo.ativo 
                            ? 'bg-green-500/20 text-green-400 border border-green-500/30' 
                            : 'bg-gray-500/20 text-gray-400 border border-gray-500/30'
                        }`}>
                          {dispositivo.ativo ? 'Ativo' : 'Inativo'}
                        </span>
                        {!dispositivo.ativo && (
                          <button
                            onClick={() => handleRevokeDevice(dispositivo.id)}
                            className="p-2 text-red-400 hover:bg-red-500/20 rounded-xl transition-all"
                            title="Revogar acesso"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
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

export default Configuracoes;