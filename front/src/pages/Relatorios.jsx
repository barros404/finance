import React from 'react';
import { Download, Filter, BarChart3, PieChart, LineChart, FileText, Calendar, TrendingUp, Eye } from 'lucide-react';

const Relatorios = () => {
  const relatorios = [
    {
      id: 1,
      titulo: 'Relatório Financeiro Mensal',
      tipo: 'Financeiro',
      periodo: 'Set 2024',
      criadoEm: '01/09/2024',
      tamanho: '2.3 MB',
      downloads: 45
    },
    {
      id: 2,
      titulo: 'Análise de Despesas por Departamento',
      tipo: 'Despesas',
      periodo: 'Q3 2024',
      criadoEm: '15/08/2024',
      tamanho: '1.8 MB',
      downloads: 32
    },
    {
      id: 3,
      titulo: 'Projeção de Receitas 2024-2025',
      tipo: 'Receitas',
      periodo: '2024-2025',
      criadoEm: '20/07/2024',
      tamanho: '3.1 MB',
      downloads: 67
    },
    {
      id: 4,
      titulo: 'Balanço Patrimonial Q3',
      tipo: 'Balanço',
      periodo: 'Jul-Set 2024',
      criadoEm: '30/09/2024',
      tamanho: '4.2 MB',
      downloads: 23
    }
  ];

  const tiposRelatorio = [
    {
      nome: 'Relatórios Financeiros',
      descricao: 'Análise completa da situação financeira da empresa',
      icone: BarChart3,
      cor: 'from-blue-500 to-indigo-600',
      bgColor: 'from-blue-50 to-indigo-100',
      count: 12
    },
    {
      nome: 'Análise de Despesas',
      descricao: 'Detalhamento de custos e despesas por categoria',
      icone: PieChart,
      cor: 'from-emerald-500 to-green-600',
      bgColor: 'from-emerald-50 to-green-100',
      count: 8
    },
    {
      nome: 'Projeções e Tendências',
      descricao: 'Previsões e análises de tendências futuras',
      icone: LineChart,
      cor: 'from-purple-500 to-violet-600',
      bgColor: 'from-purple-50 to-violet-100',
      count: 5
    }
  ];

  const getTypeColor = (tipo) => {
    switch (tipo) {
      case 'Financeiro': return 'bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-700 border-blue-200';
      case 'Despesas': return 'bg-gradient-to-r from-emerald-100 to-green-100 text-emerald-700 border-emerald-200';
      case 'Receitas': return 'bg-gradient-to-r from-purple-100 to-violet-100 text-purple-700 border-purple-200';
      case 'Balanço': return 'bg-gradient-to-r from-amber-100 to-yellow-100 text-amber-700 border-amber-200';
      default: return 'bg-gradient-to-r from-gray-100 to-slate-100 text-gray-700 border-gray-200';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f0c29] via-[#302b63] to-[#24243e] text-white overflow-x-hidden">
      {/* Header */}
      <header className="bg-white/5 backdrop-blur-md border-b border-white/10 py-5 px-10 fixed w-full top-0 z-40 animate-slideDown">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-[#667eea] to-[#764ba2] rounded-xl flex items-center justify-center text-2xl shadow-lg shadow-[#667eea]/30">
              📊
            </div>
            <div className="flex flex-col">
              <h1 className="text-2xl font-bold bg-gradient-to-b from-white to-gray-200 bg-clip-text text-transparent">RELATÓRIOS</h1>
              <p className="text-xs text-white/60">Insights detalhados sobre o desempenho da empresa</p>
            </div>
          </div>
          
          <div className="flex gap-3">
            <button className="flex items-center gap-2 px-6 py-3 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-all font-semibold text-white backdrop-blur-md">
              <Filter className="w-4 h-4" />
              Filtros
            </button>
            <button className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#667eea] to-[#764ba2] text-white rounded-xl hover:from-[#5a67d8] hover:to-[#6b46c1] transition-all duration-300 shadow-lg shadow-[#667eea]/30 transform hover:scale-105 font-semibold">
              <BarChart3 className="w-4 h-4" />
              Novo Relatório
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto mt-28 px-10 pb-10 space-y-8">

        {/* Estatísticas rápidas */}
        <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-8 shadow-2xl shadow-black/30">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center">
              <p className="text-3xl font-bold bg-gradient-to-b from-white to-gray-200 bg-clip-text text-transparent">25</p>
              <p className="text-white/70">Total de Relatórios</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold bg-gradient-to-b from-white to-gray-200 bg-clip-text text-transparent">167</p>
              <p className="text-white/70">Downloads este mês</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold bg-gradient-to-b from-white to-gray-200 bg-clip-text text-transparent">8</p>
              <p className="text-white/70">Relatórios automáticos</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold bg-gradient-to-b from-white to-gray-200 bg-clip-text text-transparent">98%</p>
              <p className="text-white/70">Taxa de conformidade</p>
            </div>
          </div>
        </div>

        {/* Tipos de relatórios */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {tiposRelatorio.map((tipo, index) => {
            const Icon = tipo.icone;
            return (
              <div key={index} className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6 hover:shadow-2xl hover:shadow-black/30 transition-all duration-300 transform hover:-translate-y-1 hover:bg-white/8 cursor-pointer relative overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent to-white/5 transform -translate-x-full group-hover:translate-x-full transition-transform duration-600"></div>
                <div className="flex items-center justify-between mb-4 relative">
                  <div className="w-12 h-12 bg-gradient-to-br from-[#667eea] to-[#764ba2] rounded-xl flex items-center justify-center text-2xl shadow-lg shadow-[#667eea]/30">
                    {index === 0 ? '📊' : index === 1 ? '📈' : '📉'}
                  </div>
                  <div className="text-right">
                    <span className="text-2xl font-bold text-white">{tipo.count}</span>
                    <p className="text-xs text-white/70">relatórios</p>
                  </div>
                </div>
                <h3 className="font-bold text-white mb-2 text-lg">{tipo.nome}</h3>
                <p className="text-sm text-white/70 leading-relaxed">{tipo.descricao}</p>
              </div>
            );
          })}
        </div>

        {/* Lista de relatórios */}
        <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl shadow-2xl shadow-black/30 overflow-hidden">
          <div className="p-6 border-b border-white/10 bg-gradient-to-r from-white/5 to-white/10">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-white">Relatórios Recentes</h2>
              <button className="text-white/80 hover:text-white font-semibold text-sm transition-colors">
                Ver todos
              </button>
            </div>
          </div>
          
          <div className="divide-y divide-white/10">
            {relatorios.map((relatorio) => (
              <div key={relatorio.id} className="p-6 hover:bg-white/5 transition-all duration-300 relative overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent to-white/5 transform -translate-x-full group-hover:translate-x-full transition-transform duration-600"></div>
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 relative">
                  <div className="flex items-center gap-4 flex-1">
                    <div className="w-12 h-12 bg-gradient-to-br from-[#667eea] to-[#764ba2] rounded-xl flex items-center justify-center text-2xl shadow-lg shadow-[#667eea]/30">
                      📄
                    </div>
                    <div className="flex-1">
                      <h4 className="font-bold text-white text-lg mb-1">{relatorio.titulo}</h4>
                      <div className="flex flex-wrap items-center gap-3 mb-2">
                        <span className={`inline-flex items-center px-3 py-1 rounded-xl text-xs font-semibold border ${
                          relatorio.tipo === 'Financeiro' ? 'bg-blue-500/20 text-blue-400 border-blue-500/30' :
                          relatorio.tipo === 'Despesas' ? 'bg-green-500/20 text-green-400 border-green-500/30' :
                          relatorio.tipo === 'Receitas' ? 'bg-purple-500/20 text-purple-400 border-purple-500/30' :
                          relatorio.tipo === 'Balanço' ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' :
                          'bg-white/10 text-white/80 border-white/20'
                        }`}>
                          {relatorio.tipo}
                        </span>
                        <div className="flex items-center gap-1 text-sm text-white/70">
                          <Calendar className="w-3 h-3" />
                          <span>Período: {relatorio.periodo}</span>
                        </div>
                        <div className="flex items-center gap-1 text-sm text-white/70">
                          <Download className="w-3 h-3" />
                          <span>{relatorio.downloads} downloads</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 text-xs text-white/60">
                        <span>Criado em: {relatorio.criadoEm}</span>
                        <span>Tamanho: {relatorio.tamanho}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <button className="p-2 text-white/70 hover:bg-white/10 rounded-xl transition-all duration-300 transform hover:scale-110">
                      <Eye className="w-5 h-5" />
                    </button>
                    <button className="p-2 text-white/70 hover:bg-white/10 rounded-xl transition-all duration-300 transform hover:scale-110">
                      <Download className="w-5 h-5" />
                    </button>
                    <button className="px-4 py-2 bg-gradient-to-r from-[#667eea] to-[#764ba2] text-white rounded-xl text-sm hover:from-[#5a67d8] hover:to-[#6b46c1] transition-all duration-300 font-semibold shadow-lg shadow-[#667eea]/30">
                      Visualizar
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="text-center py-10 text-white/40 text-sm border-t border-white/10 mt-16">
        <p>© 2025 FINANCE PRO - Sistema Integrado de Gestão Financeira</p>
        <p className="mt-1">Versão 2.0.1 | Última atualização: 18/09/2025</p>
      </footer>
    </div>
  );
};

export default Relatorios;