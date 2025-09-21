'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('empresas', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
        comment: 'Identificador único da empresa'
      },
      nome: {
        type: Sequelize.STRING(100),
        allowNull: false,
        comment: 'Nome da empresa'
      },
      nif: {
        type: Sequelize.STRING(20),
        allowNull: true,
        unique: true,
        comment: 'Número de Identificação Fiscal (NIF) da empresa'
      },
      descricaoNegocio: {
        type: Sequelize.TEXT,
        allowNull: true,
        comment: 'Descrição do negócio da empresa'
      },
      razaoSocial: {
        type: Sequelize.STRING(150),
        allowNull: true,
        comment: 'Razão social da empresa'
      },
      telefone: {
        type: Sequelize.STRING(20),
        allowNull: true,
        comment: 'Telefone de contato'
      },
      email: {
        type: Sequelize.STRING(100),
        allowNull: true,
        comment: 'E-mail de contato'
      },
      endereco: {
        type: Sequelize.TEXT,
        allowNull: true,
        comment: 'Endereço completo'
      },
      cidade: {
        type: Sequelize.STRING(100),
        allowNull: true,
        comment: 'Cidade'
      },
      estado: {
        type: Sequelize.STRING(50),
        allowNull: true,
        comment: 'Estado/Província'
      },
      pais: {
        type: Sequelize.STRING(50),
        allowNull: true,
        defaultValue: 'Angola',
        comment: 'País'
      },
      logo: {
        type: Sequelize.STRING(255),
        allowNull: true,
        comment: 'URL do logotipo'
      },
      ativo: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true,
        comment: 'Status ativo/inativo'
      },
      configuracao: {
        type: Sequelize.JSON,
        allowNull: true,
        comment: 'Configurações da empresa'
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
    await queryInterface.dropTable('empresas');
  }
};
