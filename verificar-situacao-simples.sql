-- Script simples para verificar a situação atual
-- Execute no Supabase SQL Editor

-- 1. Verificar usuário atual
SELECT 
    auth.uid() as current_user_id,
    auth.email() as current_user_email;

-- 2. Verificar estrutura da tabela profiles
SELECT 
    column_name, 
    data_type, 
    is_nullable
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'profiles'
ORDER BY ordinal_position;

-- 3. Verificar seu status na tabela profiles (sem depender de colunas específicas)
SELECT 
    'Seu status na tabela profiles:' as status,
    *
FROM profiles 
WHERE user_id = auth.uid();

-- 4. Verificar se a função set_system_setting existe
SELECT 
    'Função set_system_setting existe?' as pergunta,
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM pg_proc 
            WHERE proname = 'set_system_setting'
        ) THEN 'SIM'
        ELSE 'NÃO'
    END as resposta;

-- 5. Verificar se a tabela system_settings existe
SELECT 
    'Tabela system_settings existe?' as pergunta,
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_name = 'system_settings'
        ) THEN 'SIM'
        ELSE 'NÃO'
    END as resposta;

-- 6. Verificar estrutura da tabela system_settings (se existir)
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'system_settings'
ORDER BY ordinal_position;

-- 7. Testar função get_system_setting (deve funcionar)
SELECT 
    'Testando get_system_setting:' as teste,
    get_system_setting('loja_visible') as valor_loja_visible; 