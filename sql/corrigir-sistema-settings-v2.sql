-- Script para corrigir problemas com o sistema de configurações (Versão 2)
-- Execute este script no SQL Editor do Supabase

-- 1. Remover funções existentes se existirem
DROP FUNCTION IF EXISTS get_system_setting(TEXT);
DROP FUNCTION IF EXISTS set_system_setting(TEXT, TEXT, TEXT);
DROP FUNCTION IF EXISTS set_system_setting(TEXT, TEXT);

-- 2. Remover tabela existente se existir (CUIDADO: isso apaga dados!)
-- DROP TABLE IF EXISTS public.system_settings CASCADE;

-- 3. Criar tabela system_settings
CREATE TABLE IF NOT EXISTS public.system_settings (
  id SERIAL PRIMARY KEY,
  setting_key TEXT NOT NULL UNIQUE,
  setting_value TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Criar função get_system_setting
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

-- 5. Criar função set_system_setting
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

-- 6. Configurar políticas RLS
ALTER TABLE system_settings ENABLE ROW LEVEL SECURITY;

-- Remover políticas antigas se existirem
DROP POLICY IF EXISTS "Users can read system settings" ON system_settings;
DROP POLICY IF EXISTS "Admins can manage system settings" ON system_settings;

-- Política para leitura (todos os usuários autenticados)
CREATE POLICY "Users can read system settings" ON system_settings
  FOR SELECT USING (auth.role() = 'authenticated');

-- Política para escrita (apenas administradores)
CREATE POLICY "Admins can manage system settings" ON system_settings
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE user_id = auth.uid() 
      AND role = 'admin'
    )
  );

-- 7. Inserir configurações padrão se não existirem
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

-- 8. Verificar se as configurações foram inseridas corretamente
SELECT 
  'Verificação Final' as status,
  setting_key,
  setting_value,
  description
FROM system_settings
WHERE setting_key LIKE '%_visible'
ORDER BY setting_key;

-- 9. Testar as funções
SELECT 
  'Teste das Funções' as status,
  get_system_setting('votacao_visible') as votacao_visible,
  get_system_setting('chat_visible') as chat_visible,
  get_system_setting('badges_visible') as badges_visible;

-- 10. Verificar se as políticas RLS estão funcionando
SELECT 
  'Verificação das Políticas RLS' as status,
  policyname,
  cmd,
  permissive
FROM pg_policies
WHERE tablename = 'system_settings'
ORDER BY policyname;
