-- Final Round: enforce single vote per user, and keep only finalists as valid options
-- Execute in Supabase SQL editor before abrir a votação final

-- 1) Garantir que apenas os dois finalistas existam (mantém ids existentes se já criados)
INSERT INTO mascot_options (name)
VALUES ('Evolúcio'), ('Evolúcido')
ON CONFLICT (name) DO NOTHING;

-- 2) Impor votação única por usuário (remove regra de múltiplos votos se existir)
DROP TRIGGER IF EXISTS check_vote_limit_trigger ON mascot_votes CASCADE;
DROP FUNCTION IF EXISTS check_user_vote_limit() CASCADE;

-- 3) Constraint de unicidade por usuário
ALTER TABLE mascot_votes DROP CONSTRAINT IF EXISTS mascot_votes_user_id_key;
ALTER TABLE mascot_votes ADD CONSTRAINT mascot_votes_user_id_key UNIQUE(user_id);

-- 4) (Opcional) Remover votos antigos fora dos finalistas, mantendo o histórico dos finalistas
-- DELETE FROM mascot_votes
-- WHERE mascot_option_id NOT IN (
--   SELECT id FROM mascot_options WHERE name IN ('Evolúcio','Evolúcido')
-- );

-- 5) Atualizar função de status (se existir) para refletir 1 voto máximo
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
    COUNT(*) as vote_count,
    CASE WHEN COUNT(*) < 1 THEN TRUE ELSE FALSE END as can_vote_more,
    GREATEST(1 - COUNT(*), 0) as remaining_votes
  FROM mascot_votes
  WHERE user_id = user_uuid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6) Resultados seguem igual (função já existente)
-- Caso precise, recompile a função get_mascot_voting_results sem alterações





