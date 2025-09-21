const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Setor = sequelize.define('Setor', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      comment: 'Identificador único do setor'
    },
    nome: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true,
      comment: 'Nome do setor de atuação'
    },
    descricao: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Descrição detalhada do setor'
    }
  }, {
    tableName: 'Setores',
    timestamps: true
  });

  Setor.associate = (models) => {
    Setor.belongsToMany(models.Empresa, {
      through: 'EmpresaSetores',
      foreignKey: 'setorId',
      otherKey: 'empresaId',
      as: 'empresas'
    });
  };

  return Setor;
};