import React, { useState } from 'react';
import { Save, User, Bell, Shield, Database, Palette, Globe, Lock } from 'lucide-react';

const Configuracoes = () => {
  const [configuracoes, setConfiguracoes] = useState({
    notificacoes: true,
    notificacoesEmail: true,
    backupAutomatico: true,
    temaEscuro: false,
    idioma: 'pt-BR',
    moedaPadrao: 'AOA',
    formatoData: 'DD/MM/YYYY'
  });

  const [perfilUsuario, setPerfilUsuario] = useState({
    nome: 'Administrador',
    email: 'admin@financeiapro.com',
    cargo: 'Gestor Financeiro',
    departamento: 'Finanças'
  });

  const handleSave = () => {
    // Simulação de salvamento
    alert('Configurações salvas com sucesso!');
  };

  const handlePerfilChange = (campo, valor) => {
    setPerfilUsuario(prev => ({ ...prev, [campo]: valor }));
  };

  const handleConfigChange = (campo, valor) => {
    setConfiguracoes(prev => ({ ...prev, [campo]: valor }));
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
          Configurações
        </h1>
        <p className="text-gray-600 mt-2">Gerencie as configurações do sistema e personalize sua experiência</p>
      </div>

      {/* Perfil do Usuário */}
      <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
        <div className="p-6 border-b bg-gradient-to-r from-indigo-50 to-purple-50">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl shadow-lg">
              <User className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-xl font-bold text-gray-800">Configurações de Perfil</h2>
          </div>
        </div>
        
        <div className="p-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Nome Completo
              </label>
              <input
                type="text"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all bg-gray-50 focus:bg-white shadow-sm"
                value={perfilUsuario.nome}
                onChange={(e) => handlePerfilChange('nome', e.target.value)}
              />
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                E-mail
              </label>
              <input
                type="email"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all bg-gray-50 focus:bg-white shadow-sm"
                value={perfilUsuario.email}
                onChange={(e) => handlePerfilChange('email', e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Cargo
              </label>
              <input
                type="text"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all bg-gray-50 focus:bg-white shadow-sm"
                value={perfilUsuario.cargo}
                onChange={(e) => handlePerfilChange('cargo', e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Departamento
              </label>
              <input
                type="text"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all bg-gray-50 focus:bg-white shadow-sm"
                value={perfilUsuario.departamento}
                onChange={(e) => handlePerfilChange('departamento', e.target.value)}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Notificações */}
      <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
        <div className="p-6 border-b bg-gradient-to-r from-blue-50 to-indigo-50">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl shadow-lg">
              <Bell className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-xl font-bold text-gray-800">Notificações</h2>
          </div>
        </div>
        
        <div className="p-8 space-y-6">
          <label className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-blue-50 rounded-2xl border border-gray-200 hover:shadow-md transition-all">
            <div>
              <p className="font-semibold text-gray-800">Notificações do Sistema</p>
              <p className="text-sm text-gray-600 mt-1">Receber alertas sobre atividades importantes e atualizações</p>
            </div>
            <input
              type="checkbox"
              className="w-5 h-5 rounded text-indigo-600 focus:ring-indigo-500 border-2 border-gray-300"
              checked={configuracoes.notificacoes}
              onChange={(e) => handleConfigChange('notificacoes', e.target.checked)}
            />
          </label>
          
          <label className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-blue-50 rounded-2xl border border-gray-200 hover:shadow-md transition-all">
            <div>
              <p className="font-semibold text-gray-800">Notificações por E-mail</p>
              <p className="text-sm text-gray-600 mt-1">Receber resumos diários e alertas críticos por e-mail</p>
            </div>
            <input
              type="checkbox"
              className="w-5 h-5 rounded text-indigo-600 focus:ring-indigo-500 border-2 border-gray-300"
              checked={configuracoes.notificacoesEmail}
              onChange={(e) => handleConfigChange('notificacoesEmail', e.target.checked)}
            />
          </label>
        </div>
      </div>

      {/* Preferências do Sistema */}
      <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
        <div className="p-6 border-b bg-gradient-to-r from-purple-50 to-violet-50">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-gradient-to-r from-purple-500 to-violet-600 rounded-2xl shadow-lg">
              <Palette className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-xl font-bold text-gray-800">Preferências do Sistema</h2>
          </div>
        </div>
        
        <div className="p-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Idioma
              </label>
              <select 
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all bg-gray-50 focus:bg-white shadow-sm"
                value={configuracoes.idioma}
                onChange={(e) => handleConfigChange('idioma', e.target.value)}
              >
                <option value="pt-BR">Português (Brasil)</option>
                <option value="pt-AO">Português (Angola)</option>
                <option value="en-US">English</option>
                <option value="fr-FR">Français</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Moeda Padrão
              </label>
              <select 
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all bg-gray-50 focus:bg-white shadow-sm"
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
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Formato de Data
              </label>
              <select 
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all bg-gray-50 focus:bg-white shadow-sm"
                value={configuracoes.formatoData}
                onChange={(e) => handleConfigChange('formatoData', e.target.value)}
              >
                <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                <option value="YYYY-MM-DD">YYYY-MM-DD</option>
              </select>
            </div>

            <div className="flex items-center justify-center">
              <label className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-purple-50 rounded-2xl border border-gray-200 hover:shadow-md transition-all w-full">
                <div>
                  <p className="font-semibold text-gray-800">Tema Escuro</p>
                  <p className="text-sm text-gray-600 mt-1">Ativar modo escuro para melhor visualização</p>
                </div>
                <input
                  type="checkbox"
                  className="w-5 h-5 rounded text-indigo-600 focus:ring-indigo-500 border-2 border-gray-300"
                  checked={configuracoes.temaEscuro}
                  onChange={(e) => handleConfigChange('temaEscuro', e.target.checked)}
                />
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* Backup e Segurança */}
      <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
        <div className="p-6 border-b bg-gradient-to-r from-emerald-50 to-green-50">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-gradient-to-r from-emerald-500 to-green-600 rounded-2xl shadow-lg">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-xl font-bold text-gray-800">Backup e Segurança</h2>
          </div>
        </div>
        
        <div className="p-8 space-y-6">
          <label className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-emerald-50 rounded-2xl border border-gray-200 hover:shadow-md transition-all">
            <div>
              <p className="font-semibold text-gray-800">Backup Automático</p>
              <p className="text-sm text-gray-600 mt-1">Fazer backup dos dados automaticamente de forma regular</p>
            </div>
            <input
              type="checkbox"
              className="w-5 h-5 rounded text-indigo-600 focus:ring-indigo-500 border-2 border-gray-300"
              checked={configuracoes.backupAutomatico}
              onChange={(e) => handleConfigChange('backupAutomatico', e.target.checked)}
            />
          </label>
          
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Frequência de Backup
            </label>
            <select className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all bg-gray-50 focus:bg-white shadow-sm">
              <option>Diariamente</option>
              <option>Semanalmente</option>
              <option>Mensalmente</option>
              <option>Personalizado</option>
            </select>
          </div>

          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-2xl border border-blue-200">
            <div className="flex items-start gap-3">
              <Database className="w-6 h-6 text-blue-600 mt-1" />
              <div>
                <h3 className="font-semibold text-blue-900 mb-2">Status do Backup</h3>
                <p className="text-sm text-blue-700 mb-3">Último backup realizado com sucesso em 16/09/2024 às 03:00</p>
                <div className="flex gap-3">
                  <button className="px-4 py-2 bg-blue-600 text-white rounded-xl text-sm hover:bg-blue-700 transition-all font-semibold">
                    Fazer Backup Agora
                  </button>
                  <button className="px-4 py-2 border border-blue-300 text-blue-600 rounded-xl text-sm hover:bg-blue-50 transition-all font-semibold">
                    Ver Histórico
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Botão de Salvar */}
      <div className="flex justify-end">
        <button
          onClick={handleSave}
          className="flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all duration-300 shadow-lg transform hover:scale-105 font-semibold"
        >
          <Save className="w-5 h-5" />
          Salvar Configurações
        </button>
      </div>
    </div>
  );
};

export default Configuracoes;