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
    },
    contaPgc: {
      type: DataTypes.STRING(10),
      allowNull: true,
      comment: 'Código da conta PGC-AO mapeada'
    },
    nomeContaPgc: {
      type: DataTypes.STRING(200),
      allowNull: true,
      comment: 'Nome da conta PGC-AO'
    },
    confiancaMapeamento: {
      type: DataTypes.INTEGER,
      allowNull: true,
      validate: {
        min: 0,
        max: 100
      },
      comment: 'Confiança do mapeamento PGC (0-100)'
    },
    categoriaPersonalizada: {
      type: DataTypes.STRING(100),
      allowNull: true,
      comment: 'Categoria personalizada pelo usuário'
    },
    mapeamentoManual: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      comment: 'Indica se o mapeamento foi feito manualmente'
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