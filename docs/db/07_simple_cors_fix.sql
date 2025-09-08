-- =====================================================
-- Castlist Database: Simple CORS Fix
-- =====================================================
-- 
-- This script adds only the missing permission for authenticate_farcaster_user
-- to work with anonymous users (Farcaster integration).
--
-- Run this script AFTER scripts 01-04 have been executed
-- =====================================================

-- 1. Grant EXECUTE permission on authenticate_farcaster_user to anon
-- This allows Farcaster to authenticate users without being logged in
GRANT EXECUTE ON FUNCTION public.authenticate_farcaster_user(INTEGER, TEXT, TEXT) TO anon;

-- 2. Verify the setup
-- Run this query to test:
-- SELECT public.authenticate_farcaster_user(12345, 'test_user', 'https://example.com/pfp.jpg');

-- =====================================================
-- NOTES:
-- =====================================================
-- 
-- 1. This script only adds the missing permission
-- 2. Safe to run multiple times
-- 3. Allows Farcaster to authenticate users
-- 4. Test with the query above
--
-- =====================================================
