-- Corrigir funções de email - Execute este script no Supabase SQL Editor

-- 1. Dropar as funções existentes se houver problemas
DROP FUNCTION IF EXISTS get_pending_welcome_emails();
DROP FUNCTION IF EXISTS get_pending_users_list();
DROP FUNCTION IF EXISTS get_all_users_with_emails();

-- 2. Criar função para obter estatísticas de emails pendentes
CREATE OR REPLACE FUNCTION get_pending_welcome_emails()
RETURNS JSON AS $$
DECLARE
  total_users INTEGER;
  already_received INTEGER;
  total_pending INTEGER;
  valid_emails INTEGER;
BEGIN
  -- Total de usuários que validaram email
  SELECT COUNT(*) INTO total_users
  FROM auth.users 
  WHERE email_confirmed_at IS NOT NULL;
  
  -- Usuários que já receberam email
  SELECT COUNT(*) INTO already_received
  FROM welcome_email_logs;
  
  -- Usuários pendentes
  SELECT COUNT(*) INTO total_pending
  FROM auth.users au
  LEFT JOIN welcome_email_logs wel ON au.id = wel.user_id
  WHERE 
    au.email_confirmed_at IS NOT NULL 
    AND wel.id IS NULL;
  
  -- Emails válidos (com email confirmado)
  SELECT COUNT(*) INTO valid_emails
  FROM auth.users 
  WHERE email_confirmed_at IS NOT NULL;
  
  RETURN json_build_object(
    'total_users', total_users,
    'already_received', already_received,
    'total_pending', total_pending,
    'valid_emails', valid_emails
  );
END;
$$ LANGUAGE plpgsql;

-- 3. Criar função para listar usuários pendentes
CREATE OR REPLACE FUNCTION get_pending_users_list()
RETURNS TABLE (
  user_id UUID,
  email TEXT,
  username VARCHAR(255),
  email_confirmed_at TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    au.id as user_id,
    au.email,
    COALESCE(p.username, au.raw_user_meta_data->>'nickname', split_part(au.email, '@', 1), 'Usuário') as username,
    au.email_confirmed_at
  FROM auth.users au
  LEFT JOIN profiles p ON au.id = p.user_id
  LEFT JOIN welcome_email_logs wel ON au.id = wel.user_id
  WHERE 
    au.email_confirmed_at IS NOT NULL 
    AND wel.id IS NULL
  ORDER BY au.email_confirmed_at DESC;
END;
$$ LANGUAGE plpgsql;

-- 4. Criar função para obter todos os usuários com emails
CREATE OR REPLACE FUNCTION get_all_users_with_emails()
RETURNS TABLE (
  user_id UUID,
  username VARCHAR(255),
  full_name VARCHAR(255),
  email TEXT,
  email_confirmed_at TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    au.id as user_id,
    COALESCE(p.username, au.raw_user_meta_data->>'nickname', split_part(au.email, '@', 1), 'Usuário') as username,
    COALESCE(p.full_name, au.raw_user_meta_data->>'full_name', '') as full_name,
    au.email,
    au.email_confirmed_at
  FROM auth.users au
  LEFT JOIN profiles p ON au.id = p.user_id
  WHERE au.id IS NOT NULL
  ORDER BY au.created_at DESC;
END;
$$ LANGUAGE plpgsql;

-- 5. Criar tabela de logs se não existir
CREATE TABLE IF NOT EXISTS welcome_email_logs (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  username VARCHAR(255),
  email TEXT,
  status TEXT DEFAULT 'pending',
  sent_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  email_type TEXT DEFAULT 'welcome',
  subject TEXT,
  error_message TEXT
);

-- 6. Configurar permissões
GRANT EXECUTE ON FUNCTION get_pending_welcome_emails() TO authenticated;
GRANT EXECUTE ON FUNCTION get_pending_users_list() TO authenticated;
GRANT EXECUTE ON FUNCTION get_all_users_with_emails() TO authenticated;
GRANT ALL ON TABLE welcome_email_logs TO authenticated;

-- 7. Testar as funções
SELECT 'Testando get_pending_welcome_emails()' as teste;
SELECT get_pending_welcome_emails();

SELECT 'Testando get_pending_users_list()' as teste;
SELECT * FROM get_pending_users_list() LIMIT 3;

SELECT 'Testando get_all_users_with_emails()' as teste;
SELECT * FROM get_all_users_with_emails() LIMIT 3;

SELECT '✅ Funções criadas com sucesso!' as status;
