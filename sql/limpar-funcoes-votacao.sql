-- Script para limpar funções problemáticas da votação
-- Execute este script no SQL Editor do Supabase

-- 1. Listar todas as funções relacionadas à votação
SELECT 
  'Funções Existentes' as status,
  routine_name,
  routine_type,
  data_type
FROM information_schema.routines
WHERE routine_schema = 'public'
  AND routine_name LIKE '%mascot%'
ORDER BY routine_name;

-- 2. Remover todas as funções relacionadas à votação
DROP FUNCTION IF EXISTS get_mascot_voting_results();
DROP FUNCTION IF EXISTS check_user_vote_status(UUID);
DROP FUNCTION IF EXISTS get_user_votes(UUID);
DROP FUNCTION IF EXISTS check_user_vote_limit();
DROP FUNCTION IF EXISTS user_has_voted();
DROP FUNCTION IF EXISTS get_user_vote();

-- 3. Verificar se as funções foram removidas
SELECT 
  'Verificação Pós-Remoção' as status,
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM information_schema.routines 
      WHERE routine_schema = 'public' 
      AND routine_name LIKE '%mascot%'
    )
    THEN 'Ainda existem funções'
    ELSE 'Todas as funções foram removidas'
  END as resultado;

-- 4. Verificar se a tabela mascot_votes existe
SELECT 
  'Verificação da Tabela' as status,
  CASE 
    WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'mascot_votes' AND table_schema = 'public')
    THEN 'Tabela existe'
    ELSE 'Tabela não existe'
  END as resultado;

-- 5. Se a tabela existir, mostrar sua estrutura
SELECT 
  'Estrutura da Tabela mascot_votes' as status,
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'mascot_votes'
  AND table_schema = 'public'
ORDER BY ordinal_position;

-- 6. Se a tabela existir, mostrar dados atuais
SELECT 
  'Dados Atuais' as status,
  COUNT(*) as total_votos,
  COUNT(DISTINCT user_id) as usuarios_que_votaram,
  COUNT(DISTINCT mascot_option_id) as opcoes_votadas
FROM mascot_votes;
