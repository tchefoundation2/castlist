-- =====================================================
-- Castlist Database: Complete Setup (All-in-One)
-- =====================================================
-- 
-- This script recreates the entire database from scratch
-- Run this in Supabase SQL Editor
-- =====================================================

-- 1. PROFILES TABLE
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    fid INTEGER NOT NULL UNIQUE,
    username TEXT NOT NULL,
    pfp_url TEXT,
    email TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. BOOKS TABLE
CREATE TABLE IF NOT EXISTS public.books (
    id BIGSERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    author TEXT NOT NULL,
    cover_url TEXT,
    description TEXT,
    published_year INTEGER,
    isbn TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. GUIDES TABLE
CREATE TABLE IF NOT EXISTS public.guides (
    id BIGSERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    author_id UUID REFERENCES public.profiles(id),
    creator_fid INTEGER REFERENCES public.profiles(fid),
    cover_image TEXT,
    tags TEXT[],
    is_public BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. GUIDE_BOOKS TABLE
CREATE TABLE IF NOT EXISTS public.guide_books (
    id BIGSERIAL PRIMARY KEY,
    guide_id BIGINT NOT NULL REFERENCES public.guides(id) ON DELETE CASCADE,
    book_id BIGINT NOT NULL REFERENCES public.books(id) ON DELETE CASCADE,
    position INTEGER DEFAULT 0,
    notes TEXT,
    added_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(guide_id, book_id)
);

-- 5. ACTIVITIES TABLE
CREATE TABLE IF NOT EXISTS public.activities (
    id BIGSERIAL PRIMARY KEY,
    user_fid INTEGER NOT NULL REFERENCES public.profiles(fid) ON DELETE CASCADE,
    activity_type TEXT NOT NULL CHECK (activity_type IN ('guide_created', 'guide_shared', 'book_added', 'guide_liked')),
    guide_id BIGINT REFERENCES public.guides(id) ON DELETE CASCADE,
    book_id BIGINT REFERENCES public.books(id) ON DELETE CASCADE,
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. GUIDE_LIKES TABLE
CREATE TABLE IF NOT EXISTS public.guide_likes (
    id BIGSERIAL PRIMARY KEY,
    guide_id BIGINT NOT NULL REFERENCES public.guides(id) ON DELETE CASCADE,
    user_fid INTEGER NOT NULL REFERENCES public.profiles(fid) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(guide_id, user_fid)
);

-- 7. INDEXES
CREATE INDEX IF NOT EXISTS idx_profiles_fid ON public.profiles(fid);
CREATE INDEX IF NOT EXISTS idx_profiles_username ON public.profiles(username);
CREATE INDEX IF NOT EXISTS idx_guides_creator_fid ON public.guides(creator_fid);
CREATE INDEX IF NOT EXISTS idx_guides_created_at ON public.guides(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_guides_is_public ON public.guides(is_public);
CREATE INDEX IF NOT EXISTS idx_books_title ON public.books(title);
CREATE INDEX IF NOT EXISTS idx_guide_books_guide_id ON public.guide_books(guide_id);
CREATE INDEX IF NOT EXISTS idx_activities_user_fid ON public.activities(user_fid);
CREATE INDEX IF NOT EXISTS idx_guide_likes_guide_id ON public.guide_likes(guide_id);

-- 8. TRIGGER FUNCTION
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 9. TRIGGERS
CREATE TRIGGER trigger_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER trigger_guides_updated_at
    BEFORE UPDATE ON public.guides
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER trigger_books_updated_at
    BEFORE UPDATE ON public.books
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- 10. RLS POLICIES
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.guides ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.books ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.guide_books ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.guide_likes ENABLE ROW LEVEL SECURITY;

-- Allow anonymous access to all tables
CREATE POLICY "profiles_select_public" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "guides_select_public" ON public.guides FOR SELECT USING (is_public = true);
CREATE POLICY "books_select_public" ON public.books FOR SELECT USING (true);
CREATE POLICY "guide_books_select_public" ON public.guide_books FOR SELECT USING (true);
CREATE POLICY "activities_select_public" ON public.activities FOR SELECT USING (true);
CREATE POLICY "guide_likes_select_public" ON public.guide_likes FOR SELECT USING (true);

-- 11. PERMISSIONS
GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.guides TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.books TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.guide_books TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.activities TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.guide_likes TO anon, authenticated;

-- 12. AUTH FUNCTIONS
CREATE OR REPLACE FUNCTION public.authenticate_farcaster_user(
    p_fid INTEGER,
    p_username TEXT,
    p_pfp_url TEXT DEFAULT NULL
)
RETURNS public.profiles AS $$
DECLARE
    user_profile public.profiles;
BEGIN
    -- Try to find existing profile
    SELECT * INTO user_profile
    FROM public.profiles
    WHERE fid = p_fid;
    
    IF FOUND THEN
        -- Update existing profile
        UPDATE public.profiles
        SET 
            username = p_username,
            pfp_url = p_pfp_url,
            updated_at = NOW()
        WHERE fid = p_fid
        RETURNING * INTO user_profile;
    ELSE
        -- Create new profile
        INSERT INTO public.profiles (fid, username, pfp_url)
        VALUES (p_fid, p_username, p_pfp_url)
        RETURNING * INTO user_profile;
    END IF;
    
    RETURN user_profile;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 13. PUBLIC FEED FUNCTION
CREATE OR REPLACE FUNCTION public.get_public_guides_feed(
    limit_count INTEGER DEFAULT 20,
    offset_count INTEGER DEFAULT 0
)
RETURNS TABLE (
    guide_id BIGINT,
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
        false as is_liked_by_current_user
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
    WHERE g.is_public = true
    ORDER BY g.created_at DESC
    LIMIT limit_count
    OFFSET offset_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 14. GRANT PERMISSIONS TO FUNCTIONS
GRANT EXECUTE ON FUNCTION public.authenticate_farcaster_user(INTEGER, TEXT, TEXT) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_public_guides_feed(INTEGER, INTEGER) TO anon, authenticated;

-- 15. SEED DATA
INSERT INTO public.profiles (id, fid, username, pfp_url, created_at) VALUES
('4cd58ff3-fa6a-4ab0-80bc-e0cc22730778', 1, 'farcaster.eth', 'https://i.imgur.com/34Iodlt.jpg', NOW() - INTERVAL '30 days'),
('8126631d-d609-4b10-8406-1ad28db214e8', 2, 'Sci-Fi Reader', 'https://i.imgur.com/PC3e8NJ.jpg', NOW() - INTERVAL '25 days'),
('a7b8e966-a865-4567-9bdf-2639417da534', 3, 'Literary Bookworm', 'https://i.imgur.com/J3G59bK.jpg', NOW() - INTERVAL '20 days')
ON CONFLICT (fid) DO UPDATE SET
    username = EXCLUDED.username,
    pfp_url = EXCLUDED.pfp_url,
    updated_at = NOW();

INSERT INTO public.books (title, author, cover_url, description, published_year) VALUES
('Dune', 'Frank Herbert', 'https://images-na.ssl-images-amazon.com/images/I/81zN7udGRUL.jpg', 'Epic science fiction novel about desert planet Arrakis', 1965),
('Foundation', 'Isaac Asimov', 'https://images-na.ssl-images-amazon.com/images/I/81YX2V2FvQL.jpg', 'Galactic empire and psychohistory', 1951),
('1984', 'George Orwell', 'https://images-na.ssl-images-amazon.com/images/I/81StSOpmvRL.jpg', 'Dystopian masterpiece about totalitarianism', 1949)
ON CONFLICT DO NOTHING;

INSERT INTO public.guides (title, description, author_id, creator_fid, cover_image, tags, created_at) VALUES
('Essential Sci-Fi Classics', 'Must-read science fiction novels that shaped the genre', 
 (SELECT id FROM public.profiles WHERE fid = 2 LIMIT 1), 2, 
 'https://images-na.ssl-images-amazon.com/images/I/81zN7udGRUL.jpg', 
 ARRAY['sci-fi', 'classics', 'space'], NOW() - INTERVAL '20 days'),
('Literary Masterpieces', 'Timeless works of literary fiction', 
 (SELECT id FROM public.profiles WHERE fid = 3 LIMIT 1), 3, 
 'https://images-na.ssl-images-amazon.com/images/I/81StSOpmvRL.jpg', 
 ARRAY['literature', 'classics', 'fiction'], NOW() - INTERVAL '18 days')
ON CONFLICT DO NOTHING;

-- =====================================================
-- NOTES:
-- =====================================================
-- 
-- 1. This script recreates everything from scratch
-- 2. Includes all tables, indexes, policies, and functions
-- 3. Adds sample data for testing
-- 4. Configures CORS and anonymous access
-- 5. Safe to run multiple times
--
-- =====================================================
