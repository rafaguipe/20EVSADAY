-- SQL simples para listar todos os e-mails dos usuários cadastrados
-- Execute este script no Supabase SQL Editor

-- Opção 1: Lista simples com apenas e-mails
SELECT 
  email
FROM auth.users 
ORDER BY email;

-- Opção 2: Lista com e-mails e data de criação
SELECT 
  email,
  created_at as data_cadastro
FROM auth.users 
ORDER BY created_at DESC;

-- Opção 3: Lista completa com informações do usuário
SELECT 
  email,
  email_confirmed_at as email_confirmado_em,
  created_at as data_cadastro,
  last_sign_in_at as ultimo_login,
  CASE 
    WHEN email_confirmed_at IS NOT NULL THEN '✅ Confirmado'
    ELSE '❌ Não confirmado'
  END as status_email
FROM auth.users 
ORDER BY created_at DESC;

-- Opção 4: Contagem de e-mails por status
SELECT 
  CASE 
    WHEN email_confirmed_at IS NOT NULL THEN '✅ Confirmados'
    ELSE '❌ Não confirmados'
  END as status,
  COUNT(*) as quantidade
FROM auth.users 
GROUP BY (email_confirmed_at IS NOT NULL)
ORDER BY quantidade DESC;

-- Opção 5: E-mails únicos (sem duplicatas)
SELECT DISTINCT
  email
FROM auth.users 
WHERE email IS NOT NULL
ORDER BY email; 