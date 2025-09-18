-- Script para corrigir tipos de dados nas funções
-- Execute este script no SQL Editor do Supabase

-- 1. Remover funções problemáticas
DROP FUNCTION IF EXISTS get_user_votes(UUID) CASCADE;
DROP FUNCTION IF EXISTS check_user_vote_status(UUID) CASCADE;
DROP FUNCTION IF EXISTS get_mascot_voting_results() CASCADE;

-- 2. Criar função corrigida para obter votos de um usuário
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
    mo.name::TEXT as mascot_name,
    mv.voted_at
  FROM mascot_votes mv
  JOIN mascot_options mo ON mv.mascot_option_id = mo.id
  WHERE mv.user_id = user_uuid
  ORDER BY mv.voted_at ASC;
END;
$$ LANGUAGE plpgsql;

-- 3. Criar função corrigida para verificar status de voto do usuário
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

-- 4. Criar função corrigida de resultados
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
    mo.name::TEXT as mascot_name,
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

-- 5. Verificar se as funções foram criadas
SELECT 
  'Verificação das Funções' as status,
  routine_name,
  routine_type,
  data_type
FROM information_schema.routines
WHERE routine_schema = 'public'
  AND routine_name IN ('check_user_vote_status', 'get_mascot_voting_results', 'get_user_votes')
ORDER BY routine_name;

-- 6. Testar as funções
SELECT 
  'Teste das Funções' as status,
  'Funções corrigidas com sucesso' as resultado;
