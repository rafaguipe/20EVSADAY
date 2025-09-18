-- Script para limpar funções problemáticas do sistema de configurações
-- Execute este script no SQL Editor do Supabase

-- 1. Listar todas as funções relacionadas ao sistema de configurações
SELECT 
  'Funções Existentes' as status,
  routine_name,
  routine_type,
  data_type,
  routine_definition
FROM information_schema.routines
WHERE routine_schema = 'public'
  AND routine_name LIKE '%system_setting%'
ORDER BY routine_name;

-- 2. Remover todas as funções relacionadas ao sistema de configurações
DROP FUNCTION IF EXISTS get_system_setting(TEXT);
DROP FUNCTION IF EXISTS set_system_setting(TEXT, TEXT);
DROP FUNCTION IF EXISTS set_system_setting(TEXT, TEXT, TEXT);
DROP FUNCTION IF EXISTS set_system_setting(TEXT, TEXT, TEXT, TEXT);

-- 3. Verificar se as funções foram removidas
SELECT 
  'Verificação Pós-Remoção' as status,
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM information_schema.routines 
      WHERE routine_schema = 'public' 
      AND routine_name LIKE '%system_setting%'
    )
    THEN 'Ainda existem funções'
    ELSE 'Todas as funções foram removidas'
  END as resultado;

-- 4. Verificar se a tabela system_settings existe
SELECT 
  'Verificação da Tabela' as status,
  CASE 
    WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'system_settings' AND table_schema = 'public')
    THEN 'Tabela existe'
    ELSE 'Tabela não existe'
  END as resultado;

-- 5. Se a tabela existir, mostrar sua estrutura
SELECT 
  'Estrutura da Tabela' as status,
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'system_settings'
  AND table_schema = 'public'
ORDER BY ordinal_position;

-- 6. Se a tabela existir, mostrar dados atuais
SELECT 
  'Dados Atuais' as status,
  setting_key,
  setting_value,
  description
FROM system_settings
WHERE setting_key LIKE '%_visible'
ORDER BY setting_key;
