// backend/src/services/pgcMappingService.js
/**
 * Serviço de Mapeamento PGC-AO
 * Mapeia inputs genéricos de orçamento para o Plano Geral de Contabilidade de Angola
 * 
 * @author Antonio Emiliano Barros
 * @version 2.0.0
 */

const { Receita, Custo, Ativo, PgcMapping } = require('../models');
const logger = require('../utils/logger');

class PGCMappingService {
  constructor() {
    // Mapeamento PGC-AO oficial
    this.pgcMapping = {
      // CLASSE 7 - PROVEITOS (RECEITAS)
      '71': 'Vendas',
      '711': 'Vendas de Mercadorias',
      '712': 'Vendas de Produtos Acabados',
      '713': 'Vendas de Subprodutos',
      '714': 'Vendas de Produtos Agrícolas',
      '715': 'Vendas de Produtos Pecuários',
      '72': 'Prestação de Serviços',
      '721': 'Serviços Técnicos',
      '722': 'Consultoria',
      '78': 'Proveitos e Ganhos Financeiros',
      '79': 'Proveitos e Ganhos Extraordinários',

      // CLASSE 6 - CUSTOS E PERDAS
      '61': 'Custo das Mercadorias Vendidas e Matérias Consumidas',
      '611': 'Matérias-Primas',
      '612': 'Materiais Diversos',
      '613': 'Combustíveis e Lubrificantes',
      '62': 'Fornecimentos e Serviços Externos',
      '621': 'Subcontratos',
      '622': 'Serviços Especializados',
      '623': 'Materiais',
      '624': 'Energia e Fluidos',
      '625': 'Deslocações, Estadas e Transportes',
      '626': 'Serviços Diversos',
      '63': 'Custos com o Pessoal',
      '631': 'Remunerações dos Órgãos Sociais',
      '632': 'Remunerações do Pessoal',
      '635': 'Encargos sobre Remunerações',
      '64': 'Amortizações e Provisões',
      '641': 'Amortizações do Exercício',
      '68': 'Custos e Perdas Financeiros',
      '681': 'Juros Suportados',
      '69': 'Outros Custos Operacionais'
    };

    // Palavras-chave para mapeamento automático
    this.keywordMapping = {
      // RECEITAS - CLASSE 7
      '711': ['venda', 'mercadoria', 'revenda', 'comercialização'],
      '714': ['agrícola', 'cultivo', 'colheita', 'plantação', 'vegetal', 'milho', 'feijão', 'mandioca'],
      '715': ['pecuário', 'gado', 'bovino', 'animal', 'carne', 'leite', 'ovos'],
      '72': ['serviço', 'prestação', 'consultoria', 'assistência técnica'],
      '721': ['técnico', 'engenharia', 'projeto'],
      '722': ['consultoria', 'auditoria', 'assessoria'],

      // CUSTOS - CLASSE 6
      '611': ['semente', 'adubo', 'fertilizante', 'muda', 'planta', 'matéria-prima'],
      '612': ['ração', 'vacina', 'medicamento', 'veterinário', 'suplemento'],
      '613': ['combustível', 'gasóleo', 'gasolina', 'diesel', 'lubrificante'],
      '621': ['subcontrato', 'terceirizado', 'outsourcing', 'colheita mecanizada'],
      '622': ['consultoria', 'auditoria', 'contabilidade', 'advogado', 'técnico especializado'],
      '624': ['energia', 'eletricidade', 'água', 'gás'],
      '625': ['transporte', 'frete', 'viagem', 'deslocação'],
      '632': ['salário', 'ordenado', 'remuneração', 'vencimento'],
      '635': ['inss', 'segurança social', 'contribuição'],
      '641': ['depreciação', 'amortização', 'desgaste'],
      '681': ['juros', 'empréstimo', 'financiamento', 'banco']
    };
  }

  /**
   * Mapeia uma receita para conta PGC-AO
   * @param {Object} receita - Dados da receita
   * @returns {Object} Mapeamento PGC-AO
   */
  mapearReceita(receita) {
    const descricao = (receita.nome || receita.descricao || '').toLowerCase();
    const pgcMatch = this.encontrarMelhorMatch(descricao, 'receita');

    return {
      contaPgc: pgcMatch.codigo,
      nomeContaPgc: pgcMatch.nome,
      confianca: pgcMatch.confianca,
      categoriaCustomizada: pgcMatch.confianca < 80 ? receita.categoria : null,
      mapeamentoOriginal: {
        nome: receita.nome,
        descricao: receita.descricao,
        valor: receita.valor,
        categoria: receita.categoria
      }
    };
  }

  /**
   * Mapeia um custo para conta PGC-AO
   * @param {Object} custo - Dados do custo
   * @returns {Object} Mapeamento PGC-AO
   */
  mapearCusto(custo) {
    const descricao = (custo.nome || custo.descricao || '').toLowerCase();
    const tipo = custo.tipoCusto || 'material';
    
    // Mapear baseado no tipo primeiro
    let pgcMatch = this.mapearPorTipo(tipo, descricao);
    
    // Se não encontrar match por tipo, usar palavras-chave
    if (pgcMatch.confianca < 70) {
      pgcMatch = this.encontrarMelhorMatch(descricao, 'custo');
    }

    return {
      contaPgc: pgcMatch.codigo,
      nomeContaPgc: pgcMatch.nome,
      confianca: pgcMatch.confianca,
      categoriaCustomizada: pgcMatch.confianca < 80 ? custo.categoria : null,
      mapeamentoOriginal: {
        nome: custo.nome,
        descricao: custo.descricao,
        tipoCusto: custo.tipoCusto,
        valor: custo.valor
      }
    };
  }

  /**
   * Mapeia um ativo para conta PGC-AO (gera amortização)
   * @param {Object} ativo - Dados do ativo
   * @returns {Object} Mapeamento PGC-AO
   */
  mapearAtivo(ativo) {
    const amortizacaoAnual = (ativo.valor || 0) / (ativo.vidaUtil || 10);
    
    return {
      contaPgc: '641',
      nomeContaPgc: 'Amortizações do Exercício',
      confianca: 95,
      categoriaCustomizada: null,
      valorAmortizacao: amortizacaoAnual,
      mapeamentoOriginal: {
        nome: ativo.nome,
        valor: ativo.valor,
        vidaUtil: ativo.vidaUtil,
        tipo: ativo.tipo
      }
    };
  }

  /**
   * Processa todos os itens de um orçamento
   * @param {Object} orcamentoData - Dados completos do orçamento
   * @returns {Object} Orçamento com mapeamento PGC-AO
   */
  async processarOrcamento(orcamentoData) {
    try {
      logger.info('Iniciando mapeamento PGC-AO do orçamento', { orcamentoId: orcamentoData.id });

      const resultado = {
        orcamentoId: orcamentoData.id,
        mapeamento: {
          receitas: [],
          custos: [],
          ativos: [],
          resumoPorClasse: {},
          estatisticas: {
            totalItens: 0,
            itensComAltaConfianca: 0,
            itensPrecisandoRevisao: 0
          }
        },
        conformidadePGC: {
          nivel: 'alto',
          problemas: [],
          recomendacoes: []
        }
      };

      // Mapear receitas
      if (orcamentoData.receitas && orcamentoData.receitas.length > 0) {
        for (const receita of orcamentoData.receitas) {
          const mapeamento = this.mapearReceita(receita);
          resultado.mapeamento.receitas.push({
            ...receita,
            pgcMapping: mapeamento
          });
        }
      }

      // Mapear custos
      if (orcamentoData.custos && orcamentoData.custos.length > 0) {
        for (const custo of orcamentoData.custos) {
          const mapeamento = this.mapearCusto(custo);
          resultado.mapeamento.custos.push({
            ...custo,
            pgcMapping: mapeamento
          });
        }
      }

      // Mapear ativos (gerar amortizações)
      if (orcamentoData.ativos && orcamentoData.ativos.length > 0) {
        for (const ativo of orcamentoData.ativos) {
          const mapeamento = this.mapearAtivo(ativo);
          resultado.mapeamento.ativos.push({
            ...ativo,
            pgcMapping: mapeamento
          });
        }
      }

      // Calcular estatísticas
      resultado.mapeamento.estatisticas = this.calcularEstatisticas(resultado.mapeamento);

      // Gerar resumo por classe PGC
      resultado.mapeamento.resumoPorClasse = this.gerarResumoPorClasse(resultado.mapeamento);

      // Avaliar conformidade
      resultado.conformidadePGC = this.avaliarConformidade(resultado.mapeamento);

      // Salvar mapeamento na base de dados se necessário
      await this.salvarMapeamento(resultado);

      logger.info('Mapeamento PGC-AO concluído', { 
        orcamentoId: orcamentoData.id,
        totalItens: resultado.mapeamento.estatisticas.totalItens,
        confiancaMedia: this.calcularConfiancaMedia(resultado.mapeamento)
      });

      return resultado;

    } catch (error) {
      logger.error('Erro no mapeamento PGC-AO:', error);
      throw new Error(`Erro ao processar mapeamento PGC-AO: ${error.message}`);
    }
  }

  /**
   * Encontra o melhor match PGC para uma descrição
   * @param {string} descricao - Descrição do item
   * @param {string} tipo - 'receita' ou 'custo'
   * @returns {Object} Match encontrado
   */
  encontrarMelhorMatch(descricao, tipo = 'custo') {
    const desc = descricao.toLowerCase();
    let melhorMatch = {
      codigo: tipo === 'receita' ? '79' : '69',
      nome: tipo === 'receita' ? 'Outros Proveitos e Ganhos Extraordinários' : 'Outros Custos Operacionais',
      confianca: 30
    };

    // Verificar palavras-chave
    for (const [codigoPgc, palavrasChave] of Object.entries(this.keywordMapping)) {
      const tipoContaPgc = codigoPgc.startsWith('7') ? 'receita' : 'custo';
      
      if (tipoContaPgc === tipo) {
        for (const palavraChave of palavrasChave) {
          if (desc.includes(palavraChave)) {
            melhorMatch = {
              codigo: codigoPgc,
              nome: this.pgcMapping[codigoPgc] || 'Conta PGC',
              confianca: 85
            };
            break;
          }
        }
        if (melhorMatch.confianca > 80) break;
      }
    }

    return melhorMatch;
  }

  /**
   * Mapeia baseado no tipo de custo
   * @param {string} tipoCusto - Tipo do custo
   * @param {string} descricao - Descrição
   * @returns {Object} Match por tipo
   */
  mapearPorTipo(tipoCusto, descricao) {
    const mapeamentoTipo = {
      'material': { codigo: '611', nome: 'Matérias-Primas', confianca: 75 },
      'servico': { codigo: '622', nome: 'Serviços Especializados', confianca: 75 },
      'pessoal': { codigo: '632', nome: 'Remunerações do Pessoal', confianca: 90 },
      'fixo': { codigo: '626', nome: 'Serviços Diversos', confianca: 70 }
    };

    // Ajustes específicos baseados na descrição
    if (tipoCusto === 'pessoal') {
      if (descricao.includes('inss') || descricao.includes('contribuição')) {
        return { codigo: '635', nome: 'Encargos sobre Remunerações', confianca: 95 };
      }
    }

    if (tipoCusto === 'fixo') {
      if (descricao.includes('energia') || descricao.includes('água')) {
        return { codigo: '624', nome: 'Energia e Fluidos', confianca: 90 };
      }
      if (descricao.includes('transporte') || descricao.includes('frete')) {
        return { codigo: '625', nome: 'Deslocações, Estadas e Transportes', confianca: 90 };
      }
    }

    return mapeamentoTipo[tipoCusto] || {
      codigo: '69',
      nome: 'Outros Custos Operacionais',
      confianca: 40
    };
  }

  /**
   * Calcula estatísticas do mapeamento
   * @param {Object} mapeamento - Dados do mapeamento
   * @returns {Object} Estatísticas
   */
  calcularEstatisticas(mapeamento) {
    const todosItens = [
      ...mapeamento.receitas,
      ...mapeamento.custos,
      ...mapeamento.ativos
    ];

    const totalItens = todosItens.length;
    const itensComAltaConfianca = todosItens.filter(item => 
      item.pgcMapping && item.pgcMapping.confianca >= 80
    ).length;
    const itensPrecisandoRevisao = totalItens - itensComAltaConfianca;

    return {
      totalItens,
      itensComAltaConfianca,
      itensPrecisandoRevisao,
      percentualConfianca: totalItens > 0 ? 
        Math.round((itensComAltaConfianca / totalItens) * 100) : 0
    };
  }

  /**
   * Gera resumo por classe PGC
   * @param {Object} mapeamento - Dados do mapeamento
   * @returns {Object} Resumo por classe
   */
  gerarResumoPorClasse(mapeamento) {
    const resumo = {};
    const todosItens = [
      ...mapeamento.receitas.map(r => ({ ...r.pgcMapping, valor: r.valor })),
      ...mapeamento.custos.map(c => ({ ...c.pgcMapping, valor: c.valor })),
      ...mapeamento.ativos.map(a => ({ ...a.pgcMapping, valor: a.pgcMapping.valorAmortizacao || 0 }))
    ];

    todosItens.forEach(item => {
      if (!item.contaPgc) return;
      
      const classePgc = item.contaPgc.substring(0, 2);
      
      if (!resumo[classePgc]) {
        resumo[classePgc] = {
          codigo: classePgc,
          nome: this.pgcMapping[classePgc] || 'Classe não definida',
          total: 0,
          contas: {}
        };
      }
      
      resumo[classePgc].total += item.valor || 0;
      
      if (!resumo[classePgc].contas[item.contaPgc]) {
        resumo[classePgc].contas[item.contaPgc] = {
          codigo: item.contaPgc,
          nome: item.nomeContaPgc,
          total: 0,
          itens: 0
        };
      }
      
      resumo[classePgc].contas[item.contaPgc].total += item.valor || 0;
      resumo[classePgc].contas[item.contaPgc].itens += 1;
    });

    return resumo;
  }

  /**
   * Avalia conformidade com PGC-AO
   * @param {Object} mapeamento - Dados do mapeamento
   * @returns {Object} Avaliação de conformidade
   */
  avaliarConformidade(mapeamento) {
    const conformidade = {
      nivel: 'alto',
      problemas: [],
      recomendacoes: [],
      score: 0
    };

    const estatisticas = mapeamento.estatisticas;
    
    // Avaliar percentual de confiança
    if (estatisticas.percentualConfianca < 70) {
      conformidade.nivel = 'baixo';
      conformidade.problemas.push('Muitos itens com mapeamento incerto');
      conformidade.recomendacoes.push('Revisar descrições e categorias dos itens');
    } else if (estatisticas.percentualConfianca < 85) {
      conformidade.nivel = 'médio';
      conformidade.problemas.push('Alguns itens precisam de revisão');
      conformidade.recomendacoes.push('Verificar itens com baixa confiança');
    }

    // Verificar se há contas essenciais
    const resumo = this.gerarResumoPorClasse(mapeamento);
    const classesPresentes = Object.keys(resumo);
    
    if (!classesPresentes.some(c => c.startsWith('7'))) {
      conformidade.problemas.push('Nenhuma receita identificada');
      conformidade.recomendacoes.push('Adicionar receitas ao orçamento');
    }
    
    if (!classesPresentes.some(c => c.startsWith('6'))) {
      conformidade.problemas.push('Nenhum custo identificado');
      conformidade.recomendacoes.push('Adicionar custos ao orçamento');
    }

    // Calcular score
    conformidade.score = Math.min(100, 
      (estatisticas.percentualConfianca * 0.7) + 
      (classesPresentes.length * 5)
    );

    return conformidade;
  }

  /**
   * Calcula confiança média do mapeamento
   * @param {Object} mapeamento - Dados do mapeamento
   * @returns {number} Confiança média
   */
  calcularConfiancaMedia(mapeamento) {
    const todosItens = [
      ...mapeamento.receitas,
      ...mapeamento.custos,
      ...mapeamento.ativos
    ];

    if (todosItens.length === 0) return 0;

    const somaConfianca = todosItens.reduce((sum, item) => 
      sum + (item.pgcMapping ? item.pgcMapping.confianca : 0), 0
    );

    return Math.round(somaConfianca / todosItens.length);
  }

  /**
   * Salva mapeamento na base de dados
   * @param {Object} resultado - Resultado do mapeamento
   */
  async salvarMapeamento(resultado) {
    try {
      // Implementar salvamento se o model PgcMapping existir
      // await PgcMapping.create({
      //   orcamentoId: resultado.orcamentoId,
      //   mapeamento: resultado.mapeamento,
      //   conformidade: resultado.conformidadePGC,
      //   criadoEm: new Date()
      // });
    } catch (error) {
      logger.error('Erro ao salvar mapeamento PGC:', error);
    }
  }

  /**
   * Gera demonstração de resultados conforme PGC-AO
   * @param {Object} mapeamento - Dados do mapeamento
   * @returns {Object} Demonstração de resultados
   */
  gerarDemonstracaoResultados(mapeamento) {
    const resumo = this.gerarResumoPorClasse(mapeamento);
    
    const demonstracao = {
      proveitos: {},
      custos: {},
      resultados: {}
    };

    // Agrupar proveitos (Classe 7)
    Object.entries(resumo).forEach(([classe, dados]) => {
      if (classe.startsWith('7')) {
        demonstracao.proveitos[dados.nome] = dados.total;
      } else if (classe.startsWith('6')) {
        demonstracao.custos[dados.nome] = dados.total;
      }
    });

    // Calcular resultados
    const totalProveitos = Object.values(demonstracao.proveitos)
      .reduce((sum, valor) => sum + valor, 0);
    const totalCustos = Object.values(demonstracao.custos)
      .reduce((sum, valor) => sum + valor, 0);

    demonstracao.resultados = {
      'Resultado Operacional': totalProveitos - totalCustos,
      'Resultado Antes de Impostos': totalProveitos - totalCustos,
      'Imposto Industrial (25%)': (totalProveitos - totalCustos) * 0.25,
      'Resultado Líquido': (totalProveitos - totalCustos) * 0.75
    };

    return demonstracao;
  }
}

module.exports = PGCMappingService;