-- =====================================================
-- Castlist Database: CLEAN SEED DATA
-- =====================================================
-- 
-- This script inserts sample data for development and testing.
-- Run this AFTER complete_schema_clean.sql
-- =====================================================

-- 1. Insert sample profiles with FID
INSERT INTO public.profiles (id, fid, username, pfp_url, email, created_at) VALUES
('4cd58ff3-fa6a-4ab0-80bc-e0cc22730778', 1, 'farcaster.eth', 'https://i.imgur.com/34Iodlt.jpg', 'farcaster@example.com', NOW() - INTERVAL '30 days'),
('8126631d-d609-4b10-8406-1ad28db214e8', 2, 'Sci-Fi Reader', 'https://i.imgur.com/PC3e8NJ.jpg', 'scifi@example.com', NOW() - INTERVAL '25 days'),
('a7b8e966-a865-4567-9bdf-2639417da534', 3, 'Literary Bookworm', 'https://i.imgur.com/J3G59bK.jpg', 'literary@example.com', NOW() - INTERVAL '20 days'),
('56e9561b-f708-43d1-ac23-9ee1b3be095c', 4, 'philosopher_king', 'https://i.imgur.com/mQkmy0N.jpg', 'philosophy@example.com', NOW() - INTERVAL '15 days'),
('15fef28f-4627-4db5-821f-697692f18f7c', 5, 'startup_guru', 'https://i.imgur.com/T0a0bA0.jpg', 'startup@example.com', NOW() - INTERVAL '10 days'),
('1c10d98f-df53-4ec2-9765-c3967c4451d6', 6, 'comic_nerd', 'https://i.imgur.com/vH5y5Z5.jpg', 'comics@example.com', NOW() - INTERVAL '5 days'),
('ef4ef7fd-ade7-43d7-85d2-04c3f55ed27c', 7, 'Tche Foundation', 'https://i.imgur.com/d28d83A.png', 'tche@example.com', NOW() - INTERVAL '1 day');

-- 2. Insert sample books
INSERT INTO public.books (title, author, cover_url, description, published_year, isbn) VALUES
-- Sci-Fi Books
('Dune', 'Frank Herbert', 'https://images-na.ssl-images-amazon.com/images/I/81zN7udGRUL.jpg', 'Epic science fiction novel about desert planet Arrakis', 1965, '978-0441013593'),
('Foundation', 'Isaac Asimov', 'https://images-na.ssl-images-amazon.com/images/I/81YX2V2FvQL.jpg', 'Galactic empire and psychohistory', 1951, '978-0553293357'),
('Neuromancer', 'William Gibson', 'https://images-na.ssl-images-amazon.com/images/I/91JQRzJTSuL.jpg', 'Cyberpunk classic about hacking and AI', 1984, '978-0441569595'),
('The Martian', 'Andy Weir', 'https://images-na.ssl-images-amazon.com/images/I/81L2ZtOIVtL.jpg', 'Survival story on Mars', 2011, '978-0553418026'),
('Hyperion', 'Dan Simmons', 'https://images-na.ssl-images-amazon.com/images/I/81qzKRXjzEL.jpg', 'Canterbury Tales in space', 1989, '978-0553288209'),

-- Literary Fiction
('1984', 'George Orwell', 'https://images-na.ssl-images-amazon.com/images/I/81StSOpmvRL.jpg', 'Dystopian masterpiece about totalitarianism', 1949, '978-0451524935'),
('To Kill a Mockingbird', 'Harper Lee', 'https://images-na.ssl-images-amazon.com/images/I/81aY1lxk+9L.jpg', 'Classic American novel about racial injustice', 1960, '978-0061120084'),
('The Great Gatsby', 'F. Scott Fitzgerald', 'https://images-na.ssl-images-amazon.com/images/I/81QuEGw8VPL.jpg', 'Jazz Age American dream', 1925, '978-0743273565'),
('One Hundred Years of Solitude', 'Gabriel García Márquez', 'https://images-na.ssl-images-amazon.com/images/I/91TvVQS7loL.jpg', 'Magical realism masterpiece', 1967, '978-0060883287'),

-- Philosophy
('Meditations', 'Marcus Aurelius', 'https://images-na.ssl-images-amazon.com/images/I/81Rb4QSqBFL.jpg', 'Stoic philosophy and self-reflection', 180, '978-0486298238'),
('The Republic', 'Plato', 'https://images-na.ssl-images-amazon.com/images/I/81zWrB8XJEL.jpg', 'Classic work on justice and ideal state', -380, '978-0486411217'),

-- Business/Startup
('The Lean Startup', 'Eric Ries', 'https://images-na.ssl-images-amazon.com/images/I/81vvgZqFdIL.jpg', 'Build-measure-learn methodology', 2011, '978-0307887894'),
('Zero to One', 'Peter Thiel', 'https://images-na.ssl-images-amazon.com/images/I/81vvgZqFdIL.jpg', 'Notes on startups and building the future', 2014, '978-0804139298'),

-- Comics/Graphic Novels
('Watchmen', 'Alan Moore', 'https://images-na.ssl-images-amazon.com/images/I/81zN7udGRUL.jpg', 'Deconstructed superhero story', 1987, '978-0930289232'),
('Sandman', 'Neil Gaiman', 'https://images-na.ssl-images-amazon.com/images/I/81YX2V2FvQL.jpg', 'Dark fantasy comic series', 1989, '978-1563890119');

-- 3. Insert sample guides
INSERT INTO public.guides (title, description, author_id, creator_fid, cover_image, tags, created_at) VALUES
('Essential Sci-Fi Classics', 'Must-read science fiction novels that shaped the genre', 
 (SELECT id FROM public.profiles WHERE fid = 2), 2, 
 'https://images-na.ssl-images-amazon.com/images/I/81zN7udGRUL.jpg', 
 ARRAY['sci-fi', 'classics', 'space'], NOW() - INTERVAL '20 days'),
('Literary Masterpieces', 'Timeless works of literary fiction', 
 (SELECT id FROM public.profiles WHERE fid = 3), 3, 
 'https://images-na.ssl-images-amazon.com/images/I/81StSOpmvRL.jpg', 
 ARRAY['literature', 'classics', 'fiction'], NOW() - INTERVAL '18 days'),
('Philosophy for Beginners', 'Introduction to philosophical thinking', 
 (SELECT id FROM public.profiles WHERE fid = 4), 4, 
 'https://images-na.ssl-images-amazon.com/images/I/81Rb4QSqBFL.jpg', 
 ARRAY['philosophy', 'wisdom', 'thinking'], NOW() - INTERVAL '15 days'),
('Startup Essentials', 'Books every entrepreneur should read', 
 (SELECT id FROM public.profiles WHERE fid = 5), 5, 
 'https://images-na.ssl-images-amazon.com/images/I/81vvgZqFdIL.jpg', 
 ARRAY['business', 'startup', 'entrepreneurship'], NOW() - INTERVAL '10 days'),
('Graphic Novel Masterworks', 'The best in sequential art storytelling', 
 (SELECT id FROM public.profiles WHERE fid = 6), 6, 
 'https://images-na.ssl-images-amazon.com/images/I/81zN7udGRUL.jpg', 
 ARRAY['comics', 'graphic-novels', 'art'], NOW() - INTERVAL '5 days');

-- 4. Insert guide-book relationships
INSERT INTO public.guide_books (guide_id, book_id, position, notes)
SELECT 
    g.id as guide_id,
    b.id as book_id,
    data.position,
    data.notes
FROM (VALUES
    -- Essential Sci-Fi Classics
    ('Essential Sci-Fi Classics', 'Dune', 'Frank Herbert', 1, 'The foundation of modern sci-fi'),
    ('Essential Sci-Fi Classics', 'Foundation', 'Isaac Asimov', 2, 'Asimov''s masterpiece of galactic scope'),
    ('Essential Sci-Fi Classics', 'Neuromancer', 'William Gibson', 3, 'Cyberpunk''s defining work'),
    ('Essential Sci-Fi Classics', 'The Martian', 'Andy Weir', 4, 'Hard sci-fi at its best'),
    ('Essential Sci-Fi Classics', 'Hyperion', 'Dan Simmons', 5, 'Space opera with literary depth'),
    
    -- Literary Masterpieces
    ('Literary Masterpieces', '1984', 'George Orwell', 1, 'Orwell''s prophetic vision'),
    ('Literary Masterpieces', 'To Kill a Mockingbird', 'Harper Lee', 2, 'A timeless tale of justice'),
    ('Literary Masterpieces', 'The Great Gatsby', 'F. Scott Fitzgerald', 3, 'The American dream examined'),
    ('Literary Masterpieces', 'One Hundred Years of Solitude', 'Gabriel García Márquez', 4, 'Magical realism at its finest'),
    
    -- Philosophy for Beginners
    ('Philosophy for Beginners', 'Meditations', 'Marcus Aurelius', 1, 'Stoic wisdom for modern life'),
    ('Philosophy for Beginners', 'The Republic', 'Plato', 2, 'The foundation of Western philosophy'),
    
    -- Startup Essentials
    ('Startup Essentials', 'The Lean Startup', 'Eric Ries', 1, 'Essential methodology for entrepreneurs'),
    ('Startup Essentials', 'Zero to One', 'Peter Thiel', 2, 'Innovation and monopoly thinking'),
    
    -- Graphic Novel Masterworks
    ('Graphic Novel Masterworks', 'Watchmen', 'Alan Moore', 1, 'Deconstructing the superhero genre'),
    ('Graphic Novel Masterworks', 'Sandman', 'Neil Gaiman', 2, 'Dark fantasy meets mythology')
) AS data(guide_title, book_title, book_author, position, notes)
JOIN public.guides g ON g.title = data.guide_title
JOIN public.books b ON b.title = data.book_title AND b.author = data.book_author;

-- 5. Insert sample guide likes
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
    ('Philosophy for Beginners', 1, NOW() - INTERVAL '14 days'),
    ('Philosophy for Beginners', 2, NOW() - INTERVAL '13 days'),
    ('Startup Essentials', 1, NOW() - INTERVAL '9 days'),
    ('Startup Essentials', 6, NOW() - INTERVAL '8 days'),
    ('Graphic Novel Masterworks', 2, NOW() - INTERVAL '4 days'),
    ('Graphic Novel Masterworks', 3, NOW() - INTERVAL '3 days')
) AS data(guide_title, user_fid, created_at)
JOIN public.guides g ON g.title = data.guide_title;

-- 6. Insert sample activities
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
JOIN public.guides g ON g.title = data.guide_title;

-- =====================================================
-- VERIFICATION QUERIES
-- =====================================================

-- Check profiles
-- SELECT fid, username, created_at FROM public.profiles ORDER BY created_at;

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

-- =====================================================
-- NOTES:
-- =====================================================
-- 
-- 1. CLEAN: All data inserted without conflicts
-- 2. CONSISTENT: All FIDs match between profiles and guides
-- 3. COMPLETE: Books, guides, relationships, likes, activities
-- 4. READY: Database ready for frontend integration
--
-- =====================================================
