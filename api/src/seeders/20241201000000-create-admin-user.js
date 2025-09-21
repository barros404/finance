'use strict';

const bcrypt = require('bcryptjs');

module.exports = {
  async up(queryInterface, Sequelize) {
    // Criar empresa padrão primeiro
    const empresa = await queryInterface.bulkInsert('Empresas', [{
      nome: 'Endiagro',
      nif: '500247365',
      descricaoNegocio: 'Sistema de gestão financeira para empresas agropecuárias e industriais.',
      razaoSocial: 'Endiagro Sociedade Agroindustrial Ltda',
      telefone: '+244923456789',
      email: 'geral@endiagro.com',
      endereco: 'Luanda, Angola',
      cidade: 'Luanda',
      estado: 'Luanda',
      pais: 'Angola',
      ativo: true,
      createdAt: new Date(),
      updatedAt: new Date()
    }], { returning: true });

    const empresaId = empresa[0].id;

    // Associar empresa com setores (Agricultura, Tecnologia)
    const setores = await queryInterface.sequelize.query(
      "SELECT id FROM \"Setores\" WHERE nome IN ('Agricultura', 'Tecnologia')",
      { type: queryInterface.sequelize.QueryTypes.SELECT }
    );

    if (setores.length > 0) {
      const empresaSetores = setores.map(setor => ({
        empresaId: empresaId,
        setorId: setor.id,
        createdAt: new Date(),
        updatedAt: new Date()
      }));

      await queryInterface.bulkInsert('EmpresaSetores', empresaSetores);
    }

    // Hash da senha admin
    const senhaHash = await bcrypt.hash('admin123', 12);

    // Criar usuário admin
    await queryInterface.bulkInsert('Usuarios', [{
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
    
    await queryInterface.bulkInsert('Usuarios', [{
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
    await queryInterface.bulkDelete('Usuarios', {
      email: ['admin@endiagro.com', 'teste@endiagro.com']
    });

    // Remover empresa
    await queryInterface.bulkDelete('Empresas', {
      nif: '500247365'
    });
  }
};
