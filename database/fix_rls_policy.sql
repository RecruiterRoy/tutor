-- COMPREHENSIVE RLS POLICY FIX FOR USER_PROFILES TABLE
-- This script completely removes all problematic policies and creates simple, working ones

-- Step 1: Disable RLS temporarily to clear all policies
ALTER TABLE user_profiles DISABLE ROW LEVEL SECURITY;

-- Step 2: Drop ALL existing policies on user_profiles table
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

-- Step 3: Re-enable RLS
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Step 4: Create simple, working policies using UUID comparison
-- Policy for SELECT (read own profile)
CREATE POLICY "Users can view own profile" ON user_profiles
FOR SELECT USING (
    auth.uid()::text = id::text
);

-- Policy for INSERT (create own profile)
CREATE POLICY "Users can insert own profile" ON user_profiles
FOR INSERT WITH CHECK (
    auth.uid()::text = id::text
);

-- Policy for UPDATE (update own profile)
CREATE POLICY "Users can update own profile" ON user_profiles
FOR UPDATE USING (
    auth.uid()::text = id::text
);

-- Policy for DELETE (delete own profile)
CREATE POLICY "Users can delete own profile" ON user_profiles
FOR DELETE USING (
    auth.uid()::text = id::text
);

-- Step 5: Grant necessary permissions
GRANT ALL ON user_profiles TO authenticated;
GRANT USAGE ON SCHEMA public TO authenticated;

-- Step 6: Verify the policies are created
SELECT 
    schemaname, 
    tablename, 
    policyname, 
    permissive, 
    roles, 
    cmd, 
    qual, 
    with_check 
FROM pg_policies 
WHERE tablename = 'user_profiles';

-- Step 7: Test the policies work
-- This should not cause infinite recursion
SELECT COUNT(*) FROM user_profiles LIMIT 1;

-- Step 8: Show current RLS status
SELECT 
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables 
WHERE tablename = 'user_profiles';

-- Step 9: If still having issues, create a completely open policy (temporary)
-- WARNING: This removes all security - only use for testing
-- DROP POLICY IF EXISTS "Allow all authenticated users" ON user_profiles;
-- CREATE POLICY "Allow all authenticated users" ON user_profiles
-- FOR ALL USING (auth.role() = 'authenticated');

-- Step 10: Alternative - completely disable RLS if policies still fail
-- ALTER TABLE user_profiles DISABLE ROW LEVEL SECURITY;
-- GRANT ALL ON user_profiles TO authenticated; 