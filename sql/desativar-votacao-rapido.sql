-- Script para desativar rapidamente a votação
-- Execute este script no SQL Editor do Supabase

-- 1. Desativar a configuração votacao_visible
UPDATE system_settings 
SET setting_value = 'false', updated_at = NOW()
WHERE setting_key = 'votacao_visible';

-- 2. Verificar se foi desativada
SELECT 
  'Status da Votação' as status,
  setting_key,
  setting_value,
  updated_at
FROM system_settings
WHERE setting_key = 'votacao_visible';

-- 3. Verificar todas as configurações de visibilidade
SELECT 
  'Todas as Configurações' as status,
  setting_key,
  setting_value,
  description
FROM system_settings
WHERE setting_key LIKE '%_visible'
ORDER BY setting_key;
