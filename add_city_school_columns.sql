-- Add city and school_name columns to students table
-- Run this in your Supabase SQL editor

-- Add city column
ALTER TABLE students 
ADD COLUMN IF NOT EXISTS city TEXT;

-- Add school_name column
ALTER TABLE students 
ADD COLUMN IF NOT EXISTS school_name TEXT;

-- Update existing records if you have school information
-- Uncomment and modify the UPDATE statement below if you want to set default values
-- UPDATE students 
-- SET 
--     city = 'Default City' 
-- WHERE city IS NULL;

-- Uncomment and modify the UPDATE statement below if you want to set default school names
-- UPDATE students 
-- SET 
--     school_name = 'Default School' 
-- WHERE school_name IS NULL;

-- Verify the columns were added
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'students' 
AND column_name IN ('city', 'school_name');

-- Show sample data to verify
SELECT id, first_name, last_name, city, school_name 
FROM students 
LIMIT 5;
