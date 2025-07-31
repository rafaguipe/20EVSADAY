-- Script para limpar duplicados na tabela profiles
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

-- 3. Verificar registros duplicados
SELECT 
    user_id,
    COUNT(*) as total_registros,
    COUNT(CASE WHEN is_admin = true THEN 1 END) as registros_admin
FROM profiles 
GROUP BY user_id 
HAVING COUNT(*) > 1
ORDER BY total_registros DESC;

-- 4. Verificar todos os registros do usuário atual
SELECT 
    id,
    user_id,
    is_admin,
    created_at,
    updated_at
FROM profiles 
WHERE user_id = auth.uid()
ORDER BY created_at;

-- 5. Limpar duplicados mantendo apenas o registro mais recente com is_admin = true
WITH ranked_profiles AS (
    SELECT 
        id,
        user_id,
        is_admin,
        created_at,
        updated_at,
        ROW_NUMBER() OVER (
            PARTITION BY user_id 
            ORDER BY 
                is_admin DESC,  -- Priorizar registros admin
                updated_at DESC, -- Depois por data mais recente
                created_at DESC  -- Por último por data de criação
        ) as rn
    FROM profiles
)
DELETE FROM profiles 
WHERE id IN (
    SELECT id 
    FROM ranked_profiles 
    WHERE rn > 1
);

-- 6. Verificar resultado após limpeza
SELECT 
    user_id,
    COUNT(*) as total_registros
FROM profiles 
GROUP BY user_id 
HAVING COUNT(*) > 1;

-- 7. Verificar registro do usuário atual após limpeza
SELECT 
    id,
    user_id,
    is_admin,
    created_at,
    updated_at
FROM profiles 
WHERE user_id = auth.uid();

-- 8. Garantir que o usuário atual seja admin
UPDATE profiles 
SET is_admin = true, updated_at = NOW()
WHERE user_id = auth.uid();

-- 9. Adicionar constraint única (agora deve funcionar)
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

-- 10. Verificar constraints da tabela
SELECT 
    conname as constraint_name,
    contype as constraint_type,
    pg_get_constraintdef(oid) as constraint_definition
FROM pg_constraint 
WHERE conrelid = 'profiles'::regclass;

-- 11. Testar função set_system_setting
SELECT set_system_setting(
    'test_admin_status', 
    'true', 
    'Teste para verificar se o usuário tem privilégios de admin'
);

-- 12. Verificar se funcionou
SELECT 
    setting_key,
    setting_value,
    description,
    created_at
FROM system_settings 
WHERE setting_key = 'test_admin_status';

-- 13. Limpar teste
DELETE FROM system_settings WHERE setting_key = 'test_admin_status'; 