-- =====================================================
-- Castlist Database Schema: Seed Data
-- =====================================================
-- 
-- This script inserts sample data for development and testing.
-- It matches the mock data used in the frontend code.
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
ON CONFLICT (fid) DO UPDATE SET
    username = EXCLUDED.username,
    pfp_url = EXCLUDED.pfp_url,
    updated_at = NOW();

-- 2. Insert sample books
INSERT INTO public.books (id, title, author, cover_url, description, published_year) VALUES
-- Sci-Fi Books
('550e8400-e29b-41d4-a716-446655440001', 'Dune', 'Frank Herbert', 'https://images-na.ssl-images-amazon.com/images/I/81zN7udGRUL.jpg', 'Epic science fiction novel about desert planet Arrakis', 1965),
('550e8400-e29b-41d4-a716-446655440002', 'Foundation', 'Isaac Asimov', 'https://images-na.ssl-images-amazon.com/images/I/81YX2V2FvQL.jpg', 'Galactic empire and psychohistory', 1951),
('550e8400-e29b-41d4-a716-446655440003', 'Neuromancer', 'William Gibson', 'https://images-na.ssl-images-amazon.com/images/I/91JQRzJTSuL.jpg', 'Cyberpunk classic about hacking and AI', 1984),
('550e8400-e29b-41d4-a716-446655440004', 'The Martian', 'Andy Weir', 'https://images-na.ssl-images-amazon.com/images/I/81L2ZtOIVtL.jpg', 'Survival story on Mars', 2011),
('550e8400-e29b-41d4-a716-446655440005', 'Hyperion', 'Dan Simmons', 'https://images-na.ssl-images-amazon.com/images/I/81qzKRXjzEL.jpg', 'Canterbury Tales in space', 1989),

-- Literary Fiction
('550e8400-e29b-41d4-a716-446655440006', '1984', 'George Orwell', 'https://images-na.ssl-images-amazon.com/images/I/81StSOpmvRL.jpg', 'Dystopian masterpiece about totalitarianism', 1949),
('550e8400-e29b-41d4-a716-446655440007', 'To Kill a Mockingbird', 'Harper Lee', 'https://images-na.ssl-images-amazon.com/images/I/81aY1lxk+9L.jpg', 'Classic American novel about racial injustice', 1960),
('550e8400-e29b-41d4-a716-446655440008', 'The Great Gatsby', 'F. Scott Fitzgerald', 'https://images-na.ssl-images-amazon.com/images/I/81QuEGw8VPL.jpg', 'Jazz Age American dream', 1925),
('550e8400-e29b-41d4-a716-446655440009', 'One Hundred Years of Solitude', 'Gabriel García Márquez', 'https://images-na.ssl-images-amazon.com/images/I/91TvVQS7loL.jpg', 'Magical realism masterpiece', 1967),

-- Philosophy
('550e8400-e29b-41d4-a716-446655440010', 'Meditations', 'Marcus Aurelius', 'https://images-na.ssl-images-amazon.com/images/I/81Rb4QSqBFL.jpg', 'Stoic philosophy and self-reflection', 180),
('550e8400-e29b-41d4-a716-446655440011', 'The Republic', 'Plato', 'https://images-na.ssl-images-amazon.com/images/I/81zWrB8XJEL.jpg', 'Classic work on justice and ideal state', -380),

-- Business/Startup
('550e8400-e29b-41d4-a716-446655440012', 'The Lean Startup', 'Eric Ries', 'https://images-na.ssl-images-amazon.com/images/I/81vvgZqFdIL.jpg', 'Build-measure-learn methodology', 2011),
('550e8400-e29b-41d4-a716-446655440013', 'Zero to One', 'Peter Thiel', 'https://images-na.ssl-images-amazon.com/images/I/81vvgZqFdIL.jpg', 'Notes on startups and building the future', 2014),

-- Comics/Graphic Novels
('550e8400-e29b-41d4-a716-446655440014', 'Watchmen', 'Alan Moore', 'https://images-na.ssl-images-amazon.com/images/I/81zN7udGRUL.jpg', 'Deconstructed superhero story', 1987),
('550e8400-e29b-41d4-a716-446655440015', 'Sandman', 'Neil Gaiman', 'https://images-na.ssl-images-amazon.com/images/I/81YX2V2FvQL.jpg', 'Dark fantasy comic series', 1989)
ON CONFLICT (id) DO NOTHING;

-- 3. Insert sample guides
INSERT INTO public.guides (id, title, description, creator_fid, cover_image, tags, created_at) VALUES
('guide-001', 'Essential Sci-Fi Classics', 'Must-read science fiction novels that shaped the genre', 2, 'https://images-na.ssl-images-amazon.com/images/I/81zN7udGRUL.jpg', ARRAY['sci-fi', 'classics', 'space'], NOW() - INTERVAL '20 days'),
('guide-002', 'Literary Masterpieces', 'Timeless works of literary fiction', 3, 'https://images-na.ssl-images-amazon.com/images/I/81StSOpmvRL.jpg', ARRAY['literature', 'classics', 'fiction'], NOW() - INTERVAL '18 days'),
('guide-003', 'Philosophy for Beginners', 'Introduction to philosophical thinking', 4, 'https://images-na.ssl-images-amazon.com/images/I/81Rb4QSqBFL.jpg', ARRAY['philosophy', 'wisdom', 'thinking'], NOW() - INTERVAL '15 days'),
('guide-004', 'Startup Essentials', 'Books every entrepreneur should read', 5, 'https://images-na.ssl-images-amazon.com/images/I/81vvgZqFdIL.jpg', ARRAY['business', 'startup', 'entrepreneurship'], NOW() - INTERVAL '10 days'),
('guide-005', 'Graphic Novel Masterworks', 'The best in sequential art storytelling', 6, 'https://images-na.ssl-images-amazon.com/images/I/81zN7udGRUL.jpg', ARRAY['comics', 'graphic-novels', 'art'], NOW() - INTERVAL '5 days')
ON CONFLICT (id) DO NOTHING;

-- 4. Insert guide-book relationships
INSERT INTO public.guide_books (guide_id, book_id, position, notes) VALUES
-- Essential Sci-Fi Classics
('guide-001', '550e8400-e29b-41d4-a716-446655440001', 1, 'The foundation of modern sci-fi'),
('guide-001', '550e8400-e29b-41d4-a716-446655440002', 2, 'Asimov''s masterpiece of galactic scope'),
('guide-001', '550e8400-e29b-41d4-a716-446655440003', 3, 'Cyberpunk''s defining work'),
('guide-001', '550e8400-e29b-41d4-a716-446655440004', 4, 'Hard sci-fi at its best'),
('guide-001', '550e8400-e29b-41d4-a716-446655440005', 5, 'Space opera with literary depth'),

-- Literary Masterpieces
('guide-002', '550e8400-e29b-41d4-a716-446655440006', 1, 'Orwell''s prophetic vision'),
('guide-002', '550e8400-e29b-41d4-a716-446655440007', 2, 'Moral courage and childhood innocence'),
('guide-002', '550e8400-e29b-41d4-a716-446655440008', 3, 'The American Dream examined'),
('guide-002', '550e8400-e29b-41d4-a716-446655440009', 4, 'Magical realism at its finest'),

-- Philosophy for Beginners
('guide-003', '550e8400-e29b-41d4-a716-446655440010', 1, 'Practical Stoic wisdom'),
('guide-003', '550e8400-e29b-41d4-a716-446655440011', 2, 'The foundations of Western philosophy'),

-- Startup Essentials
('guide-004', '550e8400-e29b-41d4-a716-446655440012', 1, 'Lean methodology for startups'),
('guide-004', '550e8400-e29b-41d4-a716-446655440013', 2, 'Building monopolies and innovation'),

-- Graphic Novel Masterworks
('guide-005', '550e8400-e29b-41d4-a716-446655440014', 1, 'Deconstructing the superhero genre'),
('guide-005', '550e8400-e29b-41d4-a716-446655440015', 2, 'Dreams and nightmares in comic form')
ON CONFLICT (guide_id, book_id) DO NOTHING;

-- 5. Insert sample likes
INSERT INTO public.guide_likes (guide_id, user_fid, created_at) VALUES
('guide-001', 1, NOW() - INTERVAL '19 days'),
('guide-001', 3, NOW() - INTERVAL '18 days'),
('guide-001', 4, NOW() - INTERVAL '17 days'),
('guide-002', 1, NOW() - INTERVAL '16 days'),
('guide-002', 2, NOW() - INTERVAL '15 days'),
('guide-003', 2, NOW() - INTERVAL '14 days'),
('guide-003', 5, NOW() - INTERVAL '13 days'),
('guide-004', 1, NOW() - INTERVAL '9 days'),
('guide-004', 6, NOW() - INTERVAL '8 days'),
('guide-005', 2, NOW() - INTERVAL '4 days'),
('guide-005', 3, NOW() - INTERVAL '3 days')
ON CONFLICT (guide_id, user_fid) DO NOTHING;

-- 6. Insert sample activities
INSERT INTO public.activities (user_fid, activity_type, guide_id, created_at) VALUES
(2, 'guide_created', 'guide-001', NOW() - INTERVAL '20 days'),
(3, 'guide_created', 'guide-002', NOW() - INTERVAL '18 days'),
(4, 'guide_created', 'guide-003', NOW() - INTERVAL '15 days'),
(5, 'guide_created', 'guide-004', NOW() - INTERVAL '10 days'),
(6, 'guide_created', 'guide-005', NOW() - INTERVAL '5 days'),
(1, 'guide_liked', 'guide-001', NOW() - INTERVAL '19 days'),
(1, 'guide_liked', 'guide-002', NOW() - INTERVAL '16 days'),
(1, 'guide_liked', 'guide-004', NOW() - INTERVAL '9 days')
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

-- =====================================================
-- NOTES:
-- =====================================================
-- 
-- 1. This seed data matches the mock data in your frontend
-- 2. All FIDs correspond to the mock users in mockData.ts
-- 3. The UUIDs are consistent for easy reference
-- 4. Run the verification queries to ensure data was inserted correctly
-- 5. You can modify or add more sample data as needed
--
-- =====================================================
