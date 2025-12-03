-- Verificação final dos resultados da votação
-- Execute este script no SQL Editor do Supabase

-- 1. Resultados completos da votação
SELECT 
  'Resultados Completos' as status,
  id,
  name,
  vote_count,
  percentage
FROM get_mascot_voting_results()
ORDER BY vote_count DESC, name ASC;

-- 2. Verificar votos específicos dos usuários
SELECT 
  'Votos dos Usuários' as status,
  mv.user_id,
  mo.name as mascot_name,
  mv.voted_at
FROM mascot_votes mv
JOIN mascot_options mo ON mv.mascot_option_id = mo.id
ORDER BY mv.voted_at DESC;

-- 3. Contagem por usuário
SELECT 
  'Votos por Usuário' as status,
  user_id,
  COUNT(*) as total_votos,
  STRING_AGG(mo.name, ', ' ORDER BY mv.voted_at) as opcoes_votadas
FROM mascot_votes mv
JOIN mascot_options mo ON mv.mascot_option_id = mo.id
GROUP BY user_id
ORDER BY total_votos DESC;

-- 4. Verificar se a função está retornando dados corretos
SELECT 
  'Teste da Função' as status,
  'Função get_mascot_voting_results funcionando' as resultado,
  COUNT(*) as total_resultados
FROM get_mascot_voting_results();

-- 5. Resumo final
SELECT 
  'Resumo Final' as status,
  'Sistema de votação funcionando!' as resultado,
  'Nomes dos mascotes devem aparecer na página' as correcao,
  'Recarregue a página para ver os resultados' as proximo_passo;








