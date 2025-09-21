const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Receita = sequelize.define('Receita', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
      comment: 'Identificador único da receita'
    },
    nome: {
      type: DataTypes.STRING(150),
      allowNull: false,
      comment: 'Nome da receita'
    },
    descricao: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Descrição da receita'
    },
    quantidade: {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: 1,
        comment: 'Quantidade da receita ao Ano'
      },
      precoUnitario: {
        type: DataTypes.DECIMAL(15, 2),
        allowNull: true,
        defaultValue: 0.00,
        comment: 'Preço unitário da receita'
      },
    valor: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false,
      comment: 'Valor da receita'
    },
    orcamentoId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: 'ID do orçamento'
    },
    categoria: {
      type: DataTypes.STRING(100),
      allowNull: true,
      comment: 'Categoria da receita'
    }
  }, {
    tableName: 'Receitas',
    timestamps: true
  });

  Receita.associate = (models) => {
    Receita.belongsTo(models.Orcamento, {
      foreignKey: 'orcamentoId',
      as: 'orcamento'
    });
  };

  return Receita;
};