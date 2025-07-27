-- Fix RLS Infinite Recursion Issue
-- This script fixes the infinite recursion problem in user_profiles table policies

-- Drop problematic admin policies that cause infinite recursion
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.user_profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON public.user_profiles;
DROP POLICY IF EXISTS "Admins can view all verifications" ON public.bpl_apl_verifications;
DROP POLICY IF EXISTS "Admins can update verifications" ON public.bpl_apl_verifications;
DROP POLICY IF EXISTS "Admins can view all feedback" ON public.user_feedback;
DROP POLICY IF EXISTS "Admins can update feedback" ON public.user_feedback;
DROP POLICY IF EXISTS "Admins can view all payments" ON public.payments;
DROP POLICY IF EXISTS "Admins can update all payments" ON public.payments;
DROP POLICY IF EXISTS "Admins can view all trial events" ON public.trial_events;

-- Create simplified admin policies that don't cause recursion
-- For user_profiles - allow admins to view all profiles based on email pattern
CREATE POLICY "Admins can view all profiles" ON public.user_profiles
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM auth.users 
            WHERE id = auth.uid() 
            AND email LIKE '%admin%'
        )
    );

CREATE POLICY "Admins can update all profiles" ON public.user_profiles
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM auth.users 
            WHERE id = auth.uid() 
            AND email LIKE '%admin%'
        )
    );

-- For other tables - use the same pattern
CREATE POLICY "Admins can view all verifications" ON public.bpl_apl_verifications
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM auth.users 
            WHERE id = auth.uid() 
            AND email LIKE '%admin%'
        )
    );

CREATE POLICY "Admins can update verifications" ON public.bpl_apl_verifications
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM auth.users 
            WHERE id = auth.uid() 
            AND email LIKE '%admin%'
        )
    );

CREATE POLICY "Admins can view all feedback" ON public.user_feedback
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM auth.users 
            WHERE id = auth.uid() 
            AND email LIKE '%admin%'
        )
    );

CREATE POLICY "Admins can update feedback" ON public.user_feedback
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM auth.users 
            WHERE id = auth.uid() 
            AND email LIKE '%admin%'
        )
    );

CREATE POLICY "Admins can view all payments" ON public.payments
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM auth.users 
            WHERE id = auth.uid() 
            AND email LIKE '%admin%'
        )
    );

CREATE POLICY "Admins can update all payments" ON public.payments
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM auth.users 
            WHERE id = auth.uid() 
            AND email LIKE '%admin%'
        )
    );

CREATE POLICY "Admins can view all trial events" ON public.trial_events
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM auth.users 
            WHERE id = auth.uid() 
            AND email LIKE '%admin%'
        )
    );

-- Also ensure the basic user policies are correct
DROP POLICY IF EXISTS "Users can view own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.user_profiles;

CREATE POLICY "Users can view own profile" ON public.user_profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.user_profiles
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON public.user_profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON public.user_profiles TO authenticated;
GRANT ALL ON public.payments TO authenticated;
GRANT ALL ON public.trial_events TO authenticated;
GRANT ALL ON public.bpl_apl_verifications TO authenticated;
GRANT ALL ON public.user_feedback TO authenticated;

-- Show the fixed policies
SELECT 
    'RLS Infinite Recursion Fixed' as status,
    COUNT(*) as total_policies
FROM pg_policies 
WHERE tablename = 'user_profiles'; 