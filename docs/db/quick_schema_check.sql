-- Quick Schema Check - Run this in Supabase SQL Editor
-- This will show us the current table structure

-- Check all tables
SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';

-- Check profiles table structure
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'profiles' AND table_schema = 'public';

-- Check guides table structure  
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'guides' AND table_schema = 'public';

-- Check if creator_fid exists in guides
SELECT column_name 
FROM information_schema.columns 
WHERE table_name = 'guides' 
AND column_name = 'creator_fid' 
AND table_schema = 'public';
