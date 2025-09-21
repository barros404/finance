const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const EntradaTesouraria = sequelize.define('EntradaTesouraria', {
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
      comment: 'Nome da entrada'
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
    dataPrevista: {
      type: DataTypes.DATE,
      allowNull: false,
      comment: 'Data prevista'
    },
    planoId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: 'ID do plano'
    },
    categoria: {
      type: DataTypes.STRING(100),
      allowNull: true,
      comment: 'Categoria'
    },
    status: {
      type: DataTypes.ENUM('pendente', 'recebido', 'atrasado', 'cancelado'),
      allowNull: false,
      defaultValue: 'pendente',
      comment: 'Status'
    }
  }, {
    tableName: 'EntradaTesourarias',
    timestamps: true
  });

  EntradaTesouraria.associate = (models) => {
    EntradaTesouraria.belongsTo(models.PlanoTesouraria, {
      foreignKey: 'planoId',
      as: 'plano'
    });
  };

  return EntradaTesouraria;
};