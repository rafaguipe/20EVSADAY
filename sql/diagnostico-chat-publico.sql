-- Diagnóstico do sistema de chat público (mensagens para todos)
-- Execute este script no Supabase SQL Editor

-- 1. Verificar se a tabela chat_ev_messages existe
SELECT 
  'Verificando tabela chat_ev_messages' as status,
  table_name,
  table_type
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name = 'chat_ev_messages';

-- 2. Verificar estrutura da tabela chat_ev_messages
SELECT 
  'Estrutura da tabela chat_ev_messages' as status,
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
  AND table_name = 'chat_ev_messages'
ORDER BY ordinal_position;

-- 3. Verificar políticas RLS da tabela chat_ev_messages
SELECT 
  'Políticas RLS da tabela chat_ev_messages' as status,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE schemaname = 'public' 
  AND tablename = 'chat_ev_messages';

-- 4. Verificar se Realtime está habilitado na tabela
SELECT 
  'Status do Realtime na tabela chat_ev_messages' as status,
  schemaname,
  tablename
FROM pg_tables 
WHERE schemaname = 'public' 
  AND tablename = 'chat_ev_messages';

-- 4.1. Verificar replica identity da tabela
SELECT 
  'Replica Identity da tabela chat_ev_messages' as status,
  n.nspname as schema_name,
  c.relname as table_name,
  CASE c.relreplident
    WHEN 'd' THEN 'default'
    WHEN 'n' THEN 'nothing'
    WHEN 'f' THEN 'full'
    WHEN 'i' THEN 'index'
    ELSE 'unknown'
  END as replica_identity
FROM pg_class c
JOIN pg_namespace n ON c.relnamespace = n.oid
WHERE n.nspname = 'public' 
  AND c.relname = 'chat_ev_messages';

-- 5. Contar mensagens na tabela
SELECT 
  'Contagem de mensagens públicas' as status,
  COUNT(*) as total_mensagens,
  COUNT(DISTINCT user_id) as usuarios_unicos,
  COUNT(CASE WHEN message_type = 'encouragement' THEN 1 END) as incentivos,
  COUNT(CASE WHEN message_type = 'orthothought' THEN 1 END) as ortopensatas,
  COUNT(CASE WHEN message_type = 'experience' THEN 1 END) as experiencias,
  COUNT(CASE WHEN message_type = 'question' THEN 1 END) as perguntas
FROM chat_ev_messages;

-- 6. Verificar mensagens recentes
SELECT 
  'Mensagens públicas recentes' as status,
  id,
  user_id,
  username,
  message_type,
  message,
  created_at
FROM chat_ev_messages 
ORDER BY created_at DESC 
LIMIT 10;

-- 7. Verificar se há problemas de permissão
SELECT 
  'Verificando permissões da tabela' as status,
  grantee,
  privilege_type,
  is_grantable
FROM information_schema.table_privileges 
WHERE table_schema = 'public' 
  AND table_name = 'chat_ev_messages';

-- 8. Verificar se a função get_user_dm_conversations existe (para comparação)
SELECT 
  'Verificando função get_user_dm_conversations' as status,
  routine_name,
  routine_type,
  data_type as return_type
FROM information_schema.routines 
WHERE routine_schema = 'public' 
  AND routine_name = 'get_user_dm_conversations';

-- 9. Teste de inserção (comentado para não inserir dados desnecessários)
-- INSERT INTO chat_ev_messages (user_id, username, message, message_type) 
-- VALUES ('00000000-0000-0000-0000-000000000000', 'Teste', 'Mensagem de teste', 'encouragement');

-- 10. Verificar se há triggers na tabela
SELECT 
  'Verificando triggers na tabela' as status,
  trigger_name,
  event_manipulation,
  action_timing,
  action_statement
FROM information_schema.triggers 
WHERE event_object_schema = 'public' 
  AND event_object_table = 'chat_ev_messages';

-- 11. Verificar índices na tabela
SELECT 
  'Verificando índices na tabela' as status,
  indexname,
  indexdef
FROM pg_indexes 
WHERE schemaname = 'public' 
  AND tablename = 'chat_ev_messages';

-- 12. Habilitar Realtime na tabela (se necessário)
-- ALTER TABLE chat_ev_messages REPLICA IDENTITY FULL;
