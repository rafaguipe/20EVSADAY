const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { db } = require('../database/init');

const router = express.Router();

// Middleware para verificar token
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Token não fornecido' });
  }

  jwt.verify(token, process.env.JWT_SECRET || 'evsaday_secret', (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Token inválido' });
    }
    req.user = user;
    next();
  });
};

// Registro de usuário
router.post('/register', async (req, res) => {
  try {
    const { email, password, nickname, avatar_id } = req.body;

    // Validações
    if (!email || !password || !nickname) {
      return res.status(400).json({ error: 'Todos os campos são obrigatórios' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Senha deve ter pelo menos 6 caracteres' });
    }

    if (nickname.length < 3) {
      return res.status(400).json({ error: 'Apelido deve ter pelo menos 3 caracteres' });
    }

    // Verificar se email já existe
    db.get('SELECT id FROM users WHERE email = ?', [email], (err, user) => {
      if (err) {
        return res.status(500).json({ error: 'Erro interno do servidor' });
      }
      if (user) {
        return res.status(400).json({ error: 'Email já cadastrado' });
      }

      // Verificar se nickname já existe
      db.get('SELECT id FROM users WHERE nickname = ?', [nickname], (err, user) => {
        if (err) {
          return res.status(500).json({ error: 'Erro interno do servidor' });
        }
        if (user) {
          return res.status(400).json({ error: 'Apelido já está em uso' });
        }

        // Hash da senha
        bcrypt.hash(password, 10, (err, hash) => {
          if (err) {
            return res.status(500).json({ error: 'Erro interno do servidor' });
          }

          // Inserir usuário
          db.run(
            'INSERT INTO users (email, password_hash, nickname, avatar_id) VALUES (?, ?, ?, ?)',
            [email, hash, nickname, avatar_id || 1],
            function(err) {
              if (err) {
                return res.status(500).json({ error: 'Erro interno do servidor' });
              }

              // Gerar token
              const token = jwt.sign(
                { id: this.lastID, email, nickname },
                process.env.JWT_SECRET || 'evsaday_secret',
                { expiresIn: '7d' }
              );

              res.status(201).json({
                message: 'Usuário criado com sucesso',
                token,
                user: {
                  id: this.lastID,
                  email,
                  nickname,
                  avatar_id: avatar_id || 1
                }
              });
            }
          );
        });
      });
    });
  } catch (error) {
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Login
router.post('/login', (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email e senha são obrigatórios' });
  }

  db.get('SELECT * FROM users WHERE email = ?', [email], (err, user) => {
    if (err) {
      return res.status(500).json({ error: 'Erro interno do servidor' });
    }
    if (!user) {
      return res.status(401).json({ error: 'Email ou senha inválidos' });
    }

    bcrypt.compare(password, user.password_hash, (err, isMatch) => {
      if (err) {
        return res.status(500).json({ error: 'Erro interno do servidor' });
      }
      if (!isMatch) {
        return res.status(401).json({ error: 'Email ou senha inválidos' });
      }

      // Atualizar último login
      db.run('UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = ?', [user.id]);

      // Gerar token
      const token = jwt.sign(
        { id: user.id, email: user.email, nickname: user.nickname },
        process.env.JWT_SECRET || 'evsaday_secret',
        { expiresIn: '7d' }
      );

      res.json({
        message: 'Login realizado com sucesso',
        token,
        user: {
          id: user.id,
          email: user.email,
          nickname: user.nickname,
          avatar_id: user.avatar_id
        }
      });
    });
  });
});

// Verificar token
router.get('/verify', authenticateToken, (req, res) => {
  res.json({ user: req.user });
});

// Atualizar avatar
router.put('/avatar', authenticateToken, (req, res) => {
  const { avatar_id } = req.body;
  const userId = req.user.id;

  if (!avatar_id || avatar_id < 1 || avatar_id > 12) {
    return res.status(400).json({ error: 'Avatar inválido' });
  }

  db.run('UPDATE users SET avatar_id = ? WHERE id = ?', [avatar_id, userId], function(err) {
    if (err) {
      return res.status(500).json({ error: 'Erro interno do servidor' });
    }

    res.json({ message: 'Avatar atualizado com sucesso', avatar_id });
  });
});

module.exports = { router, authenticateToken }; 