-- Script para verificar logs de email de boas-vindas
-- Execute este script no Supabase SQL Editor

-- 1. Verificar se a tabela existe
SELECT 
  'Tabela welcome_email_logs' as status,
  COUNT(*) as total_registros
FROM welcome_email_logs;

-- 2. Verificar logs recentes
SELECT 
  username,
  email,
  sent_at,
  status,
  error_message
FROM welcome_email_logs 
ORDER BY sent_at DESC 
LIMIT 10;

-- 3. Verificar estatísticas
SELECT * FROM welcome_email_statistics;

-- 4. Verificar se há logs do seu usuário
SELECT 
  username,
  email,
  sent_at,
  status,
  error_message
FROM welcome_email_logs 
WHERE user_id = 'e426b8ab-b3f7-443b-b00e-f2e2e053893b'
ORDER BY sent_at DESC;

-- 5. Verificar logs com erro
SELECT 
  username,
  email,
  sent_at,
  status,
  error_message
FROM welcome_email_logs 
WHERE status = 'failed' OR error_message IS NOT NULL
ORDER BY sent_at DESC; 