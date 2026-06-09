-- Migration: Tabela de registros sinaléticos (Agenda Sinaleticológica)
-- Campos inspirados na agenda da Sandra Tornieri / sinaleticologia.org

CREATE TABLE IF NOT EXISTS sinais (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Data/hora do registro (pode ser retroativo)
  registered_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Soma (corpo físico / somático)
  soma_detalhes TEXT,
  soma_intensidade INTEGER CHECK (soma_intensidade >= 0 AND soma_intensidade <= 5),
  
  -- Energossoma (percepções energéticas)
  energossoma_detalhes TEXT,
  energossoma_intensidade INTEGER CHECK (enerossoma_intensidade >= 0 AND energossoma_intensidade <= 5),
  
  -- Psicossoma (emoções, pensamentos, parapsiquismo)
  psicossoma_detalhes TEXT,
  psicossoma_intensidade INTEGER CHECK (psicossoma_intensidade >= 0 AND psicossoma_intensidade <= 5),
  
  -- Holossoma (estado geral, sincronicidades)
  holossoma_detalhes TEXT,
  holossoma_intensidade INTEGER CHECK (holossoma_intensidade >= 0 AND holossoma_intensidade <= 5),
  
  -- Contexto / gatilho percebido
  contexto TEXT,
  
  -- Notas livres
  notas TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS
ALTER TABLE sinais ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own sinais" ON sinais
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own sinais" ON sinais
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own sinais" ON sinais
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own sinais" ON sinais
  FOR DELETE USING (auth.uid() = user_id);

-- Índices para consultas por usuário + data
CREATE INDEX IF NOT EXISTS idx_sinais_user_id ON sinais(user_id);
CREATE INDEX IF NOT EXISTS idx_sinais_registered_at ON sinais(user_id, registered_at DESC);
CREATE INDEX IF NOT EXISTS idx_sinais_date_br ON sinais(user_id, (registered_at AT TIME ZONE 'America/Sao_Paulo'));
