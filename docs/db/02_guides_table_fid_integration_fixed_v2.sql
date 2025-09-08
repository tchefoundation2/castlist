-- =====================================================
-- Castlist Database Schema: Guides Table with FID Integration (FIXED v2)
-- =====================================================
-- 
-- This script creates the guides table and integrates it with
-- the FID-based user system. FIXED for existing table structure.
--
-- Run this script AFTER 01_profiles_table_fid.sql
-- =====================================================

-- 1. First, let's check what columns exist in guides table
-- and add the missing creator_fid column if needed
DO $$
BEGIN
    -- Check if creator_fid column exists, if not add it
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'guides' 
        AND column_name = 'creator_fid'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE public.guides ADD COLUMN creator_fid INTEGER;
    END IF;
END $$;

-- 2. Add foreign key constraint if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'guides_creator_fid_fkey'
        AND table_name = 'guides'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE public.guides 
        ADD CONSTRAINT guides_creator_fid_fkey 
        FOREIGN KEY (creator_fid) REFERENCES public.profiles(fid) ON DELETE CASCADE;
    END IF;
END $$;

-- 3. Add other missing columns if they don't exist
DO $$
BEGIN
    -- Add is_public column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'guides' 
        AND column_name = 'is_public'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE public.guides ADD COLUMN is_public BOOLEAN DEFAULT true;
    END IF;

    -- Add cover_image column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'guides' 
        AND column_name = 'cover_image'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE public.guides ADD COLUMN cover_image TEXT;
    END IF;

    -- Add tags column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'guides' 
        AND column_name = 'tags'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE public.guides ADD COLUMN tags TEXT[];
    END IF;

    -- Add created_at column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'guides' 
        AND column_name = 'created_at'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE public.guides ADD COLUMN created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
    END IF;

    -- Add updated_at column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'guides' 
        AND column_name = 'updated_at'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE public.guides ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
    END IF;
END $$;

-- 4. Create books table (using BIGINT for compatibility)
CREATE TABLE IF NOT EXISTS public.books (
    id BIGSERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    author TEXT NOT NULL,
    isbn TEXT, -- Optional ISBN
    cover_url TEXT, -- Book cover image URL
    description TEXT,
    published_year INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Create guide_books junction table (using BIGINT)
CREATE TABLE IF NOT EXISTS public.guide_books (
    id BIGSERIAL PRIMARY KEY,
    guide_id BIGINT NOT NULL REFERENCES public.guides(id) ON DELETE CASCADE,
    book_id BIGINT NOT NULL REFERENCES public.books(id) ON DELETE CASCADE,
    position INTEGER DEFAULT 0, -- Order of book in the guide
    notes TEXT, -- Personal notes about this book in this guide
    added_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Ensure unique combination of guide and book
    UNIQUE(guide_id, book_id)
);

-- 6. Create activities table for social features (using BIGINT)
CREATE TABLE IF NOT EXISTS public.activities (
    id BIGSERIAL PRIMARY KEY,
    user_fid INTEGER NOT NULL REFERENCES public.profiles(fid) ON DELETE CASCADE,
    activity_type TEXT NOT NULL CHECK (activity_type IN ('guide_created', 'guide_shared', 'book_added', 'guide_liked')),
    guide_id BIGINT REFERENCES public.guides(id) ON DELETE CASCADE,
    book_id BIGINT REFERENCES public.books(id) ON DELETE CASCADE,
    metadata JSONB, -- Additional activity data
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. Create guide_likes table for social interactions (using BIGINT)
CREATE TABLE IF NOT EXISTS public.guide_likes (
    id BIGSERIAL PRIMARY KEY,
    guide_id BIGINT NOT NULL REFERENCES public.guides(id) ON DELETE CASCADE,
    user_fid INTEGER NOT NULL REFERENCES public.profiles(fid) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Ensure a user can only like a guide once
    UNIQUE(guide_id, user_fid)
);

-- 8. Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_guides_creator_fid ON public.guides(creator_fid);
CREATE INDEX IF NOT EXISTS idx_guides_created_at ON public.guides(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_guides_is_public ON public.guides(is_public);
CREATE INDEX IF NOT EXISTS idx_guides_tags ON public.guides USING GIN(tags);

CREATE INDEX IF NOT EXISTS idx_books_title ON public.books(title);
CREATE INDEX IF NOT EXISTS idx_books_author ON public.books(author);
CREATE INDEX IF NOT EXISTS idx_books_isbn ON public.books(isbn);

CREATE INDEX IF NOT EXISTS idx_guide_books_guide_id ON public.guide_books(guide_id);
CREATE INDEX IF NOT EXISTS idx_guide_books_book_id ON public.guide_books(book_id);
CREATE INDEX IF NOT EXISTS idx_guide_books_position ON public.guide_books(guide_id, position);

CREATE INDEX IF NOT EXISTS idx_activities_user_fid ON public.activities(user_fid);
CREATE INDEX IF NOT EXISTS idx_activities_created_at ON public.activities(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_activities_type ON public.activities(activity_type);

CREATE INDEX IF NOT EXISTS idx_guide_likes_guide_id ON public.guide_likes(guide_id);
CREATE INDEX IF NOT EXISTS idx_guide_likes_user_fid ON public.guide_likes(user_fid);

-- 9. Add updated_at triggers
CREATE TRIGGER trigger_guides_updated_at
    BEFORE UPDATE ON public.guides
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER trigger_books_updated_at
    BEFORE UPDATE ON public.books
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- 10. Enable Row Level Security
ALTER TABLE public.guides ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.books ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.guide_books ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.guide_likes ENABLE ROW LEVEL SECURITY;

-- 11. RLS Policies for guides
-- Anyone can view public guides
DROP POLICY IF EXISTS "guides_select_policy" ON public.guides;
CREATE POLICY "guides_select_policy" ON public.guides
    FOR SELECT
    USING (
        is_public = true 
        OR creator_fid = (current_setting('app.current_user_fid', true))::integer
    );

-- Users can create their own guides
DROP POLICY IF EXISTS "guides_insert_policy" ON public.guides;
CREATE POLICY "guides_insert_policy" ON public.guides
    FOR INSERT
    WITH CHECK (
        creator_fid = (current_setting('app.current_user_fid', true))::integer
    );

-- Users can update their own guides
DROP POLICY IF EXISTS "guides_update_policy" ON public.guides;
CREATE POLICY "guides_update_policy" ON public.guides
    FOR UPDATE
    USING (
        creator_fid = (current_setting('app.current_user_fid', true))::integer
    );

-- Users can delete their own guides
DROP POLICY IF EXISTS "guides_delete_policy" ON public.guides;
CREATE POLICY "guides_delete_policy" ON public.guides
    FOR DELETE
    USING (
        creator_fid = (current_setting('app.current_user_fid', true))::integer
    );

-- 12. RLS Policies for books (public read, authenticated write)
DROP POLICY IF EXISTS "books_select_policy" ON public.books;
CREATE POLICY "books_select_policy" ON public.books
    FOR SELECT
    USING (true); -- Anyone can view books

DROP POLICY IF EXISTS "books_insert_policy" ON public.books;
CREATE POLICY "books_insert_policy" ON public.books
    FOR INSERT
    WITH CHECK (true); -- Any authenticated user can add books

-- 13. RLS Policies for guide_books
DROP POLICY IF EXISTS "guide_books_select_policy" ON public.guide_books;
CREATE POLICY "guide_books_select_policy" ON public.guide_books
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.guides 
            WHERE guides.id = guide_books.guide_id 
            AND (guides.is_public = true OR guides.creator_fid = (current_setting('app.current_user_fid', true))::integer)
        )
    );

DROP POLICY IF EXISTS "guide_books_insert_policy" ON public.guide_books;
CREATE POLICY "guide_books_insert_policy" ON public.guide_books
    FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.guides 
            WHERE guides.id = guide_books.guide_id 
            AND guides.creator_fid = (current_setting('app.current_user_fid', true))::integer
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
        )
    );

-- 14. RLS Policies for activities (public read, own write)
DROP POLICY IF EXISTS "activities_select_policy" ON public.activities;
CREATE POLICY "activities_select_policy" ON public.activities
    FOR SELECT
    USING (true); -- Anyone can view activities for social feed

DROP POLICY IF EXISTS "activities_insert_policy" ON public.activities;
CREATE POLICY "activities_insert_policy" ON public.activities
    FOR INSERT
    WITH CHECK (
        user_fid = (current_setting('app.current_user_fid', true))::integer
    );

-- 15. RLS Policies for guide_likes
DROP POLICY IF EXISTS "guide_likes_select_policy" ON public.guide_likes;
CREATE POLICY "guide_likes_select_policy" ON public.guide_likes
    FOR SELECT
    USING (true); -- Anyone can view likes

DROP POLICY IF EXISTS "guide_likes_insert_policy" ON public.guide_likes;
CREATE POLICY "guide_likes_insert_policy" ON public.guide_likes
    FOR INSERT
    WITH CHECK (
        user_fid = (current_setting('app.current_user_fid', true))::integer
    );

DROP POLICY IF EXISTS "guide_likes_delete_policy" ON public.guide_likes;
CREATE POLICY "guide_likes_delete_policy" ON public.guide_likes
    FOR DELETE
    USING (
        user_fid = (current_setting('app.current_user_fid', true))::integer
    );

-- 16. Grant permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON public.guides TO authenticated;
GRANT SELECT ON public.guides TO anon;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.books TO authenticated;
GRANT SELECT ON public.books TO anon;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.guide_books TO authenticated;
GRANT SELECT ON public.guide_books TO anon;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.activities TO authenticated;
GRANT SELECT ON public.activities TO anon;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.guide_likes TO authenticated;
GRANT SELECT ON public.guide_likes TO anon;

-- Grant permissions on sequences (for BIGSERIAL)
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- =====================================================
-- NOTES:
-- =====================================================
-- 
-- 1. FIXED v2: Checks existing table structure and adds missing columns
-- 2. All tables are integrated with the FID-based user system
-- 3. RLS policies ensure data security and proper access control
-- 4. The social features (likes, activities) are ready for implementation
-- 5. Remember to set app.current_user_fid in your application code
--
-- =====================================================
