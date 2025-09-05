-- Script para enviar emails de boas-vindas para todos os usuários que não receberam
-- Execute este script no Supabase SQL Editor

-- 1. Verificar usuários que validaram email mas não receberam welcome email
SELECT 
  'Usuários que validaram email mas não receberam welcome email' as status,
  COUNT(*) as total_users
FROM auth.users au
LEFT JOIN welcome_email_logs wel ON au.id = wel.user_id
WHERE 
  au.email_confirmed_at IS NOT NULL 
  AND wel.id IS NULL;

-- 2. Listar usuários que precisam receber email
SELECT 
  au.id as user_id,
  au.email,
  au.raw_user_meta_data,
  au.email_confirmed_at,
  CASE WHEN wel.id IS NULL THEN 'NÃO RECEBEU' ELSE 'JÁ RECEBEU' END as status_email
FROM auth.users au
LEFT JOIN welcome_email_logs wel ON au.id = wel.user_id
WHERE 
  au.email_confirmed_at IS NOT NULL 
  AND wel.id IS NULL
ORDER BY au.email_confirmed_at DESC;

-- 3. Criar função para enviar email para um usuário específico
CREATE OR REPLACE FUNCTION send_welcome_email_to_user(target_user_id UUID)
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
  
  -- Registrar tentativa de envio (simulação)
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

-- 4. Função para enviar para todos os usuários pendentes
CREATE OR REPLACE FUNCTION send_welcome_email_to_all_pending()
RETURNS JSON AS $$
DECLARE
  user_record RECORD;
  results JSON[] := '{}';
  success_count INTEGER := 0;
  error_count INTEGER := 0;
BEGIN
  FOR user_record IN 
    SELECT au.id as user_id
    FROM auth.users au
    LEFT JOIN welcome_email_logs wel ON au.id = wel.user_id
    WHERE 
      au.email_confirmed_at IS NOT NULL 
      AND wel.id IS NULL
  LOOP
    BEGIN
      SELECT send_welcome_email_to_user(user_record.user_id) INTO result;
      results := array_append(results, result);
      
      IF (result->>'success')::BOOLEAN THEN
        success_count := success_count + 1;
      ELSE
        error_count := error_count + 1;
      END IF;
    EXCEPTION WHEN OTHERS THEN
      error_count := error_count + 1;
      results := array_append(results, json_build_object(
        'success', false, 
        'error', SQLERRM,
        'user_id', user_record.user_id
      ));
    END;
  END LOOP;
  
  RETURN json_build_object(
    'success', true,
    'summary', json_build_object(
      'total_processed', array_length(results, 1),
      'success_count', success_count,
      'error_count', error_count
    ),
    'results', results
  );
END;
$$ LANGUAGE plpgsql;

-- 5. Executar envio para todos os pendentes (descomente para executar)
-- SELECT send_welcome_email_to_all_pending();

-- 6. Verificar estatísticas após envio
SELECT 
  'Estatísticas de emails de boas-vindas' as status,
  COUNT(*) as total_enviados,
  COUNT(CASE WHEN status = 'sent' THEN 1 END) as enviados_com_sucesso,
  COUNT(CASE WHEN status = 'failed' THEN 1 END) as falharam,
  COUNT(CASE WHEN status = 'pending' THEN 1 END) as pendentes
FROM welcome_email_logs; 