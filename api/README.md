# EndiAgro FinancePro API

API backend para o sistema de gestão financeira e orçamentos da EndiAgro.

## 🚀 Características

- **Arquitetura RESTful** com endpoints bem estruturados
- **Autenticação JWT** para segurança
- **Validação de dados** com express-validator
- **Logging estruturado** com Winston
- **Documentação Swagger** integrada
- **Transações de banco** para consistência de dados
- **Tratamento de erros** padronizado

## 📋 Pré-requisitos

- Node.js 16+ 
- PostgreSQL 12+
- npm ou yarn

## 🛠️ Instalação

1. **Clone o repositório**
```bash
git clone <repository-url>
cd api
```

2. **Instale as dependências**
```bash
npm install
```

3. **Configure as variáveis de ambiente**
```bash
cp .env.example .env
# Edite o arquivo .env com suas configurações
```

4. **Configure o banco de dados**
```bash
# Execute as migrações
npm run migrate

# Execute os seeders (opcional)
npm run seed
```

5. **Inicie o servidor**
```bash
# Desenvolvimento
npm run dev

# Produção
npm start
```

## 🔧 Configuração

### Variáveis de Ambiente

```env
# Servidor
PORT=3001
NODE_ENV=development

# Banco de Dados
DB_HOST=localhost
DB_PORT=5432
DB_NAME=endiagro_financepro
DB_USERNAME=postgres
DB_PASSWORD=password

# Autenticação
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=24h
REFRESH_TOKEN_EXPIRES_IN=7d

# Upload
UPLOAD_PATH=./uploads
MAX_FILE_SIZE=10485760

# Logging
LOG_LEVEL=info
LOG_FILE_ENABLED=true
LOG_FILE_PATH=./logs/app.log
```

## 📚 Endpoints da API

### Autenticação
- `POST /api/auth/login` - Login do usuário
- `POST /api/auth/register` - Registro de usuário
- `POST /api/auth/refresh` - Renovar token
- `POST /api/auth/logout` - Logout

### Orçamentos
- `GET /api/orcamentos` - Listar orçamentos
- `POST /api/orcamentos` - Criar orçamento
- `POST /api/orcamentos/novo-orcamento` - Criar orçamento completo
- `GET /api/orcamentos/:id` - Obter orçamento
- `PATCH /api/orcamentos/:id` - Atualizar orçamento
- `DELETE /api/orcamentos/:id` - Excluir orçamento
- `PATCH /api/orcamentos/:id/aprovar` - Aprovar orçamento
- `PATCH /api/orcamentos/:id/rejeitar` - Rejeitar orçamento
- `GET /api/orcamentos/estatisticas` - Estatísticas

### Tesouraria
- `GET /api/tesouraria/planos` - Listar planos
- `POST /api/tesouraria/planos` - Criar plano
- `POST /api/tesouraria/novo-plano` - Criar plano completo
- `GET /api/tesouraria/planos/:id` - Obter plano
- `PUT /api/tesouraria/planos/:id` - Atualizar plano
- `DELETE /api/tesouraria/planos/:id` - Excluir plano
- `PATCH /api/tesouraria/planos/:id/aprovar` - Aprovar plano
- `PATCH /api/tesouraria/planos/:id/rejeitar` - Rejeitar plano
- `GET /api/tesouraria/fluxo-caixa` - Fluxo de caixa

## 🗄️ Estrutura do Banco de Dados

### Tabelas Principais

- **usuarios** - Usuários do sistema
- **empresas** - Empresas/clientes
- **orcamentos** - Orçamentos
- **receitas** - Receitas dos orçamentos
- **custos** - Custos dos orçamentos
- **ativos** - Ativos dos orçamentos
- **planos_tesouraria** - Planos de tesouraria
- **entradas_tesouraria** - Entradas de caixa
- **saidas_tesouraria** - Saídas de caixa
- **financiamentos_tesouraria** - Financiamentos

## 🔒 Autenticação

A API utiliza JWT (JSON Web Tokens) para autenticação:

```javascript
// Headers necessários
{
  "Authorization": "Bearer <token>",
  "Content-Type": "application/json"
}
```

## 📝 Validação de Dados

Todos os endpoints utilizam validação com express-validator:

```javascript
// Exemplo de validação
body('nome').trim().notEmpty().withMessage('Nome é obrigatório'),
body('email').isEmail().withMessage('Email inválido'),
body('valor').isFloat({ min: 0 }).withMessage('Valor deve ser positivo')
```

## 🚨 Tratamento de Erros

A API retorna erros padronizados:

```json
{
  "status": "error",
  "message": "Descrição do erro",
  "error": {
    "statusCode": 400,
    "message": "Detalhes do erro"
  }
}
```

## 📊 Logging

Logs estruturados com Winston:

- **Info**: Operações normais
- **Warn**: Avisos importantes
- **Error**: Erros do sistema
- **Debug**: Informações de debug

## 🧪 Testes

```bash
# Executar testes
npm test

# Testes com coverage
npm run test:coverage

# Testes em modo watch
npm run test:watch
```

## 📦 Scripts Disponíveis

- `npm start` - Inicia o servidor em produção
- `npm run dev` - Inicia o servidor em desenvolvimento
- `npm run migrate` - Executa migrações do banco
- `npm run seed` - Executa seeders
- `npm test` - Executa testes
- `npm run lint` - Verifica código com ESLint
- `npm run lint:fix` - Corrige problemas de linting

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

## 📞 Suporte

Para suporte, entre em contato:
- Email: suporte@endiagro.com
- Documentação: [docs.endiagro.com](https://docs.endiagro.com)


