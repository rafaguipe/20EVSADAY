-- Correção da função get_user_dm_conversations
-- Problema: coluna "other_user_id" ambígua

DROP FUNCTION IF EXISTS get_user_dm_conversations(UUID);

CREATE OR REPLACE FUNCTION get_user_dm_conversations(user_uuid UUID)
RETURNS TABLE (
  conversation_id UUID,
  other_user_id UUID,
  other_username TEXT,
  last_message TEXT,
  last_message_time TIMESTAMP WITH TIME ZONE,
  unread_count BIGINT
) AS $$
BEGIN
  RETURN QUERY
  WITH conversation_summary AS (
    SELECT 
      -- Identificar a outra pessoa na conversa
      CASE 
        WHEN dm.sender_id = user_uuid THEN dm.receiver_id
        ELSE dm.sender_id
      END as other_user_id,
      
      -- Última mensagem da conversa
      dm.message as last_message,
      dm.created_at as last_message_time,
      
      -- Contar mensagens não lidas
      COUNT(CASE WHEN dm.is_read = FALSE AND dm.receiver_id = user_uuid THEN 1 END) as unread_count
      
    FROM chat_ev_direct_messages dm
    WHERE dm.sender_id = user_uuid OR dm.receiver_id = user_uuid
    GROUP BY 
      CASE 
        WHEN dm.sender_id = user_uuid THEN dm.receiver_id
        ELSE dm.sender_id
      END,
      dm.message,
      dm.created_at
  ),
  
  latest_conversations AS (
    SELECT DISTINCT ON (cs.other_user_id)
      cs.other_user_id,
      cs.last_message,
      cs.last_message_time,
      cs.unread_count
    FROM conversation_summary cs
    ORDER BY cs.other_user_id, cs.last_message_time DESC
  )
  
  SELECT 
    lc.other_user_id::UUID as conversation_id,
    lc.other_user_id::UUID as other_user_id,
    COALESCE(p.username, 'Usuário') as other_username,
    lc.last_message,
    lc.last_message_time,
    lc.unread_count
  FROM latest_conversations lc
  LEFT JOIN profiles p ON p.user_id = lc.other_user_id
  ORDER BY lc.last_message_time DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Verificar se a função foi corrigida
SELECT 
  'Função corrigida' as status,
  routine_name,
  routine_definition
FROM information_schema.routines 
WHERE routine_schema = 'public' 
  AND routine_name = 'get_user_dm_conversations';
