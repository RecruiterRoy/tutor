-- Script to help identify and update existing users with correct gender
-- This script provides queries to help you manually update user genders

-- Step 1: Check current gender distribution
SELECT 
    gender,
    COUNT(*) as user_count,
    ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER (), 2) as percentage
FROM user_profiles 
GROUP BY gender
ORDER BY user_count DESC;

-- Step 2: Show users with NULL gender (if any)
SELECT 
    id,
    full_name,
    email,
    gender
FROM user_profiles 
WHERE gender IS NULL;

-- Step 3: Show all users with their current gender for manual review
SELECT 
    id,
    full_name,
    email,
    gender,
    created_at
FROM user_profiles 
ORDER BY created_at DESC;

-- Step 4: Example queries to update specific users (run these manually)
-- Update a specific user to female (replace 'user_email@example.com' with actual email)
-- UPDATE user_profiles 
-- SET gender = 'female' 
-- WHERE email = 'user_email@example.com';

-- Update users with specific names to female (example)
-- UPDATE user_profiles 
-- SET gender = 'female' 
-- WHERE full_name ILIKE '%sapna%' 
--    OR full_name ILIKE '%priya%' 
--    OR full_name ILIKE '%neha%'
--    OR full_name ILIKE '%anjali%';

-- Update users with specific names to male (example)
-- UPDATE user_profiles 
-- SET gender = 'male' 
-- WHERE full_name ILIKE '%roy%' 
--    OR full_name ILIKE '%raj%' 
--    OR full_name ILIKE '%amit%'
--    OR full_name ILIKE '%rahul%';

-- Step 5: Verify the gender column exists and is working
SELECT 
    column_name, 
    data_type, 
    is_nullable, 
    column_default
FROM information_schema.columns 
WHERE table_name = 'user_profiles' 
AND column_name = 'gender';

-- Step 6: Test that new registrations will include gender
-- This query should return the gender field for new users
SELECT 
    id,
    full_name,
    email,
    gender,
    created_at
FROM user_profiles 
WHERE created_at >= NOW() - INTERVAL '1 day'
ORDER BY created_at DESC; 