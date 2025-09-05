-- Atribuir badge de Iniciante Consciencial para usuários que já têm EVs mas não receberam o badge

-- 1. Atribuir badge de Iniciante Consciencial para usuários que já têm EVs
INSERT INTO user_badges (user_id, badge_id, awarded_at)
SELECT 
  ev.user_id,
  b.id,
  MIN(ev.created_at) as first_ev_date
FROM evs ev
CROSS JOIN badges b
WHERE b.name = 'Iniciante Consciencial'
  AND NOT EXISTS (
    SELECT 1 FROM user_badges ub 
    WHERE ub.user_id = ev.user_id AND ub.badge_id = b.id
  )
GROUP BY ev.user_id, b.id;

-- 2. Verificar quantos usuários receberam o badge de Iniciante Consciencial
SELECT 
  COUNT(*) as total_iniciantes,
  'Usuários que receberam o badge de Iniciante Consciencial' as description
FROM user_badges ub
JOIN badges b ON ub.badge_id = b.id
WHERE b.name = 'Iniciante Consciencial'; 