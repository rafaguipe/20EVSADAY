-- Adicionar badge para 20 EVs em um dia

-- 1. Inserir o badge de 20 EVs diários
INSERT INTO badges (name, description, icon) VALUES
  ('Mestre Diário', 'Registrou 20 EVs em um único dia', '⚡')
ON CONFLICT (name) DO NOTHING;

-- 2. Atribuir o badge para usuários que já fizeram 20 EVs em um dia
INSERT INTO user_badges (user_id, badge_id, awarded_at)
SELECT 
  ev.user_id,
  b.id,
  MIN(ev.created_at) as first_20_ev_day
FROM evs ev
CROSS JOIN badges b
WHERE b.name = 'Mestre Diário'
  AND NOT EXISTS (
    SELECT 1 FROM user_badges ub 
    WHERE ub.user_id = ev.user_id AND ub.badge_id = b.id
  )
  AND EXISTS (
    SELECT 1 FROM (
      SELECT 
        user_id,
        DATE(created_at) as ev_date,
        COUNT(*) as daily_evs
      FROM evs
      GROUP BY user_id, DATE(created_at)
      HAVING COUNT(*) >= 20
    ) daily_stats
    WHERE daily_stats.user_id = ev.user_id
  )
GROUP BY ev.user_id, b.id;

-- 3. Verificar quantos usuários receberam o badge
SELECT 
  COUNT(*) as total_mestres_diarios,
  'Usuários que receberam o badge de Mestre Diário' as description
FROM user_badges ub
JOIN badges b ON ub.badge_id = b.id
WHERE b.name = 'Mestre Diário'; 