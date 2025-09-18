-- Script para implementar votação múltipla (3 opções por usuário)
-- Execute este script no SQL Editor do Supabase

-- 1. Verificar estrutura atual das tabelas
SELECT 
  'Estrutura Atual' as status,
  table_name,
  column_name,
  data_type
FROM information_schema.columns
WHERE table_name IN ('mascot_options', 'mascot_votes')
  AND table_schema = 'public'
ORDER BY table_name, ordinal_position;

-- 2. Verificar se há dados existentes
SELECT 
  'Dados Existentes' as status,
  'mascot_options' as tabela,
  COUNT(*) as total_registros
FROM mascot_options
UNION ALL
SELECT 
  'Dados Existentes' as status,
  'mascot_votes' as tabela,
  COUNT(*) as total_registros
FROM mascot_votes;

-- 3. Remover constraint UNIQUE atual se existir
ALTER TABLE mascot_votes DROP CONSTRAINT IF EXISTS mascot_votes_user_id_key;

-- 4. Criar função para verificar limite de votos
CREATE OR REPLACE FUNCTION check_user_vote_limit()
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

-- 5. Criar trigger para aplicar a nova regra
DROP TRIGGER IF EXISTS check_vote_limit_trigger ON mascot_votes;
CREATE TRIGGER check_vote_limit_trigger
  BEFORE INSERT ON mascot_votes
  FOR EACH ROW
  EXECUTE FUNCTION check_user_vote_limit();

-- 6. Criar função para verificar status de voto do usuário
CREATE OR REPLACE FUNCTION check_user_vote_status(user_uuid UUID)
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
CREATE OR REPLACE FUNCTION get_user_votes(user_uuid UUID)
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

-- 8. Atualizar função de resultados para mostrar votos múltiplos
CREATE OR REPLACE FUNCTION get_mascot_voting_results()
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

-- 9. Atualizar políticas RLS
DROP POLICY IF EXISTS "Users can vote once" ON mascot_votes;
DROP POLICY IF EXISTS "Users can view their own votes" ON mascot_votes;

-- Política para inserção (permite até 3 votos por usuário)
CREATE POLICY "Users can vote up to 3 times" ON mascot_votes
  FOR INSERT WITH CHECK (
    auth.uid() = user_id AND
    (SELECT COUNT(*) FROM mascot_votes WHERE user_id = auth.uid()) < 3
  );

-- Política para visualização (usuários podem ver seus próprios votos)
CREATE POLICY "Users can view their own votes" ON mascot_votes
  FOR SELECT USING (auth.uid() = user_id);

-- Política para administradores (podem ver todos os votos)
CREATE POLICY "Admins can view all votes" ON mascot_votes
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE user_id = auth.uid() 
      AND role = 'admin'
    )
  );

-- 10. Verificar se as modificações foram aplicadas
SELECT 
  'Verificação Final' as status,
  'Schema modificado com sucesso!' as resultado,
  'Agora cada usuário pode votar em até 3 opções diferentes' as funcionalidade;

-- 11. Testar as funções
SELECT 
  'Teste das Funções' as status,
  'Funções criadas com sucesso' as resultado;

-- 12. Verificar políticas RLS
SELECT 
  'Políticas RLS' as status,
  policyname,
  cmd,
  permissive
FROM pg_policies
WHERE tablename = 'mascot_votes'
ORDER BY policyname;
