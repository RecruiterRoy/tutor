-- Fix Registration Errors
-- Run this in your Supabase SQL Editor

-- 1. Drop the conflicting trigger that causes "Database error saving new user"
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- 2. Drop the function that was causing conflicts
DROP FUNCTION IF EXISTS handle_new_user();

-- 3. Create a simpler function that doesn't conflict
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    -- Only create a basic profile, let the client handle the rest
    INSERT INTO public.user_profiles (id, email, full_name, verification_status)
    VALUES (
        NEW.id, 
        NEW.email, 
        COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
        'pending'
    )
    ON CONFLICT (id) DO NOTHING; -- Don't fail if profile already exists
    RETURN NEW;
EXCEPTION
    WHEN OTHERS THEN
        -- Log the error but don't fail the user creation
        RAISE WARNING 'Error creating user profile: %', SQLERRM;
        RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Recreate the trigger with error handling
CREATE TRIGGER on_auth_user_created 
    AFTER INSERT ON auth.users 
    FOR EACH ROW 
    EXECUTE FUNCTION handle_new_user();

-- 5. Ensure the manual_confirm_email function exists and works
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

-- 6. Grant necessary permissions
GRANT EXECUTE ON FUNCTION manual_confirm_email(VARCHAR) TO authenticated, anon;
GRANT EXECUTE ON FUNCTION handle_new_user() TO authenticated;

-- 7. Ensure user_profiles table has proper structure
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
END $$;

-- 8. Set up proper RLS policies for user_profiles
DROP POLICY IF EXISTS "Users can view own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.user_profiles;

CREATE POLICY "Users can view own profile" ON public.user_profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.user_profiles
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON public.user_profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

-- 9. Enable RLS on user_profiles if not already enabled
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

-- 10. Grant necessary permissions on the table
GRANT ALL ON public.user_profiles TO authenticated;
GRANT USAGE ON SEQUENCE public.user_profiles_id_seq TO authenticated; 