-- Script para adicionar badges de marcos de EVS
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

-- 2. Adicionar badge para 1000 EVS
INSERT INTO badges (name, description, icon, rarity, created_at) VALUES
    ('1000_evs_milestone', 'Marco dos 1000 EVS', '🎯', 'rare', NOW())
ON CONFLICT (name) DO UPDATE SET
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    rarity = EXCLUDED.rarity,
    updated_at = NOW();

-- 3. Adicionar badge para 2000 EVS
INSERT INTO badges (name, description, icon, rarity, created_at) VALUES
    ('2000_evs_milestone', 'Marco dos 2000 EVS', '🏆', 'epic', NOW())
ON CONFLICT (name) DO UPDATE SET
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    rarity = EXCLUDED.rarity,
    updated_at = NOW();

-- 4. Verificar badges criados
SELECT 
    'Badges criados:' as status,
    name,
    description,
    icon,
    rarity,
    created_at
FROM badges 
WHERE name IN ('1000_evs_milestone', '2000_evs_milestone')
ORDER BY name;

-- 5. Resumo final
SELECT 
    'BADGES CRIADOS COM SUCESSO' as status,
    'Badges para marcos de 1000 e 2000 EVS foram adicionados!' as mensagem,
    'Agora você pode atribuir esses badges aos usuários' as proximo_passo; 