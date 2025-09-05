-- Script para verificar a estrutura da tabela badges
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

-- 2. Verificar estrutura da tabela badges
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'badges'
ORDER BY ordinal_position;

-- 3. Verificar dados atuais da tabela badges
SELECT 
    'Dados atuais da tabela badges:' as status,
    COUNT(*) as total_badges
FROM badges;

-- 4. Mostrar alguns exemplos de badges existentes
SELECT 
    name,
    description,
    icon,
    rarity,
    created_at
FROM badges 
LIMIT 5; 