'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('empresa_setores', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
      },
      empresaId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { 
          model: 'empresas', 
          key: 'id' 
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      setorId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { 
          model: 'setores', 
          key: 'id' 
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
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

    // Criar índice único para evitar duplicatas
    await queryInterface.addIndex('empresa_setores', ['empresaId', 'setorId'], { 
      unique: true, 
      name: 'empresa_setor_unique' 
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('empresa_setores');
  }
};
