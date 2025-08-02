-- Approve All Existing Users
-- This script ensures all existing users are approved regardless of registration method

-- Update all existing users to approved status
UPDATE public.user_profiles 
SET verification_status = 'approved', 
    economic_status = 'Premium',
    ai_avatar = COALESCE(ai_avatar, 'roy-sir'),
    updated_at = NOW()
WHERE verification_status != 'approved' OR economic_status != 'Premium';

-- Update auth.users to confirm emails for all users
UPDATE auth.users 
SET email_confirmed_at = COALESCE(email_confirmed_at, NOW()),
    updated_at = NOW()
WHERE email_confirmed_at IS NULL;

-- Ensure all users have ai_avatar set
UPDATE public.user_profiles 
SET ai_avatar = 'roy-sir'
WHERE ai_avatar IS NULL;

-- Log the changes
SELECT 
    COUNT(*) as total_users_updated,
    COUNT(CASE WHEN verification_status = 'approved' THEN 1 END) as approved_users,
    COUNT(CASE WHEN economic_status = 'Premium' THEN 1 END) as premium_users
FROM public.user_profiles;

-- Show current status
SELECT 
    verification_status,
    economic_status,
    COUNT(*) as user_count
FROM public.user_profiles 
GROUP BY verification_status, economic_status
ORDER BY verification_status, economic_status; 