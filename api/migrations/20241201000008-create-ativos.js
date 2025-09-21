'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Ativos', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
        comment: 'Identificador único do ativo'
      },
      nome: {
        type: Sequelize.STRING(150),
        allowNull: false,
        comment: 'Nome do ativo'
      },
      descricao: {
        type: Sequelize.TEXT,
        allowNull: true,
        comment: 'Descrição do ativo'
      },
      valor: {
        type: Sequelize.DECIMAL(15, 2),
        allowNull: false,
        comment: 'Valor do ativo'
      },
      mes: {
        type: Sequelize.INTEGER,
        allowNull: false,
        comment: 'Mês do ativo (1-12)'
      },
      orcamentoId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { 
          model: 'Orcamentos', 
          key: 'id' 
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
        comment: 'ID do orçamento'
      },
      categoria: {
        type: Sequelize.STRING(100),
        allowNull: true,
        comment: 'Categoria do ativo'
      },
      tipo: {
        type: Sequelize.ENUM('circulante', 'nao_circulante', 'intangivel'),
        allowNull: false,
        defaultValue: 'circulante',
        comment: 'Tipo do ativo'
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
    await queryInterface.dropTable('Ativos');
  }
};


