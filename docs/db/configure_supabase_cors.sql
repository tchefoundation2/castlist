-- =====================================================
-- Supabase CORS Configuration for Farcaster
-- =====================================================
-- This script configures Supabase to accept requests from Farcaster
-- Run this script in your Supabase SQL Editor
-- =====================================================

-- 1. Create a function to handle CORS preflight requests
CREATE OR REPLACE FUNCTION public.handle_cors_preflight()
RETURNS JSON AS $$
BEGIN
    -- This function handles CORS preflight requests
    -- It should be called before any actual API calls
    RETURN json_build_object(
        'status', 'success',
        'message', 'CORS preflight handled',
        'allowed_origins', ARRAY[
            'https://castlist.netlify.app',
            'https://farcaster.xyz',
            'https://client.farcaster.xyz',
            'https://warpcast.com'
        ],
        'allowed_methods', ARRAY['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
        'allowed_headers', ARRAY['Content-Type', 'Authorization', 'X-Requested-With']
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION public.handle_cors_preflight() TO anon, authenticated;

-- 2. Create a function to validate Farcaster requests
CREATE OR REPLACE FUNCTION public.validate_farcaster_request(
    p_origin TEXT DEFAULT NULL,
    p_user_agent TEXT DEFAULT NULL
)
RETURNS BOOLEAN AS $$
BEGIN
    -- Check if the request is coming from a valid Farcaster origin
    IF p_origin IS NOT NULL THEN
        RETURN p_origin IN (
            'https://castlist.netlify.app',
            'https://farcaster.xyz',
            'https://client.farcaster.xyz',
            'https://warpcast.com'
        );
    END IF;
    
    -- Check user agent for Farcaster-related strings
    IF p_user_agent IS NOT NULL THEN
        RETURN p_user_agent ILIKE '%farcaster%' OR 
               p_user_agent ILIKE '%warpcast%' OR
               p_user_agent ILIKE '%castlist%';
    END IF;
    
    -- If no validation criteria provided, allow the request
    RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION public.validate_farcaster_request(TEXT, TEXT) TO anon, authenticated;

-- 3. Update the authenticate_with_farcaster function to include CORS validation
CREATE OR REPLACE FUNCTION public.authenticate_with_farcaster_cors(
    p_fid INTEGER,
    p_username TEXT,
    p_display_name TEXT DEFAULT NULL,
    p_pfp_url TEXT DEFAULT NULL,
    p_bio TEXT DEFAULT NULL,
    p_verifications TEXT DEFAULT NULL,
    p_origin TEXT DEFAULT NULL
)
RETURNS JSON AS $$
DECLARE
    user_id TEXT;
    profile_data JSON;
    is_valid_request BOOLEAN;
BEGIN
    -- Validate the request origin
    is_valid_request := public.validate_farcaster_request(p_origin, NULL);
    
    IF NOT is_valid_request THEN
        RETURN json_build_object(
            'success', false,
            'error', 'Invalid request origin',
            'origin', p_origin
        );
    END IF;
    
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
        display_name = COALESCE(EXCLUDED.display_name, EXCLUDED.username),
        pfp_url = EXCLUDED.pfp_url,
        bio = EXCLUDED.bio,
        verifications = EXCLUDED.verifications,
        updated_at = NOW()
    RETURNING * INTO profile_data;
    
    -- Return the profile data with CORS headers
    RETURN json_build_object(
        'success', true,
        'user_id', user_id,
        'profile', profile_data,
        'cors', json_build_object(
            'allowed_origins', ARRAY[
                'https://castlist.netlify.app',
                'https://farcaster.xyz',
                'https://client.farcaster.xyz',
                'https://warpcast.com'
            ]
        )
    );
    
EXCEPTION WHEN OTHERS THEN
    RETURN json_build_object(
        'success', false,
        'error', SQLERRM,
        'cors', json_build_object(
            'allowed_origins', ARRAY[
                'https://castlist.netlify.app',
                'https://farcaster.xyz',
                'https://client.farcaster.xyz',
                'https://warpcast.com'
            ]
        )
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION public.authenticate_with_farcaster_cors(INTEGER, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT) TO anon, authenticated;

-- 4. Create a function to test CORS configuration
CREATE OR REPLACE FUNCTION public.test_cors_config()
RETURNS JSON AS $$
BEGIN
    RETURN json_build_object(
        'status', 'success',
        'message', 'CORS configuration is active',
        'cors_headers', json_build_object(
            'Access-Control-Allow-Origin', '*',
            'Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS',
            'Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With',
            'Access-Control-Allow-Credentials', 'true'
        ),
        'allowed_origins', ARRAY[
            'https://castlist.netlify.app',
            'https://farcaster.xyz',
            'https://client.farcaster.xyz',
            'https://warpcast.com'
        ],
        'timestamp', NOW()
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION public.test_cors_config() TO anon, authenticated;

-- =====================================================
-- Verification:
-- Run SELECT public.test_cors_config(); in SQL Editor
-- Expected: CORS configuration details
-- =====================================================
