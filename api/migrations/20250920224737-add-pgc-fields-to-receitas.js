'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('Receitas', 'contaPgc', {
      type: Sequelize.STRING(10),
      allowNull: true,
      comment: 'Código da conta PGC-AO mapeada'
    });

    await queryInterface.addColumn('Receitas', 'nomeContaPgc', {
      type: Sequelize.STRING(200),
      allowNull: true,
      comment: 'Nome da conta PGC-AO'
    });

    await queryInterface.addColumn('Receitas', 'confiancaMapeamento', {
      type: Sequelize.INTEGER,
      allowNull: true,
      validate: {
        min: 0,
        max: 100
      },
      comment: 'Confiança do mapeamento PGC (0-100)'
    });

    await queryInterface.addColumn('Receitas', 'categoriaPersonalizada', {
      type: Sequelize.STRING(100),
      allowNull: true,
      comment: 'Categoria personalizada pelo usuário'
    });

    await queryInterface.addColumn('Receitas', 'mapeamentoManual', {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      comment: 'Indica se o mapeamento foi feito manualmente'
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('Receitas', 'contaPgc');
    await queryInterface.removeColumn('Receitas', 'nomeContaPgc');
    await queryInterface.removeColumn('Receitas', 'confiancaMapeamento');
    await queryInterface.removeColumn('Receitas', 'categoriaPersonalizada');
    await queryInterface.removeColumn('Receitas', 'mapeamentoManual');
  }
};
