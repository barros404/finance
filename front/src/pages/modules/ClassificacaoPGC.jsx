import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Tag, 
  TrendingUp, 
  TrendingDown,
  AlertTriangle, 
  CheckCircle, 
  Eye, 
  Download, 
  Filter, 
  Search,
  FileText,
  Clock,
  X,
  Plus,
  Edit3,
  Save,
  RefreshCw,
  AlertCircle,
  DollarSign,
  Calendar,
  User,
  Building2
} from 'lucide-react';
import { mockUploadApi, mockPgcApi } from '../../services/mock/mockApi.js';

const ClassificacaoPGC = () => {
  const navigate = useNavigate();
  const [documentos, setDocumentos] = useState([]);
  const [documentoSelecionado, setDocumentoSelecionado] = useState(null);
  const [mostrarModal, setMostrarModal] = useState(false);
  const [filtros, setFiltros] = useState({
    status: 'pendente', // pendente, classificado, todos
    tipo: 'all', // receita, custo, all
    confianca: 'all', // alta, media, baixa, all
    pagina: 1,
    limite: 10
  });
  const [paginacao, setPaginacao] = useState({
    totalItens: 0,
    totalPaginas: 0,
    paginaAtual: 1
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [classificacao, setClassificacao] = useState({
    tipo: '', // receita ou custo
    valor: '',
    descricao: '',
    contaPgc: '',
    observacoes: ''
  });

  // Função para formatar valores monetários
  const formatarValor = (valor) => {
    if (!valor && valor !== 0) return 'Kz 0,00';
    const numeroFormatado = parseFloat(valor).toLocaleString('pt-AO', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
    return `Kz ${numeroFormatado}`;
  };

  // Função para mapear status da API para português
  const mapearStatus = (status) => {
    const statusMap = {
      'pendente': 'Pendente',
      'classificado': 'Classificado',
      'aprovado': 'Aprovado',
      'rejeitado': 'Rejeitado'
    };
    return statusMap[status] || status;
  };

  // Função para determinar cor do status
  const corDoStatus = (status) => {
    const cores = {
      'pendente': 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
      'classificado': 'bg-blue-500/20 text-blue-400 border-blue-500/30',
      'aprovado': 'bg-green-500/20 text-green-400 border-green-500/30',
      'rejeitado': 'bg-red-500/20 text-red-400 border-red-500/30'
    };
    return cores[status] || 'bg-white/10 text-white/80 border-white/20';
  };

  // Função para determinar cor do tipo
  const corDoTipo = (tipo) => {
    const cores = {
      'receita': 'bg-green-500/20 text-green-400 border-green-500/30',
      'custo': 'bg-red-500/20 text-red-400 border-red-500/30'
    };
    return cores[tipo] || 'bg-white/10 text-white/80 border-white/20';
  };

  // Função para determinar cor da confiança
  const corDaConfianca = (confianca) => {
    if (confianca >= 90) return 'bg-green-500/20 text-green-400 border-green-500/30';
    if (confianca >= 70) return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
    return 'bg-red-500/20 text-red-400 border-red-500/30';
  };

  // Carregar documentos pendentes de classificação
  const carregarDocumentos = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      console.log('🔄 Carregando documentos para classificação...');
      const response = await mockUploadApi.listarDocumentosParaClassificacao(filtros);
      
      console.log('📥 Resposta da API de documentos:', response);
      
      if (response.success && response.data) {
        const { documentos: listaDocumentos, paginacao: dadosPaginacao } = response.data;
        
        // Processar os dados da API
        const documentosProcessados = listaDocumentos.map(doc => ({
          ...doc,
          statusFormatado: mapearStatus(doc.status),
          statusCor: corDoStatus(doc.status),
          tipoFormatado: doc.tipo ? (doc.tipo === 'receita' ? 'Receita' : 'Custo') : 'Não Classificado',
          tipoCor: doc.tipo ? corDoTipo(doc.tipo) : 'bg-gray-500/20 text-gray-400 border-gray-500/30',
          confiancaCor: corDaConfianca(doc.confianca || 0),
          processadoEmFormatado: new Date(doc.processadoEm).toLocaleDateString('pt-AO'),
          valorFormatado: formatarValor(doc.valor)
        }));
        
        setDocumentos(documentosProcessados);
        setPaginacao({
          totalItens: dadosPaginacao?.totalItens || 0,
          totalPaginas: dadosPaginacao?.totalPaginas || 0,
          paginaAtual: dadosPaginacao?.paginaAtual || 1
        });
        
        console.log('✅ Documentos carregados:', documentosProcessados);
      } else {
        throw new Error('Formato de resposta inválido');
      }
    } catch (err) {
      console.error('❌ Erro ao carregar documentos:', err);
      setError(`Erro ao carregar documentos: ${err.message}`);
      setDocumentos([]);
      setPaginacao({ totalItens: 0, totalPaginas: 0, paginaAtual: 1 });
    } finally {
      setIsLoading(false);
    }
  }, [filtros]);

  // Carregar dados ao montar o componente
  useEffect(() => {
    carregarDocumentos();
  }, [carregarDocumentos]);

  const handleFiltrarStatus = (status) => {
    setFiltros(prev => ({ ...prev, status, pagina: 1 }));
  };

  const handleFiltrarTipo = (tipo) => {
    setFiltros(prev => ({ ...prev, tipo, pagina: 1 }));
  };

  const handleFiltrarConfianca = (confianca) => {
    setFiltros(prev => ({ ...prev, confianca, pagina: 1 }));
  };

  const handleAbrirDocumento = (documento) => {
    setDocumentoSelecionado(documento);
    setClassificacao({
      tipo: documento.tipo || '',
      valor: documento.valor || '',
      descricao: documento.descricao || '',
      contaPgc: documento.contaPgc || '',
      observacoes: documento.observacoes || ''
    });
    setMostrarModal(true);
  };

  const handleClassificarRapido = async (documentoId, tipo) => {
    try {
      console.log('🏷️ Classificando documento rapidamente:', documentoId, tipo);
      const response = await mockPgcApi.classificarDocumento(documentoId, { tipo });
      
      if (response.success) {
        // Recarregar lista
        await carregarDocumentos();
        console.log('✅ Documento classificado com sucesso');
      } else {
        throw new Error(response.message || 'Erro ao classificar documento');
      }
    } catch (err) {
      console.error('❌ Erro ao classificar documento:', err);
      setError(`Erro ao classificar documento: ${err.message}`);
    }
  };

  const handleSalvarClassificacao = async () => {
    if (!documentoSelecionado) return;
    
    try {
      console.log('💾 Salvando classificação...');
      const response = await mockPgcApi.classificarDocumento(documentoSelecionado.id, classificacao);
      
      if (response.success) {
        setMostrarModal(false);
        await carregarDocumentos();
        console.log('✅ Classificação salva com sucesso');
      } else {
        throw new Error(response.message || 'Erro ao salvar classificação');
      }
    } catch (err) {
      console.error('❌ Erro ao salvar classificação:', err);
      setError(`Erro ao salvar classificação: ${err.message}`);
    }
  };

  const handleFecharModal = () => {
    setMostrarModal(false);
    setDocumentoSelecionado(null);
    setClassificacao({
      tipo: '',
      valor: '',
      descricao: '',
      contaPgc: '',
      observacoes: ''
    });
  };

  const handleMudarPagina = (novaPagina) => {
    setFiltros(prev => ({ ...prev, pagina: novaPagina }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f0c29] via-[#302b63] to-[#24243e] text-white overflow-x-hidden">
      {/* Header */}
      <header className="bg-white/5 backdrop-blur-md border-b border-white/10 py-5 px-10 fixed w-full top-0 z-40 animate-slideDown">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-[#667eea] to-[#764ba2] rounded-xl flex items-center justify-center text-2xl shadow-lg shadow-[#667eea]/30">
              <Tag className="w-6 h-6" />
            </div>
            <div className="flex flex-col">
              <h1 className="text-2xl font-bold bg-gradient-to-b from-white to-gray-200 bg-clip-text text-transparent">CLASSIFICAÇÃO PGC-AO</h1>
              <p className="text-xs text-white/60">Classificação de documentos em Receitas e Custos</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/validacao-contas-pgc')}
              className="flex items-center gap-2 px-4 py-2 bg-white/10 text-white rounded-xl hover:bg-white/20 transition-all"
              title="Validação de Contas PGC-AO"
            >
              <CheckCircle className="w-4 h-4" />
              Validação PGC
            </button>
            
            <button
              onClick={() => window.location.reload()}
              className="flex items-center gap-2 px-4 py-2 bg-white/10 text-white rounded-xl hover:bg-white/20 transition-all"
              title="Atualizar dados"
            >
              <RefreshCw className="w-4 h-4" />
              Atualizar
            </button>
          </div>
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

        {/* Filtros */}
        <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <label className="block text-sm font-semibold text-white/80 mb-2">Status</label>
              <select
                value={filtros.status}
                onChange={(e) => handleFiltrarStatus(e.target.value)}
                className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-white"
              >
                <option value="pendente">Pendentes</option>
                <option value="classificado">Classificados</option>
                <option value="todos">Todos</option>
              </select>
            </div>
            
            <div className="flex-1">
              <label className="block text-sm font-semibold text-white/80 mb-2">Tipo</label>
              <select
                value={filtros.tipo}
                onChange={(e) => handleFiltrarTipo(e.target.value)}
                className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-white"
              >
                <option value="all">Todos</option>
                <option value="receita">Receitas</option>
                <option value="custo">Custos</option>
              </select>
            </div>
            
            <div className="flex-1">
              <label className="block text-sm font-semibold text-white/80 mb-2">Confiança</label>
              <select
                value={filtros.confianca}
                onChange={(e) => handleFiltrarConfianca(e.target.value)}
                className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-white"
              >
                <option value="all">Todas</option>
                <option value="alta">Alta (90%+)</option>
                <option value="media">Média (70-89%)</option>
                <option value="baixa">Baixa (menos de 70%)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Lista de Documentos */}
        <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl shadow-2xl shadow-black/30 overflow-hidden">
          <div className="p-6 border-b border-white/10 bg-gradient-to-r from-white/5 to-white/10">
            <h2 className="text-xl font-bold text-white">Documentos para Classificação</h2>
          </div>

          <div className="p-6">
            {isLoading && (
              <div className="flex justify-center items-center py-12">
                <div className="w-8 h-8 border-4 border-white/30 border-t-white rounded-full animate-spin"></div>
                <span className="ml-3 text-white/80">Carregando documentos...</span>
              </div>
            )}

            {!isLoading && !error && documentos.length === 0 && (
              <div className="text-center py-16">
                <div className="w-20 h-20 bg-white/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <FileText className="w-10 h-10 text-white/60" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Nenhum documento encontrado</h3>
                <p className="text-white/70 mb-6">
                  Não há documentos pendentes de classificação para os filtros selecionados
                </p>
              </div>
            )}

            {!isLoading && !error && documentos.length > 0 && (
              <>
                <div className="grid gap-4 mb-6">
                  {documentos.map((documento) => (
                    <div key={documento.id} className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6 hover:shadow-2xl hover:shadow-black/30 transition-all duration-300 transform hover:-translate-y-1 hover:bg-white/8 relative overflow-hidden group">
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent to-white/5 transform -translate-x-full group-hover:translate-x-full transition-transform duration-600"></div>
                      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 relative">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-3">
                            <h4 className="font-bold text-white text-lg">{documento.nomeArquivo}</h4>
                            <span className={`inline-flex items-center px-3 py-1 rounded-xl text-xs font-semibold border ${documento.statusCor}`}>
                              {documento.statusFormatado}
                            </span>
                            {documento.tipo && (
                              <span className={`inline-flex items-center px-3 py-1 rounded-xl text-xs font-semibold border ${documento.tipoCor}`}>
                                {documento.tipoFormatado}
                              </span>
                            )}
                            <span className={`inline-flex items-center px-2 py-1 rounded-lg text-xs font-medium border ${documento.confiancaCor}`}>
                              {documento.confianca || 0}% confiança
                            </span>
                          </div>
                          
                          {documento.descricao && (
                            <p className="text-white/70 mb-3">{documento.descricao}</p>
                          )}
                          
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                            <div>
                              <p className="text-white/60">Valor</p>
                              <p className="font-bold text-blue-400">{documento.valorFormatado}</p>
                            </div>
                            <div>
                              <p className="text-white/60">Processado em</p>
                              <p className="font-bold text-white/90">{documento.processadoEmFormatado}</p>
                            </div>
                            <div>
                              <p className="text-white/60">Tamanho</p>
                              <p className="font-bold text-white/90">{documento.tamanhoArquivo || 'N/A'}</p>
                            </div>
                            <div>
                              <p className="text-white/60">Páginas</p>
                              <p className="font-bold text-white/90">{documento.numeroPaginas || 'N/A'}</p>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-3">
                          <div className="flex gap-2">
                            {documento.status === 'pendente' && (
                              <>
                                <button 
                                  onClick={() => handleClassificarRapido(documento.id, 'receita')}
                                  className="flex items-center gap-1 px-3 py-2 bg-green-600/20 text-green-400 rounded-xl hover:bg-green-600/30 transition-all text-sm font-semibold border border-green-500/30"
                                  title="Classificar como Receita"
                                >
                                  <TrendingUp className="w-4 h-4" />
                                  Receita
                                </button>
                                <button 
                                  onClick={() => handleClassificarRapido(documento.id, 'custo')}
                                  className="flex items-center gap-1 px-3 py-2 bg-red-600/20 text-red-400 rounded-xl hover:bg-red-600/30 transition-all text-sm font-semibold border border-red-500/30"
                                  title="Classificar como Custo"
                                >
                                  <TrendingDown className="w-4 h-4" />
                                  Custo
                                </button>
                              </>
                            )}
                            
                            <button 
                              onClick={() => handleAbrirDocumento(documento)}
                              className="p-2 text-white/70 hover:bg-white/10 rounded-xl transition-all" 
                              title="Abrir para revisão"
                            >
                              <Eye className="w-5 h-5" />
                            </button>
                            
                            <button 
                              onClick={() => alert('Funcionalidade de download em desenvolvimento')}
                              className="p-2 text-white/70 hover:bg-white/10 rounded-xl transition-all" 
                              title="Baixar documento"
                            >
                              <Download className="w-5 h-5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Paginação */}
                {paginacao.totalPaginas > 1 && (
                  <div className="flex justify-center items-center gap-2">
                    <button
                      onClick={() => handleMudarPagina(paginacao.paginaAtual - 1)}
                      disabled={paginacao.paginaAtual === 1}
                      className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-all font-semibold text-white backdrop-blur-md text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Anterior
                    </button>
                    
                    <span className="px-4 py-2 text-white/80 text-sm">
                      Página {paginacao.paginaAtual} de {paginacao.totalPaginas}
                    </span>
                    
                    <button
                      onClick={() => handleMudarPagina(paginacao.paginaAtual + 1)}
                      disabled={paginacao.paginaAtual === paginacao.totalPaginas}
                      className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-all font-semibold text-white backdrop-blur-md text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Próxima
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </main>

      {/* Modal de Classificação Detalhada */}
      {mostrarModal && documentoSelecionado && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-white/10">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-white">Classificar Documento</h3>
                <button
                  onClick={handleFecharModal}
                  className="p-2 text-white/70 hover:bg-white/10 rounded-xl transition-all"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Informações do Documento */}
              <div className="bg-white/5 rounded-xl p-4">
                <h4 className="font-semibold text-white mb-2">Documento: {documentoSelecionado.nomeArquivo}</h4>
                <p className="text-white/70 text-sm">{documentoSelecionado.descricao}</p>
              </div>
              
              {/* Formulário de Classificação */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-white/80 mb-2">Tipo *</label>
                  <select
                    value={classificacao.tipo}
                    onChange={(e) => setClassificacao(prev => ({ ...prev, tipo: e.target.value }))}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-white"
                  >
                    <option value="">Selecione o tipo</option>
                    <option value="receita">Receita</option>
                    <option value="custo">Custo</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-white/80 mb-2">Valor *</label>
                  <input
                    type="number"
                    step="0.01"
                    value={classificacao.valor}
                    onChange={(e) => setClassificacao(prev => ({ ...prev, valor: e.target.value }))}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-white placeholder-white/50"
                    placeholder="0,00"
                  />
                </div>
                
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-white/80 mb-2">Descrição</label>
                  <input
                    type="text"
                    value={classificacao.descricao}
                    onChange={(e) => setClassificacao(prev => ({ ...prev, descricao: e.target.value }))}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-white placeholder-white/50"
                    placeholder="Descrição da transação"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-white/80 mb-2">Conta PGC-AO</label>
                  <input
                    type="text"
                    value={classificacao.contaPgc}
                    onChange={(e) => setClassificacao(prev => ({ ...prev, contaPgc: e.target.value }))}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-white placeholder-white/50"
                    placeholder="Ex: 714"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-white/80 mb-2">Observações</label>
                  <input
                    type="text"
                    value={classificacao.observacoes}
                    onChange={(e) => setClassificacao(prev => ({ ...prev, observacoes: e.target.value }))}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-white placeholder-white/50"
                    placeholder="Observações adicionais"
                  />
                </div>
              </div>
              
              {/* Botões de Ação */}
              <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
                <button
                  onClick={handleFecharModal}
                  className="px-6 py-3 bg-white/10 text-white rounded-xl hover:bg-white/20 transition-all font-semibold"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSalvarClassificacao}
                  disabled={!classificacao.tipo || !classificacao.valor}
                  className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#667eea] to-[#764ba2] text-white rounded-xl hover:from-[#5a67d8] hover:to-[#6b46c1] transition-all font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Save className="w-4 h-4" />
                  Salvar Classificação
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="text-center py-10 text-white/40 text-sm border-t border-white/10 mt-16">
        <p>© 2025 FINANCE PRO - Sistema Integrado de Gestão Financeira</p>
        <p className="mt-1">Versão 2.0.1 | Última atualização: 18/09/2025</p>
      </footer>
    </div>
  );
};

export default ClassificacaoPGC;
