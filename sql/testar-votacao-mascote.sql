-- Script para testar o sistema de votação do mascote
-- Execute este script no Supabase SQL Editor

-- 1. Verificar se as tabelas foram criadas
SELECT 
  'Verificação das tabelas' as teste,
  CASE 
    WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'mascot_options') 
    THEN '✅ Tabela mascot_options existe'
    ELSE '❌ Tabela mascot_options não existe'
  END as mascot_options,
  CASE 
    WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'mascot_votes') 
    THEN '✅ Tabela mascot_votes existe'
    ELSE '❌ Tabela mascot_votes não existe'
  END as mascot_votes;

-- 2. Verificar se as opções foram inseridas
SELECT 
  'Verificação das opções' as teste,
  COUNT(*) as total_opcoes,
  CASE 
    WHEN COUNT(*) >= 60 THEN '✅ Todas as opções inseridas'
    ELSE '❌ Opções faltando'
  END as status
FROM mascot_options;

-- 3. Verificar se as funções foram criadas
SELECT 
  'Verificação das funções' as teste,
  CASE 
    WHEN EXISTS (SELECT 1 FROM information_schema.routines WHERE routine_name = 'get_mascot_voting_results') 
    THEN '✅ Função get_mascot_voting_results existe'
    ELSE '❌ Função get_mascot_voting_results não existe'
  END as funcao_resultados,
  CASE 
    WHEN EXISTS (SELECT 1 FROM information_schema.routines WHERE routine_name = 'user_has_voted') 
    THEN '✅ Função user_has_voted existe'
    ELSE '❌ Função user_has_voted não existe'
  END as funcao_votou,
  CASE 
    WHEN EXISTS (SELECT 1 FROM information_schema.routines WHERE routine_name = 'get_user_vote') 
    THEN '✅ Função get_user_vote existe'
    ELSE '❌ Função get_user_vote não existe'
  END as funcao_voto_usuario;

-- 4. Verificar políticas RLS
SELECT 
  'Verificação das políticas RLS' as teste,
  COUNT(*) as total_politicas,
  CASE 
    WHEN COUNT(*) >= 4 THEN '✅ Políticas RLS configuradas'
    ELSE '❌ Políticas RLS faltando'
  END as status
FROM pg_policies 
WHERE tablename IN ('mascot_options', 'mascot_votes');

-- 5. Testar função de resultados (deve retornar vazio se não há votos)
SELECT 
  'Teste da função de resultados' as teste,
  COUNT(*) as total_resultados,
  CASE 
    WHEN COUNT(*) >= 0 THEN '✅ Função funcionando'
    ELSE '❌ Erro na função'
  END as status
FROM get_mascot_voting_results();

-- 6. Mostrar algumas opções de exemplo
SELECT 
  'Opções de exemplo' as teste,
  name as exemplo_opcoes
FROM mascot_options 
ORDER BY name 
LIMIT 10;

-- 7. Verificar índices
SELECT 
  'Verificação dos índices' as teste,
  COUNT(*) as total_indices,
  CASE 
    WHEN COUNT(*) >= 3 THEN '✅ Índices criados'
    ELSE '❌ Índices faltando'
  END as status
FROM pg_indexes 
WHERE tablename IN ('mascot_options', 'mascot_votes');

-- 8. Verificar estrutura das tabelas
SELECT 
  'Estrutura da tabela mascot_options' as teste,
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns 
WHERE table_name = 'mascot_options'
ORDER BY ordinal_position;

SELECT 
  'Estrutura da tabela mascot_votes' as teste,
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns 
WHERE table_name = 'mascot_votes'
ORDER BY ordinal_position;
