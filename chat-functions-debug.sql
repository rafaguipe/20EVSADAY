-- Script de debug para verificar e remover funções do chat

-- 1. Primeiro, vamos ver quais funções existem
SELECT 
  proname as function_name,
  proargtypes::regtype[] as argument_types,
  prorettype::regtype as return_type,
  oid
FROM pg_proc 
WHERE proname IN ('insert_chat_ev_message', 'get_chat_ev_messages');

-- 2. Se existirem funções, vamos removê-las uma por uma
-- (Execute estas linhas apenas se a consulta acima retornar resultados)

-- Para insert_chat_ev_message:
-- DROP FUNCTION IF EXISTS insert_chat_ev_message(UUID, TEXT, TEXT, TEXT, TEXT);
-- DROP FUNCTION IF EXISTS insert_chat_ev_message(UUID, TEXT, TEXT, TEXT);
-- DROP FUNCTION IF EXISTS insert_chat_ev_message(UUID, TEXT, TEXT, TEXT, TEXT, TEXT);

-- Para get_chat_ev_messages:
-- DROP FUNCTION IF EXISTS get_chat_ev_messages(INTEGER, INTEGER);
-- DROP FUNCTION IF EXISTS get_chat_ev_messages(INTEGER);
-- DROP FUNCTION IF EXISTS get_chat_ev_messages();

-- 3. Verificar se foram removidas
SELECT 
  proname as function_name,
  proargtypes::regtype[] as argument_types,
  prorettype::regtype as return_type
FROM pg_proc 
WHERE proname IN ('insert_chat_ev_message', 'get_chat_ev_messages'); 