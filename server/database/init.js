const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Verificar se estamos em produção (Railway/Render) ou desenvolvimento
const isProduction = process.env.NODE_ENV === 'production' || process.env.DATABASE_URL;

let db;

if (isProduction) {
  // Usar PostgreSQL em produção
  const { Pool } = require('pg');
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
      rejectUnauthorized: false
    }
  });
  
  db = {
    run: (sql, params = [], callback) => {
      pool.query(sql, params, (err, result) => {
        if (callback) callback(err, result);
      });
    },
    get: (sql, params = [], callback) => {
      pool.query(sql, params, (err, result) => {
        if (callback) callback(err, result.rows[0]);
      });
    },
    all: (sql, params = [], callback) => {
      pool.query(sql, params, (err, result) => {
        if (callback) callback(err, result.rows);
      });
    }
  };
} else {
  // Usar SQLite em desenvolvimento
  const dbPath = path.join(__dirname, 'evsaday.db');
  db = new sqlite3.Database(dbPath);
}

function initDatabase() {
  return new Promise((resolve, reject) => {
    console.log('🗄️ Inicializando banco de dados...');

    if (isProduction) {
      // PostgreSQL - criar tabelas
      const createTables = `
        CREATE TABLE IF NOT EXISTS users (
          id SERIAL PRIMARY KEY,
          email VARCHAR(255) UNIQUE NOT NULL,
          password_hash VARCHAR(255) NOT NULL,
          nickname VARCHAR(255) UNIQUE NOT NULL,
          avatar_id INTEGER DEFAULT 1,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          last_login TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS evs (
          id SERIAL PRIMARY KEY,
          user_id INTEGER NOT NULL,
          score INTEGER NOT NULL CHECK (score >= 0 AND score <= 4),
          notes TEXT,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users (id)
        );

        CREATE TABLE IF NOT EXISTS badges (
          id SERIAL PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          description TEXT NOT NULL,
          icon VARCHAR(10) NOT NULL,
          requirement_type VARCHAR(50) NOT NULL,
          requirement_value INTEGER NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS user_badges (
          id SERIAL PRIMARY KEY,
          user_id INTEGER NOT NULL,
          badge_id INTEGER NOT NULL,
          earned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users (id),
          FOREIGN KEY (badge_id) REFERENCES badges (id),
          UNIQUE(user_id, badge_id)
        );
      `;

      db.run(createTables, [], (err) => {
        if (err) {
          console.error('Erro ao criar tabelas:', err);
          reject(err);
          return;
        }

        // Inserir badges padrão
        insertDefaultBadges()
          .then(() => {
            console.log('✅ Banco de dados inicializado com sucesso!');
            resolve();
          })
          .catch(reject);
      });
    } else {
      // SQLite - código original
      db.run(`
        CREATE TABLE IF NOT EXISTS users (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          email TEXT UNIQUE NOT NULL,
          password_hash TEXT NOT NULL,
          nickname TEXT UNIQUE NOT NULL,
          avatar_id INTEGER DEFAULT 1,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          last_login DATETIME
        )
      `, (err) => {
        if (err) {
          console.error('Erro ao criar tabela users:', err);
          reject(err);
          return;
        }

        db.run(`
          CREATE TABLE IF NOT EXISTS evs (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            score INTEGER NOT NULL CHECK (score >= 0 AND score <= 4),
            notes TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users (id)
          )
        `, (err) => {
          if (err) {
            console.error('Erro ao criar tabela evs:', err);
            reject(err);
            return;
          }

          db.run(`
            CREATE TABLE IF NOT EXISTS badges (
              id INTEGER PRIMARY KEY AUTOINCREMENT,
              name TEXT NOT NULL,
              description TEXT NOT NULL,
              icon TEXT NOT NULL,
              requirement_type TEXT NOT NULL,
              requirement_value INTEGER NOT NULL,
              created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
          `, (err) => {
            if (err) {
              console.error('Erro ao criar tabela badges:', err);
              reject(err);
              return;
            }

            db.run(`
              CREATE TABLE IF NOT EXISTS user_badges (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER NOT NULL,
                badge_id INTEGER NOT NULL,
                earned_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users (id),
                FOREIGN KEY (badge_id) REFERENCES badges (id),
                UNIQUE(user_id, badge_id)
              )
            `, (err) => {
              if (err) {
                console.error('Erro ao criar tabela user_badges:', err);
                reject(err);
                return;
              }

              insertDefaultBadges()
                .then(() => {
                  console.log('✅ Banco de dados inicializado com sucesso!');
                  resolve();
                })
                .catch(reject);
            });
          });
        });
      });
    }
  });
}

function insertDefaultBadges() {
  return new Promise((resolve, reject) => {
    const badges = [
      {
        name: 'Iniciante Consciencial',
        description: 'Primeiro EV registrado',
        icon: '🌱',
        requirement_type: 'first_ev',
        requirement_value: 1
      },
      {
        name: 'Persistente',
        description: '7 dias consecutivos de prática',
        icon: '🔥',
        requirement_type: 'consecutive_days',
        requirement_value: 7
      },
      {
        name: 'Dedicado',
        description: '30 dias consecutivos de prática',
        icon: '💎',
        requirement_type: 'consecutive_days',
        requirement_value: 30
      },
      {
        name: 'Mestre EV',
        description: '100 EVs registrados',
        icon: '👑',
        requirement_type: 'total_evs',
        requirement_value: 100
      },
      {
        name: 'Alto Vibracional',
        description: 'EV com pontuação 4',
        icon: '⭐',
        requirement_type: 'max_score',
        requirement_value: 4
      },
      {
        name: 'Consistente',
        description: 'Média de 3+ por 10 dias',
        icon: '📈',
        requirement_type: 'average_score',
        requirement_value: 30
      },
      {
        name: 'Pesquisador Consciencial',
        description: '500 EVs registrados',
        icon: '🔬',
        requirement_type: 'total_evs',
        requirement_value: 500
      },
      {
        name: 'Líder Vibracional',
        description: 'Top 1 do ranking mensal',
        icon: '🏆',
        requirement_type: 'monthly_leader',
        requirement_value: 1
      }
    ];

    let completed = 0;
    const total = badges.length;

    if (total === 0) {
      resolve();
      return;
    }

    badges.forEach(badge => {
      const sql = isProduction 
        ? `INSERT INTO badges (name, description, icon, requirement_type, requirement_value) 
           VALUES ($1, $2, $3, $4, $5) 
           ON CONFLICT DO NOTHING`
        : `INSERT OR IGNORE INTO badges (name, description, icon, requirement_type, requirement_value)
           VALUES (?, ?, ?, ?, ?)`;

      db.run(sql, [badge.name, badge.description, badge.icon, badge.requirement_type, badge.requirement_value], (err) => {
        if (err) {
          console.error('Erro ao inserir badge:', err);
          reject(err);
          return;
        }
        
        completed++;
        if (completed === total) {
          resolve();
        }
      });
    });
  });
}

module.exports = { initDatabase, db }; 