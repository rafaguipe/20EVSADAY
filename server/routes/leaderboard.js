const express = require('express');
const { db } = require('../database/init');

const router = express.Router();

// Leaderboard do dia
router.get('/daily', (req, res) => {
  db.all(
    `SELECT 
       u.nickname,
       u.avatar_id,
       COUNT(e.id) as evs_count,
       AVG(e.score) as average_score,
       SUM(e.score) as total_points,
       MAX(e.score) as max_score
     FROM users u
     LEFT JOIN evs e ON u.id = e.user_id 
       AND DATE(e.created_at) = DATE('now')
     GROUP BY u.id, u.nickname, u.avatar_id
     HAVING evs_count > 0
     ORDER BY total_points DESC, average_score DESC
     LIMIT 20`,
    (err, results) => {
      if (err) {
        return res.status(500).json({ error: 'Erro interno do servidor' });
      }

      res.json({
        period: 'daily',
        date: new Date().toISOString().split('T')[0],
        leaderboard: results.map((user, index) => ({
          ...user,
          rank: index + 1,
          average_score: Math.round(user.average_score * 100) / 100
        }))
      });
    }
  );
});

// Leaderboard da semana
router.get('/weekly', (req, res) => {
  db.all(
    `SELECT 
       u.nickname,
       u.avatar_id,
       COUNT(e.id) as evs_count,
       AVG(e.score) as average_score,
       SUM(e.score) as total_points,
       MAX(e.score) as max_score
     FROM users u
     LEFT JOIN evs e ON u.id = e.user_id 
       AND e.created_at >= DATE('now', '-7 days')
     GROUP BY u.id, u.nickname, u.avatar_id
     HAVING evs_count > 0
     ORDER BY total_points DESC, average_score DESC
     LIMIT 20`,
    (err, results) => {
      if (err) {
        return res.status(500).json({ error: 'Erro interno do servidor' });
      }

      res.json({
        period: 'weekly',
        start_date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        end_date: new Date().toISOString().split('T')[0],
        leaderboard: results.map((user, index) => ({
          ...user,
          rank: index + 1,
          average_score: Math.round(user.average_score * 100) / 100
        }))
      });
    }
  );
});

// Leaderboard do mês
router.get('/monthly', (req, res) => {
  db.all(
    `SELECT 
       u.nickname,
       u.avatar_id,
       COUNT(e.id) as evs_count,
       AVG(e.score) as average_score,
       SUM(e.score) as total_points,
       MAX(e.score) as max_score
     FROM users u
     LEFT JOIN evs e ON u.id = e.user_id 
       AND e.created_at >= DATE('now', '-30 days')
     GROUP BY u.id, u.nickname, u.avatar_id
     HAVING evs_count > 0
     ORDER BY total_points DESC, average_score DESC
     LIMIT 20`,
    (err, results) => {
      if (err) {
        return res.status(500).json({ error: 'Erro interno do servidor' });
      }

      res.json({
        period: 'monthly',
        start_date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        end_date: new Date().toISOString().split('T')[0],
        leaderboard: results.map((user, index) => ({
          ...user,
          rank: index + 1,
          average_score: Math.round(user.average_score * 100) / 100
        }))
      });
    }
  );
});

// Leaderboard do ano
router.get('/yearly', (req, res) => {
  db.all(
    `SELECT 
       u.nickname,
       u.avatar_id,
       COUNT(e.id) as evs_count,
       AVG(e.score) as average_score,
       SUM(e.score) as total_points,
       MAX(e.score) as max_score
     FROM users u
     LEFT JOIN evs e ON u.id = e.user_id 
       AND e.created_at >= DATE('now', '-365 days')
     GROUP BY u.id, u.nickname, u.avatar_id
     HAVING evs_count > 0
     ORDER BY total_points DESC, average_score DESC
     LIMIT 20`,
    (err, results) => {
      if (err) {
        return res.status(500).json({ error: 'Erro interno do servidor' });
      }

      res.json({
        period: 'yearly',
        start_date: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        end_date: new Date().toISOString().split('T')[0],
        leaderboard: results.map((user, index) => ({
          ...user,
          rank: index + 1,
          average_score: Math.round(user.average_score * 100) / 100
        }))
      });
    }
  );
});

// Leaderboard de todos os tempos
router.get('/all-time', (req, res) => {
  db.all(
    `SELECT 
       u.nickname,
       u.avatar_id,
       COUNT(e.id) as evs_count,
       AVG(e.score) as average_score,
       SUM(e.score) as total_points,
       MAX(e.score) as max_score,
       MIN(e.created_at) as first_ev,
       MAX(e.created_at) as last_ev
     FROM users u
     LEFT JOIN evs e ON u.id = e.user_id
     GROUP BY u.id, u.nickname, u.avatar_id
     HAVING evs_count > 0
     ORDER BY total_points DESC, average_score DESC
     LIMIT 20`,
    (err, results) => {
      if (err) {
        return res.status(500).json({ error: 'Erro interno do servidor' });
      }

      res.json({
        period: 'all-time',
        leaderboard: results.map((user, index) => ({
          ...user,
          rank: index + 1,
          average_score: Math.round(user.average_score * 100) / 100
        }))
      });
    }
  );
});

// Ranking por consistência (média de pontuação)
router.get('/consistency', (req, res) => {
  db.all(
    `SELECT 
       u.nickname,
       u.avatar_id,
       COUNT(e.id) as evs_count,
       AVG(e.score) as average_score,
       SUM(e.score) as total_points
     FROM users u
     LEFT JOIN evs e ON u.id = e.user_id
     GROUP BY u.id, u.nickname, u.avatar_id
     HAVING evs_count >= 10
     ORDER BY average_score DESC, evs_count DESC
     LIMIT 20`,
    (err, results) => {
      if (err) {
        return res.status(500).json({ error: 'Erro interno do servidor' });
      }

      res.json({
        period: 'consistency',
        min_evs: 10,
        leaderboard: results.map((user, index) => ({
          ...user,
          rank: index + 1,
          average_score: Math.round(user.average_score * 100) / 100
        }))
      });
    }
  );
});

// Ranking por dedicação (mais EVs registrados)
router.get('/dedication', (req, res) => {
  db.all(
    `SELECT 
       u.nickname,
       u.avatar_id,
       COUNT(e.id) as evs_count,
       AVG(e.score) as average_score,
       SUM(e.score) as total_points
     FROM users u
     LEFT JOIN evs e ON u.id = e.user_id
     GROUP BY u.id, u.nickname, u.avatar_id
     HAVING evs_count > 0
     ORDER BY evs_count DESC, average_score DESC
     LIMIT 20`,
    (err, results) => {
      if (err) {
        return res.status(500).json({ error: 'Erro interno do servidor' });
      }

      res.json({
        period: 'dedication',
        leaderboard: results.map((user, index) => ({
          ...user,
          rank: index + 1,
          average_score: Math.round(user.average_score * 100) / 100
        }))
      });
    }
  );
});

module.exports = router; 