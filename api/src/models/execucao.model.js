const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Execucao = sequelize.define('Execucao', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      comment: 'Identificador único da execução'
    },
    orcamentoId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: 'ID do orçamento relacionado'
    },
    tipo: {
      type: DataTypes.ENUM('receita', 'custo', 'ativo'),
      allowNull: false,
      comment: 'Tipo do item executado'
    },
    itemId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: 'ID do item (receita, custo ou ativo)'
    },
    valorExecutado: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false,
      comment: 'Valor executado'
    },
    dataExecucao: {
      type: DataTypes.DATE,
      allowNull: false,
      comment: 'Data da execução'
    },
    status: {
      type: DataTypes.ENUM('pendente', 'aprovado', 'rejeitado', 'cancelado'),
      allowNull: false,
      defaultValue: 'pendente',
      comment: 'Status da execução'
    },
    observacoes: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Observações da execução'
    },
    executadoPor: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: 'ID do usuário que executou'
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
    }
  }, {
    tableName: 'Execucoes',
    timestamps: true
  });

  Execucao.associate = (models) => {
    Execucao.belongsTo(models.Orcamento, {
      foreignKey: 'orcamentoId',
      as: 'orcamento'
    });
    Execucao.belongsTo(models.Receita, {
      foreignKey: 'itemId',
      as: 'receita',
      constraints: false
    });
    Execucao.belongsTo(models.Custo, {
      foreignKey: 'itemId',
      as: 'custo',
      constraints: false
    });
    Execucao.belongsTo(models.Ativo, {
      foreignKey: 'itemId',
      as: 'ativo',
      constraints: false
    });
    Execucao.belongsTo(models.Usuario, {
      foreignKey: 'executadoPor',
      as: 'executor'
    });
    Execucao.belongsTo(models.Usuario, {
      foreignKey: 'aprovadoPor',
      as: 'aprovador'
    });
  };

  return Execucao;
};