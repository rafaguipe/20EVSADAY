-- Script inteligente para configurar admin detectando estrutura automaticamente
-- Execute no Supabase SQL Editor

-- 1. Verificar usuário atual
SELECT 
    auth.uid() as current_user_id,
    auth.email() as current_user_email;

-- 2. Verificar estrutura da tabela profiles
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'profiles'
ORDER BY ordinal_position;

-- 3. Limpar duplicados
DELETE FROM profiles 
WHERE id NOT IN (
    SELECT MAX(id) 
    FROM profiles 
    GROUP BY user_id
);

-- 4. Configurar admin de forma inteligente
DO $$
DECLARE
    col_record RECORD;
    update_sql TEXT := 'UPDATE profiles SET is_admin = true, updated_at = NOW()';
    insert_columns TEXT := 'user_id, is_admin, created_at, updated_at';
    insert_values TEXT := 'auth.uid(), true, NOW(), NOW()';
    has_username BOOLEAN := false;
    has_email BOOLEAN := false;
    has_full_name BOOLEAN := false;
    has_avatar_url BOOLEAN := false;
BEGIN
    -- Verificar quais colunas existem
    FOR col_record IN 
        SELECT column_name, is_nullable 
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'profiles'
        AND column_name NOT IN ('id', 'user_id', 'is_admin', 'created_at', 'updated_at')
    LOOP
        IF col_record.column_name = 'username' THEN
            has_username := true;
            update_sql := update_sql || ', username = COALESCE(username, ''admin_'' || SUBSTRING(auth.uid()::text, 1, 8))';
            insert_columns := insert_columns || ', username';
            insert_values := insert_values || ', ''admin_'' || SUBSTRING(auth.uid()::text, 1, 8)';
        ELSIF col_record.column_name = 'email' THEN
            has_email := true;
            update_sql := update_sql || ', email = COALESCE(email, auth.email())';
            insert_columns := insert_columns || ', email';
            insert_values := insert_values || ', auth.email()';
        ELSIF col_record.column_name = 'full_name' THEN
            has_full_name := true;
            update_sql := update_sql || ', full_name = COALESCE(full_name, ''Administrador'')';
            insert_columns := insert_columns || ', full_name';
            insert_values := insert_values || ', ''Administrador''';
        ELSIF col_record.column_name = 'avatar_url' THEN
            has_avatar_url := true;
            update_sql := update_sql || ', avatar_url = COALESCE(avatar_url, ''https://www.gravatar.com/avatar/default'')';
            insert_columns := insert_columns || ', avatar_url';
            insert_values := insert_values || ', ''https://www.gravatar.com/avatar/default''';
        END IF;
    END LOOP;
    
    -- Executar UPDATE
    update_sql := update_sql || ' WHERE user_id = auth.uid()';
    EXECUTE update_sql;
    
    -- Executar INSERT se necessário
    IF NOT EXISTS (SELECT 1 FROM profiles WHERE user_id = auth.uid()) THEN
        EXECUTE 'INSERT INTO profiles (' || insert_columns || ') VALUES (' || insert_values || ')';
        RAISE NOTICE 'Usuário criado como admin';
    ELSE
        RAISE NOTICE 'Usuário atualizado como admin';
    END IF;
    
    -- Mostrar estrutura detectada
    RAISE NOTICE 'Estrutura detectada: username=%, email=%, full_name=%, avatar_url=%', 
        has_username, has_email, has_full_name, has_avatar_url;
END $$;

-- 5. Verificar resultado final
SELECT 
    'Status final:' as status,
    user_id,
    username,
    email,
    full_name,
    is_admin,
    created_at,
    updated_at
FROM profiles 
WHERE user_id = auth.uid();

-- 6. Adicionar constraint única
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'profiles_user_id_key'
    ) THEN
        ALTER TABLE profiles ADD CONSTRAINT profiles_user_id_key UNIQUE (user_id);
        RAISE NOTICE 'Constraint única adicionada com sucesso';
    ELSE
        RAISE NOTICE 'Constraint única já existe';
    END IF;
END $$;

-- 7. Resumo final
SELECT 
    'CONFIGURAÇÃO CONCLUÍDA' as status,
    'Você agora é administrador e pode usar a função set_system_setting' as mensagem; 