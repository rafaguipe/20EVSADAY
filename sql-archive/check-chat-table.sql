-- Verificar se a tabela chat_ev_messages existe e tem a estrutura correta

-- 1. Verificar se a tabela existe
SELECT 
  table_name,
  table_type
FROM information_schema.tables 
WHERE table_name = 'chat_ev_messages';

-- 2. Verificar a estrutura da tabela
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'chat_ev_messages'
ORDER BY ordinal_position;

-- 3. Verificar as políticas RLS
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE tablename = 'chat_ev_messages';

-- 4. Verificar permissões
SELECT 
  grantee,
  privilege_type,
  is_grantable
FROM information_schema.role_table_grants 
WHERE table_name = 'chat_ev_messages';

-- 5. Testar inserção (substitua o UUID por um válido)
-- INSERT INTO chat_ev_messages (user_id, username, avatar_url, message, message_type) 
-- VALUES ('00000000-0000-0000-0000-000000000000', 'Teste', 'avatar_1.png', 'Mensagem de teste', 'encouragement'); 