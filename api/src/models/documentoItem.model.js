const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const DocumentoItem = sequelize.define('DocumentoItem', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false
    },
    documentId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    descricaoOriginal: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    valor: {
      type: DataTypes.DECIMAL(18, 2),
      allowNull: true
    },
    contaPgcSugerida: {
      type: DataTypes.STRING(10),
      allowNull: true
    },
    nomeContaPgcSugerida: {
      type: DataTypes.STRING(200),
      allowNull: true
    },
    confiancaSugestao: {
      type: DataTypes.INTEGER,
      allowNull: true,
      validate: { min: 0, max: 100 }
    },
    contaPgcConfirmada: {
      type: DataTypes.STRING(10),
      allowNull: true
    },
    nomeContaPgcConfirmada: {
      type: DataTypes.STRING(200),
      allowNull: true
    }
  }, {
    tableName: 'DocumentoItens',
    timestamps: true
  });

  DocumentoItem.associate = (models) => {
    DocumentoItem.belongsTo(models.Documento, { foreignKey: 'documentId', as: 'documento' });
  };

  return DocumentoItem;
};