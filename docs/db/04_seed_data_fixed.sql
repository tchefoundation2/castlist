-- =====================================================
-- Castlist Database Schema: Seed Data (FIXED)
-- =====================================================
-- 
-- This script inserts sample data for development and testing.
-- It matches the mock data used in the frontend code.
-- FIXED for BIGINT IDs.
--
-- Run this script AFTER all the previous schema scripts
-- =====================================================

-- 1. Insert sample profiles (matching mockData.ts)
INSERT INTO public.profiles (id, fid, username, pfp_url, created_at) VALUES
('4cd58ff3-fa6a-4ab0-80bc-e0cc22730778', 1, 'farcaster.eth', 'https://i.imgur.com/34Iodlt.jpg', NOW() - INTERVAL '30 days'),
('8126631d-d609-4b10-8406-1ad28db214e8', 2, 'Sci-Fi Reader', 'https://i.imgur.com/PC3e8NJ.jpg', NOW() - INTERVAL '25 days'),
('a7b8e966-a865-4567-9bdf-2639417da534', 3, 'Literary Bookworm', 'https://i.imgur.com/J3G59bK.jpg', NOW() - INTERVAL '20 days'),
('56e9561b-f708-43d1-ac23-9ee1b3be095c', 4, 'philosopher_king', 'https://i.imgur.com/mQkmy0N.jpg', NOW() - INTERVAL '15 days'),
('15fef28f-4627-4db5-821f-697692f18f7c', 5, 'startup_guru', 'https://i.imgur.com/T0a0bA0.jpg', NOW() - INTERVAL '10 days'),
('1c10d98f-df53-4ec2-9765-c3967c4451d6', 6, 'comic_nerd', 'https://i.imgur.com/vH5y5Z5.jpg', NOW() - INTERVAL '5 days'),
('ef4ef7fd-ade7-43d7-85d2-04c3f55ed27c', 7, 'Tche Foundation', 'https://i.imgur.com/d28d83A.png', NOW() - INTERVAL '1 day')
ON CONFLICT (id) DO UPDATE SET
    fid = EXCLUDED.fid,
    username = EXCLUDED.username,
    pfp_url = EXCLUDED.pfp_url,
    updated_at = NOW();

-- 2. Fix books table structure
-- Remove guide_id column with CASCADE to remove all dependent objects
ALTER TABLE public.books DROP COLUMN IF EXISTS guide_id CASCADE;

-- Add missing columns if they don't exist
ALTER TABLE public.books ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE public.books ADD COLUMN IF NOT EXISTS published_year INTEGER;

-- 3. Insert sample books (using BIGINT - let PostgreSQL auto-assign IDs)
INSERT INTO public.books (title, author, cover_url, description, published_year) VALUES
-- Sci-Fi Books
('Dune', 'Frank Herbert', 'https://images-na.ssl-images-amazon.com/images/I/81zN7udGRUL.jpg', 'Epic science fiction novel about desert planet Arrakis', 1965),
('Foundation', 'Isaac Asimov', 'https://images-na.ssl-images-amazon.com/images/I/81YX2V2FvQL.jpg', 'Galactic empire and psychohistory', 1951),
('Neuromancer', 'William Gibson', 'https://images-na.ssl-images-amazon.com/images/I/91JQRzJTSuL.jpg', 'Cyberpunk classic about hacking and AI', 1984),
('The Martian', 'Andy Weir', 'https://images-na.ssl-images-amazon.com/images/I/81L2ZtOIVtL.jpg', 'Survival story on Mars', 2011),
('Hyperion', 'Dan Simmons', 'https://images-na.ssl-images-amazon.com/images/I/81qzKRXjzEL.jpg', 'Canterbury Tales in space', 1989),

-- Literary Fiction
('1984', 'George Orwell', 'https://images-na.ssl-images-amazon.com/images/I/81StSOpmvRL.jpg', 'Dystopian masterpiece about totalitarianism', 1949),
('To Kill a Mockingbird', 'Harper Lee', 'https://images-na.ssl-images-amazon.com/images/I/81aY1lxk+9L.jpg', 'Classic American novel about racial injustice', 1960),
('The Great Gatsby', 'F. Scott Fitzgerald', 'https://images-na.ssl-images-amazon.com/images/I/81QuEGw8VPL.jpg', 'Jazz Age American dream', 1925),
('One Hundred Years of Solitude', 'Gabriel García Márquez', 'https://images-na.ssl-images-amazon.com/images/I/91TvVQS7loL.jpg', 'Magical realism masterpiece', 1967),

-- Philosophy
('Meditations', 'Marcus Aurelius', 'https://images-na.ssl-images-amazon.com/images/I/81Rb4QSqBFL.jpg', 'Stoic philosophy and self-reflection', 180),
('The Republic', 'Plato', 'https://images-na.ssl-images-amazon.com/images/I/81zWrB8XJEL.jpg', 'Classic work on justice and ideal state', -380),

-- Business/Startup
('The Lean Startup', 'Eric Ries', 'https://images-na.ssl-images-amazon.com/images/I/81vvgZqFdIL.jpg', 'Build-measure-learn methodology', 2011),
('Zero to One', 'Peter Thiel', 'https://images-na.ssl-images-amazon.com/images/I/81vvgZqFdIL.jpg', 'Notes on startups and building the future', 2014),

-- Comics/Graphic Novels
('Watchmen', 'Alan Moore', 'https://images-na.ssl-images-amazon.com/images/I/81zN7udGRUL.jpg', 'Deconstructed superhero story', 1987),
('Sandman', 'Neil Gaiman', 'https://images-na.ssl-images-amazon.com/images/I/81YX2V2FvQL.jpg', 'Dark fantasy comic series', 1989)
ON CONFLICT DO NOTHING;

-- 4. Insert sample guides (using BIGINT - let PostgreSQL auto-assign IDs)
-- Include both author_id (UUID) and creator_fid (INTEGER) for compatibility
INSERT INTO public.guides (title, description, author_id, creator_fid, cover_image, tags, created_at) VALUES
('Essential Sci-Fi Classics', 'Must-read science fiction novels that shaped the genre', 
 (SELECT id FROM public.profiles WHERE fid = 2 LIMIT 1), 2, 
 'https://images-na.ssl-images-amazon.com/images/I/81zN7udGRUL.jpg', 
 ARRAY['sci-fi', 'classics', 'space'], NOW() - INTERVAL '20 days'),
('Literary Masterpieces', 'Timeless works of literary fiction', 
 (SELECT id FROM public.profiles WHERE fid = 3 LIMIT 1), 3, 
 'https://images-na.ssl-images-amazon.com/images/I/81StSOpmvRL.jpg', 
 ARRAY['literature', 'classics', 'fiction'], NOW() - INTERVAL '18 days'),
('Philosophy for Beginners', 'Introduction to philosophical thinking', 
 (SELECT id FROM public.profiles WHERE fid = 4 LIMIT 1), 4, 
 'https://images-na.ssl-images-amazon.com/images/I/81Rb4QSqBFL.jpg', 
 ARRAY['philosophy', 'wisdom', 'thinking'], NOW() - INTERVAL '15 days'),
('Startup Essentials', 'Books every entrepreneur should read', 
 (SELECT id FROM public.profiles WHERE fid = 5 LIMIT 1), 5, 
 'https://images-na.ssl-images-amazon.com/images/I/81vvgZqFdIL.jpg', 
 ARRAY['business', 'startup', 'entrepreneurship'], NOW() - INTERVAL '10 days'),
('Graphic Novel Masterworks', 'The best in sequential art storytelling', 
 (SELECT id FROM public.profiles WHERE fid = 6 LIMIT 1), 6, 
 'https://images-na.ssl-images-amazon.com/images/I/81zN7udGRUL.jpg', 
 ARRAY['comics', 'graphic-novels', 'art'], NOW() - INTERVAL '5 days')
ON CONFLICT DO NOTHING;

-- 5. Insert guide-book relationships (using actual IDs from the database)
-- Note: This will use the auto-generated IDs, so we need to reference them by title/author
INSERT INTO public.guide_books (guide_id, book_id, position, notes)
SELECT 
    g.id as guide_id,
    b.id as book_id,
    data.position,
    data.notes
FROM (VALUES
    -- Essential Sci-Fi Classics (guide created by user FID 2)
    ('Essential Sci-Fi Classics', 'Dune', 'Frank Herbert', 1, 'The foundation of modern sci-fi'),
    ('Essential Sci-Fi Classics', 'Foundation', 'Isaac Asimov', 2, 'Asimov''s masterpiece of galactic scope'),
    ('Essential Sci-Fi Classics', 'Neuromancer', 'William Gibson', 3, 'Cyberpunk''s defining work'),
    ('Essential Sci-Fi Classics', 'The Martian', 'Andy Weir', 4, 'Hard sci-fi at its best'),
    ('Essential Sci-Fi Classics', 'Hyperion', 'Dan Simmons', 5, 'Space opera with literary depth'),
    
    -- Literary Masterpieces (guide created by user FID 3)
    ('Literary Masterpieces', '1984', 'George Orwell', 1, 'Orwell''s prophetic vision'),
    ('Literary Masterpieces', 'To Kill a Mockingbird', 'Harper Lee', 2, 'Moral courage and childhood innocence'),
    ('Literary Masterpieces', 'The Great Gatsby', 'F. Scott Fitzgerald', 3, 'The American Dream examined'),
    ('Literary Masterpieces', 'One Hundred Years of Solitude', 'Gabriel García Márquez', 4, 'Magical realism at its finest'),
    
    -- Philosophy for Beginners (guide created by user FID 4)
    ('Philosophy for Beginners', 'Meditations', 'Marcus Aurelius', 1, 'Practical Stoic wisdom'),
    ('Philosophy for Beginners', 'The Republic', 'Plato', 2, 'The foundations of Western philosophy'),
    
    -- Startup Essentials (guide created by user FID 5)
    ('Startup Essentials', 'The Lean Startup', 'Eric Ries', 1, 'Lean methodology for startups'),
    ('Startup Essentials', 'Zero to One', 'Peter Thiel', 2, 'Building monopolies and innovation'),
    
    -- Graphic Novel Masterworks (guide created by user FID 6)
    ('Graphic Novel Masterworks', 'Watchmen', 'Alan Moore', 1, 'Deconstructing the superhero genre'),
    ('Graphic Novel Masterworks', 'Sandman', 'Neil Gaiman', 2, 'Dreams and nightmares in comic form')
) AS data(guide_title, book_title, book_author, position, notes)
JOIN public.guides g ON g.title = data.guide_title
JOIN public.books b ON b.title = data.book_title AND b.author = data.book_author
ON CONFLICT (guide_id, book_id) DO NOTHING;

-- 5. Insert sample likes (using actual guide IDs)
INSERT INTO public.guide_likes (guide_id, user_fid, created_at)
SELECT 
    g.id as guide_id,
    data.user_fid,
    data.created_at
FROM (VALUES
    ('Essential Sci-Fi Classics', 1, NOW() - INTERVAL '19 days'),
    ('Essential Sci-Fi Classics', 3, NOW() - INTERVAL '18 days'),
    ('Essential Sci-Fi Classics', 4, NOW() - INTERVAL '17 days'),
    ('Literary Masterpieces', 1, NOW() - INTERVAL '16 days'),
    ('Literary Masterpieces', 2, NOW() - INTERVAL '15 days'),
    ('Philosophy for Beginners', 2, NOW() - INTERVAL '14 days'),
    ('Philosophy for Beginners', 5, NOW() - INTERVAL '13 days'),
    ('Startup Essentials', 1, NOW() - INTERVAL '9 days'),
    ('Startup Essentials', 6, NOW() - INTERVAL '8 days'),
    ('Graphic Novel Masterworks', 2, NOW() - INTERVAL '4 days'),
    ('Graphic Novel Masterworks', 3, NOW() - INTERVAL '3 days')
) AS data(guide_title, user_fid, created_at)
JOIN public.guides g ON g.title = data.guide_title
ON CONFLICT (guide_id, user_fid) DO NOTHING;

-- 6. Insert sample activities (using actual guide IDs)
INSERT INTO public.activities (user_fid, activity_type, guide_id, created_at)
SELECT 
    data.user_fid,
    data.activity_type,
    g.id as guide_id,
    data.created_at
FROM (VALUES
    (2, 'guide_created', 'Essential Sci-Fi Classics', NOW() - INTERVAL '20 days'),
    (3, 'guide_created', 'Literary Masterpieces', NOW() - INTERVAL '18 days'),
    (4, 'guide_created', 'Philosophy for Beginners', NOW() - INTERVAL '15 days'),
    (5, 'guide_created', 'Startup Essentials', NOW() - INTERVAL '10 days'),
    (6, 'guide_created', 'Graphic Novel Masterworks', NOW() - INTERVAL '5 days'),
    (1, 'guide_liked', 'Essential Sci-Fi Classics', NOW() - INTERVAL '19 days'),
    (1, 'guide_liked', 'Literary Masterpieces', NOW() - INTERVAL '16 days'),
    (1, 'guide_liked', 'Startup Essentials', NOW() - INTERVAL '9 days')
) AS data(user_fid, activity_type, guide_title, created_at)
LEFT JOIN public.guides g ON g.title = data.guide_title
ON CONFLICT DO NOTHING;

-- =====================================================
-- VERIFICATION QUERIES (Run these to check the data)
-- =====================================================

-- Check profiles
-- SELECT fid, username, created_at FROM public.profiles ORDER BY fid;

-- Check guides with book counts
-- SELECT g.title, g.creator_fid, p.username, COUNT(gb.book_id) as book_count
-- FROM public.guides g
-- JOIN public.profiles p ON g.creator_fid = p.fid
-- LEFT JOIN public.guide_books gb ON g.id = gb.guide_id
-- GROUP BY g.id, g.title, g.creator_fid, p.username
-- ORDER BY g.created_at DESC;

-- Check guide likes
-- SELECT g.title, COUNT(gl.user_fid) as like_count
-- FROM public.guides g
-- LEFT JOIN public.guide_likes gl ON g.id = gl.guide_id
-- GROUP BY g.id, g.title
-- ORDER BY like_count DESC;

-- Test the new functions
-- SELECT * FROM public.get_public_guides_feed(5, 0);

-- 7. Recreate correct RLS policies for books table
-- Books should be publicly readable, but only authenticated users can modify
DROP POLICY IF EXISTS "books_select_policy" ON public.books;
CREATE POLICY "books_select_policy" ON public.books
    FOR SELECT
    USING (true); -- Anyone can view books

DROP POLICY IF EXISTS "books_insert_policy" ON public.books;
CREATE POLICY "books_insert_policy" ON public.books
    FOR INSERT
    WITH CHECK (true); -- Any authenticated user can add books

DROP POLICY IF EXISTS "books_update_policy" ON public.books;
CREATE POLICY "books_update_policy" ON public.books
    FOR UPDATE
    USING (true); -- Any authenticated user can update books

DROP POLICY IF EXISTS "books_delete_policy" ON public.books;
CREATE POLICY "books_delete_policy" ON public.books
    FOR DELETE
    USING (true); -- Any authenticated user can delete books

-- =====================================================
-- NOTES:
-- =====================================================
-- 
-- 1. FIXED: Changed to use BIGINT auto-generated IDs
-- 2. Uses JOINs to reference books and guides by title instead of hardcoded IDs
-- 3. All FIDs correspond to the mock users in mockData.ts
-- 4. Run the verification queries to ensure data was inserted correctly
-- 5. Test the RPC functions after running this script
-- 6. FIXED: Removed incorrect guide_id column from books table
--
-- =====================================================
