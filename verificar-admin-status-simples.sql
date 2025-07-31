-- Script simples para verificar e corrigir status de administrador
-- Execute no Supabase SQL Editor

-- 1. Verificar usuário atual
SELECT 
    auth.uid() as current_user_id,
    auth.email() as current_user_email;

-- 2. Verificar se a tabela profiles existe
SELECT EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'profiles'
) as profiles_table_exists;

-- 3. Se a tabela existir, verificar estrutura
DO $$
DECLARE
    has_email_column BOOLEAN;
    has_updated_at_column BOOLEAN;
BEGIN
    -- Verificar se a coluna email existe
    SELECT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'profiles' 
        AND column_name = 'email'
    ) INTO has_email_column;
    
    -- Verificar se a coluna updated_at existe
    SELECT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'profiles' 
        AND column_name = 'updated_at'
    ) INTO has_updated_at_column;
    
    -- Mostrar estrutura encontrada
    RAISE NOTICE 'Tabela profiles existe: %', 
        (SELECT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'profiles'));
    RAISE NOTICE 'Coluna email existe: %', has_email_column;
    RAISE NOTICE 'Coluna updated_at existe: %', has_updated_at_column;
    
    -- Tentar inserir/atualizar o usuário atual como admin
    IF has_email_column AND has_updated_at_column THEN
        -- Estrutura completa
        INSERT INTO profiles (user_id, email, is_admin, created_at, updated_at)
        VALUES (auth.uid(), auth.email(), true, NOW(), NOW())
        ON CONFLICT (user_id) DO UPDATE SET 
            is_admin = true,
            updated_at = NOW();
    ELSIF has_email_column THEN
        -- Sem updated_at
        INSERT INTO profiles (user_id, email, is_admin, created_at)
        VALUES (auth.uid(), auth.email(), true, NOW())
        ON CONFLICT (user_id) DO UPDATE SET 
            is_admin = true;
    ELSE
        -- Sem email
        INSERT INTO profiles (user_id, is_admin, created_at)
        VALUES (auth.uid(), true, NOW())
        ON CONFLICT (user_id) DO UPDATE SET 
            is_admin = true;
    END IF;
    
    RAISE NOTICE 'Usuário configurado como admin';
END $$;

-- 4. Verificar o resultado
SELECT 
    user_id,
    is_admin,
    created_at
FROM profiles 
WHERE user_id = auth.uid();

-- 5. Testar a função set_system_setting
SELECT set_system_setting(
    'test_admin_status', 
    'true', 
    'Teste para verificar se o usuário tem privilégios de admin'
);

-- 6. Verificar se funcionou
SELECT 
    setting_key,
    setting_value,
    description,
    created_at
FROM system_settings 
WHERE setting_key = 'test_admin_status';

-- 7. Limpar teste
DELETE FROM system_settings WHERE setting_key = 'test_admin_status'; 