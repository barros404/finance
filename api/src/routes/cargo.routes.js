const express = require('express');
const router = express.Router();
const cargoController = require('../controllers/cargo.controller');
const { protect } = require('../middleware/auth.middleware');
const { body, param, query } = require('express-validator');
const { validateRequest } = require('../middleware/validateRequest');

router.use(protect);

router.route('/')
  .get(
    [
      query('departamento').optional().isString(),
      query('nivel').optional().isIn(['estagiario', 'junior', 'pleno', 'senior', 'coordenador', 'gerente', 'diretor']),
      query('ativo').optional().isBoolean()
    ],
    validateRequest,
    cargoController.listarCargos
  )
  .post(
    [
      body('nome').trim().notEmpty().withMessage('Nome do cargo é obrigatório'),
      body('departamento').optional().isString(),
      body('nivel').optional().isIn(['estagiario', 'junior', 'pleno', 'senior', 'coordenador', 'gerente', 'diretor']),
      body('salarioBase').isDecimal().withMessage('Salário base deve ser um valor decimal'),
      body('percentualEncargosSociais').isDecimal().withMessage('Percentual de encargos sociais deve ser decimal')
    ],
    validateRequest,
    cargoController.criarCargo
  );

router.route('/:id/salario')
  .patch(
    [
      param('id').isInt().withMessage('ID do cargo inválido'),
      body('salarioBase').isDecimal().withMessage('Salário base deve ser um valor decimal'),
      body('dataInicio').optional().isISO8601().withMessage('Data de início inválida')
    ],
    validateRequest,
    cargoController.atualizarSalarioCargo
  );

router.get('/:id/historico',
  [
    param('id').isInt().withMessage('ID do cargo inválido')
  ],
  validateRequest,
  cargoController.obterHistoricoSalarial
);

module.exports = router;