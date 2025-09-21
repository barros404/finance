const express = require('express');
const router = express.Router();
const budgetController = require('../controllers/budget.controller');
const { protect } = require('../middleware/auth.middleware');
const { body, param, query } = require('express-validator');
const { validateRequest } = require('../middleware/validateRequest');

// Apply authentication middleware to all routes
router.use(protect);

// Budget routes
router
  .route('/')
  .get(
    [
      query('status').optional().isIn(['draft', 'active', 'completed', 'archived']),
      query('page').optional().isInt({ min: 1 }).toInt(),
      query('limit').optional().isInt({ min: 1, max: 100 }).toInt()
    ],
    validateRequest,
    budgetController.getAllBudgets
  )
  .post(
    [
      body('name').trim().notEmpty().withMessage('Budget name is required'),
      body('startDate').isISO8601().withMessage('Valid start date is required'),
      body('endDate')
        .isISO8601()
        .withMessage('Valid end date is required')
        .custom((value, { req }) => {
          if (new Date(value) <= new Date(req.body.startDate)) {
            throw new Error('End date must be after start date');
          }
          return true;
        }),
      body('currency').optional().isString().isLength({ min: 3, max: 3 }),
      body('hasSeasonality').optional().isBoolean(),
      body('seasonalityMonths')
        .optional()
        .isArray()
        .custom((value) => {
          if (!value.every(month => Number.isInteger(month) && month >= 1 && month <= 12)) {
            throw new Error('Seasonality months must be numbers between 1 and 12');
          }
          return true;
        })
    ],
    validateRequest,
    budgetController.createBudget
  );

router
  .route('/:id')
  .get(
    [
      param('id').isInt().withMessage('Valid budget ID is required')
    ],
    validateRequest,
    budgetController.getBudget
  )
  .patch(
    [
      param('id').isInt().withMessage('Valid budget ID is required'),
      body('name').optional().trim().notEmpty(),
      body('status').optional().isIn(['draft', 'active', 'completed', 'archived']),
      body('startDate').optional().isISO8601(),
      body('endDate')
        .optional()
        .isISO8601()
        .custom((value, { req }) => {
          if (req.body.startDate && new Date(value) <= new Date(req.body.startDate)) {
            throw new Error('End date must be after start date');
          }
          return true;
        })
    ],
    validateRequest,
    budgetController.updateBudget
  )
  .delete(
    [
      param('id').isInt().withMessage('Valid budget ID is required')
    ],
    validateRequest,
    budgetController.deleteBudget
  );

// Revenue routes
router
  .route('/:budgetId/revenues')
  .post(
    [
      param('budgetId').isInt().withMessage('Valid budget ID is required'),
      body('description').trim().notEmpty().withMessage('Description is required'),
      body('quantity').isFloat({ min: 0 }).withMessage('Quantity must be a positive number'),
      body('unitPrice').isFloat({ min: 0 }).withMessage('Unit price must be a positive number'),
      body('category').optional().trim(),
      body('unit').optional().trim(),
      body('month').optional().isInt({ min: 1, max: 12 }),
      body('isRecurring').optional().isBoolean(),
      body('recurrence').optional().isIn(['daily', 'weekly', 'monthly', 'quarterly', 'yearly']),
      body('notes').optional().trim()
    ],
    validateRequest,
    budgetController.addRevenue
  )
  .get(
    [
      param('budgetId').isInt().withMessage('Valid budget ID is required')
    ],
    validateRequest,
    budgetController.getRevenues
  );

router
  .route('/:budgetId/revenues/:revenueId')
  .patch(
    [
      param('budgetId').isInt().withMessage('Valid budget ID is required'),
      param('revenueId').isInt().withMessage('Valid revenue ID is required'),
      body('description').optional().trim().notEmpty(),
      body('quantity').optional().isFloat({ min: 0 }),
      body('unitPrice').optional().isFloat({ min: 0 }),
      body('category').optional().trim(),
      body('unit').optional().trim(),
      body('month').optional().isInt({ min: 1, max: 12 }),
      body('isRecurring').optional().isBoolean(),
      body('recurrence').optional().isIn(['daily', 'weekly', 'monthly', 'quarterly', 'yearly']),
      body('notes').optional().trim()
    ],
    validateRequest,
    budgetController.updateRevenue
  )
  .delete(
    [
      param('budgetId').isInt().withMessage('Valid budget ID is required'),
      param('revenueId').isInt().withMessage('Valid revenue ID is required')
    ],
    validateRequest,
    budgetController.deleteRevenue
  );

// Cost routes (similar structure as revenue routes)
router
  .route('/:budgetId/costs')
  .post(
    [
      param('budgetId').isInt().withMessage('Valid budget ID is required'),
      body('type').isIn(['material', 'service', 'personnel', 'fixed']),
      body('description').trim().notEmpty().withMessage('Description is required'),
      body('quantity').isFloat({ min: 0 }).withMessage('Quantity must be a positive number'),
      body('unitCost').isFloat({ min: 0 }).withMessage('Unit cost must be a positive number'),
      body('category').optional().trim(),
      body('unit').optional().trim(),
      body('frequency').optional().isIn(['daily', 'weekly', 'monthly', 'quarterly', 'yearly', 'one-time']),
      body('month').optional().isInt({ min: 1, max: 12 }),
      body('isRecurring').optional().isBoolean(),
      body('notes').optional().trim()
    ],
    validateRequest,
    budgetController.addCost
  )
  .get(
    [
      param('budgetId').isInt().withMessage('Valid budget ID is required'),
      query('type').optional().isIn(['material', 'service', 'personnel', 'fixed'])
    ],
    validateRequest,
    budgetController.getCosts
  );

router
  .route('/:budgetId/costs/:costId')
  .patch(
    [
      param('budgetId').isInt().withMessage('Valid budget ID is required'),
      param('costId').isInt().withMessage('Valid cost ID is required'),
      body('type').optional().isIn(['material', 'service', 'personnel', 'fixed']),
      body('description').optional().trim().notEmpty(),
      body('quantity').optional().isFloat({ min: 0 }),
      body('unitCost').optional().isFloat({ min: 0 }),
      body('category').optional().trim(),
      body('unit').optional().trim(),
      body('frequency').optional().isIn(['daily', 'weekly', 'monthly', 'quarterly', 'yearly', 'one-time']),
      body('month').optional().isInt({ min: 1, max: 12 }),
      body('isRecurring').optional().isBoolean(),
      body('notes').optional().trim()
    ],
    validateRequest,
    budgetController.updateCost
  )
  .delete(
    [
      param('budgetId').isInt().withMessage('Valid budget ID is required'),
      param('costId').isInt().withMessage('Valid cost ID is required')
    ],
    validateRequest,
    budgetController.deleteCost
  );

// Asset routes (similar structure as revenue and cost routes)
router
  .route('/:budgetId/assets')
  .post(
    [
      param('budgetId').isInt().withMessage('Valid budget ID is required'),
      body('name').trim().notEmpty().withMessage('Asset name is required'),
      body('type').isIn(['equipment', 'property', 'vehicle', 'other']),
      body('quantity').isInt({ min: 1 }).withMessage('Quantity must be at least 1'),
      body('purchasePrice').isFloat({ min: 0 }).withMessage('Purchase price must be a positive number'),
      body('purchaseDate').optional().isISO8601(),
      body('currentValue').optional().isFloat({ min: 0 }),
      body('depreciationRate').optional().isFloat({ min: 0, max: 100 }),
      body('usefulLife').optional().isInt({ min: 1 }),
      body('maintenanceCost').optional().isFloat({ min: 0 }),
      body('isFinanced').optional().isBoolean(),
      body('notes').optional().trim()
    ],
    validateRequest,
    budgetController.addAsset
  )
  .get(
    [
      param('budgetId').isInt().withMessage('Valid budget ID is required')
    ],
    validateRequest,
    budgetController.getAssets
  );

router
  .route('/:budgetId/assets/:assetId')
  .patch(
    [
      param('budgetId').isInt().withMessage('Valid budget ID is required'),
      param('assetId').isInt().withMessage('Valid asset ID is required'),
      body('name').optional().trim().notEmpty(),
      body('type').optional().isIn(['equipment', 'property', 'vehicle', 'other']),
      body('quantity').optional().isInt({ min: 1 }),
      body('purchasePrice').optional().isFloat({ min: 0 }),
      body('purchaseDate').optional().isISO8601(),
      body('currentValue').optional().isFloat({ min: 0 }),
      body('depreciationRate').optional().isFloat({ min: 0, max: 100 }),
      body('usefulLife').optional().isInt({ min: 1 }),
      body('maintenanceCost').optional().isFloat({ min: 0 }),
      body('isFinanced').optional().isBoolean(),
      body('status').optional().isIn(['active', 'sold', 'written-off', 'in-maintenance']),
      body('notes').optional().trim()
    ],
    validateRequest,
    budgetController.updateAsset
  )
  .delete(
    [
      param('budgetId').isInt().withMessage('Valid budget ID is required'),
      param('assetId').isInt().withMessage('Valid asset ID is required')
    ],
    validateRequest,
    budgetController.deleteAsset
  );

// Rota para criar orçamento a partir do formulário NovoOrcamento
router.post(
  '/novo-orcamento',
  [
    body('companyInfo').isObject().withMessage('Company info is required'),
    body('companyInfo.name').optional().isString().trim().notEmpty(),
    body('companyInfo.type').optional().isString().trim(),
    body('companyInfo.sectors').optional().isArray(),
    body('revenues').optional().isArray(),
    body('costs').optional().isObject(),
    body('costs.materials').optional().isArray(),
    body('costs.services').optional().isArray(),
    body('costs.personnel').optional().isArray(),
    body('costs.fixed').optional().isArray(),
    body('assets').optional().isArray(),
    body('seasonality').optional().isObject(),
    body('seasonality.hasSeasonality').optional().isBoolean(),
    body('seasonality.months').optional().isArray()
  ],
  validateRequest,
  budgetController.criarOrcamentoCompleto
);

module.exports = router;
