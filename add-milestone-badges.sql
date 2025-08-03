-- Script para adicionar badges de milestones de pontos
-- Execute este script no Supabase SQL Editor

INSERT INTO badges (name, description, icon) VALUES
    ('milestone_1000_points', 'Marco dos 1000 pontos', '🎯')
ON CONFLICT (name) DO UPDATE SET
    description = EXCLUDED.description,
    icon = EXCLUDED.icon;

INSERT INTO badges (name, description, icon) VALUES
    ('milestone_2000_points', 'Marco dos 2000 pontos', '🏆')
ON CONFLICT (name) DO UPDATE SET
    description = EXCLUDED.description,
    icon = EXCLUDED.icon;

INSERT INTO badges (name, description, icon) VALUES
    ('milestone_3000_points', 'Marco dos 3000 pontos', '💎')
ON CONFLICT (name) DO UPDATE SET
    description = EXCLUDED.description,
    icon = EXCLUDED.icon;

INSERT INTO badges (name, description, icon) VALUES
    ('milestone_4000_points', 'Marco dos 4000 pontos', '👑')
ON CONFLICT (name) DO UPDATE SET
    description = EXCLUDED.description,
    icon = EXCLUDED.icon;

INSERT INTO badges (name, description, icon) VALUES
    ('milestone_5000_points', 'Marco dos 5000 pontos', '⭐')
ON CONFLICT (name) DO UPDATE SET
    description = EXCLUDED.description,
    icon = EXCLUDED.icon; 