-- SQL script to extend all subscription expiry dates by one week
-- This will add 7 days to all existing subscription_expiry dates

-- First, let's see the current expiry dates
SELECT 
    id,
    email,
    subscription_expiry,
    subscription_expiry + INTERVAL '7 days' as new_expiry
FROM user_profiles 
WHERE subscription_expiry IS NOT NULL
ORDER BY subscription_expiry;

-- Update all subscription expiry dates by adding 7 days
UPDATE user_profiles 
SET 
    subscription_expiry = subscription_expiry + INTERVAL '7 days',
    updated_at = NOW()
WHERE subscription_expiry IS NOT NULL;

-- Verify the changes
SELECT 
    id,
    email,
    subscription_expiry,
    updated_at
FROM user_profiles 
WHERE subscription_expiry IS NOT NULL
ORDER BY subscription_expiry;

-- Count how many records were updated
SELECT 
    COUNT(*) as total_updated,
    COUNT(CASE WHEN subscription_expiry IS NOT NULL THEN 1 END) as with_expiry_dates
FROM user_profiles; 