-- CORRIGIR FUNÇÕES DE EMAIL - VERSÃO 2.0
-- Execute este script no Supabase SQL Editor para resolver definitivamente o erro de tipos

-- 1. REMOVER FUNÇÕES PROBLEMÁTICAS
DROP FUNCTION IF EXISTS get_pending_welcome_emails() CASCADE;
DROP FUNCTION IF EXISTS get_pending_users_list() CASCADE;
DROP FUNCTION IF EXISTS get_all_users_with_emails() CASCADE;

-- 2. CRIAR TABELA DE LOGS (se não existir)
CREATE TABLE IF NOT EXISTS welcome_email_logs (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT,
  email TEXT,
  status TEXT DEFAULT 'pending',
  sent_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  email_type TEXT DEFAULT 'welcome',
  subject TEXT,
  error_message TEXT
);

-- 3. FUNÇÃO PARA ESTATÍSTICAS (RETORNA JSON)
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

-- 4. FUNÇÃO PARA LISTAR USUÁRIOS PENDENTES (RETORNA TABLE)
CREATE OR REPLACE FUNCTION get_pending_users_list()
RETURNS TABLE (
  user_id UUID,
  email TEXT,
  username TEXT,
  email_confirmed_at TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    au.id::UUID as user_id,
    au.email::TEXT as email,
    COALESCE(p.username, au.raw_user_meta_data->>'nickname', split_part(au.email, '@', 1), 'Usuário')::TEXT as username,
    au.email_confirmed_at::TIMESTAMPTZ as email_confirmed_at
  FROM auth.users au
  LEFT JOIN profiles p ON au.id = p.user_id
  LEFT JOIN welcome_email_logs wel ON au.id = wel.user_id
  WHERE 
    au.email_confirmed_at IS NOT NULL 
    AND wel.id IS NULL
  ORDER BY au.email_confirmed_at DESC;
END;
$$ LANGUAGE plpgsql;

-- 5. FUNÇÃO PARA OBTER TODOS OS USUÁRIOS (RETORNA TABLE)
CREATE OR REPLACE FUNCTION get_all_users_with_emails()
RETURNS TABLE (
  user_id UUID,
  username TEXT,
  full_name TEXT,
  email TEXT,
  email_confirmed_at TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    au.id::UUID as user_id,
    COALESCE(p.username, au.raw_user_meta_data->>'nickname', split_part(au.email, '@', 1), 'Usuário')::TEXT as username,
    COALESCE(p.full_name, au.raw_user_meta_data->>'full_name', '')::TEXT as full_name,
    au.email::TEXT as email,
    au.email_confirmed_at::TIMESTAMPTZ as email_confirmed_at
  FROM auth.users au
  LEFT JOIN profiles p ON au.id = p.user_id
  WHERE au.id IS NOT NULL
  ORDER BY au.created_at DESC;
END;
$$ LANGUAGE plpgsql;

-- 6. CONFIGURAR PERMISSÕES
GRANT EXECUTE ON FUNCTION get_pending_welcome_emails() TO authenticated;
GRANT EXECUTE ON FUNCTION get_pending_users_list() TO authenticated;
GRANT EXECUTE ON FUNCTION get_all_users_with_emails() TO authenticated;
GRANT ALL ON TABLE welcome_email_logs TO authenticated;

-- 7. TESTAR FUNÇÕES
DO $$
BEGIN
  RAISE NOTICE '=== TESTANDO FUNÇÕES ===';
  
  -- Testar get_pending_welcome_emails
  RAISE NOTICE 'Testando get_pending_welcome_emails()...';
  PERFORM get_pending_welcome_emails();
  RAISE NOTICE '✅ get_pending_welcome_emails() funcionando!';
  
  -- Testar get_pending_users_list
  RAISE NOTICE 'Testando get_pending_users_list()...';
  PERFORM COUNT(*) FROM get_pending_users_list();
  RAISE NOTICE '✅ get_pending_users_list() funcionando!';
  
  -- Testar get_all_users_with_emails
  RAISE NOTICE 'Testando get_all_users_with_emails()...';
  PERFORM COUNT(*) FROM get_all_users_with_emails();
  RAISE NOTICE '✅ get_all_users_with_emails() funcionando!';
  
  RAISE NOTICE '=== TODAS AS FUNÇÕES FUNCIONANDO! ===';
END $$;

-- 8. MOSTRAR RESULTADOS DOS TESTES
SELECT '📊 ESTATÍSTICAS:' as info;
SELECT get_pending_welcome_emails();

SELECT '👥 USUÁRIOS PENDENTES:' as info;
SELECT * FROM get_pending_users_list() LIMIT 3;

SELECT '📧 TODOS OS USUÁRIOS:' as info;
SELECT * FROM get_all_users_with_emails() LIMIT 3;

SELECT '🎉 SISTEMA DE EMAIL CONFIGURADO COM SUCESSO!' as status;
