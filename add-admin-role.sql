-- Script para adicionar campo de administrador
-- Execute este script no Supabase SQL Editor

-- 1. Adicionar campo is_admin na tabela profiles
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT false;

-- 2. Definir você como administrador (substitua pelo seu user_id)
-- Para encontrar seu user_id, execute: SELECT user_id FROM profiles WHERE username = 'seu_username';
UPDATE profiles 
SET is_admin = true 
WHERE user_id = 'e426b8ab-b3f7-443b-b00e-f2e2e053893b'; -- Substitua pelo seu user_id

-- 3. Verificar se foi aplicado corretamente
SELECT 
  username, 
  is_admin,
  created_at
FROM profiles 
WHERE is_admin = true;

-- 4. Mostrar todos os usuários e seus status de admin
SELECT 
  username, 
  is_admin,
  created_at
FROM profiles 
ORDER BY is_admin DESC, created_at DESC;

-- 5. Verificar estrutura da tabela profiles (opcional)
-- SELECT column_name, data_type, is_nullable 
-- FROM information_schema.columns 
-- WHERE table_name = 'profiles' 
-- ORDER BY ordinal_position; 