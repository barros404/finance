'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Riscos', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
        comment: 'Identificador único do risco'
      },
      titulo: {
        type: Sequelize.STRING(200),
        allowNull: false,
        comment: 'Título do risco identificado'
      },
      descricao: {
        type: Sequelize.TEXT,
        allowNull: false,
        comment: 'Descrição detalhada do risco'
      },
      tipo: {
        type: Sequelize.ENUM(
          'financeiro',
          'operacional',
          'mercado',
          'climatico',
          'regulatorio',
          'tecnologico',
          'reputacional',
          'outros'
        ),
        allowNull: false,
        comment: 'Tipo de risco identificado'
      },
      probabilidade: {
        type: Sequelize.ENUM('baixa', 'media', 'alta', 'muito_alta'),
        allowNull: false,
        defaultValue: 'media',
        comment: 'Probabilidade de ocorrência do risco'
      },
      impacto: {
        type: Sequelize.ENUM('baixo', 'medio', 'alto', 'muito_alto'),
        allowNull: false,
        defaultValue: 'medio',
        comment: 'Impacto potencial do risco'
      },
      medidasMitigacao: {
        type: Sequelize.TEXT,
        allowNull: true,
        comment: 'Medidas propostas para mitigação do risco'
      },
      status: {
        type: Sequelize.ENUM('ativo', 'mitigado', 'monitorado', 'inativo'),
        allowNull: false,
        defaultValue: 'ativo',
        comment: 'Status atual do risco'
      },
      prioridade: {
        type: Sequelize.INTEGER,
        allowNull: true,
        comment: 'Prioridade calculada baseada em probabilidade e impacto (1-16)'
      },
      dataIdentificacao: {
        type: Sequelize.DATEONLY,
        allowNull: false,
        defaultValue: Sequelize.NOW,
        comment: 'Data de identificação do risco'
      },
      dataMitigacao: {
        type: Sequelize.DATEONLY,
        allowNull: true,
        comment: 'Data de mitigação efetiva do risco'
      },
      responsavelId: {
        type: Sequelize.INTEGER,
        allowNull: true,
        comment: 'ID do usuário responsável pelo monitoramento/mitigação',
        references: {
          model: 'Usuarios',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      empresaId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        comment: 'ID da empresa proprietária do risco',
        references: {
          model: 'Empresas',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      setorId: {
        type: Sequelize.INTEGER,
        allowNull: true,
        comment: 'ID do setor relacionado ao risco',
        references: {
          model: 'Setores',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      orcamentoId: {
        type: Sequelize.INTEGER,
        allowNull: true,
        comment: 'ID do orçamento relacionado ao risco',
        references: {
          model: 'Orcamentos',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      observacoes: {
        type: Sequelize.TEXT,
        allowNull: true,
        comment: 'Observações adicionais sobre o risco'
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

    // Criar índices para melhor performance
    await queryInterface.addIndex('Riscos', ['empresaId']);
    await queryInterface.addIndex('Riscos', ['tipo']);
    await queryInterface.addIndex('Riscos', ['status']);
    await queryInterface.addIndex('Riscos', ['prioridade']);
    await queryInterface.addIndex('Riscos', ['setorId']);
    await queryInterface.addIndex('Riscos', ['orcamentoId']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Riscos');
  }
};