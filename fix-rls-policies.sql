-- Corrigir políticas RLS para permitir que todos vejam o ranking
-- Primeiro, vamos verificar as políticas atuais
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename IN ('evs', 'profiles');

-- Remover TODAS as políticas existentes
DROP POLICY IF EXISTS "Users can view own EVs" ON evs;
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Public read access for ranking" ON evs;
DROP POLICY IF EXISTS "Public read access for ranking" ON profiles;
DROP POLICY IF EXISTS "Users can insert own EVs" ON evs;
DROP POLICY IF EXISTS "Users can update own EVs" ON evs;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
DROP POLICY IF EXISTS "Enable read access for all users" ON evs;
DROP POLICY IF EXISTS "Enable read access for all users" ON profiles;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON evs;
DROP POLICY IF EXISTS "Enable update for users based on user_id" ON evs;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON profiles;
DROP POLICY IF EXISTS "Enable update for users based on user_id" ON profiles;

-- Criar políticas que permitem visualização pública para ranking
-- Política para EVs - todos podem ver todos os EVs (para ranking)
CREATE POLICY "Public read access for ranking" ON evs
FOR SELECT USING (true);

-- Política para profiles - todos podem ver todos os profiles (para ranking)
CREATE POLICY "Public read access for ranking" ON profiles
FOR SELECT USING (true);

-- Manter políticas de escrita apenas para o próprio usuário
CREATE POLICY "Users can insert own EVs" ON evs
FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own EVs" ON evs
FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can update own profile" ON profiles
FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile" ON profiles
FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Verificar se as políticas foram criadas corretamente
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename IN ('evs', 'profiles')
ORDER BY tablename, policyname; 