-- Sistema de Mensagens Diretas (DM) para o Chat EV
-- Este script adiciona funcionalidade de mensagens privadas entre usuários

-- 1. Criar tabela para mensagens diretas
CREATE TABLE IF NOT EXISTS chat_ev_direct_messages (
  id SERIAL PRIMARY KEY,
  sender_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  receiver_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  message_type VARCHAR(50) DEFAULT 'encouragement',
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_dm_sender_id ON chat_ev_direct_messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_dm_receiver_id ON chat_ev_direct_messages(receiver_id);
CREATE INDEX IF NOT EXISTS idx_dm_created_at ON chat_ev_direct_messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_dm_conversation ON chat_ev_direct_messages(
  LEAST(sender_id, receiver_id), 
  GREATEST(sender_id, receiver_id), 
  created_at DESC
);

-- 3. Adicionar trigger para updated_at
CREATE OR REPLACE FUNCTION update_dm_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_dm_updated_at ON chat_ev_direct_messages;
CREATE TRIGGER update_dm_updated_at
  BEFORE UPDATE ON chat_ev_direct_messages
  FOR EACH ROW
  EXECUTE FUNCTION update_dm_updated_at();

-- 4. Habilitar RLS (Row Level Security)
ALTER TABLE chat_ev_direct_messages ENABLE ROW LEVEL SECURITY;

-- 5. Criar políticas de segurança
-- Usuários podem ver mensagens que enviaram ou receberam
DROP POLICY IF EXISTS "Usuários podem ver suas DMs" ON chat_ev_direct_messages;
CREATE POLICY "Usuários podem ver suas DMs" ON chat_ev_direct_messages
  FOR SELECT USING (
    auth.uid() = sender_id OR auth.uid() = receiver_id
  );

-- Usuários podem enviar mensagens para qualquer usuário
DROP POLICY IF EXISTS "Usuários podem enviar DMs" ON chat_ev_direct_messages;
CREATE POLICY "Usuários podem enviar DMs" ON chat_ev_direct_messages
  FOR INSERT WITH CHECK (
    auth.uid() = sender_id
  );

-- Usuários podem marcar como lida apenas mensagens que receberam
DROP POLICY IF EXISTS "Usuários podem marcar DMs como lidas" ON chat_ev_direct_messages;
CREATE POLICY "Usuários podem marcar DMs como lidas" ON chat_ev_direct_messages
  FOR UPDATE USING (
    auth.uid() = receiver_id
  );

-- 6. Função para buscar conversas de um usuário
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

-- 7. Função para buscar mensagens de uma conversa específica
CREATE OR REPLACE FUNCTION get_dm_conversation(user1_uuid UUID, user2_uuid UUID, limit_count INTEGER DEFAULT 50)
RETURNS TABLE (
  id INTEGER,
  sender_id UUID,
  receiver_id UUID,
  message TEXT,
  message_type VARCHAR(50),
  is_read BOOLEAN,
  created_at TIMESTAMP WITH TIME ZONE,
  is_own_message BOOLEAN
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    dm.id,
    dm.sender_id,
    dm.receiver_id,
    dm.message,
    dm.message_type,
    dm.is_read,
    dm.created_at,
    (dm.sender_id = user1_uuid) as is_own_message
  FROM chat_ev_direct_messages dm
  WHERE (dm.sender_id = user1_uuid AND dm.receiver_id = user2_uuid)
     OR (dm.sender_id = user2_uuid AND dm.receiver_id = user1_uuid)
  ORDER BY dm.created_at ASC
  LIMIT limit_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 8. Função para marcar mensagens como lidas
CREATE OR REPLACE FUNCTION mark_dm_as_read(conversation_user_id UUID)
RETURNS INTEGER AS $$
DECLARE
  updated_count INTEGER;
BEGIN
  UPDATE chat_ev_direct_messages 
  SET is_read = TRUE 
  WHERE receiver_id = auth.uid() 
    AND sender_id = conversation_user_id
    AND is_read = FALSE;
  
  GET DIAGNOSTICS updated_count = ROW_COUNT;
  RETURN updated_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 9. Conceder permissões
GRANT SELECT, INSERT, UPDATE ON chat_ev_direct_messages TO authenticated;
GRANT EXECUTE ON FUNCTION get_user_dm_conversations(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION get_dm_conversation(UUID, UUID, INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION mark_dm_as_read(UUID) TO authenticated;

-- 10. Adicionar comentários
COMMENT ON TABLE chat_ev_direct_messages IS 'Mensagens diretas privadas entre usuários do chat EV';
COMMENT ON COLUMN chat_ev_direct_messages.sender_id IS 'ID do usuário que enviou a mensagem';
COMMENT ON COLUMN chat_ev_direct_messages.receiver_id IS 'ID do usuário que recebeu a mensagem';
COMMENT ON COLUMN chat_ev_direct_messages.message IS 'Conteúdo da mensagem privada';
COMMENT ON COLUMN chat_ev_direct_messages.message_type IS 'Tipo da mensagem (encouragement, orthothought, experience, question)';
COMMENT ON COLUMN chat_ev_direct_messages.is_read IS 'Se a mensagem foi lida pelo destinatário';

-- 11. Verificar se tudo foi criado corretamente
SELECT 
  'Tabela criada' as status,
  COUNT(*) as total_messages
FROM chat_ev_direct_messages;

SELECT 
  'Funções criadas' as status,
  routine_name
FROM information_schema.routines 
WHERE routine_schema = 'public' 
  AND routine_name IN ('get_user_dm_conversations', 'get_dm_conversation', 'mark_dm_as_read');
