-- Script para forçar sincronização das badges
-- Execute este script para verificar se há problemas

-- 1. Verificar todas as badges do rafaguipe
SELECT 
    'Todas as badges do rafaguipe:' as info,
    b.name,
    b.description,
    ub.awarded_at,
    CASE 
        WHEN b.name IN ('Persistente', 'Dedicado', 'Mestre da Persistência', 'Semi-Anual Consciencial', 'Anual Consciencial') 
        THEN 'BADGE DE DIAS CONSECUTIVOS'
        ELSE 'OUTRA BADGE'
    END as tipo
FROM user_badges ub
JOIN badges b ON ub.badge_id = b.id
JOIN profiles p ON ub.user_id = p.user_id
WHERE p.username = 'rafaguipe'
ORDER BY ub.awarded_at DESC;

-- 2. Verificar se a badge Persistente existe na tabela badges
SELECT 
    'Badge Persistente na tabela badges:' as info,
    id,
    name,
    description,
    icon
FROM badges 
WHERE name = 'Persistente';

-- 3. Verificar se há duplicatas na user_badges
SELECT 
    'Verificar duplicatas:' as info,
    user_id,
    badge_id,
    COUNT(*) as quantidade
FROM user_badges ub
JOIN profiles p ON ub.user_id = p.user_id
WHERE p.username = 'rafaguipe'
GROUP BY user_id, badge_id
HAVING COUNT(*) > 1;

-- 4. Verificar estrutura da tabela user_badges
SELECT 
    'Estrutura user_badges:' as info,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'user_badges' 
ORDER BY ordinal_position;

-- 5. Verificar se há problemas com a função
SELECT 
    'Teste da função:' as info,
    calculate_consecutive_days((SELECT user_id FROM profiles WHERE username = 'rafaguipe')) as dias_consecutivos,
    (SELECT COUNT(*) FROM evs WHERE user_id = (SELECT user_id FROM profiles WHERE username = 'rafaguipe')) as total_evs,
    (SELECT COUNT(DISTINCT DATE(created_at)) FROM evs WHERE user_id = (SELECT user_id FROM profiles WHERE username = 'rafaguipe')) as dias_com_evs;

-- 6. Verificar se a badge Persistente deveria estar atribuída
SELECT 
    'Análise da badge Persistente:' as info,
    CASE 
        WHEN calculate_consecutive_days((SELECT user_id FROM profiles WHERE username = 'rafaguipe')) >= 7 
        THEN 'DEVERIA TER A BADGE'
        ELSE 'NÃO DEVERIA TER A BADGE'
    END as status,
    calculate_consecutive_days((SELECT user_id FROM profiles WHERE username = 'rafaguipe')) as dias_atual,
    7 as dias_necessarios;

-- 7. Verificar se a badge está realmente atribuída
SELECT 
    'Verificação final:' as info,
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM user_badges ub
            JOIN badges b ON ub.badge_id = b.id
            JOIN profiles p ON ub.user_id = p.user_id
            WHERE p.username = 'rafaguipe' AND b.name = 'Persistente'
        ) 
        THEN 'BADGE PERSISTENTE ATRIBUÍDA ✅'
        ELSE 'BADGE PERSISTENTE NÃO ATRIBUÍDA ❌'
    END as status; 