-- Script simples para testar cálculo de dias consecutivos
-- Substitua 'SEU_USER_ID_AQUI' pelo seu user_id real

-- 1. Verificar todos os EVs do usuário por data
SELECT 
    'EVs por data:' as info,
    DATE(created_at) as data,
    COUNT(*) as total_evs_no_dia
FROM evs 
WHERE user_id = 'SEU_USER_ID_AQUI'  -- SUBSTITUA AQUI
GROUP BY DATE(created_at)
ORDER BY DATE(created_at);

-- 2. Calcular dias consecutivos usando a função
SELECT 
    'Dias consecutivos calculados:' as info,
    calculate_consecutive_days('SEU_USER_ID_AQUI') as dias_consecutivos;  -- SUBSTITUA AQUI

-- 3. Verificar se deveria ter badges
SELECT 
    'Análise de badges:' as info,
    b.name,
    CASE 
        WHEN calculate_consecutive_days('SEU_USER_ID_AQUI') >= 
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
    calculate_consecutive_days('SEU_USER_ID_AQUI') as dias_atual,
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