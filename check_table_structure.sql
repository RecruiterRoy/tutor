-- Check Current Students Table Structure
-- Run this first to see what columns already exist

-- Show all columns in the students table
SELECT 
    column_name, 
    data_type, 
    is_nullable, 
    column_default,
    ordinal_position
FROM information_schema.columns 
WHERE table_name = 'students'
ORDER BY ordinal_position;

-- Check if specific columns exist
SELECT 
    CASE WHEN EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'students' AND column_name = 'monthly_quiz_points'
    ) THEN 'EXISTS' ELSE 'MISSING' END as monthly_quiz_points_status,
    
    CASE WHEN EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'students' AND column_name = 'monthly_assessment_points'
    ) THEN 'EXISTS' ELSE 'MISSING' END as monthly_assessment_points_status,
    
    CASE WHEN EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'students' AND column_name = 'monthly_total_points'
    ) THEN 'EXISTS' ELSE 'MISSING' END as monthly_total_points_status,
    
    CASE WHEN EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'students' AND column_name = 'city'
    ) THEN 'EXISTS' ELSE 'MISSING' END as city_status,
    
    CASE WHEN EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'students' AND column_name = 'school_name'
    ) THEN 'EXISTS' ELSE 'MISSING' END as school_name_status;

-- Show sample data (first 3 rows) to understand the structure
SELECT * FROM students LIMIT 3;
