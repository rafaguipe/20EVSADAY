-- Script simples para corrigir o sistema de configurações
-- Execute este script no SQL Editor do Supabase

-- 1. Verificar se a tabela system_settings existe
SELECT 
  'Verificação da Tabela' as status,
  CASE 
    WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'system_settings' AND table_schema = 'public')
    THEN 'Tabela existe'
    ELSE 'Tabela não existe'
  END as resultado;

-- 2. Se a tabela não existir, criar
CREATE TABLE IF NOT EXISTS public.system_settings (
  id SERIAL PRIMARY KEY,
  setting_key TEXT NOT NULL UNIQUE,
  setting_value TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Verificar estrutura da tabela
SELECT 
  'Estrutura da Tabela' as status,
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_name = 'system_settings'
  AND table_schema = 'public'
ORDER BY ordinal_position;

-- 4. Verificar se as funções existem
SELECT 
  'Verificação das Funções' as status,
  routine_name,
  routine_type
FROM information_schema.routines
WHERE routine_schema = 'public'
  AND routine_name IN ('get_system_setting', 'set_system_setting')
ORDER BY routine_name;

-- 5. Criar função get_system_setting se não existir
CREATE OR REPLACE FUNCTION get_system_setting(p_key TEXT)
RETURNS TEXT AS $$
DECLARE
  result TEXT;
BEGIN
  SELECT setting_value INTO result
  FROM system_settings
  WHERE setting_key = p_key;
  
  RETURN COALESCE(result, 'false');
END;
$$ LANGUAGE plpgsql;

-- 6. Criar função set_system_setting se não existir
CREATE OR REPLACE FUNCTION set_system_setting(
  p_key TEXT,
  p_value TEXT,
  p_description TEXT DEFAULT NULL
)
RETURNS VOID AS $$
BEGIN
  INSERT INTO system_settings (setting_key, setting_value, description, updated_at)
  VALUES (p_key, p_value, p_description, NOW())
  ON CONFLICT (setting_key) 
  DO UPDATE SET 
    setting_value = EXCLUDED.setting_value,
    description = COALESCE(EXCLUDED.description, system_settings.description),
    updated_at = NOW();
END;
$$ LANGUAGE plpgsql;

-- 7. Configurar RLS se não estiver configurado
ALTER TABLE system_settings ENABLE ROW LEVEL SECURITY;

-- 8. Criar políticas RLS se não existirem
CREATE POLICY IF NOT EXISTS "Users can read system settings" ON system_settings
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY IF NOT EXISTS "Admins can manage system settings" ON system_settings
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE user_id = auth.uid() 
      AND role = 'admin'
    )
  );

-- 9. Inserir configurações padrão se não existirem
INSERT INTO system_settings (setting_key, setting_value, description)
VALUES 
  ('sobre_visible', 'false', 'Controla se a aba Sobre é visível para todos os usuários'),
  ('loja_visible', 'false', 'Controla se a aba Loja é visível para todos os usuários'),
  ('multimidia_visible', 'true', 'Controla se a aba Multimídia é visível para todos os usuários'),
  ('chat_visible', 'true', 'Controla se a aba Chat é visível para todos os usuários'),
  ('badges_visible', 'true', 'Controla se a aba Badges é visível para todos os usuários'),
  ('leaderboard_visible', 'true', 'Controla se a aba Ranking é visível para todos os usuários'),
  ('votacao_visible', 'false', 'Controla se a aba Votação é visível para todos os usuários')
ON CONFLICT (setting_key) DO NOTHING;

-- 10. Testar as funções
SELECT 
  'Teste das Funções' as status,
  get_system_setting('votacao_visible') as votacao_visible,
  get_system_setting('chat_visible') as chat_visible,
  get_system_setting('badges_visible') as badges_visible;

-- 11. Verificar configurações finais
SELECT 
  'Configurações Finais' as status,
  setting_key,
  setting_value,
  description
FROM system_settings
WHERE setting_key LIKE '%_visible'
ORDER BY setting_key;
