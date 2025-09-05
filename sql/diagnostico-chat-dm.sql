-- Diagnóstico e correção do sistema de Chat e DMs
-- Execute este script no Supabase SQL Editor

-- 1. Verificar se as tabelas existem
SELECT 
  'Verificando tabelas do sistema de chat' as status,
  table_name,
  table_type
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name LIKE '%chat%'
ORDER BY table_name;

-- 2. Verificar estrutura da tabela chat_ev_direct_messages
SELECT 
  'Estrutura da tabela chat_ev_direct_messages' as status,
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
  AND table_name = 'chat_ev_direct_messages'
ORDER BY ordinal_position;

-- 3. Verificar se a função mark_dm_as_read existe
SELECT 
  'Verificando função mark_dm_as_read' as status,
  routine_name,
  routine_type,
  data_type as return_type
FROM information_schema.routines 
WHERE routine_schema = 'public' 
  AND routine_name = 'mark_dm_as_read';

-- 4. Verificar políticas RLS da tabela chat_ev_direct_messages
SELECT 
  'Políticas RLS da tabela chat_ev_direct_messages' as status,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE schemaname = 'public' 
  AND tablename = 'chat_ev_direct_messages';

-- 5. Verificar se Realtime está habilitado na tabela
SELECT 
  'Status do Realtime na tabela chat_ev_direct_messages' as status,
  schemaname,
  tablename,
  replica_identity
FROM pg_tables 
WHERE schemaname = 'public' 
  AND tablename = 'chat_ev_direct_messages';

-- 6. Contar mensagens na tabela
SELECT 
  'Contagem de mensagens DM' as status,
  COUNT(*) as total_mensagens,
  COUNT(CASE WHEN is_read = false THEN 1 END) as nao_lidas,
  COUNT(CASE WHEN is_read = true THEN 1 END) as lidas
FROM chat_ev_direct_messages;

-- 7. Verificar mensagens recentes
SELECT 
  'Mensagens DM recentes' as status,
  id,
  sender_id,
  receiver_id,
  message,
  is_read,
  created_at
FROM chat_ev_direct_messages 
ORDER BY created_at DESC 
LIMIT 5;

-- 8. Verificar se há problemas de permissão
SELECT 
  'Verificando permissões da tabela' as status,
  grantee,
  privilege_type,
  is_grantable
FROM information_schema.table_privileges 
WHERE table_schema = 'public' 
  AND table_name = 'chat_ev_direct_messages';

-- 9. Habilitar Realtime na tabela (se necessário)
-- ALTER TABLE chat_ev_direct_messages REPLICA IDENTITY FULL;

-- 10. Verificar configuração do Supabase Realtime
SELECT 
  'Configuração do Realtime' as status,
  setting,
  value
FROM pg_settings 
WHERE name LIKE '%realtime%' OR name LIKE '%logical%';

-- 11. Teste de inserção (comentado para não inserir dados desnecessários)
-- INSERT INTO chat_ev_direct_messages (sender_id, receiver_id, message) 
-- VALUES ('00000000-0000-0000-0000-000000000000', '00000000-0000-0000-0000-000000000000', 'Teste');

-- 12. Verificar logs de erro recentes (se disponível)
-- SELECT * FROM pg_stat_database WHERE datname = current_database();
