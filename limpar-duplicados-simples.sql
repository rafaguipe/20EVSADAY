-- Script simples para limpar duplicados na tabela profiles
-- Execute no Supabase SQL Editor

-- 1. Verificar usuário atual
SELECT 
    auth.uid() as current_user_id,
    auth.email() as current_user_email;

-- 2. Verificar registros duplicados
SELECT 
    user_id,
    COUNT(*) as total_registros
FROM profiles 
GROUP BY user_id 
HAVING COUNT(*) > 1;

-- 3. Verificar registros do usuário atual
SELECT 
    id,
    user_id,
    is_admin,
    created_at,
    updated_at
FROM profiles 
WHERE user_id = auth.uid()
ORDER BY created_at;

-- 4. Limpar duplicados (método simples)
-- Primeiro, manter apenas um registro por usuário (o mais recente)
DELETE FROM profiles 
WHERE id NOT IN (
    SELECT MAX(id) 
    FROM profiles 
    GROUP BY user_id
);

-- 5. Verificar se ainda há duplicados
SELECT 
    user_id,
    COUNT(*) as total_registros
FROM profiles 
GROUP BY user_id 
HAVING COUNT(*) > 1;

-- 6. Garantir que o usuário atual seja admin
UPDATE profiles 
SET is_admin = true, updated_at = NOW()
WHERE user_id = auth.uid();

-- 7. Verificar registro do usuário atual
SELECT 
    id,
    user_id,
    is_admin,
    created_at,
    updated_at
FROM profiles 
WHERE user_id = auth.uid();

-- 8. Adicionar constraint única
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

-- 9. Testar função set_system_setting
SELECT set_system_setting(
    'test_admin_status', 
    'true', 
    'Teste para verificar se o usuário tem privilégios de admin'
);

-- 10. Verificar se funcionou
SELECT 
    setting_key,
    setting_value,
    description,
    created_at
FROM system_settings 
WHERE setting_key = 'test_admin_status';

-- 11. Limpar teste
DELETE FROM system_settings WHERE setting_key = 'test_admin_status'; 