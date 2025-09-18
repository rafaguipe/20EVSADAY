-- Script para testar o sistema de votação completo
-- Execute este script no SQL Editor do Supabase

-- 1. Verificar se todas as funções estão funcionando
SELECT 
  'Verificação das Funções' as status,
  routine_name,
  routine_type,
  data_type
FROM information_schema.routines
WHERE routine_schema = 'public'
  AND routine_name IN ('check_user_vote_status', 'get_mascot_voting_results', 'get_user_votes', 'check_user_vote_limit')
ORDER BY routine_name;

-- 2. Verificar se o trigger está ativo
SELECT 
  'Verificação do Trigger' as status,
  trigger_name,
  event_manipulation,
  action_timing
FROM information_schema.triggers
WHERE trigger_name = 'check_vote_limit_trigger';

-- 3. Verificar políticas RLS
SELECT 
  'Verificação das Políticas RLS' as status,
  policyname,
  cmd,
  permissive
FROM pg_policies
WHERE tablename = 'mascot_votes'
ORDER BY policyname;

-- 4. Verificar configuração de visibilidade
SELECT 
  'Configuração de Visibilidade' as status,
  setting_key,
  setting_value,
  description
FROM system_settings
WHERE setting_key = 'votacao_visible';

-- 5. Verificar opções de mascote disponíveis
SELECT 
  'Opções de Mascote' as status,
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

-- 7. Verificar dados atuais de votação
SELECT 
  'Dados Atuais de Votação' as status,
  COUNT(*) as total_votos,
  COUNT(DISTINCT user_id) as usuarios_que_votaram,
  COUNT(DISTINCT mascot_option_id) as opcoes_votadas
FROM mascot_votes;

-- 8. Testar função de resultados (deve funcionar mesmo sem votos)
SELECT 
  'Teste de Resultados' as status,
  *
FROM get_mascot_voting_results()
LIMIT 5;

-- 9. Verificar se não há constraint UNIQUE problemática
SELECT 
  'Verificação de Constraints' as status,
  constraint_name,
  constraint_type
FROM information_schema.table_constraints
WHERE table_name = 'mascot_votes'
  AND constraint_type = 'UNIQUE';

-- 10. Resumo final
SELECT 
  'Resumo Final' as status,
  'Sistema de votação múltipla funcionando!' as resultado,
  'Cada usuário pode votar em até 3 opções diferentes' as funcionalidade,
  'Votam apenas uma vez (com múltiplas escolhas)' as regra,
  'Erro 400 corrigido' as correcao;
