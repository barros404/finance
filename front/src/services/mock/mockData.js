/**
 * Sistema de Mock - EndiAgro FinancePro
 * 
 * Este arquivo contém todos os dados simulados para desenvolvimento
 * antes da integração com a API real.
 * 
 * @author Antonio Emiliano Barros
 * @version 2.0.0
 */

/**
 * ========================================
 * DADOS SIMULADOS - AUTENTICAÇÃO
 * ========================================
 */

export const mockAuthData = {
  user: {
    id: 1,
    name: 'Antonio Emiliano Barros',
    email: 'antonio@endiagro.com',
    companyName: 'EndiAgro',
    role: 'admin',
    avatar: null,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  },
  token: 'mock-jwt-token-123456789',
  loginResponse: {
    status: 'success',
    message: 'Login realizado com sucesso',
    data: {
      user: {
        id: 1,
        name: 'Antonio Emiliano Barros',
        email: 'antonio@endiagro.com',
        companyName: 'EndiAgro',
        role: 'admin'
      },
      token: 'mock-jwt-token-123456789'
    }
  }
};

/**
 * ========================================
 * DADOS SIMULADOS - ORÇAMENTOS
 * ========================================
 */

export const mockOrcamentos = [
  {
    id: 1,
    nome: 'Orçamento Q1 2025',
    descricao: 'Orçamento do primeiro trimestre de 2025',
    departamento: 'Financeiro',
    tipo: 'orcamento',
    status: 'pendente',
    valor: 25000000,
    dataCriacao: '2024-12-15T10:30:00Z',
    dataVencimento: '2025-03-31T23:59:59Z',
    criadoPor: 'João Silva',
    observacoes: 'Orçamento para investimentos em infraestrutura',
    tags: ['investimento', 'infraestrutura', 'Q1'],
    anexos: ['orcamento_q1_2025.pdf'],
    itens: [
      { id: 1, descricao: 'Equipamentos de TI', valor: 5000000, categoria: 'investimento' },
      { id: 2, descricao: 'Reformas', valor: 8000000, categoria: 'infraestrutura' },
      { id: 3, descricao: 'Treinamentos', valor: 2000000, categoria: 'desenvolvimento' }
    ]
  },
  {
    id: 2,
    nome: 'Orçamento Marketing 2025',
    descricao: 'Orçamento anual de marketing e publicidade',
    departamento: 'Marketing',
    tipo: 'orcamento',
    status: 'aprovado',
    valor: 12000000,
    dataCriacao: '2024-11-20T14:15:00Z',
    dataAprovacao: '2024-12-01T09:00:00Z',
    dataVencimento: '2025-12-31T23:59:59Z',
    criadoPor: 'Maria Santos',
    aprovadoPor: 'Carlos Pereira',
    observacoes: 'Aprovado com ressalvas sobre ROI',
    tags: ['marketing', 'publicidade', 'anual'],
    anexos: ['orcamento_marketing_2025.pdf', 'analise_roi.pdf'],
    itens: [
      { id: 4, descricao: 'Campanhas Digitais', valor: 6000000, categoria: 'digital' },
      { id: 5, descricao: 'Eventos', valor: 3000000, categoria: 'eventos' },
      { id: 6, descricao: 'Materiais Gráficos', valor: 3000000, categoria: 'design' }
    ]
  },
  {
    id: 3,
    nome: 'Orçamento Operacional Q2',
    descricao: 'Orçamento operacional do segundo trimestre',
    departamento: 'Operações',
    tipo: 'orcamento',
    status: 'rejeitado',
    valor: 18000000,
    dataCriacao: '2024-12-10T16:45:00Z',
    dataRejeicao: '2024-12-12T11:30:00Z',
    dataVencimento: '2025-06-30T23:59:59Z',
    criadoPor: 'Ana Costa',
    rejeitadoPor: 'Pedro Oliveira',
    motivoRejeicao: 'Valores muito altos para o período',
    observacoes: 'Necessário revisão dos custos operacionais',
    tags: ['operacional', 'Q2', 'custos'],
    anexos: ['orcamento_operacional_q2.pdf'],
    itens: [
      { id: 7, descricao: 'Manutenção', valor: 8000000, categoria: 'manutenção' },
      { id: 8, descricao: 'Suprimentos', valor: 6000000, categoria: 'suprimentos' },
      { id: 9, descricao: 'Serviços Terceiros', valor: 4000000, categoria: 'terceiros' }
    ]
  }
];

/**
 * ========================================
 * DADOS SIMULADOS - PLANOS DE TESOURARIA
 * ========================================
 */

export const mockPlanosTesouraria = [
  {
    id: 1,
    nome: 'Plano de Tesouraria Janeiro 2025',
    descricao: 'Plano de fluxo de caixa para janeiro de 2025',
    departamento: 'Financeiro',
    tipo: 'plano',
    status: 'pendente',
    valor: 35000000,
    mesReferencia: 1,
    anoReferencia: 2025,
    dataCriacao: '2024-12-20T09:15:00Z',
    dataVencimento: '2025-01-31T23:59:59Z',
    criadoPor: 'João Silva',
    observacoes: 'Plano baseado no orçamento aprovado',
    tags: ['tesouraria', 'janeiro', 'fluxo-caixa'],
    anexos: ['plano_tesouraria_jan_2025.pdf'],
    entradas: [
      { id: 1, descricao: 'Vendas Janeiro', valor: 20000000, data: '2025-01-15' },
      { id: 2, descricao: 'Recebimentos', valor: 10000000, data: '2025-01-30' }
    ],
    saidas: [
      { id: 1, descricao: 'Salários', valor: 8000000, data: '2025-01-05' },
      { id: 2, descricao: 'Fornecedores', valor: 12000000, data: '2025-01-20' }
    ]
  },
  {
    id: 2,
    nome: 'Plano de Tesouraria Fevereiro 2025',
    descricao: 'Plano de fluxo de caixa para fevereiro de 2025',
    departamento: 'Financeiro',
    tipo: 'plano',
    status: 'aprovado',
    valor: 28000000,
    mesReferencia: 2,
    anoReferencia: 2025,
    dataCriacao: '2024-12-18T14:30:00Z',
    dataAprovacao: '2024-12-22T10:00:00Z',
    dataVencimento: '2025-02-28T23:59:59Z',
    criadoPor: 'Maria Santos',
    aprovadoPor: 'Carlos Pereira',
    observacoes: 'Aprovado com ajustes menores',
    tags: ['tesouraria', 'fevereiro', 'fluxo-caixa'],
    anexos: ['plano_tesouraria_fev_2025.pdf'],
    entradas: [
      { id: 3, descricao: 'Vendas Fevereiro', valor: 15000000, data: '2025-02-15' },
      { id: 4, descricao: 'Recebimentos', valor: 8000000, data: '2025-02-28' }
    ],
    saidas: [
      { id: 3, descricao: 'Salários', valor: 8000000, data: '2025-02-05' },
      { id: 4, descricao: 'Fornecedores', valor: 10000000, data: '2025-02-20' }
    ]
  },
  {
    id: 3,
    nome: 'Plano de Tesouraria Março 2025',
    descricao: 'Plano de fluxo de caixa para março de 2025',
    departamento: 'Financeiro',
    tipo: 'plano',
    status: 'rejeitado',
    valor: 32000000,
    mesReferencia: 3,
    anoReferencia: 2025,
    dataCriacao: '2024-12-22T11:20:00Z',
    dataRejeicao: '2024-12-24T15:45:00Z',
    dataVencimento: '2025-03-31T23:59:59Z',
    criadoPor: 'Ana Costa',
    rejeitadoPor: 'Pedro Oliveira',
    motivoRejeicao: 'Projeções muito otimistas',
    observacoes: 'Revisar projeções de receita',
    tags: ['tesouraria', 'março', 'fluxo-caixa'],
    anexos: ['plano_tesouraria_mar_2025.pdf'],
    entradas: [
      { id: 5, descricao: 'Vendas Março', valor: 18000000, data: '2025-03-15' },
      { id: 6, descricao: 'Recebimentos', valor: 12000000, data: '2025-03-31' }
    ],
    saidas: [
      { id: 5, descricao: 'Salários', valor: 8000000, data: '2025-03-05' },
      { id: 6, descricao: 'Fornecedores', valor: 14000000, data: '2025-03-20' }
    ]
  }
];

/**
 * ========================================
 * DADOS SIMULADOS - EXECUÇÕES ORÇAMENTAIS
 * ========================================
 */

export const mockExecucoesOrcamentais = [
  {
    id: 1,
    nome: 'Execução Orçamental Q1 2025',
    descricao: 'Execução do orçamento do primeiro trimestre de 2025',
    departamento: 'Financeiro',
    tipo: 'execucao_orcamental',
    status: 'pendente',
    valor: 22000000,
    valorOrcado: 25000000,
    percentualExecutado: 88,
    dataCriacao: '2025-01-15T10:30:00Z',
    dataVencimento: '2025-03-31T23:59:59Z',
    criadoPor: 'João Silva',
    observacoes: 'Execução parcial do orçamento aprovado',
    tags: ['execução', 'orçamental', 'Q1', '2025'],
    anexos: ['execucao_q1_2025.pdf'],
    orcamentoReferencia: 1,
    itensExecutados: [
      { id: 1, descricao: 'Equipamentos de TI', valorExecutado: 4800000, valorOrcado: 5000000, percentual: 96 },
      { id: 2, descricao: 'Reformas', valorExecutado: 7200000, valorOrcado: 8000000, percentual: 90 },
      { id: 3, descricao: 'Treinamentos', valorExecutado: 1800000, valorOrcado: 2000000, percentual: 90 }
    ]
  },
  {
    id: 2,
    nome: 'Execução Orçamental Marketing 2025',
    descricao: 'Execução do orçamento de marketing e publicidade',
    departamento: 'Marketing',
    tipo: 'execucao_orcamental',
    status: 'aprovado',
    valor: 10500000,
    valorOrcado: 12000000,
    percentualExecutado: 87.5,
    dataCriacao: '2025-01-10T14:15:00Z',
    dataAprovacao: '2025-01-20T09:00:00Z',
    dataVencimento: '2025-12-31T23:59:59Z',
    criadoPor: 'Maria Santos',
    aprovadoPor: 'Carlos Pereira',
    observacoes: 'Execução dentro do previsto',
    tags: ['execução', 'marketing', 'publicidade', '2025'],
    anexos: ['execucao_marketing_2025.pdf'],
    orcamentoReferencia: 2,
    itensExecutados: [
      { id: 4, descricao: 'Campanhas Digitais', valorExecutado: 5400000, valorOrcado: 6000000, percentual: 90 },
      { id: 5, descricao: 'Eventos', valorExecutado: 2700000, valorOrcado: 3000000, percentual: 90 },
      { id: 6, descricao: 'Materiais Gráficos', valorExecutado: 2400000, valorOrcado: 3000000, percentual: 80 }
    ]
  },
  {
    id: 3,
    nome: 'Plano de Execução Tesouraria Janeiro 2025',
    descricao: 'Plano de execução do fluxo de caixa para janeiro de 2025',
    departamento: 'Financeiro',
    tipo: 'plano_execucao',
    status: 'pendente',
    valor: 32000000,
    dataCriacao: '2024-12-25T09:15:00Z',
    dataVencimento: '2025-01-31T23:59:59Z',
    criadoPor: 'João Silva',
    observacoes: 'Plano de execução baseado no plano de tesouraria aprovado',
    tags: ['execução', 'tesouraria', 'janeiro', 'fluxo-caixa'],
    anexos: ['plano_execucao_tesouraria_jan_2025.pdf'],
    planoReferencia: 1,
    acoes: [
      { id: 1, descricao: 'Cobrança de vendas', valor: 18000000, dataPrevista: '2025-01-15', status: 'pendente' },
      { id: 2, descricao: 'Pagamento salários', valor: 8000000, dataPrevista: '2025-01-05', status: 'concluido' },
      { id: 3, descricao: 'Pagamento fornecedores', valor: 12000000, dataPrevista: '2025-01-20', status: 'pendente' }
    ]
  },
  {
    id: 4,
    nome: 'Plano de Execução Tesouraria Fevereiro 2025',
    descricao: 'Plano de execução do fluxo de caixa para fevereiro de 2025',
    departamento: 'Financeiro',
    tipo: 'plano_execucao',
    status: 'aprovado',
    valor: 28500000,
    dataCriacao: '2025-01-05T10:30:00Z',
    dataAprovacao: '2025-01-10T14:20:00Z',
    dataVencimento: '2025-02-28T23:59:59Z',
    criadoPor: 'João Silva',
    aprovadoPor: 'Carlos Pereira',
    observacoes: 'Plano aprovado com ajustes nas datas de cobrança',
    tags: ['execução', 'tesouraria', 'fevereiro', 'fluxo-caixa'],
    anexos: ['plano_execucao_tesouraria_fev_2025.pdf'],
    planoReferencia: 2,
    acoes: [
      { id: 4, descricao: 'Cobrança de clientes', valor: 15000000, dataPrevista: '2025-02-10', status: 'pendente' },
      { id: 5, descricao: 'Pagamento salários', valor: 8500000, dataPrevista: '2025-02-05', status: 'pendente' },
      { id: 6, descricao: 'Investimentos em títulos', valor: 5000000, dataPrevista: '2025-02-15', status: 'concluido' }
    ]
  },
  {
    id: 5,
    nome: 'Plano de Execução Marketing Q1 2025',
    descricao: 'Execução do plano de marketing para o primeiro trimestre',
    departamento: 'Marketing',
    tipo: 'plano_execucao',
    status: 'em_execucao',
    valor: 25000000,
    dataCriacao: '2025-01-15T11:45:00Z',
    dataVencimento: '2025-03-31T23:59:59Z',
    criadoPor: 'Maria Santos',
    observacoes: 'Execução das campanhas digitais e eventos promocionais',
    tags: ['execução', 'marketing', 'Q1', 'campanhas'],
    anexos: ['plano_execucao_marketing_q1_2025.pdf'],
    planoReferencia: 3,
    acoes: [
      { id: 7, descricao: 'Campanha digital Facebook', valor: 8000000, dataPrevista: '2025-02-01', status: 'em_andamento' },
      { id: 8, descricao: 'Evento de lançamento', valor: 12000000, dataPrevista: '2025-01-25', status: 'concluido' },
      { id: 9, descricao: 'Materiais promocionais', valor: 5000000, dataPrevista: '2025-02-15', status: 'pendente' }
    ]
  }
];

/**
 * ========================================
 * DADOS SIMULADOS - CONTAS PGC
 * ========================================
 */

export const mockContasPGC = [
  {
    id: 1,
    codigo: '611',
    nome: 'Matérias-Primas',
    classe: '6',
    subclasse: '61',
    descricao: 'Custos com matérias-primas utilizadas na produção',
    tipo: 'custo',
    status: 'validada',
    valor: 15000000,
    dataValidacao: '2024-01-15T10:30:00Z',
    validadoPor: 'João Silva',
    observacoes: 'Conta validada conforme PGC-AO',
    conformidade: 95,
    tags: ['matérias-primas', 'produção', 'custo'],
    anexos: ['validacao_611.pdf']
  },
  {
    id: 2,
    codigo: '632',
    nome: 'Remunerações do Pessoal',
    classe: '6',
    subclasse: '63',
    descricao: 'Custos com remunerações do pessoal',
    tipo: 'custo',
    status: 'pendente',
    valor: 25000000,
    dataValidacao: null,
    validadoPor: null,
    observacoes: 'Aguardando validação',
    conformidade: 0,
    tags: ['pessoal', 'remuneração', 'custo'],
    anexos: []
  },
  {
    id: 3,
    codigo: '711',
    nome: 'Vendas de Mercadorias',
    classe: '7',
    subclasse: '71',
    descricao: 'Receitas provenientes da venda de mercadorias',
    tipo: 'receita',
    status: 'erro',
    valor: 50000000,
    dataValidacao: '2024-01-10T14:20:00Z',
    validadoPor: 'Maria Santos',
    observacoes: 'Erro na classificação - revisar',
    conformidade: 60,
    tags: ['vendas', 'mercadorias', 'receita'],
    anexos: ['erro_711.pdf']
  },
  {
    id: 4,
    codigo: '641',
    nome: 'Amortizações do Exercício',
    classe: '6',
    subclasse: '64',
    descricao: 'Amortizações de ativos intangíveis',
    tipo: 'custo',
    status: 'revisao',
    valor: 5000000,
    dataValidacao: '2024-01-12T09:15:00Z',
    validadoPor: 'Carlos Pereira',
    observacoes: 'Em revisão para ajustes',
    conformidade: 75,
    tags: ['amortização', 'ativo', 'custo'],
    anexos: ['revisao_641.pdf']
  },
  {
    id: 5,
    codigo: '722',
    nome: 'Consultoria',
    classe: '7',
    subclasse: '72',
    descricao: 'Receitas de serviços de consultoria',
    tipo: 'receita',
    status: 'validada',
    valor: 8000000,
    dataValidacao: '2024-01-18T16:45:00Z',
    validadoPor: 'Ana Costa',
    observacoes: 'Conta validada com sucesso',
    conformidade: 98,
    tags: ['consultoria', 'serviços', 'receita'],
    anexos: ['validacao_722.pdf']
  }
];

/**
 * ========================================
 * DADOS SIMULADOS - ESTATÍSTICAS
 * ========================================
 */

export const mockEstatisticas = {
  aprovacao: {
    totalItens: 8,
    itensPendentes: 3,
    itensAprovados: 3,
    itensRejeitados: 2,
    valorTotal: 95000000,
    valorPendente: 35000000,
    valorAprovado: 40000000,
    valorRejeitado: 20000000
  },
  validacaoContas: {
    totalContas: 5,
    contasValidadas: 2,
    contasPendentes: 1,
    contasComErro: 1,
    contasEmRevisao: 1,
    conformidadeMedia: 65.6
  },
  orcamentos: {
    total: 3,
    pendentes: 1,
    aprovados: 1,
    rejeitados: 1,
    valorTotal: 55000000,
    valorPendente: 25000000,
    valorAprovado: 12000000,
    valorRejeitado: 18000000
  },
  planos: {
    total: 3,
    pendentes: 1,
    aprovados: 1,
    rejeitados: 1,
    valorTotal: 95000000,
    valorPendente: 35000000,
    valorAprovado: 28000000,
    valorRejeitado: 32000000
  }
};

/**
 * ========================================
 * DADOS SIMULADOS - USUÁRIOS
 * ========================================
 */

export const mockUsuarios = [
  {
    id: 1,
    name: 'Antonio Emiliano Barros',
    email: 'antonio@endiagro.com',
    companyName: 'EndiAgro',
    role: 'admin',
    active: true,
    createdAt: '2024-01-01T00:00:00Z'
  },
  {
    id: 2,
    name: 'João Silva',
    email: 'joao@endiagro.com',
    companyName: 'EndiAgro',
    role: 'manager',
    active: true,
    createdAt: '2024-01-15T00:00:00Z'
  },
  {
    id: 3,
    name: 'Maria Santos',
    email: 'maria@endiagro.com',
    companyName: 'EndiAgro',
    role: 'user',
    active: true,
    createdAt: '2024-02-01T00:00:00Z'
  },
  {
    id: 4,
    name: 'Carlos Pereira',
    email: 'carlos@endiagro.com',
    companyName: 'EndiAgro',
    role: 'approver',
    active: true,
    createdAt: '2024-02-15T00:00:00Z'
  },
  {
    id: 5,
    name: 'Ana Costa',
    email: 'ana@endiagro.com',
    companyName: 'EndiAgro',
    role: 'user',
    active: true,
    createdAt: '2024-03-01T00:00:00Z'
  }
];

/**
 * ========================================
 * DADOS SIMULADOS - DEPARTAMENTOS
 * ========================================
 */

export const mockDepartamentos = [
  { id: 1, nome: 'Financeiro', descricao: 'Departamento Financeiro' },
  { id: 2, nome: 'Marketing', descricao: 'Departamento de Marketing' },
  { id: 3, nome: 'Operações', descricao: 'Departamento de Operações' },
  { id: 4, nome: 'RH', descricao: 'Recursos Humanos' },
  { id: 5, nome: 'TI', descricao: 'Tecnologia da Informação' }
];

/**
 * ========================================
 * DADOS SIMULADOS - CATEGORIAS PGC
 * ========================================
 */

export const mockCategoriasPGC = [
  { id: 1, codigo: '1', nome: 'Financiamentos Próprios', descricao: 'Capitais próprios e financiamentos' },
  { id: 2, codigo: '2', nome: 'Ativos Fixos', descricao: 'Ativos fixos tangíveis e intangíveis' },
  { id: 3, codigo: '3', nome: 'Ativos Correntes', descricao: 'Ativos circulantes' },
  { id: 4, codigo: '4', nome: 'Financiamentos Alheios', descricao: 'Passivos e financiamentos externos' },
  { id: 5, codigo: '5', nome: 'Capitais Próprios', descricao: 'Patrimônio líquido' },
  { id: 6, codigo: '6', nome: 'Custos e Perdas', descricao: 'Custos operacionais e perdas' },
  { id: 7, codigo: '7', nome: 'Proveitos e Ganhos', descricao: 'Receitas e ganhos' },
  { id: 8, codigo: '8', nome: 'Contas de Gestão', descricao: 'Contas de resultado e gestão' }
];

/**
 * ========================================
 * UTILITÁRIOS DE MOCK
 * ========================================
 */

export const mockUtils = {
  /**
   * Simula delay de rede
   * @param {number} ms - Milissegundos de delay
   * @returns {Promise} Promise que resolve após o delay
   */
  delay: (ms = 500) => new Promise(resolve => setTimeout(resolve, ms)),

  /**
   * Simula erro de rede
   * @param {string} message - Mensagem de erro
   * @param {number} status - Status HTTP
   * @returns {Promise} Promise que rejeita com erro
   */
  simulateError: (message = 'Erro simulado', status = 500) => 
    Promise.reject(new Error(`${status}: ${message}`)),

  /**
   * Gera ID único
   * @returns {string} ID único
   */
  generateId: () => Math.random().toString(36).substr(2, 9),

  /**
   * Formata data para ISO string
   * @param {Date} date - Data
   * @returns {string} Data formatada
   */
  formatDate: (date = new Date()) => date.toISOString(),

  /**
   * Filtra dados baseado em parâmetros
   * @param {Array} data - Array de dados
   * @param {Object} filters - Filtros
   * @returns {Array} Dados filtrados
   */
  filterData: (data, filters) => {
    return data.filter(item => {
      return Object.entries(filters).every(([key, value]) => {
        if (value === undefined || value === null || value === '') return true;
        if (typeof value === 'string') {
          return item[key]?.toString().toLowerCase().includes(value.toLowerCase());
        }
        return item[key] === value;
      });
    });
  },

  /**
   * Pagina dados
   * @param {Array} data - Array de dados
   * @param {number} page - Página atual
   * @param {number} limit - Limite por página
   * @returns {Object} Dados paginados
   */
  paginateData: (data, page = 1, limit = 20) => {
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedData = data.slice(startIndex, endIndex);
    
    return {
      data: paginatedData,
      pagination: {
        total: data.length,
        page,
        limit,
        totalPages: Math.ceil(data.length / limit),
        hasNext: endIndex < data.length,
        hasPrev: page > 1
      }
    };
  }
};

export default {
  mockAuthData,
  mockOrcamentos,
  mockPlanosTesouraria,
  mockContasPGC,
  mockEstatisticas,
  mockUsuarios,
  mockDepartamentos,
  mockCategoriasPGC,
  mockUtils
};
