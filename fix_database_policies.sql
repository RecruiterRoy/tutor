-- =====================================================
-- COMPREHENSIVE DATABASE FIXES FOR TUTION.APP
-- =====================================================
-- This file fixes RLS policies, removes infinite recursion,
-- and ensures proper database functionality
-- =====================================================

-- =====================================================
-- STEP 1: DROP ALL EXISTING PROBLEMATIC POLICIES
-- =====================================================

-- Drop all existing policies on user_profiles table
DROP POLICY IF EXISTS "Admins can read all payment data" ON user_profiles;
DROP POLICY IF EXISTS "Admins can update payment verification" ON user_profiles;
DROP POLICY IF EXISTS "Allow all operations for anon users" ON user_profiles;
DROP POLICY IF EXISTS "Allow all operations for authenticated users" ON user_profiles;
DROP POLICY IF EXISTS "Users can delete own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can read own payment data" ON user_profiles;
DROP POLICY IF EXISTS "Users can update own payment data" ON user_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON user_profiles;

-- Drop policies on other tables if they exist
DROP POLICY IF EXISTS "Enable read access for all users" ON user_profiles;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON user_profiles;
DROP POLICY IF EXISTS "Enable update for users based on email" ON user_profiles;
DROP POLICY IF EXISTS "Enable delete for users based on user_id" ON user_profiles;

-- =====================================================
-- STEP 2: CREATE HELPER FUNCTIONS
-- =====================================================

-- Create admin check function (avoids recursion)
DROP FUNCTION IF EXISTS is_admin(uuid) CASCADE;
CREATE OR REPLACE FUNCTION is_admin(user_id uuid)
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM auth.users 
    WHERE id = user_id 
    AND raw_user_meta_data->>'role' = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to check if user is verified
DROP FUNCTION IF EXISTS is_user_verified(uuid) CASCADE;
CREATE OR REPLACE FUNCTION is_user_verified(user_id uuid)
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM user_profiles 
    WHERE id = user_id 
    AND verification_status IN ('approved', 'verified')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to manually confirm email (for admin use)
DROP FUNCTION IF EXISTS manual_confirm_email(text) CASCADE;
CREATE OR REPLACE FUNCTION manual_confirm_email(user_email text)
RETURNS void AS $$
BEGIN
  UPDATE user_profiles 
  SET verification_status = 'approved',
      updated_at = NOW()
  WHERE email = user_email;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- STEP 3: DISABLE RLS TEMPORARILY FOR CLEANUP
-- =====================================================

-- Disable RLS on user_profiles table
ALTER TABLE user_profiles DISABLE ROW LEVEL SECURITY;

-- =====================================================
-- STEP 4: ENSURE TABLE STRUCTURE IS CORRECT
-- =====================================================

-- Add missing columns if they don't exist
DO $$ 
BEGIN
    -- Add verification_status column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'user_profiles' AND column_name = 'verification_status') THEN
        ALTER TABLE user_profiles ADD COLUMN verification_status text DEFAULT 'pending';
    END IF;
    
    -- Add economic_status column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'user_profiles' AND column_name = 'economic_status') THEN
        ALTER TABLE user_profiles ADD COLUMN economic_status text DEFAULT 'Free';
    END IF;
    
    -- Add ai_avatar column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'user_profiles' AND column_name = 'ai_avatar') THEN
        ALTER TABLE user_profiles ADD COLUMN ai_avatar text DEFAULT 'roy-sir';
    END IF;
    
    -- Add gender column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'user_profiles' AND column_name = 'gender') THEN
        ALTER TABLE user_profiles ADD COLUMN gender text;
    END IF;
    
    -- Add city column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'user_profiles' AND column_name = 'city') THEN
        ALTER TABLE user_profiles ADD COLUMN city text;
    END IF;
    
    -- Add state column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'user_profiles' AND column_name = 'state') THEN
        ALTER TABLE user_profiles ADD COLUMN state text;
    END IF;
    
    -- Add phone column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'user_profiles' AND column_name = 'phone') THEN
        ALTER TABLE user_profiles ADD COLUMN phone text;
    END IF;
    
    -- Add class column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'user_profiles' AND column_name = 'class') THEN
        ALTER TABLE user_profiles ADD COLUMN class text;
    END IF;
    
    -- Add board column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'user_profiles' AND column_name = 'board') THEN
        ALTER TABLE user_profiles ADD COLUMN board text;
    END IF;
    
    -- Add created_at column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'user_profiles' AND column_name = 'created_at') THEN
        ALTER TABLE user_profiles ADD COLUMN created_at timestamp with time zone DEFAULT NOW();
    END IF;
    
    -- Add updated_at column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'user_profiles' AND column_name = 'updated_at') THEN
        ALTER TABLE user_profiles ADD COLUMN updated_at timestamp with time zone DEFAULT NOW();
    END IF;
END $$;

-- =====================================================
-- STEP 5: CREATE NEW SECURE POLICIES
-- =====================================================

-- Re-enable RLS
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Admin policies (no recursion)
CREATE POLICY "Admins can read all data"
ON user_profiles FOR SELECT
TO authenticated
USING (is_admin(auth.uid()));

CREATE POLICY "Admins can update all data"
ON user_profiles FOR UPDATE
TO authenticated
USING (is_admin(auth.uid()));

CREATE POLICY "Admins can insert data"
ON user_profiles FOR INSERT
TO authenticated
WITH CHECK (is_admin(auth.uid()));

CREATE POLICY "Admins can delete data"
ON user_profiles FOR DELETE
TO authenticated
USING (is_admin(auth.uid()));

-- User policies (self-access only)
CREATE POLICY "Users can view own profile"
ON user_profiles FOR SELECT
TO authenticated
USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
ON user_profiles FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
ON user_profiles FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can delete own profile"
ON user_profiles FOR DELETE
TO authenticated
USING (auth.uid() = id);

-- =====================================================
-- STEP 6: CREATE INDEXES FOR PERFORMANCE
-- =====================================================

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_profiles_email ON user_profiles(email);
CREATE INDEX IF NOT EXISTS idx_user_profiles_verification_status ON user_profiles(verification_status);
CREATE INDEX IF NOT EXISTS idx_user_profiles_economic_status ON user_profiles(economic_status);
CREATE INDEX IF NOT EXISTS idx_user_profiles_created_at ON user_profiles(created_at);

-- =====================================================
-- STEP 7: CREATE TRIGGERS FOR AUTOMATIC UPDATES
-- =====================================================

-- Create trigger function for updated_at
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for user_profiles
DROP TRIGGER IF EXISTS update_user_profiles_updated_at ON user_profiles;
CREATE TRIGGER update_user_profiles_updated_at
    BEFORE UPDATE ON user_profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- STEP 8: CREATE ADDITIONAL HELPER FUNCTIONS
-- =====================================================

-- Function to get user profile by email
DROP FUNCTION IF EXISTS get_user_profile_by_email(text) CASCADE;
CREATE OR REPLACE FUNCTION get_user_profile_by_email(user_email text)
RETURNS TABLE (
    id uuid,
    email text,
    full_name text,
    verification_status text,
    economic_status text,
    ai_avatar text,
    gender text,
    city text,
    state text,
    phone text,
    class text,
    board text,
    created_at timestamp with time zone,
    updated_at timestamp with time zone
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        up.id,
        up.email,
        up.full_name,
        up.verification_status,
        up.economic_status,
        up.ai_avatar,
        up.gender,
        up.city,
        up.state,
        up.phone,
        up.class,
        up.board,
        up.created_at,
        up.updated_at
    FROM user_profiles up
    WHERE up.email = user_email;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to approve user
DROP FUNCTION IF EXISTS approve_user(text) CASCADE;
CREATE OR REPLACE FUNCTION approve_user(user_email text)
RETURNS void AS $$
BEGIN
    UPDATE user_profiles 
    SET verification_status = 'approved',
        economic_status = 'Premium',
        updated_at = NOW()
    WHERE email = user_email;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get user count by status
DROP FUNCTION IF EXISTS get_user_stats() CASCADE;
CREATE OR REPLACE FUNCTION get_user_stats()
RETURNS TABLE (
    total_users bigint,
    verified_users bigint,
    pending_users bigint,
    premium_users bigint,
    free_users bigint
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COUNT(*) as total_users,
        COUNT(*) FILTER (WHERE verification_status IN ('approved', 'verified')) as verified_users,
        COUNT(*) FILTER (WHERE verification_status = 'pending') as pending_users,
        COUNT(*) FILTER (WHERE economic_status = 'Premium') as premium_users,
        COUNT(*) FILTER (WHERE economic_status = 'Free') as free_users
    FROM user_profiles;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- STEP 9: GRANT NECESSARY PERMISSIONS
-- =====================================================

-- Grant permissions to authenticated users
GRANT SELECT, INSERT, UPDATE, DELETE ON user_profiles TO authenticated;

-- Grant execute permissions on functions
GRANT EXECUTE ON FUNCTION is_admin(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION is_user_verified(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION manual_confirm_email(text) TO authenticated;
GRANT EXECUTE ON FUNCTION get_user_profile_by_email(text) TO authenticated;
GRANT EXECUTE ON FUNCTION approve_user(text) TO authenticated;
GRANT EXECUTE ON FUNCTION get_user_stats() TO authenticated;

-- =====================================================
-- STEP 10: VERIFICATION AND TESTING
-- =====================================================

-- Verify policies are created
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check 
FROM pg_policies 
WHERE tablename = 'user_profiles'
ORDER BY policyname;

-- Verify functions are created
SELECT routine_name, routine_type 
FROM information_schema.routines 
WHERE routine_schema = 'public' 
AND routine_name IN ('is_admin', 'is_user_verified', 'manual_confirm_email', 'get_user_profile_by_email', 'approve_user', 'get_user_stats')
ORDER BY routine_name;

-- =====================================================
-- STEP 11: CLEANUP COMMANDS (OPTIONAL)
-- =====================================================

-- If you need to completely reset everything, uncomment these:
-- DROP TABLE IF EXISTS user_profiles CASCADE;
-- DROP FUNCTION IF EXISTS is_admin(uuid) CASCADE;
-- DROP FUNCTION IF EXISTS is_user_verified(uuid) CASCADE;
-- DROP FUNCTION IF EXISTS manual_confirm_email(text) CASCADE;
-- DROP FUNCTION IF EXISTS get_user_profile_by_email(text) CASCADE;
-- DROP FUNCTION IF EXISTS approve_user(text) CASCADE;
-- DROP FUNCTION IF EXISTS get_user_stats() CASCADE;
-- DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;

-- =====================================================
-- COMPLETION MESSAGE
-- =====================================================

-- This script has:
-- 1. ✅ Removed all problematic RLS policies
-- 2. ✅ Created secure, non-recursive policies
-- 3. ✅ Added helper functions for admin checks
-- 4. ✅ Ensured proper table structure
-- 5. ✅ Added performance indexes
-- 6. ✅ Created automatic update triggers
-- 7. ✅ Added utility functions
-- 8. ✅ Set proper permissions
-- 9. ✅ Included verification queries

-- Your database should now work without infinite recursion errors!
-- ===================================================== 