-- Script para verificar os cálculos do ranking
-- Execute este script no SQL Editor do Supabase

-- 1. Verificar dados gerais da tabela evs
SELECT 
  'Dados Gerais' as categoria,
  COUNT(*) as total_evs,
  SUM(score) as total_pontos,
  AVG(score) as media_geral,
  MIN(created_at) as primeiro_ev,
  MAX(created_at) as ultimo_ev
FROM evs;

-- 2. Verificar dados por usuário (todos os tempos)
SELECT 
  'Por Usuário - Todos os Tempos' as categoria,
  user_id,
  COUNT(*) as total_evs,
  SUM(score) as total_pontos,
  AVG(score) as media_usuario,
  MIN(score) as min_score,
  MAX(score) as max_score,
  MIN(created_at) as primeiro_ev,
  MAX(created_at) as ultimo_ev
FROM evs
GROUP BY user_id
ORDER BY total_pontos DESC;

-- 3. Verificar dados de 2025
SELECT 
  'Por Usuário - 2025' as categoria,
  user_id,
  COUNT(*) as total_evs,
  SUM(score) as total_pontos,
  AVG(score) as media_usuario,
  MIN(score) as min_score,
  MAX(score) as max_score,
  MIN(created_at) as primeiro_ev,
  MAX(created_at) as ultimo_ev
FROM evs
WHERE created_at >= '2025-01-01T00:00:00.000Z'
GROUP BY user_id
ORDER BY total_pontos DESC;

-- 4. Verificar dados anuais (ano atual)
SELECT 
  'Por Usuário - Ano Atual' as categoria,
  user_id,
  COUNT(*) as total_evs,
  SUM(score) as total_pontos,
  AVG(score) as media_usuario,
  MIN(score) as min_score,
  MAX(score) as max_score,
  MIN(created_at) as primeiro_ev,
  MAX(created_at) as ultimo_ev
FROM evs
WHERE created_at >= DATE_TRUNC('year', NOW())
GROUP BY user_id
ORDER BY total_pontos DESC;

-- 5. Verificar dados mensais (mês atual)
SELECT 
  'Por Usuário - Mês Atual' as categoria,
  user_id,
  COUNT(*) as total_evs,
  SUM(score) as total_pontos,
  AVG(score) as media_usuario,
  MIN(score) as min_score,
  MAX(score) as max_score,
  MIN(created_at) as primeiro_ev,
  MAX(created_at) as ultimo_ev
FROM evs
WHERE created_at >= DATE_TRUNC('month', NOW())
GROUP BY user_id
ORDER BY total_pontos DESC;

-- 6. Verificar dados semanais (última semana)
SELECT 
  'Por Usuário - Última Semana' as categoria,
  user_id,
  COUNT(*) as total_evs,
  SUM(score) as total_pontos,
  AVG(score) as media_usuario,
  MIN(score) as min_score,
  MAX(score) as max_score,
  MIN(created_at) as primeiro_ev,
  MAX(created_at) as ultimo_ev
FROM evs
WHERE created_at >= NOW() - INTERVAL '7 days'
GROUP BY user_id
ORDER BY total_pontos DESC;

-- 7. Verificar dados diários (hoje)
SELECT 
  'Por Usuário - Hoje' as categoria,
  user_id,
  COUNT(*) as total_evs,
  SUM(score) as total_pontos,
  AVG(score) as media_usuario,
  MIN(score) as min_score,
  MAX(score) as max_score,
  MIN(created_at) as primeiro_ev,
  MAX(created_at) as ultimo_ev
FROM evs
WHERE created_at >= DATE_TRUNC('day', NOW())
GROUP BY user_id
ORDER BY total_pontos DESC;

-- 8. Verificar se há EVs com score NULL ou 0
SELECT 
  'EVs com Score NULL ou 0' as categoria,
  COUNT(*) as total_evs,
  SUM(CASE WHEN score IS NULL THEN 1 ELSE 0 END) as score_null,
  SUM(CASE WHEN score = 0 THEN 1 ELSE 0 END) as score_zero,
  SUM(CASE WHEN score < 0 THEN 1 ELSE 0 END) as score_negativo
FROM evs;

-- 9. Verificar se há EVs com user_id NULL
SELECT 
  'EVs com User ID NULL' as categoria,
  COUNT(*) as total_evs,
  SUM(CASE WHEN user_id IS NULL THEN 1 ELSE 0 END) as user_id_null
FROM evs;

-- 10. Verificar se há EVs com created_at NULL
SELECT 
  'EVs com Created At NULL' as categoria,
  COUNT(*) as total_evs,
  SUM(CASE WHEN created_at IS NULL THEN 1 ELSE 0 END) as created_at_null
FROM evs;

-- 11. Verificar se há EVs duplicados (mesmo user_id, score e created_at)
SELECT 
  'EVs Duplicados' as categoria,
  user_id,
  score,
  created_at,
  COUNT(*) as duplicatas
FROM evs
GROUP BY user_id, score, created_at
HAVING COUNT(*) > 1
ORDER BY duplicatas DESC;

-- 12. Verificar se há EVs com created_at no futuro
SELECT 
  'EVs com Created At no Futuro' as categoria,
  COUNT(*) as total_evs,
  MIN(created_at) as primeiro_futuro,
  MAX(created_at) as ultimo_futuro
FROM evs
WHERE created_at > NOW();

-- 13. Verificar se há EVs com created_at muito antigo
SELECT 
  'EVs com Created At Muito Antigo' as categoria,
  COUNT(*) as total_evs,
  MIN(created_at) as primeiro_antigo,
  MAX(created_at) as ultimo_antigo
FROM evs
WHERE created_at < '2020-01-01T00:00:00.000Z';

-- 14. Verificar se há EVs com score muito alto (possível erro)
SELECT 
  'EVs com Score Muito Alto' as categoria,
  COUNT(*) as total_evs,
  MIN(score) as min_score,
  MAX(score) as max_score,
  AVG(score) as media_score
FROM evs
WHERE score > 1000;

-- 15. Verificar se há EVs com score muito baixo (possível erro)
SELECT 
  'EVs com Score Muito Baixo' as categoria,
  COUNT(*) as total_evs,
  MIN(score) as min_score,
  MAX(score) as max_score,
  AVG(score) as media_score
FROM evs
WHERE score < 0;

-- 16. Verificar se há EVs com created_at igual a NOW() (possível erro)
SELECT 
  'EVs com Created At = NOW()' as categoria,
  COUNT(*) as total_evs,
  MIN(created_at) as primeiro_igual,
  MAX(created_at) as ultimo_igual
FROM evs
WHERE created_at = NOW();

-- 17. Verificar se há EVs com created_at igual a NOW() - 1 segundo (possível erro)
SELECT 
  'EVs com Created At = NOW() - 1s' as categoria,
  COUNT(*) as total_evs,
  MIN(created_at) as primeiro_igual,
  MAX(created_at) as ultimo_igual
FROM evs
WHERE created_at = NOW() - INTERVAL '1 second';

-- 18. Verificar se há EVs com created_at igual a NOW() - 1 minuto (possível erro)
SELECT 
  'EVs com Created At = NOW() - 1min' as categoria,
  COUNT(*) as total_evs,
  MIN(created_at) as primeiro_igual,
  MAX(created_at) as ultimo_igual
FROM evs
WHERE created_at = NOW() - INTERVAL '1 minute';

-- 19. Verificar se há EVs com created_at igual a NOW() - 1 hora (possível erro)
SELECT 
  'EVs com Created At = NOW() - 1h' as categoria,
  COUNT(*) as total_evs,
  MIN(created_at) as primeiro_igual,
  MAX(created_at) as ultimo_igual
FROM evs
WHERE created_at = NOW() - INTERVAL '1 hour';

-- 20. Verificar se há EVs com created_at igual a NOW() - 1 dia (possível erro)
SELECT 
  'EVs com Created At = NOW() - 1d' as categoria,
  COUNT(*) as total_evs,
  MIN(created_at) as primeiro_igual,
  MAX(created_at) as ultimo_igual
FROM evs
WHERE created_at = NOW() - INTERVAL '1 day';
