# 🚀 Guia de Deploy - EVSADAY

## 📋 Pré-requisitos

1. **Git instalado** no seu computador
2. **Conta no GitHub** criada
3. **Conta na Vercel** conectada ao GitHub

## 🔧 Passo a Passo

### 1. Instalar Git
- Baixe e instale o Git: https://git-scm.com/downloads
- Configure seu usuário:
```bash
git config --global user.name "Seu Nome"
git config --global user.email "seu.email@exemplo.com"
```

### 2. Inicializar repositório local
```bash
git init
git add .
git commit -m "Initial commit - EVSADAY"
```

### 3. Criar repositório no GitHub
- Acesse: https://github.com/new
- Nome: `20EVSADAY` (ou outro nome)
- Descrição: "Sistema de Estados Vibracionais Gamificado"
- **NÃO** inicialize com README (já temos um)
- Clique em "Create repository"

### 4. Conectar repositório local ao GitHub
```bash
git remote add origin https://github.com/SEU_USUARIO/20EVSADAY.git
git branch -M main
git push -u origin main
```

### 5. Deploy na Vercel
- Acesse: https://vercel.com
- Clique em "New Project"
- Importe o repositório `20EVSADAY`
- Configure as variáveis de ambiente:
  - `JWT_SECRET`: sua_chave_secreta_aqui
  - `NODE_ENV`: production
- Clique em "Deploy"

## 🌐 URLs após deploy
- **Frontend**: https://20evsaday.vercel.app
- **API**: https://20evsaday.vercel.app/api

## 🔒 Variáveis de Ambiente (Vercel)
```env
JWT_SECRET=sua_chave_secreta_muito_segura_aqui
NODE_ENV=production
```

## 📝 Notas Importantes
- O banco SQLite será criado automaticamente
- As rotas da API funcionam em `/api/*`
- O frontend será servido na raiz `/`

## 🐛 Troubleshooting
- Se houver erro de build, verifique se todas as dependências estão no package.json
- Para logs, acesse o dashboard da Vercel
- Para variáveis de ambiente, configure no painel da Vercel 