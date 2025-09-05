-- Script para verificar a estrutura completa da tabela badges
-- Execute no Supabase SQL Editor

-- 1. Verificar se a tabela badges existe
SELECT 
    'Tabela badges existe?' as pergunta,
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_name = 'badges'
        ) THEN 'SIM'
        ELSE 'NÃO'
    END as resposta;

-- 2. Verificar estrutura completa da tabela badges
SELECT 
    'Estrutura da tabela badges:' as info,
    column_name,
    data_type,
    is_nullable,
    column_default,
    ordinal_position
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'badges'
ORDER BY ordinal_position;

-- 3. Verificar dados atuais da tabela badges
SELECT 
    'Dados atuais da tabela badges:' as status,
    COUNT(*) as total_badges
FROM badges;

-- 4. Mostrar todos os badges existentes com suas colunas
SELECT 
    'Badges existentes:' as info,
    name,
    description,
    icon,
    created_at
FROM badges 
LIMIT 10;

-- 5. Verificar se há constraints na tabela
SELECT 
    'Constraints da tabela badges:' as info,
    constraint_name,
    constraint_type
FROM information_schema.table_constraints 
WHERE table_schema = 'public' 
AND table_name = 'badges'; 