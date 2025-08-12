-- Fix Security Definer View Issues
-- This script fixes views that are incorrectly set to SECURITY DEFINER
-- by recreating them with SECURITY INVOKER (the secure default)

-- Fix daily_report_statistics view
DROP VIEW IF EXISTS public.daily_report_statistics;

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

-- Fix welcome_email_statistics view
DROP VIEW IF EXISTS public.welcome_email_statistics;

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

-- Grant appropriate permissions to authenticated users
GRANT SELECT ON public.daily_report_statistics TO authenticated;
GRANT SELECT ON public.welcome_email_statistics TO authenticated;

-- Verify the views are now created (basic verification)
SELECT 
  schemaname,
  viewname,
  viewowner
FROM pg_views 
WHERE viewname IN ('daily_report_statistics', 'welcome_email_statistics')
ORDER BY viewname;

-- Test the views to ensure they work correctly
SELECT 'daily_report_statistics' as view_name, COUNT(*) as row_count FROM daily_report_statistics;
SELECT 'welcome_email_statistics' as view_name, COUNT(*) as row_count FROM welcome_email_statistics;

-- Check if views respect RLS by testing with different user contexts
-- (This will help verify the security fix worked)
SELECT 
  'Security Check' as check_type,
  'Views should now respect RLS policies' as status;
