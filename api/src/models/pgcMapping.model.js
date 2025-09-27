const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const PgcMapping = sequelize.define('PgcMapping', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
      comment: 'Identificador único do mapeamento PGC'
    },
    orcamentoId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: 'ID do orçamento mapeado'
    },
    itemTipo: {
      type: DataTypes.ENUM('receita', 'custo', 'ativo'),
      allowNull: false,
      comment: 'Tipo do item mapeado'
    },
    itemId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: 'ID do item específico (receita, custo ou ativo)'
    },
    descricaoOriginal: {
      type: DataTypes.TEXT,
      allowNull: false,
      comment: 'Descrição original do item'
    },
    contaPgc: {
      type: DataTypes.STRING(10),
      allowNull: false,
      comment: 'Código da conta PGC-AO'
    },
    nomeContaPgc: {
      type: DataTypes.STRING(200),
      allowNull: false,
      comment: 'Nome da conta PGC-AO'
    },
    confianca: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      validate: {
        min: 0,
        max: 100
      },
      comment: 'Nível de confiança do mapeamento (0-100)'
    },
    categoriaCustomizada: {
      type: DataTypes.STRING(100),
      allowNull: true,
      comment: 'Categoria personalizada se confiança baixa'
    },
    ajustadoPeloUsuario: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      comment: 'Indica se foi ajustado manualmente'
    },
    mapeamentoOriginal: {
      type: DataTypes.JSON,
      allowNull: true,
      comment: 'Dados originais do mapeamento automático'
    }
  }, {
    tableName: 'PgcMappings',
    timestamps: true
  });

  PgcMapping.associate = (models) => {
    PgcMapping.belongsTo(models.Orcamento, {
      foreignKey: 'orcamentoId',
      as: 'orcamento'
    });
  };

  return PgcMapping;
};