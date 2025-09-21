const { Op } = require('sequelize');
const db = require('../models');
const { validationResult } = require('express-validator');

/**
 * @swagger
 * tags:
 *   name: Usuários
 *   description: Gerenciamento de usuários do sistema
 */

/**
 * @swagger
 * /api/usuarios:
 *   post:
 *     summary: Cria um novo usuário
 *     tags: [Usuários]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Usuario'
 *     responses:
 *       201:
 *         description: Usuário criado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Usuario'
 *       400:
 *         description: Dados inválidos
 *       403:
 *         description: Apenas administradores podem criar usuários
 *       500:
 *         description: Erro ao criar usuário
 */
const criarUsuario = async (req, res, next) => {
  try {
    // Apenas administradores podem criar usuários
    if (req.user.perfil !== 'admin') {
      return res.status(403).json({ 
        mensagem: 'Você não tem permissão para realizar esta ação' 
      });
    }

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ erros: errors.array() });
    }

    const { nome, email, senha, perfil, empresaId } = req.body;
    
    // Verificar se o e-mail já está em uso
    const usuarioExistente = await db.Usuario.findOne({ 
      where: { email },
      paranoid: false // Inclui usuários excluídos logicamente
    });
    
    if (usuarioExistente) {
      return res.status(400).json({ 
        mensagem: 'Este e-mail já está em uso por outro usuário' 
      });
    }

    // Se empresaId for fornecido, verificar se a empresa existe
    if (empresaId) {
      const empresa = await db.Empresa.findByPk(empresaId);
      if (!empresa) {
        return res.status(400).json({ 
          mensagem: 'A empresa informada não existe' 
        });
      }
    }

    const usuario = await db.Usuario.create({
      nome,
      email,
      senha, // A senha será criptografada pelo hook beforeSave
      perfil: perfil || 'usuario',
      empresaId: empresaId || null,
      criadoPor: req.user.id,
      atualizadoPor: req.user.id
    });

    // Remover campos sensíveis antes de retornar
    const usuarioResposta = usuario.get({ plain: true });
    delete usuarioResposta.senha;
    delete usuarioResposta.tokenRedefinicaoSenha;
    delete usuarioResposta.expiracaoTokenSenha;

    res.status(201).json(usuarioResposta);
  } catch (erro) {
    console.error('Erro ao criar usuário:', erro);
    next(erro);
  }
};

/**
 * @swagger
 * /api/usuarios:
 *   get:
 *     summary: Lista todos os usuários (com paginação)
 *     tags: [Usuários]
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
 *         description: Termo para busca no nome ou e-mail
 *       - in: query
 *         name: empresaId
 *         schema:
 *           type: integer
 *         description: Filtrar por ID da empresa
 *       - in: query
 *         name: perfil
 *         schema:
 *           type: string
 *           enum: [admin, usuario]
 *         description: Filtrar por perfil
 *       - in: query
 *         name: ativo
 *         schema:
 *           type: boolean
 *         description: Filtrar por status de ativação
 *     responses:
 *       200:
 *         description: Lista de usuários
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 usuarios:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Usuario'
 *                 total:
 *                   type: integer
 *                   description: Total de usuários
 *                 paginas:
 *                   type: integer
 *                   description: Total de páginas
 *                 paginaAtual:
 *                   type: integer
 *                   description: Página atual
 */
const listarUsuarios = async (req, res, next) => {
  try {
    // Apenas administradores podem listar todos os usuários
    if (req.user.perfil !== 'admin') {
      return res.status(403).json({ 
        mensagem: 'Você não tem permissão para acessar este recurso' 
      });
    }

    const pagina = parseInt(req.query.pagina) || 1;
    const limite = parseInt(req.query.limite) || 10;
    const offset = (pagina - 1) * limite;
    
    const { 
      busca, 
      empresaId, 
      perfil, 
      ativo 
    } = req.query;

    const where = {};
    
    // Aplicar filtros
    if (busca) {
      where[Op.or] = [
        { nome: { [Op.like]: `%${busca}%` } },
        { email: { [Op.like]: `%${busca}%` } }
      ];
    }
    
    if (empresaId) where.empresaId = empresaId;
    if (perfil) where.perfil = perfil;
    if (ativo !== undefined) where.ativo = ativo === 'true';

    const { count, rows: usuarios } = await db.Usuario.findAndCountAll({
      where,
      limit: limite,
      offset: offset,
      order: [['nome', 'ASC']],
      include: [
        {
          model: db.Empresa,
          as: 'empresa',
          attributes: ['id', 'nome', 'nif']
        }
      ]
    });

    res.json({
      usuarios,
      total: count,
      paginas: Math.ceil(count / limite),
      paginaAtual: pagina
    });
  } catch (erro) {
    console.error('Erro ao listar usuários:', erro);
    next(erro);
  }
};

/**
 * @swagger
 * /api/usuarios/{id}:
 *   get:
 *     summary: Obtém um usuário pelo ID
 *     tags: [Usuários]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID do usuário
 *     responses:
 *       200:
 *         description: Dados do usuário
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Usuario'
 *       403:
 *         description: Acesso não autorizado
 *       404:
 *         description: Usuário não encontrado
 */
const obterUsuarioPorId = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    // Um usuário só pode ver seu próprio perfil, a menos que seja admin
    if (parseInt(id) !== req.user.id && req.user.perfil !== 'admin') {
      return res.status(403).json({ 
        mensagem: 'Você só pode visualizar seu próprio perfil' 
      });
    }
    
    const usuario = await db.Usuario.findByPk(id, {
      include: [
        {
          model: db.Empresa,
          as: 'empresa',
          attributes: ['id', 'nome', 'nif']
        }
      ]
    });
    
    if (!usuario) {
      return res.status(404).json({ mensagem: 'Usuário não encontrado' });
    }
    
    res.json(usuario);
  } catch (erro) {
    console.error('Erro ao obter usuário:', erro);
    next(erro);
  }
};

/**
 * @swagger
 * /api/usuarios/{id}:
 *   put:
 *     summary: Atualiza um usuário existente
 *     tags: [Usuários]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID do usuário
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Usuario'
 *     responses:
 *       200:
 *         description: Usuário atualizado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Usuario'
 *       400:
 *         description: Dados inválidos
 *       403:
 *         description: Acesso não autorizado
 *       404:
 *         description: Usuário não encontrado
 */
const atualizarUsuario = async (req, res, next) => {
  const transaction = await db.sequelize.transaction();
  
  try {
    const { id } = req.params;
    const { nome, email, perfil, empresaId, ativo } = req.body;
    
    // Verificar permissões
    // Apenas administradores podem atualizar outros usuários ou alterar perfil/status
    if (parseInt(id) !== req.user.id) {
      if (req.user.perfil !== 'admin') {
        await transaction.rollback();
        return res.status(403).json({ 
          mensagem: 'Você só pode atualizar seu próprio perfil' 
        });
      }
    }
    
    // Apenas administradores podem alterar o perfil ou status
    if ((perfil !== undefined || ativo !== undefined) && req.user.perfil !== 'admin') {
      await transaction.rollback();
      return res.status(403).json({ 
        mensagem: 'Apenas administradores podem alterar perfil ou status de usuário' 
      });
    }
    
    const usuario = await db.Usuario.findByPk(id, { transaction });
    if (!usuario) {
      await transaction.rollback();
      return res.status(404).json({ mensagem: 'Usuário não encontrado' });
    }
    
    // Verificar se o e-mail já está em uso por outro usuário
    if (email && email !== usuario.email) {
      const usuarioComMesmoEmail = await db.Usuario.findOne({ 
        where: { 
          email,
          id: { [Op.ne]: id }
        },
        transaction
      });
      
      if (usuarioComMesmoEmail) {
        await transaction.rollback();
        return res.status(400).json({ 
          mensagem: 'Este e-mail já está em uso por outro usuário' 
        });
      }
    }
    
    // Verificar se a empresa existe, se fornecida
    if (empresaId && empresaId !== usuario.empresaId) {
      const empresa = await db.Empresa.findByPk(empresaId, { transaction });
      if (!empresa) {
        await transaction.rollback();
        return res.status(400).json({ 
          mensagem: 'A empresa informada não existe' 
        });
      }
    }
    
    // Atualizar os campos permitidos
    const dadosAtualizados = {
      nome: nome || usuario.nome,
      email: email || usuario.email,
      perfil: perfil !== undefined ? perfil : usuario.perfil,
      empresaId: empresaId !== undefined ? empresaId : usuario.empresaId,
      ativo: ativo !== undefined ? ativo : usuario.ativo,
      atualizadoPor: req.user.id,
      atualizadoEm: new Date()
    };
    
    await usuario.update(dadosAtualizados, { transaction });
    await transaction.commit();
    
    // Remover campos sensíveis antes de retornar
    const usuarioAtualizado = await db.Usuario.findByPk(id, {
      attributes: { exclude: ['senha', 'tokenRedefinicaoSenha', 'expiracaoTokenSenha'] },
      include: [
        {
          model: db.Empresa,
          as: 'empresa',
          attributes: ['id', 'nome', 'nif']
        }
      ]
    });
    
    res.json(usuarioAtualizado);
  } catch (erro) {
    await transaction.rollback();
    console.error('Erro ao atualizar usuário:', erro);
    next(erro);
  }
};

/**
 * @swagger
 * /api/usuarios/{id}:
 *   delete:
 *     summary: Remove um usuário (lógica)
 *     tags: [Usuários]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID do usuário
 *     responses:
 *       200:
 *         description: Usuário removido com sucesso
 *       403:
 *         description: Acesso não autorizado
 *       404:
 *         description: Usuário não encontrado
 *       409:
 *         description: Não é possível remover o usuário devido a registros vinculados
 */
const removerUsuario = async (req, res, next) => {
  const transaction = await db.sequelize.transaction();
  
  try {
    const { id } = req.params;
    
    // Apenas administradores podem remover usuários
    if (req.user.perfil !== 'admin') {
      await transaction.rollback();
      return res.status(403).json({ 
        mensagem: 'Você não tem permissão para realizar esta ação' 
      });
    }
    
    // Não permitir remoção do próprio usuário
    if (parseInt(id) === req.user.id) {
      await transaction.rollback();
      return res.status(400).json({ 
        mensagem: 'Você não pode remover seu próprio usuário' 
      });
    }
    
    // Verificar se o usuário existe
    const usuario = await db.Usuario.findByPk(id, { transaction });
    if (!usuario) {
      await transaction.rollback();
      return res.status(404).json({ mensagem: 'Usuário não encontrado' });
    }
    
    // Verificar se existem orçamentos criados por este usuário
    const orcamentos = await db.Orcamento.count({ 
      where: { criadoPor: id },
      transaction
    });
    
    if (orcamentos > 0) {
      await transaction.rollback();
      return res.status(409).json({ 
        mensagem: 'Não é possível remover o usuário pois existem orçamentos vinculados a ele' 
      });
    }
    
    // Remover o usuário (exclusão lógica)
    await usuario.update({ 
      ativo: false,
      excluido: true,
      excluidoPor: req.user.id,
      excluidoEm: new Date(),
      atualizadoPor: req.user.id
    }, { transaction });
    
    await transaction.commit();
    res.json({ mensagem: 'Usuário removido com sucesso' });
  } catch (erro) {
    await transaction.rollback();
    console.error('Erro ao remover usuário:', erro);
    next(erro);
  }
};

/**
 * @swagger
 * /api/usuarios/{id}/senha:
 *   put:
 *     summary: Atualiza a senha do usuário
 *     tags: [Usuários]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID do usuário
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - senhaAtual
 *               - novaSenha
 *             properties:
 *               senhaAtual:
 *                 type: string
 *                 minLength: 6
 *                 description: Senha atual do usuário
 *               novaSenha:
 *                 type: string
 *                 minLength: 6
 *                 description: Nova senha
 *     responses:
 *       200:
 *         description: Senha atualizada com sucesso
 *       400:
 *         description: Dados inválidos ou senha atual incorreta
 *       403:
 *         description: Acesso não autorizado
 *       404:
 *         description: Usuário não encontrado
 */
const atualizarSenha = async (req, res, next) => {
  const transaction = await db.sequelize.transaction();
  
  try {
    const { id } = req.params;
    const { senhaAtual, novaSenha } = req.body;
    
    // Um usuário só pode alterar sua própria senha, a menos que seja admin
    if (parseInt(id) !== req.user.id && req.user.perfil !== 'admin') {
      await transaction.rollback();
      return res.status(403).json({ 
        mensagem: 'Você só pode alterar sua própria senha' 
      });
    }
    
    const usuario = await db.Usuario.findByPk(id, { 
      transaction,
      // Incluir a senha para verificação
      attributes: { include: ['senha'] }
    });
    
    if (!usuario) {
      await transaction.rollback();
      return res.status(404).json({ mensagem: 'Usuário não encontrado' });
    }
    
    // Se não for admin, verificar a senha atual
    if (req.user.perfil !== 'admin') {
      const senhaCorreta = await usuario.compararSenha(senhaAtual);
      if (!senhaCorreta) {
        await transaction.rollback();
        return res.status(400).json({ 
          mensagem: 'A senha atual está incorreta' 
        });
      }
    }
    
    // Atualizar a senha (o hook beforeSave irá criptografá-la)
    await usuario.update({ 
      senha: novaSenha,
      atualizadoPor: req.user.id,
      // Invalidar tokens antigos ao alterar a senha
      tokenRedefinicaoSenha: null,
      expiracaoTokenSenha: null
    }, { transaction });
    
    await transaction.commit();
    res.json({ mensagem: 'Senha atualizada com sucesso' });
  } catch (erro) {
    await transaction.rollback();
    console.error('Erro ao atualizar senha:', erro);
    next(erro);
  }
};

module.exports = {
  criarUsuario,
  listarUsuarios,
  obterUsuarioPorId,
  atualizarUsuario,
  removerUsuario,
  atualizarSenha
};
