-- Migration: Adicionar badge "Virada Conscienciológica 2026"
-- Badge concedido a quem registrou EV entre 22 e 24 de agosto de 2026 (horário de Brasília)

INSERT INTO badges (name, description, icon) VALUES
  ('Virada Conscienciológica 2026', 'Participou da Virada Conscienciológica 2026 (22 a 24 de agosto)', '🌀')
ON CONFLICT (name) DO NOTHING;
