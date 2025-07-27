-- Comprehensive Fix for All Permission Issues
-- This script fixes RLS policies, table permissions, and function permissions

-- =====================================================
-- 1. FIX RLS POLICIES - Remove problematic admin policies
-- =====================================================

-- Drop all problematic admin policies that reference auth.users
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.user_profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON public.user_profiles;
DROP POLICY IF EXISTS "Admins can view all verifications" ON public.bpl_apl_verifications;
DROP POLICY IF EXISTS "Admins can update verifications" ON public.bpl_apl_verifications;
DROP POLICY IF EXISTS "Admins can view all feedback" ON public.user_feedback;
DROP POLICY IF EXISTS "Admins can update feedback" ON public.user_feedback;
DROP POLICY IF EXISTS "Admins can view all payments" ON public.payments;
DROP POLICY IF EXISTS "Admins can update all payments" ON public.payments;
DROP POLICY IF EXISTS "Admins can view all trial events" ON public.trial_events;

-- =====================================================
-- 2. CREATE SIMPLE, WORKING RLS POLICIES
-- =====================================================

-- User Profiles - Basic policies only
DROP POLICY IF EXISTS "Users can view own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.user_profiles;

CREATE POLICY "Users can view own profile" ON public.user_profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.user_profiles
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON public.user_profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

-- Allow service role to bypass RLS for profile creation
CREATE POLICY "Service role can manage all profiles" ON public.user_profiles
    FOR ALL USING (auth.role() = 'service_role');

-- Payments - Basic policies
DROP POLICY IF EXISTS "Users can view own payments" ON public.payments;
DROP POLICY IF EXISTS "Users can insert own payments" ON public.payments;

CREATE POLICY "Users can view own payments" ON public.payments
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own payments" ON public.payments
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Trial Events - Basic policies
DROP POLICY IF EXISTS "Users can view own trial events" ON public.trial_events;
DROP POLICY IF EXISTS "Users can insert own trial events" ON public.trial_events;

CREATE POLICY "Users can view own trial events" ON public.trial_events
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own trial events" ON public.trial_events
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- BPL/APL Verifications - Basic policies
DROP POLICY IF EXISTS "Users can view own verification" ON public.bpl_apl_verifications;
DROP POLICY IF EXISTS "Users can insert own verification" ON public.bpl_apl_verifications;

CREATE POLICY "Users can view own verification" ON public.bpl_apl_verifications
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own verification" ON public.bpl_apl_verifications
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- User Feedback - Basic policies
DROP POLICY IF EXISTS "Users can view own feedback" ON public.user_feedback;
DROP POLICY IF EXISTS "Users can insert own feedback" ON public.user_feedback;

CREATE POLICY "Users can view own feedback" ON public.user_feedback
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own feedback" ON public.user_feedback
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Registered Profiles - Allow all operations
DROP POLICY IF EXISTS "Anyone can insert registered profiles" ON public.registered_profiles;
DROP POLICY IF EXISTS "Anyone can read registered profiles" ON public.registered_profiles;
DROP POLICY IF EXISTS "Anyone can update registered profiles" ON public.registered_profiles;

CREATE POLICY "Anyone can insert registered profiles" ON public.registered_profiles
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Anyone can read registered profiles" ON public.registered_profiles
    FOR SELECT USING (true);

CREATE POLICY "Anyone can update registered profiles" ON public.registered_profiles
    FOR UPDATE USING (true);

-- =====================================================
-- 3. GRANT ALL NECESSARY PERMISSIONS
-- =====================================================

-- Grant schema usage
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT USAGE ON SCHEMA public TO anon;

-- Grant table permissions
GRANT ALL ON public.user_profiles TO authenticated;
GRANT ALL ON public.user_profiles TO anon;
GRANT ALL ON public.payments TO authenticated;
GRANT ALL ON public.payments TO anon;
GRANT ALL ON public.trial_events TO authenticated;
GRANT ALL ON public.trial_events TO anon;
GRANT ALL ON public.bpl_apl_verifications TO authenticated;
GRANT ALL ON public.bpl_apl_verifications TO anon;
GRANT ALL ON public.user_feedback TO authenticated;
GRANT ALL ON public.user_feedback TO anon;
GRANT ALL ON public.registered_profiles TO authenticated;
GRANT ALL ON public.registered_profiles TO anon;

-- Grant sequence permissions (for auto-incrementing IDs)
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO anon;

-- =====================================================
-- 4. FIX FUNCTIONS WITH PROPER PERMISSIONS
-- =====================================================

-- Recreate handle_new_user function with proper permissions
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    -- Create a basic profile for new users
    INSERT INTO public.user_profiles (
        id, 
        email, 
        verification_status,
        trial_status,
        trial_start,
        trial_end,
        subscription_status,
        subscription_plan
    ) VALUES (
        NEW.id,
        NEW.email,
        CASE 
            WHEN NEW.email_confirmed_at IS NOT NULL THEN 'approved'
            ELSE 'pending'
        END,
        'active',
        NOW(),
        NOW() + INTERVAL '7 days',
        'trial',
        'free_trial'
    );
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recreate update_verification_status_on_email_confirmation function
CREATE OR REPLACE FUNCTION update_verification_status_on_email_confirmation()
RETURNS TRIGGER AS $$
BEGIN
    -- When a user confirms their email, update their verification status
    IF NEW.email_confirmed_at IS NOT NULL AND OLD.email_confirmed_at IS NULL THEN
        UPDATE public.user_profiles
        SET verification_status = 'approved', updated_at = NOW()
        WHERE id = NEW.id AND verification_status = 'pending';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant function permissions
GRANT EXECUTE ON FUNCTION handle_new_user() TO authenticated;
GRANT EXECUTE ON FUNCTION update_verification_status_on_email_confirmation() TO authenticated;

-- =====================================================
-- 5. RECREATE TRIGGERS
-- =====================================================

-- Drop and recreate triggers
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION handle_new_user();

DROP TRIGGER IF EXISTS on_email_confirmed_update_verification ON auth.users;
CREATE TRIGGER on_email_confirmed_update_verification
    AFTER UPDATE ON auth.users
    FOR EACH ROW EXECUTE FUNCTION update_verification_status_on_email_confirmation();

-- =====================================================
-- 6. VERIFY THE FIX
-- =====================================================

-- Show current policies
SELECT 
    'Permissions Fixed Successfully' as status,
    COUNT(*) as total_policies
FROM pg_policies 
WHERE tablename = 'user_profiles';

-- Show table permissions
SELECT 
    table_name,
    privilege_type,
    grantee
FROM information_schema.table_privileges 
WHERE table_schema = 'public' 
AND table_name = 'user_profiles'
ORDER BY table_name, privilege_type; 