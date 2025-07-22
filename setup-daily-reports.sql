-- Configuração do Sistema de Relatórios Diários - EVSADAY
-- Execute este script no Supabase SQL Editor

-- 1. Criar tabela para logs de relatórios enviados
CREATE TABLE IF NOT EXISTS daily_report_logs (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  report_date DATE NOT NULL,
  sent_at TIMESTAMPTZ DEFAULT NOW(),
  status TEXT NOT NULL CHECK (status IN ('success', 'error', 'no_evs')),
  error_message TEXT,
  email_sent BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Criar índice para performance
CREATE INDEX IF NOT EXISTS idx_daily_report_logs_user_date 
ON daily_report_logs(user_id, report_date);

CREATE INDEX IF NOT EXISTS idx_daily_report_logs_sent_at 
ON daily_report_logs(sent_at);

-- 3. Função para verificar se relatório já foi enviado
CREATE OR REPLACE FUNCTION check_report_sent(user_uuid UUID, report_date DATE)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM daily_report_logs 
    WHERE user_id = user_uuid 
    AND report_date = $2
    AND status = 'success'
  );
END;
$$ LANGUAGE plpgsql;

-- 4. Função para registrar envio de relatório
CREATE OR REPLACE FUNCTION log_report_sent(
  user_uuid UUID, 
  report_date DATE, 
  report_status TEXT, 
  error_msg TEXT DEFAULT NULL
)
RETURNS VOID AS $$
BEGIN
  INSERT INTO daily_report_logs (
    user_id, 
    report_date, 
    status, 
    error_message,
    email_sent
  ) VALUES (
    user_uuid, 
    report_date, 
    report_status, 
    error_msg,
    CASE WHEN report_status = 'success' THEN true ELSE false END
  );
END;
$$ LANGUAGE plpgsql;

-- 5. Função para obter estatísticas de relatórios
CREATE OR REPLACE FUNCTION get_report_stats(start_date DATE, end_date DATE)
RETURNS TABLE (
  total_reports BIGINT,
  successful_reports BIGINT,
  failed_reports BIGINT,
  no_evs_reports BIGINT,
  success_rate NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COUNT(*) as total_reports,
    COUNT(*) FILTER (WHERE status = 'success') as successful_reports,
    COUNT(*) FILTER (WHERE status = 'error') as failed_reports,
    COUNT(*) FILTER (WHERE status = 'no_evs') as no_evs_reports,
    ROUND(
      (COUNT(*) FILTER (WHERE status = 'success')::NUMERIC / COUNT(*)) * 100, 
      2
    ) as success_rate
  FROM daily_report_logs
  WHERE report_date BETWEEN start_date AND end_date;
END;
$$ LANGUAGE plpgsql;

-- 6. Políticas RLS para a tabela de logs
ALTER TABLE daily_report_logs ENABLE ROW LEVEL SECURITY;

-- Usuários podem ver apenas seus próprios logs
CREATE POLICY "Users can view own report logs" ON daily_report_logs
  FOR SELECT USING (auth.uid() = user_id);

-- Apenas o sistema pode inserir logs (via service role)
CREATE POLICY "System can insert report logs" ON daily_report_logs
  FOR INSERT WITH CHECK (true);

-- 7. Verificar configuração
SELECT 
  'Configuração de Relatórios Diários' as sistema,
  'Ativa' as status,
  NOW() as configurado_em;

-- 8. Exemplo de uso das funções
-- SELECT check_report_sent('user-uuid-here', CURRENT_DATE - INTERVAL '1 day');
-- SELECT * FROM get_report_stats(CURRENT_DATE - INTERVAL '7 days', CURRENT_DATE);

-- 9. Criar view para estatísticas de relatórios
CREATE OR REPLACE VIEW daily_report_statistics AS
SELECT 
  report_date,
  COUNT(*) as total_users,
  COUNT(*) FILTER (WHERE status = 'success') as successful_sends,
  COUNT(*) FILTER (WHERE status = 'error') as failed_sends,
  COUNT(*) FILTER (WHERE status = 'no_evs') as no_evs_users,
  ROUND(
    (COUNT(*) FILTER (WHERE status = 'success')::NUMERIC / COUNT(*)) * 100, 
    2
  ) as success_rate
FROM daily_report_logs
GROUP BY report_date
ORDER BY report_date DESC;

-- 10. Verificar se tudo foi criado corretamente
SELECT 
  schemaname,
  tablename,
  tableowner
FROM pg_tables 
WHERE tablename IN ('daily_report_logs')
ORDER BY tablename;

SELECT 
  proname as function_name,
  prosrc as function_source
FROM pg_proc 
WHERE proname IN ('check_report_sent', 'log_report_sent', 'get_report_stats')
ORDER BY proname; 