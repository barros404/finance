'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('EntradaTesourarias', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
        comment: 'Identificador único da entrada'
      },
      nome: {
        type: Sequelize.STRING(150),
        allowNull: false,
        comment: 'Nome da entrada'
      },
      descricao: {
        type: Sequelize.TEXT,
        allowNull: true,
        comment: 'Descrição da entrada'
      },
      valor: {
        type: Sequelize.DECIMAL(15, 2),
        allowNull: false,
        comment: 'Valor da entrada'
      },
      dataPrevista: {
        type: Sequelize.DATE,
        allowNull: false,
        comment: 'Data prevista da entrada'
      },
      planoId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { 
          model: 'PlanoTesourarias', 
          key: 'id' 
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
        comment: 'ID do plano de tesouraria'
      },
      categoria: {
        type: Sequelize.STRING(100),
        allowNull: true,
        comment: 'Categoria da entrada'
      },
      status: {
        type: Sequelize.ENUM('pendente', 'recebido', 'atrasado', 'cancelado'),
        allowNull: false,
        defaultValue: 'pendente',
        comment: 'Status da entrada'
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false
      }
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('EntradaTesourarias');
  }
};