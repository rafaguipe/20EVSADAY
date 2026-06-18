# 🚀 EVSADAY - Instruções Rápidas

## Início Rápido

### Windows
```bash
# Duplo clique no arquivo ou execute no terminal:
start.bat
```

### Linux/Mac
```bash
# Execute no terminal:
./start.sh
```

### Manual
```bash
# 1. Instalar dependências
npm run install-all

# 2. Criar arquivo .env no servidor
echo "PORT=5000" > server/.env
echo "JWT_SECRET=evsaday_secret_key_2024" >> server/.env

# 3. Iniciar projeto
npm run dev
```

## 📱 Acessos

- **Frontend**: http://localhost:3000
- **Backend**: http://localhost:5000

## 🎮 Primeiros Passos

1. **Acesse**: http://localhost:3000
2. **Cadastre-se** com email, senha e apelido
3. **Escolha um avatar** pixel art
4. **Vá para o Dashboard** e registre seu primeiro EV
5. **Explore** os rankings e badges

## 📊 Sistema de Pontuação

- **0**: Sem percepção de EV
- **1**: Percepção sutil
- **2**: Percepção clara
- **3**: Percepção forte
- **4**: Percepção muito forte

## 🏆 Badges Disponíveis

- 🌱 **Iniciante Consciencial**: Primeiro EV
- 🔥 **Persistente**: 7 dias consecutivos
- 💎 **Dedicado**: 30 dias consecutivos
- 👑 **Mestre EV**: 100 EVs registrados
- ⭐ **Alto Vibracional**: EV com pontuação 4
- 📈 **Consistente**: Média de 3+ por 10 dias
- 🔬 **Pesquisador Consciencial**: 500 EVs
- 🏆 **Líder Vibracional**: Top 1 mensal

## 🔧 Comandos Úteis

```bash
# Instalar dependências
npm run install-all

# Desenvolvimento
npm run dev

# Apenas servidor
npm run server

# Apenas cliente
npm run client

# Build para produção
npm run build
```

## 🛠️ Solução de Problemas

### Erro de porta em uso
```bash
# Windows
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# Linux/Mac
lsof -ti:5000 | xargs kill -9
```

### Erro de dependências
```bash
# Limpar cache e reinstalar
rm -rf node_modules package-lock.json
npm run install-all
```

### Banco de dados corrompido
```bash
# Remover e recriar
rm server/database/evsaday.db
npm run dev
```

## 📞 Suporte

- **Documentação**: README.md
- **Issues**: GitHub Issues
- **Comunidade**: Discord/Slack

---

**EVSADAY** - Transformando a prática de Estados Vibracionais em uma experiência gamificada! 🎮✨ 