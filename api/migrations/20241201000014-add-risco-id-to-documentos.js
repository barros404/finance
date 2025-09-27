'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('Documentos', 'riscoId', {
      type: Sequelize.INTEGER,
      allowNull: true,
      comment: 'ID do risco associado ao documento',
      references: {
        model: 'Riscos',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL'
    });

    // Criar índice para melhor performance
    await queryInterface.addIndex('Documentos', ['riscoId']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeIndex('Documentos', ['riscoId']);
    await queryInterface.removeColumn('Documentos', 'riscoId');
  }
};