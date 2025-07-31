-- Script para configurar admin incluindo username obrigatório
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

-- 3. Verificar registros duplicados
SELECT 
    user_id,
    COUNT(*) as total_registros
FROM profiles 
GROUP BY user_id 
HAVING COUNT(*) > 1;

-- 4. Limpar duplicados (método simples)
DELETE FROM profiles 
WHERE id NOT IN (
    SELECT MAX(id) 
    FROM profiles 
    GROUP BY user_id
);

-- 5. Garantir que o usuário atual seja admin (incluindo username)
UPDATE profiles 
SET 
    is_admin = true, 
    updated_at = NOW(),
    username = COALESCE(username, 'admin_' || SUBSTRING(auth.uid()::text, 1, 8))
WHERE user_id = auth.uid();

-- 6. Se o usuário não existir, criar com username
INSERT INTO profiles (
    user_id, 
    username,
    is_admin, 
    created_at, 
    updated_at
)
SELECT 
    auth.uid(),
    'admin_' || SUBSTRING(auth.uid()::text, 1, 8),
    true,
    NOW(),
    NOW()
WHERE NOT EXISTS (
    SELECT 1 FROM profiles WHERE user_id = auth.uid()
);

-- 7. Verificar resultado final
SELECT 
    'Status final:' as status,
    user_id,
    username,
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

-- 9. Verificar constraints
SELECT 
    conname as constraint_name,
    contype as constraint_type
FROM pg_constraint 
WHERE conrelid = 'profiles'::regclass;

-- 10. Resumo final
SELECT 
    'CONFIGURAÇÃO CONCLUÍDA' as status,
    'Você agora é administrador e pode usar a função set_system_setting' as mensagem; 