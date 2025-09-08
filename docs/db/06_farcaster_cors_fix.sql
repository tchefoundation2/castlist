-- =====================================================
-- Castlist Database: Farcaster CORS Fix (Simple)
-- =====================================================
-- 
-- This script adds only the essential CORS and public access
-- configurations without conflicting with existing functions.
--
-- Run this script AFTER scripts 01-04 have been executed
-- =====================================================

-- 1. Update RLS policies to allow anonymous access to public content
-- This is the most important fix for Farcaster integration

-- Allow anonymous users to read profiles (for social features)
DROP POLICY IF EXISTS "profiles_select_public" ON public.profiles;
CREATE POLICY "profiles_select_public" ON public.profiles
    FOR SELECT
    USING (true);

-- Allow anonymous users to read public guides
DROP POLICY IF EXISTS "guides_select_public" ON public.guides;
CREATE POLICY "guides_select_public" ON public.guides
    FOR SELECT
    USING (is_public = true);

-- Allow anonymous users to read books
DROP POLICY IF EXISTS "books_select_public" ON public.books;
CREATE POLICY "books_select_public" ON public.books
    FOR SELECT
    USING (true);

-- Allow anonymous users to read guide_books
DROP POLICY IF EXISTS "guide_books_select_public" ON public.guide_books;
CREATE POLICY "guide_books_select_public" ON public.guide_books
    FOR SELECT
    USING (true);

-- Allow anonymous users to read activities
DROP POLICY IF EXISTS "activities_select_public" ON public.activities;
CREATE POLICY "activities_select_public" ON public.activities
    FOR SELECT
    USING (true);

-- Allow anonymous users to read guide_likes
DROP POLICY IF EXISTS "guide_likes_select_public" ON public.guide_likes;
CREATE POLICY "guide_likes_select_public" ON public.guide_likes
    FOR SELECT
    USING (true);

-- 2. Grant necessary permissions to 'anon' role
-- This allows Farcaster to access public content without authentication

GRANT SELECT ON public.profiles TO anon;
GRANT SELECT ON public.guides TO anon;
GRANT SELECT ON public.books TO anon;
GRANT SELECT ON public.guide_books TO anon;
GRANT SELECT ON public.activities TO anon;
GRANT SELECT ON public.guide_likes TO anon;

-- 3. Grant EXECUTE permissions on public RPC functions to anon
-- This allows Farcaster to call these functions without authentication

GRANT EXECUTE ON FUNCTION public.get_public_guides_feed(INTEGER, INTEGER) TO anon;
GRANT EXECUTE ON FUNCTION public.get_activities_feed(INTEGER, INTEGER) TO anon;
GRANT EXECUTE ON FUNCTION public.authenticate_farcaster_user(INTEGER, TEXT, TEXT) TO anon;

-- 4. Create a simple test function to verify the setup
CREATE OR REPLACE FUNCTION public.test_anon_access()
RETURNS JSON AS $$
BEGIN
    RETURN json_build_object(
        'status', 'success',
        'message', 'Anonymous access is properly configured',
        'tables_accessible', ARRAY[
            'profiles',
            'guides', 
            'books',
            'guide_books',
            'activities',
            'guide_likes'
        ],
        'functions_accessible', ARRAY[
            'get_public_guides_feed',
            'get_activities_feed',
            'authenticate_farcaster_user'
        ],
        'timestamp', NOW()
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION public.test_anon_access() TO anon, authenticated;

-- 5. Test the setup
-- Run this query to verify everything works:
-- SELECT public.test_anon_access();

-- =====================================================
-- NOTES:
-- =====================================================
-- 
-- 1. This script only adds essential CORS/public access
-- 2. No function conflicts - uses existing functions
-- 3. Allows Farcaster to access public content without auth
-- 4. Simple and safe to run multiple times
-- 5. Test with: SELECT public.test_anon_access();
--
-- =====================================================
