/**
 * Controlador do Dashboard - EndiAgro FinancePro
 * 
 * Este controlador gerencia todas as operações relacionadas ao dashboard,
 * incluindo estatísticas e atividades recentes.
 * 
 * @author António Emiliano Barros
 * @version 1.0.0
 */

const { Op } = require('sequelize');
const { 
  Orcamento, 
  PlanoTesouraria, 
  PgcMapping, 
  Usuario,
  Empresa 
} = require('../models');
const logger = require('../utils/logger');

/**
 * Obtém estatísticas do dashboard
 * @route GET /api/dashboard/estatisticas
 */
exports.obterEstatisticas = async (req, res) => {
  try {
    console.log('🔄 Carregando estatísticas do dashboard...');
    
    const empresaId = req.usuario.empresaId;
    
    // Buscar estatísticas em paralelo
    const [
      orcamentosPendentes,
      planosPendentes,
      contasPendentes,
      totalAprovacoes,
      atividadesRecentes
    ] = await Promise.all([
      // Orçamentos pendentes
      Orcamento.count({
        where: {
          empresaId,
          status: { [Op.in]: ['rascunho', 'em_analise'] }
        }
      }),
      
      // Planos pendentes
      PlanoTesouraria.count({
        where: {
          empresaId,
          status: { [Op.in]: ['rascunho', 'pendente'] }
        }
      }),
      
      // Contas PGC pendentes
      PgcMapping.count({}),
      
      // Total de aprovações
      Orcamento.count({
        where: {
          empresaId,
          status: 'aprovado'
        }
      }),
      
      // Atividades recentes
      obterAtividadesRecentes(empresaId, 5)
    ]);

    const estatisticas = {
      orcamentosPendentes,
      planosPendentes,
      contasPendentes,
      totalAprovacoes,
      atividadesRecentes
    };

    console.log('✅ Estatísticas carregadas:', estatisticas);

    res.status(200).json({
      status: 'success',
      data: estatisticas
    });

  } catch (error) {
    console.error('❌ Erro ao carregar estatísticas:', error);
    logger.error('Erro ao carregar estatísticas do dashboard:', error);
    
    res.status(500).json({
      status: 'error',
      message: 'Erro interno do servidor',
      error: error.message
    });
  }
};

/**
 * Obtém atividades recentes do sistema
 * @route GET /api/dashboard/atividades-recentes
 */
exports.obterAtividadesRecentes = async (req, res) => {
  try {
    const { limite = 5 } = req.query;
    const empresaId = req.usuario.empresaId;
    
    console.log('🔄 Carregando atividades recentes...');
    
    const atividades = await obterAtividadesRecentes(empresaId, parseInt(limite));
    
    console.log('✅ Atividades carregadas:', atividades.length);

    res.status(200).json({
      status: 'success',
      data: atividades
    });

  } catch (error) {
    console.error('❌ Erro ao carregar atividades recentes:', error);
    logger.error('Erro ao carregar atividades recentes:', error);
    
    res.status(500).json({
      status: 'error',
      message: 'Erro interno do servidor',
      error: error.message
    });
  }
};

/**
 * Função auxiliar para obter atividades recentes
 */
async function obterAtividadesRecentes(empresaId, limite) {
  try {
    const atividades = [];

    // Buscar orçamentos recentes
    const orcamentosRecentes = await Orcamento.findAll({
      where: { empresaId },
      order: [['updatedAt', 'DESC']],
      limit: Math.ceil(limite / 2),
      include: [
        { model: Usuario, as: 'criador', attributes: ['nome'] }
      ]
    });

    // Buscar planos recentes
    const planosRecentes = await PlanoTesouraria.findAll({
      where: { empresaId },
      order: [['updatedAt', 'DESC']],
      limit: Math.ceil(limite / 2),
      include: [
        { model: Usuario, as: 'criador', attributes: ['nome'] }
      ]
    });

    // Processar orçamentos
    orcamentosRecentes.forEach(orcamento => {
      atividades.push({
        id: `orcamento_${orcamento.id}`,
        tipo: 'orcamento',
        titulo: 'Orçamento atualizado',
        descricao: `${orcamento.nome} - ${orcamento.ano}`,
        data: orcamento.updatedAt,
        status: orcamento.status === 'aprovado' ? 'sucesso' : 'info',
        usuario: orcamento.criador?.nome || 'Sistema'
      });
    });

    // Processar planos
    planosRecentes.forEach(plano => {
      atividades.push({
        id: `plano_${plano.id}`,
        tipo: 'plano',
        titulo: 'Plano de tesouraria atualizado',
        descricao: `Plano ${plano.mes}/${plano.ano}`,
        data: plano.updatedAt,
        status: plano.status === 'aprovado' ? 'sucesso' : 'info',
        usuario: plano.criador?.nome || 'Sistema'
      });
    });

    // Ordenar por data e limitar
    return atividades
      .sort((a, b) => new Date(b.data) - new Date(a.data))
      .slice(0, limite);

  } catch (error) {
    console.error('❌ Erro ao obter atividades recentes:', error);
    return [];
  }
}
