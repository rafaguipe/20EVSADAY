-- Adicionar badge "Selo Experimento Grupal 1"
-- Para usuários que fizeram EV entre 11h e 12h do dia 6/8/2025 (horário de Brasília)

INSERT INTO badges (name, description, icon) VALUES
    ('experimento_grupal_1', 'Selo Experimento Grupal 1', '🔬')
ON CONFLICT (name) DO UPDATE SET
    description = EXCLUDED.description,
    icon = EXCLUDED.icon;

-- Atribuir o badge automaticamente aos usuários que fizeram EV no horário especificado
-- Horário de Brasília: 11:00 às 12:00 do dia 6/8/2025
-- Convertendo para UTC: 14:00 às 15:00 (UTC-3)

INSERT INTO user_badges (user_id, badge_id, created_at)
SELECT DISTINCT 
    evs.user_id,
    (SELECT id FROM badges WHERE name = 'experimento_grupal_1'),
    NOW()
FROM evs
WHERE DATE(evs.created_at) = '2025-08-06'
  AND EXTRACT(HOUR FROM evs.created_at AT TIME ZONE 'UTC') = 14
  AND EXTRACT(MINUTE FROM evs.created_at AT TIME ZONE 'UTC') >= 0
  AND EXTRACT(MINUTE FROM evs.created_at AT TIME ZONE 'UTC') < 60
  AND evs.user_id NOT IN (
    SELECT user_id 
    FROM user_badges 
    WHERE badge_id = (SELECT id FROM badges WHERE name = 'experimento_grupal_1')
  );

-- Verificar quantos usuários receberam o badge
SELECT 
    COUNT(*) as usuarios_que_receberam_badge,
    'experimento_grupal_1' as badge_name
FROM user_badges 
WHERE badge_id = (SELECT id FROM badges WHERE name = 'experimento_grupal_1'); 