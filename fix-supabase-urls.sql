-- Configurar URLs corretas para produção no Supabase
-- Execute este script no SQL Editor do Supabase

-- Atualizar configuração de autenticação
UPDATE auth.config 
SET 
  site_url = 'https://20evsaday.vercel.app',
  redirect_urls = ARRAY[
    'https://20evsaday.vercel.app',
    'https://20evsaday.vercel.app/',
    'https://20evsaday.vercel.app/dashboard',
    'https://20evsaday.vercel.app/login',
    'https://20evsaday.vercel.app/register'
  ]
WHERE id = 1;

-- Verificar a configuração atual
SELECT 
  site_url,
  redirect_urls
FROM auth.config; 