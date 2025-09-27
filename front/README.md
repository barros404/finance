# EndiAgro FinancePro - Frontend

Interface de usuário moderna e responsiva para o sistema de gestão financeira do setor agrícola em Angola.

## 🚀 Funcionalidades

### 📊 Dashboard Executivo
- Visão geral da performance financeira
- Indicadores-chave em tempo real
- Navegação intuitiva para todos os módulos

### 📤 Upload de Documentos
- Interface drag-and-drop para upload
- Suporte a múltiplos formatos (PDF, DOC, XLS, imagens)
- Processamento em tempo real com progresso
- Visualização de resultados do mapeamento PGC-AO

### 🏷️ Classificação PGC-AO
- Visualização de mapeamentos automáticos
- Análise de confiança do mapeamento
- Revisão e ajustes manuais
- Filtros avançados por categoria e status

### ⚠️ Análise de Riscos
- Matriz de riscos interativa
- Identificação e monitoramento de riscos
- Planos de mitigação
- Alertas e notificações

### 📈 Execução Orçamental
- Comparação orçado vs realizado
- Análise de desvios e tendências
- Gráficos e visualizações interativas
- Relatórios de performance

### 📑 Relatórios Executivos
- Geração automática de relatórios
- Múltiplos formatos de exportação
- Agendamento de relatórios
- Histórico e versionamento

## 🛠️ Tecnologias

- **React 18** - Biblioteca para interfaces de usuário
- **Vite** - Build tool e dev server ultra-rápido
- **Tailwind CSS** - Framework CSS utilitário
- **Lucide React** - Ícones modernos e consistentes
- **React Router** - Roteamento client-side
- **Context API** - Gerenciamento de estado global

## 📁 Estrutura do Projeto

```
front/
├── src/
│   ├── components/          # Componentes reutilizáveis
│   │   ├── Layout.jsx      # Layout principal
│   │   ├── upload/         # Componentes de upload
│   │   └── ...
│   ├── pages/              # Páginas da aplicação
│   │   ├── modules/        # Páginas dos módulos
│   │   ├── Dashboard.jsx   # Dashboard principal
│   │   ├── Login.jsx       # Página de login
│   │   └── ...
│   ├── services/           # Serviços de API
│   │   ├── api.js         # Cliente HTTP
│   │   └── upload/        # Serviços de upload
│   ├── contexts/           # Contextos React
│   │   └── AuthContext.jsx # Contexto de autenticação
│   ├── assets/             # Recursos estáticos
│   └── main.jsx           # Ponto de entrada
├── public/                 # Arquivos públicos
└── package.json
```

## 🚀 Instalação e Desenvolvimento

### Pré-requisitos
- Node.js 18+
- npm ou yarn

### 1. Instalar dependências
```bash
npm install
```

### 2. Configurar variáveis de ambiente
```bash
cp .env.example .env
# Configure as variáveis no arquivo .env
```

### 3. Iniciar servidor de desenvolvimento
```bash
npm run dev
```

### 4. Acessar a aplicação
- URL: http://localhost:5173
- Hot reload ativado automaticamente

## 📦 Scripts Disponíveis

```bash
# Desenvolvimento
npm run dev          # Inicia servidor de desenvolvimento
npm run build        # Build para produção
npm run preview      # Preview do build de produção

# Qualidade de código
npm run lint         # Executa ESLint
npm run lint:fix     # Corrige problemas do ESLint

# Testes
npm run test         # Executa testes
npm run test:ui      # Interface visual para testes
```

## 🎨 Design System

### Cores Principais
- **Primária**: Gradiente azul-roxo (#667eea → #764ba2)
- **Fundo**: Gradiente escuro (#0f0c29 → #302b63 → #24243e)
- **Sucesso**: Verde (#10b981)
- **Aviso**: Amarelo (#f59e0b)
- **Erro**: Vermelho (#ef4444)

### Componentes
- **Cards**: Bordas arredondadas com backdrop blur
- **Botões**: Gradientes com hover effects
- **Formulários**: Validação em tempo real
- **Tabelas**: Responsivas com filtros

### Responsividade
- **Mobile First**: Design otimizado para dispositivos móveis
- **Breakpoints**: sm (640px), md (768px), lg (1024px), xl (1280px)
- **Grid System**: CSS Grid e Flexbox

## 🔧 Configuração

### Variáveis de Ambiente
```env
VITE_API_URL=http://localhost:3000/api
VITE_APP_NAME=EndiAgro FinancePro
VITE_APP_VERSION=2.0.1
```

### Configuração do Vite
```javascript
// vite.config.js
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': 'http://localhost:3000'
    }
  }
})
```

## 🧪 Testes

### Configuração de Testes
- **Vitest** - Framework de testes
- **React Testing Library** - Testes de componentes
- **MSW** - Mock de APIs

### Executar Testes
```bash
npm run test         # Executa todos os testes
npm run test:watch   # Modo watch
npm run test:coverage # Com cobertura
```

### Exemplo de Teste
```javascript
import { render, screen } from '@testing-library/react'
import { expect, test } from 'vitest'
import Dashboard from './pages/Dashboard'

test('renders dashboard title', () => {
  render(<Dashboard />)
  expect(screen.getByText('Dashboard')).toBeInTheDocument()
})
```

## 📱 PWA (Progressive Web App)

### Funcionalidades PWA
- **Service Worker** - Cache offline
- **Manifest** - Instalação como app
- **Responsive** - Funciona em todos os dispositivos
- **Fast Loading** - Carregamento otimizado

### Instalação
```bash
npm run build
# O build inclui automaticamente os arquivos PWA
```

## 🔒 Segurança

### Autenticação
- **JWT Tokens** - Autenticação stateless
- **Context API** - Gerenciamento de estado de auth
- **Route Guards** - Proteção de rotas
- **Token Refresh** - Renovação automática

### Validação
- **Client-side** - Validação em tempo real
- **Server-side** - Validação no backend
- **Sanitização** - Prevenção de XSS

## 📊 Performance

### Otimizações
- **Code Splitting** - Carregamento sob demanda
- **Lazy Loading** - Componentes carregados quando necessário
- **Image Optimization** - Compressão automática
- **Bundle Analysis** - Análise de tamanho do bundle

### Métricas
- **Lighthouse Score**: 95+
- **First Contentful Paint**: < 1.5s
- **Largest Contentful Paint**: < 2.5s
- **Cumulative Layout Shift**: < 0.1

## 🌐 Internacionalização

### Suporte a Idiomas
- **Português (Angola)** - Idioma principal
- **Inglês** - Idioma secundário
- **Estrutura preparada** para novos idiomas

### Configuração
```javascript
// i18n/config.js
export const supportedLocales = ['pt-AO', 'en']
export const defaultLocale = 'pt-AO'
```

## 🚀 Deploy

### Build de Produção
```bash
npm run build
# Gera arquivos otimizados na pasta dist/
```

### Deploy no Vercel
```bash
npm install -g vercel
vercel --prod
```

### Deploy no Netlify
```bash
npm run build
# Upload da pasta dist/ para Netlify
```

## 🤝 Contribuição

### Padrões de Código
- **ESLint** - Linting automático
- **Prettier** - Formatação de código
- **Conventional Commits** - Padrão de commits
- **Component Storybook** - Documentação de componentes

### Workflow
1. Fork o repositório
2. Crie uma branch para sua feature
3. Implemente seguindo os padrões
4. Adicione testes
5. Abra um Pull Request

## 📚 Documentação

### Componentes
- **Props** - Documentação de propriedades
- **Exemplos** - Casos de uso
- **Storybook** - Interface visual

### APIs
- **JSDoc** - Documentação inline
- **TypeScript** - Tipagem (futuro)
- **OpenAPI** - Especificação da API
---
