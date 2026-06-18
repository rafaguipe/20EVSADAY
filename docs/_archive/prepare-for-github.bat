@echo off
echo 🧹 Preparando projeto para GitHub...

echo 📦 Removendo node_modules...
if exist "node_modules" rmdir /s /q "node_modules"
if exist "server\node_modules" rmdir /s /q "server\node_modules"
if exist "client\node_modules" rmdir /s /q "client\node_modules"

echo 📦 Removendo package-lock.json...
if exist "package-lock.json" del "package-lock.json"
if exist "server\package-lock.json" del "server\package-lock.json"
if exist "client\package-lock.json" del "client\package-lock.json"

echo 📦 Removendo build...
if exist "client\build" rmdir /s /q "client\build"

echo 📦 Removendo banco de dados...
if exist "server\*.db" del "server\*.db"

echo ✅ Projeto limpo! Agora você pode:
echo 1. Instalar o Git
echo 2. Executar: git init
echo 3. Executar: git add .
echo 4. Executar: git commit -m "Initial commit"
echo 5. Criar repositório no GitHub
echo 6. Executar: git remote add origin https://github.com/SEU_USUARIO/20EVSADAY.git
echo 7. Executar: git push -u origin main

pause 