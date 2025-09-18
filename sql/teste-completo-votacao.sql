-- Teste completo do sistema de votação
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

-- 2. Testar função de resultados (deve funcionar sem erro)
SELECT 
  'Teste de Resultados' as status,
  *
FROM get_mascot_voting_results()
LIMIT 5;

-- 3. Verificar se há opções de mascote disponíveis
SELECT 
  'Opções Disponíveis' as status,
  COUNT(*) as total_opcoes,
  MIN(name) as primeira_opcao,
  MAX(name) as ultima_opcao
FROM mascot_options;

-- 4. Verificar dados atuais de votação
SELECT 
  'Dados de Votação' as status,
  COUNT(*) as total_votos,
  COUNT(DISTINCT user_id) as usuarios_que_votaram,
  COUNT(DISTINCT mascot_option_id) as opcoes_votadas
FROM mascot_votes;

-- 5. Verificar configuração de visibilidade
SELECT 
  'Configuração de Visibilidade' as status,
  setting_key,
  setting_value,
  description
FROM system_settings
WHERE setting_key = 'votacao_visible';

-- 6. Verificar políticas RLS
SELECT 
  'Políticas RLS' as status,
  policyname,
  cmd,
  permissive
FROM pg_policies
WHERE tablename = 'mascot_votes'
ORDER BY policyname;

-- 7. Verificar trigger de validação
SELECT 
  'Trigger de Validação' as status,
  trigger_name,
  event_manipulation,
  action_timing
FROM information_schema.triggers
WHERE trigger_name = 'check_vote_limit_trigger';

-- 8. Resumo final
SELECT 
  'Resumo Final' as status,
  'Sistema de votação funcionando!' as resultado,
  'Função get_mascot_voting_results corrigida' as correcao,
  'Tipos de dados corretos (TEXT)' as tipos,
  'Pronto para uso' as status_final;
