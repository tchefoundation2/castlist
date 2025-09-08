-- =====================================================
-- Castlist Database: Simple Export Script
-- =====================================================
-- 
-- Execute this script in Supabase SQL Editor to get a complete
-- overview of your database structure and data.
-- =====================================================

-- 1. List all tables
SELECT '-- TABLES' as section;
SELECT 
    schemaname as schema_name,
    tablename as table_name,
    tableowner as owner
FROM pg_tables 
WHERE schemaname = 'public'
ORDER BY tablename;

-- 2. List all functions
SELECT '-- FUNCTIONS' as section;
SELECT 
    routine_name as function_name,
    data_type as return_type,
    external_language as language
FROM information_schema.routines 
WHERE routine_schema = 'public' 
AND routine_type = 'FUNCTION'
ORDER BY routine_name;

-- 3. List all policies
SELECT '-- RLS POLICIES' as section;
SELECT 
    schemaname as schema_name,
    tablename as table_name,
    policyname as policy_name,
    cmd as command,
    qual as condition
FROM pg_policies 
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- 4. List all indexes
SELECT '-- INDEXES' as section;
SELECT 
    schemaname as schema_name,
    tablename as table_name,
    indexname as index_name,
    indexdef as definition
FROM pg_indexes 
WHERE schemaname = 'public'
ORDER BY tablename, indexname;

-- 5. Count records in each table
SELECT '-- RECORD COUNTS' as section;
SELECT 
    'profiles' as table_name,
    COUNT(*) as record_count
FROM public.profiles
UNION ALL
SELECT 
    'guides' as table_name,
    COUNT(*) as record_count
FROM public.guides
UNION ALL
SELECT 
    'books' as table_name,
    COUNT(*) as record_count
FROM public.books
UNION ALL
SELECT 
    'guide_books' as table_name,
    COUNT(*) as record_count
FROM public.guide_books
UNION ALL
SELECT 
    'activities' as table_name,
    COUNT(*) as record_count
FROM public.activities
UNION ALL
SELECT 
    'guide_likes' as table_name,
    COUNT(*) as record_count
FROM public.guide_likes;

-- 6. Test key functions
SELECT '-- FUNCTION TESTS' as section;
SELECT 'Testing get_public_guides_feed...' as test;
SELECT * FROM public.get_public_guides_feed(3, 0);

SELECT 'Testing get_activities_feed...' as test;
SELECT * FROM public.get_activities_feed(3, 0);

-- 7. Check permissions
SELECT '-- PERMISSIONS' as section;
SELECT 
    grantee as role_name,
    table_name,
    privilege_type
FROM information_schema.table_privileges 
WHERE table_schema = 'public'
AND grantee IN ('anon', 'authenticated')
ORDER BY table_name, grantee;

-- =====================================================
-- NOTES:
-- =====================================================
-- 
-- 1. This script gives you a complete overview
-- 2. Shows all tables, functions, policies, indexes
-- 3. Shows record counts and tests key functions
-- 4. Safe to run multiple times
-- 5. Use this to understand your current database state
--
-- =====================================================
