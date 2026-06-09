-- Schema completo para EVSADAY no Supabase

-- 1. Tabela profiles (já existe, mas vamos garantir a estrutura)
CREATE TABLE IF NOT EXISTS profiles (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  website TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Tabela evs (Estados Vibracionais)
CREATE TABLE IF NOT EXISTS evs (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  score INTEGER NOT NULL CHECK (score >= 0 AND score <= 4),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Tabela badges
CREATE TABLE IF NOT EXISTS badges (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  icon TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Tabela user_badges (relacionamento muitos-para-muitos)
CREATE TABLE IF NOT EXISTS user_badges (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  badge_id BIGINT REFERENCES badges(id) ON DELETE CASCADE,
  awarded_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, badge_id)
);

-- Habilitar RLS (Row Level Security) em todas as tabelas
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE evs ENABLE ROW LEVEL SECURITY;
ALTER TABLE badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_badges ENABLE ROW LEVEL SECURITY;

-- Políticas para profiles
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Políticas para evs
CREATE POLICY "Users can view own EVs" ON evs
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own EVs" ON evs
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own EVs" ON evs
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own EVs" ON evs
  FOR DELETE USING (auth.uid() = user_id);

-- Políticas para badges (todos podem ver)
CREATE POLICY "Anyone can view badges" ON badges
  FOR SELECT USING (true);

-- Políticas para user_badges
CREATE POLICY "Users can view own badges" ON user_badges
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own badges" ON user_badges
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Inserir badges padrão
INSERT INTO badges (name, description, icon) VALUES
  ('Iniciante Consciencial', 'Primeiro EV registrado', '🌱'),
  ('Persistente', '7 dias consecutivos de EVs', '🔥'),
  ('Dedicado', '30 dias consecutivos de EVs', '💎'),
  ('Mestre EV', '100 EVs registrados', '👑'),
  ('Alto Vibracional', 'EV com pontuação 4', '⭐'),
  ('Consistente', 'Média de 3+ por 10 dias', '📈'),
  ('Pesquisador Consciencial', '500 EVs registrados', '🔬'),
  ('Líder Vibracional', 'Top 1 mensal', '🏆'),
  ('Virada Conscienciológica 2026', 'Participou da Virada Conscienciológica 2026 (22 a 24 de agosto)', '🌀')
ON CONFLICT (name) DO NOTHING;

-- 5. Tabela sinais (Agenda Sinaleticológica)
CREATE TABLE IF NOT EXISTS sinais (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  registered_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  soma_detalhes TEXT,
  soma_intensidade INTEGER CHECK (soma_intensidade >= 0 AND soma_intensidade <= 5),
  energossoma_detalhes TEXT,
  energossoma_intensidade INTEGER CHECK (energossoma_intensidade >= 0 AND energossoma_intensidade <= 5),
  psicossoma_detalhes TEXT,
  psicossoma_intensidade INTEGER CHECK (psicossoma_intensidade >= 0 AND psicossoma_intensidade <= 5),
  holossoma_detalhes TEXT,
  holossoma_intensidade INTEGER CHECK (holossoma_intensidade >= 0 AND holossoma_intensidade <= 5),
  contexto TEXT,
  notas TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS para sinais
ALTER TABLE sinais ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own sinais" ON sinais
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own sinais" ON sinais
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own sinais" ON sinais
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own sinais" ON sinais
  FOR DELETE USING (auth.uid() = user_id);

-- Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_evs_user_id ON evs(user_id);
CREATE INDEX IF NOT EXISTS idx_evs_created_at ON evs(created_at);
CREATE INDEX IF NOT EXISTS idx_user_badges_user_id ON user_badges(user_id);
CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_sinais_user_id ON sinais(user_id);
CREATE INDEX IF NOT EXISTS idx_sinais_registered_at ON sinais(user_id, registered_at DESC); 