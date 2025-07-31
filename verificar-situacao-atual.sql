-- Script para verificar a situação atual
-- Execute no Supabase SQL Editor

-- 1. Verificar usuário atual
SELECT 
    auth.uid() as current_user_id,
    auth.email() as current_user_email;

-- 2. Verificar se você é o usuário rafaguipe
SELECT 
    'Você é o rafaguipe?' as pergunta,
    CASE 
        WHEN auth.email() = 'rafaguipe@example.com' THEN 'SIM'
        ELSE 'NÃO - Você é: ' || auth.email()
    END as resposta;

-- 3. Verificar seu status na tabela profiles
SELECT 
    'Seu status na tabela profiles:' as status,
    user_id,
    username,
    is_admin,
    created_at,
    updated_at
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

-- 8. Verificar se você tem permissões de escrita na tabela system_settings
SELECT 
    'Você pode inserir na system_settings?' as pergunta,
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM information_schema.table_privileges 
            WHERE table_schema = 'public' 
            AND table_name = 'system_settings'
            AND privilege_type = 'INSERT'
            AND grantee = current_user
        ) THEN 'SIM'
        ELSE 'NÃO'
    END as resposta;

-- 9. Verificar RLS (Row Level Security) na tabela system_settings
SELECT 
    'RLS ativo na system_settings?' as pergunta,
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM pg_tables 
            WHERE schemaname = 'public' 
            AND tablename = 'system_settings'
            AND rowsecurity = true
        ) THEN 'SIM'
        ELSE 'NÃO'
    END as resposta; 