/**
 * API de Upload e Processamento de Documentos - EndiAgro FinancePro
 * 
 * Este arquivo centraliza todas as operações de upload, processamento
 * e classificação de documentos do sistema.
 * 
 * @author Antonio Emiliano Barros
 * @version 2.0.0
 */

import apiClient  from '../api';

/**
 * ========================================
 * SERVIÇOS DE UPLOAD DE ARQUIVOS
 * ========================================
 */

/**
 * API de Upload de Arquivos
 */
export const uploadApi = {
  /**
   * Faz upload de um único arquivo
   * @param {File} arquivo - Arquivo para upload
   * @param {Object} metadados - Metadados do arquivo (tipo, categoria, etc.)
   * @returns {Promise<Object>} Resultado do upload
   */
  async uploadArquivo(arquivo, metadados = {}) {
    const formData = new FormData();
    formData.append('arquivo', arquivo);
    
    // Adicionar metadados se fornecidos
    Object.entries(metadados).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        formData.append(key, value);
      }
    });

    return apiClient.post('/upload/arquivo', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  /**
   * Faz upload de múltiplos arquivos
   * @param {FileList|Array} arquivos - Arquivos para upload
   * @param {Object} metadados - Metadados dos arquivos
   * @returns {Promise<Object>} Resultado do upload em lote
   */
  async uploadMultiplosArquivos(arquivos, metadados = {}) {
    const formData = new FormData();
    
    // Adicionar todos os arquivos
    Array.from(arquivos).forEach((arquivo, index) => {
      formData.append(`arquivos`, arquivo);
    });
    
    // Adicionar metadados se fornecidos
    Object.entries(metadados).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        formData.append(key, value);
      }
    });

    return apiClient.post('/upload/arquivos', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  /**
   * Lista todos os arquivos enviados
   * @param {Object} params - Parâmetros de filtro
   * @returns {Promise<Object>} Lista paginada de arquivos
   */
  async listarArquivos(params = {}) {
    const queryParams = new URLSearchParams();
    
    const validParams = ['status', 'tipo', 'dataInicio', 'dataFim', 'pagina', 'limite', 'busca', 'categoria'];
    validParams.forEach(param => {
      if (params[param] !== undefined && params[param] !== null && params[param] !== '') {
        queryParams.append(param, params[param]);
      }
    });

    const endpoint = `/upload/arquivos${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    return apiClient.get(endpoint);
  },

  /**
   * Obtém detalhes de um arquivo específico
   * @param {string|number} arquivoId - ID do arquivo
   * @returns {Promise<Object>} Detalhes do arquivo
   */
  async obterArquivo(arquivoId) {
    return apiClient.get(`/upload/arquivos/${arquivoId}`);
  },

  /**
   * Remove um arquivo
   * @param {string|number} arquivoId - ID do arquivo
   * @returns {Promise<Object>} Confirmação da remoção
   */
  async removerArquivo(arquivoId) {
    return apiClient.delete(`/upload/arquivos/${arquivoId}`);
  },

  /**
   * Atualiza metadados de um arquivo
   * @param {string|number} arquivoId - ID do arquivo
   * @param {Object} metadados - Novos metadados
   * @returns {Promise<Object>} Arquivo atualizado
   */
  async atualizarMetadados(arquivoId, metadados) {
    return apiClient.patch(`/upload/arquivos/${arquivoId}`, metadados);
  }
};

/**
 * ========================================
 * SERVIÇOS DE PROCESSAMENTO DE DOCUMENTOS
 * ========================================
 */

/**
 * API de Processamento de Documentos
 */
export const processamentoApi = {
  /**
   * Processa um arquivo (OCR e extração de texto)
   * @param {string|number} arquivoId - ID do arquivo
   * @param {Object} configuracao - Configuração do processamento
   * @returns {Promise<Object>} Resultado do processamento
   */
  async processarArquivo(arquivoId, configuracao = {}) {
    return apiClient.post(`/processamento/arquivos/${arquivoId}/processar`, configuracao);
  },

  /**
   * Reprocessa um arquivo
   * @param {string|number} arquivoId - ID do arquivo
   * @param {Object} configuracao - Nova configuração
   * @returns {Promise<Object>} Resultado do reprocessamento
   */
  async reprocessarArquivo(arquivoId, configuracao = {}) {
    return apiClient.post(`/processamento/arquivos/${arquivoId}/reprocessar`, configuracao);
  },

  /**
   * Obtém status do processamento de um arquivo
   * @param {string|number} arquivoId - ID do arquivo
   * @returns {Promise<Object>} Status do processamento
   */
  async obterStatusProcessamento(arquivoId) {
    return apiClient.get(`/processamento/arquivos/${arquivoId}/status`);
  },

  /**
   * Obtém texto extraído de um arquivo
   * @param {string|number} arquivoId - ID do arquivo
   * @returns {Promise<Object>} Texto extraído
   */
  async obterTextoExtraido(arquivoId) {
    return apiClient.get(`/processamento/arquivos/${arquivoId}/texto`);
  },

  /**
   * Processa lote de arquivos
   * @param {Array} arquivoIds - IDs dos arquivos
   * @param {Object} configuracao - Configuração do processamento
   * @returns {Promise<Object>} Resultado do processamento em lote
   */
  async processarLote(arquivoIds, configuracao = {}) {
    return apiClient.post('/processamento/lote', {
      arquivoIds,
      configuracao
    });
  },

  /**
   * Obtém histórico de processamentos
   * @param {Object} params - Parâmetros de filtro
   * @returns {Promise<Object>} Lista paginada do histórico
   */
  async obterHistorico(params = {}) {
    const queryParams = new URLSearchParams();
    
    const validParams = ['usuarioId', 'dataInicio', 'dataFim', 'status', 'pagina', 'limite'];
    validParams.forEach(param => {
      if (params[param] !== undefined && params[param] !== null && params[param] !== '') {
        queryParams.append(param, params[param]);
      }
    });

    const endpoint = `/processamento/historico${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    return apiClient.get(endpoint);
  }
};

/**
 * ========================================
 * SERVIÇOS DE CLASSIFICAÇÃO PGC-AO
 * ========================================
 */

/**
 * API de Classificação PGC-AO
 */
export const classificacaoApi = {
  /**
   * Lista documentos pendentes de classificação
   * @param {Object} params - Parâmetros de filtro
   * @returns {Promise<Object>} Lista paginada de documentos
   */
  async listarDocumentosPendentes(params = {}) {
    const queryParams = new URLSearchParams();
    
    const validParams = ['status', 'tipo', 'confianca', 'pagina', 'limite', 'busca'];
    validParams.forEach(param => {
      if (params[param] !== undefined && params[param] !== null && params[param] !== '') {
        queryParams.append(param, params[param]);
      }
    });

    const endpoint = `/classificacao/documentos${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    return apiClient.get(endpoint);
  },

  /**
   * Classifica um documento como Receita ou Custo
   * @param {string|number} documentoId - ID do documento
   * @param {Object} classificacao - Dados da classificação
   * @returns {Promise<Object>} Confirmação da classificação
   */
  async classificarDocumento(documentoId, classificacao) {
    return apiClient.post(`/classificacao/documentos/${documentoId}/classificar`, classificacao);
  },

  /**
   * Valida uma classificação PGC-AO
   * @param {string|number} documentoId - ID do documento
   * @param {Object} validacao - Dados da validação
   * @returns {Promise<Object>} Confirmação da validação
   */
  async validarClassificacao(documentoId, validacao) {
    return apiClient.post(`/classificacao/documentos/${documentoId}/validar`, validacao);
  },

  /**
   * Lista mapeamentos de contas PGC-AO
   * @param {Object} params - Parâmetros de filtro
   * @returns {Promise<Object>} Lista paginada de mapeamentos
   */
  async listarMapeamentos(params = {}) {
    const queryParams = new URLSearchParams();
    
    const validParams = ['tipo', 'contaPgc', 'status', 'pagina', 'limite', 'busca'];
    validParams.forEach(param => {
      if (params[param] !== undefined && params[param] !== null && params[param] !== '') {
        queryParams.append(param, params[param]);
      }
    });

    const endpoint = `/classificacao/mapeamentos${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    return apiClient.get(endpoint);
  },

  /**
   * Cria um novo mapeamento de conta PGC-AO
   * @param {Object} mapeamento - Dados do mapeamento
   * @returns {Promise<Object>} Mapeamento criado
   */
  async criarMapeamento(mapeamento) {
    return apiClient.post('/classificacao/mapeamentos', mapeamento);
  },

  /**
   * Atualiza um mapeamento de conta PGC-AO
   * @param {string|number} id - ID do mapeamento
   * @param {Object} mapeamento - Dados atualizados
   * @returns {Promise<Object>} Mapeamento atualizado
   */
  async atualizarMapeamento(id, mapeamento) {
    return apiClient.put(`/classificacao/mapeamentos/${id}`, mapeamento);
  },

  /**
   * Remove um mapeamento de conta PGC-AO
   * @param {string|number} id - ID do mapeamento
   * @returns {Promise<Object>} Confirmação da remoção
   */
  async removerMapeamento(id) {
    return apiClient.delete(`/classificacao/mapeamentos/${id}`);
  },

  /**
   * Lista contas PGC-AO disponíveis
   * @param {Object} params - Parâmetros de filtro
   * @returns {Promise<Object>} Lista de contas PGC-AO
   */
  async listarContasPGC(params = {}) {
    const queryParams = new URLSearchParams();
    
    const validParams = ['categoria', 'busca', 'pagina', 'limite'];
    validParams.forEach(param => {
      if (params[param] !== undefined && params[param] !== null && params[param] !== '') {
        queryParams.append(param, params[param]);
      }
    });

    const endpoint = `/classificacao/contas-pgc${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    return apiClient.get(endpoint);
  },

  /**
   * Obtém estatísticas de classificação PGC-AO
   * @param {Object} params - Parâmetros de filtro
   * @returns {Promise<Object>} Estatísticas
   */
  async obterEstatisticas(params = {}) {
    const queryParams = new URLSearchParams();
    
    const validParams = ['periodo', 'tipo', 'status'];
    validParams.forEach(param => {
      if (params[param] !== undefined && params[param] !== null && params[param] !== '') {
        queryParams.append(param, params[param]);
      }
    });

    const endpoint = `/classificacao/estatisticas${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    return apiClient.get(endpoint);
  },

  /**
   * Exporta dados de classificação PGC-AO
   * @param {Object} params - Parâmetros de exportação
   * @returns {Promise<Object>} Dados para exportação
   */
  async exportarDados(params = {}) {
    const queryParams = new URLSearchParams();
    
    const validParams = ['formato', 'periodo', 'tipo', 'status'];
    validParams.forEach(param => {
      if (params[param] !== undefined && params[param] !== null && params[param] !== '') {
        queryParams.append(param, params[param]);
      }
    });

    const endpoint = `/classificacao/exportar${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    return apiClient.get(endpoint);
  },

  /**
   * Processa lote de documentos para classificação
   * @param {Array} documentoIds - IDs dos documentos
   * @param {Object} configuracao - Configuração do processamento
   * @returns {Promise<Object>} Resultado do processamento
   */
  async processarLote(documentoIds, configuracao = {}) {
    return apiClient.post('/classificacao/processar-lote', {
      documentoIds,
      configuracao
    });
  },

  /**
   * Obtém histórico de classificações
   * @param {Object} params - Parâmetros de filtro
   * @returns {Promise<Object>} Lista paginada do histórico
   */
  async obterHistorico(params = {}) {
    const queryParams = new URLSearchParams();
    
    const validParams = ['documentoId', 'usuarioId', 'dataInicio', 'dataFim', 'pagina', 'limite'];
    validParams.forEach(param => {
      if (params[param] !== undefined && params[param] !== null && params[param] !== '') {
        queryParams.append(param, params[param]);
      }
    });

    const endpoint = `/classificacao/historico${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    return apiClient.get(endpoint);
  }
};

/**
 * ========================================
 * SERVIÇOS DE DOWNLOAD E EXPORTAÇÃO
 * ========================================
 */

/**
 * API de Download e Exportação
 */
export const downloadApi = {
  /**
   * Baixa um arquivo processado
   * @param {string|number} arquivoId - ID do arquivo
   * @param {string} formato - Formato de download (original, pdf, txt)
   * @returns {Promise<Blob>} Arquivo para download
   */
  async baixarArquivo(arquivoId, formato = 'original') {
    const response = await fetch(`${apiClient.baseURL}/download/arquivos/${arquivoId}?formato=${formato}`, {
      headers: {
        'Authorization': `Bearer ${apiClient.getAuthToken()}`,
      },
    });
    
    if (!response.ok) {
      throw new Error(`Erro ao baixar arquivo: ${response.statusText}`);
    }
    
    return response.blob();
  },

  /**
   * Exporta dados em formato Excel
   * @param {Object} params - Parâmetros de exportação
   * @returns {Promise<Blob>} Arquivo Excel
   */
  async exportarExcel(params = {}) {
    const queryParams = new URLSearchParams();
    
    const validParams = ['tipo', 'periodo', 'filtros'];
    validParams.forEach(param => {
      if (params[param] !== undefined && params[param] !== null && params[param] !== '') {
        queryParams.append(param, params[param]);
      }
    });

    const response = await fetch(`${apiClient.baseURL}/download/exportar/excel?${queryParams.toString()}`, {
      headers: {
        'Authorization': `Bearer ${apiClient.getAuthToken()}`,
      },
    });
    
    if (!response.ok) {
      throw new Error(`Erro ao exportar Excel: ${response.statusText}`);
    }
    
    return response.blob();
  },

  /**
   * Exporta dados em formato PDF
   * @param {Object} params - Parâmetros de exportação
   * @returns {Promise<Blob>} Arquivo PDF
   */
  async exportarPDF(params = {}) {
    const queryParams = new URLSearchParams();
    
    const validParams = ['tipo', 'periodo', 'filtros'];
    validParams.forEach(param => {
      if (params[param] !== undefined && params[param] !== null && params[param] !== '') {
        queryParams.append(param, params[param]);
      }
    });

    const response = await fetch(`${apiClient.baseURL}/download/exportar/pdf?${queryParams.toString()}`, {
      headers: {
        'Authorization': `Bearer ${apiClient.getAuthToken()}`,
      },
    });
    
    if (!response.ok) {
      throw new Error(`Erro ao exportar PDF: ${response.statusText}`);
    }
    
    return response.blob();
  },

  /**
   * Gera relatório personalizado
   * @param {Object} configuracao - Configuração do relatório
   * @returns {Promise<Blob>} Arquivo do relatório
   */
  async gerarRelatorio(configuracao) {
    const response = await fetch(`${apiClient.baseURL}/download/relatorios`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiClient.getAuthToken()}`,
      },
      body: JSON.stringify(configuracao)
    });
    
    if (!response.ok) {
      throw new Error(`Erro ao gerar relatório: ${response.statusText}`);
    }
    
    return response.blob();
  }
};

/**
 * ========================================
 * SERVIÇOS DE VALIDAÇÃO E UTILITÁRIOS
 * ========================================
 */

/**
 * API de Validação e Utilitários
 */
export const validacaoApi = {
  /**
   * Valida formato de arquivo
   * @param {File} arquivo - Arquivo para validar
   * @returns {Promise<Object>} Resultado da validação
   */
  async validarFormatoArquivo(arquivo) {
    const formData = new FormData();
    formData.append('arquivo', arquivo);

    return apiClient.post('/validacao/formato-arquivo', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  /**
   * Obtém tipos de arquivo suportados
   * @returns {Promise<Object>} Lista de tipos suportados
   */
  async obterTiposSuportados() {
    return apiClient.get('/validacao/tipos-suportados');
  },

  /**
   * Valida dados de classificação
   * @param {Object} dados - Dados para validar
   * @returns {Promise<Object>} Resultado da validação
   */
  async validarDadosClassificacao(dados) {
    return apiClient.post('/validacao/classificacao', dados);
  },

  /**
   * Obtém sugestões de classificação
   * @param {string} texto - Texto para análise
   * @returns {Promise<Object>} Sugestões de classificação
   */
  async obterSugestoesClassificacao(texto) {
    return apiClient.post('/validacao/sugestoes', { texto });
  }
};

/**
 * ========================================
 * EXPORTAÇÕES PRINCIPAIS
 * ========================================
 */

// Exporta todas as APIs


// Exporta API principal combinada
export const uploadApiCompleta = {
  ...uploadApi,
  ...processamentoApi,
  ...classificacaoApi,
  ...downloadApi,
  ...validacaoApi
};

export default uploadApiCompleta;



