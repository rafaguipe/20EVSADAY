-- Script para verificar a estrutura real da tabela profiles
-- Execute no Supabase SQL Editor

-- 1. Verificar se a tabela profiles existe
SELECT EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'profiles'
) as profiles_table_exists;

-- 2. Verificar estrutura da tabela profiles (se existir)
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'profiles'
ORDER BY ordinal_position;

-- 3. Verificar dados existentes na tabela profiles (se existir)
SELECT * FROM profiles LIMIT 5;

-- 4. Verificar usuário atual
SELECT 
    auth.uid() as current_user_id,
    auth.email() as current_user_email;

-- 5. Verificar se o usuário atual existe na tabela profiles (ajustar conforme estrutura real)
-- Esta query será ajustada após verificar a estrutura real
SELECT * FROM profiles WHERE user_id = auth.uid(); 