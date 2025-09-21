const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Empresa = sequelize.define('Empresa', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      comment: 'Identificador único da empresa'
    },
    nome: {
      type: DataTypes.STRING(100),
      allowNull: false,
      comment: 'Nome da empresa'
    },
    nif: {
      type: DataTypes.STRING(20),
      allowNull: true,
      unique: true,
      comment: 'Número de Identificação Fiscal'
    },
    descricaoNegocio: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Descrição do negócio'
    },
    razaoSocial: {
      type: DataTypes.STRING(150),
      allowNull: true,
      comment: 'Razão social'
    },
    telefone: {
      type: DataTypes.STRING(20),
      allowNull: true,
      comment: 'Telefone de contato'
    },
    email: {
      type: DataTypes.STRING(100),
      allowNull: true,
      comment: 'E-mail de contato'
    },
    endereco: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Endereço completo'
    },
    cidade: {
      type: DataTypes.STRING(100),
      allowNull: true,
      comment: 'Cidade'
    },
    estado: {
      type: DataTypes.STRING(50),
      allowNull: true,
      comment: 'Estado/Província'
    },
    pais: {
      type: DataTypes.STRING(50),
      allowNull: true,
      defaultValue: 'Angola',
      comment: 'País'
    },
    logo: {
      type: DataTypes.STRING(255),
      allowNull: true,
      comment: 'URL do logotipo'
    },
    ativo: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
      comment: 'Status ativo/inativo'
    },
    configuracao: {
      type: DataTypes.JSON,
      allowNull: true,
      comment: 'Configurações da empresa'
    }
  }, {
    tableName: 'Empresas',
    timestamps: true
  });

  Empresa.associate = (models) => {
    Empresa.belongsToMany(models.Setor, {
      through: 'EmpresaSetores',
      foreignKey: 'empresaId',
      otherKey: 'setorId',
      as: 'setores'
    });
    
    Empresa.hasMany(models.Usuario, {
      foreignKey: 'empresaId',
      as: 'usuarios'
    });
    
    Empresa.hasMany(models.Orcamento, {
      foreignKey: 'empresaId',
      as: 'orcamentos'
    });
  };

  return Empresa;
};