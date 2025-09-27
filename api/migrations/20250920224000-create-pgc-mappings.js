'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('PgcMappings', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
        comment: 'Identificador único do mapeamento PGC'
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
        comment: 'ID do orçamento mapeado'
      },
      itemTipo: {
        type: Sequelize.ENUM('receita', 'custo', 'ativo'),
        allowNull: false,
        comment: 'Tipo do item mapeado'
      },
      itemId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        comment: 'ID do item específico (receita, custo ou ativo)'
      },
      descricaoOriginal: {
        type: Sequelize.TEXT,
        allowNull: false,
        comment: 'Descrição original do item'
      },
      contaPgc: {
        type: Sequelize.STRING(10),
        allowNull: false,
        comment: 'Código da conta PGC-AO'
      },
      nomeContaPgc: {
        type: Sequelize.STRING(200),
        allowNull: false,
        comment: 'Nome da conta PGC-AO'
      },
      confianca: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
        validate: {
          min: 0,
          max: 100
        },
        comment: 'Nível de confiança do mapeamento (0-100)'
      },
      categoriaCustomizada: {
        type: Sequelize.STRING(100),
        allowNull: true,
        comment: 'Categoria personalizada se confiança baixa'
      },
      ajustadoPeloUsuario: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
        comment: 'Indica se foi ajustado manualmente'
      },
      mapeamentoOriginal: {
        type: Sequelize.JSON,
        allowNull: true,
        comment: 'Dados originais do mapeamento automático'
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

    // Adicionar índices para melhor performance
    await queryInterface.addIndex('PgcMappings', ['orcamentoId']);
    await queryInterface.addIndex('PgcMappings', ['itemTipo', 'itemId']);
    await queryInterface.addIndex('PgcMappings', ['contaPgc']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('PgcMappings');
  }
};
