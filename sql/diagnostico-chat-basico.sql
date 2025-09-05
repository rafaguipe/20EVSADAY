-- Diagnóstico básico do chat público (compatível com todas as versões)
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

-- 2. Se a tabela existe, mostrar estrutura
SELECT 
  'Estrutura da tabela' as status,
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns 
WHERE table_schema = 'public' 
  AND table_name = 'chat_ev_messages'
ORDER BY ordinal_position;

-- 3. Se a tabela existe, contar mensagens
SELECT 
  'Total de mensagens' as status,
  COUNT(*) as quantidade
FROM chat_ev_messages;

-- 4. Se a tabela existe, mostrar últimas mensagens
SELECT 
  'Últimas 5 mensagens' as status,
  id,
  username,
  message_type,
  LEFT(message, 30) as mensagem_preview,
  created_at
FROM chat_ev_messages 
ORDER BY created_at DESC 
LIMIT 5;

-- 5. Verificar políticas RLS (se a tabela existe)
SELECT 
  'Políticas RLS' as status,
  policyname,
  cmd
FROM pg_policies 
WHERE schemaname = 'public' 
  AND tablename = 'chat_ev_messages';

-- 6. Teste de inserção (descomente para testar)
-- INSERT INTO chat_ev_messages (user_id, username, message, message_type) 
-- VALUES (auth.uid(), 'Teste', 'Mensagem de teste', 'encouragement');

-- 7. Habilitar Realtime (execute se necessário)
-- ALTER TABLE chat_ev_messages REPLICA IDENTITY FULL;
