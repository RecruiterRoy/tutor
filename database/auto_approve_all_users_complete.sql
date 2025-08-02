-- Complete Auto-Approve System for All Users
-- This script ensures ALL users are automatically approved regardless of registration method

-- 1. Fix the manual_confirm_email function with proper search_path
CREATE OR REPLACE FUNCTION manual_confirm_email(user_email TEXT)
RETURNS VOID AS $$
BEGIN
    -- Update the auth.users table to mark email as confirmed
    UPDATE auth.users 
    SET email_confirmed_at = NOW(),
        updated_at = NOW()
    WHERE email = user_email;
    
    -- Update user_profiles to set verification status to approved
    UPDATE public.user_profiles 
    SET verification_status = 'approved',
        economic_status = 'Premium',
        updated_at = NOW()
    WHERE email = user_email;
    
    -- Log the confirmation
    RAISE NOTICE 'Email confirmed and user approved: %', user_email;
    
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Error confirming email for %: %', user_email, SQLERRM;
        RAISE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 2. Function to auto-approve ALL users regardless of registration method
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
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 3. Function to create user profile with instant approval for ALL users
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
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 4. Create triggers to auto-approve all users
DROP TRIGGER IF EXISTS auto_approve_all_users_trigger ON auth.users;
CREATE TRIGGER auto_approve_all_users_trigger
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION auto_approve_all_users();

DROP TRIGGER IF EXISTS create_instant_approved_profile_trigger ON auth.users;
CREATE TRIGGER create_instant_approved_profile_trigger
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION create_instant_approved_profile();

-- 5. Update ALL existing users to approved status
UPDATE public.user_profiles 
SET verification_status = 'approved', 
    economic_status = 'Premium',
    ai_avatar = COALESCE(ai_avatar, 'roy-sir'),
    updated_at = NOW()
WHERE verification_status != 'approved' OR economic_status != 'Premium';

-- 6. Update auth.users to confirm emails for all users
UPDATE auth.users 
SET email_confirmed_at = COALESCE(email_confirmed_at, NOW()),
    updated_at = NOW()
WHERE email_confirmed_at IS NULL;

-- 7. Ensure all users have ai_avatar set
UPDATE public.user_profiles 
SET ai_avatar = 'roy-sir'
WHERE ai_avatar IS NULL;

-- 8. Grant necessary permissions
GRANT EXECUTE ON FUNCTION auto_approve_all_users() TO authenticated;
GRANT EXECUTE ON FUNCTION create_instant_approved_profile() TO authenticated;
GRANT EXECUTE ON FUNCTION manual_confirm_email(TEXT) TO authenticated;

-- 9. Add comments for documentation
COMMENT ON FUNCTION auto_approve_all_users() IS 'Automatically approves ALL users regardless of registration method (email, phone, OAuth)';
COMMENT ON FUNCTION create_instant_approved_profile() IS 'Creates user profile with instant approval for ALL users';
COMMENT ON FUNCTION manual_confirm_email(TEXT) IS 'Manually confirms user email and approves user for instant access';

-- 10. Show current status
SELECT 
    COUNT(*) as total_users,
    COUNT(CASE WHEN verification_status = 'approved' THEN 1 END) as approved_users,
    COUNT(CASE WHEN economic_status = 'Premium' THEN 1 END) as premium_users,
    COUNT(CASE WHEN ai_avatar IS NOT NULL THEN 1 END) as users_with_avatar
FROM public.user_profiles;

-- 11. Show verification status breakdown
SELECT 
    verification_status,
    economic_status,
    COUNT(*) as user_count
FROM public.user_profiles 
GROUP BY verification_status, economic_status
ORDER BY verification_status, economic_status; 