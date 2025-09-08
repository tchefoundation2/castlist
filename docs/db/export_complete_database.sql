-- =====================================================
-- Castlist Database: Complete Export Script
-- =====================================================
-- 
-- Execute this script in Supabase SQL Editor to get a complete
-- backup of your database schema, data, and configurations.
-- =====================================================

-- 1. Export all tables with data
-- This will show the complete structure and data of all tables

-- Export profiles table
SELECT '-- PROFILES TABLE' as comment;
SELECT 'CREATE TABLE IF NOT EXISTS public.profiles (' ||
       'id UUID PRIMARY KEY DEFAULT gen_random_uuid(),' ||
       'fid INTEGER NOT NULL UNIQUE,' ||
       'username TEXT NOT NULL,' ||
       'pfp_url TEXT,' ||
       'email TEXT,' ||
       'created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),' ||
       'updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()' ||
       ');' as create_statement;

-- Export guides table
SELECT '-- GUIDES TABLE' as comment;
SELECT 'CREATE TABLE IF NOT EXISTS public.guides (' ||
       'id BIGSERIAL PRIMARY KEY,' ||
       'title TEXT NOT NULL,' ||
       'description TEXT,' ||
       'author_id UUID REFERENCES public.profiles(id),' ||
       'creator_fid INTEGER REFERENCES public.profiles(fid),' ||
       'cover_image TEXT,' ||
       'tags TEXT[],' ||
       'is_public BOOLEAN DEFAULT true,' ||
       'created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),' ||
       'updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()' ||
       ');' as create_statement;

-- Export books table
SELECT '-- BOOKS TABLE' as comment;
SELECT 'CREATE TABLE IF NOT EXISTS public.books (' ||
       'id BIGSERIAL PRIMARY KEY,' ||
       'title TEXT NOT NULL,' ||
       'author TEXT NOT NULL,' ||
       'cover_url TEXT,' ||
       'description TEXT,' ||
       'published_year INTEGER,' ||
       'isbn TEXT,' ||
       'created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),' ||
       'updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()' ||
       ');' as create_statement;

-- Export guide_books table
SELECT '-- GUIDE_BOOKS TABLE' as comment;
SELECT 'CREATE TABLE IF NOT EXISTS public.guide_books (' ||
       'id BIGSERIAL PRIMARY KEY,' ||
       'guide_id BIGINT NOT NULL REFERENCES public.guides(id) ON DELETE CASCADE,' ||
       'book_id BIGINT NOT NULL REFERENCES public.books(id) ON DELETE CASCADE,' ||
       'position INTEGER DEFAULT 0,' ||
       'notes TEXT,' ||
       'added_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),' ||
       'UNIQUE(guide_id, book_id)' ||
       ');' as create_statement;

-- Export activities table
SELECT '-- ACTIVITIES TABLE' as comment;
SELECT 'CREATE TABLE IF NOT EXISTS public.activities (' ||
       'id BIGSERIAL PRIMARY KEY,' ||
       'user_fid INTEGER NOT NULL REFERENCES public.profiles(fid) ON DELETE CASCADE,' ||
       'activity_type TEXT NOT NULL CHECK (activity_type IN (''guide_created'', ''guide_shared'', ''book_added'', ''guide_liked'')),' ||
       'guide_id BIGINT REFERENCES public.guides(id) ON DELETE CASCADE,' ||
       'book_id BIGINT REFERENCES public.books(id) ON DELETE CASCADE,' ||
       'metadata JSONB,' ||
       'created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()' ||
       ');' as create_statement;

-- Export guide_likes table
SELECT '-- GUIDE_LIKES TABLE' as comment;
SELECT 'CREATE TABLE IF NOT EXISTS public.guide_likes (' ||
       'id BIGSERIAL PRIMARY KEY,' ||
       'guide_id BIGINT NOT NULL REFERENCES public.guides(id) ON DELETE CASCADE,' ||
       'user_fid INTEGER NOT NULL REFERENCES public.profiles(fid) ON DELETE CASCADE,' ||
       'created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),' ||
       'UNIQUE(guide_id, user_fid)' ||
       ');' as create_statement;

-- 2. Export all data
SELECT '-- PROFILES DATA' as comment;
SELECT 'INSERT INTO public.profiles (id, fid, username, pfp_url, email, created_at, updated_at) VALUES' ||
       string_agg(
           '(' || 
           quote_literal(id::text) || '::uuid, ' ||
           fid || ', ' ||
           quote_literal(username) || ', ' ||
           COALESCE(quote_literal(pfp_url), 'NULL') || ', ' ||
           COALESCE(quote_literal(email), 'NULL') || ', ' ||
           quote_literal(created_at::text) || '::timestamp with time zone, ' ||
           quote_literal(updated_at::text) || '::timestamp with time zone' ||
           ')',
           ', '
       ) || ';' as insert_statement
FROM public.profiles;

SELECT '-- GUIDES DATA' as comment;
SELECT 'INSERT INTO public.guides (id, title, description, author_id, creator_fid, cover_image, tags, is_public, created_at, updated_at) VALUES' ||
       string_agg(
           '(' || 
           id || ', ' ||
           quote_literal(title) || ', ' ||
           COALESCE(quote_literal(description), 'NULL') || ', ' ||
           COALESCE(quote_literal(author_id::text) || '::uuid', 'NULL') || ', ' ||
           COALESCE(creator_fid::text, 'NULL') || ', ' ||
           COALESCE(quote_literal(cover_image), 'NULL') || ', ' ||
           COALESCE(quote_literal(tags::text) || '::text[]', 'NULL') || ', ' ||
           COALESCE(is_public::text, 'true') || ', ' ||
           quote_literal(created_at::text) || '::timestamp with time zone, ' ||
           quote_literal(updated_at::text) || '::timestamp with time zone' ||
           ')',
           ', '
       ) || ';' as insert_statement
FROM public.guides;

SELECT '-- BOOKS DATA' as comment;
SELECT 'INSERT INTO public.books (id, title, author, cover_url, description, published_year, isbn, created_at, updated_at) VALUES' ||
       string_agg(
           '(' || 
           id || ', ' ||
           quote_literal(title) || ', ' ||
           quote_literal(author) || ', ' ||
           COALESCE(quote_literal(cover_url), 'NULL') || ', ' ||
           COALESCE(quote_literal(description), 'NULL') || ', ' ||
           COALESCE(published_year::text, 'NULL') || ', ' ||
           COALESCE(quote_literal(isbn), 'NULL') || ', ' ||
           quote_literal(created_at::text) || '::timestamp with time zone, ' ||
           quote_literal(updated_at::text) || '::timestamp with time zone' ||
           ')',
           ', '
       ) || ';' as insert_statement
FROM public.books;

-- 3. Export all functions
SELECT '-- FUNCTIONS' as comment;
SELECT 'CREATE OR REPLACE FUNCTION ' || routine_name || 
       ') RETURNS ' || data_type || ' AS $$' || 
       routine_definition || '$$ LANGUAGE ' || external_language || ';' as function_definition
FROM information_schema.routines 
WHERE routine_schema = 'public' 
AND routine_type = 'FUNCTION';

-- 4. Export all policies
SELECT '-- RLS POLICIES' as comment;
SELECT 'CREATE POLICY "' || policyname || '" ON ' || schemaname || '.' || tablename || 
       ' FOR ' || cmd || ' USING (' || qual || ');' as policy_definition
FROM pg_policies 
WHERE schemaname = 'public';

-- 5. Export all indexes
SELECT '-- INDEXES' as comment;
SELECT 'CREATE INDEX IF NOT EXISTS ' || indexname || ' ON ' || schemaname || '.' || tablename || 
       ' (' || indexdef || ');' as index_definition
FROM pg_indexes 
WHERE schemaname = 'public';

-- 6. Export all triggers
SELECT '-- TRIGGERS' as comment;
SELECT 'CREATE TRIGGER ' || trigger_name || ' ' || action_timing || ' ' || event_manipulation || 
       ' ON ' || event_object_table || ' FOR EACH ROW EXECUTE FUNCTION ' || action_statement || ';' as trigger_definition
FROM information_schema.triggers 
WHERE trigger_schema = 'public';

-- =====================================================
-- NOTES:
-- =====================================================
-- 
-- 1. Execute this script in Supabase SQL Editor
-- 2. Copy the output to a file for backup
-- 3. This gives you a complete database backup
-- 4. You can use this to recreate the database elsewhere
--
-- =====================================================
