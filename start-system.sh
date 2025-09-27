#!/bin/bash

echo "🚀 Iniciando Sistema EndiAgro FinancePro"
echo "========================================"

# Verificar se estamos no diretório correto
if [ ! -d "api" ] || [ ! -d "front" ]; then
    echo "❌ Execute este script na pasta raiz do projeto (falder/)"
    exit 1
fi

echo "📋 Verificando dependências..."

# Verificar se Node.js está instalado
if ! command -v node &> /dev/null; then
    echo "❌ Node.js não está instalado. Instale Node.js primeiro."
    exit 1
fi

# Verificar se PostgreSQL está rodando
echo "🔍 Verificando PostgreSQL..."
if ! pg_isready -h localhost -p 5432 &> /dev/null; then
    echo "⚠️  PostgreSQL não está rodando. Iniciando PostgreSQL..."
    
    # Tentar iniciar PostgreSQL (Linux/WSL)
    if command -v sudo &> /dev/null; then
        sudo service postgresql start
    else
        echo "❌ PostgreSQL não está rodando. Por favor, inicie o PostgreSQL manualmente."
        echo "   No Windows: Abra o PostgreSQL como administrador"
        echo "   No Linux: sudo service postgresql start"
        exit 1
    fi
fi

echo "✅ PostgreSQL está rodando"

# Instalar dependências do backend
echo "📦 Instalando dependências do backend..."
cd api
if [ ! -d "node_modules" ]; then
    npm install
fi

# Executar migrações
echo "🗄️  Executando migrações do banco de dados..."
npm run migrate

# Iniciar backend em background
echo "🚀 Iniciando backend na porta 5000..."
npm run dev &
BACKEND_PID=$!

# Aguardar backend iniciar
echo "⏳ Aguardando backend iniciar..."
sleep 5

# Verificar se backend está rodando
if curl -s http://localhost:5000/api/health > /dev/null; then
    echo "✅ Backend está rodando em http://localhost:5000"
else
    echo "❌ Backend não conseguiu iniciar. Verifique os logs."
    kill $BACKEND_PID 2>/dev/null
    exit 1
fi

# Voltar para diretório raiz
cd ..

# Instalar dependências do frontend
echo "📦 Instalando dependências do frontend..."
cd front
if [ ! -d "node_modules" ]; then
    npm install
fi

# Iniciar frontend
echo "🚀 Iniciando frontend na porta 5173..."
echo "🌐 Frontend estará disponível em: http://localhost:5173"
echo "🔗 Backend estará disponível em: http://localhost:5000"
echo ""
echo "Para parar o sistema, pressione Ctrl+C"

npm run dev
