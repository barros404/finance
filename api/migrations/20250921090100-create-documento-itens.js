'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('DocumentoItens', {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true, allowNull: false },
      documentId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'Documentos', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      descricaoOriginal: { type: Sequelize.TEXT, allowNull: false },
      valor: { type: Sequelize.DECIMAL(18, 2), allowNull: true },
      contaPgcSugerida: { type: Sequelize.STRING(10), allowNull: true },
      nomeContaPgcSugerida: { type: Sequelize.STRING(200), allowNull: true },
      confiancaSugestao: { type: Sequelize.INTEGER, allowNull: true },
      contaPgcConfirmada: { type: Sequelize.STRING(10), allowNull: true },
      nomeContaPgcConfirmada: { type: Sequelize.STRING(200), allowNull: true },
      createdAt: { allowNull: false, type: Sequelize.DATE, defaultValue: Sequelize.fn('NOW') },
      updatedAt: { allowNull: false, type: Sequelize.DATE, defaultValue: Sequelize.fn('NOW') }
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('DocumentoItens');
  }
};