const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Orcamento = sequelize.define('Orcamento', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      comment: 'Identificador único do orçamento'
    },
    nome: {
      type: DataTypes.STRING(150),
      allowNull: false,
      comment: 'Nome do orçamento'
    },
    descricao: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Descrição do orçamento'
    },
    ano: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: 'Ano do orçamento'
    },
    status: {
      type: DataTypes.ENUM('rascunho', 'em_analise', 'aprovado', 'rejeitado', 'arquivado'),
      allowNull: false,
      defaultValue: 'em_analise',
      comment: 'Status do orçamento'
    },
    empresaId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: 'ID da empresa'
    },
    criadoPor: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: 'ID do usuário que criou'
    },
    aprovadoPor: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: 'ID do usuário que aprovou'
    },
    aprovadoEm: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: 'Data de aprovação'
    },
    observacoes: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Observações do orçamento'
    }
  }, {
    tableName: 'Orcamentos',
    timestamps: true
  });

  Orcamento.associate = (models) => {
    Orcamento.belongsTo(models.Empresa, {
      foreignKey: 'empresaId',
      as: 'empresas'
    });
    Orcamento.hasMany(models.Sazonalidade, {
      foreignKey: 'orcamentoId',
      as: 'sazonalidades'
    });

    Orcamento.belongsTo(models.Usuario, {
      foreignKey: 'criadoPor',
      as: 'criador'
    });

    Orcamento.belongsTo(models.Usuario, {
      foreignKey: 'aprovadoPor',
      as: 'aprovador'
    });

    Orcamento.hasMany(models.Receita, {
      foreignKey: 'orcamentoId',
      as: 'receitas'
    });

    Orcamento.hasMany(models.Custo, {
      foreignKey: 'orcamentoId',
      as: 'custos'
    });

    Orcamento.hasMany(models.Ativo, {
      foreignKey: 'orcamentoId',
      as: 'ativos'
    });
  };

  return Orcamento;
};