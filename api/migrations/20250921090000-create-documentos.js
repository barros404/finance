'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Documentos', {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true, allowNull: false },
      filename: { type: Sequelize.STRING(255), allowNull: false },
      path: { type: Sequelize.STRING(1024), allowNull: false },
      mimetype: { type: Sequelize.STRING(100), allowNull: false },
      size: { type: Sequelize.BIGINT, allowNull: false },
      uploadedBy: { type: Sequelize.INTEGER, allowNull: true },
      status: { type: Sequelize.ENUM('uploaded', 'processing', 'awaiting_validation', 'validated', 'error'), allowNull: false, defaultValue: 'uploaded' },
      ocrConfidence: { type: Sequelize.FLOAT, allowNull: true },
      extractedText: { type: Sequelize.TEXT, allowNull: true },
      suggestedSummary: { type: Sequelize.JSON, allowNull: true },
      processedAt: { type: Sequelize.DATE, allowNull: true },
      createdAt: { allowNull: false, type: Sequelize.DATE, defaultValue: Sequelize.fn('NOW') },
      updatedAt: { allowNull: false, type: Sequelize.DATE, defaultValue: Sequelize.fn('NOW') }
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Documentos');
  }
};