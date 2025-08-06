-- Script para atribuir o selo "Primeiro EV coletivo" (ID 27)
-- aos usuários que registraram EV entre 11h e 11h10 no dia 6/8/2025
-- Execute este script no Supabase SQL Editor

-- 1. Primeiro, vamos verificar se o selo existe
SELECT 
  'Verificando selo ID 27' as status,
  id,
  name as nome_selo,
  description as descricao
FROM badges 
WHERE id = 27;

-- 2. Verificar usuários que registraram EV no período específico
SELECT 
  'Usuários que registraram EV entre 11h e 11h10 em 6/8/2025' as status,
  COUNT(*) as total_usuarios
FROM evs 
WHERE DATE(created_at) = '2025-08-06'
  AND EXTRACT(HOUR FROM created_at) = 11
  AND EXTRACT(MINUTE FROM created_at) BETWEEN 0 AND 10;

-- 3. Listar usuários que se qualificam para o selo
SELECT 
  e.user_id,
  e.id as ev_id,
  e.score,
  e.created_at,
  p.username,
  CASE WHEN ub.id IS NULL THEN '❌ SEM SELO' ELSE '✅ JÁ TEM SELO' END as status_selo
FROM evs e
LEFT JOIN profiles p ON e.user_id = p.user_id
LEFT JOIN user_badges ub ON e.user_id = ub.user_id AND ub.badge_id = 27
WHERE DATE(e.created_at) = '2025-08-06'
  AND EXTRACT(HOUR FROM e.created_at) = 11
  AND EXTRACT(MINUTE FROM e.created_at) BETWEEN 0 AND 10
ORDER BY e.created_at;

-- 4. Atribuir o selo aos usuários que se qualificam (execute apenas se necessário)
INSERT INTO user_badges (user_id, badge_id, awarded_at)
SELECT DISTINCT
  e.user_id,
  27 as badge_id,
  NOW() as awarded_at
FROM evs e
LEFT JOIN user_badges ub ON e.user_id = ub.user_id AND ub.badge_id = 27
WHERE DATE(e.created_at) = '2025-08-06'
  AND EXTRACT(HOUR FROM e.created_at) = 11
  AND EXTRACT(MINUTE FROM e.created_at) BETWEEN 0 AND 10
  AND ub.id IS NULL; -- Apenas usuários que ainda não têm o selo

-- 5. Verificar resultado da atribuição
SELECT 
  'Resultado da atribuição do selo' as status,
  COUNT(*) as selos_atribuidos
FROM user_badges 
WHERE badge_id = 27;

-- 6. Listar todos os usuários que agora têm o selo
SELECT 
  ub.user_id,
  p.username,
  b.name as nome_selo,
  ub.awarded_at as data_atribuicao
FROM user_badges ub
JOIN badges b ON ub.badge_id = b.id
JOIN profiles p ON ub.user_id = p.user_id
WHERE ub.badge_id = 27
ORDER BY ub.awarded_at;

-- 7. Estatísticas finais
SELECT 
  'Estatísticas do selo "Primeiro EV coletivo"' as titulo,
  COUNT(DISTINCT ub.user_id) as total_usuarios_com_selo,
  (SELECT COUNT(*) FROM evs WHERE DATE(created_at) = '2025-08-06' AND EXTRACT(HOUR FROM created_at) = 11 AND EXTRACT(MINUTE FROM created_at) BETWEEN 0 AND 10) as total_evs_no_periodo,
  (SELECT COUNT(DISTINCT user_id) FROM evs WHERE DATE(created_at) = '2025-08-06' AND EXTRACT(HOUR FROM created_at) = 11 AND EXTRACT(MINUTE FROM created_at) BETWEEN 0 AND 10) as total_usuarios_no_periodo
FROM user_badges ub
WHERE ub.badge_id = 27; 