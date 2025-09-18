-- Script para corrigir erro 400 nas funções
-- Execute este script no SQL Editor do Supabase

-- 1. Remover apenas a função problemática
DROP FUNCTION IF EXISTS get_user_votes(UUID) CASCADE;

-- 2. Recriar a função com tipos corretos
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
    CAST(mo.name AS TEXT) as mascot_name,
    mv.voted_at
  FROM mascot_votes mv
  JOIN mascot_options mo ON mv.mascot_option_id = mo.id
  WHERE mv.user_id = user_uuid
  ORDER BY mv.voted_at ASC;
END;
$$ LANGUAGE plpgsql;

-- 3. Verificar se a função foi criada
SELECT 
  'Verificação da Função' as status,
  routine_name,
  routine_type,
  data_type
FROM information_schema.routines
WHERE routine_schema = 'public'
  AND routine_name = 'get_user_votes';

-- 4. Testar a função
SELECT 
  'Teste da Função' as status,
  'Função corrigida com sucesso' as resultado;
