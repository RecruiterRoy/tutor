-- =====================================================
-- FIX USER DATA STORAGE ISSUES
-- =====================================================
-- This script fixes the problem where new user data only goes to auth.users
-- but not to user_profiles and other tables

-- =====================================================
-- 1. CLEAN UP CONFLICTING FUNCTIONS AND TRIGGERS
-- =====================================================

-- Drop all existing triggers that might conflict
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP TRIGGER IF EXISTS on_email_confirmed ON auth.users;
DROP TRIGGER IF EXISTS on_email_confirmed_update_verification ON auth.users;
DROP TRIGGER IF EXISTS auto_approve_all_users_trigger ON auth.users;
DROP TRIGGER IF EXISTS create_instant_approved_profile_trigger ON auth.users;

-- Drop all existing functions
DROP FUNCTION IF EXISTS handle_new_user();
DROP FUNCTION IF EXISTS update_verification_status_on_email_confirmation();
DROP FUNCTION IF EXISTS handle_email_verification();
DROP FUNCTION IF EXISTS manual_confirm_email(VARCHAR);

-- =====================================================
-- 2. CREATE PROPER FUNCTIONS
-- =====================================================

-- Main function to handle new user creation
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    -- Create a basic profile for new users
    INSERT INTO public.user_profiles (
        id, 
        email, 
        full_name,
        verification_status,
        trial_status,
        trial_start,
        trial_end,
        subscription_status,
        subscription_plan,
        economic_status,
        created_at,
        updated_at
    ) VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
        CASE 
            WHEN NEW.email_confirmed_at IS NOT NULL THEN 'approved'
            ELSE 'pending'
        END,
        'active',
        NOW(),
        NOW() + INTERVAL '7 days',
        'trial',
        'free_trial',
        'Premium',
        NOW(),
        NOW()
    )
    ON CONFLICT (id) DO UPDATE SET
        email = EXCLUDED.email,
        full_name = COALESCE(EXCLUDED.full_name, user_profiles.full_name),
        verification_status = EXCLUDED.verification_status,
        updated_at = NOW();
    
    -- Log trial event
    INSERT INTO public.trial_events (user_id, event_type, event_data)
    VALUES (
        NEW.id,
        'trial_started',
        jsonb_build_object(
            'trial_start', NOW(),
            'trial_end', NOW() + INTERVAL '7 days',
            'email', NEW.email
        )
    );
    
    RETURN NEW;
EXCEPTION
    WHEN OTHERS THEN
        -- Log the error but don't fail the user creation
        RAISE WARNING 'Error in handle_new_user for user %: %', NEW.email, SQLERRM;
        RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update verification status when email is confirmed
CREATE OR REPLACE FUNCTION update_verification_status_on_email_confirmation()
RETURNS TRIGGER AS $$
BEGIN
    -- When a user confirms their email, update their verification status
    IF NEW.email_confirmed_at IS NOT NULL AND OLD.email_confirmed_at IS NULL THEN
        UPDATE public.user_profiles
        SET verification_status = 'approved', updated_at = NOW()
        WHERE id = NEW.id;
        
        -- Log the verification event
        INSERT INTO public.trial_events (user_id, event_type, event_data)
        VALUES (
            NEW.id,
            'email_verified',
            jsonb_build_object(
                'verified_at', NOW(),
                'email', NEW.email
            )
        );
    END IF;
    RETURN NEW;
EXCEPTION
    WHEN OTHERS THEN
        RAISE WARNING 'Error in update_verification_status_on_email_confirmation: %', SQLERRM;
        RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Manual email confirmation function
CREATE OR REPLACE FUNCTION manual_confirm_email(user_email VARCHAR)
RETURNS VOID AS $$
BEGIN
    -- Update auth.users table
    UPDATE auth.users 
    SET email_confirmed_at = NOW() 
    WHERE email = user_email;
    
    -- Update user_profiles table
    UPDATE public.user_profiles 
    SET verification_status = 'approved', updated_at = NOW()
    WHERE email = user_email;
    
    RAISE NOTICE 'Email confirmed for user: %', user_email;
EXCEPTION
    WHEN OTHERS THEN
        RAISE WARNING 'Error confirming email: %', SQLERRM;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- 3. CREATE TRIGGERS
-- =====================================================

-- Trigger for new user creation
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Trigger for email confirmation
CREATE TRIGGER on_email_confirmed_update_verification
    AFTER UPDATE ON auth.users
    FOR EACH ROW EXECUTE FUNCTION update_verification_status_on_email_confirmation();

-- =====================================================
-- 4. GRANT PERMISSIONS
-- =====================================================

GRANT EXECUTE ON FUNCTION handle_new_user() TO authenticated, anon;
GRANT EXECUTE ON FUNCTION update_verification_status_on_email_confirmation() TO authenticated, anon;
GRANT EXECUTE ON FUNCTION manual_confirm_email(VARCHAR) TO authenticated, anon;

-- =====================================================
-- 5. MIGRATE EXISTING USERS
-- =====================================================

-- Create profiles for existing users who don't have them
INSERT INTO public.user_profiles (
    id, 
    email, 
    full_name,
    verification_status,
    trial_status,
    trial_start,
    trial_end,
    subscription_status,
    subscription_plan,
    economic_status,
    created_at,
    updated_at
)
SELECT 
    u.id,
    u.email,
    COALESCE(u.raw_user_meta_data->>'full_name', ''),
    CASE 
        WHEN u.email_confirmed_at IS NOT NULL THEN 'approved'
        ELSE 'pending'
    END,
    'active',
    u.created_at,
    u.created_at + INTERVAL '7 days',
    'trial',
    'free_trial',
    'Premium',
    u.created_at,
    NOW()
FROM auth.users u
LEFT JOIN public.user_profiles up ON u.id = up.id
WHERE up.id IS NULL
ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- 6. VERIFY THE FIX
-- =====================================================

-- Check trigger status
SELECT 
    trigger_name,
    event_manipulation,
    action_statement
FROM information_schema.triggers 
WHERE trigger_name IN ('on_auth_user_created', 'on_email_confirmed_update_verification');

-- Check function status
SELECT 
    routine_name,
    routine_type
FROM information_schema.routines 
WHERE routine_name IN ('handle_new_user', 'update_verification_status_on_email_confirmation', 'manual_confirm_email');

-- Show user count comparison
SELECT 
    'auth.users' as table_name,
    COUNT(*) as user_count
FROM auth.users
UNION ALL
SELECT 
    'user_profiles' as table_name,
    COUNT(*) as user_count
FROM public.user_profiles;

-- Show recent users
SELECT 
    u.id,
    u.email,
    u.email_confirmed_at,
    up.verification_status,
    up.created_at as profile_created
FROM auth.users u
LEFT JOIN public.user_profiles up ON u.id = up.id
ORDER BY u.created_at DESC
LIMIT 10; 