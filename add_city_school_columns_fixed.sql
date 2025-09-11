-- Add city and school_name columns to students table
-- Run this in your Supabase SQL editor

-- Add city column
ALTER TABLE students 
ADD COLUMN IF NOT EXISTS city TEXT;

-- Add school_name column
ALTER TABLE students 
ADD COLUMN IF NOT EXISTS school_name TEXT;

-- Verify the columns were added
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'students' 
AND column_name IN ('city', 'school_name');

-- Show current table structure to verify
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'students'
ORDER BY ordinal_position;
