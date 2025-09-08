-- =====================================================
-- Castlist Database Schema: Farcaster Auth Integration
-- =====================================================
-- 
-- This script integrates Farcaster authentication with Supabase
-- using a custom approach that bypasses Supabase Auth.
--
-- Run this script AFTER all previous scripts
-- =====================================================

-- 1. Create a custom auth function that works with Farcaster
CREATE OR REPLACE FUNCTION public.authenticate_with_farcaster(
    p_fid INTEGER,
    p_username TEXT,
    p_pfp_url TEXT DEFAULT NULL,
    p_signature TEXT DEFAULT NULL,
    p_message TEXT DEFAULT NULL,
    p_nonce TEXT DEFAULT NULL
)
RETURNS TABLE (
    user_profile public.profiles,
    session_token TEXT
) AS $$
DECLARE
    user_profile public.profiles;
    session_token TEXT;
    session_expires_at TIMESTAMP WITH TIME ZONE;
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
    
    -- Generate a session token (simple approach)
    session_token := encode(gen_random_bytes(32), 'base64');
    session_expires_at := NOW() + INTERVAL '7 days';
    
    -- Store session in a simple way (you could use a sessions table)
    -- For now, we'll use the app.current_user_fid setting
    PERFORM set_config('app.current_user_session', session_token, false);
    PERFORM set_config('app.session_expires_at', session_expires_at::text, false);
    
    RETURN QUERY SELECT user_profile, session_token;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Create a function to validate Farcaster session
CREATE OR REPLACE FUNCTION public.validate_farcaster_session(session_token TEXT)
RETURNS TABLE (
    is_valid BOOLEAN,
    user_profile public.profiles
) AS $$
DECLARE
    current_token TEXT;
    expires_at TIMESTAMP WITH TIME ZONE;
    user_profile public.profiles;
BEGIN
    -- Get current session info
    current_token := current_setting('app.current_user_session', true);
    expires_at := (current_setting('app.session_expires_at', true))::TIMESTAMP WITH TIME ZONE;
    
    -- Check if session is valid
    IF current_token = session_token AND expires_at > NOW() THEN
        -- Get user profile
        SELECT * INTO user_profile
        FROM public.profiles
        WHERE fid = (current_setting('app.current_user_fid', true))::integer;
        
        IF FOUND THEN
            RETURN QUERY SELECT true, user_profile;
        ELSE
            RETURN QUERY SELECT false, NULL::public.profiles;
        END IF;
    ELSE
        RETURN QUERY SELECT false, NULL::public.profiles;
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Create a function to logout (clear session)
CREATE OR REPLACE FUNCTION public.logout_farcaster()
RETURNS BOOLEAN AS $$
BEGIN
    -- Clear session settings
    PERFORM set_config('app.current_user_fid', NULL, false);
    PERFORM set_config('app.current_user_session', NULL, false);
    PERFORM set_config('app.session_expires_at', NULL, false);
    
    RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Update RLS policies to work with Farcaster sessions
-- First, let's create a helper function to check if user is authenticated
CREATE OR REPLACE FUNCTION public.is_farcaster_authenticated()
RETURNS BOOLEAN AS $$
DECLARE
    current_fid INTEGER;
    session_token TEXT;
    expires_at TIMESTAMP WITH TIME ZONE;
BEGIN
    -- Get current session info
    current_fid := (current_setting('app.current_user_fid', true))::integer;
    session_token := current_setting('app.current_user_session', true);
    expires_at := (current_setting('app.session_expires_at', true))::TIMESTAMP WITH TIME ZONE;
    
    -- Check if session is valid
    RETURN current_fid IS NOT NULL 
           AND session_token IS NOT NULL 
           AND expires_at > NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. Update profiles policies to work with Farcaster auth
DROP POLICY IF EXISTS "profiles_update_policy" ON public.profiles;
CREATE POLICY "profiles_update_policy" ON public.profiles
    FOR UPDATE
    USING (
        fid = (current_setting('app.current_user_fid', true))::integer
        AND public.is_farcaster_authenticated()
    );

DROP POLICY IF EXISTS "profiles_delete_policy" ON public.profiles;
CREATE POLICY "profiles_delete_policy" ON public.profiles
    FOR DELETE
    USING (
        fid = (current_setting('app.current_user_fid', true))::integer
        AND public.is_farcaster_authenticated()
    );

-- 6. Update guides policies to work with Farcaster auth
DROP POLICY IF EXISTS "guides_insert_policy" ON public.guides;
CREATE POLICY "guides_insert_policy" ON public.guides
    FOR INSERT
    WITH CHECK (
        creator_fid = (current_setting('app.current_user_fid', true))::integer
        AND public.is_farcaster_authenticated()
    );

DROP POLICY IF EXISTS "guides_update_policy" ON public.guides;
CREATE POLICY "guides_update_policy" ON public.guides
    FOR UPDATE
    USING (
        creator_fid = (current_setting('app.current_user_fid', true))::integer
        AND public.is_farcaster_authenticated()
    );

DROP POLICY IF EXISTS "guides_delete_policy" ON public.guides;
CREATE POLICY "guides_delete_policy" ON public.guides
    FOR DELETE
    USING (
        creator_fid = (current_setting('app.current_user_fid', true))::integer
        AND public.is_farcaster_authenticated()
    );

-- 7. Update other policies similarly
DROP POLICY IF EXISTS "guide_books_insert_policy" ON public.guide_books;
CREATE POLICY "guide_books_insert_policy" ON public.guide_books
    FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.guides 
            WHERE guides.id = guide_books.guide_id 
            AND guides.creator_fid = (current_setting('app.current_user_fid', true))::integer
            AND public.is_farcaster_authenticated()
        )
    );

DROP POLICY IF EXISTS "guide_books_update_policy" ON public.guide_books;
CREATE POLICY "guide_books_update_policy" ON public.guide_books
    FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM public.guides 
            WHERE guides.id = guide_books.guide_id 
            AND guides.creator_fid = (current_setting('app.current_user_fid', true))::integer
            AND public.is_farcaster_authenticated()
        )
    );

DROP POLICY IF EXISTS "guide_books_delete_policy" ON public.guide_books;
CREATE POLICY "guide_books_delete_policy" ON public.guide_books
    FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM public.guides 
            WHERE guides.id = guide_books.guide_id 
            AND guides.creator_fid = (current_setting('app.current_user_fid', true))::integer
            AND public.is_farcaster_authenticated()
        )
    );

-- 8. Update activities and likes policies
DROP POLICY IF EXISTS "activities_insert_policy" ON public.activities;
CREATE POLICY "activities_insert_policy" ON public.activities
    FOR INSERT
    WITH CHECK (
        user_fid = (current_setting('app.current_user_fid', true))::integer
        AND public.is_farcaster_authenticated()
    );

DROP POLICY IF EXISTS "guide_likes_insert_policy" ON public.guide_likes;
CREATE POLICY "guide_likes_insert_policy" ON public.guide_likes
    FOR INSERT
    WITH CHECK (
        user_fid = (current_setting('app.current_user_fid', true))::integer
        AND public.is_farcaster_authenticated()
    );

DROP POLICY IF EXISTS "guide_likes_delete_policy" ON public.guide_likes;
CREATE POLICY "guide_likes_delete_policy" ON public.guide_likes
    FOR DELETE
    USING (
        user_fid = (current_setting('app.current_user_fid', true))::integer
        AND public.is_farcaster_authenticated()
    );

-- 9. Grant permissions to new functions
GRANT EXECUTE ON FUNCTION public.authenticate_with_farcaster(INTEGER, TEXT, TEXT, TEXT, TEXT, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.validate_farcaster_session(TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.logout_farcaster() TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_farcaster_authenticated() TO authenticated;

-- Allow anonymous users to authenticate
GRANT EXECUTE ON FUNCTION public.authenticate_with_farcaster(INTEGER, TEXT, TEXT, TEXT, TEXT, TEXT) TO anon;

-- =====================================================
-- NOTES:
-- =====================================================
-- 
-- 1. This approach bypasses Supabase Auth completely
-- 2. Uses Farcaster FID as the primary identifier
-- 3. Implements a simple session system using PostgreSQL settings
-- 4. All RLS policies now check for valid Farcaster authentication
-- 5. The session token is stored in PostgreSQL settings (simple approach)
-- 6. For production, consider using a proper sessions table
--
-- =====================================================
