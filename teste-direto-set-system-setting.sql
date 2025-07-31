-- Script para testar diretamente a função set_system_setting
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

-- 3. Testar função set_system_setting diretamente
SELECT set_system_setting(
    'teste_direto', 
    'funcionou', 
    'Teste direto da função set_system_setting'
);

-- 4. Verificar se funcionou
SELECT 
    'Teste funcionou?' as pergunta,
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM system_settings 
            WHERE setting_key = 'teste_direto'
        ) THEN 'SIM - Configuração criada'
        ELSE 'NÃO - Configuração não foi criada'
    END as resposta;

-- 5. Mostrar a configuração criada
SELECT 
    setting_key,
    setting_value,
    description,
    created_at
FROM system_settings 
WHERE setting_key = 'teste_direto';

-- 6. Limpar teste
DELETE FROM system_settings WHERE setting_key = 'teste_direto';

-- 7. Confirmar limpeza
SELECT 
    'Teste limpo?' as pergunta,
    CASE 
        WHEN NOT EXISTS (
            SELECT 1 FROM system_settings 
            WHERE setting_key = 'teste_direto'
        ) THEN 'SIM - Teste removido'
        ELSE 'NÃO - Teste ainda existe'
    END as resposta; 