'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('DocumentoFeedbacks', {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true, allowNull: false },
      documentId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'Documentos', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      tipoDocumentoSugerido: { type: Sequelize.ENUM('entrada', 'saida', 'contrato', 'desconhecido'), allowNull: true },
      tipoDocumentoConfirmado: { type: Sequelize.ENUM('entrada', 'saida', 'contrato', 'desconhecido'), allowNull: true },
      classificacaoConfianca: { type: Sequelize.INTEGER, allowNull: true },
      confirmadoPor: { type: Sequelize.INTEGER, allowNull: true },
      createdAt: { allowNull: false, type: Sequelize.DATE, defaultValue: Sequelize.fn('NOW') },
      updatedAt: { allowNull: false, type: Sequelize.DATE, defaultValue: Sequelize.fn('NOW') }
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('DocumentoFeedbacks');
  }
};