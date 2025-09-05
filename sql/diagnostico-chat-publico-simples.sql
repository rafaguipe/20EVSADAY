-- Diagnóstico simplificado do sistema de chat público
-- Execute este script no Supabase SQL Editor

-- 1. Verificar se a tabela existe
SELECT 
  'Tabela chat_ev_messages existe?' as status,
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM information_schema.tables 
      WHERE table_schema = 'public' 
        AND table_name = 'chat_ev_messages'
    ) THEN '✅ SIM'
    ELSE '❌ NÃO'
  END as resultado;

-- 2. Verificar estrutura básica da tabela
SELECT 
  'Estrutura da tabela' as status,
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns 
WHERE table_schema = 'public' 
  AND table_name = 'chat_ev_messages'
ORDER BY ordinal_position;

-- 3. Verificar políticas RLS
SELECT 
  'Políticas RLS' as status,
  policyname,
  cmd,
  CASE 
    WHEN qual IS NOT NULL THEN 'Tem condição'
    ELSE 'Sem condição'
  END as tem_condicao
FROM pg_policies 
WHERE schemaname = 'public' 
  AND tablename = 'chat_ev_messages';

-- 4. Contar mensagens
SELECT 
  'Contagem de mensagens' as status,
  COUNT(*) as total_mensagens
FROM chat_ev_messages;

-- 5. Verificar mensagens recentes
SELECT 
  'Mensagens recentes' as status,
  id,
  username,
  message_type,
  LEFT(message, 50) as mensagem_preview,
  created_at
FROM chat_ev_messages 
ORDER BY created_at DESC 
LIMIT 5;

-- 6. Verificar se há problemas de permissão
SELECT 
  'Permissões da tabela' as status,
  grantee,
  privilege_type
FROM information_schema.table_privileges 
WHERE table_schema = 'public' 
  AND table_name = 'chat_ev_messages';

-- 7. Teste de inserção (descomente para testar)
-- INSERT INTO chat_ev_messages (user_id, username, message, message_type) 
-- VALUES (auth.uid(), 'Teste', 'Mensagem de teste', 'encouragement');

-- 8. Habilitar Realtime (execute se necessário)
-- ALTER TABLE chat_ev_messages REPLICA IDENTITY FULL;
