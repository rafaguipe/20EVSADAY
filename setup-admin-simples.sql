-- Script simples para configurar admin sem depender de constraints
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

-- 3. Criar tabela profiles se não existir
CREATE TABLE IF NOT EXISTS profiles (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    is_admin BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Adicionar constraint única se não existir
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'profiles_user_id_key'
    ) THEN
        ALTER TABLE profiles ADD CONSTRAINT profiles_user_id_key UNIQUE (user_id);
        RAISE NOTICE 'Constraint única adicionada';
    END IF;
END $$;

-- 5. Inserir ou atualizar usuário como admin (sem ON CONFLICT)
DO $$
DECLARE
    user_exists BOOLEAN;
BEGIN
    -- Verificar se o usuário já existe
    SELECT EXISTS (
        SELECT 1 FROM profiles WHERE user_id = auth.uid()
    ) INTO user_exists;
    
    IF user_exists THEN
        -- Atualizar usuário existente
        UPDATE profiles 
        SET is_admin = true, updated_at = NOW()
        WHERE user_id = auth.uid();
        RAISE NOTICE 'Usuário atualizado como admin';
    ELSE
        -- Inserir novo usuário
        INSERT INTO profiles (user_id, is_admin, created_at, updated_at)
        VALUES (auth.uid(), true, NOW(), NOW());
        RAISE NOTICE 'Usuário criado como admin';
    END IF;
END $$;

-- 6. Verificar resultado
SELECT 
    user_id,
    is_admin,
    created_at,
    updated_at
FROM profiles 
WHERE user_id = auth.uid();

-- 7. Testar função set_system_setting
SELECT set_system_setting(
    'test_admin_status', 
    'true', 
    'Teste para verificar se o usuário tem privilégios de admin'
);

-- 8. Verificar se funcionou
SELECT 
    setting_key,
    setting_value,
    description,
    created_at
FROM system_settings 
WHERE setting_key = 'test_admin_status';

-- 9. Limpar teste
DELETE FROM system_settings WHERE setting_key = 'test_admin_status'; 