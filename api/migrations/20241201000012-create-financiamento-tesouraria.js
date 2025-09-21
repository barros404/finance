'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('FinanciamentoTesourarias', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
        comment: 'Identificador único do financiamento'
      },
      nome: {
        type: Sequelize.STRING(150),
        allowNull: false,
        comment: 'Nome do financiamento'
      },
      descricao: {
        type: Sequelize.TEXT,
        allowNull: true,
        comment: 'Descrição do financiamento'
      },
      valor: {
        type: Sequelize.DECIMAL(15, 2),
        allowNull: false,
        comment: 'Valor do financiamento'
      },
      dataInicio: {
        type: Sequelize.DATE,
        allowNull: false,
        comment: 'Data de início do financiamento'
      },
      dataVencimento: {
        type: Sequelize.DATE,
        allowNull: false,
        comment: 'Data de vencimento do financiamento'
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
      tipo: {
        type: Sequelize.ENUM('emprestimo', 'financiamento', 'investimento'),
        allowNull: false,
        defaultValue: 'emprestimo',
        comment: 'Tipo do financiamento'
      },
      status: {
        type: Sequelize.ENUM('ativo', 'quitado', 'vencido', 'cancelado'),
        allowNull: false,
        defaultValue: 'ativo',
        comment: 'Status do financiamento'
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
    await queryInterface.dropTable('FinanciamentoTesourarias');
  }
};


