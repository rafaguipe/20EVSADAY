-- Script para corrigir a estrutura das tabelas EVSADAY no Supabase

-- 1. Primeiro, vamos verificar a estrutura atual da tabela profiles
-- (Execute isso primeiro para ver como está)

-- 2. Corrigir a tabela profiles se necessário
-- Se a tabela profiles já existe com id como UUID, vamos ajustar
DROP TABLE IF EXISTS profiles CASCADE;

CREATE TABLE profiles (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  website TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Criar a tabela evs
DROP TABLE IF EXISTS evs CASCADE;

CREATE TABLE evs (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  score INTEGER NOT NULL CHECK (score >= 0 AND score <= 4),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Criar a tabela badges
DROP TABLE IF EXISTS badges CASCADE;

CREATE TABLE badges (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  icon TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Criar a tabela user_badges
DROP TABLE IF EXISTS user_badges CASCADE;

CREATE TABLE user_badges (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  badge_id BIGINT REFERENCES badges(id) ON DELETE CASCADE,
  awarded_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, badge_id)
);

-- 6. Habilitar RLS (Row Level Security) em todas as tabelas
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE evs ENABLE ROW LEVEL SECURITY;
ALTER TABLE badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_badges ENABLE ROW LEVEL SECURITY;

-- 7. Políticas para profiles
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 8. Políticas para evs
DROP POLICY IF EXISTS "Users can view own EVs" ON evs;
CREATE POLICY "Users can view own EVs" ON evs
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own EVs" ON evs;
CREATE POLICY "Users can insert own EVs" ON evs
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own EVs" ON evs;
CREATE POLICY "Users can update own EVs" ON evs
  FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own EVs" ON evs;
CREATE POLICY "Users can delete own EVs" ON evs
  FOR DELETE USING (auth.uid() = user_id);

-- 9. Políticas para badges (todos podem ver)
DROP POLICY IF EXISTS "Anyone can view badges" ON badges;
CREATE POLICY "Anyone can view badges" ON badges
  FOR SELECT USING (true);

-- 10. Políticas para user_badges
DROP POLICY IF EXISTS "Users can view own badges" ON user_badges;
CREATE POLICY "Users can view own badges" ON user_badges
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own badges" ON user_badges;
CREATE POLICY "Users can insert own badges" ON user_badges
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 11. Inserir badges padrão
INSERT INTO badges (name, description, icon) VALUES
  ('Iniciante Consciencial', 'Primeiro EV registrado', '🌱'),
  ('Persistente', '7 dias consecutivos de EVs', '🔥'),
  ('Dedicado', '30 dias consecutivos de EVs', '💎'),
  ('Mestre EV', '100 EVs registrados', '👑'),
  ('Alto Vibracional', 'EV com pontuação 4', '⭐'),
  ('Consistente', 'Média de 3+ por 10 dias', '📈'),
  ('Pesquisador Consciencial', '500 EVs registrados', '🔬'),
  ('Líder Vibracional', 'Top 1 mensal', '🏆')
ON CONFLICT (name) DO NOTHING;

-- 12. Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_evs_user_id ON evs(user_id);
CREATE INDEX IF NOT EXISTS idx_evs_created_at ON evs(created_at);
CREATE INDEX IF NOT EXISTS idx_user_badges_user_id ON user_badges(user_id);
CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON profiles(user_id);

-- 13. Verificar se tudo foi criado corretamente
SELECT 'profiles' as table_name, COUNT(*) as row_count FROM profiles
UNION ALL
SELECT 'evs' as table_name, COUNT(*) as row_count FROM evs
UNION ALL
SELECT 'badges' as table_name, COUNT(*) as row_count FROM badges
UNION ALL
SELECT 'user_badges' as table_name, COUNT(*) as row_count FROM user_badges; 