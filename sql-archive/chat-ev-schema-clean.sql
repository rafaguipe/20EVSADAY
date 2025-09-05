-- Schema para Chat EV - Mensagens sobre Estados Vibracionais
-- Execute no Supabase SQL Editor

-- Tabela para mensagens do chat EV
CREATE TABLE IF NOT EXISTS chat_ev_messages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    username TEXT NOT NULL,
    avatar_url TEXT DEFAULT 'avatar_1.png',
    message TEXT NOT NULL,
    message_type TEXT DEFAULT 'encouragement' CHECK (message_type IN ('encouragement', 'orthothought', 'experience', 'question')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_approved BOOLEAN DEFAULT true,
    is_deleted BOOLEAN DEFAULT false
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_chat_ev_messages_created_at ON chat_ev_messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_chat_ev_messages_user_id ON chat_ev_messages(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_ev_messages_type ON chat_ev_messages(message_type);
CREATE INDEX IF NOT EXISTS idx_chat_ev_messages_approved ON chat_ev_messages(is_approved, is_deleted);

-- Função para atualizar updated_at
CREATE OR REPLACE FUNCTION update_chat_ev_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para atualizar updated_at
DROP TRIGGER IF EXISTS update_chat_ev_messages_updated_at ON chat_ev_messages;
CREATE TRIGGER update_chat_ev_messages_updated_at
    BEFORE UPDATE ON chat_ev_messages
    FOR EACH ROW
    EXECUTE FUNCTION update_chat_ev_updated_at();

-- Função para inserir mensagem com validação
CREATE OR REPLACE FUNCTION insert_chat_ev_message(
    p_user_id UUID,
    p_username TEXT,
    p_avatar_url TEXT,
    p_message TEXT,
    p_message_type TEXT DEFAULT 'encouragement'
)
RETURNS UUID AS $$
DECLARE
    v_message_id UUID;
BEGIN
    -- Validações básicas
    IF p_message IS NULL OR LENGTH(TRIM(p_message)) = 0 THEN
        RAISE EXCEPTION 'Mensagem não pode estar vazia';
    END IF;
    
    IF LENGTH(p_message) > 1000 THEN
        RAISE EXCEPTION 'Mensagem muito longa (máximo 1000 caracteres)';
    END IF;
    
    -- Inserir mensagem
    INSERT INTO chat_ev_messages (
        user_id,
        username,
        avatar_url,
        message,
        message_type
    ) VALUES (
        p_user_id,
        p_username,
        COALESCE(p_avatar_url, 'avatar_1.png'),
        TRIM(p_message),
        p_message_type
    ) RETURNING id INTO v_message_id;
    
    RETURN v_message_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para buscar mensagens recentes
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
    created_at TIMESTAMP WITH TIME ZONE,
    is_own_message BOOLEAN
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        cem.id,
        cem.user_id,
        cem.username,
        cem.avatar_url,
        cem.message,
        cem.message_type,
        cem.created_at,
        (cem.user_id = auth.uid()) as is_own_message
    FROM chat_ev_messages cem
    WHERE cem.is_approved = true 
      AND cem.is_deleted = false
    ORDER BY cem.created_at DESC
    LIMIT p_limit
    OFFSET p_offset;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- RLS (Row Level Security)
ALTER TABLE chat_ev_messages ENABLE ROW LEVEL SECURITY;

-- Políticas RLS
DROP POLICY IF EXISTS "Usuários autenticados podem ver mensagens aprovadas" ON chat_ev_messages;
CREATE POLICY "Usuários autenticados podem ver mensagens aprovadas" ON chat_ev_messages
    FOR SELECT USING (auth.role() = 'authenticated' AND is_approved = true AND is_deleted = false);

DROP POLICY IF EXISTS "Usuários autenticados podem inserir mensagens" ON chat_ev_messages;
CREATE POLICY "Usuários autenticados podem inserir mensagens" ON chat_ev_messages
    FOR INSERT WITH CHECK (auth.role() = 'authenticated' AND auth.uid() = user_id);

DROP POLICY IF EXISTS "Usuários podem editar suas próprias mensagens" ON chat_ev_messages;
CREATE POLICY "Usuários podem editar suas próprias mensagens" ON chat_ev_messages
    FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Usuários podem deletar suas próprias mensagens" ON chat_ev_messages;
CREATE POLICY "Usuários podem deletar suas próprias mensagens" ON chat_ev_messages
    FOR DELETE USING (auth.uid() = user_id);

-- Políticas para admins
DROP POLICY IF EXISTS "Admins podem gerenciar todas as mensagens" ON chat_ev_messages;
CREATE POLICY "Admins podem gerenciar todas as mensagens" ON chat_ev_messages
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE user_id = auth.uid() 
            AND is_admin = true
        )
    );

-- Comentários sobre a tabela
COMMENT ON TABLE chat_ev_messages IS 'Mensagens do chat sobre Estados Vibracionais';
COMMENT ON COLUMN chat_ev_messages.message_type IS 'Tipo da mensagem: encouragement (incentivo), orthothought (ortopensata), experience (experiência), question (pergunta)';
COMMENT ON COLUMN chat_ev_messages.is_approved IS 'Se a mensagem foi aprovada pelos moderadores';
COMMENT ON COLUMN chat_ev_messages.is_deleted IS 'Se a mensagem foi deletada (soft delete)'; 