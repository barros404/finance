'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Receitas', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
        comment: 'Identificador único da receita'
      },
      nome: {
        type: Sequelize.STRING(150),
        allowNull: false,
        comment: 'Nome da receita'
      },
      descricao: {
        type: Sequelize.TEXT,
        allowNull: true,
        comment: 'Descrição da receita'
      },
      quantidade: {
        type: Sequelize.INTEGER,
        allowNull: true,
        defaultValue: 1,
        comment: 'Quantidade da receita ao Ano'
      },
      precoUnitario: {
        type: Sequelize.DECIMAL(15, 2),
        allowNull: true,
        defaultValue: 0.00,
        comment: 'Preço unitário da receita'
      },
      valor: {
        type: Sequelize.DECIMAL(15, 2),
        allowNull: false,
        comment: 'Valor da receita'
      },
      mes: {
        type: Sequelize.INTEGER,
        allowNull: false,
        comment: 'Mês da receita (1-12)'
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
        comment: 'Categoria da receita'
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
    await queryInterface.dropTable('Receitas');
  }
};


