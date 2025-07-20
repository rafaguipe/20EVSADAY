-- Adicionar badge de Fundador para usuários que se inscreveram até 31/7/2025

-- 1. Inserir o badge de Fundador
INSERT INTO badges (name, description, icon) VALUES
  ('Fundador', 'Usuário que se inscreveu durante o período de lançamento (até 31/7/2025)', '🏗️')
ON CONFLICT (name) DO NOTHING;

-- 2. Atribuir o badge de Fundador para todos os usuários que se inscreveram até 31/7/2025
INSERT INTO user_badges (user_id, badge_id, awarded_at)
SELECT 
  p.user_id,
  b.id,
  p.created_at
FROM profiles p
CROSS JOIN badges b
WHERE b.name = 'Fundador'
  AND p.created_at <= '2025-07-31 23:59:59'
  AND NOT EXISTS (
    SELECT 1 FROM user_badges ub 
    WHERE ub.user_id = p.user_id AND ub.badge_id = b.id
  );

-- 3. Verificar quantos usuários receberam o badge
SELECT 
  COUNT(*) as total_founders,
  'Usuários que receberam o badge de Fundador' as description
FROM user_badges ub
JOIN badges b ON ub.badge_id = b.id
WHERE b.name = 'Fundador'; 