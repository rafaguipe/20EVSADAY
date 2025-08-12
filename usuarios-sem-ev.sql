-- SQL para identificar usuários que se cadastraram mas nunca registraram EV
-- Execute este script no Supabase SQL Editor

-- 1. Contagem total de usuários sem EV
SELECT 
  'Usuários cadastrados sem EV' as status,
  COUNT(*) as total_usuarios
FROM auth.users au
LEFT JOIN evs e ON au.id = e.user_id
WHERE e.id IS NULL;

-- 2. Lista detalhada de usuários sem EV
SELECT 
  au.id as user_id,
  au.email,
  au.created_at as data_cadastro,
  au.last_sign_in_at as ultimo_login,
  au.email_confirmed_at as email_confirmado,
  p.username,
  CASE 
    WHEN au.email_confirmed_at IS NOT NULL THEN '✅ Confirmado'
    ELSE '❌ Não confirmado'
  END as status_email,
  CASE 
    WHEN au.last_sign_in_at IS NOT NULL THEN '✅ Já fez login'
    ELSE '❌ Nunca fez login'
  END as status_login
FROM auth.users au
LEFT JOIN evs e ON au.id = e.user_id
LEFT JOIN profiles p ON au.id = p.user_id
WHERE e.id IS NULL
ORDER BY au.created_at DESC;

-- 3. Estatísticas por status de email
SELECT 
  'Usuários sem EV por status de email' as status,
  CASE 
    WHEN au.email_confirmed_at IS NOT NULL THEN '✅ Email Confirmado'
    ELSE '❌ Email Não Confirmado'
  END as tipo_usuario,
  COUNT(*) as quantidade
FROM auth.users au
LEFT JOIN evs e ON au.id = e.user_id
WHERE e.id IS NULL
GROUP BY (au.email_confirmed_at IS NOT NULL)
ORDER BY quantidade DESC;

-- 4. Estatísticas por status de login
SELECT 
  'Usuários sem EV por status de login' as status,
  CASE 
    WHEN au.last_sign_in_at IS NOT NULL THEN '✅ Já fez login'
    ELSE '❌ Nunca fez login'
  END as tipo_usuario,
  COUNT(*) as quantidade
FROM auth.users au
LEFT JOIN evs e ON au.id = e.user_id
WHERE e.id IS NULL
GROUP BY (au.last_sign_in_at IS NOT NULL)
ORDER BY quantidade DESC;

-- 5. Usuários sem EV que têm perfil criado
SELECT 
  'Usuários sem EV com perfil criado' as status,
  COUNT(*) as total_usuarios
FROM auth.users au
LEFT JOIN evs e ON au.id = e.user_id
INNER JOIN profiles p ON au.id = p.user_id
WHERE e.id IS NULL;

-- 6. Usuários sem EV que NÃO têm perfil criado
SELECT 
  'Usuários sem EV SEM perfil criado' as status,
  COUNT(*) as total_usuarios
FROM auth.users au
LEFT JOIN evs e ON au.id = e.user_id
LEFT JOIN profiles p ON au.id = p.user_id
WHERE e.id IS NULL AND p.id IS NULL;

-- 7. Resumo completo
SELECT 
  'RESUMO GERAL' as titulo,
  (SELECT COUNT(*) FROM auth.users) as total_usuarios_cadastrados,
  (SELECT COUNT(*) FROM evs) as total_evs_registrados,
  (SELECT COUNT(DISTINCT user_id) FROM evs) as usuarios_com_ev,
  (SELECT COUNT(*) FROM auth.users au LEFT JOIN evs e ON au.id = e.user_id WHERE e.id IS NULL) as usuarios_sem_ev,
  ROUND(
    (SELECT COUNT(*) FROM auth.users au LEFT JOIN evs e ON au.id = e.user_id WHERE e.id IS NULL) * 100.0 / 
    (SELECT COUNT(*) FROM auth.users), 2
  ) as percentual_sem_ev;

-- 8. Usuários sem EV ordenados por data de cadastro (mais recentes primeiro)
SELECT 
  'Usuários sem EV - Mais recentes' as status,
  au.email,
  au.created_at as data_cadastro,
  p.username,
  CASE 
    WHEN au.email_confirmed_at IS NOT NULL THEN '✅'
    ELSE '❌'
  END as email_confirmado,
  CASE 
    WHEN au.last_sign_in_at IS NOT NULL THEN '✅'
    ELSE '❌'
  END as ja_fez_login
FROM auth.users au
LEFT JOIN evs e ON au.id = e.user_id
LEFT JOIN profiles p ON au.id = p.user_id
WHERE e.id IS NULL
ORDER BY au.created_at DESC
LIMIT 20;

-- 9. Usuários sem EV que nunca fizeram login
SELECT 
  'Usuários sem EV que nunca fizeram login' as status,
  au.email,
  au.created_at as data_cadastro,
  au.email_confirmed_at as email_confirmado_em
FROM auth.users au
LEFT JOIN evs e ON au.id = e.user_id
WHERE e.id IS NULL AND au.last_sign_in_at IS NULL
ORDER BY au.created_at DESC; 