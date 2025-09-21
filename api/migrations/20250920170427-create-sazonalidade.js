'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Sazonalidades', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
        comment: 'Identificador único da sazonalidade'
      },
      orcamentoId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        comment: 'ID do orçamento',
        references: {
          model: 'Orcamentos', // nome da tabela alvo
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      mes: {
        type: Sequelize.INTEGER,
        allowNull: false,
        comment: 'Mês (1-12)'
      },
      percentual: {
        type: Sequelize.DECIMAL(5, 2),
        allowNull: false,
        comment: 'Percentual de distribuição'
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.fn('NOW')
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.fn('NOW')
      }
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('Sazonalidades');
  }
};
