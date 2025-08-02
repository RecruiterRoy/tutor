-- Instant Approval for All Users
-- This script ensures all users (email, phone, OAuth) get instant approval and access

-- Function to auto-approve all users regardless of registration method
CREATE OR REPLACE FUNCTION auto_approve_all_users()
RETURNS TRIGGER AS $$
BEGIN
    -- Auto-approve ALL users regardless of registration method
    NEW.raw_user_meta_data = COALESCE(NEW.raw_user_meta_data, '{}'::jsonb) || 
        '{"verification_status": "approved", "economic_status": "Premium"}'::jsonb;
    
    -- Log the auto-approval
    RAISE NOTICE 'Auto-approved user: % (registration method: %)', NEW.email, COALESCE(NEW.raw_app_meta_data->>'provider', 'email/phone');
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to auto-approve all users on auth.users insert
DROP TRIGGER IF EXISTS auto_approve_all_users_trigger ON auth.users;
CREATE TRIGGER auto_approve_all_users_trigger
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION auto_approve_all_users();

-- Function to create user profile with instant approval for ALL users
CREATE OR REPLACE FUNCTION create_instant_approved_profile()
RETURNS TRIGGER AS $$
BEGIN
    -- Create profile for ALL users with instant approval
    INSERT INTO public.user_profiles (
        id,
        full_name,
        email,
        phone,
        class,
        board,
        preferred_language,
        avatar,
        economic_status,
        verification_status,
        ai_avatar,
        created_at,
        updated_at
    ) VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'full_name', 'Student'),
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'phone', ''),
        COALESCE(NEW.raw_user_meta_data->>'class', 'Class 10'),
        COALESCE(NEW.raw_user_meta_data->>'board', 'CBSE'),
        COALESCE(NEW.raw_user_meta_data->>'preferred_language', 'en'),
        'teacher-avatar1.png',
        'Premium',
        'approved', -- Instant approval for ALL users
        'roy-sir', -- Default AI avatar
        NOW(),
        NOW()
    );
    
    RAISE NOTICE 'Created instant-approved profile for user: %', NEW.email;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to create user profile for ALL users
DROP TRIGGER IF EXISTS create_instant_approved_profile_trigger ON auth.users;
CREATE TRIGGER create_instant_approved_profile_trigger
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION create_instant_approved_profile();

-- Update existing users to approved status (if any are pending)
UPDATE public.user_profiles 
SET verification_status = 'approved', 
    economic_status = 'Premium',
    ai_avatar = COALESCE(ai_avatar, 'roy-sir'),
    updated_at = NOW()
WHERE verification_status != 'approved' OR economic_status != 'Premium';

-- Grant necessary permissions
GRANT EXECUTE ON FUNCTION auto_approve_all_users() TO authenticated;
GRANT EXECUTE ON FUNCTION create_instant_approved_profile() TO authenticated;

-- Add comment for documentation
COMMENT ON FUNCTION auto_approve_all_users() IS 'Automatically approves ALL users regardless of registration method (email, phone, OAuth)';
COMMENT ON FUNCTION create_instant_approved_profile() IS 'Creates user profile with instant approval for ALL users';

-- Ensure RLS policies allow instant access
-- Update or create policy for instant access
DROP POLICY IF EXISTS "Users can view own profile" ON public.user_profiles;
CREATE POLICY "Users can view own profile" ON public.user_profiles
    FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON public.user_profiles;
CREATE POLICY "Users can update own profile" ON public.user_profiles
    FOR UPDATE USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can insert own profile" ON public.user_profiles;
CREATE POLICY "Users can insert own profile" ON public.user_profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

-- Ensure all users have access to chat and other features
-- This ensures no user is blocked from accessing features 