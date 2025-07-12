const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');
require('dotenv').config();

const { router: authRoutes } = require('./routes/auth');
const evRoutes = require('./routes/evs');
const leaderboardRoutes = require('./routes/leaderboard');
const badgesRoutes = require('./routes/badges');
const { initDatabase } = require('./database/init');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware de segurança
app.use(helmet());

// Configurar trust proxy para rate limiting
app.set('trust proxy', 1);

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100 // limite de 100 requests por IP
});
app.use(limiter);

// Middleware
app.use(cors());
app.use(express.json());

// Rotas da API
app.use('/api/auth', authRoutes);
app.use('/api/evs', evRoutes);
app.use('/api/leaderboard', leaderboardRoutes);
app.use('/api/badges', badgesRoutes);

// Rota de teste para verificar se o servidor está funcionando
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'EVSADAY API funcionando!' });
});

// Inicializar banco de dados e depois iniciar o servidor
async function startServer() {
  try {
    await initDatabase();
    
    app.listen(PORT, () => {
      console.log(`🚀 Servidor rodando na porta ${PORT}`);
      console.log(`📊 EVSADAY - Sistema de Estados Vibracionais`);
    });
  } catch (error) {
    console.error('❌ Erro ao inicializar o servidor:', error);
    process.exit(1);
  }
}

startServer(); 