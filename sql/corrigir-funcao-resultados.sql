-- Script para corrigir erro 400 na função get_mascot_voting_results
-- Execute este script no SQL Editor do Supabase

-- 1. Remover a função existente
DROP FUNCTION IF EXISTS get_mascot_voting_results();

-- 2. Recriar a função com tipos corretos
CREATE OR REPLACE FUNCTION get_mascot_voting_results()
RETURNS TABLE (
  id INT,
  name TEXT,
  vote_count BIGINT,
  percentage NUMERIC
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    mo.id,
    mo.name::TEXT,
    COALESCE(COUNT(mv.id), 0) as vote_count,
    CASE 
      WHEN (SELECT COUNT(*) FROM mascot_votes) = 0 THEN 0
      ELSE ROUND(
        (COALESCE(COUNT(mv.id), 0)::NUMERIC / (SELECT COUNT(*) FROM mascot_votes)::NUMERIC) * 100, 
        2
      )
    END as percentage
  FROM mascot_options mo
  LEFT JOIN mascot_votes mv ON mo.id = mv.mascot_option_id
  GROUP BY mo.id, mo.name
  ORDER BY vote_count DESC, mo.name ASC;
END;
$$;

-- 3. Verificar se a função foi criada corretamente
SELECT 
  'Função Corrigida' as status,
  routine_name,
  routine_type,
  data_type
FROM information_schema.routines
WHERE routine_schema = 'public'
  AND routine_name = 'get_mascot_voting_results';

-- 4. Testar a função
SELECT 
  'Teste da Função' as status,
  *
FROM get_mascot_voting_results()
LIMIT 5;

-- 5. Verificar tipos de retorno
SELECT 
  'Tipos de Retorno' as status,
  parameter_name,
  data_type,
  character_maximum_length
FROM information_schema.parameters
WHERE specific_name = (
  SELECT specific_name 
  FROM information_schema.routines 
  WHERE routine_name = 'get_mascot_voting_results'
)
ORDER BY ordinal_position;
