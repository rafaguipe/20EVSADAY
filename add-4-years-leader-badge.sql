-- Adicionar badge para líderes dos 4 anos de fundação (1/7/2025 a 31/7/2025)

-- 1. Inserir o badge de líder dos 4 anos
INSERT INTO badges (name, description, icon) VALUES
  ('Líder 4 Anos de Fundação', 'Registrou EVs durante o período de fundação de 4 anos (1/7/2025 a 31/7/2025)', '🏆')
ON CONFLICT (name) DO NOTHING;

-- 2. Atribuir o badge para usuários que registraram EVs no período de fundação
INSERT INTO user_badges (user_id, badge_id, awarded_at)
SELECT 
  ev.user_id,
  b.id,
  MIN(ev.created_at) as first_foundation_ev
FROM evs ev
CROSS JOIN badges b
WHERE b.name = 'Líder 4 Anos de Fundação'
  AND NOT EXISTS (
    SELECT 1 FROM user_badges ub 
    WHERE ub.user_id = ev.user_id AND ub.badge_id = b.id
  )
  AND ev.created_at >= '2025-07-01 00:00:00'
  AND ev.created_at <= '2025-07-31 23:59:59'
GROUP BY ev.user_id, b.id;

-- 3. Verificar quantos usuários receberam o badge
SELECT 
  COUNT(*) as total_lideres_4_anos,
  'Usuários que receberam o badge de Líder 4 Anos de Fundação' as description
FROM user_badges ub
JOIN badges b ON ub.badge_id = b.id
WHERE b.name = 'Líder 4 Anos de Fundação';

-- 4. Mostrar estatísticas do período de fundação
SELECT 
  COUNT(DISTINCT user_id) as usuarios_ativos_fundacao,
  COUNT(*) as total_evs_fundacao,
  'EVs registrados durante o período de fundação (1/7/2025 a 31/7/2025)' as description
FROM evs
WHERE created_at >= '2025-07-01 00:00:00'
  AND created_at <= '2025-07-31 23:59:59'; 