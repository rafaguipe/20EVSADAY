-- Script simplificado para adicionar badges de marcos de EVS
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

-- 2. Verificar estrutura atual da tabela badges
SELECT 
    'Estrutura atual da tabela badges:' as info,
    column_name,
    data_type
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'badges'
ORDER BY ordinal_position;

-- 3. Adicionar badge para 1000 EVS (usando apenas colunas básicas)
INSERT INTO badges (name, description, icon, created_at) VALUES
    ('1000_evs_milestone', 'Marco dos 1000 EVS', '🎯', NOW())
ON CONFLICT (name) DO UPDATE SET
    description = EXCLUDED.description,
    icon = EXCLUDED.icon;

-- 4. Adicionar badge para 2000 EVS (usando apenas colunas básicas)
INSERT INTO badges (name, description, icon, created_at) VALUES
    ('2000_evs_milestone', 'Marco dos 2000 EVS', '🏆', NOW())
ON CONFLICT (name) DO UPDATE SET
    description = EXCLUDED.description,
    icon = EXCLUDED.icon;

-- 5. Verificar badges criados
SELECT 
    'Badges criados:' as status,
    name,
    description,
    icon,
    created_at
FROM badges 
WHERE name IN ('1000_evs_milestone', '2000_evs_milestone')
ORDER BY name;

-- 6. Resumo final
SELECT 
    'BADGES CRIADOS COM SUCESSO' as status,
    'Badges para marcos de 1000 e 2000 EVS foram adicionados!' as mensagem,
    'Agora você pode atribuir esses badges aos usuários' as proximo_passo; 