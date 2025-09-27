/**
 * Modelo de Conta PGC - EndiAgro FinancePro
 *
 * Este arquivo define o modelo de dados para contas do Plano Geral de Contas (PGC).
 *
 * @author António Emiliano Barros
 * @version 1.0.0
 */

const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const PgcConta = sequelize.define('PgcConta', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false
    },
    codigo: {
      type: DataTypes.STRING(20),
      allowNull: false,
      unique: true,
      comment: 'Código da conta PGC'
    },
    descricao: {
      type: DataTypes.STRING(255),
      allowNull: false,
      comment: 'Descrição da conta'
    },
    classe: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 1,
        max: 8
      },
      comment: 'Classe da conta (1-8)'
    },
    tipo: {
      type: DataTypes.ENUM('debito', 'credito'),
      allowNull: true,
      comment: 'Tipo da conta (débito/crédito)'
    },
    categoria: {
      type: DataTypes.STRING(100),
      allowNull: true,
      comment: 'Categoria da conta'
    },
    subcategoria: {
      type: DataTypes.STRING(100),
      allowNull: true,
      comment: 'Subcategoria da conta'
    },
    status: {
      type: DataTypes.ENUM('pendente', 'validada', 'erro', 'revisao'),
      allowNull: false,
      defaultValue: 'pendente',
      comment: 'Status de validação da conta'
    },
    observacoes: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Observações sobre a validação'
    },
    dataValidacao: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: 'Data da última validação'
    },
    criadoPor: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Usuarios',
        key: 'id'
      },
      comment: 'ID do usuário que criou a conta'
    },
    validadoPor: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'Usuarios',
        key: 'id'
      },
      comment: 'ID do usuário que validou a conta'
    }
  }, {
    tableName: 'pgc_contas',
    timestamps: true,
    createdAt: 'createdAt',
    updatedAt: 'updatedAt',
    comment: 'Tabela de contas do Plano Geral de Contas'
  });

  // Associações
  PgcConta.associate = (models) => {
    PgcConta.belongsTo(models.Usuario, {
      foreignKey: 'criadoPor',
      as: 'criador',
      onDelete: 'CASCADE'
    });

    PgcConta.belongsTo(models.Usuario, {
      foreignKey: 'validadoPor',
      as: 'validador',
      onDelete: 'SET NULL'
    });
  };

  return PgcConta;
};