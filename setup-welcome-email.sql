-- Script para configurar sistema de email de boas-vindas
-- Execute este script no Supabase SQL Editor

-- 1. Criar tabela para logs de emails de boas-vindas
CREATE TABLE IF NOT EXISTS welcome_email_logs (
  id SERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  username TEXT,
  sent_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  status TEXT DEFAULT 'success',
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_welcome_email_logs_user_id ON welcome_email_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_welcome_email_logs_sent_at ON welcome_email_logs(sent_at);
CREATE INDEX IF NOT EXISTS idx_welcome_email_logs_status ON welcome_email_logs(status);

-- 3. Configurar RLS (Row Level Security)
ALTER TABLE welcome_email_logs ENABLE ROW LEVEL SECURITY;

-- Política: Usuários podem ver apenas seus próprios logs
CREATE POLICY "Users can view own welcome email logs" ON welcome_email_logs
  FOR SELECT USING (auth.uid() = user_id);

-- Política: Sistema pode inserir logs
CREATE POLICY "System can insert welcome email logs" ON welcome_email_logs
  FOR INSERT WITH CHECK (true);

-- 4. Função para verificar se email de boas-vindas já foi enviado
CREATE OR REPLACE FUNCTION check_welcome_email_sent(user_uuid UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM welcome_email_logs 
    WHERE user_id = user_uuid 
    AND status = 'success'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. Função para registrar envio de email de boas-vindas
CREATE OR REPLACE FUNCTION log_welcome_email_sent(
  user_uuid UUID,
  user_email TEXT,
  user_username TEXT DEFAULT NULL,
  email_status TEXT DEFAULT 'success',
  error_msg TEXT DEFAULT NULL
)
RETURNS VOID AS $$
BEGIN
  INSERT INTO welcome_email_logs (
    user_id, 
    email, 
    username, 
    status, 
    error_message
  ) VALUES (
    user_uuid,
    user_email,
    user_username,
    email_status,
    error_msg
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. Função para obter estatísticas de emails de boas-vindas
CREATE OR REPLACE FUNCTION get_welcome_email_stats()
RETURNS TABLE (
  total_sent BIGINT,
  total_success BIGINT,
  total_failed BIGINT,
  last_sent TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COUNT(*) as total_sent,
    COUNT(*) FILTER (WHERE status = 'success') as total_success,
    COUNT(*) FILTER (WHERE status = 'failed') as total_failed,
    MAX(sent_at) as last_sent
  FROM welcome_email_logs;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 7. View para estatísticas de emails de boas-vindas (CORRIGIDA)
CREATE OR REPLACE VIEW welcome_email_statistics AS
SELECT 
  COUNT(*) as total_emails_sent,
  COUNT(*) FILTER (WHERE status = 'success') as successful_emails,
  COUNT(*) FILTER (WHERE status = 'failed') as failed_emails,
  CASE 
    WHEN COUNT(*) = 0 THEN 0
    ELSE ROUND(
      (COUNT(*) FILTER (WHERE status = 'success')::DECIMAL / COUNT(*)) * 100, 2
    )
  END as success_rate_percent,
  MAX(sent_at) as last_email_sent,
  MIN(sent_at) as first_email_sent
FROM welcome_email_logs;

-- 8. Verificar se a configuração foi aplicada corretamente
SELECT 
  'Tabela welcome_email_logs criada' as status,
  COUNT(*) as total_logs
FROM welcome_email_logs;

-- 9. Mostrar estatísticas atuais
SELECT * FROM welcome_email_statistics;

-- 10. Mostrar logs recentes (últimos 10)
SELECT 
  username,
  email,
  sent_at,
  status,
  error_message
FROM welcome_email_logs 
ORDER BY sent_at DESC 
LIMIT 10; 