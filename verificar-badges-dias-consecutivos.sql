-- Script para verificar e corrigir badges de dias consecutivos
-- Execute este script no SQL Editor do Supabase

-- 1. Verificar estrutura da tabela user_badges
SELECT 
    'Estrutura user_badges:' as info,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'user_badges' 
ORDER BY ordinal_position;

-- 2. Verificar badges de dias consecutivos existentes
SELECT 
    'Badges de dias consecutivos:' as info,
    id,
    name,
    description,
    icon
FROM badges 
WHERE name IN ('Persistente', 'Dedicado', 'Mestre da Persistência', 'Semi-Anual Consciencial', 'Anual Consciencial')
ORDER BY name;

-- 3. Verificar EVs de um usuário específico (substitua pelo seu user_id)
-- Substitua 'SEU_USER_ID_AQUI' pelo seu user_id real
WITH user_evs AS (
    SELECT 
        user_id,
        created_at,
        DATE(created_at) as ev_date
    FROM evs 
    WHERE user_id = 'SEU_USER_ID_AQUI'  -- SUBSTITUA AQUI
    ORDER BY created_at
),
daily_evs AS (
    SELECT DISTINCT ev_date
    FROM user_evs
    ORDER BY ev_date
),
consecutive_days AS (
    SELECT 
        ev_date,
        ROW_NUMBER() OVER (ORDER BY ev_date) as row_num,
        ev_date - (ROW_NUMBER() OVER (ORDER BY ev_date) || ' days')::interval as grp
    FROM daily_evs
),
consecutive_groups AS (
    SELECT 
        grp,
        COUNT(*) as consecutive_count
    FROM consecutive_days
    GROUP BY grp
)
SELECT 
    'Análise de dias consecutivos:' as info,
    MAX(consecutive_count) as max_consecutive_days,
    COUNT(DISTINCT ev_date) as total_days_with_evs,
    MIN(ev_date) as first_ev_date,
    MAX(ev_date) as last_ev_date
FROM consecutive_groups, daily_evs;

-- 4. Verificar badges atribuídas ao usuário
SELECT 
    'Badges atribuídas:' as info,
    ub.id,
    b.name,
    b.description,
    ub.awarded_at
FROM user_badges ub
JOIN badges b ON ub.badge_id = b.id
WHERE ub.user_id = 'SEU_USER_ID_AQUI'  -- SUBSTITUA AQUI
ORDER BY ub.awarded_at DESC;

-- 5. Função para calcular dias consecutivos (para teste)
CREATE OR REPLACE FUNCTION calculate_consecutive_days(user_uuid UUID)
RETURNS INTEGER AS $$
DECLARE
    max_consecutive INTEGER := 0;
    current_consecutive INTEGER := 0;
    prev_date DATE := NULL;
    curr_date DATE;
BEGIN
    FOR curr_date IN 
        SELECT DISTINCT DATE(created_at)
        FROM evs 
        WHERE user_id = user_uuid
        ORDER BY DATE(created_at)
    LOOP
        IF prev_date IS NULL THEN
            current_consecutive := 1;
        ELSIF curr_date = prev_date + INTERVAL '1 day' THEN
            current_consecutive := current_consecutive + 1;
        ELSE
            max_consecutive := GREATEST(max_consecutive, current_consecutive);
            current_consecutive := 1;
        END IF;
        prev_date := curr_date;
    END LOOP;
    
    max_consecutive := GREATEST(max_consecutive, current_consecutive);
    RETURN max_consecutive;
END;
$$ LANGUAGE plpgsql;

-- 6. Testar a função (substitua pelo seu user_id)
SELECT 
    'Teste da função:' as info,
    calculate_consecutive_days('SEU_USER_ID_AQUI') as dias_consecutivos;  -- SUBSTITUA AQUI

-- 7. Verificar se o usuário deveria ter badges de dias consecutivos
SELECT 
    'Análise de badges:' as info,
    b.name,
    b.description,
    CASE 
        WHEN b.name = 'Persistente' AND calculate_consecutive_days('SEU_USER_ID_AQUI') >= 7 THEN 'DEVERIA TER'
        WHEN b.name = 'Dedicado' AND calculate_consecutive_days('SEU_USER_ID_AQUI') >= 30 THEN 'DEVERIA TER'
        WHEN b.name = 'Mestre da Persistência' AND calculate_consecutive_days('SEU_USER_ID_AQUI') >= 90 THEN 'DEVERIA TER'
        WHEN b.name = 'Semi-Anual Consciencial' AND calculate_consecutive_days('SEU_USER_ID_AQUI') >= 180 THEN 'DEVERIA TER'
        WHEN b.name = 'Anual Consciencial' AND calculate_consecutive_days('SEU_USER_ID_AQUI') >= 360 THEN 'DEVERIA TER'
        ELSE 'NÃO DEVERIA TER'
    END as status
FROM badges b
WHERE b.name IN ('Persistente', 'Dedicado', 'Mestre da Persistência', 'Semi-Anual Consciencial', 'Anual Consciencial')
ORDER BY b.name; 