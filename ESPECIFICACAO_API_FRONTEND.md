# 📋 Especificação da API - Requisitos do Frontend

## 🎯 Princípio Fundamental

**A API deve fornecer EXATAMENTE os dados que o frontend espera, não o contrário!**

O frontend já está aprovado e funcionando com as estruturas de dados definidas. A API deve se adaptar a essas estruturas.

## 📊 Estruturas de Dados Esperadas

### 1. **Dashboard - Estatísticas**

#### **Endpoint**: `GET /api/dashboard/estatisticas`

**Resposta esperada:**
```json
{
  "status": "success",
  "data": {
    "orcamentosPendentes": 5,
    "planosPendentes": 3,
    "contasPendentes": 12,
    "totalAprovacoes": 25,
    "atividadesRecentes": [
      {
        "id": 1,
        "tipo": "upload",
        "titulo": "Documento carregado",
        "descricao": "fatura_001.pdf processado com sucesso",
        "data": "2024-01-15T10:30:00Z",
        "status": "sucesso",
        "usuario": "João Silva"
      }
    ]
  }
}
```

### 2. **Orçamentos - Listagem**

#### **Endpoint**: `GET /api/orcamentos`

**Parâmetros esperados:**
- `status` (opcional): "rascunho", "em_analise", "aprovado", "rejeitado", "arquivado"
- `limite` (opcional): número de itens por página
- `pagina` (opcional): página atual

**Resposta esperada:**
```json
{
  "status": "success",
  "data": {
    "orcamentos": [
      {
        "id": 1,
        "nome": "Orçamento 2024",
        "descricao": "Orçamento anual da empresa",
        "ano": 2024,
        "dataInicio": "2024-01-01",
        "dataFim": "2024-12-31",
        "status": "aprovado",
        "totalReceita": 1000000,
        "totalCusto": 800000,
        "resultadoLiquido": 200000,
        "margem": 20.0,
        "receitas": [
          {
            "id": 1,
            "descricao": "Vendas de produtos",
            "categoria": "venda",
            "quantidade": 100,
            "precoUnitario": 1000,
            "valor": 100000,
            "contaPgc": "71",
            "nomeContaPgc": "Vendas de produtos",
            "confiancaMapeamento": 95
          }
        ],
        "custos": [
          {
            "id": 1,
            "descricao": "Matérias-primas",
            "tipo": "material",
            "quantidade": 50,
            "precoUnitario": 200,
            "valor": 10000,
            "contaPgc": "61",
            "nomeContaPgc": "Custo das mercadorias vendidas",
            "confiancaMapeamento": 90
          }
        ],
        "ativos": [
          {
            "id": 1,
            "nome": "Equipamento de produção",
            "descricao": "Máquina industrial",
            "tipo": "equipamento",
            "valor": 50000,
            "vidaUtil": 10,
            "contaPgc": "21",
            "nomeContaPgc": "Equipamentos",
            "confiancaMapeamento": 85
          }
        ],
        "sazonalidades": [
          {
            "mes": 1,
            "percentual": 8.5
          },
          {
            "mes": 2,
            "percentual": 7.2
          }
        ],
        "criador": {
          "id": 1,
          "nome": "João Silva",
          "email": "joao@empresa.com"
        },
        "createdAt": "2024-01-15T10:30:00Z",
        "updatedAt": "2024-01-15T10:30:00Z"
      }
    ],
    "total": 25,
    "pagina": 1,
    "limite": 10,
    "totalPaginas": 3
  }
}
```

### 3. **Orçamento - Detalhes**

#### **Endpoint**: `GET /api/orcamentos/:id`

**Resposta esperada:**
```json
{
  "status": "success",
  "data": {
    "orcamento": {
      "id": 1,
      "nome": "Orçamento 2024",
      "descricao": "Orçamento anual da empresa",
      "ano": 2024,
      "dataInicio": "2024-01-01",
      "dataFim": "2024-12-31",
      "status": "aprovado",
      "observacoes": "Observações adicionais",
      "totalReceita": 1000000,
      "totalCusto": 800000,
      "resultadoLiquido": 200000,
      "margem": 20.0,
      "receitas": [...],
      "custos": [...],
      "ativos": [...],
      "sazonalidades": [...],
      "criador": {...},
      "createdAt": "2024-01-15T10:30:00Z",
      "updatedAt": "2024-01-15T10:30:00Z"
    }
  }
}
```

### 4. **Orçamento - Atualização**

#### **Endpoint**: `PATCH /api/orcamentos/:id`

**Dados enviados:**
```json
{
  "nome": "Orçamento 2024 Atualizado",
  "descricao": "Descrição atualizada",
  "dataInicio": "2024-01-01",
  "dataFim": "2024-12-31",
  "observacoes": "Observações atualizadas",
  "receitas": [
    {
      "id": 1,
      "descricao": "Vendas de produtos",
      "categoria": "venda",
      "quantidade": 100,
      "precoUnitario": 1000,
      "valor": 100000
    }
  ],
  "custos": [
    {
      "id": 1,
      "descricao": "Matérias-primas",
      "tipo": "material",
      "quantidade": 50,
      "precoUnitario": 200,
      "valor": 10000
    }
  ],
  "ativos": [
    {
      "id": 1,
      "nome": "Equipamento de produção",
      "descricao": "Máquina industrial",
      "tipo": "equipamento",
      "valor": 50000,
      "vidaUtil": 10
    }
  ]
}
```

**Resposta esperada:**
```json
{
  "status": "success",
  "message": "Orçamento atualizado com sucesso",
  "data": {
    "orcamento": {
      "id": 1,
      "nome": "Orçamento 2024 Atualizado",
      "updatedAt": "2024-01-15T11:00:00Z"
    }
  }
}
```

### 5. **Tesouraria - Planos**

#### **Endpoint**: `POST /api/tesouraria/planos`

**Dados enviados:**
```json
{
  "mes": "2024-01",
  "saldoInicial": 100000,
  "recebimentos": 500000,
  "pagamentos": 400000,
  "observacoes": "Plano de tesouraria para janeiro"
}
```

**Resposta esperada:**
```json
{
  "status": "success",
  "message": "Plano de tesouraria criado com sucesso",
  "data": {
    "plano": {
      "id": 1,
      "mes": "2024-01",
      "saldoInicial": 100000,
      "recebimentos": 500000,
      "pagamentos": 400000,
      "saldoFinal": 200000,
      "observacoes": "Plano de tesouraria para janeiro",
      "createdAt": "2024-01-15T10:30:00Z"
    }
  }
}
```

### 6. **Tesouraria - Atividades Recentes**

#### **Endpoint**: `GET /api/tesouraria/atividades-recentes`

**Parâmetros esperados:**
- `limite` (opcional): número de atividades (padrão: 5)

**Resposta esperada:**
```json
{
  "status": "success",
  "data": [
    {
      "id": 1,
      "tipo": "plano",
      "titulo": "Novo plano criado",
      "descricao": "Plano de tesouraria para janeiro criado",
      "data": "2024-01-15T10:30:00Z",
      "status": "sucesso",
      "usuario": "João Silva"
    }
  ]
}
```

### 7. **Aprovação - Estatísticas**

#### **Endpoint**: `GET /api/aprovacao/estatisticas`

**Resposta esperada:**
```json
{
  "status": "success",
  "data": {
    "itensPendentes": 5,
    "planosPendentes": 3,
    "itensAprovados": 25,
    "itensRejeitados": 2,
    "totalItens": 35
  }
}
```

### 8. **Validação de Contas - Estatísticas**

#### **Endpoint**: `GET /api/validacao-contas/estatisticas`

**Resposta esperada:**
```json
{
  "status": "success",
  "data": {
    "contasPendentes": 12,
    "contasValidadas": 150,
    "contasRejeitadas": 3,
    "totalContas": 165,
    "percentualValidacao": 90.9
  }
}
```

### 9. **Tesouraria - Fluxo de Caixa**

#### **Endpoint**: `GET /api/tesouraria/fluxo-caixa`

**Resposta esperada:**
```json
{
  "status": "success",
  "data": {
    "total": 10,
    "saldoAtual": 200000,
    "recebimentosPrevistos": 500000,
    "pagamentosPrevistos": 400000,
    "saldoProjetado": 300000
  }
}
```

### 10. **Orçamentos - Estatísticas**

#### **Endpoint**: `GET /api/orcamentos/estatisticas`

**Resposta esperada:**
```json
{
  "status": "success",
  "data": {
    "total": 25,
    "valorTotal": 50000000,
    "aprovados": 20,
    "pendentes": 3,
    "rejeitados": 2,
    "porStatus": {
      "aprovado": 20,
      "em_analise": 3,
      "rejeitado": 2
    }
  }
}
```

## 🔧 Padrões de Resposta

### **Estrutura Padrão de Sucesso:**
```json
{
  "status": "success",
  "message": "Operação realizada com sucesso",
  "data": {
    // Dados específicos do endpoint
  }
}
```

### **Estrutura Padrão de Erro:**
```json
{
  "status": "error",
  "message": "Descrição do erro",
  "error": "Código do erro",
  "details": {
    // Detalhes adicionais do erro
  }
}
```

## 📝 Campos Obrigatórios

### **Orçamentos:**
- `id`, `nome`, `ano`, `status`, `createdAt`, `updatedAt`
- `totalReceita`, `totalCusto`, `resultadoLiquido`, `margem`

### **Receitas:**
- `id`, `descricao`, `categoria`, `valor`
- `contaPgc`, `nomeContaPgc`, `confiancaMapeamento`

### **Custos:**
- `id`, `descricao`, `tipo`, `valor`
- `contaPgc`, `nomeContaPgc`, `confiancaMapeamento`

### **Ativos:**
- `id`, `nome`, `tipo`, `valor`, `vidaUtil`
- `contaPgc`, `nomeContaPgc`, `confiancaMapeamento`

## 🎯 Observações Importantes

1. **Todos os valores monetários** devem ser números (não strings)
2. **Datas** devem estar no formato ISO 8601
3. **Status** devem usar os valores exatos especificados
4. **Campos de mapeamento PGC** são obrigatórios para receitas, custos e ativos
5. **Confiança de mapeamento** deve ser um número entre 0 e 100
6. **Paginação** deve incluir `total`, `pagina`, `limite`, `totalPaginas`
7. **Logs** devem ser detalhados para debugging

## ✅ Checklist de Implementação

- [ ] Todos os endpoints implementados
- [ ] Estruturas de dados exatas conforme especificação
- [ ] Tratamento de erros padronizado
- [ ] Logs detalhados implementados
- [ ] Validação de dados de entrada
- [ ] Testes de integração realizados
- [ ] Documentação da API atualizada

**A API deve seguir EXATAMENTE estas especificações para garantir compatibilidade total com o frontend!** 🎯
