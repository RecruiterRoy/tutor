-- FINAL REGISTRATION FIX
-- This script completely removes all conflicting functions and creates a clean system
-- Run this in your Supabase SQL Editor

-- =====================================================
-- 1. CLEAN UP ALL CONFLICTING FUNCTIONS AND TRIGGERS
-- =====================================================

-- Drop ALL triggers that might conflict
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP TRIGGER IF EXISTS on_email_confirmed_update_verification ON auth.users;

-- Drop ALL functions that might conflict
DROP FUNCTION IF EXISTS handle_new_user();
DROP FUNCTION IF EXISTS update_verification_status_on_email_confirmation();
DROP FUNCTION IF EXISTS manual_confirm_email(VARCHAR);

-- =====================================================
-- 2. CREATE CLEAN, SIMPLE FUNCTIONS
-- =====================================================

-- Simple manual email confirmation function
CREATE OR REPLACE FUNCTION manual_confirm_email(user_email VARCHAR)
RETURNS VOID AS $$
BEGIN
    -- Update auth.users table
    UPDATE auth.users 
    SET email_confirmed_at = NOW() 
    WHERE email = user_email;
    
    -- Update user_profiles table
    UPDATE public.user_profiles 
    SET verification_status = 'approved' 
    WHERE email = user_email;
    
    RAISE NOTICE 'Email confirmed for user: %', user_email;
EXCEPTION
    WHEN OTHERS THEN
        RAISE WARNING 'Error confirming email: %', SQLERRM;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Simple trigger function that doesn't conflict
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    -- Only create a minimal profile, let client handle the rest
    INSERT INTO public.user_profiles (id, email, verification_status)
    VALUES (NEW.id, NEW.email, 'pending')
    ON CONFLICT (id) DO NOTHING; -- Don't fail if profile already exists
    RETURN NEW;
EXCEPTION
    WHEN OTHERS THEN
        -- Log the error but don't fail the user creation
        RAISE WARNING 'Error creating user profile: %', SQLERRM;
        RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- 3. CREATE TRIGGER (OPTIONAL - CAN BE DISABLED)
-- =====================================================

-- Create trigger but make it very simple
CREATE TRIGGER on_auth_user_created 
    AFTER INSERT ON auth.users 
    FOR EACH ROW 
    EXECUTE FUNCTION handle_new_user();

-- =====================================================
-- 4. SET UP PROPER PERMISSIONS
-- =====================================================

-- Grant function permissions
GRANT EXECUTE ON FUNCTION manual_confirm_email(VARCHAR) TO authenticated, anon;
GRANT EXECUTE ON FUNCTION handle_new_user() TO authenticated;

-- =====================================================
-- 5. ENSURE TABLE STRUCTURE IS CORRECT
-- =====================================================

-- Add missing columns if they don't exist
DO $$ 
BEGIN
    -- Add verification_status column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'user_profiles' 
        AND column_name = 'verification_status'
    ) THEN
        ALTER TABLE public.user_profiles 
        ADD COLUMN verification_status VARCHAR(20) DEFAULT 'pending';
    END IF;
    
    -- Add economic_status column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'user_profiles' 
        AND column_name = 'economic_status'
    ) THEN
        ALTER TABLE public.user_profiles 
        ADD COLUMN economic_status VARCHAR(20) DEFAULT 'Free';
    END IF;
    
    -- Add preferred_language column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'user_profiles' 
        AND column_name = 'preferred_language'
    ) THEN
        ALTER TABLE public.user_profiles 
        ADD COLUMN preferred_language VARCHAR(10) DEFAULT 'English';
    END IF;
    
    -- Add avatar column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'user_profiles' 
        AND column_name = 'avatar'
    ) THEN
        ALTER TABLE public.user_profiles 
        ADD COLUMN avatar VARCHAR(255) DEFAULT 'teacher-avatar1.png';
    END IF;
END $$;

-- =====================================================
-- 6. SET UP RLS POLICIES
-- =====================================================

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.user_profiles;

-- Create simple, working policies
CREATE POLICY "Users can view own profile" ON public.user_profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.user_profiles
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON public.user_profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

-- Enable RLS
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

-- Grant table permissions
GRANT ALL ON public.user_profiles TO authenticated;

-- =====================================================
-- 7. VERIFICATION
-- =====================================================

-- Show what we created
SELECT 'Functions created:' as info;
SELECT routine_name, routine_type 
FROM information_schema.routines 
WHERE routine_name IN ('manual_confirm_email', 'handle_new_user');

SELECT 'Triggers created:' as info;
SELECT trigger_name, event_manipulation 
FROM information_schema.triggers 
WHERE trigger_name = 'on_auth_user_created';

SELECT 'Policies created:' as info;
SELECT policyname, cmd, qual 
FROM pg_policies 
WHERE tablename = 'user_profiles';

-- =====================================================
-- 8. TEST DATA (OPTIONAL)
-- =====================================================

-- Show current user_profiles structure
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'user_profiles' 
ORDER BY ordinal_position; 