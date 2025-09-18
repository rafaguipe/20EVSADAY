-- Script para resetar a votação do mascote
-- Execute este script no SQL Editor do Supabase

-- 1. Verificar dados atuais antes do reset
SELECT 
  'Dados Antes do Reset' as status,
  COUNT(*) as total_votos,
  COUNT(DISTINCT user_id) as usuarios_que_votaram,
  COUNT(DISTINCT mascot_option_id) as opcoes_votadas
FROM mascot_votes;

-- 2. Mostrar ranking atual antes do reset
SELECT 
  'Ranking Antes do Reset' as status,
  mo.name as nome_mascote,
  COUNT(mv.id) as total_votos,
  ROUND(COUNT(mv.id) * 100.0 / (SELECT COUNT(*) FROM mascot_votes), 2) as percentual
FROM mascot_options mo
LEFT JOIN mascot_votes mv ON mo.id = mv.mascot_option_id
GROUP BY mo.id, mo.name
ORDER BY total_votos DESC;

-- 3. Resetar a votação (apagar todos os votos)
DELETE FROM mascot_votes;

-- 4. Verificar se o reset foi bem-sucedido
SELECT 
  'Dados Após Reset' as status,
  COUNT(*) as total_votos,
  COUNT(DISTINCT user_id) as usuarios_que_votaram,
  COUNT(DISTINCT mascot_option_id) as opcoes_votadas
FROM mascot_votes;

-- 5. Verificar se as opções ainda existem
SELECT 
  'Opções Disponíveis' as status,
  COUNT(*) as total_opcoes,
  MIN(name) as primeira_opcao,
  MAX(name) as ultima_opcao
FROM mascot_options;

-- 6. Mostrar algumas opções de exemplo
SELECT 
  'Exemplos de Opções' as status,
  id,
  name,
  created_at
FROM mascot_options
ORDER BY id
LIMIT 10;
