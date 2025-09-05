@echo off
echo ========================================
echo    EVSADAY - Estados Vibracionais
echo ========================================
echo.
echo Iniciando o projeto...
echo.

REM Verificar se Node.js está instalado
node --version >nul 2>&1
if errorlevel 1 (
    echo ERRO: Node.js nao encontrado!
    echo Por favor, instale o Node.js em: https://nodejs.org/
    pause
    exit /b 1
)

REM Verificar se as dependências estão instaladas
if not exist "node_modules" (
    echo Instalando dependencias...
    npm run install-all
    if errorlevel 1 (
        echo ERRO: Falha ao instalar dependencias!
        pause
        exit /b 1
    )
)

REM Criar arquivo .env se não existir
if not exist "server\.env" (
    echo Criando arquivo .env...
    echo PORT=5000 > server\.env
    echo JWT_SECRET=evsaday_secret_key_2024 >> server\.env
    echo CORS_ORIGIN=http://localhost:3000 >> server\.env
    echo Arquivo .env criado com configuracoes padrao
    echo.
)

echo.
echo ========================================
echo    Iniciando servidor e cliente...
echo ========================================
echo.
echo Backend: http://localhost:5000
echo Frontend: http://localhost:3000
echo.
echo Pressione Ctrl+C para parar
echo.

REM Iniciar o projeto
npm run dev 