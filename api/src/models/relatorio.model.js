/**
 * Modelo de Relatório - EndiAgro FinancePro
 *
 * Este arquivo define o modelo de dados para relatórios executivos.
 *
 * @author António Emiliano Barros
 * @version 1.0.0
 */

const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Relatorio = sequelize.define('Relatorio', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false
    },
    titulo: {
      type: DataTypes.STRING(255),
      allowNull: false,
      comment: 'Título do relatório'
    },
    tipo: {
      type: DataTypes.ENUM('orcamento', 'tesouraria', 'execucao', 'consolidado'),
      allowNull: false,
      comment: 'Tipo do relatório'
    },
    descricao: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Descrição do relatório'
    },
    formato: {
      type: DataTypes.ENUM('pdf', 'excel', 'csv'),
      allowNull: false,
      defaultValue: 'pdf',
      comment: 'Formato do relatório'
    },
    status: {
      type: DataTypes.ENUM('rascunho', 'gerado', 'enviado', 'arquivado'),
      allowNull: false,
      defaultValue: 'rascunho',
      comment: 'Status do relatório'
    },
    parametros: {
      type: DataTypes.JSON,
      allowNull: true,
      comment: 'Parâmetros usados na geração'
    },
    filtros: {
      type: DataTypes.JSON,
      allowNull: true,
      comment: 'Filtros aplicados'
    },
    destinatarios: {
      type: DataTypes.JSON,
      allowNull: true,
      comment: 'Lista de destinatários para envio'
    },
    arquivo: {
      type: DataTypes.STRING(500),
      allowNull: true,
      comment: 'Caminho/URL do arquivo gerado'
    },
    tamanhoArquivo: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: 'Tamanho do arquivo em bytes'
    },
    dataGeracao: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: 'Data de geração do relatório'
    },
    dataEnvio: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: 'Data de envio do relatório'
    },
    observacoes: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Observações adicionais'
    },
    usuarioId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Usuarios',
        key: 'id'
      },
      comment: 'ID do usuário que criou o relatório'
    }
  }, {
    tableName: 'relatorios',
    timestamps: true,
    createdAt: 'createdAt',
    updatedAt: 'updatedAt',
    comment: 'Tabela de relatórios executivos'
  });

  // Associações
  Relatorio.associate = (models) => {
    Relatorio.belongsTo(models.Usuario, {
      foreignKey: 'usuarioId',
      as: 'criadoPor',
      onDelete: 'CASCADE'
    });
  };

  return Relatorio;
};