-- =====================================================
-- Test CORS Connection for Farcaster
-- =====================================================
-- 
-- Execute this script to test if the database is accessible
-- from the Farcaster domain
-- =====================================================

-- 1. Test basic connection
SELECT 'Testing basic connection...' as test;
SELECT NOW() as current_time;

-- 2. Test public access to profiles
SELECT 'Testing profiles access...' as test;
SELECT COUNT(*) as profile_count FROM public.profiles;

-- 3. Test public access to guides
SELECT 'Testing guides access...' as test;
SELECT COUNT(*) as guide_count FROM public.guides;

-- 4. Test public functions
SELECT 'Testing get_public_guides_feed...' as test;
SELECT * FROM public.get_public_guides_feed(3, 0);

-- 5. Test authenticate function
SELECT 'Testing authenticate_farcaster_user...' as test;
SELECT public.authenticate_farcaster_user(99999, 'test_user', 'https://example.com/pfp.jpg');

-- 6. Check RLS policies
SELECT 'Checking RLS policies...' as test;
SELECT 
    schemaname,
    tablename,
    policyname,
    cmd,
    qual
FROM pg_policies 
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- 7. Check permissions for anon role
SELECT 'Checking anon permissions...' as test;
SELECT 
    grantee,
    table_name,
    privilege_type
FROM information_schema.table_privileges 
WHERE table_schema = 'public'
AND grantee = 'anon'
ORDER BY table_name, privilege_type;

-- =====================================================
-- NOTES:
-- =====================================================
-- 
-- 1. Run this script in Supabase SQL Editor
-- 2. Check if all tests pass
-- 3. If any test fails, there's a CORS/permission issue
-- 4. The authenticate_farcaster_user test should work for anon users
--
-- =====================================================
