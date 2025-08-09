-- NUCLEAR OPTION: COMPLETELY DISABLE RLS ON USER_PROFILES
-- This will fix the login issue immediately by removing all RLS restrictions
-- WARNING: This removes row-level security - only use temporarily

-- Step 1: Drop ALL policies
DROP POLICY IF EXISTS "Users can view own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can delete own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can view and update their own gender" ON user_profiles;
DROP POLICY IF EXISTS "Enable read access for all users" ON user_profiles;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON user_profiles;
DROP POLICY IF EXISTS "Enable update for users based on user_id" ON user_profiles;
DROP POLICY IF EXISTS "Enable delete for users based on user_id" ON user_profiles;
DROP POLICY IF EXISTS "Users can view their own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can delete their own profile" ON user_profiles;

-- Step 2: Completely disable RLS
ALTER TABLE user_profiles DISABLE ROW LEVEL SECURITY;

-- Step 3: Grant full permissions to authenticated users
GRANT ALL ON user_profiles TO authenticated;
GRANT USAGE ON SCHEMA public TO authenticated;

-- Step 4: Verify RLS is disabled
SELECT 
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables 
WHERE tablename = 'user_profiles';

-- Step 5: Test that queries work
SELECT COUNT(*) FROM user_profiles LIMIT 1;

-- Step 6: Show current permissions
SELECT 
    grantee,
    privilege_type,
    is_grantable
FROM information_schema.role_table_grants 
WHERE table_name = 'user_profiles';

-- RESULT: Login should work immediately after running this script
-- The user_profiles table will have NO RLS restrictions
-- All authenticated users can read/write to any profile
-- This is temporary - re-enable RLS later with proper policies 