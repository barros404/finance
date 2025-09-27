# EndiAgro FinancePro

Sistema Integrado de Gestão Financeira para o Setor Agrícola em Angola, desenvolvido com tecnologias modernas e focado na conformidade com o Plano Geral de Contabilidade (PGC-AO).

## 🚀 Funcionalidades Principais

### 📊 Gestão Orçamental
- Criação e gestão de orçamentos anuais
- Mapeamento automático para contas PGC-AO
- Acompanhamento de execução orçamental
- Análise de desvios e tendências

### 💰 Tesouraria
- Gestão de fluxo de caixa
- Controle de entradas e saídas
- Planejamento financeiro
- Análise de liquidez

### 📤 Upload e Processamento de Documentos
- Upload de documentos (PDF, DOC, XLS, imagens)
- Extração automática de texto (OCR)
- Mapeamento inteligente para PGC-AO
- Processamento em lote

### 🏷️ Classificação PGC-AO
- Mapeamento automático de transações
- Conformidade com padrões contábeis angolanos
- Análise de confiança do mapeamento
- Revisão e ajustes manuais

### ⚠️ Análise de Riscos
- Identificação de riscos financeiros
- Matriz de riscos por categoria
- Planos de mitigação
- Monitoramento contínuo

### 📈 Relatórios Executivos
- Geração automática de relatórios
- Dashboards interativos
- Análises de performance
- Exportação em múltiplos formatos

## 🛠️ Tecnologias Utilizadas

### Frontend
- **React 18** - Biblioteca para interfaces de usuário
- **Vite** - Build tool e dev server
- **Tailwind CSS** - Framework CSS utilitário
- **Lucide React** - Ícones modernos
- **React Router** - Roteamento

### Backend
- **Node.js** - Runtime JavaScript
- **Express.js** - Framework web
- **Sequelize** - ORM para banco de dados
- **JWT** - Autenticação
- **Multer** - Upload de arquivos
- **Express Validator** - Validação de dados

### Banco de Dados
- **PostgreSQL** - Banco de dados principal
- **Migrations** - Controle de versão do schema

### Processamento de Documentos
- **OCR** - Reconhecimento óptico de caracteres
- **PDF Processing** - Extração de texto de PDFs
- **Image Processing** - Processamento de imagens

## 📁 Estrutura do Projeto

```
endiagro-falder/
├── front/                    # Frontend React
│   ├── src/
│   │   ├── components/       # Componentes reutilizáveis
│   │   ├── pages/           # Páginas da aplicação
│   │   ├── services/        # Serviços de API
│   │   └── contexts/        # Contextos React
│   └── package.json
├── api/                     # Backend Node.js
│   ├── src/
│   │   ├── controllers/     # Controladores
│   │   ├── models/         # Modelos de dados
│   │   ├── routes/         # Rotas da API
│   │   ├── services/       # Serviços de negócio
│   │   ├── middleware/     # Middlewares
│   │   └── utils/          # Utilitários
│   ├── migrations/         # Migrações do banco
│   └── tests/              # Testes automatizados
└── README.md
```

## 🚀 Instalação e Configuração

### Pré-requisitos
- Node.js 18+ 
- PostgreSQL 13+
- npm ou yarn

### 1. Clone o repositório
```bash
git clone https://github.com/endiagro/falder.git
cd falder
```

### 2. Configure o Backend
```bash
cd api
npm install
cp .env.example .env
# Configure as variáveis de ambiente no arquivo .env
npm run migrate
npm run seed
npm start
```

### 3. Configure o Frontend
```bash
cd front
npm install
npm run dev
```

### 4. Acesse a aplicação
- Frontend: http://localhost:5173
- Backend API: http://localhost:3000

## 📚 Documentação da API

### Autenticação
Todas as rotas protegidas requerem um token JWT no header:
```
Authorization: Bearer <token>
```

### Principais Endpoints

#### Upload de Documentos
- `POST /api/upload/documento` - Upload de arquivo único
- `POST /api/upload/lote` - Upload de múltiplos arquivos
- `POST /api/upload/processar/:id` - Processar arquivo
- `GET /api/upload/historico` - Histórico de uploads

#### Gestão Orçamental
- `GET /api/orcamentos` - Listar orçamentos
- `POST /api/orcamentos` - Criar orçamento
- `PUT /api/orcamentos/:id` - Atualizar orçamento

#### Tesouraria
- `GET /api/tesouraria/entradas` - Listar entradas
- `GET /api/tesouraria/saidas` - Listar saídas
- `POST /api/tesouraria/entradas` - Registrar entrada

#### Relatórios
- `GET /api/relatorios` - Listar relatórios
- `POST /api/relatorios/gerar` - Gerar relatório
- `GET /api/relatorios/stats` - Estatísticas

#### Riscos
- `GET /api/riscos` - Listar riscos
- `POST /api/riscos` - Criar risco
- `GET /api/riscos/matriz` - Matriz de riscos

## 🧪 Testes

### Executar Testes
```bash
# Backend
cd api
npm test

# Frontend
cd front
npm test
```

### Cobertura de Testes
```bash
npm run test:coverage
```

## 🔧 Configuração de Desenvolvimento

### Variáveis de Ambiente
```env
# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=endiagro_finance
DB_USER=postgres
DB_PASSWORD=password

# JWT
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=24h

# Upload
UPLOAD_MAX_SIZE=10485760
UPLOAD_PATH=./uploads

# OCR
OCR_SERVICE_URL=http://localhost:8080
```

### Scripts Disponíveis
```bash
# Desenvolvimento
npm run dev          # Inicia em modo desenvolvimento
npm run build        # Build para produção
npm run start        # Inicia em modo produção

# Banco de Dados
npm run migrate      # Executa migrações
npm run seed         # Executa seeders
npm run db:reset     # Reseta banco de dados

# Testes
npm test             # Executa testes
npm run test:watch   # Executa testes em modo watch
```

## 📊 Conformidade PGC-AO

O sistema está totalmente alinhado com o Plano Geral de Contabilidade de Angola (PGC-AO), incluindo:

- **Classe 6**: Custos Operacionais
- **Classe 7**: Proveitos e Ganhos
- **Mapeamento Automático**: IA para classificação de transações
- **Validação**: Verificação de conformidade
- **Relatórios**: Demonstrações financeiras padronizadas

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📝 Licença

Este projeto está licenciado sob a Licença MIT - veja o arquivo [LICENSE](LICENSE) para detalhes.

## 👥 Equipe

- **Antonio Emiliano Barros** - Desenvolvedor Principal
- **EndiAgro** - Empresa

## 📞 Suporte

Para suporte e dúvidas:
- Email: suporte@endiagro.com
- Documentação: [Wiki do Projeto](https://github.com/endiagro/falder/wiki)

## 🗺️ Roadmap

### Versão 2.1
- [ ] Integração com sistemas bancários
- [ ] Relatórios em tempo real
- [ ] Mobile app

### Versão 2.2
- [ ] IA avançada para previsões
- [ ] Integração com ERP
- [ ] Dashboard executivo
---
