# Arquitetura de Comunicação Frontend ↔ Backend

## 📋 Visão Geral

O sistema EndiAgro FinancePro utiliza uma arquitetura cliente-servidor com comunicação via API REST entre o frontend React e o backend Node.js/Express.

## 🏗️ Estrutura do Projeto

```
falder/
├── api/                    # Backend (Node.js/Express)
│   ├── src/
│   │   ├── server.js       # Servidor principal
│   │   ├── controllers/    # Controladores da API
│   │   ├── routes/          # Rotas da API
│   │   ├── models/         # Modelos Sequelize
│   │   ├── middleware/     # Middlewares
│   │   └── services/       # Serviços de negócio
│   └── package.json
└── front/                  # Frontend (React/Vite)
    ├── src/
    │   ├── services/       # Serviços de API
    │   ├── contexts/       # Contextos React
    │   ├── components/     # Componentes
    │   └── pages/          # Páginas
    └── package.json
```

## 🔄 Fluxo de Comunicação

### 1. **Configuração da API**

**Backend (api/src/server.js):**
```javascript
// Configuração do servidor
const PORT = process.env.PORT || 3000;
app.use('/api/auth', authRoutes);
app.use('/api/orcamentos', orcamentoRoutes);
app.use('/api/tesouraria', tesourariaRoutes);
// ... outras rotas
```

**Frontend (front/src/config/apiConfig.js):**
```javascript
export const API_CONFIG = {
  API_BASE_URL: 'http://localhost:5000/api',
  TIMEOUT: 30000,
  AUTH: {
    TOKEN_KEY: 'authToken',
    USER_KEY: 'user',
    TOKEN_PREFIX: 'Bearer '
  }
};
```

### 2. **Autenticação**

**Fluxo de Login:**
```
Frontend → POST /api/auth/login → Backend
Backend → JWT Token → Frontend
Frontend → Salva token no localStorage
```

**Implementação:**

**Backend (auth.controller.js):**
```javascript
exports.login = async (req, res, next) => {
  const { email, senha } = req.body;
  const user = await Usuario.scope('comSenha').findOne({ where: { email } });
  
  if (await user.compararSenha(senha)) {
    const token = generateToken(user.get({ plain: true }));
    res.json({
      status: 'success',
      data: { user: userData, token }
    });
  }
};
```

**Frontend (AuthContext.jsx):**
```javascript
const login = async (credentials) => {
  const response = await authApi.login(credentials);
  if (response.status === 'success') {
    localStorage.setItem('authToken', response.data.token);
    setUser(response.data.user);
    setIsAuthenticated(true);
  }
};
```

### 3. **Requisições Autenticadas**

**Cliente HTTP (httpService.js):**
```javascript
class HttpService {
  getHeaders(includeAuth = true) {
    const headers = { ...this.defaultHeaders };
    if (includeAuth) {
      const token = this.getAuthToken();
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
    }
    return headers;
  }
}
```

**Middleware de Autenticação (auth.middleware.js):**
```javascript
const protect = async (req, res, next) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  req.user = await Usuario.findByPk(decoded.id);
  next();
};
```

### 4. **Operações CRUD**

**Exemplo: Orçamentos**

**Backend (orcamento.controller.js):**
```javascript
exports.listarOrcamentos = async (req, res, next) => {
  const { status, busca, pagina = 1, limite = 10 } = req.query;
  const where = { empresaId: req.usuario.empresaId };
  
  const { count, rows: orcamentos } = await Orcamento.findAndCountAll({
    where,
    limit: parseInt(limite),
    offset: (pagina - 1) * limite,
    include: [
      { model: Receita, as: 'receitas' },
      { model: Custo, as: 'custos' }
    ]
  });
  
  res.json({
    status: 'success',
    data: { orcamentos, pagination: {...} }
  });
};
```

**Frontend (api.js):**
```javascript
export const orcamentoApi = {
  async listarOrcamentos(params = {}) {
    const queryParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) queryParams.append(key, value);
    });
    
    const endpoint = `/orcamentos${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    return apiClient.get(endpoint);
  }
};
```

## 🔧 Configurações de Ambiente

### **Desenvolvimento:**
- **Backend:** `http://localhost:3000`
- **Frontend:** `http://localhost:5173`
- **API Base:** `http://localhost:3000/api`

### **Produção:**
- **Backend:** `https://api.endiagro.com`
- **Frontend:** `https://app.endiagro.com`
- **API Base:** `https://api.endiagro.com/api`

## 📡 Endpoints Principais

### **Autenticação:**
- `POST /api/auth/login` - Login
- `POST /api/auth/register` - Registro
- `GET /api/auth/me` - Dados do usuário
- `POST /api/auth/logout` - Logout

### **Orçamentos:**
- `GET /api/orcamentos` - Listar orçamentos
- `POST /api/orcamentos` - Criar orçamento
- `GET /api/orcamentos/:id` - Obter orçamento
- `PATCH /api/orcamentos/:id` - Atualizar orçamento
- `DELETE /api/orcamentos/:id` - Excluir orçamento

### **Tesouraria:**
- `GET /api/tesouraria/planos` - Listar planos
- `POST /api/tesouraria/planos` - Criar plano
- `GET /api/tesouraria/fluxo-caixa` - Fluxo de caixa

## 🛡️ Segurança

### **Autenticação JWT:**
- Token armazenado no localStorage
- Headers Authorization: `Bearer <token>`
- Middleware de proteção em rotas sensíveis

### **Validação:**
- Express-validator no backend
- Validação de dados no frontend
- Sanitização de inputs

### **CORS:**
```javascript
app.use(cors({
  origin: process.env.FRONTEND_URL,
  credentials: true
}));
```

## 📊 Tratamento de Erros

### **Backend:**
```javascript
const errorHandler = (err, req, res, next) => {
  logger.error(err.message);
  res.status(err.status || 500).json({
    status: 'error',
    message: err.message
  });
};
```

### **Frontend:**
```javascript
async handleResponse(response) {
  if (!response.ok) {
    const error = new Error(data.message || 'Erro na requisição');
    error.status = response.status;
    throw error;
  }
  return data;
}
```

## 🚀 Como Executar

### **Backend:**
```bash
cd api
npm install
npm run dev  # Desenvolvimento
npm start    # Produção
```

### **Frontend:**
```bash
cd front
npm install
npm run dev  # Desenvolvimento
npm run build # Build para produção
```

## 📈 Monitoramento

- **Logs:** Winston no backend
- **Console:** Logs detalhados no frontend
- **Health Check:** `GET /api/health`

## 🔄 Fluxo de Dados

1. **Usuário** interage com interface React
2. **Componente** chama serviço da API
3. **Serviço** faz requisição HTTP para backend
4. **Backend** processa e consulta banco de dados
5. **Resposta** retorna dados para frontend
6. **Frontend** atualiza interface com novos dados

## 🎯 Benefícios da Arquitetura

- **Separação de responsabilidades**
- **Escalabilidade**
- **Manutenibilidade**
- **Reutilização de código**
- **Segurança centralizada**
- **Fácil teste e debug**
