-- Adicionar badge para usuários que fizeram pelo menos 1 EV em janeiro de 2026

-- 1. Verificar se o badge já existe
SELECT 
  CASE 
    WHEN EXISTS (SELECT 1 FROM badges WHERE name = 'Janeiro 2026') 
    THEN 'Badge "Janeiro 2026" já existe'
    ELSE 'Badge "Janeiro 2026" não existe - será criado'
  END as status;

-- 2. Inserir o badge de Janeiro 2026 apenas se não existir
INSERT INTO badges (name, description, icon)
SELECT 
  'Janeiro 2026', 
  'Pelo menos 1 EV registrado em janeiro de 2026', 
  '🎊'
WHERE NOT EXISTS (
  SELECT 1 FROM badges WHERE name = 'Janeiro 2026'
);

-- 3. Verificar se o badge foi criado/encontrado
SELECT 
  id,
  name,
  description,
  icon,
  created_at
FROM badges 
WHERE name = 'Janeiro 2026';

-- 4. (Opcional) Atribuir o badge retroativamente para usuários que já fizeram EVs em janeiro de 2026
-- Este comando atribui o badge para usuários que já fizeram EVs em janeiro de 2026
-- Ele só funciona se o badge existir e não atribui duplicatas
INSERT INTO user_badges (user_id, badge_id, awarded_at)
SELECT DISTINCT
  e.user_id,
  b.id,
  MIN(e.created_at) as first_january_ev
FROM evs e
INNER JOIN badges b ON b.name = 'Janeiro 2026'
WHERE e.created_at >= '2026-01-01 00:00:00'
  AND e.created_at < '2026-02-01 00:00:00'
  AND NOT EXISTS (
    SELECT 1 FROM user_badges ub 
    WHERE ub.user_id = e.user_id AND ub.badge_id = b.id
  )
GROUP BY e.user_id, b.id;

-- 5. Verificar quantos usuários receberam o badge
SELECT 
  COUNT(DISTINCT ub.user_id) as total_users,
  'Usuários que receberam o badge de Janeiro 2026' as description
FROM user_badges ub
JOIN badges b ON ub.badge_id = b.id
WHERE b.name = 'Janeiro 2026';

