-- Check the actual structure of the videos table
-- This will show us what columns exist

-- Method 1: Check table structure
SELECT 
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns 
WHERE table_name = 'videos'
ORDER BY ordinal_position;

-- Method 2: Check a few sample rows to see the data
SELECT * FROM videos LIMIT 3;

-- Method 3: Check if specific columns exist
SELECT 
  CASE WHEN EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'videos' AND column_name = 'subject'
  ) THEN 'subject column exists' ELSE 'subject column does not exist' END as subject_check,
  
  CASE WHEN EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'videos' AND column_name = 'class_level'
  ) THEN 'class_level column exists' ELSE 'class_level column does not exist' END as class_level_check,
  
  CASE WHEN EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'videos' AND column_name = 'video_id'
  ) THEN 'video_id column exists' ELSE 'video_id column does not exist' END as video_id_check;
