-- Migration: Índices para performance das queries de EV
-- Aplicar no Supabase SQL Editor

-- Índice composto para queries por usuário + data (streak, today EVs, history, count diário)
CREATE INDEX IF NOT EXISTS idx_evs_user_created
  ON evs (user_id, created_at DESC);

-- Índice para queries por usuário + score (avg, max, min)
CREATE INDEX IF NOT EXISTS idx_evs_user_score
  ON evs (user_id, score);

-- Índice para evitar duplicação de badges
CREATE INDEX IF NOT EXISTS idx_user_badges_user_badge
  ON user_badges (user_id, badge_id);
