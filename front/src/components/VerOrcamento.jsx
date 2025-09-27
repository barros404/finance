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
  AlertCircle,
  CheckCircle,
  XCircle,
  Clock,
  Archive,
  Search,
  Filter,
  Edit2,
  Check,
  X,
  AlertTriangle,
  Info,
  ArrowRight
} from 'lucide-react';
import { orcamentoApi } from '../services/api';

const VerOrcamento = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [orcamento, setOrcamento] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterConfidence, setFilterConfidence] = useState('all');

  // Função para formatar valores monetários
  const formatarValor = (valor) => {
    if (!valor && valor !== 0) return 'Kz 0,00';
    const numeroFormatado = parseFloat(valor).toLocaleString('pt-AO', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
    return ` ${numeroFormatado}`;
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
      'rascunho': 'bg-yellow-100 text-yellow-800 border-yellow-200',
      'em_analise': 'bg-blue-100 text-blue-800 border-blue-200',
      'aprovado': 'bg-green-100 text-green-800 border-green-200',
      'rejeitado': 'bg-red-100 text-red-800 border-red-200',
      'arquivado': 'bg-gray-100 text-gray-800 border-gray-200'
    };
    return cores[status] || 'bg-gray-100 text-gray-800 border-gray-200';
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

  // Função para determinar cor da confiança
  const getConfidenceColor = (confidence) => {
    if (confidence >= 90) return 'text-green-600 bg-green-50';
    if (confidence >= 75) return 'text-yellow-600 bg-yellow-50';
    return 'text-red-600 bg-red-50';
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

        if (response.status === 'success' && response.data) {
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

  // SISTEMA COMPLETO DE GERAÇÃO DE PDF - VERSÃO FINAL
  // Para substituir a função handleBaixar no componente VerOrcamento.jsx

  const handleBaixar = async () => {
    try {
      console.log('📄 Gerando PDF profissional do orçamento:', id);

      // FUNÇÕES AUXILIARES
      // FUNÇÕES AUXILIARES
      const formatarValor = (valor) => {
        if (!valor && valor !== 0) return 'Kz 0,00';
        const numeroFormatado = parseFloat(valor).toLocaleString('pt-AO', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2
        });
        return `Kz ${numeroFormatado}`;
      };

      const formatarNumeroCompacto = (valor) => {
        const absValor = Math.abs(valor);
        if (absValor >= 1000000) {
          return (valor / 1000000).toFixed(1) + 'M';
        } else if (absValor >= 1000) {
          return (valor / 1000).toFixed(0) + 'k';
        }
        return Math.round(valor).toString();
      };

      // USAR DADOS REAIS DA API
      const dadosReais = {
        totalReceita: orcamento.totalReceita || 0,
        totalCusto: orcamento.totalCusto || 0,
        resultadoOperacional: (orcamento.totalReceita || 0) - (orcamento.totalCusto || 0),
        resultadoLiquido: orcamento.resultadoLiquido || 0,
        margem: orcamento.margem || 0
      };

      // CÁLCULO DE CUSTOS POR CLASSE PGC (BASEADO NOS DADOS REAIS)
      const calcularCustosPorClasse = () => {
        const custosPorClasse = {
          cmvmc: 0,    // Classe 61
          fse: 0,      // Classe 62  
          pessoal: 0,  // Classe 63
          amortizacao: 0 // Classe 64
        };

        if (orcamento.custos && orcamento.custos.length > 0) {
          orcamento.custos.forEach(custo => {
            const contaPgc = custo.contaPgc || '';
            const valor = parseFloat(custo.valor || 0);

            if (contaPgc.startsWith('61')) {
              custosPorClasse.cmvmc += valor;
            } else if (contaPgc.startsWith('62')) {
              custosPorClasse.fse += valor;
            } else if (contaPgc.startsWith('63')) {
              custosPorClasse.pessoal += valor;
            } else if (contaPgc.startsWith('64')) {
              custosPorClasse.amortizacao += valor;
            }
          });
        }

        // Se não há dados suficientes, usar distribuição estimada
        const totalCustosPorClasse = Object.values(custosPorClasse).reduce((a, b) => a + b, 0);
        if (totalCustosPorClasse === 0 && dadosReais.totalCusto > 0) {
          custosPorClasse.cmvmc = dadosReais.totalCusto * 0.45;
          custosPorClasse.fse = dadosReais.totalCusto * 0.15;
          custosPorClasse.pessoal = dadosReais.totalCusto * 0.30;
          custosPorClasse.amortizacao = dadosReais.totalCusto * 0.10;
        }

        return custosPorClasse;
      };

      // DISTRIBUIÇÃO TRIMESTRAL BASEADA NA SAZONALIDADE DA API
      const calcularDistribuicaoTrimestral = () => {
        let percentuaisTrim = { 1: 0, 2: 0, 3: 0, 4: 0 };

        if (orcamento.sazonalidades && orcamento.sazonalidades.length > 0) {
          // Agrupar sazonalidades por trimestre
          orcamento.sazonalidades.forEach(saz => {
            const trimestre = Math.ceil(saz.mes / 3);
            percentuaisTrim[trimestre] += parseFloat(saz.percentual || 0);
          });
        } else {
          // Distribuição uniforme se não há sazonalidade
          percentuaisTrim = { 1: 25, 2: 25, 3: 25, 4: 25 };
        }

        // Converter percentuais em valores
        return {
          trim1: {
            receita: dadosReais.totalReceita * (percentuaisTrim[1] / 100),
            custo: dadosReais.totalCusto * 0.24,
            percentual: percentuaisTrim[1]
          },
          trim2: {
            receita: dadosReais.totalReceita * (percentuaisTrim[2] / 100),
            custo: dadosReais.totalCusto * 0.25,
            percentual: percentuaisTrim[2]
          },
          trim3: {
            receita: dadosReais.totalReceita * (percentuaisTrim[3] / 100),
            custo: dadosReais.totalCusto * 0.26,
            percentual: percentuaisTrim[3]
          },
          trim4: {
            receita: dadosReais.totalReceita * (percentuaisTrim[4] / 100),
            custo: dadosReais.totalCusto * 0.25,
            percentual: percentuaisTrim[4]
          }
        };
      };

      // CÁLCULO DE INDICADORES FINANCEIROS BASEADO NOS DADOS REAIS
      const calcularIndicadores = (custosPorClasse) => {
        const margemBruta = dadosReais.totalReceita > 0 ?
          ((dadosReais.totalReceita - custosPorClasse.cmvmc) / dadosReais.totalReceita) * 100 : 0;

        const margemOperacional = dadosReais.totalReceita > 0 ?
          (dadosReais.resultadoOperacional / dadosReais.totalReceita) * 100 : 0;

        const imposto = dadosReais.resultadoOperacional > 0 ?
          dadosReais.resultadoOperacional * 0.25 : 0;

        const resultadoLiquidoCalculado = dadosReais.resultadoOperacional - imposto;

        const margemLiquida = dadosReais.totalReceita > 0 ?
          (resultadoLiquidoCalculado / dadosReais.totalReceita) * 100 : 0;

        // Ponto de equilíbrio
        const custosFixos = custosPorClasse.pessoal + custosPorClasse.amortizacao + (custosPorClasse.fse * 0.7);
        const custosVariaveis = custosPorClasse.cmvmc + (custosPorClasse.fse * 0.3);
        const margemContribuicao = dadosReais.totalReceita > 0 ?
          1 - (custosVariaveis / dadosReais.totalReceita) : 0;
        const pontoEquilibrio = margemContribuicao > 0 ? custosFixos / margemContribuicao : 0;

        // ROI
        const investimentoTotal = custosPorClasse.amortizacao * 8;
        const roi = investimentoTotal > 0 ?
          (resultadoLiquidoCalculado / investimentoTotal) * 100 : 0;

        return {
          margemBruta,
          margemOperacional,
          margemLiquida,
          pontoEquilibrio,
          roi,
          imposto,
          resultadoLiquidoCalculado
        };
      };

      // GERAR DADOS DO GRÁFICO MENSAL
      const gerarDadosGraficoMensal = () => {
        const meses = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

        let dadosMensais;
        if (orcamento.sazonalidades && orcamento.sazonalidades.length === 12) {
          // Usar dados reais da sazonalidade
          dadosMensais = orcamento.sazonalidades.map(saz => ({
            mes: saz.mes,
            percentual: parseFloat(saz.percentual || 0),
            nome: meses[saz.mes - 1]
          }));
        } else {
          // Distribuição uniforme (8.33% por mês)
          dadosMensais = Array.from({ length: 12 }, (_, i) => ({
            mes: i + 1,
            percentual: 8.33,
            nome: meses[i]
          }));
        }

        const custoMensal = dadosReais.totalCusto / 12;
        let maxAbsoluto = 0;

        const dadosCalculados = dadosMensais.map(m => {
          const receitaMensal = dadosReais.totalReceita * (m.percentual / 100);
          const resultado = receitaMensal - custoMensal;
          const imposto = resultado > 0 ? resultado * 0.25 : 0;
          const resultadoLiquido = resultado - imposto;

          if (Math.abs(resultadoLiquido) > maxAbsoluto) {
            maxAbsoluto = Math.abs(resultadoLiquido);
          }

          return {
            ...m,
            valor: resultadoLiquido,
            isPositive: resultadoLiquido >= 0
          };
        });

        return dadosCalculados.map(d => ({
          ...d,
          altura: maxAbsoluto > 0 ? Math.max(10, (Math.abs(d.valor) / maxAbsoluto) * 150) : 20
        }));
      };

      // GERAR LINHAS DE RECEITAS DA TABELA
      const gerarLinhasReceitas = (trimestres) => {
        if (!orcamento.receitas || orcamento.receitas.length === 0) {
          return `
          <tr>
            <td><span class="pgc-code">71</span></td>
            <td>Vendas e Prestação de Serviços</td>
            <td class="number">${formatarValor(trimestres.trim1.receita)}</td>
            <td class="number">${formatarValor(trimestres.trim2.receita)}</td>
            <td class="number">${formatarValor(trimestres.trim3.receita)}</td>
            <td class="number">${formatarValor(trimestres.trim4.receita)}</td>
            <td class="number"><strong>${formatarValor(dadosReais.totalReceita)}</strong></td>
          </tr>
        `;
        }

        return orcamento.receitas.map(receita => {
          const proporcaoReceita = parseFloat(receita.valor || 0) / dadosReais.totalReceita;
          return `
          <tr>
            <td><span class="pgc-code">${receita.contaPgc || '71'}</span></td>
            <td>${receita.descricao || 'Receita'}</td>
            <td class="number">${formatarValor(trimestres.trim1.receita * proporcaoReceita)}</td>
            <td class="number">${formatarValor(trimestres.trim2.receita * proporcaoReceita)}</td>
            <td class="number">${formatarValor(trimestres.trim3.receita * proporcaoReceita)}</td>
            <td class="number">${formatarValor(trimestres.trim4.receita * proporcaoReceita)}</td>
            <td class="number"><strong>${formatarValor(receita.valor || 0)}</strong></td>
          </tr>
        `;
        }).join('');
      };

      // GERAR LINHAS DE CUSTOS POR CLASSE
      const gerarLinhasCustos = (classe, nomeConta) => {
        if (!orcamento.custos || orcamento.custos.length === 0) {
          return `<tr><td colspan="7" style="text-align: center; color: #718096;">Nenhum custo nesta classe</td></tr>`;
        }

        const custosFiltrados = orcamento.custos.filter(custo =>
          (custo.contaPgc || '').startsWith(classe)
        );

        if (custosFiltrados.length === 0) {
          return `<tr><td colspan="7" style="text-align: center; color: #718096;">Nenhum custo na classe ${classe}</td></tr>`;
        }

        return custosFiltrados.map(custo => `
        <tr>
          <td><span class="pgc-code">${custo.contaPgc || classe}</span></td>
          <td>${custo.nome || custo.descricao || nomeConta}</td>
          <td class="number">${formatarValor((custo.valor || 0) * 0.24)}</td>
          <td class="number">${formatarValor((custo.valor || 0) * 0.25)}</td>
          <td class="number">${formatarValor((custo.valor || 0) * 0.26)}</td>
          <td class="number">${formatarValor((custo.valor || 0) * 0.25)}</td>
          <td class="number"><strong>${formatarValor(custo.valor || 0)}</strong></td>
        </tr>
      `).join('');
      };

      // EXECUTAR CÁLCULOS
      const custosPorClasse = calcularCustosPorClasse();
      const trimestres = calcularDistribuicaoTrimestral();
      const indicadores = calcularIndicadores(custosPorClasse);
      const dadosGrafico = gerarDadosGraficoMensal();

      console.log('Dados processados:', {
        custosPorClasse,
        trimestres,
        indicadores,
        totalSazonalidade: orcamento.sazonalidades?.reduce((sum, s) => sum + parseFloat(s.percentual || 0), 0)
      });

      console.log('Indicadores calculados:', indicadores);

      // HTML DO PDF
      const content = `
<!DOCTYPE html>
<html lang="pt">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Orçamento ${orcamento.nome} - ${orcamento.ano}</title>
    <style>
        @page { size: A4; margin: 15mm; }
        * { margin: 0; padding: 0; box-sizing: border-box; }
        
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6; color: #2d3748; background: white;
        }
        
        .document { max-width: 1200px; margin: 0 auto; background: white; }
        
        .doc-header {
            background: linear-gradient(135deg, #1a365d 0%, #2c5282 100%);
            color: white; padding: 40px; text-align: center; position: relative;
        }
        .doc-header h1 { font-size: 2.5rem; margin-bottom: 10px; font-weight: 300; letter-spacing: 2px; }
        .doc-header .company { font-size: 1.3rem; margin-bottom: 5px; }
        .doc-header .subtitle { font-size: 1rem; opacity: 0.9; }
        .doc-header .doc-number {
            position: absolute; top: 20px; right: 40px; font-size: 0.9rem;
            background: rgba(255,255,255,0.2); padding: 5px 15px; border-radius: 20px;
        }
        
        .executive-summary { background: #f8f9fa; padding: 30px 40px; border-bottom: 3px solid #e2e8f0; }
        .summary-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; margin-top: 20px; }
        .summary-card {
            background: white; padding: 20px; border-radius: 10px; text-align: center; border: 1px solid #e2e8f0;
        }
        .summary-label { font-size: 0.85rem; color: #718096; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 8px; }
        .summary-value { font-size: 1.5rem; font-weight: bold; color: #1a365d; }
        .positive { color: #2f855a; } .negative { color: #c53030; }
        
        .section { padding: 30px 40px; border-bottom: 1px solid #e2e8f0; }
        .section-title {
            font-size: 1.5rem; color: #1a365d; margin-bottom: 20px; padding-bottom: 10px;
            border-bottom: 2px solid #2c5282; display: flex; align-items: center; gap: 10px;
        }
        .section-number {
            background: #1a365d; color: white; width: 30px; height: 30px; border-radius: 50%;
            display: flex; align-items: center; justify-content: center; font-size: 1rem;
        }
        .subsection-title { font-size: 1.2rem; color: #2c5282; margin: 20px 0 10px; padding-left: 10px; border-left: 4px solid #2c5282; }
        
        table { width: 100%; border-collapse: collapse; margin-top: 15px; font-size: 0.8rem; }
        thead { background: #f7fafc; }
        th {
            padding: 10px 8px; text-align: left; font-weight: 600; color: #4a5568;
            text-transform: uppercase; letter-spacing: 0.5px; border-bottom: 2px solid #cbd5e0; font-size: 0.75rem;
        }
        td { padding: 8px; border-bottom: 1px solid #e2e8f0; }
        .pgc-code {
            display: inline-block; background: #edf2f7; color: #2d3748; padding: 2px 6px;
            border-radius: 4px; font-weight: 600; font-size: 0.7rem; margin-right: 6px;
        }
        .number { text-align: right; font-family: 'Consolas', 'Courier New', monospace; font-weight: 500; }
        .total-row { background: #f7fafc; font-weight: bold; }
        .total-row td { border-top: 2px solid #2c5282; border-bottom: 2px solid #2c5282; padding: 12px 8px; }
        .subtotal-row { background: #f1f5f9; font-weight: 600; }
        
        .monthly-chart { margin-top: 30px; padding: 20px; background: #f8f9fa; border-radius: 10px; }
        .chart-title { font-size: 1.1rem; color: #2d3748; margin-bottom: 20px; text-align: center; }
        .chart-bars { display: flex; justify-content: space-between; align-items: flex-end; height: 200px; padding: 0 10px; }
        .bar-group { flex: 1; display: flex; flex-direction: column; align-items: center; position: relative; margin: 0 2px; }
        .bar { width: 20px; border-radius: 3px 3px 0 0; position: relative; }
        .bar.positive { background: linear-gradient(180deg, #48bb78 0%, #38a169 100%); }
        .bar.negative { background: linear-gradient(180deg, #fc8181 0%, #f56565 100%); }
        .bar-value {
            position: absolute; top: -25px; left: 50%; transform: translateX(-50%); font-size: 0.65rem;
            font-weight: bold; background: rgba(255, 255, 255, 0.9); padding: 2px 4px;
            border-radius: 3px; white-space: nowrap;
        }
        .bar-label { margin-top: 10px; font-size: 0.7rem; color: #4a5568; text-align: center; font-weight: 500; }
        
        .indicators-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 15px; margin-top: 20px; }
        .indicator-card { padding: 12px; background: white; border-radius: 8px; border: 1px solid #e2e8f0; text-align: center; }
        .indicator-label { font-size: 0.75rem; color: #718096; margin-bottom: 5px; }
        .indicator-value { font-size: 1.1rem; font-weight: bold; color: #2c5282; }
        
        .notes-section { background: #fffaf0; padding: 20px; border-radius: 10px; margin-top: 20px; border: 1px solid #fed7aa; }
        .notes-title { font-size: 0.9rem; color: #92400e; margin-bottom: 10px; font-weight: 600; }
        .notes-list { list-style-position: inside; color: #78350f; font-size: 0.8rem; }
        .notes-list li { margin-bottom: 5px; }
        
        .doc-footer { background: #2d3748; color: white; padding: 25px 40px; text-align: center; }
        .signature-section { display: grid; grid-template-columns: repeat(3, 1fr); gap: 30px; margin-top: 30px; padding-top: 40px; }
        .signature-box { text-align: center; }
        .signature-line { border-top: 2px solid #cbd5e0; margin-bottom: 10px; width: 80%; margin-left: auto; margin-right: auto; }
        .signature-title { font-size: 0.8rem; color: #cbd5e0; }
        .signature-name { font-size: 0.75rem; color: #a0aec0; margin-top: 5px; }
        
        @media print {
            body { background: white; }
            .doc-header { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
        }
    </style>
</head>
<body>
    <div class="document">
        <div class="doc-header">
            <div class="doc-number">ORÇ/${orcamento.ano}/${String(id).padStart(3, '0')}</div>
            <h1>ORÇAMENTO ANUAL ${orcamento.ano}</h1>
            <div class="company">${orcamento.nome}</div>
            <div class="subtitle">Exercício Económico ${orcamento.ano} | Conformidade PGC-AO</div>
        </div>
        
         <div class="executive-summary">
            <h2 style="color: #1a365d; margin-bottom: 10px;">Sumário Executivo</h2>
            <div class="summary-grid">
                <div class="summary-card">
                    <div class="summary-label">Receitas Previstas</div>
                    <div class="summary-value">${formatarValor(dadosReais.totalReceita)}</div>
                </div>
                <div class="summary-card">
                    <div class="summary-label">Custos Totais</div>
                    <div class="summary-value">${formatarValor(dadosReais.totalCusto)}</div>
                </div>
                <div class="summary-card">
                    <div class="summary-label">Resultado Líquido</div>
                    <div class="summary-value ${dadosReais.resultadoLiquido >= 0 ? 'positive' : 'negative'}">${formatarValor(dadosReais.resultadoLiquido)}</div>
                </div>
                <div class="summary-card">
                    <div class="summary-label">Margem Líquida</div>
                    <div class="summary-value ${indicadores.margemLiquida >= 0 ? 'positive' : 'negative'}">${indicadores.margemLiquida.toFixed(1)}%</div>
                </div>
            </div>
        </div>
        
       <div class="section">
            <h2 class="section-title">
                <span class="section-number">1</span>
                PROVEITOS OPERACIONAIS (CLASSE 7 - PGC-AO)
            </h2>
            <table>
                <thead>
                    <tr>
                        <th>Conta PGC</th><th>Descrição</th>
                        <th class="number">1º Trim (${trimestres.trim1.percentual.toFixed(1)}%)</th>
                        <th class="number">2º Trim (${trimestres.trim2.percentual.toFixed(1)}%)</th>
                        <th class="number">3º Trim (${trimestres.trim3.percentual.toFixed(1)}%)</th>
                        <th class="number">4º Trim (${trimestres.trim4.percentual.toFixed(1)}%)</th>
                        <th class="number">Total Anual</th>
                    </tr>
                </thead>
                <tbody>
                    ${gerarLinhasReceitas(trimestres)}
                    <tr class="total-row">
                        <td colspan="2"><strong>TOTAL PROVEITOS OPERACIONAIS</strong></td>
                        <td class="number">${formatarValor(trimestres.trim1.receita)}</td>
                        <td class="number">${formatarValor(trimestres.trim2.receita)}</td>
                        <td class="number">${formatarValor(trimestres.trim3.receita)}</td>
                        <td class="number">${formatarValor(trimestres.trim4.receita)}</td>
                        <td class="number"><strong>${formatarValor(dadosReais.totalReceita)}</strong></td>
                    </tr>
                </tbody>
            </table>
        </div>
        
        <div class="section">
            <h2 class="section-title">
                <span class="section-number">2</span>
                CUSTOS OPERACIONAIS (CLASSE 6 - PGC-AO)
            </h2>
            
            <h3 class="subsection-title">2.1. Custo das Mercadorias Vendidas e Matérias Consumidas (CMVMC)</h3>
            <table>
                <thead>
                    <tr>
                        <th>Conta PGC</th><th>Descrição</th>
                        <th class="number">1º Trim</th><th class="number">2º Trim</th>
                        <th class="number">3º Trim</th><th class="number">4º Trim</th>
                        <th class="number">Total Anual</th>
                    </tr>
                </thead>
                <tbody>
                    ${gerarLinhasCustos('61', 'Matérias-primas e subsidiárias')}
                    <tr class="subtotal-row">
                        <td colspan="2">Subtotal CMVMC</td>
                        <td class="number">${formatarValor(custosPorClasse.cmvmc * 0.24)}</td>
                        <td class="number">${formatarValor(custosPorClasse.cmvmc * 0.25)}</td>
                        <td class="number">${formatarValor(custosPorClasse.cmvmc * 0.26)}</td>
                        <td class="number">${formatarValor(custosPorClasse.cmvmc * 0.25)}</td>
                        <td class="number">${formatarValor(custosPorClasse.cmvmc)}</td>
                    </tr>
                </tbody>
            </table>
            
            <h3 class="subsection-title">2.2. Fornecimentos e Serviços Externos (FSE)</h3>
            <table>
                <thead>
                    <tr>
                        <th>Conta PGC</th><th>Descrição</th>
                        <th class="number">1º Trim</th><th class="number">2º Trim</th>
                        <th class="number">3º Trim</th><th class="number">4º Trim</th>
                        <th class="number">Total Anual</th>
                    </tr>
                </thead>
                <tbody>
                    ${gerarLinhasCustos('62', 'Fornecimentos e serviços externos')}
                    <tr class="subtotal-row">
                        <td colspan="2">Subtotal FSE</td>
                        <td class="number">${formatarValor(custosPorClasse.fse * 0.24)}</td>
                        <td class="number">${formatarValor(custosPorClasse.fse * 0.25)}</td>
                        <td class="number">${formatarValor(custosPorClasse.fse * 0.26)}</td>
                        <td class="number">${formatarValor(custosPorClasse.fse * 0.25)}</td>
                        <td class="number">${formatarValor(custosPorClasse.fse)}</td>
                    </tr>
                </tbody>
            </table>
            
                        <h3 class="subsection-title">2.3. Custos com o Pessoal</h3>
            <table>
                <thead>
                    <tr>
                        <th>Conta PGC</th><th>Descrição</th>
                        <th class="number">1º Trim</th><th class="number">2º Trim</th>
                        <th class="number">3º Trim</th><th class="number">4º Trim</th>
                        <th class="number">Total Anual</th>
                    </tr>
                </thead>
                <tbody>
                    ${gerarLinhasCustos('63', 'Custos com pessoal')}
                    <tr class="subtotal-row">
                        <td colspan="2">Subtotal Pessoal</td>
                        <td class="number">${formatarValor(custosPorClasse.pessoal * 0.24)}</td>
                        <td class="number">${formatarValor(custosPorClasse.pessoal * 0.25)}</td>
                        <td class="number">${formatarValor(custosPorClasse.pessoal * 0.26)}</td>
                        <td class="number">${formatarValor(custosPorClasse.pessoal * 0.25)}</td>
                        <td class="number">${formatarValor(custosPorClasse.pessoal)}</td>
                    </tr>
                </tbody>
            </table>
            
            <h3 class="subsection-title">2.4. Amortizações e Provisões</h3>
            <table>
                <thead>
                    <tr>
                        <th>Conta PGC</th><th>Descrição</th>
                        <th class="number">1º Trim</th><th class="number">2º Trim</th>
                        <th class="number">3º Trim</th><th class="number">4º Trim</th>
                        <th class="number">Total Anual</th>
                    </tr>
                </thead>
                <tbody>
                    ${gerarLinhasCustos('64', 'Amortizações e provisões')}
                    <tr class="total-row">
                        <td colspan="2"><strong>TOTAL CUSTOS OPERACIONAIS</strong></td>
                        <td class="number">${formatarValor(custosPorClasse.cmvmc * 0.24 + custosPorClasse.fse * 0.24 + custosPorClasse.pessoal * 0.24 + custosPorClasse.amortizacao * 0.24)}</td>
                        <td class="number">${formatarValor(custosPorClasse.cmvmc * 0.25 + custosPorClasse.fse * 0.25 + custosPorClasse.pessoal * 0.25 + custosPorClasse.amortizacao * 0.25)}</td>
                        <td class="number">${formatarValor(custosPorClasse.cmvmc * 0.26 + custosPorClasse.fse * 0.26 + custosPorClasse.pessoal * 0.26 + custosPorClasse.amortizacao * 0.26)}</td>
                        <td class="number">${formatarValor(custosPorClasse.cmvmc * 0.25 + custosPorClasse.fse * 0.25 + custosPorClasse.pessoal * 0.25 + custosPorClasse.amortizacao * 0.25)}</td>
                        <td class="number"><strong>${formatarValor(dadosReais.totalCusto)}</strong></td>
                    </tr>
                </tbody>
            </table>
        </div>
        
        <div class="section">
            <h2 class="section-title">
                <span class="section-number">3</span>
                DEMONSTRAÇÃO DE RESULTADOS PREVISIONAL
            </h2>
            <table>
                <thead>
                    <tr>
                        <th>Descrição</th>
                        <th class="number">Valor (Kz)</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td><strong>(+) Proveitos Operacionais</strong></td>
                        <td class="number">${formatarValor(dadosReais.totalReceita)}</td>
                    </tr>
                    <tr>
                        <td><strong>(-) Custos Operacionais</strong></td>
                        <td class="number">${formatarValor(dadosReais.totalCusto)}</td>
                    </tr>
                    <tr class="subtotal-row">
                        <td><strong>= Resultado Operacional (EBITDA)</strong></td>
                        <td class="number">${formatarValor(dadosReais.resultadoOperacional)}</td>
                    </tr>
                    <tr>
                        <td>(-) Imposto Industrial (25%)</td>
                        <td class="number">${formatarValor(indicadores.imposto)}</td>
                    </tr>
                    <tr class="total-row">
                        <td><strong>= RESULTADO LÍQUIDO DO EXERCÍCIO</strong></td>
                        <td class="number ${indicadores.resultadoLiquidoCalculado >= 0 ? 'positive' : 'negative'}">
                            <strong>${formatarValor(indicadores.resultadoLiquidoCalculado)}</strong>
                        </td>
                    </tr>
                </tbody>
            </table>
            
            <div class="monthly-chart">
                <h3 class="chart-title">Evolução Mensal do Resultado Líquido</h3>
                <div class="chart-bars">
                    ${dadosGrafico.map(mes => `
                        <div class="bar-group">
                            <div class="bar ${mes.isPositive ? 'positive' : 'negative'}" style="height: ${mes.altura}px">
                                <div class="bar-value">${formatarNumeroCompacto(mes.valor)}</div>
                            </div>
                            <div class="bar-label">${mes.nome}</div>
                        </div>
                    `).join('')}
                </div>
            </div>
        </div>
        
        <div class="section">
            <h2 class="section-title">
                <span class="section-number">4</span>
                INDICADORES FINANCEIROS
            </h2>
            <div class="indicators-grid">
                <div class="indicator-card">
                    <div class="indicator-label">Margem Bruta</div>
                    <div class="indicator-value ${indicadores.margemBruta >= 0 ? 'positive' : 'negative'}">${indicadores.margemBruta.toFixed(1)}%</div>
                </div>
                <div class="indicator-card">
                    <div class="indicator-label">Margem Operacional</div>
                    <div class="indicator-value ${indicadores.margemOperacional >= 0 ? 'positive' : 'negative'}">${indicadores.margemOperacional.toFixed(1)}%</div>
                </div>
                <div class="indicator-card">
                    <div class="indicator-label">Margem Líquida</div>
                    <div class="indicator-value ${indicadores.margemLiquida >= 0 ? 'positive' : 'negative'}">${indicadores.margemLiquida.toFixed(1)}%</div>
                </div>
                <div class="indicator-card">
                    <div class="indicator-label">Ponto de Equilíbrio</div>
                    <div class="indicator-value">${formatarValor(indicadores.pontoEquilibrio)}</div>
                </div>
                <div class="indicator-card">
                    <div class="indicator-label">ROI Previsto</div>
                    <div class="indicator-value ${indicadores.roi >= 0 ? 'positive' : 'negative'}">${indicadores.roi.toFixed(1)}%</div>
                </div>
            </div>
        </div>
        
        <div class="section">
            <h2 class="section-title">
                <span class="section-number">5</span>
                NOTAS E PREMISSAS DO ORÇAMENTO
            </h2>
            <div class="notes-section">
                <div class="notes-title">Premissas Utilizadas:</div>
                <ul class="notes-list">
                    <li>Taxa de câmbio considerada: 1 USD = 850 AOA</li>
                    <li>Taxa de inflação projetada: 15% ao ano</li>
                    <li>Preços baseados em projeções de mercado</li>
                    <li>Taxa de Imposto Industrial: 25% sobre lucros tributáveis</li>
                    <li>Conformidade total com o Plano Geral de Contabilidade de Angola (PGC-AO)</li>
                    <li>Subsídio de férias e 13º salário incluídos nos custos com pessoal</li>
                    ${orcamento.sazonalidades && orcamento.sazonalidades.length > 0 ?
          '<li>Distribuição de receitas baseada na sazonalidade histórica</li>' :
          '<li>Distribuição uniforme de receitas ao longo do ano</li>'}
                </ul>
            </div>
        </div>
        
        <div class="section">
            <div class="signature-section">
                <div class="signature-box">
                    <div class="signature-line"></div>
                    <div class="signature-title">Elaborado por</div>
                    <div class="signature-name">${orcamento.criador?.nome || 'Departamento Financeiro'}</div>
                </div>
                <div class="signature-box">
                    <div class="signature-line"></div>
                    <div class="signature-title">Revisto por</div>
                    <div class="signature-name">Diretor Financeiro</div>
                </div>
                <div class="signature-box">
                    <div class="signature-line"></div>
                    <div class="signature-title">Aprovado por</div>
                    <div class="signature-name">Administração</div>
                </div>
            </div>
        </div>
        
        <div class="doc-footer">
            <p>Sistema Híbrido de Orçamento - Conformidade PGC-AO</p>
            <p style="font-size: 0.9rem; margin-top: 10px; opacity: 0.8;">
                Documento gerado automaticamente após validação de dados e mapeamento PGC-AO
            </p>
            <p style="font-size: 0.85rem; margin-top: 5px; opacity: 0.6;">
                Data de Emissão: ${new Date().toLocaleDateString('pt-AO')} | Válido para o exercício de ${orcamento.ano}
            </p>
        </div>
    </div>
</body>
</html>
`;

      // Abrir nova janela para impressão/visualização
      const printWindow = window.open('', '_blank');
      printWindow.document.write(content);
      printWindow.document.close();

      // Opção para imprimir diretamente
      setTimeout(() => {
        printWindow.print();
      }, 500);

    } catch (error) {
      console.error('❌ Erro ao gerar PDF:', error);
      alert('Erro ao gerar o PDF. Tente novamente.');
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

  // Filtrar mapeamentos
  const filteredMappings = () => {
    const allMappings = [
      ...(orcamento.receitas || []).map(item => ({ ...item, tipo: 'receita' })),
      ...(orcamento.custos || []).map(item => ({ ...item, tipo: 'custo' })),
      ...(orcamento.ativos || []).map(item => ({ ...item, tipo: 'ativo' }))
    ];

    return allMappings.filter(mapping => {
      const matchesSearch = mapping.descricao?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        mapping.nome?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        mapping.contaPgc?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesConfidence = filterConfidence === 'all' ||
        (filterConfidence === 'high' && mapping.confiancaMapeamento >= 90) ||
        (filterConfidence === 'medium' && mapping.confiancaMapeamento >= 75 && mapping.confiancaMapeamento < 90) ||
        (filterConfidence === 'low' && mapping.confiancaMapeamento < 75);

      return matchesSearch && matchesConfidence;
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-gray-300 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando orçamento...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-6">
          <div className="w-16 h-16 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <AlertCircle className="w-8 h-8 text-red-600" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-4">Erro ao carregar orçamento</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={handleVoltar}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold"
          >
            Voltar para Lista
          </button>
        </div>
      </div>
    );
  }

  if (!orcamento) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Orçamento não encontrado</h2>
          <button
            onClick={handleVoltar}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold"
          >
            Voltar para Lista
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b shadow-sm py-4 px-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={handleVoltar}
              className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center text-white">
                📋
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">{orcamento.nome}</h1>
                <p className="text-sm text-gray-600">Visualização do orçamento</p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-semibold border ${orcamento.statusCor}`}>
              {orcamento.statusIcone}
              {orcamento.statusFormatado}
            </span>

            <button
              onClick={handleBaixar}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Download className="w-4 h-4" />
              Exportar PDF
            </button>

            {(orcamento.status !== 'arquivado' && orcamento.status !== 'aprovado') && (
              <button
                onClick={handleEditar}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                Editar
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-6">
        {/* Informações Gerais */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Card Principal */}
          <div className="lg:col-span-2 bg-white rounded-2xl shadow-lg p-6 transition-all duration-300 hover:shadow-xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <FileText className="w-5 h-5 text-blue-600" />
                </div>
                Informações Gerais
              </h2>
              <div className="p-2 bg-gray-100 rounded-lg">
                <span className={`text-xs font-semibold px-2 py-1 rounded-full ${orcamento.statusCor}`}>
                  {orcamento.statusFormatado}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1">
                <label className="text-sm font-semibold text-gray-500 block">Nome do Orçamento</label>
                <p className="text-gray-900 text-lg font-medium transition-all duration-200 hover:text-blue-600">
                  {orcamento.nome}
                </p>
              </div>

              <div className="space-y-1">
                <label className="text-sm font-semibold text-gray-500 block">Ano</label>
                <p className="text-gray-900 text-lg font-medium bg-blue-50 px-3 py-2 rounded-lg transition-all duration-200 hover:bg-blue-100">
                  {orcamento.ano}
                </p>
              </div>

              <div className="space-y-1">
                <label className="text-sm font-semibold text-gray-500 block">Data de Início</label>
                <p className="text-gray-900 text-lg font-medium flex items-center gap-2 transition-all duration-200 hover:text-blue-600">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  {orcamento.dataInicioFormatada}
                </p>
              </div>

              <div className="space-y-1">
                <label className="text-sm font-semibold text-gray-500 block">Data de Fim</label>
                <p className="text-gray-900 text-lg font-medium flex items-center gap-2 transition-all duration-200 hover:text-blue-600">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  {orcamento.dataFimFormatada}
                </p>
              </div>

              {orcamento.descricao && (
                <div className="md:col-span-2 space-y-1">
                  <label className="text-sm font-semibold text-gray-500 block">Descrição</label>
                  <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 transition-all duration-200 hover:border-blue-200">
                    <p className="text-gray-700 leading-relaxed">{orcamento.descricao}</p>
                  </div>
                </div>
              )}

              {orcamento.observacoes && (
                <div className="md:col-span-2 space-y-1">
                  <label className="text-sm font-semibold text-gray-500 block">Observações</label>
                  <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200 transition-all duration-200 hover:border-yellow-300">
                    <p className="text-yellow-700 leading-relaxed">{orcamento.observacoes}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Card de Resumo Financeiro */}
          <div className="bg-white rounded-2xl shadow-lg p-6 transition-all duration-300 hover:shadow-xl">
            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <div className="p-2 bg-green-100 rounded-lg">
                <DollarSign className="w-5 h-5 text-green-600" />
              </div>
              Resumo Financeiro
            </h2>

            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-green-50 border border-green-200 rounded-xl transition-all duration-200 hover:border-green-300 hover:shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <TrendingUp className="w-5 h-5 text-green-600" />
                  </div>
                  <span className="text-gray-700 font-medium">Total Receitas</span>
                </div>
                <span className="text-green-600 font-bold text-lg transition-all duration-200 hover:scale-105">
                  {formatarValor(orcamento.totalReceita || 0)}
                </span>
              </div>

              <div className="flex items-center justify-between p-4 bg-red-50 border border-red-200 rounded-xl transition-all duration-200 hover:border-red-300 hover:shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-red-100 rounded-lg">
                    <TrendingDown className="w-5 h-5 text-red-600" />
                  </div>
                  <span className="text-gray-700 font-medium">Total Custos</span>
                </div>
                <span className="text-red-600 font-bold text-lg transition-all duration-200 hover:scale-105">
                  {formatarValor(orcamento.totalCusto || 0)}
                </span>
              </div>

              <div className="border-t border-gray-200 pt-4 space-y-3">
                <div className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-gray-100 border border-gray-200 rounded-xl transition-all duration-200 hover:border-blue-200 hover:shadow-sm">
                  <span className="text-gray-900 font-medium">Resultado Líquido</span>
                  <span className={`font-bold text-lg transition-all duration-200 hover:scale-105 ${(orcamento.resultadoLiquido || 0) >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                    {formatarValor(orcamento.resultadoLiquido || 0)}
                  </span>
                </div>

                <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-blue-100 border border-blue-200 rounded-xl transition-all duration-200 hover:border-blue-300 hover:shadow-sm">
                  <span className="text-gray-900 font-medium">Margem</span>
                  <span className={`font-bold text-lg transition-all duration-200 hover:scale-105 ${(orcamento.margem || 0) >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                    {(orcamento.margem || 0).toFixed(2)}%
                  </span>
                </div>
              </div>
            </div>

            {/* Indicadores de Performance */}
            <div className="mt-6 pt-4 border-t border-gray-200">
              <h3 className="text-sm font-semibold text-gray-500 mb-3">Indicadores de Performance</h3>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-gray-50 p-3 rounded-lg text-center transition-all duration-200 hover:bg-gray-100">
                  <div className="text-2xl font-bold text-blue-600">
                    {orcamento.receitas?.length || 0}
                  </div>
                  <div className="text-xs text-gray-500">Itens de Receita</div>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg text-center transition-all duration-200 hover:bg-gray-100">
                  <div className="text-2xl font-bold text-red-600">
                    {orcamento.custos?.length || 0}
                  </div>
                  <div className="text-xs text-gray-500">Itens de Custo</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Mapeamento PGC */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6 transition-all duration-300 hover:shadow-xl">
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
            <div>
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Filter className="w-5 h-5 text-purple-600" />
                </div>
                Mapeamento PGC-AO
              </h2>
              <p className="text-gray-600 mt-1">Revisão do mapeamento automático para o Plano Geral de Contabilidade</p>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500">
                {filteredMappings().length} itens
              </span>
            </div>
          </div>

          {/* Filtros */}
          <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-4 mb-6 border border-gray-200">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Pesquisar por descrição ou conta PGC..."
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="p-2 bg-gray-200 rounded-lg">
                  <Filter className="w-5 h-5 text-gray-600" />
                </div>
                <select
                  className="px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 transition-all duration-200"
                  value={filterConfidence}
                  onChange={(e) => setFilterConfidence(e.target.value)}
                >
                  <option value="all">Todas as Confianças</option>
                  <option value="high">Alta (≥90%)</option>
                  <option value="medium">Média (75-89%)</option>
                  <option value="low">Baixa (&lt;75%)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Tabela de Mapeamento */}
          <div className="overflow-hidden rounded-xl border border-gray-200 shadow-sm">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tipo
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Descrição
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Mapeamento PGC
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Valor
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Confiança
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredMappings().map((mapping, index) => (
                  <tr
                    key={index}
                    className="hover:bg-blue-50 transition-all duration-150 group"
                  >
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium transition-all duration-200 group-hover:scale-105 ${mapping.tipo === 'receita' ? 'bg-green-100 text-green-800 group-hover:bg-green-200' :
                        mapping.tipo === 'custo' ? 'bg-red-100 text-red-800 group-hover:bg-red-200' :
                          'bg-blue-100 text-blue-800 group-hover:bg-blue-200'
                        }`}>
                        {mapping.tipo === 'receita' ? 'Receita' : mapping.tipo === 'custo' ? 'Custo' : 'Ativo'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900 group-hover:text-blue-600 transition-colors duration-200">
                        {mapping.descricao || mapping.nome}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-blue-600 bg-blue-50 px-2 py-1 rounded-md group-hover:bg-blue-100 transition-colors duration-200">
                          {mapping.contaPgc || 'N/A'}
                        </span>
                        <ArrowRight className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-600 group-hover:text-gray-800 transition-colors duration-200">
                          {mapping.nomeContaPgc || 'Não mapeado'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm font-medium text-gray-900 bg-gray-50 px-2 py-1 rounded-md group-hover:bg-gray-100 transition-colors duration-200">
                        {formatarValor(mapping.valor)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium transition-all duration-200 group-hover:scale-105 ${getConfidenceColor(mapping.confiancaMapeamento || 0)}`}>
                        {mapping.confiancaMapeamento || 0}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredMappings().length === 0 && (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="w-8 h-8 text-gray-400" />
              </div>
              <p className="text-gray-500 font-medium">Nenhum item encontrado</p>
              <p className="text-gray-400 text-sm mt-2">Tente ajustar os filtros de busca</p>
            </div>
          )}

          {/* Info Box */}
          <div className="mt-6 bg-gradient-to-r from-blue-50 to-blue-100 border border-blue-200 rounded-xl p-4 transition-all duration-200 hover:border-blue-300">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-blue-200 rounded-lg">
                <Info className="w-5 h-5 text-blue-700" />
              </div>
              <div>
                <p className="text-sm font-medium text-blue-900">Sobre o Mapeamento Automático</p>
                <p className="text-sm text-blue-700 mt-1">
                  O sistema utiliza palavras-chave e padrões para sugerir automaticamente as contas PGC mais apropriadas.
                  Itens com confiança inferior a 75% são marcados para revisão manual.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Informações de Criação */}
        <div className="bg-white rounded-2xl shadow-lg p-6 transition-all duration-300 hover:shadow-xl">
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <div className="p-2 bg-gray-100 rounded-lg">
              <User className="w-5 h-5 text-gray-600" />
            </div>
            Informações de Criação
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 transition-all duration-200 hover:border-blue-200">
              <label className="text-sm font-semibold text-gray-500 block mb-2">Criado em</label>
              <p className="text-gray-900 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-gray-400" />
                {orcamento.criadoEmFormatado}
              </p>
            </div>

            <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 transition-all duration-200 hover:border-blue-200">
              <label className="text-sm font-semibold text-gray-500 block mb-2">Última atualização</label>
              <p className="text-gray-900 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-gray-400" />
                {orcamento.atualizadoEmFormatado}
              </p>
            </div>

            {orcamento.criador && (
              <div className="bg-blue-50 p-4 rounded-xl border border-blue-200 transition-all duration-200 hover:border-blue-300">
                <label className="text-sm font-semibold text-blue-500 block mb-2">Criado por</label>
                <p className="text-blue-900 flex items-center gap-2">
                  <User className="w-4 h-4 text-blue-400" />
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