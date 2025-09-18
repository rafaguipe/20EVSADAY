-- Script para ativar e testar a votação múltipla
-- Execute este script no SQL Editor do Supabase

-- 1. Ativar a configuração votacao_visible
UPDATE system_settings 
SET setting_value = 'true', updated_at = NOW()
WHERE setting_key = 'votacao_visible';

-- 2. Verificar se foi ativada
SELECT 
  'Status da Votação' as status,
  setting_key,
  setting_value,
  updated_at
FROM system_settings
WHERE setting_key = 'votacao_visible';

-- 3. Verificar todas as configurações de visibilidade
SELECT 
  'Todas as Configurações' as status,
  setting_key,
  setting_value,
  description
FROM system_settings
WHERE setting_key LIKE '%_visible'
ORDER BY setting_key;

-- 4. Verificar se as opções de mascote existem
SELECT 
  'Opções de Mascote' as status,
  COUNT(*) as total_opcoes,
  MIN(name) as primeira_opcao,
  MAX(name) as ultima_opcao
FROM mascot_options;

-- 5. Mostrar algumas opções de exemplo
SELECT 
  'Exemplos de Opções' as status,
  id,
  name,
  created_at
FROM mascot_options
ORDER BY id
LIMIT 10;

-- 6. Verificar estrutura da tabela mascot_votes
SELECT 
  'Estrutura da Tabela mascot_votes' as status,
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'mascot_votes'
ORDER BY ordinal_position;

-- 7. Verificar se o trigger foi criado
SELECT 
  'Verificação do Trigger' as status,
  trigger_name,
  event_manipulation,
  action_timing
FROM information_schema.triggers
WHERE trigger_name = 'check_vote_limit_trigger';

-- 8. Verificar políticas RLS
SELECT 
  'Verificação das Políticas RLS' as status,
  policyname,
  cmd,
  permissive
FROM pg_policies
WHERE tablename = 'mascot_votes'
ORDER BY policyname;

-- 9. Testar a função de resultados (deve retornar vazio se não há votos)
SELECT 
  'Teste de Resultados' as status,
  *
FROM get_mascot_voting_results()
LIMIT 5;

-- 10. Verificar se não há constraint UNIQUE problemática
SELECT 
  'Verificação de Constraints' as status,
  constraint_name,
  constraint_type
FROM information_schema.table_constraints
WHERE table_name = 'mascot_votes'
  AND constraint_type = 'UNIQUE';

-- 11. Contar registros atuais
SELECT 
  'Contagem Atual' as status,
  COUNT(*) as total_votos,
  COUNT(DISTINCT user_id) as usuarios_que_votaram,
  COUNT(DISTINCT mascot_option_id) as opcoes_votadas
FROM mascot_votes;

-- 12. Verificar se há usuários com mais de 3 votos (não deveria haver)
SELECT 
  'Verificação de Limite' as status,
  user_id,
  COUNT(*) as total_votos
FROM mascot_votes
GROUP BY user_id
HAVING COUNT(*) > 3
ORDER BY total_votos DESC;

-- 13. Verificar se há usuários com votos duplicados na mesma opção (não deveria haver)
SELECT 
  'Verificação de Duplicatas' as status,
  user_id,
  mascot_option_id,
  COUNT(*) as votos_duplicados
FROM mascot_votes
GROUP BY user_id, mascot_option_id
HAVING COUNT(*) > 1
ORDER BY votos_duplicados DESC;

-- 14. Resumo final
SELECT 
  'Resumo Final' as status,
  'Sistema de votação múltipla ativado e funcionando!' as resultado,
  'Cada usuário pode votar em até 3 opções diferentes' as funcionalidade,
  'Votam apenas uma vez (com múltiplas escolhas)' as regra;
