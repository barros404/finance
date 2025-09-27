const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Ativo = sequelize.define('Ativo', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
      comment: 'Identificador único do ativo'
    },
    nome: {
      type: DataTypes.STRING(150),
      allowNull: false,
      comment: 'Nome do ativo'
    },
    descricao: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Descrição do ativo'
    },
    valor: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false,
      comment: 'Valor do ativo'
    },
    orcamentoId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: 'ID do orçamento'
    },
    categoria: {
      type: DataTypes.STRING(100),
      allowNull: true,
      comment: 'Categoria do ativo'
    },
    tipo: {
      type: DataTypes.ENUM('circulante', 'nao_circulante', 'intangivel'),
      allowNull: false,
      defaultValue: 'circulante',
      comment: 'Tipo do ativo'
    }
  }, {
    tableName: 'Ativos',
    timestamps: true
  });

  Ativo.associate = (models) => {
    Ativo.belongsTo(models.Orcamento, {
      foreignKey: 'orcamentoId',
      as: 'orcamento'
    });
  };

  return Ativo;
};