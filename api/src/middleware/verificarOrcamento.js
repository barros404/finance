// middleware/verificarOrcamento.js
const { Orcamento } = require('../models');

const verificarOrcamentoAprovado = async (req, res, next) => {
  try {
    // Obter o ano do body OU dos query parameters
    const { ano } = req.body || {};
    const anoQuery = req.query.ano;
    
    // Usar o ano do body ou da query string
    const anoParaVerificar = ano || anoQuery;
    
    if (!anoParaVerificar) {
      return res.status(400).json({
        success: false,
        message: 'Parâmetro "ano" é obrigatório'
      });
    }

    const orcamento = await Orcamento.findOne({
      where: {
        empresaId: req.user.empresaId,
        ano: anoParaVerificar,
        status: 'aprovado'
      }
    });

    if (!orcamento) {
      return res.status(400).json({
        success: false,
        message: `Não existe orçamento aprovado para o ano ${anoParaVerificar}. É necessário criar e aprovar um orçamento primeiro.`
      });
    }

    req.orcamentoAprovado = orcamento;
    next();
  } catch (error) {
    console.error('Erro ao verificar orçamento:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao verificar orçamento',
      error: error.message
    });
  }
};

module.exports = { verificarOrcamentoAprovado };