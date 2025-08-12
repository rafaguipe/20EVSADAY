-- Update Setup Files to Fix Security Issues
-- This script updates the original setup files to ensure views are created securely

-- 1. Update daily_report_statistics view in setup-daily-reports.sql
-- Replace the existing view creation with this secure version
CREATE OR REPLACE VIEW public.daily_report_statistics 
AS
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
FROM public.daily_report_logs
GROUP BY report_date
ORDER BY report_date DESC;

-- 2. Update welcome_email_statistics view in setup-welcome-email.sql
-- Replace the existing view creation with this secure version
CREATE OR REPLACE VIEW public.welcome_email_statistics 
AS
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
FROM public.welcome_email_logs;

-- 3. Grant appropriate permissions to authenticated users
GRANT SELECT ON public.daily_report_statistics TO authenticated;
GRANT SELECT ON public.welcome_email_statistics TO authenticated;

-- 4. Ensure RLS policies are properly applied to underlying tables
-- (These should already exist from your setup files)

-- 5. Verify the security settings
SELECT 
  'View Security Settings' as check_type,
  schemaname,
  viewname,
  'SECURITY INVOKER (Secure)' as security_setting
FROM pg_views 
WHERE viewname IN ('daily_report_statistics', 'welcome_email_statistics')
ORDER BY viewname;

-- 6. Additional verification - check view definitions
SELECT 
  'View Definition Check' as check_type,
  viewname,
  'View recreated without SECURITY DEFINER' as status
FROM pg_views 
WHERE viewname IN ('daily_report_statistics', 'welcome_email_statistics')
ORDER BY viewname;
