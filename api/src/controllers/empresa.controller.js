const { Op } = require('sequelize');
const db = require('../models');
const { validationResult } = require('express-validator');

/**
 * @swagger
 * tags:
 *   name: Empresas
 *   description: Gerenciamento de empresas
 */

/**
 * @swagger
 * /api/empresas:
 *   post:
 *     summary: Cria uma nova empresa
 *     tags: [Empresas]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Empresa'
 *     responses:
 *       201:
 *         description: Empresa criada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Empresa'
 *       400:
 *         description: Dados inválidos
 *       500:
 *         description: Erro ao criar empresa
 */
const criarEmpresa = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ erros: errors.array() });
    }

    const { nome, razaoSocial, nif, tipoEmpresa, ramoAtividade, telefone, endereco, cidade, provincia, codigoPostal, pais, logo } = req.body;
    
    // Verificar se já existe uma empresa com o mesmo NIF
    if (nif) {
      const empresaExistente = await db.Empresa.findOne({ where: { nif } });
      if (empresaExistente) {
        return res.status(400).json({ mensagem: 'Já existe uma empresa cadastrada com este NIF' });
      }
    }

    const empresa = await db.Empresa.create({
      nome,
      razaoSocial,
      nif,
      tipoEmpresa,
      ramoAtividade,
      telefone,
      endereco,
      cidade,
      provincia,
      codigoPostal,
      pais: pais || 'Angola',
      logo,
      criadoPor: req.user.id,
      atualizadoPor: req.user.id
    });

    res.status(201).json(empresa);
  } catch (erro) {
    console.error('Erro ao criar empresa:', erro);
    next(erro);
  }
};

/**
 * @swagger
 * /api/empresas:
 *   get:
 *     summary: Lista todas as empresas (com paginação)
 *     tags: [Empresas]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: pagina
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Número da página
 *       - in: query
 *         name: limite
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 10
 *         description: Número de itens por página
 *       - in: query
 *         name: busca
 *         schema:
 *           type: string
 *         description: Termo para busca no nome ou razão social
 *     responses:
 *       200:
 *         description: Lista de empresas
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 empresas:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Empresa'
 *                 total:
 *                   type: integer
 *                   description: Total de empresas
 *                 paginas:
 *                   type: integer
 *                   description: Total de páginas
 *                 paginaAtual:
 *                   type: integer
 *                   description: Página atual
 */
const listarEmpresas = async (req, res, next) => {
  try {
    const pagina = parseInt(req.query.pagina) || 1;
    const limite = parseInt(req.query.limite) || 10;
    const offset = (pagina - 1) * limite;
    const busca = req.query.busca || '';

    const where = {};
    
    if (busca) {
      where[Op.or] = [
        { nome: { [Op.like]: `%${busca}%` } },
        { razaoSocial: { [Op.like]: `%${busca}%` } },
        { nif: busca }
      ];
    }

    const { count, rows: empresas } = await db.Empresa.findAndCountAll({
      where,
      limit: limite,
      offset: offset,
      order: [['nome', 'ASC']]
    });

    res.json({
      empresas,
      total: count,
      paginas: Math.ceil(count / limite),
      paginaAtual: pagina
    });
  } catch (erro) {
    console.error('Erro ao listar empresas:', erro);
    next(erro);
  }
};

/**
 * @swagger
 * /api/empresas/{id}:
 *   get:
 *     summary: Obtém uma empresa pelo ID
 *     tags: [Empresas]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID da empresa
 *     responses:
 *       200:
 *         description: Dados da empresa
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Empresa'
 *       404:
 *         description: Empresa não encontrada
 */
const obterEmpresaPorId = async (req, res, next) => {
  try {
    const { id } = req.params;
    const empresa = await db.Empresa.findByPk(id);
    
    if (!empresa) {
      return res.status(404).json({ mensagem: 'Empresa não encontrada' });
    }
    
    res.json(empresa);
  } catch (erro) {
    console.error('Erro ao obter empresa:', erro);
    next(erro);
  }
};

/**
 * @swagger
 * /api/empresas/{id}:
 *   put:
 *     summary: Atualiza uma empresa existente
 *     tags: [Empresas]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID da empresa
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Empresa'
 *     responses:
 *       200:
 *         description: Empresa atualizada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Empresa'
 *       400:
 *         description: Dados inválidos
 *       404:
 *         description: Empresa não encontrada
 */
const atualizarEmpresa = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ erros: errors.array() });
    }

    const { id } = req.params;
    const { nome, razaoSocial, nif, tipoEmpresa, ramoAtividade, telefone, endereco, cidade, provincia, codigoPostal, pais, logo, ativo } = req.body;
    
    const empresa = await db.Empresa.findByPk(id);
    if (!empresa) {
      return res.status(404).json({ mensagem: 'Empresa não encontrada' });
    }

    // Verificar se o NIF já está em uso por outra empresa
    if (nif && nif !== empresa.nif) {
      const empresaComMesmoNif = await db.Empresa.findOne({ where: { nif, id: { [Op.ne]: id } } });
      if (empresaComMesmoNif) {
        return res.status(400).json({ mensagem: 'Já existe outra empresa com este NIF' });
      }
    }

    // Atualizar os campos
    const dadosAtualizados = {
      nome: nome || empresa.nome,
      razaoSocial: razaoSocial !== undefined ? razaoSocial : empresa.razaoSocial,
      nif: nif || empresa.nif,
      tipoEmpresa: tipoEmpresa || empresa.tipoEmpresa,
      ramoAtividade: ramoAtividade !== undefined ? ramoAtividade : empresa.ramoAtividade,
      telefone: telefone || empresa.telefone,
      endereco: endereco !== undefined ? endereco : empresa.endereco,
      cidade: cidade || empresa.cidade,
      provincia: provincia || empresa.provincia,
      codigoPostal: codigoPostal !== undefined ? codigoPostal : empresa.codigoPostal,
      pais: pais || empresa.pais,
      logo: logo !== undefined ? logo : empresa.logo,
      ativo: ativo !== undefined ? ativo : empresa.ativo,
      atualizadoPor: req.user.id,
      atualizadoEm: new Date()
    };

    await empresa.update(dadosAtualizados);
    
    res.json(empresa);
  } catch (erro) {
    console.error('Erro ao atualizar empresa:', erro);
    next(erro);
  }
};

/**
 * @swagger
 * /api/empresas/{id}:
 *   delete:
 *     summary: Remove uma empresa (lógica)
 *     tags: [Empresas]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID da empresa
 *     responses:
 *       200:
 *         description: Empresa removida com sucesso
 *       404:
 *         description: Empresa não encontrada
 *       409:
 *         description: Não é possível remover a empresa pois existem registros vinculados
 */
const removerEmpresa = async (req, res, next) => {
  const transaction = await db.sequelize.transaction();
  
  try {
    const { id } = req.params;
    
    // Verificar se a empresa existe
    const empresa = await db.Empresa.findByPk(id, { transaction });
    if (!empresa) {
      await transaction.rollback();
      return res.status(404).json({ mensagem: 'Empresa não encontrada' });
    }
    
    // Verificar se existem usuários associados a esta empresa
    const usuarios = await db.Usuario.count({ 
      where: { empresaId: id },
      transaction
    });
    
    if (usuarios > 0) {
      await transaction.rollback();
      return res.status(409).json({ 
        mensagem: 'Não é possível remover a empresa pois existem usuários vinculados a ela' 
      });
    }
    
    // Verificar se existem orçamentos associados a esta empresa
    const orcamentos = await db.Orcamento.count({ 
      where: { empresaId: id },
      transaction
    });
    
    if (orcamentos > 0) {
      await transaction.rollback();
      return res.status(409).json({ 
        mensagem: 'Não é possível remover a empresa pois existem orçamentos vinculados a ela' 
      });
    }
    
    // Remover a empresa (exclusão lógica)
    await empresa.update({ 
      ativo: false,
      excluido: true,
      excluidoPor: req.user.id,
      excluidoEm: new Date(),
      atualizadoPor: req.user.id
    }, { transaction });
    
    await transaction.commit();
    res.json({ mensagem: 'Empresa removida com sucesso' });
  } catch (erro) {
    await transaction.rollback();
    console.error('Erro ao remover empresa:', erro);
    next(erro);
  }
};

module.exports = {
  criarEmpresa,
  listarEmpresas,
  obterEmpresaPorId,
  atualizarEmpresa,
  removerEmpresa
};
