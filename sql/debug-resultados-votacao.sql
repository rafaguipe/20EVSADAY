-- Debug dos resultados da votação
-- Execute este script no SQL Editor do Supabase

-- 1. Verificar estrutura da função
SELECT 
  'Estrutura da Função' as status,
  parameter_name,
  data_type
FROM information_schema.parameters
WHERE specific_name = (
  SELECT specific_name 
  FROM information_schema.routines 
  WHERE routine_name = 'get_mascot_voting_results'
)
ORDER BY ordinal_position;

-- 2. Testar a função diretamente
SELECT 
  'Teste da Função' as status,
  id,
  name,
  vote_count,
  percentage
FROM get_mascot_voting_results()
ORDER BY vote_count DESC
LIMIT 10;

-- 3. Verificar dados brutos das tabelas
SELECT 
  'Dados Brutos - Opções' as status,
  id,
  name,
  created_at
FROM mascot_options
ORDER BY id
LIMIT 10;

-- 4. Verificar dados brutos dos votos
SELECT 
  'Dados Brutos - Votos' as status,
  mv.id,
  mv.user_id,
  mv.mascot_option_id,
  mo.name as mascot_name,
  mv.voted_at
FROM mascot_votes mv
JOIN mascot_options mo ON mv.mascot_option_id = mo.id
ORDER BY mv.voted_at DESC
LIMIT 10;

-- 5. Verificar contagem de votos por opção
SELECT 
  'Contagem por Opção' as status,
  mo.id,
  mo.name,
  COUNT(mv.id) as total_votos
FROM mascot_options mo
LEFT JOIN mascot_votes mv ON mo.id = mv.mascot_option_id
GROUP BY mo.id, mo.name
ORDER BY total_votos DESC
LIMIT 10;

-- 6. Verificar se há dados de teste
SELECT 
  'Verificação de Dados' as status,
  (SELECT COUNT(*) FROM mascot_options) as total_opcoes,
  (SELECT COUNT(*) FROM mascot_votes) as total_votos,
  (SELECT COUNT(DISTINCT user_id) FROM mascot_votes) as usuarios_que_votaram;
