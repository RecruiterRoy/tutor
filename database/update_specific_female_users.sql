-- Update specific female users
-- This script updates the gender for the specified female users

UPDATE user_profiles 
SET gender = 'female',
    updated_at = NOW()
WHERE full_name ILIKE '%pakhi%' 
   OR full_name ILIKE '%manu%' 
   OR full_name ILIKE '%gudia%' 
   OR full_name ILIKE '%chaitanya%'
   OR email ILIKE '%pakhi%'
   OR email ILIKE '%manu%'
   OR email ILIKE '%gudia%'
   OR email ILIKE '%chaitanya%';

-- Verify the updates
SELECT 
    id,
    full_name,
    email,
    gender,
    updated_at
FROM user_profiles 
WHERE full_name ILIKE '%pakhi%' 
   OR full_name ILIKE '%manu%' 
   OR full_name ILIKE '%gudia%' 
   OR full_name ILIKE '%chaitanya%'
   OR email ILIKE '%pakhi%'
   OR email ILIKE '%manu%'
   OR email ILIKE '%gudia%'
   OR email ILIKE '%chaitanya%'
ORDER BY full_name; 