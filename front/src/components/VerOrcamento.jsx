import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Download, 
  Calendar, 
  DollarSign, 
  TrendingUp, 
  TrendingDown,
  FileText,
  User,
  Building,
  AlertCircle,
  CheckCircle,
  XCircle,
  Clock,
  Archive
} from 'lucide-react';
import { orcamentoApi } from '../services/api';

const VerOrcamento = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [orcamento, setOrcamento] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

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
      'rascunho': 'Rascunho',
      'em_analise': 'Em Análise',
      'aprovado': 'Aprovado',
      'rejeitado': 'Rejeitado',
      'arquivado': 'Arquivado'
    };
    return statusMap[status] || status;
  };

  // Função para determinar cor do status
  const corDoStatus = (status) => {
    const cores = {
      'rascunho': 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
      'em_analise': 'bg-blue-500/20 text-blue-400 border-blue-500/30',
      'aprovado': 'bg-green-500/20 text-green-400 border-green-500/30',
      'rejeitado': 'bg-red-500/20 text-red-400 border-red-500/30',
      'arquivado': 'bg-gray-500/20 text-gray-400 border-gray-500/30'
    };
    return cores[status] || 'bg-white/10 text-white/80 border-white/20';
  };

  // Função para obter ícone do status
  const iconeDoStatus = (status) => {
    const icones = {
      'rascunho': <FileText className="w-4 h-4" />,
      'em_analise': <Clock className="w-4 h-4" />,
      'aprovado': <CheckCircle className="w-4 h-4" />,
      'rejeitado': <XCircle className="w-4 h-4" />,
      'arquivado': <Archive className="w-4 h-4" />
    };
    return icones[status] || <FileText className="w-4 h-4" />;
  };

  // Carregar dados do orçamento
  useEffect(() => {
    const carregarOrcamento = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        console.log('🔄 Carregando orçamento:', id);
        const response = await orcamentoApi.obterOrcamento(id);
        
        console.log('📥 Resposta da API:', response);
        
        if (response.status=='success' && response.data) {
          const orcamentoData = response.data.orcamento;
          
          // Processar os dados
          const orcamentoProcessado = {
            ...orcamentoData,
            statusFormatado: mapearStatus(orcamentoData.status),
            statusCor: corDoStatus(orcamentoData.status),
            statusIcone: iconeDoStatus(orcamentoData.status),
            criadoEmFormatado: new Date(orcamentoData.createdAt).toLocaleDateString('pt-AO'),
            atualizadoEmFormatado: new Date(orcamentoData.updatedAt).toLocaleDateString('pt-AO'),
            dataInicioFormatada: orcamentoData.dataInicio ? new Date(orcamentoData.dataInicio).toLocaleDateString('pt-AO') : 'Não definida',
            dataFimFormatada: orcamentoData.dataFim ? new Date(orcamentoData.dataFim).toLocaleDateString('pt-AO') : 'Não definida'
          };
          
          setOrcamento(orcamentoProcessado);
          console.log('✅ Orçamento carregado:', orcamentoProcessado);
        } else {
          throw new Error('Formato de resposta inválido');
        }
      } catch (err) {
        console.error('❌ Erro ao carregar orçamento:', err);
        setError(`Erro ao carregar orçamento: ${err.message}`);
      } finally {
        setIsLoading(false);
      }
    };

    if (id) {
      carregarOrcamento();
    }
  }, [id]);

  const handleVoltar = () => {
    navigate('/orcamento');
  };

  const handleBaixar = async () => {
    try {
      console.log('📄 Baixando orçamento:', id);
      // Aqui você implementaria a funcionalidade de download
      alert('Funcionalidade de download será implementada em breve');
    } catch (error) {
      console.error('❌ Erro ao baixar orçamento:', error);
      alert('Erro ao baixar o orçamento. Tente novamente.');
    }
  };

  const handleEditar = () => {
    // Verificar se o orçamento pode ser editado
    if (orcamento.status === 'arquivado' || orcamento.status === 'aprovado') {
      alert('Este orçamento não pode ser editado pois está arquivado ou aprovado.');
      return;
    }
    navigate(`/orcamento/${id}/editar`);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0f0c29] via-[#302b63] to-[#24243e] text-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-white/30 border-t-white rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white/80">Carregando orçamento...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0f0c29] via-[#302b63] to-[#24243e] text-white flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-6">
          <div className="w-16 h-16 bg-red-500/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <AlertCircle className="w-8 h-8 text-red-400" />
          </div>
          <h2 className="text-xl font-bold text-white mb-4">Erro ao carregar orçamento</h2>
          <p className="text-white/70 mb-6">{error}</p>
          <button
            onClick={handleVoltar}
            className="px-6 py-3 bg-gradient-to-r from-[#667eea] to-[#764ba2] text-white rounded-xl hover:from-[#5a67d8] hover:to-[#6b46c1] transition-all duration-300 shadow-lg shadow-[#667eea]/30 transform hover:scale-105 font-semibold"
          >
            Voltar para Lista
          </button>
        </div>
      </div>
    );
  }

  if (!orcamento) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0f0c29] via-[#302b63] to-[#24243e] text-white flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-bold text-white mb-4">Orçamento não encontrado</h2>
          <button
            onClick={handleVoltar}
            className="px-6 py-3 bg-gradient-to-r from-[#667eea] to-[#764ba2] text-white rounded-xl hover:from-[#5a67d8] hover:to-[#6b46c1] transition-all duration-300 shadow-lg shadow-[#667eea]/30 transform hover:scale-105 font-semibold"
          >
            Voltar para Lista
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f0c29] via-[#302b63] to-[#24243e] text-white">
      {/* Header */}
      <header className="bg-white/5 backdrop-blur-md border-b border-white/10 py-5 px-10 fixed w-full top-0 z-40">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={handleVoltar}
              className="p-2 text-white/70 hover:bg-white/10 rounded-xl transition-all"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-[#667eea] to-[#764ba2] rounded-xl flex items-center justify-center text-2xl shadow-lg shadow-[#667eea]/30">
                📋
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-b from-white to-gray-200 bg-clip-text text-transparent">
                  {orcamento.nome}
                </h1>
                <p className="text-sm text-white/60">Visualização do orçamento</p>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold border ${orcamento.statusCor}`}>
              {orcamento.statusIcone}
              {orcamento.statusFormatado}
            </span>
            
            <button
              onClick={handleBaixar}
              className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-xl transition-all text-white/80 hover:text-white"
            >
              <Download className="w-4 h-4" />
              Baixar
            </button>
            
            {(orcamento.status !== 'arquivado' && orcamento.status !== 'aprovado') && (
              <button
                onClick={handleEditar}
                className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-[#667eea] to-[#764ba2] text-white rounded-xl hover:from-[#5a67d8] hover:to-[#6b46c1] transition-all duration-300 shadow-lg shadow-[#667eea]/30 transform hover:scale-105 font-semibold"
              >
                Editar
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto mt-28 px-10 pb-10">
        {/* Informações Gerais */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Card Principal */}
          <div className="lg:col-span-2 bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6">
            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Informações Gerais
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="text-sm font-semibold text-white/80 block mb-2">Nome do Orçamento</label>
                <p className="text-white text-lg font-medium">{orcamento.nome}</p>
              </div>
              
              <div>
                <label className="text-sm font-semibold text-white/80 block mb-2">Ano</label>
                <p className="text-white text-lg font-medium">{orcamento.ano}</p>
              </div>
              
              <div>
                <label className="text-sm font-semibold text-white/80 block mb-2">Data de Início</label>
                <p className="text-white text-lg font-medium flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  {orcamento.dataInicioFormatada}
                </p>
              </div>
              
              <div>
                <label className="text-sm font-semibold text-white/80 block mb-2">Data de Fim</label>
                <p className="text-white text-lg font-medium flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  {orcamento.dataFimFormatada}
                </p>
              </div>
              
              {orcamento.descricao && (
                <div className="md:col-span-2">
                  <label className="text-sm font-semibold text-white/80 block mb-2">Descrição</label>
                  <p className="text-white/90 leading-relaxed">{orcamento.descricao}</p>
                </div>
              )}
              
              {orcamento.observacoes && (
                <div className="md:col-span-2">
                  <label className="text-sm font-semibold text-white/80 block mb-2">Observações</label>
                  <p className="text-white/90 leading-relaxed">{orcamento.observacoes}</p>
                </div>
              )}
            </div>
          </div>

          {/* Card de Resumo Financeiro */}
          <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6">
            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <DollarSign className="w-5 h-5" />
              Resumo Financeiro
            </h2>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-green-500/10 border border-green-500/20 rounded-xl">
                <div className="flex items-center gap-3">
                  <TrendingUp className="w-5 h-5 text-green-400" />
                  <span className="text-white/80 font-medium">Total Receitas</span>
                </div>
                <span className="text-green-400 font-bold text-lg">
                  {formatarValor(orcamento.totalReceita || 0)}
                </span>
              </div>
              
              <div className="flex items-center justify-between p-4 bg-red-500/10 border border-red-500/20 rounded-xl">
                <div className="flex items-center gap-3">
                  <TrendingDown className="w-5 h-5 text-red-400" />
                  <span className="text-white/80 font-medium">Total Custos</span>
                </div>
                <span className="text-red-400 font-bold text-lg">
                  {formatarValor(orcamento.totalCusto || 0)}
                </span>
              </div>
              
              <div className="flex items-center justify-between p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl">
                <div className="flex items-center gap-3">
                  <DollarSign className="w-5 h-5 text-blue-400" />
                  <span className="text-white/80 font-medium">Total Ativos</span>
                </div>
                <span className="text-blue-400 font-bold text-lg">
                  {formatarValor(orcamento.totalAtivos || 0)}
                </span>
              </div>
              
              <div className="border-t border-white/10 pt-4">
                <div className="flex items-center justify-between p-4 bg-white/5 border border-white/10 rounded-xl">
                  <span className="text-white font-medium">Resultado Líquido</span>
                  <span className={`font-bold text-lg ${
                    (orcamento.resultadoLiquido || 0) >= 0 ? 'text-green-400' : 'text-red-400'
                  }`}>
                    {formatarValor(orcamento.resultadoLiquido || 0)}
                  </span>
                </div>
                
                <div className="flex items-center justify-between p-4 bg-white/5 border border-white/10 rounded-xl mt-2">
                  <span className="text-white font-medium">Margem</span>
                  <span className={`font-bold text-lg ${
                    (orcamento.margem || 0) >= 0 ? 'text-green-400' : 'text-red-400'
                  }`}>
                    {(orcamento.margem || 0).toFixed(2)}%
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Detalhes das Receitas, Custos e Ativos */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Receitas */}
          <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-green-400" />
              Receitas ({orcamento.receitas?.length || 0})
            </h3>
            
            {orcamento.receitas && orcamento.receitas.length > 0 ? (
              <div className="space-y-3">
                {orcamento.receitas.map((receita, index) => (
                  <div key={index} className="p-3 bg-green-500/10 border border-green-500/20 rounded-xl">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <p className="text-white font-medium">{receita.descricao || receita.nome}</p>
                        {receita.categoria && (
                          <p className="text-green-400/80 text-sm">{receita.categoria}</p>
                        )}
                        {receita.quantidade && receita.precoUnitario && (
                          <p className="text-white/60 text-sm">
                            {receita.quantidade} × {formatarValor(receita.precoUnitario)}
                          </p>
                        )}
                      </div>
                      <span className="text-green-400 font-bold">
                        {formatarValor(receita.valor || receita.valorTotal)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-white/60 text-center py-4">Nenhuma receita cadastrada</p>
            )}
          </div>

          {/* Custos */}
          <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <TrendingDown className="w-5 h-5 text-red-400" />
              Custos ({orcamento.custos?.length || 0})
            </h3>
            
            {orcamento.custos && orcamento.custos.length > 0 ? (
              <div className="space-y-3">
                {orcamento.custos.map((custo, index) => (
                  <div key={index} className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <p className="text-white font-medium">{custo.descricao || custo.nome}</p>
                        {custo.tipo && (
                          <p className="text-red-400/80 text-sm">{custo.tipo}</p>
                        )}
                        {custo.quantidade && custo.precoUnitario && (
                          <p className="text-white/60 text-sm">
                            {custo.quantidade} × {formatarValor(custo.precoUnitario)}
                          </p>
                        )}
                      </div>
                      <span className="text-red-400 font-bold">
                        {formatarValor(custo.valor || custo.valorTotal)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-white/60 text-center py-4">Nenhum custo cadastrado</p>
            )}
          </div>

          {/* Ativos */}
          <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-blue-400" />
              Ativos ({orcamento.ativos?.length || 0})
            </h3>
            
            {orcamento.ativos && orcamento.ativos.length > 0 ? (
              <div className="space-y-3">
                {orcamento.ativos.map((ativo, index) => (
                  <div key={index} className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-xl">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <p className="text-white font-medium">{ativo.nome}</p>
                        {ativo.tipo && (
                          <p className="text-blue-400/80 text-sm">{ativo.tipo}</p>
                        )}
                        {ativo.vidaUtil && (
                          <p className="text-white/60 text-sm">Vida útil: {ativo.vidaUtil} anos</p>
                        )}
                      </div>
                      <span className="text-blue-400 font-bold">
                        {formatarValor(ativo.valor || ativo.valorAtual)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-white/60 text-center py-4">Nenhum ativo cadastrado</p>
            )}
          </div>
        </div>

        {/* Informações de Criação */}
        <div className="mt-8 bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6">
          <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <User className="w-5 h-5" />
            Informações de Criação
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="text-sm font-semibold text-white/80 block mb-2">Criado em</label>
              <p className="text-white flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                {orcamento.criadoEmFormatado}
              </p>
            </div>
            
            <div>
              <label className="text-sm font-semibold text-white/80 block mb-2">Última atualização</label>
              <p className="text-white flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                {orcamento.atualizadoEmFormatado}
              </p>
            </div>
            
            {orcamento.criador && (
              <div>
                <label className="text-sm font-semibold text-white/80 block mb-2">Criado por</label>
                <p className="text-white flex items-center gap-2">
                  <User className="w-4 h-4" />
                  {orcamento.criador.nome}
                </p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default VerOrcamento;
