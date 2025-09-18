-- Teste rápido da função get_mascot_voting_results
-- Execute este script no SQL Editor do Supabase

-- 1. Testar a função diretamente
SELECT 
  'Teste Direto' as status,
  *
FROM get_mascot_voting_results()
LIMIT 3;

-- 2. Verificar se não há erro de tipo
SELECT 
  'Verificação de Tipos' as status,
  'Função deve retornar TEXT, não VARCHAR' as observacao;

-- 3. Verificar estrutura da tabela mascot_options
SELECT 
  'Estrutura da Tabela' as status,
  column_name,
  data_type,
  character_maximum_length
FROM information_schema.columns
WHERE table_name = 'mascot_options'
  AND column_name = 'name';

-- 4. Resumo
SELECT 
  'Resumo' as status,
  'Execute: sql/corrigir-funcao-resultados.sql' as proximo_passo,
  'Depois recarregue a página de votação' as teste;
