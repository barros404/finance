'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Setores', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
        comment: 'Identificador único do setor'
      },
      nome: {
        type: Sequelize.STRING(100),
        allowNull: false,
        unique: true,
        comment: 'Nome do setor de atuação'
      },
      descricao: {
        type: Sequelize.TEXT,
        allowNull: true,
        comment: 'Descrição detalhada do setor'
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

    // Inserir setores padrão
    await queryInterface.bulkInsert('Setores', [
      { nome: 'Agricultura', descricao: 'Cultivo de plantas e produção agrícola', createdAt: new Date(), updatedAt: new Date() },
      { nome: 'Pecuária', descricao: 'Criação e manejo de animais', createdAt: new Date(), updatedAt: new Date() },
      { nome: 'Indústria', descricao: 'Transformação de matérias-primas em produtos', createdAt: new Date(), updatedAt: new Date() },
      { nome: 'Comércio', descricao: 'Compra e venda de produtos e serviços', createdAt: new Date(), updatedAt: new Date() },
      { nome: 'Serviços', descricao: 'Prestação de serviços diversos', createdAt: new Date(), updatedAt: new Date() },
      { nome: 'Tecnologia', descricao: 'Desenvolvimento e uso de tecnologia', createdAt: new Date(), updatedAt: new Date() }
    ]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Setores');
  }
};
