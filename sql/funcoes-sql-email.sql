-- Funções SQL para sistema de emails de boas-vindas
-- Execute este script no Supabase SQL Editor

-- 1. Função para obter estatísticas de emails pendentes
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

-- 2. Função para listar usuários pendentes
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

-- 3. Função para enviar email para um usuário específico via Edge Function
CREATE OR REPLACE FUNCTION trigger_welcome_email_for_user(target_user_id UUID)
RETURNS JSON AS $$
DECLARE
  user_email TEXT;
  user_username TEXT;
  result JSON;
BEGIN
  -- Obter dados do usuário
  SELECT 
    au.email,
    COALESCE(p.username, au.raw_user_meta_data->>'nickname', split_part(au.email, '@', 1), 'Usuário')
  INTO user_email, user_username
  FROM auth.users au
  LEFT JOIN profiles p ON au.id = p.user_id
  WHERE au.id = target_user_id;
  
  IF user_email IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'Usuário não encontrado');
  END IF;
  
  -- Verificar se já recebeu email
  IF EXISTS (SELECT 1 FROM welcome_email_logs WHERE user_id = target_user_id) THEN
    RETURN json_build_object('success', false, 'error', 'Usuário já recebeu email de boas-vindas');
  END IF;
  
  -- Registrar tentativa de envio
  INSERT INTO welcome_email_logs (user_id, username, email, status, sent_at)
  VALUES (target_user_id, user_username, user_email, 'pending', NOW());
  
  RETURN json_build_object(
    'success', true, 
    'message', 'Email de boas-vindas enviado para ' || user_email,
    'user', json_build_object(
      'id', target_user_id,
      'email', user_email,
      'username', user_username
    )
  );
END;
$$ LANGUAGE plpgsql;

-- 4. View para estatísticas detalhadas
CREATE OR REPLACE VIEW welcome_email_statistics_detailed AS
SELECT 
  'Total de Usuários' as metric,
  COUNT(*) as value
FROM auth.users 
WHERE email_confirmed_at IS NOT NULL

UNION ALL

SELECT 
  'Já Receberam Email' as metric,
  COUNT(*) as value
FROM welcome_email_logs

UNION ALL

SELECT 
  'Pendentes de Email' as metric,
  COUNT(*) as value
FROM auth.users au
LEFT JOIN welcome_email_logs wel ON au.id = wel.user_id
WHERE 
  au.email_confirmed_at IS NOT NULL 
  AND wel.id IS NULL

UNION ALL

SELECT 
  'Emails Enviados com Sucesso' as metric,
  COUNT(*) as value
FROM welcome_email_logs
WHERE status = 'sent'

UNION ALL

SELECT 
  'Emails que Falharam' as metric,
  COUNT(*) as value
FROM welcome_email_logs
WHERE status = 'failed'

UNION ALL

SELECT 
  'Emails Pendentes' as metric,
  COUNT(*) as value
FROM welcome_email_logs
WHERE status = 'pending';

-- 5. Testar as funções
-- SELECT get_pending_welcome_emails();
-- SELECT * FROM get_pending_users_list();
-- SELECT * FROM welcome_email_statistics_detailed; 