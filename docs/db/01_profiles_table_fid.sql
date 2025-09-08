-- =====================================================
-- Castlist Database Schema: Profiles Table with FID
-- =====================================================
-- 
-- This script creates and configures the profiles table to use 
-- Farcaster FID as the primary user identifier.
--
-- Run this script in your Supabase SQL Editor
-- =====================================================

-- 1. Create profiles table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    fid INTEGER NOT NULL UNIQUE, -- Farcaster ID (unique identifier)
    username TEXT NOT NULL,
    pfp_url TEXT,
    email TEXT, -- Optional, may be null for Farcaster-only users
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Create indexes for optimal query performance
CREATE INDEX IF NOT EXISTS idx_profiles_fid ON public.profiles(fid);
CREATE INDEX IF NOT EXISTS idx_profiles_username ON public.profiles(username);
CREATE INDEX IF NOT EXISTS idx_profiles_created_at ON public.profiles(created_at DESC);

-- 3. Add constraints and validations
ALTER TABLE public.profiles 
ADD CONSTRAINT check_fid_positive CHECK (fid > 0);

ALTER TABLE public.profiles 
ADD CONSTRAINT check_username_length CHECK (length(username) >= 1 AND length(username) <= 50);

-- 4. Create updated_at trigger function
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 5. Create trigger for automatic updated_at
DROP TRIGGER IF EXISTS trigger_profiles_updated_at ON public.profiles;
CREATE TRIGGER trigger_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- 6. Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 7. Create RLS policies for Farcaster authentication
-- Policy: Users can view all profiles (for social features)
DROP POLICY IF EXISTS "profiles_select_policy" ON public.profiles;
CREATE POLICY "profiles_select_policy" ON public.profiles
    FOR SELECT
    USING (true); -- Allow reading all profiles for social features

-- Policy: Users can only insert their own profile
DROP POLICY IF EXISTS "profiles_insert_policy" ON public.profiles;
CREATE POLICY "profiles_insert_policy" ON public.profiles
    FOR INSERT
    WITH CHECK (true); -- Allow any authenticated user to create a profile

-- Policy: Users can only update their own profile
DROP POLICY IF EXISTS "profiles_update_policy" ON public.profiles;
CREATE POLICY "profiles_update_policy" ON public.profiles
    FOR UPDATE
    USING (
        -- For now, allow updates based on the FID matching
        -- This will need to be enhanced when we implement proper Farcaster auth
        fid = (current_setting('app.current_user_fid', true))::integer
    );

-- Policy: Users can only delete their own profile
DROP POLICY IF EXISTS "profiles_delete_policy" ON public.profiles;
CREATE POLICY "profiles_delete_policy" ON public.profiles
    FOR DELETE
    USING (
        fid = (current_setting('app.current_user_fid', true))::integer
    );

-- 8. Grant necessary permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles TO authenticated;
GRANT SELECT ON public.profiles TO anon; -- Allow anonymous users to view profiles

-- =====================================================
-- NOTES:
-- =====================================================
-- 
-- 1. FID (Farcaster ID) is the primary identifier for users
-- 2. The RLS policies are basic and will need enhancement when
--    proper Farcaster signature verification is implemented
-- 3. The app.current_user_fid setting will need to be set by
--    your application code during authentication
-- 4. Consider adding more fields as needed (bio, location, etc.)
--
-- =====================================================
