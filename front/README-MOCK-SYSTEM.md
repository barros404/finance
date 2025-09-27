# Sistema de Mock - EndiAgro FinancePro

Este documento explica como usar o sistema de mock implementado no frontend para desenvolvimento antes da integração com a API real.

## 📋 Visão Geral

O sistema de mock foi criado para permitir o desenvolvimento completo do frontend sem depender da API backend. Ele simula todas as respostas da API com dados realistas e permite testar todas as funcionalidades.

## 🚀 Como Usar

### 1. Configuração

O sistema está configurado para usar mock por padrão em desenvolvimento. Para alterar isso, edite o arquivo `src/config/apiConfig.js`:

```javascript
export const API_CONFIG = {
  USE_MOCK: true, // true = mock, false = API real
  // ... outras configurações
};
```

### 2. Estrutura dos Arquivos

```
src/
├── services/
│   ├── api.js                 # API real (quando implementada)
│   ├── upload/
│   │   └── uploadApi.js       # API de upload completa
│   └── mock/
│       ├── mockData.js        # Dados simulados
│       └── mockApi.js         # Implementação do mock
├── config/
│   └── apiConfig.js          # Configurações da API
└── pages/
    ├── Aprovacao.jsx         # Página de aprovação (com mock)
    └── ValidacaoContasPGC.jsx # Página de validação (com mock)
```

## 📊 Dados Simulados

### Orçamentos
- 3 orçamentos de exemplo com diferentes status
- Dados completos incluindo valores, datas, anexos
- Filtros por status, departamento, tipo

### Planos de Tesouraria
- 3 planos de exemplo com diferentes status
- Dados de fluxo de caixa (entradas e saídas)
- Filtros por mês, ano, status

### Contas PGC
- 5 contas PGC de exemplo
- Diferentes classes (1-8) e status
- Dados de conformidade e validação

### Estatísticas
- Estatísticas calculadas automaticamente
- Dados de aprovação, validação, conformidade
- Métricas em tempo real

## 🔧 Funcionalidades Implementadas

### Página de Aprovação (`/aprovacao`)
- ✅ Lista de itens pendentes (orçamentos + planos)
- ✅ Filtros por tipo, status, departamento
- ✅ Aprovação e rejeição de itens
- ✅ Modal com detalhes completos
- ✅ Navegação para páginas de detalhes
- ✅ Estatísticas em tempo real

### Página de Validação PGC (`/validacao-contas-pgc`)
- ✅ Lista de contas PGC
- ✅ Filtros por classe, status, tipo
- ✅ Validação e rejeição de contas
- ✅ Visualização de conformidade
- ✅ Estatísticas de validação
- ✅ Paginação e busca

## 🎯 APIs Disponíveis

### Mock APIs Implementadas

#### `mockAprovacaoApi`
- `listarItensPendentes(params)` - Lista itens pendentes
- `aprovarItem(itemId, tipo, observacoes)` - Aprova item
- `rejeitarItem(itemId, tipo, motivo)` - Rejeita item
- `obterEstatisticas(filtros)` - Estatísticas de aprovação

#### `mockValidacaoContasApi`
- `listarContasPGC(params)` - Lista contas PGC
- `validarConta(contaId, validacao)` - Valida conta
- `rejeitarConta(contaId, motivo)` - Rejeita conta
- `obterEstatisticas(filtros)` - Estatísticas de validação

#### `mockOrcamentoApi`
- `listarOrcamentos(params)` - Lista orçamentos
- `aprovarOrcamento(id, observacoes)` - Aprova orçamento
- `rejeitarOrcamento(id, motivo)` - Rejeita orçamento

#### `mockTesourariaApi`
- `listarPlanos(params)` - Lista planos
- `aprovarPlano(id, observacoes)` - Aprova plano
- `rejeitarPlano(id, motivo)` - Rejeita plano

## 🔄 Transição para API Real

### 1. Preparação
Quando a API real estiver pronta, você precisará:

1. **Alterar configuração**: Mude `USE_MOCK: false` em `apiConfig.js`
2. **Implementar endpoints**: Certifique-se de que todos os endpoints estão implementados
3. **Ajustar dados**: Os dados da API real devem seguir a mesma estrutura do mock

### 2. Estrutura de Resposta Esperada

#### Lista de Itens
```javascript
{
  status: 'success',
  data: [...], // Array de itens
  pagination: {
    total: 100,
    page: 1,
    limit: 20,
    totalPages: 5,
    hasNext: true,
    hasPrev: false
  }
}
```

#### Item Individual
```javascript
{
  status: 'success',
  data: {
    id: 1,
    nome: 'Nome do Item',
    // ... outros campos
  }
}
```

#### Estatísticas
```javascript
{
  status: 'success',
  data: {
    totalContas: 5,
    contasValidadas: 2,
    contasPendentes: 1,
    contasComErro: 1,
    conformidadeMedia: 65.6
  }
}
```

## 🛠️ Desenvolvimento

### Adicionando Novos Dados Mock

1. **Edite `mockData.js`**:
```javascript
export const mockNovosDados = [
  {
    id: 1,
    nome: 'Novo Item',
    // ... outros campos
  }
];
```

2. **Implemente a API em `mockApi.js`**:
```javascript
export const mockNovaApi = {
  async listarItens(params = {}) {
    await mockUtils.delay(MOCK_DELAY);
    // Lógica de filtros e paginação
    return {
      status: 'success',
      data: mockNovosDados,
      pagination: result.pagination
    };
  }
};
```

3. **Use na página**:
```javascript
import { mockNovaApi } from '../services/mock/mockApi.js';

// No componente
const response = await mockNovaApi.listarItens(filtros);
```

### Adicionando Novas Funcionalidades

1. **Adicione o método no mock API**
2. **Implemente a lógica na página**
3. **Teste com dados simulados**
4. **Documente a funcionalidade**

## 📝 Logs e Debug

O sistema inclui logs detalhados para debug:

```javascript
console.log('🔄 Carregando dados:', filtros);
console.log('✅ Dados carregados:', response.data);
console.error('❌ Erro:', error);
```

## 🎨 Personalização

### Alterando Delay do Mock
```javascript
// Em apiConfig.js
export const API_CONFIG = {
  MOCK_DELAY: 1000, // 1 segundo
};
```

### Adicionando Novos Filtros
```javascript
// Em mockData.js
const validParams = ['novoFiltro', 'outroFiltro'];
```

### Modificando Dados Simulados
Edite diretamente os arrays em `mockData.js` para adicionar, remover ou modificar dados.

## 🚨 Troubleshooting

### Problemas Comuns

1. **Dados não carregam**: Verifique se `USE_MOCK: true`
2. **Erro de import**: Verifique os caminhos dos imports
3. **Filtros não funcionam**: Verifique se os parâmetros estão corretos
4. **Paginação quebrada**: Verifique a estrutura de `pagination`

### Debug

1. Abra o console do navegador
2. Verifique os logs com emojis (🔄, ✅, ❌)
3. Inspecione as respostas da API mock
4. Verifique se os dados estão sendo filtrados corretamente

## 📚 Próximos Passos

1. **Implementar mais páginas** com sistema de mock
2. **Adicionar mais dados simulados** para testes
3. **Implementar testes automatizados** com dados mock
4. **Preparar transição** para API real
5. **Documentar endpoints** da API real

---

**Desenvolvido por:** Antonio Emiliano Barros  
**Versão:** 2.0.0  
**Data:** Janeiro 2025



