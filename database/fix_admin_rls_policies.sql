-- Fix Admin RLS Policies
-- This script ensures admin users can view all data in the admin dashboard

-- Drop existing admin policies if they exist
DROP POLICY IF EXISTS "Admins can view all user_profiles" ON public.user_profiles;
DROP POLICY IF EXISTS "Admins can view all verifications" ON public.bpl_apl_verifications;
DROP POLICY IF EXISTS "Admins can view all feedback" ON public.user_feedback;
DROP POLICY IF EXISTS "Admins can update verifications" ON public.bpl_apl_verifications;
DROP POLICY IF EXISTS "Admins can update feedback" ON public.user_feedback;

-- Grant admin access to view all user_profiles
CREATE POLICY "Admins can view all user_profiles" ON public.user_profiles
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.user_profiles 
            WHERE id = auth.uid() AND full_name = 'Admin'
        )
    );

-- Grant admin access to view all verifications
CREATE POLICY "Admins can view all verifications" ON public.bpl_apl_verifications
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.user_profiles 
            WHERE id = auth.uid() AND full_name = 'Admin'
        )
    );

-- Grant admin access to update verifications
CREATE POLICY "Admins can update verifications" ON public.bpl_apl_verifications
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.user_profiles 
            WHERE id = auth.uid() AND full_name = 'Admin'
        )
    );

-- Grant admin access to view all feedback
CREATE POLICY "Admins can view all feedback" ON public.user_feedback
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.user_profiles 
            WHERE id = auth.uid() AND full_name = 'Admin'
        )
    );

-- Grant admin access to update feedback
CREATE POLICY "Admins can update feedback" ON public.user_feedback
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.user_profiles 
            WHERE id = auth.uid() AND full_name = 'Admin'
        )
    );

-- Also grant admin access to other tables that might be used
-- Learning progress
CREATE POLICY "Admins can view all learning progress" ON public.learning_progress
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.user_profiles 
            WHERE id = auth.uid() AND full_name = 'Admin'
        )
    );

-- Study groups
CREATE POLICY "Admins can view all study groups" ON public.study_groups
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.user_profiles 
            WHERE id = auth.uid() AND full_name = 'Admin'
        )
    );

-- Group members
CREATE POLICY "Admins can view all group members" ON public.group_members
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.user_profiles 
            WHERE id = auth.uid() AND full_name = 'Admin'
        )
    );

-- Shared notes
CREATE POLICY "Admins can view all shared notes" ON public.shared_notes
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.user_profiles 
            WHERE id = auth.uid() AND full_name = 'Admin'
        )
    );

-- Shared AI responses
CREATE POLICY "Admins can view all shared ai responses" ON public.shared_ai_responses
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.user_profiles 
            WHERE id = auth.uid() AND full_name = 'Admin'
        )
    );

-- Study sessions
CREATE POLICY "Admins can view all study sessions" ON public.study_sessions
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.user_profiles 
            WHERE id = auth.uid() AND full_name = 'Admin'
        )
    );

-- User preferences
CREATE POLICY "Admins can view all user preferences" ON public.user_preferences
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.user_profiles 
            WHERE id = auth.uid() AND full_name = 'Admin'
        )
    );

-- Verify the policies were created
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual
FROM pg_policies 
WHERE tablename IN ('user_profiles', 'bpl_apl_verifications', 'user_feedback')
ORDER BY tablename, policyname;

-- Show summary
SELECT 
    'Admin RLS Policies Updated Successfully' as status,
    (SELECT COUNT(*) FROM pg_policies WHERE tablename = 'user_profiles' AND policyname LIKE '%Admin%') as user_profiles_policies,
    (SELECT COUNT(*) FROM pg_policies WHERE tablename = 'bpl_apl_verifications' AND policyname LIKE '%Admin%') as verifications_policies,
    (SELECT COUNT(*) FROM pg_policies WHERE tablename = 'user_feedback' AND policyname LIKE '%Admin%') as feedback_policies; 