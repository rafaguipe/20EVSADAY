-- Configuração de Fuso Horário do EVSADAY
-- Este script documenta como o sistema lida com fuso horário

-- 1. Configuração Atual do Banco de Dados
-- O Supabase usa TIMESTAMPTZ (timestamp with timezone) que armazena em UTC
-- Todos os campos de data são armazenados em UTC e convertidos para exibição

-- 2. Fuso Horário Padrão do Sistema
-- O EVSADAY usa UTC-3 (Horário de Brasília) como fuso horário padrão
-- Isso garante consistência para todos os usuários, independente de onde estejam

-- 3. Verificar configuração atual do banco
SELECT 
  name,
  setting,
  unit,
  context,
  category
FROM pg_settings 
WHERE name LIKE '%timezone%';

-- 4. Verificar dados de exemplo com fuso horário
SELECT 
  id,
  user_id,
  score,
  created_at,
  created_at AT TIME ZONE 'UTC' AT TIME ZONE 'America/Sao_Paulo' as brasilia_time
FROM evs 
ORDER BY created_at DESC 
LIMIT 5;

-- 5. Função para converter UTC para Brasília
CREATE OR REPLACE FUNCTION convert_to_brasilia_time(utc_timestamp TIMESTAMPTZ)
RETURNS TIMESTAMP AS $$
BEGIN
  RETURN utc_timestamp AT TIME ZONE 'UTC' AT TIME ZONE 'America/Sao_Paulo';
END;
$$ LANGUAGE plpgsql;

-- 6. Exemplo de uso da função
SELECT 
  created_at as utc_time,
  convert_to_brasilia_time(created_at) as brasilia_time
FROM evs 
ORDER BY created_at DESC 
LIMIT 3;

-- 7. Informações sobre o fuso horário
SELECT 
  'Sistema EVSADAY' as sistema,
  'UTC-3 (America/Sao_Paulo)' as fuso_padrao,
  'Horário de Brasília' as descricao,
  'Todos os usuários' as aplicacao;

-- 8. Verificar se há dados em diferentes fusos (para debug)
SELECT 
  DATE(created_at) as data_utc,
  COUNT(*) as total_evs,
  MIN(created_at) as primeiro_ev,
  MAX(created_at) as ultimo_ev
FROM evs 
GROUP BY DATE(created_at)
ORDER BY data_utc DESC
LIMIT 10; 