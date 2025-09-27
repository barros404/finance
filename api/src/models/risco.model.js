const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Risco = sequelize.define('Risco', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      comment: 'Identificador único do risco'
    },
    titulo: {
      type: DataTypes.STRING(200),
      allowNull: false,
      comment: 'Título do risco identificado'
    },
    descricao: {
      type: DataTypes.TEXT,
      allowNull: false,
      comment: 'Descrição detalhada do risco'
    },
    tipo: {
      type: DataTypes.ENUM(
        'financeiro',
        'operacional',
        'mercado',
        'climatico',
        'regulatorio',
        'tecnologico',
        'reputacional',
        'outros'
      ),
      allowNull: false,
      comment: 'Tipo de risco identificado'
    },
    probabilidade: {
      type: DataTypes.ENUM('baixa', 'media', 'alta', 'muito_alta'),
      allowNull: false,
      defaultValue: 'media',
      comment: 'Probabilidade de ocorrência do risco'
    },
    impacto: {
      type: DataTypes.ENUM('baixo', 'medio', 'alto', 'muito_alto'),
      allowNull: false,
      defaultValue: 'medio',
      comment: 'Impacto potencial do risco'
    },
    medidasMitigacao: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Medidas propostas para mitigação do risco'
    },
    status: {
      type: DataTypes.ENUM('ativo', 'mitigado', 'monitorado', 'inativo'),
      allowNull: false,
      defaultValue: 'ativo',
      comment: 'Status atual do risco'
    },
    prioridade: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: 'Prioridade calculada baseada em probabilidade e impacto (1-16)'
    },
    dataIdentificacao: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      defaultValue: DataTypes.NOW,
      comment: 'Data de identificação do risco'
    },
    dataMitigacao: {
      type: DataTypes.DATEONLY,
      allowNull: true,
      comment: 'Data de mitigação efetiva do risco'
    },
    responsavelId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: 'ID do usuário responsável pelo monitoramento/mitigação'
    },
    observacoes: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Observações adicionais sobre o risco'
    }
  }, {
    tableName: 'Riscos',
    timestamps: true
  });

  Risco.associate = (models) => {
    Risco.belongsTo(models.Empresa, {
      foreignKey: 'empresaId',
      as: 'empresa'
    });

    Risco.belongsTo(models.Setor, {
      foreignKey: 'setorId',
      as: 'setor',
      allowNull: true
    });

    Risco.belongsTo(models.Orcamento, {
      foreignKey: 'orcamentoId',
      as: 'orcamento',
      allowNull: true
    });

    Risco.belongsTo(models.Usuario, {
      foreignKey: 'responsavelId',
      as: 'responsavel',
      allowNull: true
    });

    Risco.hasMany(models.Documento, {
      foreignKey: 'riscoId',
      as: 'documentos'
    });
  };

  // Método para calcular prioridade baseada em probabilidade e impacto
  Risco.prototype.calcularPrioridade = function() {
    const probabilidadeValor = { baixa: 1, media: 2, alta: 3, muito_alta: 4 };
    const impactoValor = { baixo: 1, medio: 2, alto: 3, muito_alto: 4 };

    const prob = probabilidadeValor[this.probabilidade] || 2;
    const imp = impactoValor[this.impacto] || 2;

    return prob * imp;
  };

  // Hook para calcular prioridade antes de salvar
  Risco.beforeSave((risco) => {
    risco.prioridade = risco.calcularPrioridade();
  });

  return Risco;
};