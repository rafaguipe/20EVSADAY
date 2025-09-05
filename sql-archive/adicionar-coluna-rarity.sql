-- Script para adicionar coluna rarity à tabela badges
-- Execute no Supabase SQL Editor

-- 1. Verificar se a coluna rarity já existe
SELECT 
    'Coluna rarity existe?' as pergunta,
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_schema = 'public' 
            AND table_name = 'badges' 
            AND column_name = 'rarity'
        ) THEN 'SIM'
        ELSE 'NÃO'
    END as resposta;

-- 2. Adicionar coluna rarity se não existir
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'badges' 
        AND column_name = 'rarity'
    ) THEN
        ALTER TABLE badges ADD COLUMN rarity VARCHAR(20) DEFAULT 'common';
        RAISE NOTICE 'Coluna rarity adicionada com sucesso!';
    ELSE
        RAISE NOTICE 'Coluna rarity já existe!';
    END IF;
END $$;

-- 3. Verificar estrutura atualizada da tabela badges
SELECT 
    'Estrutura atualizada da tabela badges:' as info,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'badges'
ORDER BY ordinal_position;

-- 4. Atualizar badges existentes com rarity padrão
UPDATE badges 
SET rarity = 'common' 
WHERE rarity IS NULL;

-- 5. Verificar badges com rarity
SELECT 
    'Badges com rarity:' as status,
    name,
    description,
    icon,
    rarity,
    created_at
FROM badges 
ORDER BY created_at DESC
LIMIT 10; 