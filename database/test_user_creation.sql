-- =====================================================
-- TEST USER CREATION AND DATA STORAGE
-- =====================================================
-- This script helps verify that new users are properly saved to all tables

-- =====================================================
-- 1. CHECK CURRENT STATE
-- =====================================================

-- Check current user counts
SELECT 'Current State:' as info;
SELECT 
    'auth.users' as table_name,
    COUNT(*) as user_count
FROM auth.users
UNION ALL
SELECT 
    'user_profiles' as table_name,
    COUNT(*) as user_count
FROM public.user_profiles
UNION ALL
SELECT 
    'trial_events' as table_name,
    COUNT(*) as user_count
FROM public.trial_events;

-- Check recent users and their profile status
SELECT 'Recent Users:' as info;
SELECT 
    u.id,
    u.email,
    u.email_confirmed_at,
    up.verification_status,
    up.trial_status,
    up.created_at as profile_created,
    CASE 
        WHEN up.id IS NULL THEN '❌ NO PROFILE'
        ELSE '✅ HAS PROFILE'
    END as profile_status
FROM auth.users u
LEFT JOIN public.user_profiles up ON u.id = up.id
ORDER BY u.created_at DESC
LIMIT 10;

-- =====================================================
-- 2. CHECK TRIGGER STATUS
-- =====================================================

-- Verify triggers exist
SELECT 'Trigger Status:' as info;
SELECT 
    trigger_name,
    event_manipulation,
    action_statement
FROM information_schema.triggers 
WHERE trigger_name IN ('on_auth_user_created', 'on_email_confirmed_update_verification');

-- Verify functions exist
SELECT 'Function Status:' as info;
SELECT 
    routine_name,
    routine_type
FROM information_schema.routines 
WHERE routine_name IN ('handle_new_user', 'update_verification_status_on_email_confirmation', 'manual_confirm_email');

-- =====================================================
-- 3. MANUAL FIX FOR EXISTING USERS
-- =====================================================

-- If you want to manually create profiles for existing users who don't have them
-- Uncomment and run this section:

/*
-- Create missing profiles for existing users
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

-- Create trial events for existing users
INSERT INTO public.trial_events (user_id, event_type, event_data)
SELECT 
    u.id,
    'trial_started',
    jsonb_build_object(
        'trial_start', u.created_at,
        'trial_end', u.created_at + INTERVAL '7 days',
        'email', u.email,
        'migrated', true
    )
FROM auth.users u
LEFT JOIN public.trial_events te ON u.id = te.user_id AND te.event_type = 'trial_started'
WHERE te.id IS NULL
ON CONFLICT DO NOTHING;
*/

-- =====================================================
-- 4. TEST MANUAL EMAIL CONFIRMATION
-- =====================================================

-- To manually confirm a user's email, use this function:
-- SELECT manual_confirm_email('user@example.com');

-- =====================================================
-- 5. VERIFICATION QUERIES
-- =====================================================

-- Check for users without profiles
SELECT 'Users Missing Profiles:' as info;
SELECT 
    u.id,
    u.email,
    u.created_at
FROM auth.users u
LEFT JOIN public.user_profiles up ON u.id = up.id
WHERE up.id IS NULL;

-- Check for profiles without trial events
SELECT 'Profiles Missing Trial Events:' as info;
SELECT 
    up.id,
    up.email,
    up.created_at
FROM public.user_profiles up
LEFT JOIN public.trial_events te ON up.id = te.user_id AND te.event_type = 'trial_started'
WHERE te.id IS NULL;

-- =====================================================
-- 6. NEXT STEPS
-- =====================================================

/*
After running the fix_user_data_storage.sql script:

1. Register a new test user
2. Check if they appear in user_profiles table
3. Check if trial_events are created
4. Test email confirmation
5. Verify verification_status updates

If issues persist, check the Supabase logs for any errors.
*/ 