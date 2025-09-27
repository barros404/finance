# 🚀 Como Executar o Sistema EndiAgro FinancePro

## ⚠️ **PROBLEMA IDENTIFICADO**

O erro `ERR_CONNECTION_REFUSED` acontece porque:
1. **Backend não está rodando** na porta 5000
2. **PostgreSQL não está rodando** 
3. **Configuração de porta estava incorreta**

## 🔧 **SOLUÇÕES**

### **Opção 1: Script Automático (Recomendado)**

**Windows:**
```bash
# Na pasta raiz do projeto (falder/)
start-system.bat
```

**Linux/WSL:**
```bash
# Na pasta raiz do projeto (falder/)
./start-system.sh
```

### **Opção 2: Manual**

#### **1. Iniciar PostgreSQL**
- **Windows:** Abra o PostgreSQL como administrador
- **Linux:** `sudo service postgresql start`

#### **2. Iniciar Backend**
```bash
cd api
npm install
npm run migrate
npm run dev
```

#### **3. Iniciar Frontend (em outro terminal)**
```bash
cd front
npm install
npm run dev
```

## 🔍 **Verificações**

### **Backend (Porta 5000)**
```bash
curl http://localhost:5000/api/health
```
**Resposta esperada:** `{"status":"ok","message":"API is running"}`

### **Frontend (Porta 5173)**
Acesse: http://localhost:5173

### **Banco de Dados**
```bash
psql -h localhost -U postgres -d finance_ia -c "SELECT 1;"
```

## 🐛 **Problemas Comuns**

### **1. PostgreSQL não está rodando**
```
Erro: PostgreSQL não está rodando ou não consegue conectar
Solução: Inicie o PostgreSQL manualmente
```

### **2. Porta já em uso**
```
Erro: Port 5000 is already in use
Solução: Mate o processo ou mude a porta no .env
```

### **3. Banco de dados não existe**
```
Erro: database "finance_ia" does not exist
Solução: Crie o banco: createdb -U postgres finance_ia
```

## 📊 **Status do Sistema**

| Componente | Porta | Status | Comando de Verificação |
|------------|-------|--------|----------------------|
| **PostgreSQL** | 5432 | ❌ Parado | `pg_isready -h localhost -p 5432` |
| **Backend API** | 5000 | ❌ Parado | `curl http://localhost:5000/api/health` |
| **Frontend** | 5173 | ✅ Rodando | http://localhost:5173 |

## 🎯 **Próximos Passos**

1. **Execute o script automático** (`start-system.bat` no Windows)
2. **Aguarde o sistema iniciar** (pode levar alguns minutos)
3. **Teste o login** com as credenciais:
   - Email: `admin@endiagro.com`
   - Senha: `admin123`

## 🔧 **Configurações Corrigidas**

- ✅ **Frontend:** Configurado para porta 5000
- ✅ **Backend:** Configurado para porta 5000
- ✅ **Tratamento de erros:** Melhorado no frontend
- ✅ **Mensagens de erro:** Mais claras para o usuário

## 📞 **Suporte**

Se ainda houver problemas:
1. Verifique se todas as dependências estão instaladas
2. Verifique se o PostgreSQL está rodando
3. Verifique se as portas 5000 e 5173 estão livres
4. Execute os comandos de verificação acima
