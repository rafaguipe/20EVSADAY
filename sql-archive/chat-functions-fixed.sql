-- Funções para o Chat EV - Versão Corrigida

-- Primeiro, remover funções existentes se existirem
DROP FUNCTION IF EXISTS insert_chat_ev_message(UUID, TEXT, TEXT, TEXT, TEXT);
DROP FUNCTION IF EXISTS get_chat_ev_messages(INTEGER, INTEGER);

-- Função para inserir mensagem no chat
CREATE OR REPLACE FUNCTION insert_chat_ev_message(
  p_user_id UUID,
  p_username TEXT,
  p_avatar_url TEXT,
  p_message TEXT,
  p_message_type TEXT DEFAULT 'encouragement'
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_message_id UUID;
BEGIN
  -- Inserir a mensagem
  INSERT INTO chat_ev_messages (
    user_id,
    username,
    avatar_url,
    message,
    message_type,
    created_at
  ) VALUES (
    p_user_id,
    p_username,
    p_avatar_url,
    p_message,
    p_message_type,
    NOW()
  ) RETURNING id INTO v_message_id;

  -- Retornar sucesso
  RETURN json_build_object(
    'success', true,
    'message_id', v_message_id
  );
EXCEPTION
  WHEN OTHERS THEN
    RETURN json_build_object(
      'success', false,
      'error', SQLERRM
    );
END;
$$;

-- Função para buscar mensagens do chat
CREATE OR REPLACE FUNCTION get_chat_ev_messages(
  p_limit INTEGER DEFAULT 50,
  p_offset INTEGER DEFAULT 0
)
RETURNS TABLE (
  id UUID,
  user_id UUID,
  username TEXT,
  avatar_url TEXT,
  message TEXT,
  message_type TEXT,
  created_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    cem.id,
    cem.user_id,
    cem.username,
    cem.avatar_url,
    cem.message,
    cem.message_type,
    cem.created_at
  FROM chat_ev_messages cem
  ORDER BY cem.created_at DESC
  LIMIT p_limit
  OFFSET p_offset;
END;
$$;

-- Garantir que as funções são executáveis pelos usuários autenticados
GRANT EXECUTE ON FUNCTION insert_chat_ev_message(UUID, TEXT, TEXT, TEXT, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION get_chat_ev_messages(INTEGER, INTEGER) TO authenticated;

-- Verificar se as funções foram criadas
SELECT 
  proname as function_name,
  proargtypes::regtype[] as argument_types,
  prorettype::regtype as return_type
FROM pg_proc 
WHERE proname IN ('insert_chat_ev_message', 'get_chat_ev_messages'); 