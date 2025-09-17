-- Setup do sistema de votação do mascote
-- Execute este script no Supabase SQL Editor

-- 1. Criar tabela de opções do mascote
CREATE TABLE IF NOT EXISTS mascot_options (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Criar tabela de votos
CREATE TABLE IF NOT EXISTS mascot_votes (
  id SERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  mascot_option_id INTEGER NOT NULL REFERENCES mascot_options(id) ON DELETE CASCADE,
  voted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id) -- Garante que cada usuário vote apenas uma vez
);

-- 3. Inserir todas as opções do mascote
INSERT INTO mascot_options (name) VALUES
('Energolino'),
('e-Valdo'),
('Sereninho'),
('EVwaldo'),
('Vibralino'),
('Evino'),
('Vibraciolino'),
('EVandro Gino'),
('Evinho'),
('EVoluício'),
('EVoluído'),
('Evol'),
('Eva'),
('Evo'),
('Evinha'),
('Zenit'),
('Waldinho'),
('Evolutivo'),
('Evital'),
('Evitinho'),
('Evictor'),
('Evelino'),
('ForEVer'),
('Evolúcio'),
('Evolúcido'),
('EVezão'),
('Eva Perón'),
('EVis Presley'),
('EVzando'),
('EVzar'),
('EVino'),
('EVidente'),
('EVidências'),
('EVo Morales'),
('EVora'),
('EVocation'),
('Evita Perón'),
('Ev'),
('Evolinho'),
('Vibro'),
('Viberal'),
('Evibr'),
('EVibro'),
('EVibra'),
('EVibrado'),
('Energomaster'),
('EVgrafo'),
('Vibralino'),
('EVu'),
('Energinho'),
('Evéfiro'),
('Evelino'),
('EVzeiro'),
('Evazildo'),
('Evzado'),
('Evzador'),
('Energuinh'),
('Energuinho'),
('Energão'),
('Energildo'),
('Vibraldo'),
('Energaldo'),
('Enervaldo'),
('Evsaday'),
('Vintinho'),
('Vitenergo'),
('Vintenergo'),
('VinteEV'),
('Ênio')
ON CONFLICT (name) DO NOTHING;

-- 4. Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_mascot_votes_user_id ON mascot_votes(user_id);
CREATE INDEX IF NOT EXISTS idx_mascot_votes_option_id ON mascot_votes(mascot_option_id);
CREATE INDEX IF NOT EXISTS idx_mascot_votes_voted_at ON mascot_votes(voted_at);

-- 5. Habilitar RLS (Row Level Security)
ALTER TABLE mascot_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE mascot_votes ENABLE ROW LEVEL SECURITY;

-- 6. Criar políticas de segurança
-- Política para ler opções (todos podem ver)
CREATE POLICY "Todos podem ver opções do mascote" ON mascot_options
  FOR SELECT USING (true);

-- Política para votar (apenas usuários autenticados)
CREATE POLICY "Usuários autenticados podem votar" ON mascot_votes
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Política para ver votos (apenas próprios votos)
CREATE POLICY "Usuários podem ver próprios votos" ON mascot_votes
  FOR SELECT USING (auth.uid() = user_id);

-- Política para ver resultados agregados (todos podem ver)
CREATE POLICY "Todos podem ver resultados" ON mascot_votes
  FOR SELECT USING (true);

-- 7. Criar função para obter resultados da votação
CREATE OR REPLACE FUNCTION get_mascot_voting_results()
RETURNS TABLE (
  mascot_name VARCHAR(100),
  vote_count BIGINT,
  percentage NUMERIC
) 
LANGUAGE SQL
SECURITY DEFINER
AS $$
  SELECT 
    mo.name as mascot_name,
    COUNT(mv.id) as vote_count,
    ROUND(
      (COUNT(mv.id)::NUMERIC / NULLIF((SELECT COUNT(*) FROM mascot_votes), 0)) * 100, 
      2
    ) as percentage
  FROM mascot_options mo
  LEFT JOIN mascot_votes mv ON mo.id = mv.mascot_option_id
  GROUP BY mo.id, mo.name
  ORDER BY vote_count DESC, mo.name ASC;
$$;

-- 8. Criar função para verificar se usuário já votou
CREATE OR REPLACE FUNCTION user_has_voted()
RETURNS BOOLEAN
LANGUAGE SQL
SECURITY DEFINER
AS $$
  SELECT EXISTS(
    SELECT 1 FROM mascot_votes 
    WHERE user_id = auth.uid()
  );
$$;

-- 9. Criar função para obter voto do usuário
CREATE OR REPLACE FUNCTION get_user_vote()
RETURNS TABLE (
  mascot_name VARCHAR(100),
  voted_at TIMESTAMP WITH TIME ZONE
)
LANGUAGE SQL
SECURITY DEFINER
AS $$
  SELECT 
    mo.name as mascot_name,
    mv.voted_at
  FROM mascot_votes mv
  JOIN mascot_options mo ON mv.mascot_option_id = mo.id
  WHERE mv.user_id = auth.uid();
$$;

-- 10. Verificar se tudo foi criado corretamente
SELECT 
  'Tabelas criadas' as status,
  COUNT(*) as count
FROM information_schema.tables 
WHERE table_name IN ('mascot_options', 'mascot_votes')
  AND table_schema = 'public';

SELECT 
  'Opções inseridas' as status,
  COUNT(*) as count
FROM mascot_options;

SELECT 
  'Funções criadas' as status,
  COUNT(*) as count
FROM information_schema.routines 
WHERE routine_name IN ('get_mascot_voting_results', 'user_has_voted', 'get_user_vote')
  AND routine_schema = 'public';
