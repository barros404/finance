'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Orcamentos', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
        comment: 'Identificador único do orçamento'
      },
      nome: {
        type: Sequelize.STRING(150),
        allowNull: false,
        comment: 'Nome do orçamento'
      },
      descricao: {
        type: Sequelize.TEXT,
        allowNull: true,
        comment: 'Descrição do orçamento'
      },
      ano: {
        type: Sequelize.INTEGER,
        allowNull: false,
        comment: 'Ano do orçamento'
      },
      status: {
        type: Sequelize.ENUM('rascunho', 'em_analise', 'aprovado', 'rejeitado', 'arquivado'),
        allowNull: false,
        defaultValue: 'rascunho',
        comment: 'Status do orçamento'
      },
      empresaId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { 
          model: 'Empresas', 
          key: 'id' 
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
        comment: 'ID da empresa'
      },
      criadoPor: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { 
          model: 'Usuarios', 
          key: 'id' 
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
        comment: 'ID do usuário que criou'
      },
      aprovadoPor: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: { 
          model: 'Usuarios', 
          key: 'id' 
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
        comment: 'ID do usuário que aprovou'
      },
      aprovadoEm: {
        type: Sequelize.DATE,
        allowNull: true,
        comment: 'Data de aprovação'
      },
      observacoes: {
        type: Sequelize.TEXT,
        allowNull: true,
        comment: 'Observações do orçamento'
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
    await queryInterface.dropTable('Orcamentos');
  }
};


