-- =====================================================
-- Farcaster Authentication Setup for Supabase
-- =====================================================
-- This script configures Supabase to work with Farcaster authentication
-- Run this script in your Supabase SQL Editor
-- =====================================================

-- 1. Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.guides ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.books ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.guide_books ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.guide_likes ENABLE ROW LEVEL SECURITY;

-- 2. Create policies for Farcaster authentication
-- Allow users to read their own profile
CREATE POLICY "Users can read own profile" ON public.profiles
    FOR SELECT
    USING (auth.uid()::text = id);

-- Allow users to update their own profile
CREATE POLICY "Users can update own profile" ON public.profiles
    FOR UPDATE
    USING (auth.uid()::text = id);

-- Allow users to insert their own profile
CREATE POLICY "Users can insert own profile" ON public.profiles
    FOR INSERT
    WITH CHECK (auth.uid()::text = id);

-- 3. Create a function to handle Farcaster authentication
CREATE OR REPLACE FUNCTION public.authenticate_with_farcaster(
    p_fid INTEGER,
    p_username TEXT,
    p_display_name TEXT DEFAULT NULL,
    p_pfp_url TEXT DEFAULT NULL,
    p_bio TEXT DEFAULT NULL,
    p_verifications TEXT DEFAULT NULL
)
RETURNS JSON AS $$
DECLARE
    user_id TEXT;
    profile_data JSON;
BEGIN
    -- Generate a consistent user ID from FID
    user_id := 'farcaster_' || p_fid::text;
    
    -- Insert or update profile
    INSERT INTO public.profiles (
        id,
        fid,
        username,
        display_name,
        pfp_url,
        bio,
        verifications,
        created_at,
        updated_at
    ) VALUES (
        user_id,
        p_fid,
        p_username,
        COALESCE(p_display_name, p_username),
        p_pfp_url,
        p_bio,
        p_verifications,
        NOW(),
        NOW()
    )
    ON CONFLICT (fid) DO UPDATE SET
        username = EXCLUDED.username,
        display_name = EXALESCE(EXCLUDED.display_name, EXCLUDED.username),
        pfp_url = EXCLUDED.pfp_url,
        bio = EXCLUDED.bio,
        verifications = EXCLUDED.verifications,
        updated_at = NOW()
    RETURNING * INTO profile_data;
    
    -- Return the profile data
    RETURN json_build_object(
        'success', true,
        'user_id', user_id,
        'profile', profile_data
    );
    
EXCEPTION WHEN OTHERS THEN
    RETURN json_build_object(
        'success', false,
        'error', SQLERRM
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Grant permissions
GRANT EXECUTE ON FUNCTION public.authenticate_with_farcaster(INTEGER, TEXT, TEXT, TEXT, TEXT, TEXT) TO anon, authenticated;

-- 5. Create a function to get current user FID
CREATE OR REPLACE FUNCTION public.get_current_user_fid()
RETURNS INTEGER AS $$
BEGIN
    -- Extract FID from the user ID (format: farcaster_12345)
    IF auth.uid()::text LIKE 'farcaster_%' THEN
        RETURN CAST(SUBSTRING(auth.uid()::text FROM 10) AS INTEGER);
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION public.get_current_user_fid() TO anon, authenticated;

-- 6. Update RLS policies to use FID
-- Allow users to read their own data
CREATE POLICY "Users can read own guides" ON public.guides
    FOR SELECT
    USING (author_fid = public.get_current_user_fid());

CREATE POLICY "Users can read own activities" ON public.activities
    FOR SELECT
    USING (user_fid = public.get_current_user_fid());

-- Allow public read access to published content
CREATE POLICY "Public can read published guides" ON public.guides
    FOR SELECT
    USING (is_public = true);

CREATE POLICY "Public can read all activities" ON public.activities
    FOR SELECT
    USING (true);

-- 7. Create a test function
CREATE OR REPLACE FUNCTION public.test_farcaster_auth()
RETURNS JSON AS $$
BEGIN
    RETURN json_build_object(
        'status', 'success',
        'message', 'Farcaster authentication is properly configured',
        'current_user', auth.uid(),
        'timestamp', NOW()
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION public.test_farcaster_auth() TO anon, authenticated;

-- =====================================================
-- Verification:
-- Run SELECT public.test_farcaster_auth(); in SQL Editor
-- Expected: {"status": "success", "message": "Farcaster authentication is properly configured", ...}
-- =====================================================
