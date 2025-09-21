// sazonalidade.model.js
const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Sazonalidade = sequelize.define('Sazonalidade', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
      comment: 'Identificador único da sazonalidade'
    },
    orcamentoId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: 'ID do orçamento'
    },
    mes: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: 'Mês (1-12)'
    },
    percentual: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: false,
      comment: 'Percentual de distribuição'
    }
  }, {
    tableName: 'Sazonalidades',
    timestamps: true
  });

  Sazonalidade.associate = (models) => {
    Sazonalidade.belongsTo(models.Orcamento, {
      foreignKey: 'orcamentoId',
      as: 'orcamento'
    });
  };

  return Sazonalidade;
};