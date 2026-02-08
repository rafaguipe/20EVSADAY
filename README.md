# EVSADAY - Sistema de Estados Vibracionais Gamificado

Um site gamificado para registro de Estados Vibracionais (EVs) com sistema de pontuação, badges e rankings competitivos.

## 🎯 Sobre o Projeto

O EVSADAY é uma plataforma que permite aos praticantes de Conscienciologia registrarem seus Estados Vibracionais de forma gamificada. Os usuários podem:

- Registrar EVs com pontuação de 0 a 4
- Acompanhar estatísticas detalhadas
- Participar de rankings competitivos
- Conquistar badges conscienciológicas
- Manter anonimato usando apelidos e avatars
- Usar comandos no Telegram para registrar e consultar EVs

## 🚀 Tecnologias Utilizadas

### Backend
- **Node.js** com Express
- **SQLite** para banco de dados
- **JWT** para autenticação
- **bcryptjs** para hash de senhas

### Frontend
- **React** com TypeScript
- **Styled Components** para estilização
- **React Router** para navegação
- **Axios** para requisições HTTP
- **Framer Motion** para animações

## 📋 Pré-requisitos

- Node.js (versão 16 ou superior)
- npm ou yarn

## 🔧 Instalação

1. **Clone o repositório**
```bash
git clone <url-do-repositorio>
cd 20EVSADAY
```

2. **Instale as dependências**
```bash
npm run install-all
```

3. **Configure as variáveis de ambiente**
Crie um arquivo `.env` na pasta `server/`:
```env
JWT_SECRET=sua_chave_secreta_aqui
PORT=5000
```

4. **Inicialize o banco de dados**
O banco será criado automaticamente na primeira execução.

## 🏃‍♂️ Como Executar

### Desenvolvimento
```bash
npm run dev
```

Isso irá iniciar:
- Backend na porta 5000
- Frontend na porta 3000

### Configuração do Bot do Telegram
1. Crie um bot com o [BotFather](https://t.me/botfather) e copie o token.
2. Configure as variáveis de ambiente no Supabase Edge Function:
   - `TELEGRAM_BOT_TOKEN`
   - `TELEGRAM_WEBHOOK_SECRET` (opcional, recomendado)
3. Aplique o script `sql/setup-telegram-bot.sql` no banco Supabase.
4. Faça o deploy da função `supabase/functions/telegram-bot`.
5. No painel do Telegram, registre o webhook apontando para a função.

Depois disso, gere o código no perfil do usuário e use `/link CODIGO` no bot.

### Produção
```bash
# Build do frontend
npm run build

# Iniciar servidor
npm run server
```

## 📊 Funcionalidades

### Sistema de Autenticação
- Registro com email, senha e apelido
- Seleção de avatar pixel art
- Login com JWT
- Proteção de rotas

### Registro de EVs
- Pontuação de 0 a 4
- Campo para observações
- Validação de dados
- Histórico completo

### Integração Telegram
- Vinculação segura via código temporário
- Registro de EVs com comando `/ev`
- Consulta rápida de resumo com `/me`
- Ranking das últimas 24h e de todos os tempos com `/rank day` e `/rank all`
- Broadcast para todos os vinculados com `/broadcast` (somente admin)

### Estatísticas
- Total de EVs registrados
- Média de pontuação
- Pontuação máxima e mínima
- Estatísticas por período (dia, semana, mês)

### Rankings
- **Diário**: Melhor pontuação do dia
- **Semanal**: Melhor da semana
- **Mensal**: Melhor do mês
- **Anual**: Melhor do ano
- **Todos os tempos**: Ranking histórico
- **Consistência**: Melhor média
- **Dedicação**: Mais EVs registrados

### Sistema de Badges
- **Iniciante Consciencial**: Primeiro EV
- **Persistente**: 7 dias consecutivos
- **Dedicado**: 30 dias consecutivos
- **Mestre EV**: 100 EVs registrados
- **Alto Vibracional**: EV com pontuação 4
- **Consistente**: Média de 3+ por 10 dias
- **Pesquisador Consciencial**: 500 EVs
- **Líder Vibracional**: Top 1 mensal

## 🎨 Design

O projeto utiliza um design **pixel art** com:
- Fonte "Press Start 2P" para estilo retrô
- Paleta de cores escura
- Animações suaves
- Interface responsiva
- Elementos gamificados

## 📱 Estrutura do Projeto

```
20EVSADAY/
├── server/                 # Backend
│   ├── database/          # Configuração do banco
│   ├── routes/            # Rotas da API
│   ├── index.js           # Servidor principal
│   └── package.json
├── client/                # Frontend
│   ├── src/
│   │   ├── components/    # Componentes React
│   │   ├── pages/         # Páginas
│   │   ├── contexts/      # Contextos (Auth)
│   │   └── App.js         # App principal
│   └── package.json
├── package.json           # Scripts principais
└── README.md
```

## 🔌 API Endpoints

### Autenticação
- `POST /api/auth/register` - Registro
- `POST /api/auth/login` - Login
- `GET /api/auth/verify` - Verificar token
- `PUT /api/auth/avatar` - Atualizar avatar

### EVs
- `POST /api/evs` - Registrar EV
- `GET /api/evs/my` - Listar EVs do usuário
- `GET /api/evs/stats` - Estatísticas
- `GET /api/evs/history` - Histórico

### Rankings
- `GET /api/leaderboard/daily` - Ranking diário
- `GET /api/leaderboard/weekly` - Ranking semanal
- `GET /api/leaderboard/monthly` - Ranking mensal
- `GET /api/leaderboard/yearly` - Ranking anual
- `GET /api/leaderboard/all-time` - Todos os tempos

### Badges
- `GET /api/badges` - Listar badges
- `GET /api/badges/my` - Badges do usuário
- `GET /api/badges/progress` - Progresso
- `GET /api/badges/recent` - Badges recentes

## 🎮 Como Usar

1. **Registro**: Crie uma conta com email, senha e apelido
2. **Avatar**: Escolha um avatar pixel art
3. **Registro de EVs**: Use sua ficha de papel durante o dia
4. **Transferência**: Passe a limpo no site à noite
5. **Acompanhamento**: Veja suas estatísticas e progresso
6. **Competição**: Participe dos rankings
7. **Conquistas**: Desbloqueie badges

## 🏆 Sistema de Pontuação

- **0**: Sem percepção de EV
- **1**: Percepção sutil
- **2**: Percepção clara
- **3**: Percepção forte
- **4**: Percepção muito forte

## 📈 Estatísticas Calculadas

- **Total de EVs**: Soma de todos os registros
- **Média**: Média aritmética das pontuações
- **Pontuação máxima**: Maior pontuação alcançada
- **Dias consecutivos**: Sequência de dias com registros
- **Ranking ponderado**: Considera quantidade e qualidade

## 🔒 Segurança

- Senhas criptografadas com bcrypt
- Autenticação JWT
- Validação de dados
- Rate limiting
- Headers de segurança

## 🚀 Deploy

### Heroku
1. Configure as variáveis de ambiente
2. Deploy do backend
3. Build e deploy do frontend

### Vercel/Netlify
1. Build do frontend
2. Deploy estático
3. Configure proxy para API

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature
3. Commit suas mudanças
4. Push para a branch
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT.

## 👥 Autores

- **Equipe EVSADAY** - Desenvolvimento inicial

## 🙏 Agradecimentos

- Comunidade Conscienciológica
- Contribuidores do projeto
- Bibliotecas open source utilizadas

---

**EVSADAY** - Transformando a prática de Estados Vibracionais em uma experiência gamificada! 🎮✨ 
