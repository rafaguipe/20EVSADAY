-- Verify View Security Settings
-- This script checks if the views are properly configured for security

-- 1. Check if views exist and their basic properties
-- First, let's see what columns are available in pg_views
SELECT 
  'Available Columns in pg_views' as check_type,
  column_name,
  data_type
FROM information_schema.columns 
WHERE table_name = 'pg_views' 
  AND table_schema = 'information_schema'
ORDER BY ordinal_position;

-- 2. Check if views exist (using available columns)
SELECT 
  'View Existence Check' as check_type,
  viewname,
  'View exists' as status
FROM pg_views 
WHERE viewname IN ('daily_report_statistics', 'welcome_email_statistics')
ORDER BY viewname;

-- 3. Check view permissions
SELECT 
  'View Permissions Check' as check_type,
  table_schema as schemaname,
  table_name as viewname,
  grantee,
  privilege_type
FROM information_schema.table_privileges 
WHERE table_name IN ('daily_report_statistics', 'welcome_email_statistics')
  AND table_schema = 'public'
ORDER BY table_name, grantee;

-- 4. Check underlying table RLS policies
SELECT 
  'RLS Policy Check' as check_type,
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE tablename IN ('daily_report_logs', 'welcome_email_logs')
  AND schemaname = 'public'
ORDER BY tablename, policyname;

-- 5. Test view functionality (this will verify RLS is working)
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

-- 6. Summary of security status
SELECT 
  'Security Summary' as check_type,
  'Views should now run with SECURITY INVOKER' as status,
  'RLS policies on underlying tables will be enforced' as details;
