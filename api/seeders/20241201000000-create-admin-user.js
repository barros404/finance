'use strict';

const bcrypt = require('bcryptjs');

module.exports = {
  async up(queryInterface, Sequelize) {
    // Criar empresa padrão primeiro
      const empresa = await queryInterface.bulkInsert('empresas', [{
      nome: 'Endiagro ',
      razaoSocial: 'Endiagro  Ltda',
      nif: '12.345.678/0001-90',
      endereco: 'Luanda, Angola',
      telefone: '+244 923 456 789',
      email: 'gearl@endiagro.com',
      status: 'ativo',
      createdAt: new Date(),
      updatedAt: new Date()
    }], { returning: true });

    const empresaId = empresa[0].id;

    // Hash da senha admin
    const senhaHash = await bcrypt.hash('admin123', 12);

    // Criar usuário admin
    await queryInterface.bulkInsert('usuarios', [{
      nome: 'Administrador',
      email: 'admin@endiagro.com',
      senha: senhaHash,
      role: 'admin',
      status: 'ativo',
      empresaId: empresaId,
      ultimoLogin: null,
      createdAt: new Date(),
      updatedAt: new Date()
    }]);

    // Criar usuário de teste
    const senhaTesteHash = await bcrypt.hash('teste123', 12);
    
    await queryInterface.bulkInsert('usuarios', [{
      nome: 'Usuário Teste',
      email: 'teste@endiagro.com',
      senha: senhaTesteHash,
      role: 'tecnico',
      status: 'ativo',
      empresaId: empresaId,
      ultimoLogin: null,
      createdAt: new Date(),
      updatedAt: new Date()
    }]);
  },

  async down(queryInterface, Sequelize) {
    // Remover usuários
    await queryInterface.bulkDelete('usuarios', {
      email: ['admin@endiagro.com', 'teste@endiagro.com']
    });

    // Remover empresa
    await queryInterface.bulkDelete('empresas', {
      nif: '12.345.678/0001-90'
    });
  }
};
