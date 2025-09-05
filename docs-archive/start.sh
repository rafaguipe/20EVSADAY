#!/bin/bash

echo "========================================"
echo "    EVSADAY - Estados Vibracionais"
echo "========================================"
echo ""
echo "Iniciando o projeto..."
echo ""

# Verificar se Node.js está instalado
if ! command -v node &> /dev/null; then
    echo "ERRO: Node.js não encontrado!"
    echo "Por favor, instale o Node.js em: https://nodejs.org/"
    exit 1
fi

# Verificar se as dependências estão instaladas
if [ ! -d "node_modules" ]; then
    echo "Instalando dependências..."
    npm run install-all
    if [ $? -ne 0 ]; then
        echo "ERRO: Falha ao instalar dependências!"
        exit 1
    fi
fi

# Criar arquivo .env se não existir
if [ ! -f "server/.env" ]; then
    echo "Criando arquivo .env..."
    cat > server/.env << EOF
PORT=5000
JWT_SECRET=evsaday_secret_key_2024
CORS_ORIGIN=http://localhost:3000
EOF
    echo "Arquivo .env criado com configurações padrão"
    echo ""
fi

echo ""
echo "========================================"
echo "    Iniciando servidor e cliente..."
echo "========================================"
echo ""
echo "Backend: http://localhost:5000"
echo "Frontend: http://localhost:3000"
echo ""
echo "Pressione Ctrl+C para parar"
echo ""

# Iniciar o projeto
npm run dev 