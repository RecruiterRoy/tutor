-- Admin System Database Schema
-- This includes user feedback, enhanced verification, and admin functionality

-- Enhanced BPL/APL Verification Table
CREATE TABLE IF NOT EXISTS public.bpl_apl_verifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    document_type VARCHAR(20) NOT NULL CHECK (document_type IN ('bpl_card', 'apl_card')),
    document_url TEXT,
    card_number VARCHAR(50),
    verification_status VARCHAR(20) DEFAULT 'pending' CHECK (verification_status IN ('pending', 'approved', 'rejected')),
    admin_notes TEXT,
    verified_by UUID REFERENCES auth.users(id),
    verified_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- User Feedback Table
CREATE TABLE IF NOT EXISTS public.user_feedback (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    subject VARCHAR(200) NOT NULL,
    message TEXT NOT NULL,
    category VARCHAR(50) DEFAULT 'general' CHECK (category IN ('feedback', 'books', 'technical', 'general')),
    status VARCHAR(20) DEFAULT 'unread' CHECK (status IN ('unread', 'read', 'replied')),
    admin_reply TEXT,
    replied_by UUID REFERENCES auth.users(id),
    replied_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add economic_status column to user_profiles if not exists
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'user_profiles' AND column_name = 'economic_status') THEN
        ALTER TABLE public.user_profiles ADD COLUMN economic_status VARCHAR(20) DEFAULT 'Free';
    END IF;
END $$;

-- Add verification_status column to user_profiles if not exists
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'user_profiles' AND column_name = 'verification_status') THEN
        ALTER TABLE public.user_profiles ADD COLUMN verification_status VARCHAR(20) DEFAULT 'pending';
    END IF;
END $$;

-- Enable RLS on new tables
ALTER TABLE public.bpl_apl_verifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_feedback ENABLE ROW LEVEL SECURITY;

-- RLS Policies for bpl_apl_verifications
CREATE POLICY "Users can view own verification" ON public.bpl_apl_verifications
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own verification" ON public.bpl_apl_verifications
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all verifications" ON public.bpl_apl_verifications
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.user_profiles 
            WHERE id = auth.uid() AND full_name = 'Admin'
        )
    );

CREATE POLICY "Admins can update verifications" ON public.bpl_apl_verifications
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.user_profiles 
            WHERE id = auth.uid() AND full_name = 'Admin'
        )
    );

-- RLS Policies for user_feedback
CREATE POLICY "Users can view own feedback" ON public.user_feedback
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own feedback" ON public.user_feedback
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all feedback" ON public.user_feedback
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.user_profiles 
            WHERE id = auth.uid() AND full_name = 'Admin'
        )
    );

CREATE POLICY "Admins can update feedback" ON public.user_feedback
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.user_profiles 
            WHERE id = auth.uid() AND full_name = 'Admin'
        )
    );

-- Functions for admin operations
CREATE OR REPLACE FUNCTION get_verification_stats()
RETURNS TABLE(
    total_pending INTEGER,
    total_approved INTEGER,
    total_rejected INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COUNT(*) FILTER (WHERE verification_status = 'pending')::INTEGER as total_pending,
        COUNT(*) FILTER (WHERE verification_status = 'approved')::INTEGER as total_approved,
        COUNT(*) FILTER (WHERE verification_status = 'rejected')::INTEGER as total_rejected
    FROM public.bpl_apl_verifications;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION get_user_stats()
RETURNS TABLE(
    total_users INTEGER,
    paid_users INTEGER,
    free_users INTEGER,
    verified_users INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COUNT(*)::INTEGER as total_users,
        COUNT(*) FILTER (WHERE economic_status = 'Premium')::INTEGER as paid_users,
        COUNT(*) FILTER (WHERE economic_status != 'Premium')::INTEGER as free_users,
        COUNT(*) FILTER (WHERE verification_status = 'approved')::INTEGER as verified_users
    FROM public.user_profiles;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION get_feedback_stats()
RETURNS TABLE(
    total_messages INTEGER,
    unread_messages INTEGER,
    read_messages INTEGER,
    replied_messages INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COUNT(*)::INTEGER as total_messages,
        COUNT(*) FILTER (WHERE status = 'unread')::INTEGER as unread_messages,
        COUNT(*) FILTER (WHERE status = 'read')::INTEGER as read_messages,
        COUNT(*) FILTER (WHERE status = 'replied')::INTEGER as replied_messages
    FROM public.user_feedback;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant permissions
GRANT ALL ON public.bpl_apl_verifications TO authenticated;
GRANT ALL ON public.user_feedback TO authenticated;
GRANT EXECUTE ON FUNCTION get_verification_stats() TO authenticated;
GRANT EXECUTE ON FUNCTION get_user_stats() TO authenticated;
GRANT EXECUTE ON FUNCTION get_feedback_stats() TO authenticated;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_bpl_apl_verifications_user_id ON public.bpl_apl_verifications(user_id);
CREATE INDEX IF NOT EXISTS idx_bpl_apl_verifications_status ON public.bpl_apl_verifications(verification_status);
CREATE INDEX IF NOT EXISTS idx_user_feedback_user_id ON public.user_feedback(user_id);
CREATE INDEX IF NOT EXISTS idx_user_feedback_status ON public.user_feedback(status);
CREATE INDEX IF NOT EXISTS idx_user_feedback_category ON public.user_feedback(category);

-- Insert admin user (you'll need to create this user manually)
-- This is just a placeholder - you'll need to create an admin user through the registration process
-- and then update their profile to have full_name = 'Admin'

-- Show table creation status
SELECT 
    'Tables created successfully' as status,
    (SELECT COUNT(*) FROM information_schema.tables WHERE table_name = 'bpl_apl_verifications') as verification_table_exists,
    (SELECT COUNT(*) FROM information_schema.tables WHERE table_name = 'user_feedback') as feedback_table_exists; 