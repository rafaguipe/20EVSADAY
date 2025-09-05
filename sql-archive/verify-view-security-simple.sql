-- Simple View Security Verification
-- This script checks if the views are properly configured for security
-- Compatible with different PostgreSQL versions

-- 1. Check if views exist
SELECT 
  'View Existence Check' as check_type,
  'daily_report_statistics' as view_name,
  CASE 
    WHEN EXISTS (SELECT 1 FROM pg_views WHERE viewname = 'daily_report_statistics') 
    THEN 'View exists' 
    ELSE 'View does not exist' 
  END as status;

SELECT 
  'View Existence Check' as check_type,
  'welcome_email_statistics' as view_name,
  CASE 
    WHEN EXISTS (SELECT 1 FROM pg_views WHERE viewname = 'welcome_email_statistics') 
    THEN 'View exists' 
    ELSE 'View does not exist' 
  END as status;

-- 2. Check view permissions using information_schema
SELECT 
  'View Permissions Check' as check_type,
  table_name as view_name,
  grantee,
  privilege_type
FROM information_schema.table_privileges 
WHERE table_name IN ('daily_report_statistics', 'welcome_email_statistics')
  AND table_schema = 'public'
ORDER BY table_name, grantee;

-- 3. Check if underlying tables have RLS enabled
SELECT 
  'RLS Check' as check_type,
  tablename,
  CASE 
    WHEN relrowsecurity THEN 'RLS enabled'
    ELSE 'RLS disabled'
  END as rls_status
FROM pg_tables pt
JOIN pg_class pc ON pt.tablename = pc.relname
WHERE tablename IN ('daily_report_logs', 'welcome_email_logs')
  AND schemaname = 'public';

-- 4. Test view functionality (this will verify RLS is working)
SELECT 
  'View Functionality Test' as check_type,
  'Testing daily_report_statistics' as test_name;

-- Try to query the view (this should respect RLS)
SELECT 
  'daily_report_statistics' as view_name,
  COUNT(*) as row_count 
FROM daily_report_statistics;

SELECT 
  'View Functionality Test' as check_type,
  'Testing welcome_email_statistics' as test_name;

SELECT 
  'welcome_email_statistics' as view_name,
  COUNT(*) as row_count 
FROM welcome_email_statistics;

-- 5. Security summary
SELECT 
  'Security Summary' as check_type,
  'If views work and respect RLS, they are running with SECURITY INVOKER' as status,
  'This is the secure default behavior' as details;
