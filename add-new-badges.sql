-- Script para adicionar novos badges ao EVSADAY
-- Execute este script no Supabase SQL Editor

-- 1. Badges para EVs em um único dia
INSERT INTO badges (name, description, icon) VALUES
  ('Maratonista EV', '30 EVs registrados em um único dia', '🏃'),
  ('Ultra Maratonista EV', '40 EVs registrados em um único dia', '🏃‍♂️'),
  ('Mega Maratonista EV', '50 EVs registrados em um único dia', '🏃‍♀️')
ON CONFLICT (name) DO NOTHING;

-- 2. Badges para total de EVs registrados
INSERT INTO badges (name, description, icon) VALUES
  ('Mestre Consciencial', 'Primeiros 500 EVs registrados', '🧙‍♂️'),
  ('Sábio Consciencial', 'Primeiros 1000 EVs registrados', '🧙‍♀️')
ON CONFLICT (name) DO NOTHING;

-- 3. Badges para dias consecutivos
INSERT INTO badges (name, description, icon) VALUES
  ('Mestre da Persistência', '90 dias consecutivos de EVs', '🎯'),
  ('Semi-Anual Consciencial', '180 dias consecutivos de EVs', '📅'),
  ('Anual Consciencial', '360 dias consecutivos de EVs', '🗓️')
ON CONFLICT (name) DO NOTHING;

-- 4. Verificar se os badges foram adicionados
SELECT 
  name, 
  description, 
  icon,
  created_at
FROM badges 
WHERE name IN (
  'Maratonista EV',
  'Ultra Maratonista EV', 
  'Mega Maratonista EV',
  'Mestre Consciencial',
  'Sábio Consciencial',
  'Mestre da Persistência',
  'Semi-Anual Consciencial',
  'Anual Consciencial'
)
ORDER BY name;

-- 5. Mostrar todos os badges disponíveis
SELECT 
  COUNT(*) as total_badges,
  STRING_AGG(name, ', ' ORDER BY name) as badges_list
FROM badges; 