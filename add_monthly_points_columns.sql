-- Add monthly points columns to students table
-- Run this in your Supabase SQL editor

-- Add monthly_quiz_points column
ALTER TABLE students 
ADD COLUMN IF NOT EXISTS monthly_quiz_points INTEGER DEFAULT 0;

-- Add monthly_assessment_points column  
ALTER TABLE students 
ADD COLUMN IF NOT EXISTS monthly_assessment_points INTEGER DEFAULT 0;

-- Add monthly_total_points column
ALTER TABLE students 
ADD COLUMN IF NOT EXISTS monthly_total_points INTEGER DEFAULT 0;

-- Update existing records to set default values
UPDATE students 
SET 
    monthly_quiz_points = COALESCE(monthly_quiz_points, 0),
    monthly_assessment_points = COALESCE(monthly_assessment_points, 0),
    monthly_total_points = COALESCE(monthly_total_points, 0)
WHERE 
    monthly_quiz_points IS NULL 
    OR monthly_assessment_points IS NULL 
    OR monthly_total_points IS NULL;

-- Verify the columns were added
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'students' 
AND column_name IN ('monthly_quiz_points', 'monthly_assessment_points', 'monthly_total_points');
