@echo off
echo 🚀 Iniciando Sistema EndiAgro FinancePro
echo ========================================

REM Verificar se estamos no diretório correto
if not exist "api" (
    echo ❌ Execute este script na pasta raiz do projeto (falder/)
    pause
    exit /b 1
)

if not exist "front" (
    echo ❌ Execute este script na pasta raiz do projeto (falder/)
    pause
    exit /b 1
)

echo 📋 Verificando dependências...

REM Verificar se Node.js está instalado
node --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Node.js não está instalado. Instale Node.js primeiro.
    pause
    exit /b 1
)

echo ✅ Node.js está instalado

REM Verificar se PostgreSQL está rodando
echo 🔍 Verificando PostgreSQL...
pg_isready -h localhost -p 5432 >nul 2>&1
if errorlevel 1 (
    echo ⚠️  PostgreSQL não está rodando.
    echo    Por favor, inicie o PostgreSQL manualmente:
    echo    1. Abra o PostgreSQL como administrador
    echo    2. Ou inicie o serviço PostgreSQL
    echo.
    echo    Pressione qualquer tecla quando o PostgreSQL estiver rodando...
    pause
)

echo ✅ PostgreSQL está rodando

REM Instalar dependências do backend
echo 📦 Instalando dependências do backend...
cd api
if not exist "node_modules" (
    npm install
)

REM Executar migrações
echo 🗄️  Executando migrações do banco de dados...
npm run migrate

REM Iniciar backend em nova janela
echo 🚀 Iniciando backend na porta 5000...
start "Backend API" cmd /k "npm run dev"

REM Aguardar backend iniciar
echo ⏳ Aguardando backend iniciar...
timeout /t 5 /nobreak >nul

REM Verificar se backend está rodando
curl -s http://localhost:5000/api/health >nul 2>&1
if errorlevel 1 (
    echo ❌ Backend não conseguiu iniciar. Verifique a janela do backend.
    pause
    exit /b 1
)

echo ✅ Backend está rodando em http://localhost:5000

REM Voltar para diretório raiz
cd ..

REM Instalar dependências do frontend
echo 📦 Instalando dependências do frontend...
cd front
if not exist "node_modules" (
    npm install
)

REM Iniciar frontend
echo 🚀 Iniciando frontend na porta 5173...
echo 🌐 Frontend estará disponível em: http://localhost:5173
echo 🔗 Backend estará disponível em: http://localhost:5000
echo.
echo Para parar o sistema, feche as janelas do terminal

npm run dev
