-- Script para inserir mensagens de exemplo do sistema
-- Execute APÓS ter pelo menos um usuário registrado

-- Função para inserir mensagens de exemplo do sistema
CREATE OR REPLACE FUNCTION insert_system_chat_messages()
RETURNS VOID AS $$
DECLARE
    v_first_user_id UUID;
BEGIN
    -- Buscar o primeiro usuário registrado
    SELECT id INTO v_first_user_id
    FROM auth.users
    ORDER BY created_at ASC
    LIMIT 1;
    
    -- Se não houver usuários, sair
    IF v_first_user_id IS NULL THEN
        RAISE NOTICE 'Nenhum usuário encontrado. Mensagens de exemplo não serão inseridas.';
        RETURN;
    END IF;
    
    -- Inserir mensagens de exemplo
    INSERT INTO chat_ev_messages (user_id, username, avatar_url, message, message_type) VALUES
        (v_first_user_id, 'Sistema', 'avatar_1.png', '🎮 Bem-vindos ao Chat EV! Aqui compartilhamos experiências e ortopensatas sobre Estados Vibracionais. Seja positivo e respeitoso!', 'encouragement'),
        (v_first_user_id, 'Sistema', 'avatar_1.png', '💡 Dica: Registre seus EVs durante o dia e passe a limpo aqui à noite. A consistência é a chave!', 'encouragement'),
        (v_first_user_id, 'Sistema', 'avatar_1.png', '🌟 Lembre-se: Este é um espaço para compartilhar experiências conscienciais e ortopensatas. Mantenha o foco no EV!', 'encouragement');
    
    RAISE NOTICE 'Mensagens de exemplo inseridas com sucesso!';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Executar a função
SELECT insert_system_chat_messages();

-- Limpar a função (opcional)
-- DROP FUNCTION insert_system_chat_messages(); 