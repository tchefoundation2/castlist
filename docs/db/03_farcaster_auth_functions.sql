-- =====================================================
-- Castlist Database Schema: Farcaster Authentication Functions
-- =====================================================
-- 
-- This script creates helper functions for Farcaster authentication
-- and user session management.
--
-- Run this script AFTER the previous table creation scripts
-- =====================================================

-- 1. Function to set current user FID for RLS policies
CREATE OR REPLACE FUNCTION public.set_current_user_fid(user_fid INTEGER)
RETURNS VOID AS $$
BEGIN
    -- Set the current user FID for this session
    PERFORM set_config('app.current_user_fid', user_fid::text, false);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Function to get current user FID
CREATE OR REPLACE FUNCTION public.get_current_user_fid()
RETURNS INTEGER AS $$
BEGIN
    RETURN (current_setting('app.current_user_fid', true))::integer;
EXCEPTION
    WHEN OTHERS THEN
        RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Function to authenticate Farcaster user and create/update profile
CREATE OR REPLACE FUNCTION public.authenticate_farcaster_user(
    p_fid INTEGER,
    p_username TEXT,
    p_pfp_url TEXT DEFAULT NULL
)
RETURNS public.profiles AS $$
DECLARE
    user_profile public.profiles;
BEGIN
    -- Set the current user FID for this session
    PERFORM public.set_current_user_fid(p_fid);
    
    -- Try to find existing profile
    SELECT * INTO user_profile
    FROM public.profiles
    WHERE fid = p_fid;
    
    IF FOUND THEN
        -- Update existing profile if username or pfp changed
        IF user_profile.username != p_username OR 
           (user_profile.pfp_url IS DISTINCT FROM p_pfp_url) THEN
            
            UPDATE public.profiles
            SET 
                username = p_username,
                pfp_url = p_pfp_url,
                updated_at = NOW()
            WHERE fid = p_fid
            RETURNING * INTO user_profile;
        END IF;
    ELSE
        -- Create new profile
        INSERT INTO public.profiles (fid, username, pfp_url)
        VALUES (p_fid, p_username, p_pfp_url)
        RETURNING * INTO user_profile;
    END IF;
    
    RETURN user_profile;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Function to get user guides with stats
CREATE OR REPLACE FUNCTION public.get_user_guides_with_stats(user_fid INTEGER)
RETURNS TABLE (
    guide_id UUID,
    title TEXT,
    description TEXT,
    cover_image TEXT,
    tags TEXT[],
    created_at TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE,
    book_count BIGINT,
    like_count BIGINT,
    is_liked_by_current_user BOOLEAN
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        g.id as guide_id,
        g.title,
        g.description,
        g.cover_image,
        g.tags,
        g.created_at,
        g.updated_at,
        COALESCE(book_stats.book_count, 0) as book_count,
        COALESCE(like_stats.like_count, 0) as like_count,
        CASE 
            WHEN current_user_likes.guide_id IS NOT NULL THEN true 
            ELSE false 
        END as is_liked_by_current_user
    FROM public.guides g
    LEFT JOIN (
        SELECT guide_id, COUNT(*) as book_count
        FROM public.guide_books
        GROUP BY guide_id
    ) book_stats ON g.id = book_stats.guide_id
    LEFT JOIN (
        SELECT guide_id, COUNT(*) as like_count
        FROM public.guide_likes
        GROUP BY guide_id
    ) like_stats ON g.id = like_stats.guide_id
    LEFT JOIN (
        SELECT guide_id
        FROM public.guide_likes
        WHERE user_fid = (current_setting('app.current_user_fid', true))::integer
    ) current_user_likes ON g.id = current_user_likes.guide_id
    WHERE g.creator_fid = user_fid
    ORDER BY g.updated_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. Function to get public guides feed
CREATE OR REPLACE FUNCTION public.get_public_guides_feed(
    limit_count INTEGER DEFAULT 20,
    offset_count INTEGER DEFAULT 0
)
RETURNS TABLE (
    guide_id UUID,
    title TEXT,
    description TEXT,
    cover_image TEXT,
    tags TEXT[],
    creator_fid INTEGER,
    creator_username TEXT,
    creator_pfp_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE,
    book_count BIGINT,
    like_count BIGINT,
    is_liked_by_current_user BOOLEAN
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        g.id as guide_id,
        g.title,
        g.description,
        g.cover_image,
        g.tags,
        g.creator_fid,
        p.username as creator_username,
        p.pfp_url as creator_pfp_url,
        g.created_at,
        g.updated_at,
        COALESCE(book_stats.book_count, 0) as book_count,
        COALESCE(like_stats.like_count, 0) as like_count,
        CASE 
            WHEN current_user_likes.guide_id IS NOT NULL THEN true 
            ELSE false 
        END as is_liked_by_current_user
    FROM public.guides g
    JOIN public.profiles p ON g.creator_fid = p.fid
    LEFT JOIN (
        SELECT guide_id, COUNT(*) as book_count
        FROM public.guide_books
        GROUP BY guide_id
    ) book_stats ON g.id = book_stats.guide_id
    LEFT JOIN (
        SELECT guide_id, COUNT(*) as like_count
        FROM public.guide_likes
        GROUP BY guide_id
    ) like_stats ON g.id = like_stats.guide_id
    LEFT JOIN (
        SELECT guide_id
        FROM public.guide_likes
        WHERE user_fid = (current_setting('app.current_user_fid', true))::integer
    ) current_user_likes ON g.id = current_user_likes.guide_id
    WHERE g.is_public = true
    ORDER BY g.created_at DESC
    LIMIT limit_count
    OFFSET offset_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. Function to toggle guide like
CREATE OR REPLACE FUNCTION public.toggle_guide_like(guide_id UUID)
RETURNS TABLE (
    liked BOOLEAN,
    new_like_count BIGINT
) AS $$
DECLARE
    current_user_fid INTEGER;
    existing_like_id UUID;
    final_like_count BIGINT;
    is_liked BOOLEAN;
BEGIN
    -- Get current user FID
    current_user_fid := (current_setting('app.current_user_fid', true))::integer;
    
    IF current_user_fid IS NULL THEN
        RAISE EXCEPTION 'User not authenticated';
    END IF;
    
    -- Check if like already exists
    SELECT id INTO existing_like_id
    FROM public.guide_likes
    WHERE guide_likes.guide_id = toggle_guide_like.guide_id 
    AND user_fid = current_user_fid;
    
    IF existing_like_id IS NOT NULL THEN
        -- Unlike: Remove the like
        DELETE FROM public.guide_likes WHERE id = existing_like_id;
        is_liked := false;
    ELSE
        -- Like: Add the like
        INSERT INTO public.guide_likes (guide_id, user_fid)
        VALUES (toggle_guide_like.guide_id, current_user_fid);
        is_liked := true;
    END IF;
    
    -- Get updated like count
    SELECT COUNT(*) INTO final_like_count
    FROM public.guide_likes
    WHERE guide_likes.guide_id = toggle_guide_like.guide_id;
    
    RETURN QUERY SELECT is_liked, final_like_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 7. Function to create activity log entry
CREATE OR REPLACE FUNCTION public.log_activity(
    activity_type TEXT,
    guide_id UUID DEFAULT NULL,
    book_id UUID DEFAULT NULL,
    metadata JSONB DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
    current_user_fid INTEGER;
    activity_id UUID;
BEGIN
    -- Get current user FID
    current_user_fid := (current_setting('app.current_user_fid', true))::integer;
    
    IF current_user_fid IS NULL THEN
        RAISE EXCEPTION 'User not authenticated';
    END IF;
    
    -- Insert activity
    INSERT INTO public.activities (user_fid, activity_type, guide_id, book_id, metadata)
    VALUES (current_user_fid, activity_type, guide_id, book_id, metadata)
    RETURNING id INTO activity_id;
    
    RETURN activity_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 8. Function to get recent activities feed
CREATE OR REPLACE FUNCTION public.get_activities_feed(
    limit_count INTEGER DEFAULT 50,
    offset_count INTEGER DEFAULT 0
)
RETURNS TABLE (
    activity_id UUID,
    user_fid INTEGER,
    username TEXT,
    pfp_url TEXT,
    activity_type TEXT,
    guide_id UUID,
    guide_title TEXT,
    book_id UUID,
    book_title TEXT,
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        a.id as activity_id,
        a.user_fid,
        p.username,
        p.pfp_url,
        a.activity_type,
        a.guide_id,
        g.title as guide_title,
        a.book_id,
        b.title as book_title,
        a.metadata,
        a.created_at
    FROM public.activities a
    JOIN public.profiles p ON a.user_fid = p.fid
    LEFT JOIN public.guides g ON a.guide_id = g.id
    LEFT JOIN public.books b ON a.book_id = b.id
    ORDER BY a.created_at DESC
    LIMIT limit_count
    OFFSET offset_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 9. Grant permissions to functions
GRANT EXECUTE ON FUNCTION public.set_current_user_fid(INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_current_user_fid() TO authenticated;
GRANT EXECUTE ON FUNCTION public.authenticate_farcaster_user(INTEGER, TEXT, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_user_guides_with_stats(INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_public_guides_feed(INTEGER, INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION public.toggle_guide_like(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.log_activity(TEXT, UUID, UUID, JSONB) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_activities_feed(INTEGER, INTEGER) TO authenticated;

-- Allow anonymous users to view public functions
GRANT EXECUTE ON FUNCTION public.get_public_guides_feed(INTEGER, INTEGER) TO anon;
GRANT EXECUTE ON FUNCTION public.get_activities_feed(INTEGER, INTEGER) TO anon;

-- =====================================================
-- NOTES:
-- =====================================================
-- 
-- 1. These functions provide a clean API for Farcaster authentication
-- 2. The set_current_user_fid function should be called after verifying
--    the Farcaster signature in your application
-- 3. All functions are security definer to ensure proper RLS context
-- 4. Consider adding more helper functions as your app grows
-- 5. Remember to handle errors properly in your application code
--
-- =====================================================
