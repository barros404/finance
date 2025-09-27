/**
 * Obtém o orçamento aprovado para um ano específico
 * @route GET /api/orcamentos/aprovado
 */
exports.obterOrcamentoAprovado = async (req, res, next) => {
  try {
    const { ano } = req.query;

    if (!ano) {
      return res.status(400).json({
        status: 'error',
        message: 'Ano é obrigatório'
      });
    }

    const orcamento = await Orcamento.findOne({
      where: {
        empresaId: req.usuario.empresaId,
        status: 'aprovado',
        [Op.or]: [
          { ano: parseInt(ano) },
          {
            dataInicio: {
              [Op.lte]: new Date(parseInt(ano), 11, 31)
            },
            dataFim: {
              [Op.gte]: new Date(parseInt(ano), 0, 1)
            }
          }
        ]
      },
      include: [
        {
          model: Receita,
          as: 'receitas',
          attributes: ['id', 'nome', 'descricao', 'valor', 'quantidade', 'precoUnitario', 'categoria', 'contaPgc', 'nomeContaPgc', 'confiancaMapeamento']
        },
        {
          model: Custo,
          as: 'custos',
          attributes: ['id', 'nome', 'descricao', 'tipoCusto', 'valor', 'quantidade', 'custoUnitario', 'frequencia', 'cargo', 'tipoContratacao', 'salario', 'contaPgc', 'nomeContaPgc', 'confiancaMapeamento']
        },
        {
          model: Ativo,
          as: 'ativos',
          attributes: ['id', 'nome', 'valor', 'tipo', 'contaPgc', 'nomeContaPgc', 'confiancaMapeamento']
        },
        {
          model: Sazonalidade,
          as: 'sazonalidades',
          attributes: ['id', 'mes', 'percentual']
        },
        {
          model: Usuario,
          as: 'criador',
          attributes: ['id', 'nome', 'email']
        }
      ],
      order: [['updatedAt', 'DESC']] // Pegar o mais recente se houver múltiplos
    });

    if (!orcamento) {
      return res.status(200).json({
        status: 'success',
        message: 'Nenhum orçamento aprovado encontrado para o ano especificado',
        data: null
      });
    }

    // Calcular totais
    const orcamentoJson = orcamento.toJSON();
    const totalReceita = orcamentoJson.receitas.reduce((sum, rev) => sum + parseFloat(rev.valor || 0), 0);
    const totalCusto = orcamentoJson.custos.reduce((sum, cost) => sum + parseFloat(cost.valor || 0), 0);
    const totalAtivos = orcamentoJson.ativos.reduce((sum, asset) => sum + parseFloat(asset.valor || 0), 0);
    const resultadoLiquido = totalReceita - totalCusto;
    const margem = totalReceita > 0 ? (resultadoLiquido / totalReceita) * 100 : 0;

    const response = {
      ...orcamentoJson,
      totalReceita: parseFloat(totalReceita.toFixed(2)),
      totalCusto: parseFloat(totalCusto.toFixed(2)),
      totalAtivos: parseFloat(totalAtivos.toFixed(2)),
      resultadoLiquido: parseFloat(resultadoLiquido.toFixed(2)),
      margem: parseFloat(margem.toFixed(2))
    };

    res.status(200).json({
      status: 'success',
      message: successMessages.RETRIEVED,
      data: response
    });
  } catch (error) {
    logger.error(`Erro ao obter orçamento aprovado: ${error.message}`, { error, userId: req.usuario?.id, ano: req.query.ano });
    next(error);
  }
};