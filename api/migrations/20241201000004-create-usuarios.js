'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('usuarios', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
        comment: 'Identificador único do usuário'
      },
      nome: {
        type: Sequelize.STRING(100),
        allowNull: false,
        comment: 'Nome completo do usuário'
      },
      email: {
        type: Sequelize.STRING(100),
        allowNull: false,
        unique: true,
        comment: 'E-mail do usuário'
      },
      senha: {
        type: Sequelize.STRING(255),
        allowNull: false,
        comment: 'Senha criptografada'
      },
      role: {
        type: Sequelize.ENUM('admin', 'gerente', 'tecnico', 'visualizador'),
        allowNull: false,
        defaultValue: 'tecnico',
        comment: 'Papel do usuário no sistema'
      },
      status: {
        type: Sequelize.ENUM('ativo', 'inativo', 'suspenso'),
        allowNull: false,
        defaultValue: 'ativo',
        comment: 'Status do usuário'
      },
      empresaId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { 
          model: 'empresas', 
          key: 'id' 
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
        comment: 'ID da empresa do usuário'
      },
      ultimoLogin: {
        type: Sequelize.DATE,
        allowNull: true,
        comment: 'Data do último login'
      },
      tokenResetSenha: {
        type: Sequelize.STRING(255),
        allowNull: true,
        comment: 'Token para reset de senha'
      },
      tokenResetExpira: {
        type: Sequelize.DATE,
        allowNull: true,
        comment: 'Data de expiração do token de reset'
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
    await queryInterface.dropTable('usuarios');
  }
};

