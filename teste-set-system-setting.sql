-- Script para testar especificamente a função set_system_setting
-- Execute no Supabase SQL Editor

-- 1. Verificar usuário atual
SELECT 
    auth.uid() as current_user_id,
    auth.email() as current_user_email;

-- 2. Verificar se você é admin
SELECT 
    'Você é admin?' as pergunta,
    is_admin as resposta
FROM profiles 
WHERE user_id = auth.uid();

-- 3. Verificar configuração atual
SELECT 
    'Configuração atual:' as status,
    setting_key,
    setting_value,
    description
FROM system_settings 
WHERE setting_key = 'loja_visible';

-- 4. Testar função set_system_setting
SELECT set_system_setting(
    'loja_visible', 
    'true', 
    'Teste da função set_system_setting'
);

-- 5. Verificar se foi alterado
SELECT 
    'Após alteração:' as status,
    setting_key,
    setting_value,
    description,
    updated_at
FROM system_settings 
WHERE setting_key = 'loja_visible';

-- 6. Reverter para o valor original
SELECT set_system_setting(
    'loja_visible', 
    'false', 
    'Revertendo para valor original'
);

-- 7. Verificar reversão
SELECT 
    'Após reversão:' as status,
    setting_key,
    setting_value,
    description
FROM system_settings 
WHERE setting_key = 'loja_visible'; 