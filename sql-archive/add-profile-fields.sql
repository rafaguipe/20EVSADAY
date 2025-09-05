-- Script para adicionar campos de configuração na tabela profiles
-- Execute este script no Supabase SQL Editor

-- 1. Adicionar campo sound_enabled (notificações sonoras)
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS sound_enabled BOOLEAN DEFAULT true;

-- 2. Adicionar campo ev_interval_minutes (intervalo entre EVs)
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS ev_interval_minutes INTEGER DEFAULT 25;

-- 3. Atualizar registros existentes para ter valores padrão
UPDATE profiles 
SET sound_enabled = true, ev_interval_minutes = 25 
WHERE sound_enabled IS NULL OR ev_interval_minutes IS NULL;

-- 4. Verificar se os campos foram adicionados
SELECT 
  user_id, 
  username, 
  sound_enabled, 
  ev_interval_minutes 
FROM profiles 
LIMIT 5; 