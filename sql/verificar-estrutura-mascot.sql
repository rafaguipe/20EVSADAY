-- Script para verificar estrutura das tabelas de mascote
-- Execute este script no SQL Editor do Supabase

-- 1. Verificar estrutura da tabela mascot_options
SELECT 
  'Estrutura da Tabela mascot_options' as status,
  column_name,
  data_type,
  character_maximum_length,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'mascot_options'
  AND table_schema = 'public'
ORDER BY ordinal_position;

-- 2. Verificar estrutura da tabela mascot_votes
SELECT 
  'Estrutura da Tabela mascot_votes' as status,
  column_name,
  data_type,
  character_maximum_length,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'mascot_votes'
  AND table_schema = 'public'
ORDER BY ordinal_position;

-- 3. Verificar dados de exemplo
SELECT 
  'Dados de Exemplo - mascot_options' as status,
  id,
  name,
  LENGTH(name) as tamanho_nome,
  created_at
FROM mascot_options
ORDER BY id
LIMIT 5;

-- 4. Verificar se há dados na tabela mascot_votes
SELECT 
  'Dados de Exemplo - mascot_votes' as status,
  COUNT(*) as total_votos,
  COUNT(DISTINCT user_id) as usuarios_que_votaram,
  COUNT(DISTINCT mascot_option_id) as opcoes_votadas
FROM mascot_votes;
