-- Script para atribuir badges de dias consecutivos ao rafaguipe
-- Execute este script APÓS executar o criar-funcao-e-testar-rafaguipe.sql

-- Atribuir badges de dias consecutivos ao rafaguipe
DO $$
DECLARE
    user_uuid UUID;
    consecutive_days INTEGER;
    badge_record RECORD;
BEGIN
    -- Obter user_id do rafaguipe
    SELECT user_id INTO user_uuid FROM profiles WHERE username = 'rafaguipe';
    
    IF user_uuid IS NULL THEN
        RAISE NOTICE 'Usuário rafaguipe não encontrado!';
        RETURN;
    END IF;
    
    -- Calcular dias consecutivos
    consecutive_days := calculate_consecutive_days(user_uuid);
    RAISE NOTICE 'Dias consecutivos do rafaguipe: %', consecutive_days;
    
    -- Verificar cada badge de dias consecutivos
    FOR badge_record IN 
        SELECT id, name 
        FROM badges 
        WHERE name IN ('Persistente', 'Dedicado', 'Mestre da Persistência', 'Semi-Anual Consciencial', 'Anual Consciencial')
    LOOP
        -- Verificar se o usuário já tem a badge
        IF NOT EXISTS (
            SELECT 1 FROM user_badges 
            WHERE user_id = user_uuid AND badge_id = badge_record.id
        ) THEN
            -- Verificar se merece a badge
            CASE badge_record.name
                WHEN 'Persistente' THEN
                    IF consecutive_days >= 7 THEN
                        INSERT INTO user_badges (user_id, badge_id, awarded_at)
                        VALUES (user_uuid, badge_record.id, NOW());
                        RAISE NOTICE 'Badge Persistente atribuída ao rafaguipe!';
                    END IF;
                WHEN 'Dedicado' THEN
                    IF consecutive_days >= 30 THEN
                        INSERT INTO user_badges (user_id, badge_id, awarded_at)
                        VALUES (user_uuid, badge_record.id, NOW());
                        RAISE NOTICE 'Badge Dedicado atribuída ao rafaguipe!';
                    END IF;
                WHEN 'Mestre da Persistência' THEN
                    IF consecutive_days >= 90 THEN
                        INSERT INTO user_badges (user_id, badge_id, awarded_at)
                        VALUES (user_uuid, badge_record.id, NOW());
                        RAISE NOTICE 'Badge Mestre da Persistência atribuída ao rafaguipe!';
                    END IF;
                WHEN 'Semi-Anual Consciencial' THEN
                    IF consecutive_days >= 180 THEN
                        INSERT INTO user_badges (user_id, badge_id, awarded_at)
                        VALUES (user_uuid, badge_record.id, NOW());
                        RAISE NOTICE 'Badge Semi-Anual Consciencial atribuída ao rafaguipe!';
                    END IF;
                WHEN 'Anual Consciencial' THEN
                    IF consecutive_days >= 360 THEN
                        INSERT INTO user_badges (user_id, badge_id, awarded_at)
                        VALUES (user_uuid, badge_record.id, NOW());
                        RAISE NOTICE 'Badge Anual Consciencial atribuída ao rafaguipe!';
                    END IF;
            END CASE;
        ELSE
            RAISE NOTICE 'Badge % já atribuída ao rafaguipe', badge_record.name;
        END IF;
    END LOOP;
END $$;

-- Verificar resultado
SELECT 
    'Badges atribuídas ao rafaguipe:' as info,
    b.name,
    ub.awarded_at
FROM user_badges ub
JOIN badges b ON ub.badge_id = b.id
JOIN profiles p ON ub.user_id = p.user_id
WHERE p.username = 'rafaguipe'
AND b.name IN ('Persistente', 'Dedicado', 'Mestre da Persistência', 'Semi-Anual Consciencial', 'Anual Consciencial')
ORDER BY ub.awarded_at DESC;

-- Resumo final
SELECT 
    'Resumo final:' as info,
    calculate_consecutive_days((SELECT user_id FROM profiles WHERE username = 'rafaguipe')) as dias_consecutivos,
    COUNT(*) as total_badges_consecutivas
FROM user_badges ub
JOIN badges b ON ub.badge_id = b.id
JOIN profiles p ON ub.user_id = p.user_id
WHERE p.username = 'rafaguipe'
AND b.name IN ('Persistente', 'Dedicado', 'Mestre da Persistência', 'Semi-Anual Consciencial', 'Anual Consciencial'); 