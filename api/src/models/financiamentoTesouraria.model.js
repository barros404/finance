const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const FinanciamentoTesouraria = sequelize.define('FinanciamentoTesouraria', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
      comment: 'Identificador único'
    },
    nome: {
      type: DataTypes.STRING(150),
      allowNull: false,
      comment: 'Nome do financiamento'
    },
    descricao: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Descrição'
    },
    valor: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false,
      comment: 'Valor'
    },
    dataInicio: {
      type: DataTypes.DATE,
      allowNull: false,
      comment: 'Data de início'
    },
    dataVencimento: {
      type: DataTypes.DATE,
      allowNull: false,
      comment: 'Data de vencimento'
    },
    planoId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: 'ID do plano'
    },
    tipo: {
      type: DataTypes.ENUM('emprestimo', 'financiamento', 'investimento'),
      allowNull: false,
      defaultValue: 'emprestimo',
      comment: 'Tipo'
    },
    status: {
      type: DataTypes.ENUM('ativo', 'quitado', 'vencido', 'cancelado'),
      allowNull: false,
      defaultValue: 'ativo',
      comment: 'Status'
    }
  }, {
    tableName: 'FinanciamentoTesourarias',
    timestamps: true
  });

  FinanciamentoTesouraria.associate = (models) => {
    FinanciamentoTesouraria.belongsTo(models.PlanoTesouraria, {
      foreignKey: 'planoId',
      as: 'plano'
    });
  };

  return FinanciamentoTesouraria;
};