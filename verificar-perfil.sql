-- Script para verificar e criar perfil do usuário
-- Execute este script no Supabase SQL Editor

-- 1. Verificar se o perfil existe
SELECT 
  'Verificando perfil do usuário' as status,
  COUNT(*) as total_profiles
FROM profiles 
WHERE user_id = 'e426b8ab-b3f7-443b-b00e-f2e2e053893b';

-- 2. Ver detalhes do perfil
SELECT 
  id,
  user_id,
  username,
  full_name,
  avatar_url,
  is_admin,
  created_at,
  updated_at
FROM profiles 
WHERE user_id = 'e426b8ab-b3f7-443b-b00e-f2e2e053893b';

-- 3. Se não existir, criar o perfil (execute apenas se não existir)
-- INSERT INTO profiles (
--   user_id,
--   username,
--   full_name,
--   avatar_url,
--   is_admin,
--   created_at,
--   updated_at
-- ) VALUES (
--   'e426b8ab-b3f7-443b-b00e-f2e2e053893b',
--   'rafaguipe',
--   'rafaguipe',
--   'avatar_1.png',
--   true,
--   NOW(),
--   NOW()
-- );

-- 4. Verificar todos os usuários e perfis
SELECT 
  'Todos os usuários e perfis' as status,
  COUNT(*) as total_users
FROM auth.users;

-- 5. Listar usuários sem perfil
SELECT 
  au.id as user_id,
  au.email,
  au.raw_user_meta_data,
  CASE WHEN p.id IS NULL THEN 'SEM PERFIL' ELSE 'COM PERFIL' END as status
FROM auth.users au
LEFT JOIN profiles p ON au.id = p.user_id
WHERE p.id IS NULL; 