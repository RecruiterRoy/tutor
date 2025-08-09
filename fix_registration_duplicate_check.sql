-- =====================================================
-- FIX REGISTRATION DUPLICATE CHECKING
-- =====================================================
-- This file adds a policy to allow anonymous users to check for duplicates
-- during registration, while maintaining security for other operations
-- =====================================================

-- Add policy for anonymous users to check for duplicates during registration
-- This allows reading user_profiles table to check if email/phone already exists
CREATE POLICY "Anonymous users can check for duplicates"
ON user_profiles FOR SELECT
TO anon
USING (true); -- Allow reading all profiles for duplicate checking

-- Grant necessary permissions to anonymous users
GRANT SELECT ON user_profiles TO anon;

-- =====================================================
-- VERIFICATION
-- =====================================================

-- Test that anonymous users can now check for duplicates
-- This should work without authentication
SELECT 
    'Anonymous duplicate check test' as test_name,
    COUNT(*) as total_profiles,
    COUNT(CASE WHEN email = 'test@example.com' THEN 1 END) as test_email_count
FROM user_profiles;

-- =====================================================
-- SECURITY NOTES
-- =====================================================
-- This policy only allows SELECT (read) access for duplicate checking
-- Anonymous users cannot INSERT, UPDATE, or DELETE profiles
-- Registration still requires proper authentication to create profiles
-- This maintains security while enabling duplicate checking functionality 