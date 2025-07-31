-- Script para tornar o usuário atual admin
-- Execute no Supabase SQL Editor

-- 1. Verificar usuário atual
SELECT 
    auth.uid() as current_user_id,
    auth.email() as current_user_email;

-- 2. Verificar status atual
SELECT 
    'Status atual:' as status,
    user_id,
    username,
    is_admin,
    created_at,
    updated_at
FROM profiles 
WHERE user_id = auth.uid();

-- 3. Tornar admin
UPDATE profiles 
SET 
    is_admin = true,
    updated_at = NOW()
WHERE user_id = auth.uid();

-- 4. Se não existir, criar
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

-- 5. Verificar resultado
SELECT 
    'Status após alteração:' as status,
    user_id,
    username,
    is_admin,
    created_at,
    updated_at
FROM profiles 
WHERE user_id = auth.uid();

-- 6. Testar função set_system_setting
SELECT 
    'Testando função set_system_setting:' as teste,
    set_system_setting(
        'teste_admin', 
        'funcionou', 
        'Teste após tornar admin'
    ) as resultado;

-- 7. Verificar se funcionou
SELECT 
    'Teste funcionou?' as pergunta,
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM system_settings 
            WHERE setting_key = 'teste_admin'
        ) THEN 'SIM - Configuração criada com sucesso!'
        ELSE 'NÃO - Ainda há problema'
    END as resposta;

-- 8. Limpar teste
DELETE FROM system_settings WHERE setting_key = 'teste_admin'; 