import React, { useState, useEffect } from 'react';

const OutputCenter = () => {
  const [activeFilter, setActiveFilter] = useState('Todos');
  const [outputCount, setOutputCount] = useState(247);

  useEffect(() => {
    // Simulate real-time updates
    const interval = setInterval(() => {
      if (Math.random() > 0.7) {
        setOutputCount(prev => prev + 1);
      }
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const filterTabs = ['Todos', 'Relatórios', 'Análises', 'Alertas'];

  return (
    <div className="min-h-screen bg-[#0f0f1e] text-white overflow-x-hidden relative">
      {/* Animated Background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-full">
          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_20%_80%,rgba(102,126,234,0.1)_0%,transparent_50%)]"></div>
          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_80%_20%,rgba(237,100,166,0.1)_0%,transparent_50%)]"></div>
          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_40%_40%,rgba(16,185,129,0.1)_0%,transparent_50%)]"></div>
        </div>
      </div>

      {/* Header */}
      <header className="bg-[#0f0f1e] bg-opacity-95 backdrop-blur-xl border-b border-white/5 sticky top-0 z-50 py-4 px-8">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-[#667eea] to-[#764ba2] rounded-xl flex items-center justify-center text-2xl">
              📊
            </div>
            <div>
              <h1 className="text-xl font-semibold">FINANCE PRO - Centro de Outputs</h1>
              <p className="text-xs text-white/50">Consolidação de Resultados do Sistema Multi-Agente</p>
            </div>
          </div>
          
          <div className="flex items-center gap-5">
            <div className="flex items-center gap-2 py-2 px-4 bg-green-500/10 border border-green-500/30 rounded-full text-green-400 text-sm">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span>Sincronizado</span>
            </div>
            <button className="py-2.5 px-5 bg-gradient-to-br from-[#667eea] to-[#764ba2] rounded-xl text-white text-sm cursor-pointer">
              ⬇️ Exportar Tudo
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative max-w-7xl mx-auto px-8 py-8">
        {/* Stats Bar */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-5 mb-8">
          <div className="bg-white/5 border border-white/5 rounded-xl p-5 transition-all hover:bg-white/10 hover:-translate-y-0.5">
            <div className="w-10 h-10 bg-gradient-to-br from-[#10b981] to-[#059669] rounded-lg flex items-center justify-center text-xl mb-3">
              📄
            </div>
            <div className="text-2xl font-bold">{outputCount}</div>
            <div className="text-xs text-white/50">Outputs Gerados Hoje</div>
          </div>
          
          <div className="bg-white/5 border border-white/5 rounded-xl p-5 transition-all hover:bg-white/10 hover:-translate-y-0.5">
            <div className="w-10 h-10 bg-gradient-to-br from-[#667eea] to-[#764ba2] rounded-lg flex items-center justify-center text-xl mb-3">
              📑
            </div>
            <div className="text-2xl font-bold">12</div>
            <div className="text-xs text-white/50">Relatórios Finalizados</div>
          </div>
          
          <div className="bg-white/5 border border-white/5 rounded-xl p-5 transition-all hover:bg-white/10 hover:-translate-y-0.5">
            <div className="w-10 h-10 bg-gradient-to-br from-[#f59e0b] to-[#d97706] rounded-lg flex items-center justify-center text-xl mb-3">
              ⏳
            </div>
            <div className="text-2xl font-bold">5</div>
            <div className="text-xs text-white/50">Em Processamento</div>
          </div>
          
          <div className="bg-white/5 border border-white/5 rounded-xl p-5 transition-all hover:bg-white/10 hover:-translate-y-0.5">
            <div className="w-10 h-10 bg-gradient-to-br from-[#ef4444] to-[#dc2626] rounded-lg flex items-center justify-center text-xl mb-3">
              ⚠️
            </div>
            <div className="text-2xl font-bold">3</div>
            <div className="text-xs text-white/50">Alertas Críticos</div>
          </div>
          
          <div className="bg-white/5 border border-white/5 rounded-xl p-5 transition-all hover:bg-white/10 hover:-translate-y-0.5">
            <div className="w-10 h-10 bg-gradient-to-br from-[#8b5cf6] to-[#7c3aed] rounded-lg flex items-center justify-center text-xl mb-3">
              💾
            </div>
            <div className="text-2xl font-bold">1.2GB</div>
            <div className="text-xs text-white/50">Volume de Dados</div>
          </div>
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-6 mb-8">
          {/* Output Stream */}
          <div className="bg-white/5 border border-white/5 rounded-2xl p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <span>🚀</span>
                Stream de Outputs em Tempo Real
              </h3>
              <div className="flex gap-2">
                {filterTabs.map(tab => (
                  <button
                    key={tab}
                    onClick={() => setActiveFilter(tab)}
                    className={`py-2 px-4 rounded-full text-xs transition-all ${
                      activeFilter === tab
                        ? 'bg-gradient-to-br from-[#667eea] to-[#764ba2] text-white'
                        : 'bg-white/5 border border-white/10 text-white/70 hover:bg-white/10'
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            </div>

            {/* Output Card 1 - Relatório */}
            <div className="bg-white/5 border border-white/10 rounded-xl p-5 mb-4 transition-all hover:bg-white/10 hover:translate-x-1 hover:shadow-xl hover:shadow-black/20 cursor-pointer">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-gradient-to-br from-[#10b981] to-[#059669] rounded-lg flex items-center justify-center text-lg">
                    📊
                  </div>
                  <div>
                    <h4 className="text-sm font-medium">Relatório Executivo Consolidado</h4>
                    <p className="text-xs text-white/50">REL-2025-10-142 • Agora mesmo</p>
                  </div>
                </div>
                <span className="py-1 px-3 bg-green-500/20 text-green-400 text-xs font-semibold rounded-full">Completo</span>
              </div>
              
              <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t border-white/5">
                <div className="text-center">
                  <div className="text-base font-semibold">247</div>
                  <div className="text-xs text-white/40">Documentos</div>
                </div>
                <div className="text-center">
                  <div className="text-base font-semibold">98.3%</div>
                  <div className="text-xs text-white/40">Precisão</div>
                </div>
                <div className="text-center">
                  <div className="text-base font-semibold">4.2s</div>
                  <div className="text-xs text-white/40">Tempo</div>
                </div>
              </div>
              
              <div className="flex gap-2 mt-4">
                <button className="flex-1 py-2 bg-white/5 border border-white/10 rounded-lg text-white/70 text-xs hover:bg-white/10 hover:text-white transition-all flex items-center justify-center gap-1">
                  👁️ Visualizar
                </button>
                <button className="flex-1 py-2 bg-white/5 border border-white/10 rounded-lg text-white/70 text-xs hover:bg-white/10 hover:text-white transition-all flex items-center justify-center gap-1">
                  📥 Baixar PDF
                </button>
                <button className="flex-1 py-2 bg-white/5 border border-white/10 rounded-lg text-white/70 text-xs hover:bg-white/10 hover:text-white transition-all flex items-center justify-center gap-1">
                  📧 Enviar
                </button>
              </div>
            </div>

            {/* Output Card 2 - Plano de Tesouraria */}
            <div className="bg-white/5 border border-white/10 rounded-xl p-5 mb-4 transition-all hover:bg-white/10 hover:translate-x-1 hover:shadow-xl hover:shadow-black/20 cursor-pointer">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-gradient-to-br from-[#f59e0b] to-[#d97706] rounded-lg flex items-center justify-center text-lg">
                    💰
                  </div>
                  <div>
                    <h4 className="text-sm font-medium">Plano de Tesouraria Mensal</h4>
                    <p className="text-xs text-white/50">Outubro 2025 • Há 15 minutos</p>
                  </div>
                </div>
                <span className="py-1 px-3 bg-green-500/20 text-green-400 text-xs font-semibold rounded-full">Aprovado</span>
              </div>
              
              <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t border-white/5">
                <div className="text-center">
                  <div className="text-base font-semibold">2.5M</div>
                  <div className="text-xs text-white/40">Saldo Inicial</div>
                </div>
                <div className="text-center">
                  <div className="text-base font-semibold">1.2</div>
                  <div className="text-xs text-white/40">Liquidez</div>
                </div>
                <div className="text-center">
                  <div className="text-base font-semibold">15</div>
                  <div className="text-xs text-white/40">Dias Cobert.</div>
                </div>
              </div>
              
              <div className="flex gap-2 mt-4">
                <button className="flex-1 py-2 bg-white/5 border border-white/10 rounded-lg text-white/70 text-xs hover:bg-white/10 hover:text-white transition-all flex items-center justify-center gap-1">
                  👁️ Visualizar
                </button>
                <button className="flex-1 py-2 bg-white/5 border border-white/10 rounded-lg text-white/70 text-xs hover:bg-white/10 hover:text-white transition-all flex items-center justify-center gap-1">
                  📥 Baixar Excel
                </button>
                <button className="flex-1 py-2 bg-white/5 border border-white/10 rounded-lg text-white/70 text-xs hover:bg-white/10 hover:text-white transition-all flex items-center justify-center gap-1">
                  🔄 Atualizar
                </button>
              </div>
            </div>

            {/* Output Card 3 - Análise de Riscos */}
            <div className="bg-white/5 border border-white/10 rounded-xl p-5 mb-4 transition-all hover:bg-white/10 hover:translate-x-1 hover:shadow-xl hover:shadow-black/20 cursor-pointer">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-gradient-to-br from-[#ef4444] to-[#dc2626] rounded-lg flex items-center justify-center text-lg">
                    ⚠️
                  </div>
                  <div>
                    <h4 className="text-sm font-medium">Análise de Riscos Críticos</h4>
                    <p className="text-xs text-white/50">Agente 5 • Há 30 minutos</p>
                  </div>
                </div>
                <span className="py-1 px-3 bg-yellow-500/20 text-yellow-400 text-xs font-semibold rounded-full">Processando</span>
              </div>
              
              <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t border-white/5">
                <div className="text-center">
                  <div className="text-base font-semibold">75</div>
                  <div className="text-xs text-white/40">Score Risco</div>
                </div>
                <div className="text-center">
                  <div className="text-base font-semibold">3</div>
                  <div className="text-xs text-white/40">Críticos</div>
                </div>
                <div className="text-center">
                  <div className="text-base font-semibold">85%</div>
                  <div className="text-xs text-white/40">Progresso</div>
                </div>
              </div>
              
              <div className="h-1 bg-white/10 rounded-full overflow-hidden mt-4">
                <div className="h-full bg-gradient-to-r from-[#667eea] to-[#764ba2] rounded-full transition-all duration-500" style={{ width: '85%' }}></div>
              </div>
            </div>

            {/* Output Card 4 - Orçamento */}
            <div className="bg-white/5 border border-white/10 rounded-xl p-5 transition-all hover:bg-white/10 hover:translate-x-1 hover:shadow-xl hover:shadow-black/20 cursor-pointer">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-gradient-to-br from-[#667eea] to-[#764ba2] rounded-lg flex items-center justify-center text-lg">
                    📋
                  </div>
                  <div>
                    <h4 className="text-sm font-medium">Orçamento Anual 2025</h4>
                    <p className="text-xs text-white/50">ORÇ/2025/001 • Há 2 horas</p>
                  </div>
                </div>
                <span className="py-1 px-3 bg-green-500/20 text-green-400 text-xs font-semibold rounded-full">Finalizado</span>
              </div>
              
              <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t border-white/5">
                <div className="text-center">
                  <div className="text-base font-semibold">15M</div>
                  <div className="text-xs text-white/40">Total</div>
                </div>
                <div className="text-center">
                  <div className="text-base font-semibold">22.5%</div>
                  <div className="text-xs text-white/40">Margem</div>
                </div>
                <div className="text-center">
                  <div className="text-base font-semibold">✓</div>
                  <div className="text-xs text-white/40">PGC-AO</div>
                </div>
              </div>
              
              <div className="flex gap-2 mt-4">
                <button className="flex-1 py-2 bg-white/5 border border-white/10 rounded-lg text-white/70 text-xs hover:bg-white/10 hover:text-white transition-all flex items-center justify-center gap-1">
                  👁️ Visualizar
                </button>
                <button className="flex-1 py-2 bg-white/5 border border-white/10 rounded-lg text-white/70 text-xs hover:bg-white/10 hover:text-white transition-all flex items-center justify-center gap-1">
                  📥 Baixar PDF
                </button>
                <button className="flex-1 py-2 bg-white/5 border border-white/10 rounded-lg text-white/70 text-xs hover:bg-white/10 hover:text-white transition-all flex items-center justify-center gap-1">
                  📊 Dashboard
                </button>
              </div>
            </div>
          </div>

          {/* Side Panel */}
          <div className="space-y-6">
            {/* Processing Queue */}
            <div className="bg-white/5 border border-white/5 rounded-2xl p-6">
              <div className="flex justify-between items-center mb-5">
                <h3 className="text-base font-semibold">🔄 Fila de Processamento</h3>
                <span className="py-1 px-3 bg-gradient-to-br from-[#667eea] to-[#764ba2] text-xs font-semibold rounded-full">5 itens</span>
              </div>
              
              <div className="space-y-3">
                <div className="bg-white/5 rounded-lg p-4 transition-all hover:bg-white/10">
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-sm font-medium">Classificação PGC Lote #89</span>
                    <span className="text-xs text-white/40">2 min</span>
                  </div>
                  <div className="h-1 bg-white/10 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-[#667eea] to-[#764ba2] rounded-full transition-all duration-500" style={{ width: '65%' }}></div>
                  </div>
                </div>
                
                <div className="bg-white/5 rounded-lg p-4 transition-all hover:bg-white/10">
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-sm font-medium">OCR Facturas Set/2025</span>
                    <span className="text-xs text-white/40">5 min</span>
                  </div>
                  <div className="h-1 bg-white/10 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-[#667eea] to-[#764ba2] rounded-full transition-all duration-500" style={{ width: '30%' }}></div>
                  </div>
                </div>
                
                <div className="bg-white/5 rounded-lg p-4 transition-all hover:bg-white/10">
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-sm font-medium">Análise Fluxo de Caixa</span>
                    <span className="text-xs text-white/40">8 min</span>
                  </div>
                  <div className="h-1 bg-white/10 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-[#667eea] to-[#764ba2] rounded-full transition-all duration-500" style={{ width: '10%' }}></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Alerts */}
            <div className="bg-white/5 border border-white/5 rounded-2xl p-6">
              <div className="flex justify-between items-center mb-5">
                <h3 className="text-base font-semibold">🔔 Alertas Recentes</h3>
                <span className="py-1 px-3 bg-gradient-to-br from-[#ef4444] to-[#dc2626] text-xs font-semibold rounded-full">3 críticos</span>
              </div>
              
              <div className="space-y-3">
                <div className="bg-white/5 rounded-lg p-4 border-l-4 border-red-500 transition-all hover:bg-white/10">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-red-500">🔴</span>
                    <span className="text-sm font-medium">Liquidez Crítica Dia 25</span>
                  </div>
                  <p className="text-xs text-white/50">Saldo previsto abaixo do mínimo</p>
                </div>
                
                <div className="bg-white/5 rounded-lg p-4 border-l-4 border-yellow-500 transition-all hover:bg-white/10">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-yellow-500">🟠</span>
                    <span className="text-sm font-medium">Execução Orçamental 87%</span>
                  </div>
                  <p className="text-xs text-white/50">Abaixo da meta mensal</p>
                </div>
                
                <div className="bg-white/5 rounded-lg p-4 border-l-4 border-green-500 transition-all hover:bg-white/10">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-green-500">🟢</span>
                    <span className="text-sm font-medium">Backup Completo</span>
                  </div>
                  <p className="text-xs text-white/50">Todos os outputs salvos</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Visualization Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {/* Output Timeline */}
          <div className="bg-white/5 border border-white/5 rounded-2xl p-6">
            <h3 className="text-base font-semibold flex items-center gap-2 mb-5">
              <span>📈</span>
              Volume de Outputs (7 dias)
            </h3>
            <div className="flex items-end justify-around gap-2 h-40 mt-6">
              {[
                { height: '60%', label: 'Seg' },
                { height: '80%', label: 'Ter' },
                { height: '45%', label: 'Qua' },
                { height: '90%', label: 'Qui' },
                { height: '100%', label: 'Sex' },
                { height: '30%', label: 'Sáb' },
                { height: '70%', label: 'Hoje', color: 'from-[#10b981] to-[#059669]' }
              ].map((bar, index) => (
                <div key={index} className="flex flex-col items-center flex-1">
                  <div
                    className={`w-full rounded-t-md transition-all hover:opacity-100 hover:scale-y-105 ${
                      bar.color 
                        ? `bg-gradient-to-b ${bar.color}` 
                        : 'bg-gradient-to-b from-[#667eea] to-[#764ba2]'
                    }`}
                    style={{ height: bar.height, opacity: 0.8 }}
                  ></div>
                  <span className="text-xs text-white/40 mt-2">{bar.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Output Distribution */}
          <div className="bg-white/5 border border-white/5 rounded-2xl p-6">
            <h3 className="text-base font-semibold flex items-center gap-2 mb-5">
              <span>🎯</span>
              Distribuição por Tipo
            </h3>
            <div className="space-y-4 mt-4">
              {[
                { label: 'Relatórios', width: '75%', color: 'from-[#667eea] to-[#764ba2]' },
                { label: 'Análises', width: '60%', color: 'from-[#10b981] to-[#059669]' },
                { label: 'Dashboards', width: '45%', color: 'from-[#f59e0b] to-[#d97706]' },
                { label: 'Alertas', width: '30%', color: 'from-[#ef4444] to-[#dc2626]' }
              ].map((item, index) => (
                <div key={index} className="flex justify-between items-center">
                  <span className="text-sm">{item.label}</span>
                  <div className="flex items-center gap-3">
                    <div className="w-24 h-2 bg-white/10 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full bg-gradient-to-r ${item.color}`}
                        style={{ width: item.width }}
                      ></div>
                    </div>
                    <span className="text-xs text-white/60 w-8">{item.width}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Performance Metrics */}
          <div className="bg-white/5 border border-white/5 rounded-2xl p-6">
            <h3 className="text-base font-semibold flex items-center gap-2 mb-5">
              <span>⚡</span>
              Métricas de Performance
            </h3>
            <div className="grid grid-cols-2 gap-4 mt-4">
              {[
                { value: '98.3%', label: 'Precisão', color: 'text-green-400' },
                { value: '1.2s', label: 'Tempo Médio', color: 'text-blue-400' },
                { value: '247', label: 'Processados', color: 'text-yellow-400' },
                { value: '3', label: 'Erros', color: 'text-red-400' }
              ].map((metric, index) => (
                <div key={index} className="bg-white/5 rounded-xl p-4 text-center">
                  <div className={`text-xl font-bold ${metric.color}`}>{metric.value}</div>
                  <div className="text-xs text-white/50 mt-1">{metric.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Download Center */}
        <div className="bg-white/5 border border-white/5 rounded-2xl p-6">
          <h3 className="text-base font-semibold flex items-center gap-2 mb-5">
            <span>📥</span>
            Centro de Downloads
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
            {[
              { icon: '📑', title: 'Relatório Consolidado', meta: 'PDF • 2.5 MB • Outubro 2025', color: 'from-[#667eea] to-[#764ba2]' },
              { icon: '📊', title: 'Dashboard Executivo', meta: 'Excel • 1.8 MB • Atualizado hoje', color: 'from-[#10b981] to-[#059669]' },
              { icon: '💰', title: 'Plano de Tesouraria', meta: 'Excel • 856 KB • Q4 2025', color: 'from-[#f59e0b] to-[#d97706]' },
              { icon: '⚠️', title: 'Análise de Riscos', meta: 'PDF • 1.2 MB • Crítico', color: 'from-[#ef4444] to-[#dc2626]' },
              { icon: '📋', title: 'Orçamento 2025', meta: 'PDF • 3.1 MB • Aprovado', color: 'from-[#8b5cf6] to-[#7c3aed]' },
              { icon: '📦', title: 'Pacote Completo', meta: 'ZIP • 15.8 MB • Todos os outputs', color: 'from-[#6b7280] to-[#4b5563]' }
            ].map((item, index) => (
              <div
                key={index}
                className="bg-white/5 border border-white/10 rounded-xl p-4 cursor-pointer transition-all hover:bg-white/10 hover:-translate-y-1 flex items-center gap-4"
              >
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-lg bg-gradient-to-br ${item.color}`}>
                  {item.icon}
                </div>
                <div className="flex-1">
                  <div className="text-sm font-medium">{item.title}</div>
                  <div className="text-xs text-white/50">{item.meta}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};

export default OutputCenter;