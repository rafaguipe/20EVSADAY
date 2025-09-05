-- Script para atribuir automaticamente badges de dias consecutivos
-- Execute este script no SQL Editor do Supabase

-- Função para atribuir badge de dias consecutivos
CREATE OR REPLACE FUNCTION award_consecutive_days_badges()
RETURNS VOID AS $$
DECLARE
    user_record RECORD;
    consecutive_days INTEGER;
    badge_record RECORD;
BEGIN
    -- Para cada usuário
    FOR user_record IN 
        SELECT DISTINCT user_id 
        FROM evs 
        WHERE user_id IS NOT NULL
    LOOP
        -- Calcular dias consecutivos do usuário
        consecutive_days := calculate_consecutive_days(user_record.user_id);
        
        -- Verificar cada badge de dias consecutivos
        FOR badge_record IN 
            SELECT id, name 
            FROM badges 
            WHERE name IN ('Persistente', 'Dedicado', 'Mestre da Persistência', 'Semi-Anual Consciencial', 'Anual Consciencial')
        LOOP
            -- Verificar se o usuário já tem a badge
            IF NOT EXISTS (
                SELECT 1 FROM user_badges 
                WHERE user_id = user_record.user_id AND badge_id = badge_record.id
            ) THEN
                -- Verificar se merece a badge
                CASE badge_record.name
                    WHEN 'Persistente' THEN
                        IF consecutive_days >= 7 THEN
                            INSERT INTO user_badges (user_id, badge_id, awarded_at)
                            VALUES (user_record.user_id, badge_record.id, NOW());
                            RAISE NOTICE 'Badge Persistente atribuída ao usuário %', user_record.user_id;
                        END IF;
                    WHEN 'Dedicado' THEN
                        IF consecutive_days >= 30 THEN
                            INSERT INTO user_badges (user_id, badge_id, awarded_at)
                            VALUES (user_record.user_id, badge_record.id, NOW());
                            RAISE NOTICE 'Badge Dedicado atribuída ao usuário %', user_record.user_id;
                        END IF;
                    WHEN 'Mestre da Persistência' THEN
                        IF consecutive_days >= 90 THEN
                            INSERT INTO user_badges (user_id, badge_id, awarded_at)
                            VALUES (user_record.user_id, badge_record.id, NOW());
                            RAISE NOTICE 'Badge Mestre da Persistência atribuída ao usuário %', user_record.user_id;
                        END IF;
                    WHEN 'Semi-Anual Consciencial' THEN
                        IF consecutive_days >= 180 THEN
                            INSERT INTO user_badges (user_id, badge_id, awarded_at)
                            VALUES (user_record.user_id, badge_record.id, NOW());
                            RAISE NOTICE 'Badge Semi-Anual Consciencial atribuída ao usuário %', user_record.user_id;
                        END IF;
                    WHEN 'Anual Consciencial' THEN
                        IF consecutive_days >= 360 THEN
                            INSERT INTO user_badges (user_id, badge_id, awarded_at)
                            VALUES (user_record.user_id, badge_record.id, NOW());
                            RAISE NOTICE 'Badge Anual Consciencial atribuída ao usuário %', user_record.user_id;
                        END IF;
                END CASE;
            END IF;
        END LOOP;
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Executar a função para atribuir badges
SELECT award_consecutive_days_badges();

-- Verificar resultado
SELECT 
    'Resumo de badges atribuídas:' as info,
    COUNT(*) as total_user_badges,
    COUNT(DISTINCT user_id) as usuarios_com_badges
FROM user_badges ub
JOIN badges b ON ub.badge_id = b.id
WHERE b.name IN ('Persistente', 'Dedicado', 'Mestre da Persistência', 'Semi-Anual Consciencial', 'Anual Consciencial');

-- Listar badges de dias consecutivos por usuário
SELECT 
    'Badges de dias consecutivos por usuário:' as info,
    p.username,
    b.name as badge_name,
    ub.awarded_at
FROM user_badges ub
JOIN badges b ON ub.badge_id = b.id
JOIN profiles p ON ub.user_id = p.user_id
WHERE b.name IN ('Persistente', 'Dedicado', 'Mestre da Persistência', 'Semi-Anual Consciencial', 'Anual Consciencial')
ORDER BY p.username, b.name; 