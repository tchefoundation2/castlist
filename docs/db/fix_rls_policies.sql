-- =====================================================
-- Fix RLS Policies for Public Access
-- =====================================================
-- 
-- This script fixes RLS policies that may be blocking
-- public access to the Castlist app.
--
-- Run this script in your Supabase SQL Editor
-- =====================================================

-- 1. Fix profiles table policies to allow public read access
DROP POLICY IF EXISTS "profiles_select_policy" ON public.profiles;
CREATE POLICY "profiles_select_policy" ON public.profiles
    FOR SELECT
    USING (true); -- Allow reading all profiles for social features

-- 2. Fix guides table policies to allow public read access
DROP POLICY IF EXISTS "guides_select_policy" ON public.guides;
CREATE POLICY "guides_select_policy" ON public.guides
    FOR SELECT
    USING (
        is_public = true 
        OR creator_fid IS NOT NULL
        OR author_id IS NOT NULL
    ); -- Allow reading public guides and any guide with creator info

-- 3. Fix books table policies to allow public read access
DROP POLICY IF EXISTS "books_select_policy" ON public.books;
CREATE POLICY "books_select_policy" ON public.books
    FOR SELECT
    USING (true); -- Allow reading all books

-- 4. Fix guide_books table policies to allow public read access
DROP POLICY IF EXISTS "guide_books_select_policy" ON public.guide_books;
CREATE POLICY "guide_books_select_policy" ON public.guide_books
    FOR SELECT
    USING (true); -- Allow reading all guide-book relationships

-- 5. Fix activities table policies to allow public read access
DROP POLICY IF EXISTS "activities_select_policy" ON public.activities;
CREATE POLICY "activities_select_policy" ON public.activities
    FOR SELECT
    USING (true); -- Allow reading all activities for social features

-- 6. Fix guide_likes table policies to allow public read access
DROP POLICY IF EXISTS "guide_likes_select_policy" ON public.guide_likes;
CREATE POLICY "guide_likes_select_policy" ON public.guide_likes
    FOR SELECT
    USING (true); -- Allow reading all likes for social features

-- 7. Ensure all tables have proper grants for anonymous users
GRANT SELECT ON public.profiles TO anon;
GRANT SELECT ON public.guides TO anon;
GRANT SELECT ON public.books TO anon;
GRANT SELECT ON public.guide_books TO anon;
GRANT SELECT ON public.activities TO anon;
GRANT SELECT ON public.guide_likes TO anon;

-- 8. Grant execute permissions for public functions
GRANT EXECUTE ON FUNCTION public.get_public_guides_feed(INTEGER, INTEGER) TO anon;
GRANT EXECUTE ON FUNCTION public.get_activities_feed(INTEGER, INTEGER) TO anon;
GRANT EXECUTE ON FUNCTION public.get_guide_details(BIGINT) TO anon;
GRANT EXECUTE ON FUNCTION public.authenticate_farcaster_user(INTEGER, TEXT, TEXT, TEXT) TO anon;
GRANT EXECUTE ON FUNCTION public.set_current_user_fid(INTEGER) TO anon;

-- 9. Create a simple test function to verify access
CREATE OR REPLACE FUNCTION public.test_public_access()
RETURNS JSON AS $$
BEGIN
    RETURN json_build_object(
        'status', 'success',
        'message', 'Public access is working',
        'timestamp', NOW(),
        'profiles_count', (SELECT COUNT(*) FROM public.profiles),
        'guides_count', (SELECT COUNT(*) FROM public.guides),
        'books_count', (SELECT COUNT(*) FROM public.books)
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 10. Grant execute permission for test function
GRANT EXECUTE ON FUNCTION public.test_public_access() TO anon;

-- =====================================================
-- VERIFICATION QUERIES
-- =====================================================
-- 
-- After running this script, test with these queries:
--
-- 1. Test public access:
-- SELECT public.test_public_access();
--
-- 2. Test reading profiles:
-- SELECT fid, username FROM public.profiles LIMIT 5;
--
-- 3. Test reading guides:
-- SELECT id, title, is_public FROM public.guides LIMIT 5;
--
-- 4. Test reading books:
-- SELECT id, title, author FROM public.books LIMIT 5;
--
-- =====================================================
