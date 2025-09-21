'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('SaidaTesourarias', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
        comment: 'Identificador único da saída'
      },
      nome: {
        type: Sequelize.STRING(150),
        allowNull: false,
        comment: 'Nome da saída'
      },
      descricao: {
        type: Sequelize.TEXT,
        allowNull: true,
        comment: 'Descrição da saída'
      },
      valor: {
        type: Sequelize.DECIMAL(15, 2),
        allowNull: false,
        comment: 'Valor da saída'
      },
      dataPrevista: {
        type: Sequelize.DATE,
        allowNull: false,
        comment: 'Data prevista da saída'
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
        comment: 'Categoria da saída'
      },
      status: {
        type: Sequelize.ENUM('pendente', 'pago', 'atrasado', 'cancelado'),
        allowNull: false,
        defaultValue: 'pendente',
        comment: 'Status da saída'
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
    await queryInterface.dropTable('SaidaTesourarias');
  }
};


