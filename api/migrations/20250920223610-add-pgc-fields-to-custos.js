'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('Custos', 'contaPgc', {
      type: Sequelize.STRING(10),
      allowNull: true,
      comment: 'Código da conta PGC-AO mapeada'
    });

    await queryInterface.addColumn('Custos', 'nomeContaPgc', {
      type: Sequelize.STRING(200),
      allowNull: true,
      comment: 'Nome da conta PGC-AO'
    });

    await queryInterface.addColumn('Custos', 'confiancaMapeamento', {
      type: Sequelize.INTEGER,
      allowNull: true,
      validate: {
        min: 0,
        max: 100
      },
      comment: 'Confiança do mapeamento PGC (0-100)'
    });

    await queryInterface.addColumn('Custos', 'categoriaPersonalizada', {
      type: Sequelize.STRING(100),
      allowNull: true,
      comment: 'Categoria personalizada pelo usuário'
    });

    await queryInterface.addColumn('Custos', 'mapeamentoManual', {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      comment: 'Indica se o mapeamento foi feito manualmente'
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('Custos', 'contaPgc');
    await queryInterface.removeColumn('Custos', 'nomeContaPgc');
    await queryInterface.removeColumn('Custos', 'confiancaMapeamento');
    await queryInterface.removeColumn('Custos', 'categoriaPersonalizada');
    await queryInterface.removeColumn('Custos', 'mapeamentoManual');
  }
};
