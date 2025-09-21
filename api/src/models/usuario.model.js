const { DataTypes } = require('sequelize');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

module.exports = (sequelize) => {
  const Usuario = sequelize.define('Usuario', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      comment: 'Identificador único do usuário'
    },
    nome: {
      type: DataTypes.STRING(100),
      allowNull: false,
      comment: 'Nome completo'
    },
    email: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true,
      comment: 'E-mail do usuário'
    },
    senha: {
      type: DataTypes.STRING(255),
      allowNull: false,
      comment: 'Senha criptografada'
    },
    role: {
      type: DataTypes.ENUM('admin', 'gerente', 'tecnico', 'visualizador'),
      allowNull: false,
      defaultValue: 'tecnico',
      comment: 'Papel do usuário'
    },
    status: {
      type: DataTypes.ENUM('ativo', 'inativo', 'suspenso'),
      allowNull: false,
      defaultValue: 'ativo',
      comment: 'Status do usuário'
    },
    empresaId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: 'ID da empresa'
    },
    ultimoLogin: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: 'Data do último login'
    },
    tokenResetSenha: {
      type: DataTypes.STRING(255),
      allowNull: true,
      comment: 'Token para reset de senha'
    },
    tokenResetExpira: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: 'Data de expiração do token'
    }
  }, {
    tableName: 'Usuarios', // Note: sua migration usa 'usuarios' (minúsculo)
    timestamps: true,
    defaultScope: {
      attributes: { exclude: ['senha', 'tokenResetSenha', 'tokenResetExpira'] }
    },
    scopes: {
      comSenha: {
        attributes: {}
      }
    },
    hooks: {
      beforeSave: async (usuario) => {
        if (usuario.changed('senha')) {
          usuario.senha = await bcrypt.hash(usuario.senha, 10);
        }
      }
    }
  });

  // 🔥 MÉTODOS DE INSTÂNCIA - DEVEM ESTAR AQUI, DENTRO DA FUNÇÃO
  Usuario.prototype.compararSenha = async function(senhaDigitada) {
    return await bcrypt.compare(senhaDigitada, this.senha);
  };

  Usuario.prototype.gerarTokenAutenticacao = function() {
    return jwt.sign(
      { 
        id: this.id, 
        role: this.role,
        empresaId: this.empresaId 
      },
      process.env.JWT_SECRET || 'fallback-secret',
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );
  };

  Usuario.prototype.senhaAlteradaApos = function(timestamp) {
    if (this.updatedAt) {
      const senhaAlteradaEm = parseInt(this.updatedAt.getTime() / 1000, 10);
      return timestamp < senhaAlteradaEm;
    }
    return false;
  };

  Usuario.prototype.changedPasswordAfter = function(timestamp) {
    return this.senhaAlteradaApos(timestamp);
  };

  Usuario.prototype.criarTokenRedefinicaoSenha = function() {
    const token = crypto.randomBytes(32).toString('hex');
    
    this.tokenResetSenha = crypto
      .createHash('sha256')
      .update(token)
      .digest('hex');
    
    this.tokenResetExpira = Date.now() + 60 * 60 * 1000;
    
    return token;
  };

  // ASSOCIAÇÕES
  Usuario.associate = (models) => {
    Usuario.belongsTo(models.Empresa, {
      foreignKey: 'empresaId',
      as: 'empresa'
    });
    
    Usuario.hasMany(models.Orcamento, {
      foreignKey: 'criadoPor',
      as: 'orcamentosCriados'
    });
    
    Usuario.hasMany(models.Orcamento, {
      foreignKey: 'aprovadoPor',
      as: 'orcamentosAprovados'
    });
    
    Usuario.hasMany(models.PlanoTesouraria, {
      foreignKey: 'criadoPor',
      as: 'planosCriados'
    });
    
    Usuario.hasMany(models.PlanoTesouraria, {
      foreignKey: 'aprovadoPor',
      as: 'planosAprovados'
    });
  };

  return Usuario;
};