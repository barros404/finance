/**
 * Sistema de Mock API - EndiAgro FinancePro
 * 
 * Este arquivo intercepta as chamadas da API e retorna dados simulados
 * para desenvolvimento antes da integração com a API real.
 * 
 * @author Antonio Emiliano Barros
 * @version 2.0.0
 */

import {
  mockAuthData,
  mockOrcamentos,
  mockPlanosTesouraria,
  mockExecucoesOrcamentais,
  mockContasPGC,
  mockEstatisticas,
  mockUsuarios,
  mockDepartamentos,
  mockCategoriasPGC,
  mockUtils
} from './mockData.js';

/**
 * ========================================
 * CONFIGURAÇÃO DO MOCK
 * ========================================
 */

const MOCK_ENABLED = true; // Alterar para false quando integrar com API real
const MOCK_DELAY = 500; // Delay simulado em ms

/**
 * ========================================
 * MOCK DE AUTENTICAÇÃO
 * ========================================
 */

export const mockAuthApi = {
  async register(userData) {
    await mockUtils.delay(MOCK_DELAY);
    
    return {
      status: 'success',
      message: 'Usuário registrado com sucesso',
      data: {
        user: {
          ...mockAuthData.user,
          ...userData,
          id: mockUtils.generateId()
        },
        token: mockUtils.generateId()
      }
    };
  },

  async login(credentials) {
    await mockUtils.delay(MOCK_DELAY);
    
    if (credentials.email === 'admin@endiagro.com' && credentials.password === 'admin123') {
      return mockAuthData.loginResponse;
    }
    
    throw new Error('401: Credenciais inválidas');
  },

  async getMe() {
    await mockUtils.delay(MOCK_DELAY);
    return {
      status: 'success',
      data: mockAuthData.user
    };
  },

  async forgotPassword(email) {
    await mockUtils.delay(MOCK_DELAY);
    return {
      status: 'success',
      message: 'Email de recuperação enviado'
    };
  },

  async resetPassword(token, password) {
    await mockUtils.delay(MOCK_DELAY);
    return {
      status: 'success',
      message: 'Senha redefinida com sucesso'
    };
  },

  async updatePassword(currentPassword, newPassword) {
    await mockUtils.delay(MOCK_DELAY);
    return {
      status: 'success',
      message: 'Senha atualizada com sucesso'
    };
  },

  async logout() {
    await mockUtils.delay(100);
    return { status: 'success' };
  }
};

/**
 * ========================================
 * MOCK DE ORÇAMENTOS
 * ========================================
 */

export const mockOrcamentoApi = {
  async listarOrcamentos(params = {}) {
    await mockUtils.delay(MOCK_DELAY);
    
    let filteredData = mockOrcamentos;
    
    // Aplicar filtros
    if (params.status && params.status !== 'todos') {
      filteredData = filteredData.filter(item => item.status === params.status);
    }
    
    if (params.busca) {
      filteredData = filteredData.filter(item => 
        item.nome.toLowerCase().includes(params.busca.toLowerCase()) ||
        item.descricao.toLowerCase().includes(params.busca.toLowerCase())
      );
    }
    
    const result = mockUtils.paginateData(filteredData, params.pagina, params.limite);
    
    return {
      status: 'success',
      data: result.data,
      pagination: result.pagination
    };
  },

  async obterOrcamento(id) {
    await mockUtils.delay(MOCK_DELAY);
    
    const orcamento = mockOrcamentos.find(item => item.id === parseInt(id));
    if (!orcamento) {
      throw new Error('404: Orçamento não encontrado');
    }
    
    return {
      status: 'success',
      data: orcamento
    };
  },

  async criarOrcamento(dadosOrcamento) {
    await mockUtils.delay(MOCK_DELAY);
    
    const novoOrcamento = {
      id: mockUtils.generateId(),
      ...dadosOrcamento,
      status: 'pendente',
      dataCriacao: mockUtils.formatDate(),
      criadoPor: mockAuthData.user.name
    };
    
    mockOrcamentos.push(novoOrcamento);
    
    return {
      status: 'success',
      message: 'Orçamento criado com sucesso',
      data: novoOrcamento
    };
  },

  async atualizarOrcamento(id, dadosOrcamento) {
    await mockUtils.delay(MOCK_DELAY);
    
    const index = mockOrcamentos.findIndex(item => item.id === parseInt(id));
    if (index === -1) {
      throw new Error('404: Orçamento não encontrado');
    }
    
    mockOrcamentos[index] = {
      ...mockOrcamentos[index],
      ...dadosOrcamento,
      dataAtualizacao: mockUtils.formatDate()
    };
    
    return {
      status: 'success',
      message: 'Orçamento atualizado com sucesso',
      data: mockOrcamentos[index]
    };
  },

  async excluirOrcamento(id) {
    await mockUtils.delay(MOCK_DELAY);
    
    const index = mockOrcamentos.findIndex(item => item.id === parseInt(id));
    if (index === -1) {
      throw new Error('404: Orçamento não encontrado');
    }
    
    mockOrcamentos.splice(index, 1);
    
    return {
      status: 'success',
      message: 'Orçamento excluído com sucesso'
    };
  },

  async aprovarOrcamento(id, observacoes = '') {
    await mockUtils.delay(MOCK_DELAY);
    
    const orcamento = mockOrcamentos.find(item => item.id === parseInt(id));
    if (!orcamento) {
      throw new Error('404: Orçamento não encontrado');
    }
    
    orcamento.status = 'aprovado';
    orcamento.dataAprovacao = mockUtils.formatDate();
    orcamento.aprovadoPor = mockAuthData.user.name;
    orcamento.observacoes = observacoes;
    
    return {
      status: 'success',
      message: 'Orçamento aprovado com sucesso',
      data: orcamento
    };
  },

  async rejeitarOrcamento(id, motivo) {
    await mockUtils.delay(MOCK_DELAY);
    
    const orcamento = mockOrcamentos.find(item => item.id === parseInt(id));
    if (!orcamento) {
      throw new Error('404: Orçamento não encontrado');
    }
    
    orcamento.status = 'rejeitado';
    orcamento.dataRejeicao = mockUtils.formatDate();
    orcamento.rejeitadoPor = mockAuthData.user.name;
    orcamento.motivoRejeicao = motivo;
    
    return {
      status: 'success',
      message: 'Orçamento rejeitado com sucesso',
      data: orcamento
    };
  },

  async obterEstatisticas(filtros = {}) {
    await mockUtils.delay(MOCK_DELAY);
    
    return {
      status: 'success',
      data: mockEstatisticas.orcamentos
    };
  },

  async exportarOrcamento(orcamentoId, formato = 'pdf') {
    await mockUtils.delay(MOCK_DELAY);
    
    // Simular download de arquivo
    const blob = new Blob(['Relatório de Orçamento'], { type: 'application/pdf' });
    
    return blob;
  }
};

/**
 * ========================================
 * MOCK DE PLANOS DE TESOURARIA
 * ========================================
 */

export const mockTesourariaApi = {
  async listarPlanos(params = {}) {
    await mockUtils.delay(MOCK_DELAY);
    
    let filteredData = mockPlanosTesouraria;
    
    // Aplicar filtros
    if (params.status && params.status !== 'todos') {
      filteredData = filteredData.filter(item => item.status === params.status);
    }
    
    if (params.ano) {
      filteredData = filteredData.filter(item => item.anoReferencia === parseInt(params.ano));
    }
    
    if (params.mes) {
      filteredData = filteredData.filter(item => item.mesReferencia === parseInt(params.mes));
    }
    
    const result = mockUtils.paginateData(filteredData, params.pagina, params.limite);
    
    return {
      status: 'success',
      data: result.data,
      pagination: result.pagination
    };
  },

  async obterPlano(id) {
    await mockUtils.delay(MOCK_DELAY);
    
    const plano = mockPlanosTesouraria.find(item => item.id === parseInt(id));
    if (!plano) {
      throw new Error('404: Plano não encontrado');
    }
    
    return {
      status: 'success',
      data: plano
    };
  },

  async criarPlano(dadosPlano) {
    await mockUtils.delay(MOCK_DELAY);
    
    const novoPlano = {
      id: mockUtils.generateId(),
      ...dadosPlano,
      status: 'pendente',
      dataCriacao: mockUtils.formatDate(),
      criadoPor: mockAuthData.user.name
    };
    
    mockPlanosTesouraria.push(novoPlano);
    
    return {
      status: 'success',
      message: 'Plano criado com sucesso',
      data: novoPlano
    };
  },

  async atualizarPlano(id, dadosPlano) {
    await mockUtils.delay(MOCK_DELAY);
    
    const index = mockPlanosTesouraria.findIndex(item => item.id === parseInt(id));
    if (index === -1) {
      throw new Error('404: Plano não encontrado');
    }
    
    mockPlanosTesouraria[index] = {
      ...mockPlanosTesouraria[index],
      ...dadosPlano,
      dataAtualizacao: mockUtils.formatDate()
    };
    
    return {
      status: 'success',
      message: 'Plano atualizado com sucesso',
      data: mockPlanosTesouraria[index]
    };
  },

  async excluirPlano(id) {
    await mockUtils.delay(MOCK_DELAY);
    
    const index = mockPlanosTesouraria.findIndex(item => item.id === parseInt(id));
    if (index === -1) {
      throw new Error('404: Plano não encontrado');
    }
    
    mockPlanosTesouraria.splice(index, 1);
    
    return {
      status: 'success',
      message: 'Plano excluído com sucesso'
    };
  },

  async aprovarPlano(id, observacoes = '') {
    await mockUtils.delay(MOCK_DELAY);
    
    const plano = mockPlanosTesouraria.find(item => item.id === parseInt(id));
    if (!plano) {
      throw new Error('404: Plano não encontrado');
    }
    
    plano.status = 'aprovado';
    plano.dataAprovacao = mockUtils.formatDate();
    plano.aprovadoPor = mockAuthData.user.name;
    plano.observacoes = observacoes;
    
    return {
      status: 'success',
      message: 'Plano aprovado com sucesso',
      data: plano
    };
  },

  async rejeitarPlano(id, motivo) {
    await mockUtils.delay(MOCK_DELAY);
    
    const plano = mockPlanosTesouraria.find(item => item.id === parseInt(id));
    if (!plano) {
      throw new Error('404: Plano não encontrado');
    }
    
    plano.status = 'rejeitado';
    plano.dataRejeicao = mockUtils.formatDate();
    plano.rejeitadoPor = mockAuthData.user.name;
    plano.motivoRejeicao = motivo;
    
    return {
      status: 'success',
      message: 'Plano rejeitado com sucesso',
      data: plano
    };
  },

  async obterFluxoCaixa(filtros = {}) {
    await mockUtils.delay(MOCK_DELAY);
    
    return {
      status: 'success',
      data: {
        entradas: [
          { mes: 'Janeiro', valor: 20000000 },
          { mes: 'Fevereiro', valor: 15000000 },
          { mes: 'Março', valor: 18000000 }
        ],
        saidas: [
          { mes: 'Janeiro', valor: 15000000 },
          { mes: 'Fevereiro', valor: 12000000 },
          { mes: 'Março', valor: 16000000 }
        ]
      }
    };
  },

  async obterOrcamentosAtivos(filtros = {}) {
    await mockUtils.delay(MOCK_DELAY);
    
    return {
      status: 'success',
      data: {
        total: 3,
        orcamentos: mockOrcamentos.filter(orc => orc.status === 'aprovado')
      }
    };
  },

  async obterOrcamentoAprovado(filtros = {}) {
    await mockUtils.delay(MOCK_DELAY);
    
    const orcamentoAprovado = mockOrcamentos.find(orc => orc.status === 'aprovado');
    
    return {
      status: 'success',
      data: orcamentoAprovado || null
    };
  },

  async listarPlanosPorOrcamento(filtros = {}) {
    await mockUtils.delay(MOCK_DELAY);
    
    const planos = mockPlanosTesouraria.filter(plano => 
      plano.orcamentoId === filtros.orcamentoId
    );
    
    return {
      status: 'success',
      data: {
        planos,
        paginacao: {
          totalItens: planos.length,
          totalPaginas: 1,
          paginaAtual: 1
        }
      }
    };
  }
};

/**
 * ========================================
 * MOCK DE APROVAÇÃO CENTRALIZADA
 * ========================================
 */

export const mockAprovacaoApi = {
  async listarItensPendentes(params = {}) {
    await mockUtils.delay(MOCK_DELAY);
    
    // Combinar orçamentos, planos e execuções pendentes
    const itensPendentes = [
      ...mockOrcamentos.filter(item => item.status === 'pendente'),
      ...mockPlanosTesouraria.filter(item => item.status === 'pendente'),
      ...mockExecucoesOrcamentais.filter(item => item.status === 'pendente')
    ];
    
    let filteredData = itensPendentes;
    
    // Aplicar filtros
    if (params.tipo && params.tipo !== 'todos') {
      filteredData = filteredData.filter(item => item.tipo === params.tipo);
    }
    
    if (params.departamento && params.departamento !== 'todos') {
      filteredData = filteredData.filter(item => item.departamento === params.departamento);
    }
    
    if (params.busca) {
      filteredData = filteredData.filter(item => 
        item.nome.toLowerCase().includes(params.busca.toLowerCase()) ||
        item.descricao.toLowerCase().includes(params.busca.toLowerCase())
      );
    }
    
    const result = mockUtils.paginateData(filteredData, params.pagina, params.limite);
    
    return {
      status: 'success',
      data: result.data,
      pagination: result.pagination
    };
  },

  async aprovarItem(itemId, tipo, observacoes = '') {
    await mockUtils.delay(MOCK_DELAY);

    let item;
    if (tipo === 'orcamento') {
      item = mockOrcamentos.find(item => item.id === parseInt(itemId));
    } else if (tipo === 'plano') {
      item = mockPlanosTesouraria.find(item => item.id === parseInt(itemId));
    } else if (tipo === 'execucao_orcamental' || tipo === 'plano_execucao') {
      item = mockExecucoesOrcamentais.find(item => item.id === parseInt(itemId));
    }

    if (!item) {
      throw new Error('404: Item não encontrado');
    }

    item.status = 'aprovado';
    item.dataAprovacao = mockUtils.formatDate();
    item.aprovadoPor = mockAuthData.user.name;
    item.observacoes = observacoes;

    return {
      status: 'success',
      message: `${tipo} aprovado com sucesso`,
      data: item
    };
  },

  async rejeitarItem(itemId, tipo, motivo) {
    await mockUtils.delay(MOCK_DELAY);

    let item;
    if (tipo === 'orcamento') {
      item = mockOrcamentos.find(item => item.id === parseInt(itemId));
    } else if (tipo === 'plano') {
      item = mockPlanosTesouraria.find(item => item.id === parseInt(itemId));
    } else if (tipo === 'execucao_orcamental' || tipo === 'plano_execucao') {
      item = mockExecucoesOrcamentais.find(item => item.id === parseInt(itemId));
    }

    if (!item) {
      throw new Error('404: Item não encontrado');
    }

    item.status = 'rejeitado';
    item.dataRejeicao = mockUtils.formatDate();
    item.rejeitadoPor = mockAuthData.user.name;
    item.motivoRejeicao = motivo;

    return {
      status: 'success',
      message: `${tipo} rejeitado com sucesso`,
      data: item
    };
  },

  async obterEstatisticas(filtros = {}) {
    await mockUtils.delay(MOCK_DELAY);
    
    return {
      status: 'success',
      data: mockEstatisticas.aprovacao
    };
  },

  async obterHistorico(params = {}) {
    await mockUtils.delay(MOCK_DELAY);
    
    // Combinar histórico de orçamentos, planos e execuções
    const historico = [
      ...mockOrcamentos.filter(item => item.status !== 'pendente'),
      ...mockPlanosTesouraria.filter(item => item.status !== 'pendente'),
      ...mockExecucoesOrcamentais.filter(item => item.status !== 'pendente')
    ];
    
    const result = mockUtils.paginateData(historico, params.pagina, params.limite);
    
    return {
      status: 'success',
      data: result.data,
      pagination: result.pagination
    };
  },

  async obterItemPorId(itemId, tipo) {
    await mockUtils.delay(MOCK_DELAY);

    let item;
    if (tipo === 'orcamento') {
      item = mockOrcamentos.find(item => item.id === parseInt(itemId));
    } else if (tipo === 'plano') {
      item = mockPlanosTesouraria.find(item => item.id === parseInt(itemId));
    } else if (tipo === 'execucao_orcamental' || tipo === 'plano_execucao') {
      item = mockExecucoesOrcamentais.find(item => item.id === parseInt(itemId));
    }

    if (!item) {
      throw new Error('404: Item não encontrado');
    }

    return {
      status: 'success',
      data: item
    };
  }
};

/**
 * ========================================
 * MOCK DE VALIDAÇÃO DE CONTAS PGC
 * ========================================
 */

export const mockValidacaoContasApi = {
  async listarContasPGC(params = {}) {
    await mockUtils.delay(MOCK_DELAY);
    
    let filteredData = mockContasPGC;
    
    // Aplicar filtros
    if (params.classe && params.classe !== 'todos') {
      filteredData = filteredData.filter(item => item.classe === params.classe);
    }
    
    if (params.status && params.status !== 'todos') {
      filteredData = filteredData.filter(item => item.status === params.status);
    }
    
    if (params.tipo && params.tipo !== 'todos') {
      filteredData = filteredData.filter(item => item.tipo === params.tipo);
    }
    
    if (params.busca) {
      filteredData = filteredData.filter(item => 
        item.codigo.toLowerCase().includes(params.busca.toLowerCase()) ||
        item.nome.toLowerCase().includes(params.busca.toLowerCase()) ||
        item.descricao.toLowerCase().includes(params.busca.toLowerCase())
      );
    }
    
    const result = mockUtils.paginateData(filteredData, params.pagina, params.limite);
    
    return {
      status: 'success',
      data: result.data,
      pagination: result.pagination
    };
  },

  async obterConta(contaId) {
    await mockUtils.delay(MOCK_DELAY);
    
    const conta = mockContasPGC.find(item => item.id === parseInt(contaId));
    if (!conta) {
      throw new Error('404: Conta não encontrada');
    }
    
    return {
      status: 'success',
      data: conta
    };
  },

  async validarConta(contaId, validacao) {
    await mockUtils.delay(MOCK_DELAY);
    
    const conta = mockContasPGC.find(item => item.id === parseInt(contaId));
    if (!conta) {
      throw new Error('404: Conta não encontrada');
    }
    
    conta.status = 'validada';
    conta.dataValidacao = mockUtils.formatDate();
    conta.validadoPor = mockAuthData.user.name;
    conta.observacoes = validacao.observacoes || conta.observacoes;
    conta.conformidade = validacao.conformidade || 95;
    
    return {
      status: 'success',
      message: 'Conta validada com sucesso',
      data: conta
    };
  },

  async rejeitarConta(contaId, motivo) {
    await mockUtils.delay(MOCK_DELAY);
    
    const conta = mockContasPGC.find(item => item.id === parseInt(contaId));
    if (!conta) {
      throw new Error('404: Conta não encontrada');
    }
    
    conta.status = 'erro';
    conta.dataValidacao = mockUtils.formatDate();
    conta.validadoPor = mockAuthData.user.name;
    conta.observacoes = motivo;
    conta.conformidade = 0;
    
    return {
      status: 'success',
      message: 'Conta rejeitada com sucesso',
      data: conta
    };
  },

  async obterEstatisticas(filtros = {}) {
    await mockUtils.delay(MOCK_DELAY);
    
    return {
      status: 'success',
      data: mockEstatisticas.validacaoContas
    };
  },

  async exportarRelatorio(params = {}) {
    await mockUtils.delay(MOCK_DELAY);
    
    // Simular download de arquivo
    const blob = new Blob(['Relatório de Validação de Contas PGC'], { type: 'application/pdf' });
    
    return blob;
  }
};

/**
 * ========================================
 * MOCK DE USUÁRIOS
 * ========================================
 */

export const mockUsuarioApi = {
  async listarUsuarios(params = {}) {
    await mockUtils.delay(MOCK_DELAY);
    
    let filteredData = mockUsuarios;
    
    if (params.busca) {
      filteredData = filteredData.filter(user => 
        user.name.toLowerCase().includes(params.busca.toLowerCase()) ||
        user.email.toLowerCase().includes(params.busca.toLowerCase())
      );
    }
    
    const result = mockUtils.paginateData(filteredData, params.pagina, params.limite);
    
    return {
      status: 'success',
      data: result.data,
      pagination: result.pagination
    };
  },

  async obterUsuario(id) {
    await mockUtils.delay(MOCK_DELAY);
    
    const usuario = mockUsuarios.find(item => item.id === parseInt(id));
    if (!usuario) {
      throw new Error('404: Usuário não encontrado');
    }
    
    return {
      status: 'success',
      data: usuario
    };
  },

  async criarUsuario(dadosUsuario) {
    await mockUtils.delay(MOCK_DELAY);
    
    const novoUsuario = {
      id: mockUtils.generateId(),
      ...dadosUsuario,
      active: true,
      createdAt: mockUtils.formatDate()
    };
    
    mockUsuarios.push(novoUsuario);
    
    return {
      status: 'success',
      message: 'Usuário criado com sucesso',
      data: novoUsuario
    };
  },

  async atualizarUsuario(id, dadosUsuario) {
    await mockUtils.delay(MOCK_DELAY);
    
    const index = mockUsuarios.findIndex(item => item.id === parseInt(id));
    if (index === -1) {
      throw new Error('404: Usuário não encontrado');
    }
    
    mockUsuarios[index] = {
      ...mockUsuarios[index],
      ...dadosUsuario,
      updatedAt: mockUtils.formatDate()
    };
    
    return {
      status: 'success',
      message: 'Usuário atualizado com sucesso',
      data: mockUsuarios[index]
    };
  },

  async removerUsuario(id) {
    await mockUtils.delay(MOCK_DELAY);
    
    const index = mockUsuarios.findIndex(item => item.id === parseInt(id));
    if (index === -1) {
      throw new Error('404: Usuário não encontrado');
    }
    
    mockUsuarios.splice(index, 1);
    
    return {
      status: 'success',
      message: 'Usuário removido com sucesso'
    };
  }
};

/**
 * ========================================
 * INTERCEPTADOR PRINCIPAL
 * ========================================
 */

/**
 * Intercepta chamadas da API e retorna dados mock
 * @param {string} endpoint - Endpoint da API
 * @param {Object} options - Opções da requisição
 * @returns {Promise} Resposta mockada
 */
export const interceptApiCall = async (endpoint, options = {}) => {
  if (!MOCK_ENABLED) {
    throw new Error('Mock desabilitado - use API real');
  }
  
  console.log(`🎭 Mock API: ${options.method || 'GET'} ${endpoint}`);
  
  // Simular delay de rede
  await mockUtils.delay(MOCK_DELAY);
  
  // Roteamento baseado no endpoint
  const path = endpoint.split('?')[0]; // Remove query params
  
  // Autenticação
  if (path.includes('/auth/')) {
    if (path.includes('/login')) {
      return mockAuthApi.login(options.body ? JSON.parse(options.body) : {});
    }
    if (path.includes('/register')) {
      return mockAuthApi.register(options.body ? JSON.parse(options.body) : {});
    }
    if (path.includes('/me')) {
      return mockAuthApi.getMe();
    }
  }
  
  // Orçamentos
  if (path.includes('/orcamentos')) {
    if (path.includes('/estatisticas')) {
      return mockOrcamentoApi.obterEstatisticas();
    }
    if (path.match(/\/orcamentos\/\d+\/aprovar/)) {
      const id = path.match(/\/orcamentos\/(\d+)\/aprovar/)[1];
      const body = options.body ? JSON.parse(options.body) : {};
      return mockOrcamentoApi.aprovarOrcamento(id, body.observacoes);
    }
    if (path.match(/\/orcamentos\/\d+\/rejeitar/)) {
      const id = path.match(/\/orcamentos\/(\d+)\/rejeitar/)[1];
      const body = options.body ? JSON.parse(options.body) : {};
      return mockOrcamentoApi.rejeitarOrcamento(id, body.motivo);
    }
    if (path.match(/\/orcamentos\/\d+/)) {
      const id = path.match(/\/orcamentos\/(\d+)/)[1];
      return mockOrcamentoApi.obterOrcamento(id);
    }
    return mockOrcamentoApi.listarOrcamentos();
  }
  
  // Planos de Tesouraria
  if (path.includes('/tesouraria/planos')) {
    if (path.match(/\/tesouraria\/planos\/\d+\/aprovar/)) {
      const id = path.match(/\/tesouraria\/planos\/(\d+)\/aprovar/)[1];
      const body = options.body ? JSON.parse(options.body) : {};
      return mockTesourariaApi.aprovarPlano(id, body.observacoes);
    }
    if (path.match(/\/tesouraria\/planos\/\d+\/rejeitar/)) {
      const id = path.match(/\/tesouraria\/planos\/(\d+)\/rejeitar/)[1];
      const body = options.body ? JSON.parse(options.body) : {};
      return mockTesourariaApi.rejeitarPlano(id, body.motivo);
    }
    if (path.match(/\/tesouraria\/planos\/\d+/)) {
      const id = path.match(/\/tesouraria\/planos\/(\d+)/)[1];
      return mockTesourariaApi.obterPlano(id);
    }
    return mockTesourariaApi.listarPlanos();
  }
  
  // Aprovação Centralizada
  if (path.includes('/aprovacao/')) {
    if (path.includes('/pendentes')) {
      return mockAprovacaoApi.listarItensPendentes();
    }
    if (path.includes('/estatisticas')) {
      return mockAprovacaoApi.obterEstatisticas();
    }
    if (path.includes('/historico')) {
      return mockAprovacaoApi.obterHistorico();
    }
  }
  
  // Validação de Contas PGC
  if (path.includes('/validacao-contas/')) {
    if (path.includes('/estatisticas')) {
      return mockValidacaoContasApi.obterEstatisticas();
    }
    if (path.includes('/exportar')) {
      return mockValidacaoContasApi.exportarRelatorio();
    }
    if (path.match(/\/validacao-contas\/contas\/\d+\/validar/)) {
      const id = path.match(/\/validacao-contas\/contas\/(\d+)\/validar/)[1];
      const body = options.body ? JSON.parse(options.body) : {};
      return mockValidacaoContasApi.validarConta(id, body);
    }
    if (path.match(/\/validacao-contas\/contas\/\d+\/rejeitar/)) {
      const id = path.match(/\/validacao-contas\/contas\/(\d+)\/rejeitar/)[1];
      const body = options.body ? JSON.parse(options.body) : {};
      return mockValidacaoContasApi.rejeitarConta(id, body.motivo);
    }
    if (path.match(/\/validacao-contas\/contas\/\d+/)) {
      const id = path.match(/\/validacao-contas\/contas\/(\d+)/)[1];
      return mockValidacaoContasApi.obterConta(id);
    }
    return mockValidacaoContasApi.listarContasPGC();
  }
  
  // Usuários
  if (path.includes('/usuarios')) {
    if (path.match(/\/usuarios\/\d+/)) {
      const id = path.match(/\/usuarios\/(\d+)/)[1];
      return mockUsuarioApi.obterUsuario(id);
    }
    return mockUsuarioApi.listarUsuarios();
  }
  
  // Endpoint não encontrado
  throw new Error(`404: Endpoint não encontrado: ${endpoint}`);
};

/**
 * ========================================
 * CONFIGURAÇÃO E EXPORTAÇÃO
 * ========================================
 */

/**
 * ========================================
 * MOCK DE UPLOAD E PROCESSAMENTO
 * ========================================
 */

export const mockUploadApi = {
  async uploadArquivo(arquivo, metadados = {}) {
    await mockUtils.delay(MOCK_DELAY);
    
    return {
      status: 'success',
      data: {
        id: Date.now(),
        nome: arquivo.name,
        tamanho: arquivo.size,
        tipo: arquivo.type,
        status: 'processado',
        url: URL.createObjectURL(arquivo),
        metadados
      }
    };
  },

  async processarArquivo(arquivoId) {
    await mockUtils.delay(MOCK_DELAY);
    
    return {
      status: 'success',
      data: {
        id: arquivoId,
        status: 'processado',
        textoExtraido: 'Texto extraído via OCR...',
        confianca: Math.floor(Math.random() * 30) + 70
      }
    };
  },

  async listarDocumentosParaClassificacao(filtros = {}) {
    await mockUtils.delay(MOCK_DELAY);
    
    let documentos = mockDocumentos.filter(doc => doc.status === 'processado');
    
    // Aplicar filtros
    if (filtros.status && filtros.status !== 'todos') {
      documentos = documentos.filter(doc => doc.status === filtros.status);
    }
    
    if (filtros.tipo && filtros.tipo !== 'all') {
      documentos = documentos.filter(doc => doc.tipo === filtros.tipo);
    }
    
    if (filtros.confianca && filtros.confianca !== 'all') {
      documentos = documentos.filter(doc => {
        if (filtros.confianca === 'alta') return doc.confianca >= 80;
        if (filtros.confianca === 'media') return doc.confianca >= 60 && doc.confianca < 80;
        if (filtros.confianca === 'baixa') return doc.confianca < 60;
        return true;
      });
    }
    
    // Paginação
    const totalItens = documentos.length;
    const totalPaginas = Math.ceil(totalItens / (filtros.limite || 10));
    const paginaAtual = filtros.pagina || 1;
    const inicio = (paginaAtual - 1) * (filtros.limite || 10);
    const fim = inicio + (filtros.limite || 10);
    
    const documentosPaginados = documentos.slice(inicio, fim);
    
    return {
      status: 'success',
      data: {
        documentos: documentosPaginados,
        paginacao: {
          totalItens,
          totalPaginas,
          paginaAtual
        }
      }
    };
  }
};

/**
 * ========================================
 * MOCK DE PGC
 * ========================================
 */

export const mockPgcApi = {
  async classificarDocumento(documentoId, classificacao) {
    await mockUtils.delay(MOCK_DELAY);
    
    return {
      status: 'success',
      data: {
        id: documentoId,
        classificacao,
        status: 'classificado',
        dataClassificacao: new Date().toISOString()
      }
    };
  }
};

export const mockConfig = {
  enabled: MOCK_ENABLED,
  delay: MOCK_DELAY,
  enable: () => { MOCK_ENABLED = true; },
  disable: () => { MOCK_ENABLED = false; },
  setDelay: (ms) => { MOCK_DELAY = ms; }
};

export default {
  mockAuthApi,
  mockOrcamentoApi,
  mockTesourariaApi,
  mockAprovacaoApi,
  mockValidacaoContasApi,
  mockUsuarioApi,
  mockUploadApi,
  mockPgcApi,
  interceptApiCall,
  mockConfig
};
