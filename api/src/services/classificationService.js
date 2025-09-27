const fs = require('fs').promises;
const path = require('path');
const logger = require('../utils/logger');

class ClassificationService {
  constructor() {
    this.dataPath = path.join(__dirname, '../../data/classifier-store.json');
    this.defaultStore = {
      classes: {
        entrada: { terms: {}, docs: 0 },
        saida: { terms: {}, docs: 0 },
        contrato: { terms: {}, docs: 0 },
        desconhecido: { terms: {}, docs: 0 }
      },
      totalDocs: 0
    };

    this.keywordSignals = {
      entrada: ['fatura', 'venda', 'vendas', 'receita', 'cliente', 'nota de crédito'],
      saida: ['nota fiscal', 'compra', 'fornecedor', 'despesa', 'custo', 'recibo', 'pagamento'],
      contrato: ['contrato', 'fornecimento', 'vigência', 'condições', 'cláusula']
    };
  }

  async loadStore() {
    try {
      const buf = await fs.readFile(this.dataPath, 'utf8');
      return JSON.parse(buf);
    } catch {
      await this.ensureDataDir();
      await fs.writeFile(this.dataPath, JSON.stringify(this.defaultStore, null, 2));
      return JSON.parse(JSON.stringify(this.defaultStore));
    }
  }

  async ensureDataDir() {
    const dir = path.dirname(this.dataPath);
    try { await fs.mkdir(dir, { recursive: true }); } catch {}
  }

  tokenize(text) {
    return (text || '')
      .toLowerCase()
      .normalize('NFD').replace(/[^\p{L}\p{N}\s]/gu, ' ')
      .split(/\s+/)
      .filter(t => t.length > 2);
  }

  scoreByKeywords(text) {
    const t = (text || '').toLowerCase();
    const scores = { entrada: 0, saida: 0, contrato: 0, desconhecido: 0 };
    for (const [cls, words] of Object.entries(this.keywordSignals)) {
      for (const w of words) if (t.includes(w)) scores[cls] += 2;
    }
    return scores;
  }

  bayesScore(tokens, store) {
    const scores = {};
    for (const [cls, data] of Object.entries(store.classes)) {
      const docs = Math.max(1, data.docs);
      const vocab = Object.keys(data.terms).length || 1;
      const totalTerms = Object.values(data.terms).reduce((a, b) => a + b, 0) || 1;

      const prior = Math.log(docs / Math.max(1, store.totalDocs));

      let likelihood = 0;
      for (const tok of tokens) {
        const count = (data.terms[tok] || 0) + 1; // Laplace
        likelihood += Math.log(count / (totalTerms + vocab));
      }

      scores[cls] = prior + likelihood;
    }
    return scores;
  }

  normalizeLogScores(scores) {
    const vals = Object.values(scores);
    const max = Math.max(...vals);
    const exps = Object.fromEntries(Object.entries(scores).map(([k, v]) => [k, Math.exp(v - max)]));
    const sum = Object.values(exps).reduce((a, b) => a + b, 0) || 1;
    const probs = Object.fromEntries(Object.entries(exps).map(([k, v]) => [k, v / sum]));
    let best = 'desconhecido', prob = 0;
    for (const [k, v] of Object.entries(probs)) if (v > prob) { best = k; prob = v; }
    return { best, prob: Math.round(prob * 100) };
  }

  async classify(text) {
    const store = await this.loadStore();
    const tokens = this.tokenize(text);
    const keywordScores = this.scoreByKeywords(text);
    const bayesScores = this.bayesScore(tokens, store);

    const combined = {};
    for (const c of Object.keys(store.classes)) {
      combined[c] = (bayesScores[c] || -Infinity) + Math.log((keywordScores[c] + 1));
    }

    const { best, prob } = this.normalizeLogScores(combined);
    return { tipoDocumento: best, confianca: prob };
  }

  async learn(text, label) {
    const store = await this.loadStore();
    const cls = store.classes[label] ? label : 'desconhecido';
    const tokens = this.tokenize(text);
    for (const tok of tokens) {
      store.classes[cls].terms[tok] = (store.classes[cls].terms[tok] || 0) + 1;
    }
    store.classes[cls].docs += 1;
    store.totalDocs += 1;
    await fs.writeFile(this.dataPath, JSON.stringify(store, null, 2));
    logger.info('Classificador atualizado', { label: cls, tokens: tokens.length });
  }
}

module.exports = ClassificationService;