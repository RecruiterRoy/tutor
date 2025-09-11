-- Complete Database Setup for Tutor.AI (Fixed Version)
-- Run this in your Supabase SQL editor to add all missing columns
-- This version only adds columns without referencing non-existent ones

-- ===========================================
-- 1. ADD MONTHLY POINTS COLUMNS
-- ===========================================

-- Add monthly_quiz_points column
ALTER TABLE students 
ADD COLUMN IF NOT EXISTS monthly_quiz_points INTEGER DEFAULT 0;

-- Add monthly_assessment_points column  
ALTER TABLE students 
ADD COLUMN IF NOT EXISTS monthly_assessment_points INTEGER DEFAULT 0;

-- Add monthly_total_points column
ALTER TABLE students 
ADD COLUMN IF NOT EXISTS monthly_total_points INTEGER DEFAULT 0;

-- ===========================================
-- 2. ADD LOCATION AND SCHOOL COLUMNS
-- ===========================================

-- Add city column
ALTER TABLE students 
ADD COLUMN IF NOT EXISTS city TEXT;

-- Add school_name column
ALTER TABLE students 
ADD COLUMN IF NOT EXISTS school_name TEXT;

-- ===========================================
-- 3. UPDATE EXISTING RECORDS
-- ===========================================

-- Set default values for monthly points columns
UPDATE students 
SET 
    monthly_quiz_points = COALESCE(monthly_quiz_points, 0),
    monthly_assessment_points = COALESCE(monthly_assessment_points, 0),
    monthly_total_points = COALESCE(monthly_total_points, 0)
WHERE 
    monthly_quiz_points IS NULL 
    OR monthly_assessment_points IS NULL 
    OR monthly_total_points IS NULL;

-- ===========================================
-- 4. VERIFICATION QUERIES
-- ===========================================

-- Check if all columns were added successfully
SELECT 
    column_name, 
    data_type, 
    is_nullable, 
    column_default
FROM information_schema.columns 
WHERE table_name = 'students' 
AND column_name IN (
    'monthly_quiz_points', 
    'monthly_assessment_points', 
    'monthly_total_points',
    'city',
    'school_name'
)
ORDER BY column_name;

-- Show current table structure to verify
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'students'
ORDER BY ordinal_position;

-- Count total students
SELECT COUNT(*) as total_students FROM students;

-- Check for any NULL values in critical columns
SELECT 
    COUNT(*) as students_with_null_city,
    COUNT(*) as students_with_null_school
FROM students 
WHERE city IS NULL OR school_name IS NULL;
