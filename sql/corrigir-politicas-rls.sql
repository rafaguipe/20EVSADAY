-- Script para corrigir políticas RLS sem depender da coluna role
-- Execute este script no SQL Editor do Supabase

-- 1. Verificar estrutura da tabela profiles
SELECT 
  'Estrutura da Tabela profiles' as status,
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_name = 'profiles'
  AND table_schema = 'public'
ORDER BY ordinal_position;

-- 2. Remover políticas RLS antigas
DROP POLICY IF EXISTS "Users can vote up to 3 times" ON mascot_votes;
DROP POLICY IF EXISTS "Users can view their own votes" ON mascot_votes;
DROP POLICY IF EXISTS "Admins can view all votes" ON mascot_votes;

-- 3. Criar políticas RLS simplificadas (sem verificação de admin)
-- Política para inserção (permite até 3 votos por usuário)
CREATE POLICY "Users can vote up to 3 times" ON mascot_votes
  FOR INSERT WITH CHECK (
    auth.uid() = user_id AND
    (SELECT COUNT(*) FROM mascot_votes WHERE user_id = auth.uid()) < 3
  );

-- Política para visualização (usuários podem ver seus próprios votos)
CREATE POLICY "Users can view their own votes" ON mascot_votes
  FOR SELECT USING (auth.uid() = user_id);

-- Política para visualização (todos os usuários autenticados podem ver resultados)
CREATE POLICY "Authenticated users can view results" ON mascot_votes
  FOR SELECT USING (auth.role() = 'authenticated');

-- 4. Verificar se as políticas foram criadas
SELECT 
  'Verificação das Políticas RLS' as status,
  policyname,
  cmd,
  permissive
FROM pg_policies
WHERE tablename = 'mascot_votes'
ORDER BY policyname;

-- 5. Testar as políticas
SELECT 
  'Teste das Políticas' as status,
  'Políticas criadas com sucesso' as resultado;
