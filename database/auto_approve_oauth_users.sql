-- Auto-approve OAuth users and set up triggers
-- This script ensures all OAuth users are automatically approved

-- Function to auto-approve OAuth users
CREATE OR REPLACE FUNCTION auto_approve_oauth_users()
RETURNS TRIGGER AS $$
BEGIN
    -- Check if user is from OAuth provider (Google, GitHub, etc.)
    IF NEW.raw_app_meta_data->>'provider' IS NOT NULL THEN
        -- Auto-approve OAuth users
        NEW.raw_user_meta_data = COALESCE(NEW.raw_user_meta_data, '{}'::jsonb) || 
            '{"verification_status": "approved", "economic_status": "Premium"}'::jsonb;
        
        -- Log the auto-approval
        RAISE NOTICE 'Auto-approved OAuth user: % (provider: %)', NEW.email, NEW.raw_app_meta_data->>'provider';
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to auto-approve OAuth users on auth.users insert
DROP TRIGGER IF EXISTS auto_approve_oauth_trigger ON auth.users;
CREATE TRIGGER auto_approve_oauth_trigger
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION auto_approve_oauth_users();

-- Function to create user profile with auto-approval for OAuth users
CREATE OR REPLACE FUNCTION create_oauth_user_profile()
RETURNS TRIGGER AS $$
BEGIN
    -- Check if this is an OAuth user
    IF NEW.raw_app_meta_data->>'provider' IS NOT NULL THEN
        -- Insert into user_profiles with approved status
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
            'approved', -- Auto-approve OAuth users
            NOW(),
            NOW()
        );
        
        RAISE NOTICE 'Created auto-approved profile for OAuth user: %', NEW.email;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to create user profile for OAuth users
DROP TRIGGER IF EXISTS create_oauth_profile_trigger ON auth.users;
CREATE TRIGGER create_oauth_profile_trigger
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION create_oauth_user_profile();

-- Update existing OAuth users to approved status
UPDATE public.user_profiles 
SET verification_status = 'approved', 
    economic_status = 'Premium',
    updated_at = NOW()
WHERE id IN (
    SELECT id FROM auth.users 
    WHERE raw_app_meta_data->>'provider' IS NOT NULL
);

-- Grant necessary permissions
GRANT EXECUTE ON FUNCTION auto_approve_oauth_users() TO authenticated;
GRANT EXECUTE ON FUNCTION create_oauth_user_profile() TO authenticated;

-- Add comment for documentation
COMMENT ON FUNCTION auto_approve_oauth_users() IS 'Automatically approves users who register via OAuth providers (Google, GitHub, etc.)';
COMMENT ON FUNCTION create_oauth_user_profile() IS 'Creates user profile with approved status for OAuth users'; 