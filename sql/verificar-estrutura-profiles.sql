-- Script para verificar a estrutura da tabela profiles
-- Execute este script no SQL Editor do Supabase

-- 1. Verificar estrutura da tabela profiles
SELECT 
  'Estrutura da Tabela profiles' as status,
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'profiles'
  AND table_schema = 'public'
ORDER BY ordinal_position;

-- 2. Verificar se existe coluna de admin ou role
SELECT 
  'Verificação de Colunas Admin' as status,
  column_name,
  data_type
FROM information_schema.columns
WHERE table_name = 'profiles'
  AND table_schema = 'public'
  AND (column_name LIKE '%admin%' OR column_name LIKE '%role%' OR column_name LIKE '%is_%')
ORDER BY column_name;

-- 3. Verificar dados de exemplo da tabela profiles
SELECT 
  'Dados de Exemplo' as status,
  *
FROM profiles
LIMIT 5;

-- 4. Verificar se há usuários com permissões especiais
SELECT 
  'Usuários Especiais' as status,
  user_id,
  username,
  created_at
FROM profiles
ORDER BY created_at
LIMIT 10;
