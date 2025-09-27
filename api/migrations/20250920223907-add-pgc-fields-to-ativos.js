'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('Ativos', 'contaPgc', {
      type: Sequelize.STRING(10),
      allowNull: true,
      comment: 'Código da conta PGC-AO mapeada'
    });

    await queryInterface.addColumn('Ativos', 'nomeContaPgc', {
      type: Sequelize.STRING(200),
      allowNull: true,
      comment: 'Nome da conta PGC-AO'
    });

    await queryInterface.addColumn('Ativos', 'confiancaMapeamento', {
      type: Sequelize.INTEGER,
      allowNull: true,
      validate: {
        min: 0,
        max: 100
      },
      comment: 'Confiança do mapeamento PGC (0-100)'
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('Ativos', 'contaPgc');
    await queryInterface.removeColumn('Ativos', 'nomeContaPgc');
    await queryInterface.removeColumn('Ativos', 'confiancaMapeamento');
  }
};
