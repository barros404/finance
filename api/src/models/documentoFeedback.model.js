const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const DocumentoFeedback = sequelize.define('DocumentoFeedback', {
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
    tipoDocumentoSugerido: {
      type: DataTypes.ENUM('entrada', 'saida', 'contrato', 'desconhecido'),
      allowNull: true
    },
    tipoDocumentoConfirmado: {
      type: DataTypes.ENUM('entrada', 'saida', 'contrato', 'desconhecido'),
      allowNull: true
    },
    classificacaoConfianca: {
      type: DataTypes.INTEGER,
      allowNull: true,
      validate: { min: 0, max: 100 }
    },
    confirmadoPor: {
      type: DataTypes.INTEGER,
      allowNull: true
    }
  }, {
    tableName: 'DocumentoFeedbacks',
    timestamps: true
  });

  DocumentoFeedback.associate = (models) => {
    DocumentoFeedback.belongsTo(models.Documento, { foreignKey: 'documentId', as: 'documento' });
  };

  return DocumentoFeedback;
};