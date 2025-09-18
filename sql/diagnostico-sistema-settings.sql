-- Script para diagnosticar problemas com sistema de configurações
-- Execute este script no SQL Editor do Supabase

-- 1. Verificar se a função get_system_setting existe
SELECT 
  'Verificação da Função get_system_setting' as status,
  routine_name,
  routine_type,
  data_type
FROM information_schema.routines
WHERE routine_schema = 'public'
  AND routine_name = 'get_system_setting';

-- 2. Verificar se a função set_system_setting existe
SELECT 
  'Verificação da Função set_system_setting' as status,
  routine_name,
  routine_type,
  data_type
FROM information_schema.routines
WHERE routine_schema = 'public'
  AND routine_name = 'set_system_setting';

-- 3. Verificar se a tabela system_settings existe
SELECT 
  'Verificação da Tabela system_settings' as status,
  table_name,
  table_type
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name = 'system_settings';

-- 4. Verificar estrutura da tabela system_settings
SELECT 
  'Estrutura da Tabela system_settings' as status,
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'system_settings'
  AND table_schema = 'public'
ORDER BY ordinal_position;

-- 5. Verificar configurações atuais
SELECT 
  'Configurações Atuais' as status,
  key,
  value,
  description,
  created_at,
  updated_at
FROM system_settings
ORDER BY key;

-- 6. Verificar especificamente a configuração votacao_visible
SELECT 
  'Configuração votacao_visible' as status,
  key,
  value,
  description,
  created_at,
  updated_at
FROM system_settings
WHERE key = 'votacao_visible';

-- 7. Testar a função get_system_setting
SELECT 
  'Teste da Função get_system_setting' as status,
  get_system_setting('votacao_visible') as votacao_visible_value,
  get_system_setting('chat_visible') as chat_visible_value,
  get_system_setting('badges_visible') as badges_visible_value;

-- 8. Verificar se há políticas RLS na tabela system_settings
SELECT 
  'Políticas RLS da Tabela system_settings' as status,
  policyname,
  cmd,
  permissive,
  roles
FROM pg_policies
WHERE tablename = 'system_settings'
ORDER BY policyname;

-- 9. Verificar permissões da tabela system_settings
SELECT 
  'Permissões da Tabela system_settings' as status,
  grantee,
  privilege_type
FROM information_schema.table_privileges
WHERE table_name = 'system_settings'
  AND table_schema = 'public'
ORDER BY grantee, privilege_type;

-- 10. Verificar se há dados de teste
SELECT 
  'Dados de Teste' as status,
  COUNT(*) as total_configs,
  COUNT(CASE WHEN key LIKE '%_visible' THEN 1 END) as visible_configs,
  COUNT(CASE WHEN value = 'true' THEN 1 END) as true_configs,
  COUNT(CASE WHEN value = 'false' THEN 1 END) as false_configs
FROM system_settings;
