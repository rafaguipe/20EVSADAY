-- Adicionar campo bluetooth_ev_enabled na tabela profiles
-- Este campo controla se o usuário quer ativar o registro EV via botão Bluetooth

-- 1. Adicionar o campo na tabela profiles
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS bluetooth_ev_enabled BOOLEAN DEFAULT false;

-- 2. Adicionar comentário explicativo
COMMENT ON COLUMN profiles.bluetooth_ev_enabled IS 'Controla se o usuário quer ativar o registro EV via botão Bluetooth (true = ativado, false = desativado)';

-- 3. Verificar se o campo foi criado
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'profiles' 
  AND column_name = 'bluetooth_ev_enabled';

-- 4. Mostrar estrutura atual da tabela profiles
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'profiles' 
ORDER BY ordinal_position;
