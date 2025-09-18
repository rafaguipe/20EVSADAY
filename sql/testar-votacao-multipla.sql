-- Script para testar o novo sistema de votação múltipla
-- Execute este script no SQL Editor do Supabase

-- 1. Verificar se as funções foram criadas corretamente
SELECT 
  'Verificação das Funções' as status,
  routine_name,
  routine_type
FROM information_schema.routines
WHERE routine_schema = 'public'
  AND routine_name IN ('check_user_vote_status', 'get_mascot_voting_results', 'get_user_votes', 'check_user_vote_limit')
ORDER BY routine_name;

-- 2. Verificar se o trigger foi criado
SELECT 
  'Verificação do Trigger' as status,
  trigger_name,
  event_manipulation,
  action_timing
FROM information_schema.triggers
WHERE trigger_name = 'check_vote_limit_trigger';

-- 3. Verificar se as políticas RLS foram atualizadas
SELECT 
  'Verificação das Políticas RLS' as status,
  policyname,
  cmd,
  permissive
FROM pg_policies
WHERE tablename = 'mascot_votes'
ORDER BY policyname;

-- 4. Testar a função de status de voto (substitua pelo UUID de um usuário real)
-- SELECT 
--   'Teste de Status de Voto' as status,
--   *
-- FROM check_user_vote_status('00000000-0000-0000-0000-000000000000');

-- 5. Verificar estrutura da tabela mascot_votes
SELECT 
  'Estrutura da Tabela mascot_votes' as status,
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'mascot_votes'
ORDER BY ordinal_position;

-- 6. Verificar se ainda existe a constraint UNIQUE antiga
SELECT 
  'Verificação de Constraints' as status,
  constraint_name,
  constraint_type
FROM information_schema.table_constraints
WHERE table_name = 'mascot_votes'
  AND constraint_type = 'UNIQUE';

-- 7. Contar registros atuais
SELECT 
  'Contagem Atual' as status,
  COUNT(*) as total_votos,
  COUNT(DISTINCT user_id) as usuarios_que_votaram,
  COUNT(DISTINCT mascot_option_id) as opcoes_votadas
FROM mascot_votes;

-- 8. Verificar se há usuários com mais de 3 votos (não deveria haver)
SELECT 
  'Verificação de Limite' as status,
  user_id,
  COUNT(*) as total_votos
FROM mascot_votes
GROUP BY user_id
HAVING COUNT(*) > 3
ORDER BY total_votos DESC;

-- 9. Verificar se há usuários com votos duplicados na mesma opção (não deveria haver)
SELECT 
  'Verificação de Duplicatas' as status,
  user_id,
  mascot_option_id,
  COUNT(*) as votos_duplicados
FROM mascot_votes
GROUP BY user_id, mascot_option_id
HAVING COUNT(*) > 1
ORDER BY votos_duplicados DESC;

-- 10. Testar a função de resultados
SELECT 
  'Teste de Resultados' as status,
  *
FROM get_mascot_voting_results()
LIMIT 10;

-- 11. Verificar se as opções de mascote ainda existem
SELECT 
  'Opções de Mascote' as status,
  COUNT(*) as total_opcoes,
  MIN(name) as primeira_opcao,
  MAX(name) as ultima_opcao
FROM mascot_options;

-- 12. Mostrar algumas opções de exemplo
SELECT 
  'Exemplos de Opções' as status,
  id,
  name,
  created_at
FROM mascot_options
ORDER BY id
LIMIT 10;
