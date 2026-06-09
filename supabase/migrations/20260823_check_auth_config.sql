-- Verificar configurações de Auth (executar no Supabase SQL Editor)
-- Mostra Site URL, emails, SMTP e redirect URLs configurados

-- Configurações gerais de auth
SELECT 
  'auth.site_url' as config_key,
  current_setting('app.settings.auth_site_url', true) as value
UNION ALL
SELECT 
  'auth.redirect_urls',
  current_setting('app.settings.auth_redirect_urls', true)
UNION ALL
SELECT 
  'email.enabled',
  current_setting('app.settings.external_email_enabled', true)
UNION ALL
SELECT 
  'email.smtp_host',
  CASE 
    WHEN current_setting('app.settings.external_email_smtp_host', true) != '' 
    THEN current_setting('app.settings.external_email_smtp_host', true)
    ELSE 'USANDO PROVEDOR PADRÃO (Resend)'
  END
UNION ALL
SELECT 
  'email.smtp_port',
  current_setting('app.settings.external_email_smtp_port', true)
UNION ALL
SELECT 
  'email.sender_name',
  current_setting('app.settings.external_email_sender_name', true)
