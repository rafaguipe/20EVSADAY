-- Script para verificar a estrutura real da tabela profiles
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

-- 3. Verificar estrutura completa da tabela profiles
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default,
    character_maximum_length
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'profiles'
ORDER BY ordinal_position;

-- 4. Verificar constraints da tabela
SELECT 
    conname as constraint_name,
    contype as constraint_type,
    pg_get_constraintdef(oid) as constraint_definition
FROM pg_constraint 
WHERE conrelid = 'profiles'::regclass;

-- 5. Verificar dados existentes (primeiros 5 registros)
SELECT * FROM profiles LIMIT 5;

-- 6. Verificar se o usuário atual já existe
SELECT * FROM profiles WHERE user_id = auth.uid();

-- 7. Verificar registros duplicados
SELECT 
    user_id,
    COUNT(*) as total_registros
FROM profiles 
GROUP BY user_id 
HAVING COUNT(*) > 1; 