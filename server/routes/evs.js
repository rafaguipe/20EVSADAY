const express = require('express');
const { authenticateToken } = require('./auth');
const { db } = require('../database/init');

const router = express.Router();

// Registrar novo EV
router.post('/', authenticateToken, (req, res) => {
  const { score, notes } = req.body;
  const userId = req.user.id;

  // Validações
  if (score === undefined || score < 0 || score > 4) {
    return res.status(400).json({ error: 'Pontuação deve ser entre 0 e 4' });
  }

  // Inserir EV
  db.run(
    'INSERT INTO evs (user_id, score, notes) VALUES (?, ?, ?)',
    [userId, score, notes || ''],
    function(err) {
      if (err) {
        return res.status(500).json({ error: 'Erro interno do servidor' });
      }

      // Verificar badges após inserção
      checkAndAwardBadges(userId);

      res.status(201).json({
        message: 'EV registrado com sucesso',
        ev: {
          id: this.lastID,
          score,
          notes: notes || '',
          created_at: new Date().toISOString()
        }
      });
    }
  );
});

// Listar EVs do usuário
router.get('/my', authenticateToken, (req, res) => {
  const userId = req.user.id;
  const { limit = 50, offset = 0 } = req.query;

  db.all(
    `SELECT id, score, notes, created_at 
     FROM evs 
     WHERE user_id = ? 
     ORDER BY created_at DESC 
     LIMIT ? OFFSET ?`,
    [userId, parseInt(limit), parseInt(offset)],
    (err, evs) => {
      if (err) {
        return res.status(500).json({ error: 'Erro interno do servidor' });
      }

      res.json({ evs });
    }
  );
});

// Estatísticas do usuário
router.get('/stats', authenticateToken, (req, res) => {
  const userId = req.user.id;

  // Estatísticas gerais
  db.get(
    `SELECT 
       COUNT(*) as total_evs,
       AVG(score) as average_score,
       MAX(score) as max_score,
       MIN(score) as min_score,
       SUM(score) as total_points
     FROM evs 
     WHERE user_id = ?`,
    [userId],
    (err, stats) => {
      if (err) {
        return res.status(500).json({ error: 'Erro interno do servidor' });
      }

      // Estatísticas do dia atual
      db.get(
        `SELECT 
           COUNT(*) as today_evs,
           AVG(score) as today_average,
           SUM(score) as today_points
         FROM evs 
         WHERE user_id = ? 
         AND DATE(created_at) = DATE('now')`,
        [userId],
        (err, todayStats) => {
          if (err) {
            return res.status(500).json({ error: 'Erro interno do servidor' });
          }

          // Estatísticas da semana
          db.get(
            `SELECT 
               COUNT(*) as week_evs,
               AVG(score) as week_average,
               SUM(score) as week_points
             FROM evs 
             WHERE user_id = ? 
             AND created_at >= DATE('now', '-7 days')`,
            [userId],
            (err, weekStats) => {
              if (err) {
                return res.status(500).json({ error: 'Erro interno do servidor' });
              }

              // Estatísticas do mês
              db.get(
                `SELECT 
                   COUNT(*) as month_evs,
                   AVG(score) as month_average,
                   SUM(score) as month_points
                 FROM evs 
                 WHERE user_id = ? 
                 AND created_at >= DATE('now', '-30 days')`,
                [userId],
                (err, monthStats) => {
                  if (err) {
                    return res.status(500).json({ error: 'Erro interno do servidor' });
                  }

                  res.json({
                    general: {
                      total_evs: stats.total_evs || 0,
                      average_score: Math.round((stats.average_score || 0) * 100) / 100,
                      max_score: stats.max_score || 0,
                      min_score: stats.min_score || 0,
                      total_points: stats.total_points || 0
                    },
                    today: {
                      evs: todayStats.today_evs || 0,
                      average: Math.round((todayStats.today_average || 0) * 100) / 100,
                      points: todayStats.today_points || 0
                    },
                    week: {
                      evs: weekStats.week_evs || 0,
                      average: Math.round((weekStats.week_average || 0) * 100) / 100,
                      points: weekStats.week_points || 0
                    },
                    month: {
                      evs: monthStats.month_evs || 0,
                      average: Math.round((monthStats.month_average || 0) * 100) / 100,
                      points: monthStats.month_points || 0
                    }
                  });
                }
              );
            }
          );
        }
      );
    }
  );
});

// Histórico por data
router.get('/history', authenticateToken, (req, res) => {
  const userId = req.user.id;
  const { days = 30 } = req.query;

  db.all(
    `SELECT 
       DATE(created_at) as date,
       COUNT(*) as evs_count,
       AVG(score) as average_score,
       SUM(score) as total_points,
       MAX(score) as max_score
     FROM evs 
     WHERE user_id = ? 
     AND created_at >= DATE('now', '-${days} days')
     GROUP BY DATE(created_at)
     ORDER BY date DESC`,
    [userId],
    (err, history) => {
      if (err) {
        return res.status(500).json({ error: 'Erro interno do servidor' });
      }

      res.json({
        history: history.map(day => ({
          ...day,
          average_score: Math.round(day.average_score * 100) / 100
        }))
      });
    }
  );
});

// Função para verificar e conceder badges
function checkAndAwardBadges(userId) {
  // Verificar primeiro EV
  db.get('SELECT COUNT(*) as count FROM evs WHERE user_id = ?', [userId], (err, result) => {
    if (err) return;
    
    if (result.count === 1) {
      awardBadge(userId, 'first_ev', 1);
    }
    
    // Verificar total de EVs
    if (result.count >= 100) {
      awardBadge(userId, 'total_evs', 100);
    }
    if (result.count >= 500) {
      awardBadge(userId, 'total_evs', 500);
    }
  });

  // Verificar EV com pontuação máxima
  db.get('SELECT MAX(score) as max_score FROM evs WHERE user_id = ?', [userId], (err, result) => {
    if (err) return;
    
    if (result.max_score === 4) {
      awardBadge(userId, 'max_score', 4);
    }
  });

  // Verificar dias consecutivos
  checkConsecutiveDays(userId);
}

function awardBadge(userId, requirementType, requirementValue) {
  db.get(
    'SELECT id FROM badges WHERE requirement_type = ? AND requirement_value = ?',
    [requirementType, requirementValue],
    (err, badge) => {
      if (err || !badge) return;

      // Verificar se já tem a badge
      db.get(
        'SELECT id FROM user_badges WHERE user_id = ? AND badge_id = ?',
        [userId, badge.id],
        (err, userBadge) => {
          if (err || userBadge) return;

          // Conceder badge
          db.run(
            'INSERT INTO user_badges (user_id, badge_id) VALUES (?, ?)',
            [userId, badge.id]
          );
        }
      );
    }
  );
}

function checkConsecutiveDays(userId) {
  // Implementação simplificada - pode ser melhorada
  db.all(
    `SELECT DISTINCT DATE(created_at) as date
     FROM evs 
     WHERE user_id = ?
     ORDER BY date DESC`,
    [userId],
    (err, dates) => {
      if (err || dates.length === 0) return;

      let consecutiveDays = 1;
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      for (let i = 1; i < dates.length; i++) {
        const currentDate = new Date(dates[i].date);
        const prevDate = new Date(dates[i - 1].date);
        
        const diffTime = prevDate - currentDate;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays === 1) {
          consecutiveDays++;
        } else {
          break;
        }
      }

      if (consecutiveDays >= 7) {
        awardBadge(userId, 'consecutive_days', 7);
      }
      if (consecutiveDays >= 30) {
        awardBadge(userId, 'consecutive_days', 30);
      }
    }
  );
}

module.exports = router; 