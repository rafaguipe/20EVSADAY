-- Script para verificar e corrigir status de administrador
-- Execute no Supabase SQL Editor

-- 1. Verificar se a tabela profiles existe
SELECT EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'profiles'
) as profiles_table_exists;

-- 2. Verificar estrutura da tabela profiles (se existir)
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'profiles'
ORDER BY ordinal_position;

-- 3. Verificar usuário atual
SELECT 
    auth.uid() as current_user_id,
    auth.email() as current_user_email;

-- 4. Verificar se o usuário atual existe na tabela profiles
-- (ajustado para não depender da coluna email)
SELECT 
    user_id,
    is_admin,
    created_at
FROM profiles 
WHERE user_id = auth.uid();

-- 5. Se o usuário não existir na tabela profiles, criar
-- (ajustado para não incluir email se a coluna não existir)
INSERT INTO profiles (user_id, is_admin, created_at)
SELECT 
    auth.uid(),
    true, -- Definir como admin
    NOW()
WHERE NOT EXISTS (
    SELECT 1 FROM profiles WHERE user_id = auth.uid()
);

-- 6. Se o usuário existir mas não for admin, tornar admin
UPDATE profiles 
SET is_admin = true
WHERE user_id = auth.uid() 
AND is_admin = false;

-- 7. Verificar novamente o status
SELECT 
    user_id,
    is_admin,
    created_at,
    updated_at
FROM profiles 
WHERE user_id = auth.uid();

-- 8. Testar a função set_system_setting
SELECT set_system_setting(
    'test_admin_status', 
    'true', 
    'Teste para verificar se o usuário tem privilégios de admin'
);

-- 9. Verificar se a configuração foi criada
SELECT 
    setting_key,
    setting_value,
    description,
    created_at
FROM system_settings 
WHERE setting_key = 'test_admin_status';

-- 10. Limpar configuração de teste
DELETE FROM system_settings WHERE setting_key = 'test_admin_status'; 