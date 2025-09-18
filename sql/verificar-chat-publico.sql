-- Verificação específica da tabela de chat público
-- Execute este script no Supabase SQL Editor

-- 1. Verificar se a tabela existe
SELECT 
  'Verificação da tabela chat_ev_messages' as teste,
  CASE 
    WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'chat_ev_messages') 
    THEN '✅ Tabela existe'
    ELSE '❌ Tabela não existe'
  END as status;

-- 2. Verificar estrutura da tabela
SELECT 
  'Estrutura da tabela chat_ev_messages' as teste,
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'chat_ev_messages'
ORDER BY ordinal_position;

-- 3. Verificar permissões da tabela
SELECT 
  'Permissões da tabela chat_ev_messages' as teste,
  grantee,
  privilege_type
FROM information_schema.table_privileges 
WHERE table_name = 'chat_ev_messages'
ORDER BY grantee, privilege_type;

-- 4. Verificar políticas RLS
SELECT 
  'Políticas RLS da tabela chat_ev_messages' as teste,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE tablename = 'chat_ev_messages';

-- 5. Verificar se há dados na tabela
SELECT 
  'Dados na tabela chat_ev_messages' as teste,
  COUNT(*) as total_mensagens,
  CASE 
    WHEN COUNT(*) > 0 THEN '✅ Há mensagens'
    ELSE '⚠️ Tabela vazia'
  END as status
FROM chat_ev_messages;

-- 6. Verificar mensagens recentes (se houver)
SELECT 
  'Mensagens recentes' as teste,
  id,
  username,
  message,
  message_type,
  created_at
FROM chat_ev_messages
ORDER BY created_at DESC
LIMIT 5;

-- 7. Verificar índices da tabela
SELECT 
  'Índices da tabela chat_ev_messages' as teste,
  indexname,
  indexdef
FROM pg_indexes 
WHERE tablename = 'chat_ev_messages';

-- 8. Verificar triggers da tabela
SELECT 
  'Triggers da tabela chat_ev_messages' as teste,
  trigger_name,
  event_manipulation,
  action_timing,
  action_statement
FROM information_schema.triggers 
WHERE event_object_table = 'chat_ev_messages';

-- 9. Verificar se Realtime está habilitado
SELECT 
  'Realtime da tabela chat_ev_messages' as teste,
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM pg_publication_tables 
      WHERE tablename = 'chat_ev_messages'
    ) THEN '✅ Realtime habilitado'
    ELSE '❌ Realtime não habilitado'
  END as status;

-- 10. Teste de inserção (simulação)
SELECT 
  'Teste de inserção' as teste,
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM information_schema.table_privileges 
      WHERE table_name = 'chat_ev_messages' 
      AND grantee = 'authenticated' 
      AND privilege_type = 'INSERT'
    ) THEN '✅ Permissão de INSERT para authenticated'
    ELSE '❌ Sem permissão de INSERT para authenticated'
  END as insert_permission,
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM information_schema.table_privileges 
      WHERE table_name = 'chat_ev_messages' 
      AND grantee = 'authenticated' 
      AND privilege_type = 'SELECT'
    ) THEN '✅ Permissão de SELECT para authenticated'
    ELSE '❌ Sem permissão de SELECT para authenticated'
  END as select_permission;
