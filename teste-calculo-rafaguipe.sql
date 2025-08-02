-- Script específico para testar o cálculo de dias consecutivos do rafaguipe
-- Execute este script no SQL Editor do Supabase

-- 1. Verificar o user_id do rafaguipe
SELECT 
    'User ID do rafaguipe:' as info,
    user_id,
    username,
    created_at
FROM profiles 
WHERE username = 'rafaguipe';

-- 2. Verificar todos os EVs do rafaguipe por data
SELECT 
    'EVs do rafaguipe por data:' as info,
    DATE(created_at) as data,
    COUNT(*) as total_evs_no_dia
FROM evs 
WHERE user_id = (SELECT user_id FROM profiles WHERE username = 'rafaguipe')
GROUP BY DATE(created_at)
ORDER BY DATE(created_at);

-- 3. Calcular dias consecutivos usando a função SQL
SELECT 
    'Dias consecutivos calculados (SQL):' as info,
    calculate_consecutive_days((SELECT user_id FROM profiles WHERE username = 'rafaguipe')) as dias_consecutivos;

-- 4. Análise detalhada dos dias consecutivos
WITH user_evs AS (
    SELECT DISTINCT DATE(created_at) as ev_date
    FROM evs 
    WHERE user_id = (SELECT user_id FROM profiles WHERE username = 'rafaguipe')
    ORDER BY DATE(created_at)
),
consecutive_analysis AS (
    SELECT 
        ev_date,
        ROW_NUMBER() OVER (ORDER BY ev_date) as row_num,
        ev_date - (ROW_NUMBER() OVER (ORDER BY ev_date) || ' days')::interval as grp
    FROM user_evs
),
consecutive_groups AS (
    SELECT 
        grp,
        COUNT(*) as consecutive_count,
        MIN(ev_date) as start_date,
        MAX(ev_date) as end_date
    FROM consecutive_analysis
    GROUP BY grp
)
SELECT 
    'Análise detalhada:' as info,
    consecutive_count as dias_consecutivos,
    start_date as data_inicio,
    end_date as data_fim,
    CASE 
        WHEN consecutive_count >= 14 THEN 'SEQUÊNCIA ATUAL!'
        ELSE 'Sequência anterior'
    END as status
FROM consecutive_groups
ORDER BY consecutive_count DESC;

-- 5. Verificar se deveria ter badges
SELECT 
    'Análise de badges:' as info,
    b.name,
    CASE 
        WHEN calculate_consecutive_days((SELECT user_id FROM profiles WHERE username = 'rafaguipe')) >= 
            CASE b.name
                WHEN 'Persistente' THEN 7
                WHEN 'Dedicado' THEN 30
                WHEN 'Mestre da Persistência' THEN 90
                WHEN 'Semi-Anual Consciencial' THEN 180
                WHEN 'Anual Consciencial' THEN 360
                ELSE 0
            END
        THEN 'DEVERIA TER'
        ELSE 'NÃO DEVERIA TER'
    END as status,
    calculate_consecutive_days((SELECT user_id FROM profiles WHERE username = 'rafaguipe')) as dias_atual,
    CASE b.name
        WHEN 'Persistente' THEN 7
        WHEN 'Dedicado' THEN 30
        WHEN 'Mestre da Persistência' THEN 90
        WHEN 'Semi-Anual Consciencial' THEN 180
        WHEN 'Anual Consciencial' THEN 360
        ELSE 0
    END as dias_necessarios
FROM badges b
WHERE b.name IN ('Persistente', 'Dedicado', 'Mestre da Persistência', 'Semi-Anual Consciencial', 'Anual Consciencial')
ORDER BY b.name;

-- 6. Verificar badges já atribuídas
SELECT 
    'Badges já atribuídas:' as info,
    b.name,
    ub.awarded_at
FROM user_badges ub
JOIN badges b ON ub.badge_id = b.id
WHERE ub.user_id = (SELECT user_id FROM profiles WHERE username = 'rafaguipe')
AND b.name IN ('Persistente', 'Dedicado', 'Mestre da Persistência', 'Semi-Anual Consciencial', 'Anual Consciencial')
ORDER BY ub.awarded_at DESC; 