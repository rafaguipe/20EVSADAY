-- Script para verificar exatamente qual usuário você é
-- Execute no Supabase SQL Editor

-- 1. Verificar usuário atual
SELECT 
    auth.uid() as current_user_id,
    auth.email() as current_user_email;

-- 2. Verificar todos os usuários na tabela profiles
SELECT 
    'Todos os usuários na tabela profiles:' as status,
    user_id,
    username,
    is_admin,
    created_at,
    updated_at
FROM profiles 
ORDER BY is_admin DESC, created_at;

-- 3. Verificar especificamente o usuário rafaguipe
SELECT 
    'Usuário rafaguipe:' as status,
    user_id,
    username,
    is_admin,
    created_at,
    updated_at
FROM profiles 
WHERE username = 'rafaguipe';

-- 4. Verificar se você existe na tabela profiles
SELECT 
    'Você existe na tabela profiles?' as pergunta,
    CASE 
        WHEN EXISTS (SELECT 1 FROM profiles WHERE user_id = auth.uid()) 
        THEN 'SIM - Você existe na tabela'
        ELSE 'NÃO - Você não existe na tabela'
    END as resposta;

-- 5. Comparar IDs
SELECT 
    'Comparação de IDs:' as status,
    auth.uid() as seu_user_id,
    (SELECT user_id FROM profiles WHERE username = 'rafaguipe') as rafaguipe_user_id,
    CASE 
        WHEN auth.uid() = (SELECT user_id FROM profiles WHERE username = 'rafaguipe') 
        THEN 'VOCÊ É O RAFAGUIPE'
        ELSE 'VOCÊ NÃO É O RAFAGUIPE - Você está logado com uma conta diferente'
    END as resultado;

-- 6. Verificar se você tem is_admin = true
SELECT 
    'Você é admin?' as pergunta,
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM profiles 
            WHERE user_id = auth.uid() 
            AND is_admin = true
        ) THEN 'SIM - Você tem is_admin = true'
        ELSE 'NÃO - Você não tem is_admin = true ou não existe na tabela'
    END as resposta;

-- 7. Mostrar diferença entre os usuários
SELECT 
    'Resumo:' as status,
    'Você está logado como: ' || auth.email() as seu_email,
    'Mas o admin é: rafaguipe' as admin_email,
    'Você precisa fazer login como rafaguipe no SQL Editor' as acao_necessaria; 