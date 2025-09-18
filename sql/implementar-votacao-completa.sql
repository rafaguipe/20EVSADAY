-- Script completo para implementar votação múltipla
-- Execute este script no SQL Editor do Supabase

-- 1. Verificar estrutura atual
SELECT 
  'Estrutura Atual' as status,
  table_name,
  column_name,
  data_type
FROM information_schema.columns
WHERE table_name IN ('mascot_options', 'mascot_votes')
  AND table_schema = 'public'
ORDER BY table_name, ordinal_position;

-- 2. Remover constraint UNIQUE atual se existir
ALTER TABLE mascot_votes DROP CONSTRAINT IF EXISTS mascot_votes_user_id_key;

-- 3. Remover trigger primeiro (para evitar dependências)
DROP TRIGGER IF EXISTS check_vote_limit_trigger ON mascot_votes;

-- 4. Remover funções existentes
DROP FUNCTION IF EXISTS get_mascot_voting_results();
DROP FUNCTION IF EXISTS check_user_vote_status(UUID);
DROP FUNCTION IF EXISTS get_user_votes(UUID);
DROP FUNCTION IF EXISTS check_user_vote_limit();

-- 5. Criar função para verificar limite de votos
CREATE FUNCTION check_user_vote_limit()
RETURNS TRIGGER AS $$
BEGIN
  -- Verificar se o usuário já tem 3 votos
  IF (SELECT COUNT(*) FROM mascot_votes WHERE user_id = NEW.user_id) >= 3 THEN
    RAISE EXCEPTION 'Usuário já votou 3 vezes. Limite máximo atingido.';
  END IF;
  
  -- Verificar se o usuário já votou nesta opção específica
  IF EXISTS (SELECT 1 FROM mascot_votes WHERE user_id = NEW.user_id AND mascot_option_id = NEW.mascot_option_id) THEN
    RAISE EXCEPTION 'Usuário já votou nesta opção. Escolha uma opção diferente.';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 6. Criar função para verificar status de voto do usuário
CREATE FUNCTION check_user_vote_status(user_uuid UUID)
RETURNS TABLE(
  has_voted BOOLEAN,
  vote_count INTEGER,
  can_vote_more BOOLEAN,
  remaining_votes INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    CASE WHEN COUNT(*) > 0 THEN TRUE ELSE FALSE END as has_voted,
    COUNT(*)::INTEGER as vote_count,
    CASE WHEN COUNT(*) < 3 THEN TRUE ELSE FALSE END as can_vote_more,
    (3 - COUNT(*))::INTEGER as remaining_votes
  FROM mascot_votes
  WHERE user_id = user_uuid;
END;
$$ LANGUAGE plpgsql;

-- 7. Criar função para obter votos de um usuário
CREATE FUNCTION get_user_votes(user_uuid UUID)
RETURNS TABLE(
  mascot_option_id INTEGER,
  mascot_name TEXT,
  voted_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    mv.mascot_option_id,
    mo.name as mascot_name,
    mv.voted_at
  FROM mascot_votes mv
  JOIN mascot_options mo ON mv.mascot_option_id = mo.id
  WHERE mv.user_id = user_uuid
  ORDER BY mv.voted_at ASC;
END;
$$ LANGUAGE plpgsql;

-- 8. Criar função de resultados
CREATE FUNCTION get_mascot_voting_results()
RETURNS TABLE(
  mascot_name TEXT,
  total_votes BIGINT,
  percentage NUMERIC,
  voters_count BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    mo.name as mascot_name,
    COUNT(mv.id) as total_votes,
    ROUND(
      COUNT(mv.id) * 100.0 / 
      NULLIF((SELECT COUNT(*) FROM mascot_votes), 0), 
      2
    ) as percentage,
    COUNT(DISTINCT mv.user_id) as voters_count
  FROM mascot_options mo
  LEFT JOIN mascot_votes mv ON mo.id = mv.mascot_option_id
  GROUP BY mo.id, mo.name
  ORDER BY total_votes DESC, mo.name ASC;
END;
$$ LANGUAGE plpgsql;

-- 9. Criar trigger
DROP TRIGGER IF EXISTS check_vote_limit_trigger ON mascot_votes;
CREATE TRIGGER check_vote_limit_trigger
  BEFORE INSERT ON mascot_votes
  FOR EACH ROW
  EXECUTE FUNCTION check_user_vote_limit();

-- 10. Remover políticas RLS antigas
DROP POLICY IF EXISTS "Users can vote up to 3 times" ON mascot_votes;
DROP POLICY IF EXISTS "Users can view their own votes" ON mascot_votes;
DROP POLICY IF EXISTS "Admins can view all votes" ON mascot_votes;
DROP POLICY IF EXISTS "Authenticated users can view results" ON mascot_votes;

-- 11. Criar políticas RLS
CREATE POLICY "Users can vote up to 3 times" ON mascot_votes
  FOR INSERT WITH CHECK (
    auth.uid() = user_id AND
    (SELECT COUNT(*) FROM mascot_votes WHERE user_id = auth.uid()) < 3
  );

CREATE POLICY "Users can view their own votes" ON mascot_votes
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Authenticated users can view results" ON mascot_votes
  FOR SELECT USING (auth.role() = 'authenticated');

-- 12. Verificar se tudo foi criado
SELECT 
  'Verificação Final' as status,
  'Sistema de votação múltipla implementado!' as resultado;

-- 13. Testar as funções
SELECT 
  'Teste das Funções' as status,
  routine_name,
  routine_type
FROM information_schema.routines
WHERE routine_schema = 'public'
  AND routine_name IN ('check_user_vote_status', 'get_mascot_voting_results', 'get_user_votes', 'check_user_vote_limit')
ORDER BY routine_name;
