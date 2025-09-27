const { Cargo, SalarioCargo, Empresa, Usuario } = require('../models');
const logger = require('../utils/logger');
const { successMessages, errorMessages } = require('../config/api.config');

/**
 * Listar todos os cargos da empresa
 */
exports.listarCargos = async (req, res, next) => {
  try {
    const { departamento, nivel, ativo } = req.query;
    
    const where = { empresaId: req.usuario.empresaId };
    
    if (departamento) where.departamento = departamento;
    if (nivel) where.nivel = nivel;
    if (ativo !== undefined) where.ativo = ativo === 'true';
    
    const cargos = await Cargo.findAll({
      where,
      include: [{
        model: SalarioCargo,
        as: 'historicosSalario',
        where: { dataFim: null },
        required: false
      }]
    });
    
    // Calcular custos atuais
    const cargosComCusto = await Promise.all(
      cargos.map(async (cargo) => {
        const cargoJson = cargo.toJSON();
        const salarioAtual = cargo.historicosSalario && cargo.historicosSalario[0];
        
        if (salarioAtual) {
          cargoJson.custoMensal = salarioAtual.calcularCustoTotalMensal();
          cargoJson.custoAnual = salarioAtual.calcularCustoAnual();
        } else {
          cargoJson.custoMensal = 0;
          cargoJson.custoAnual = 0;
        }
        
        return cargoJson;
      })
    );
    
    res.status(200).json({
      status: 'success',
      message: successMessages.RETRIEVED,
      data: { cargos: cargosComCusto }
    });
  } catch (error) {
    logger.error(`Erro ao listar cargos: ${error.message}`, { error, userId: req.usuario?.id });
    next(error);
  }
};

/**
 * Criar um novo cargo
 */
exports.criarCargo = async (req, res, next) => {
  const transaction = await Cargo.sequelize.transaction();
  
  try {
    const {
      nome,
      descricao,
      departamento,
      nivel,
      tipoContratacao,
      jornadaTrabalho,
      horasSemanais,
      salarioBase,
      subsidioAlimentacao,
      subsidioTransporte,
      outrosSubsidios,
      percentualEncargosSociais,
      percentualIRT,
      incluirDecimoTerceiro,
      incluirSubsidioFerias,
      observacoes
    } = req.body;
    
    // Criar o cargo
    const cargo = await Cargo.create({
      nome,
      descricao,
      departamento,
      nivel,
      tipoContratacao: tipoContratacao || 'efetivo',
      jornadaTrabalho: jornadaTrabalho || 'integral',
      horasSemanais: horasSemanais || 40,
      empresaId: req.usuario.empresaId
    }, { transaction });
    
    // Criar o primeiro salário para o cargo
    if (salarioBase) {
      await SalarioCargo.create({
        cargoId: cargo.id,
        salarioBase: salarioBase || 0,
        subsidioAlimentacao: subsidioAlimentacao || 0,
        subsidioTransporte: subsidioTransporte || 0,
        outrosSubsidios: outrosSubsidios || 0,
        percentualEncargosSociais: percentualEncargosSociais || 0,
        percentualIRT: percentualIRT || 0,
        incluirDecimoTerceiro: incluirDecimoTerceiro !== false,
        incluirSubsidioFerias: incluirSubsidioFerias !== false,
        dataInicio: new Date(),
        observacoes: observacoes || 'Salário inicial',
        aprovadoPor: req.usuario.id
      }, { transaction });
    }
    
    await transaction.commit();
    
    // Buscar cargo completo com salário
    const cargoCompleto = await Cargo.findByPk(cargo.id, {
      include: [{
        model: SalarioCargo,
        as: 'historicosSalario',
        where: { dataFim: null },
        required: false
      }]
    });
    
    res.status(201).json({
      status: 'success',
      message: successMessages.CREATED,
      data: { cargo: cargoCompleto }
    });
  } catch (error) {
    await transaction.rollback();
    logger.error(`Erro ao criar cargo: ${error.message}`, { error, userId: req.usuario?.id });
    next(error);
  }
};

/**
 * Atualizar salário de um cargo
 */
exports.atualizarSalarioCargo = async (req, res, next) => {
  const transaction = await Cargo.sequelize.transaction();
  
  try {
    const { id } = req.params;
    const {
      salarioBase,
      subsidioAlimentacao,
      subsidioTransporte,
      outrosSubsidios,
      percentualEncargosSociais,
      percentualIRT,
      incluirDecimoTerceiro,
      incluirSubsidioFerias,
      observacoes,
      dataInicio
    } = req.body;
    
    // Verificar se o cargo existe e pertence à empresa
    const cargo = await Cargo.findOne({
      where: {
        id,
        empresaId: req.usuario.empresaId
      }
    });
    
    if (!cargo) {
      return res.status(404).json({
        status: 'error',
        message: errorMessages.RESOURCE.NOT_FOUND
      });
    }
    
    // Criar novo registro de salário
    const novoSalario = await SalarioCargo.create({
      cargoId: id,
      salarioBase: salarioBase || 0,
      subsidioAlimentacao: subsidioAlimentacao || 0,
      subsidioTransporte: subsidioTransporte || 0,
      outrosSubsidios: outrosSubsidios || 0,
      percentualEncargosSociais: percentualEncargosSociais || 0,
      percentualIRT: percentualIRT || 0,
      incluirDecimoTerceiro: incluirDecimoTerceiro !== false,
      incluirSubsidioFerias: incluirSubsidioFerias !== false,
      dataInicio: dataInicio || new Date(),
      observacoes: observacoes || 'Atualização de salário',
      aprovadoPor: req.usuario.id
    }, { transaction });
    
    await transaction.commit();
    
    res.status(200).json({
      status: 'success',
      message: 'Salário atualizado com sucesso',
      data: { salario: novoSalario }
    });
  } catch (error) {
    await transaction.rollback();
    logger.error(`Erro ao atualizar salário: ${error.message}`, { error, userId: req.usuario?.id });
    next(error);
  }
};

/**
 * Obter histórico salarial de um cargo
 */
exports.obterHistoricoSalarial = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    const cargo = await Cargo.findOne({
      where: {
        id,
        empresaId: req.usuario.empresaId
      },
      include: [{
        model: SalarioCargo,
        as: 'historicosSalario',
        include: [{
          model: Usuario,
          as: 'aprovador',
          attributes: ['id', 'nome']
        }]
      }]
    });
    
    if (!cargo) {
      return res.status(404).json({
        status: 'error',
        message: errorMessages.RESOURCE.NOT_FOUND
      });
    }
    
    // Calcular valores para cada histórico
    const historicoComCalculos = cargo.historicosSalario.map(salario => {
      const salarioJson = salario.toJSON();
      salarioJson.salarioBrutoMensal = salario.calcularSalarioBrutoMensal();
      salarioJson.custoTotalMensal = salario.calcularCustoTotalMensal();
      salarioJson.salarioLiquidoMensal = salario.calcularSalarioLiquidoMensal();
      salarioJson.custoAnual = salario.calcularCustoAnual();
      
      return salarioJson;
    });
    
    res.status(200).json({
      status: 'success',
      message: successMessages.RETRIEVED,
      data: { 
        cargo: {
          ...cargo.toJSON(),
          historicosSalario: historicoComCalculos
        }
      }
    });
  } catch (error) {
    logger.error(`Erro ao obter histórico salarial: ${error.message}`, { error, userId: req.usuario?.id });
    next(error);
  }
};