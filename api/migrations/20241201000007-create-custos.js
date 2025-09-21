'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Custos', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
      },
      // Campos comuns a todos os custos
      tipoCusto: {
        type: Sequelize.ENUM('material', 'servico', 'pessoal'),
        allowNull: false,
        comment: 'Tipo específico do custo'
      },
      nome: {
        type: Sequelize.STRING(150),
        allowNull: false
      },
      descricao: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      quantidade: {
        type: Sequelize.INTEGER,
        allowNull: true,
        defaultValue: 1
      },
      custoUnitario: {
        type: Sequelize.DECIMAL(15, 2),
        allowNull: true,
        defaultValue: 0.00
      },
      
      // Campos específicos para cada tipo
      cargo: {
        type: Sequelize.STRING(100),
        allowNull: true,
        comment: 'Apenas para custos de pessoal'
      },
      tipoContratacao: {
        type: Sequelize.ENUM('Permanente', 'Temporário', 'Freelancer'),
        allowNull: true,
        comment: 'Apenas para custos de pessoal'
      },
      salario: {
        type: Sequelize.DECIMAL(15, 2),
        allowNull: true,
        comment: 'Apenas para custos de pessoal'
      },
      
      frequencia: {
        type: Sequelize.ENUM('Único', 'Diário', 'Semanal', 'Mensal', 'Trimestral', 'Anual'),
        allowNull: false,
        defaultValue: 'Mensal'
      },
      
      // Campos de relacionamento
      orcamentoId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'Orcamentos', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      
      createdAt: { type: Sequelize.DATE, allowNull: false },
      updatedAt: { type: Sequelize.DATE, allowNull: false }
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('Custos');
  }
};