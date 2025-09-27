const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Documento = sequelize.define('Documento', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false
    },
    filename: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    path: {
      type: DataTypes.STRING(1024),
      allowNull: false
    },
    mimetype: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    size: {
      type: DataTypes.BIGINT,
      allowNull: false
    },
    uploadedBy: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    status: {
      type: DataTypes.ENUM('uploaded', 'processing', 'awaiting_validation', 'validated', 'error'),
      allowNull: false,
      defaultValue: 'uploaded'
    },
    ocrConfidence: {
      type: DataTypes.FLOAT,
      allowNull: true
    },
    extractedText: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    suggestedSummary: {
      type: DataTypes.JSON,
      allowNull: true
    },
    processedAt: {
      type: DataTypes.DATE,
      allowNull: true
    },
    riscoId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: 'ID do risco associado ao documento'
    }
  }, {
    tableName: 'Documentos',
    timestamps: true
  });

  Documento.associate = (models) => {
    Documento.hasMany(models.DocumentoItem, { foreignKey: 'documentId', as: 'itens' });
    Documento.hasOne(models.DocumentoFeedback, { foreignKey: 'documentId', as: 'feedback' });
    Documento.belongsTo(models.Risco, {
      foreignKey: 'riscoId',
      as: 'risco',
      allowNull: true
    });
  };

  return Documento;
};