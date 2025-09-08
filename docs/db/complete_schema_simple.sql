-- =====================================================
-- Castlist Database Schema: SIMPLE VERSION
-- =====================================================
-- 
-- This is a simplified, clean database schema for Castlist
-- with Farcaster FID integration from scratch.
-- 
-- Run this script on a fresh Supabase database
-- =====================================================

-- 1. Create profiles table with FID as primary identifier
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    fid INTEGER NOT NULL UNIQUE,
    username TEXT NOT NULL,
    pfp_url TEXT,
    email TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT check_fid_positive CHECK (fid > 0),
    CONSTRAINT check_username_length CHECK (char_length(username) >= 1)
);

-- 2. Create books table
CREATE TABLE public.books (
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

-- 3. Create guides table with both author_id and creator_fid
CREATE TABLE public.guides (
    id BIGSERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    author_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    creator_fid INTEGER NOT NULL REFERENCES public.profiles(fid) ON DELETE CASCADE,
    cover_image TEXT,
    tags TEXT[],
    is_public BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Create guide_books junction table
CREATE TABLE public.guide_books (
    id BIGSERIAL PRIMARY KEY,
    guide_id BIGINT NOT NULL REFERENCES public.guides(id) ON DELETE CASCADE,
    book_id BIGINT NOT NULL REFERENCES public.books(id) ON DELETE CASCADE,
    position INTEGER DEFAULT 0,
    notes TEXT,
    added_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Ensure unique combination of guide and book
    UNIQUE(guide_id, book_id)
);

-- 5. Create activities table for social features
CREATE TABLE public.activities (
    id BIGSERIAL PRIMARY KEY,
    user_fid INTEGER NOT NULL REFERENCES public.profiles(fid) ON DELETE CASCADE,
    activity_type TEXT NOT NULL CHECK (activity_type IN ('guide_created', 'guide_shared', 'book_added', 'guide_liked')),
    guide_id BIGINT REFERENCES public.guides(id) ON DELETE CASCADE,
    book_id BIGINT REFERENCES public.books(id) ON DELETE CASCADE,
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Create guide_likes table for social interactions
CREATE TABLE public.guide_likes (
    id BIGSERIAL PRIMARY KEY,
    guide_id BIGINT NOT NULL REFERENCES public.guides(id) ON DELETE CASCADE,
    user_fid INTEGER NOT NULL REFERENCES public.profiles(fid) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Ensure a user can only like a guide once
    UNIQUE(guide_id, user_fid)
);

-- 7. Create indexes for performance
CREATE INDEX idx_profiles_fid ON public.profiles(fid);
CREATE INDEX idx_profiles_username ON public.profiles(username);

CREATE INDEX idx_books_title ON public.books(title);
CREATE INDEX idx_books_author ON public.books(author);
CREATE INDEX idx_books_isbn ON public.books(isbn);

CREATE INDEX idx_guides_author_id ON public.guides(author_id);
CREATE INDEX idx_guides_creator_fid ON public.guides(creator_fid);
CREATE INDEX idx_guides_created_at ON public.guides(created_at DESC);
CREATE INDEX idx_guides_is_public ON public.guides(is_public);
CREATE INDEX idx_guides_tags ON public.guides USING GIN(tags);

CREATE INDEX idx_guide_books_guide_id ON public.guide_books(guide_id);
CREATE INDEX idx_guide_books_book_id ON public.guide_books(book_id);
CREATE INDEX idx_guide_books_position ON public.guide_books(guide_id, position);

CREATE INDEX idx_activities_user_fid ON public.activities(user_fid);
CREATE INDEX idx_activities_created_at ON public.activities(created_at DESC);
CREATE INDEX idx_activities_type ON public.activities(activity_type);

CREATE INDEX idx_guide_likes_guide_id ON public.guide_likes(guide_id);
CREATE INDEX idx_guide_likes_user_fid ON public.guide_likes(user_fid);

-- 8. Create updated_at trigger function
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 9. Add updated_at triggers
CREATE TRIGGER trigger_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER trigger_books_updated_at
    BEFORE UPDATE ON public.books
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER trigger_guides_updated_at
    BEFORE UPDATE ON public.guides
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- 10. Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.books ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.guides ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.guide_books ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.guide_likes ENABLE ROW LEVEL SECURITY;

-- 11. RLS Policies for profiles
CREATE POLICY "profiles_select_policy" ON public.profiles
    FOR SELECT
    USING (true); -- Anyone can view profiles

CREATE POLICY "profiles_insert_policy" ON public.profiles
    FOR INSERT
    WITH CHECK (true); -- Anyone can create profiles

CREATE POLICY "profiles_update_policy" ON public.profiles
    FOR UPDATE
    USING (fid = (current_setting('app.current_user_fid', true))::integer);

-- 12. RLS Policies for books
CREATE POLICY "books_select_policy" ON public.books
    FOR SELECT
    USING (true); -- Anyone can view books

CREATE POLICY "books_insert_policy" ON public.books
    FOR INSERT
    WITH CHECK (true); -- Any authenticated user can add books

CREATE POLICY "books_update_policy" ON public.books
    FOR UPDATE
    USING (true); -- Any authenticated user can update books

CREATE POLICY "books_delete_policy" ON public.books
    FOR DELETE
    USING (true); -- Any authenticated user can delete books

-- 13. RLS Policies for guides
CREATE POLICY "guides_select_policy" ON public.guides
    FOR SELECT
    USING (
        is_public = true 
        OR creator_fid = (current_setting('app.current_user_fid', true))::integer
        OR author_id = (current_setting('app.current_user_id', true))::uuid
    );

CREATE POLICY "guides_insert_policy" ON public.guides
    FOR INSERT
    WITH CHECK (
        creator_fid = (current_setting('app.current_user_fid', true))::integer
        OR author_id = (current_setting('app.current_user_id', true))::uuid
    );

CREATE POLICY "guides_update_policy" ON public.guides
    FOR UPDATE
    USING (
        creator_fid = (current_setting('app.current_user_fid', true))::integer
        OR author_id = (current_setting('app.current_user_id', true))::uuid
    );

CREATE POLICY "guides_delete_policy" ON public.guides
    FOR DELETE
    USING (
        creator_fid = (current_setting('app.current_user_fid', true))::integer
        OR author_id = (current_setting('app.current_user_id', true))::uuid
    );

-- 14. RLS Policies for guide_books
CREATE POLICY "guide_books_select_policy" ON public.guide_books
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.guides 
            WHERE guides.id = guide_books.guide_id 
            AND (guides.is_public = true 
                OR guides.creator_fid = (current_setting('app.current_user_fid', true))::integer
                OR guides.author_id = (current_setting('app.current_user_id', true))::uuid)
        )
    );

CREATE POLICY "guide_books_insert_policy" ON public.guide_books
    FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.guides 
            WHERE guides.id = guide_books.guide_id 
            AND (guides.creator_fid = (current_setting('app.current_user_fid', true))::integer
                OR guides.author_id = (current_setting('app.current_user_id', true))::uuid)
        )
    );

CREATE POLICY "guide_books_update_policy" ON public.guide_books
    FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM public.guides 
            WHERE guides.id = guide_books.guide_id 
            AND (guides.creator_fid = (current_setting('app.current_user_fid', true))::integer
                OR guides.author_id = (current_setting('app.current_user_id', true))::uuid)
        )
    );

CREATE POLICY "guide_books_delete_policy" ON public.guide_books
    FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM public.guides 
            WHERE guides.id = guide_books.guide_id 
            AND (guides.creator_fid = (current_setting('app.current_user_fid', true))::integer
                OR guides.author_id = (current_setting('app.current_user_id', true))::uuid)
        )
    );

-- 15. RLS Policies for activities
CREATE POLICY "activities_select_policy" ON public.activities
    FOR SELECT
    USING (true); -- Anyone can view activities for social feed

CREATE POLICY "activities_insert_policy" ON public.activities
    FOR INSERT
    WITH CHECK (
        user_fid = (current_setting('app.current_user_fid', true))::integer
    );

-- 16. RLS Policies for guide_likes
CREATE POLICY "guide_likes_select_policy" ON public.guide_likes
    FOR SELECT
    USING (true); -- Anyone can view likes

CREATE POLICY "guide_likes_insert_policy" ON public.guide_likes
    FOR INSERT
    WITH CHECK (
        user_fid = (current_setting('app.current_user_fid', true))::integer
    );

CREATE POLICY "guide_likes_delete_policy" ON public.guide_likes
    FOR DELETE
    USING (
        user_fid = (current_setting('app.current_user_fid', true))::integer
    );

-- 17. Grant permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles TO authenticated;
GRANT SELECT ON public.profiles TO anon;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.books TO authenticated;
GRANT SELECT ON public.books TO anon;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.guides TO authenticated;
GRANT SELECT ON public.guides TO anon;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.guide_books TO authenticated;
GRANT SELECT ON public.guide_books TO anon;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.activities TO authenticated;
GRANT SELECT ON public.activities TO anon;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.guide_likes TO authenticated;
GRANT SELECT ON public.guide_likes TO anon;

-- Grant permissions on sequences
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- =====================================================
-- NOTES:
-- =====================================================
-- 
-- 1. SIMPLE: No complex triggers or constraints
-- 2. CLEAN: Complete schema from scratch
-- 3. FID integration: Uses FID as primary identifier
-- 4. Dual auth: Supports both UUID (author_id) and FID (creator_fid)
-- 5. RLS: Proper security policies for all tables
-- 6. Performance: Optimized indexes
-- 7. READY: Ready for frontend integration
--
-- =====================================================
