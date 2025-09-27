'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.sequelize.transaction(async (transaction) => {
      // Adicionar a coluna 'mes'
      await queryInterface.addColumn('PlanoTesourarias', 'mes', {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 1,
        comment: 'Mês do plano (1-12)'
      }, { transaction });

      // Adicionar a coluna 'saldoInicial'
      await queryInterface.addColumn('PlanoTesourarias', 'saldoInicial', {
        type: Sequelize.DECIMAL(15, 2),
        allowNull: false,
        defaultValue: 0.00,
        comment: 'Saldo inicial do mês'
      }, { transaction });

      // Adicionar a coluna 'orcamentoId' (pode ser nulo inicialmente)
      await queryInterface.addColumn('PlanoTesourarias', 'orcamentoId', {
        type: Sequelize.INTEGER,
        allowNull: true,
        comment: 'ID do orçamento referência'
      }, { transaction });

      // Adicionar a coluna 'necessidadeFinanciamento'
      await queryInterface.addColumn('PlanoTesourarias', 'necessidadeFinanciamento', {
        type: Sequelize.DECIMAL(15, 2),
        allowNull: false,
        defaultValue: 0.00,
        comment: 'Valor necessário de financiamento'
      }, { transaction });

      // ✅ Alterar ENUM manualmente (PostgreSQL não aceita changeColumn direto)
      await queryInterface.sequelize.query(`
        ALTER TYPE "enum_PlanoTesourarias_status"
        ADD VALUE IF NOT EXISTS 'pendente';
      `, { transaction });

      await queryInterface.sequelize.query(`
        ALTER TYPE "enum_PlanoTesourarias_status"
        ADD VALUE IF NOT EXISTS 'ativo';
      `, { transaction });

      await queryInterface.sequelize.query(`
        ALTER TYPE "enum_PlanoTesourarias_status"
        ADD VALUE IF NOT EXISTS 'concluido';
      `, { transaction });

      // Adicionar chave estrangeira para orcamentoId
      await queryInterface.addConstraint('PlanoTesourarias', {
        fields: ['orcamentoId'],
        type: 'foreign key',
        name: 'fk_plano_tesouraria_orcamento',
        references: {
          table: 'Orcamentos',
          field: 'id'
        },
        onDelete: 'SET NULL',
        onUpdate: 'CASCADE',
        transaction
      });

      console.log('✅ Migration completed: Novos campos adicionados à PlanoTesourarias');
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.sequelize.transaction(async (transaction) => {
      // Remover a chave estrangeira primeiro
      await queryInterface.removeConstraint('PlanoTesourarias', 'fk_plano_tesouraria_orcamento', { transaction });

      // Remover as colunas adicionadas
      await queryInterface.removeColumn('PlanoTesourarias', 'mes', { transaction });
      await queryInterface.removeColumn('PlanoTesourarias', 'saldoInicial', { transaction });
      await queryInterface.removeColumn('PlanoTesourarias', 'orcamentoId', { transaction });
      await queryInterface.removeColumn('PlanoTesourarias', 'necessidadeFinanciamento', { transaction });

      // ✅ Reverter ENUM (criar um novo com os valores antigos e trocar)
      await queryInterface.sequelize.query(`
        CREATE TYPE "enum_PlanoTesourarias_status_old" 
        AS ENUM ('rascunho', 'em_analise', 'aprovado', 'rejeitado', 'arquivado');
      `, { transaction });

      await queryInterface.sequelize.query(`
        ALTER TABLE "PlanoTesourarias"
        ALTER COLUMN "status"
        TYPE "enum_PlanoTesourarias_status_old"
        USING status::text::"enum_PlanoTesourarias_status_old";
      `, { transaction });

      await queryInterface.sequelize.query(`
        DROP TYPE "enum_PlanoTesourarias_status";
      `, { transaction });

      await queryInterface.sequelize.query(`
        ALTER TYPE "enum_PlanoTesourarias_status_old" 
        RENAME TO "enum_PlanoTesourarias_status";
      `, { transaction });

      console.log('↩️ Migration reverted: Campos removidos da PlanoTesourarias');
    });
  }
};
