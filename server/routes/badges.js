const express = require('express');
const { authenticateToken } = require('./auth');
const { db } = require('../database/init');

const router = express.Router();

// Listar todas as badges disponíveis
router.get('/', (req, res) => {
  db.all(
    'SELECT id, name, description, icon, requirement_type, requirement_value FROM badges ORDER BY requirement_value ASC',
    (err, badges) => {
      if (err) {
        return res.status(500).json({ error: 'Erro interno do servidor' });
      }

      res.json({ badges });
    }
  );
});

// Listar badges do usuário
router.get('/my', authenticateToken, (req, res) => {
  const userId = req.user.id;

  db.all(
    `SELECT 
       b.id,
       b.name,
       b.description,
       b.icon,
       b.requirement_type,
       b.requirement_value,
       ub.earned_at
     FROM badges b
     INNER JOIN user_badges ub ON b.id = ub.badge_id
     WHERE ub.user_id = ?
     ORDER BY ub.earned_at DESC`,
    [userId],
    (err, userBadges) => {
      if (err) {
        return res.status(500).json({ error: 'Erro interno do servidor' });
      }

      // Buscar todas as badges para mostrar progresso
      db.all(
        'SELECT id, name, description, icon, requirement_type, requirement_value FROM badges ORDER BY requirement_value ASC',
        (err, allBadges) => {
          if (err) {
            return res.status(500).json({ error: 'Erro interno do servidor' });
          }

          // Calcular progresso para cada badge
          const badgesWithProgress = allBadges.map(badge => {
            const earned = userBadges.find(ub => ub.id === badge.id);
            return {
              ...badge,
              earned: !!earned,
              earned_at: earned ? earned.earned_at : null
            };
          });

          res.json({
            earned_badges: userBadges,
            all_badges: badgesWithProgress,
            total_earned: userBadges.length,
            total_available: allBadges.length
          });
        }
      );
    }
  );
});

// Verificar progresso das badges
router.get('/progress', authenticateToken, (req, res) => {
  const userId = req.user.id;

  // Buscar estatísticas do usuário
  db.get(
    `SELECT 
       COUNT(*) as total_evs,
       AVG(score) as average_score,
       MAX(score) as max_score,
       SUM(score) as total_points
     FROM evs 
     WHERE user_id = ?`,
    [userId],
    (err, stats) => {
      if (err) {
        return res.status(500).json({ error: 'Erro interno do servidor' });
      }

      // Buscar dias consecutivos
      db.all(
        `SELECT DISTINCT DATE(created_at) as date
         FROM evs 
         WHERE user_id = ?
         ORDER BY date DESC`,
        [userId],
        (err, dates) => {
          if (err) {
            return res.status(500).json({ error: 'Erro interno do servidor' });
          }

          let consecutiveDays = 0;
          if (dates.length > 0) {
            consecutiveDays = 1;
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
          }

          // Buscar todas as badges
          db.all(
            'SELECT id, name, requirement_type, requirement_value FROM badges',
            (err, badges) => {
              if (err) {
                return res.status(500).json({ error: 'Erro interno do servidor' });
              }

              // Calcular progresso para cada badge
              const progress = badges.map(badge => {
                let current = 0;
                let max = badge.requirement_value;
                let percentage = 0;

                switch (badge.requirement_type) {
                  case 'first_ev':
                    current = stats.total_evs > 0 ? 1 : 0;
                    max = 1;
                    break;
                  case 'total_evs':
                    current = stats.total_evs;
                    break;
                  case 'max_score':
                    current = stats.max_score;
                    break;
                  case 'consecutive_days':
                    current = consecutiveDays;
                    break;
                  case 'average_score':
                    current = Math.round((stats.average_score || 0) * 10);
                    break;
                }

                percentage = Math.min((current / max) * 100, 100);

                return {
                  badge_id: badge.id,
                  badge_name: badge.name,
                  requirement_type: badge.requirement_type,
                  current,
                  max,
                  percentage: Math.round(percentage)
                };
              });

              res.json({
                stats: {
                  total_evs: stats.total_evs || 0,
                  average_score: Math.round((stats.average_score || 0) * 100) / 100,
                  max_score: stats.max_score || 0,
                  total_points: stats.total_points || 0,
                  consecutive_days: consecutiveDays
                },
                progress
              });
            }
          );
        }
      );
    }
  );
});

// Badges recentes (últimas 5 conquistadas)
router.get('/recent', authenticateToken, (req, res) => {
  const userId = req.user.id;

  db.all(
    `SELECT 
       b.name,
       b.description,
       b.icon,
       ub.earned_at
     FROM badges b
     INNER JOIN user_badges ub ON b.id = ub.badge_id
     WHERE ub.user_id = ?
     ORDER BY ub.earned_at DESC
     LIMIT 5`,
    [userId],
    (err, recentBadges) => {
      if (err) {
        return res.status(500).json({ error: 'Erro interno do servidor' });
      }

      res.json({ recent_badges: recentBadges });
    }
  );
});

// Próximas badges a serem conquistadas
router.get('/next', authenticateToken, (req, res) => {
  const userId = req.user.id;

  // Buscar estatísticas do usuário
  db.get(
    `SELECT 
       COUNT(*) as total_evs,
       AVG(score) as average_score,
       MAX(score) as max_score
     FROM evs 
     WHERE user_id = ?`,
    [userId],
    (err, stats) => {
      if (err) {
        return res.status(500).json({ error: 'Erro interno do servidor' });
      }

      // Buscar badges não conquistadas
      db.all(
        `SELECT 
           b.id,
           b.name,
           b.description,
           b.icon,
           b.requirement_type,
           b.requirement_value
         FROM badges b
         WHERE b.id NOT IN (
           SELECT badge_id FROM user_badges WHERE user_id = ?
         )
         ORDER BY b.requirement_value ASC`,
        [userId],
        (err, unearnedBadges) => {
          if (err) {
            return res.status(500).json({ error: 'Erro interno do servidor' });
          }

          // Filtrar badges próximas de serem conquistadas
          const nextBadges = unearnedBadges.filter(badge => {
            switch (badge.requirement_type) {
              case 'total_evs':
                return stats.total_evs >= badge.requirement_value * 0.8; // 80% do progresso
              case 'max_score':
                return stats.max_score >= badge.requirement_value;
              case 'average_score':
                return (stats.average_score || 0) * 10 >= badge.requirement_value * 0.8;
              default:
                return false;
            }
          }).slice(0, 3); // Top 3 próximas

          res.json({ next_badges: nextBadges });
        }
      );
    }
  );
});

module.exports = router; 