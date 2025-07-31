-- Script para configurar admin primeiro, depois testar
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
    COUNT(*) as total_registros
FROM profiles 
GROUP BY user_id 
HAVING COUNT(*) > 1;

-- 4. Verificar registros do usuário atual
SELECT 
    id,
    user_id,
    is_admin,
    created_at,
    updated_at
FROM profiles 
WHERE user_id = auth.uid()
ORDER BY created_at;

-- 5. Limpar duplicados (método simples)
-- Primeiro, manter apenas um registro por usuário (o mais recente)
DELETE FROM profiles 
WHERE id NOT IN (
    SELECT MAX(id) 
    FROM profiles 
    GROUP BY user_id
);

-- 6. Verificar se ainda há duplicados
SELECT 
    user_id,
    COUNT(*) as total_registros
FROM profiles 
GROUP BY user_id 
HAVING COUNT(*) > 1;

-- 7. Garantir que o usuário atual seja admin
UPDATE profiles 
SET is_admin = true, updated_at = NOW()
WHERE user_id = auth.uid();

-- 8. Se o usuário não existir, criar
INSERT INTO profiles (user_id, is_admin, created_at, updated_at)
SELECT 
    auth.uid(),
    true,
    NOW(),
    NOW()
WHERE NOT EXISTS (
    SELECT 1 FROM profiles WHERE user_id = auth.uid()
);

-- 9. Verificar registro do usuário atual
SELECT 
    id,
    user_id,
    is_admin,
    created_at,
    updated_at
FROM profiles 
WHERE user_id = auth.uid();

-- 10. Adicionar constraint única
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

-- 11. Verificar se agora você é admin
SELECT 
    'Verificando se você é admin...' as status,
    user_id,
    is_admin
FROM profiles 
WHERE user_id = auth.uid();

-- 12. SÓ AGORA testar função set_system_setting
DO $$
BEGIN
    -- Verificar se o usuário é admin antes de testar
    IF EXISTS (
        SELECT 1 FROM profiles 
        WHERE user_id = auth.uid() 
        AND is_admin = true
    ) THEN
        -- Testar a função
        PERFORM set_system_setting(
            'test_admin_status', 
            'true', 
            'Teste para verificar se o usuário tem privilégios de admin'
        );
        RAISE NOTICE 'Função set_system_setting testada com sucesso!';
        
        -- Verificar se funcionou
        IF EXISTS (
            SELECT 1 FROM system_settings 
            WHERE setting_key = 'test_admin_status'
        ) THEN
            RAISE NOTICE 'Configuração de teste criada com sucesso!';
            
            -- Limpar teste
            DELETE FROM system_settings WHERE setting_key = 'test_admin_status';
            RAISE NOTICE 'Teste limpo com sucesso!';
        ELSE
            RAISE NOTICE 'ERRO: Configuração de teste não foi criada';
        END IF;
    ELSE
        RAISE NOTICE 'ERRO: Usuário não é admin. Verifique o registro na tabela profiles.';
    END IF;
END $$; 