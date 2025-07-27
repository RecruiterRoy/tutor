-- =====================================================
-- COMPLETE DATABASE SCHEMA FOR TUTOR.AI
-- =====================================================
-- This file contains all tables, functions, triggers, and policies
-- needed for the complete tutor application

-- =====================================================
-- 1. USER PROFILES TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS public.user_profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name VARCHAR(255),
    email VARCHAR(255),
    class VARCHAR(20),
    board VARCHAR(100),
    board_abbr VARCHAR(10),
    phone VARCHAR(20),
    city VARCHAR(100),
    state VARCHAR(100),
    preferred_language VARCHAR(10) DEFAULT 'English',
    avatar VARCHAR(255) DEFAULT 'teacher-avatar1.png',
    economic_status VARCHAR(50) DEFAULT 'Premium',
    verification_status VARCHAR(50) DEFAULT 'pending',
    role VARCHAR(20) DEFAULT 'user',
    subscription_status VARCHAR(20) DEFAULT 'trial',
    subscription_plan VARCHAR(50) DEFAULT 'free_trial',
    subscription_start TIMESTAMPTZ,
    subscription_end TIMESTAMPTZ,
    payment_method VARCHAR(50),
    last_payment_date TIMESTAMPTZ,
    trial_start TIMESTAMPTZ,
    trial_end TIMESTAMPTZ,
    trial_status VARCHAR(20) DEFAULT 'not_started',
    conversion_date TIMESTAMPTZ,
    last_reminder_sent TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 2. PAYMENTS TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS public.payments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    razorpay_order_id VARCHAR(255) UNIQUE NOT NULL,
    razorpay_payment_id VARCHAR(255),
    razorpay_signature VARCHAR(255),
    amount INTEGER NOT NULL, -- Amount in paise
    currency VARCHAR(10) DEFAULT 'INR',
    plan_type VARCHAR(50) DEFAULT 'monthly',
    status VARCHAR(20) DEFAULT 'pending', -- pending, completed, failed, refunded
    created_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 3. TRIAL EVENTS TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS public.trial_events (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    event_type VARCHAR(50) NOT NULL, -- trial_started, trial_expired, converted, reminder_sent
    event_data JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 4. BPL/APL VERIFICATIONS TABLE
-- =====================================================

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

-- =====================================================
-- 5. USER FEEDBACK TABLE
-- =====================================================

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

-- =====================================================
-- 6. REGISTERED PROFILES TABLE (for email verification)
-- =====================================================

CREATE TABLE IF NOT EXISTS public.registered_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    temp_user_id TEXT NOT NULL,
    email VARCHAR(255) NOT NULL,
    full_name VARCHAR(255),
    class VARCHAR(20),
    board VARCHAR(100),
    phone VARCHAR(20),
    city VARCHAR(100),
    state VARCHAR(100),
    preferred_language VARCHAR(10) DEFAULT 'en',
    registration_method VARCHAR(20) DEFAULT 'email',
    verification_status VARCHAR(20) DEFAULT 'pending',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 7. ENABLE ROW LEVEL SECURITY
-- =====================================================

ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trial_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bpl_apl_verifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.registered_profiles ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- 8. RLS POLICIES
-- =====================================================

-- User Profiles Policies
CREATE POLICY "Users can view own profile" ON public.user_profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.user_profiles
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON public.user_profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Admins can view all profiles" ON public.user_profiles
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.user_profiles 
            WHERE id = auth.uid() AND full_name LIKE '%Admin%'
        )
    );

CREATE POLICY "Admins can update all profiles" ON public.user_profiles
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.user_profiles 
            WHERE id = auth.uid() AND full_name LIKE '%Admin%'
        )
    );

-- Payments Policies
CREATE POLICY "Users can view own payments" ON public.payments
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own payments" ON public.payments
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all payments" ON public.payments
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.user_profiles 
            WHERE id = auth.uid() AND full_name LIKE '%Admin%'
        )
    );

CREATE POLICY "Admins can update all payments" ON public.payments
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.user_profiles 
            WHERE id = auth.uid() AND full_name LIKE '%Admin%'
        )
    );

-- Trial Events Policies
CREATE POLICY "Users can view own trial events" ON public.trial_events
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own trial events" ON public.trial_events
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all trial events" ON public.trial_events
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.user_profiles 
            WHERE id = auth.uid() AND full_name LIKE '%Admin%'
        )
    );

-- BPL/APL Verifications Policies
CREATE POLICY "Users can view own verification" ON public.bpl_apl_verifications
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own verification" ON public.bpl_apl_verifications
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all verifications" ON public.bpl_apl_verifications
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.user_profiles 
            WHERE id = auth.uid() AND full_name LIKE '%Admin%'
        )
    );

CREATE POLICY "Admins can update verifications" ON public.bpl_apl_verifications
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.user_profiles 
            WHERE id = auth.uid() AND full_name LIKE '%Admin%'
        )
    );

-- User Feedback Policies
CREATE POLICY "Users can view own feedback" ON public.user_feedback
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own feedback" ON public.user_feedback
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all feedback" ON public.user_feedback
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.user_profiles 
            WHERE id = auth.uid() AND full_name LIKE '%Admin%'
        )
    );

CREATE POLICY "Admins can update feedback" ON public.user_feedback
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.user_profiles 
            WHERE id = auth.uid() AND full_name LIKE '%Admin%'
        )
    );

-- Registered Profiles Policies
CREATE POLICY "Anyone can insert registered profiles" ON public.registered_profiles
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Anyone can read registered profiles" ON public.registered_profiles
    FOR SELECT USING (true);

CREATE POLICY "Anyone can update registered profiles" ON public.registered_profiles
    FOR UPDATE USING (true);

-- =====================================================
-- 9. FUNCTIONS
-- =====================================================

-- Get User Profile Function
CREATE OR REPLACE FUNCTION get_user_profile(user_id UUID DEFAULT auth.uid())
RETURNS TABLE(
    id UUID,
    full_name VARCHAR,
    class VARCHAR,
    board VARCHAR,
    board_abbr VARCHAR,
    phone VARCHAR,
    city VARCHAR,
    state VARCHAR,
    preferred_language VARCHAR,
    created_at TIMESTAMPTZ
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        up.id,
        up.full_name,
        up.class,
        up.board,
        up.board_abbr,
        up.phone,
        up.city,
        up.state,
        up.preferred_language,
        up.created_at
    FROM public.user_profiles up
    WHERE up.id = user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update User Profile Function
CREATE OR REPLACE FUNCTION update_user_profile(
    user_id UUID DEFAULT auth.uid(),
    user_full_name VARCHAR DEFAULT NULL,
    user_class VARCHAR DEFAULT NULL,
    user_board VARCHAR DEFAULT NULL,
    user_board_abbr VARCHAR DEFAULT NULL,
    user_phone VARCHAR DEFAULT NULL,
    user_city VARCHAR DEFAULT NULL,
    user_state VARCHAR DEFAULT NULL,
    user_language VARCHAR DEFAULT NULL
)
RETURNS VOID AS $$
BEGIN
    INSERT INTO public.user_profiles (
        id, full_name, class, board, board_abbr, phone, city, state, preferred_language
    ) VALUES (
        user_id, user_full_name, user_class, user_board, user_board_abbr, 
        user_phone, user_city, user_state, user_language
    )
    ON CONFLICT (id) DO UPDATE SET
        full_name = COALESCE(user_full_name, user_profiles.full_name),
        class = COALESCE(user_class, user_profiles.class),
        board = COALESCE(user_board, user_profiles.board),
        board_abbr = COALESCE(user_board_abbr, user_profiles.board_abbr),
        phone = COALESCE(user_phone, user_profiles.phone),
        city = COALESCE(user_city, user_profiles.city),
        state = COALESCE(user_state, user_profiles.state),
        preferred_language = COALESCE(user_language, user_profiles.preferred_language),
        updated_at = NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Check Trial Status Function
CREATE OR REPLACE FUNCTION check_trial_status(user_id UUID DEFAULT auth.uid())
RETURNS TABLE(
    is_trial_active BOOLEAN,
    trial_days_left INTEGER,
    trial_end_date TIMESTAMPTZ,
    subscription_status VARCHAR,
    subscription_plan VARCHAR
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        CASE 
            WHEN up.trial_status = 'active' 
            AND up.trial_end > NOW() 
            THEN true 
            ELSE false 
        END as is_trial_active,
        CASE 
            WHEN up.trial_end > NOW() 
            THEN EXTRACT(DAY FROM (up.trial_end - NOW()))::INTEGER
            ELSE 0 
        END as trial_days_left,
        up.trial_end as trial_end_date,
        up.subscription_status,
        up.subscription_plan
    FROM public.user_profiles up
    WHERE up.id = user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Get Trial Conversion Stats Function
CREATE OR REPLACE FUNCTION get_trial_conversion_stats()
RETURNS TABLE(
    total_trials INTEGER,
    active_trials INTEGER,
    expired_trials INTEGER,
    conversions INTEGER,
    conversion_rate NUMERIC
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COUNT(*) as total_trials,
        COUNT(CASE WHEN trial_status = 'active' AND trial_end > NOW() THEN 1 END) as active_trials,
        COUNT(CASE WHEN trial_end < NOW() THEN 1 END) as expired_trials,
        COUNT(CASE WHEN subscription_status = 'active' AND subscription_plan != 'free_trial' THEN 1 END) as conversions,
        ROUND(
            (COUNT(CASE WHEN subscription_status = 'active' AND subscription_plan != 'free_trial' THEN 1 END) * 100.0) / 
            NULLIF(COUNT(CASE WHEN trial_end < NOW() THEN 1 END), 0), 2
        ) as conversion_rate
    FROM public.user_profiles 
    WHERE trial_start IS NOT NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Get Verification Stats Function
CREATE OR REPLACE FUNCTION get_verification_stats()
RETURNS TABLE(
    total_pending INTEGER,
    total_approved INTEGER,
    total_rejected INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COUNT(CASE WHEN verification_status = 'pending' THEN 1 END) as total_pending,
        COUNT(CASE WHEN verification_status = 'approved' THEN 1 END) as total_approved,
        COUNT(CASE WHEN verification_status = 'rejected' THEN 1 END) as total_rejected
    FROM public.user_profiles;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Get User Stats Function
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
        COUNT(*) as total_users,
        COUNT(CASE WHEN subscription_status = 'active' AND subscription_plan != 'free_trial' THEN 1 END) as paid_users,
        COUNT(CASE WHEN subscription_status = 'trial' OR subscription_status = 'free' THEN 1 END) as free_users,
        COUNT(CASE WHEN verification_status = 'approved' THEN 1 END) as verified_users
    FROM public.user_profiles;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Get Feedback Stats Function
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
        COUNT(*) as total_messages,
        COUNT(CASE WHEN status = 'unread' THEN 1 END) as unread_messages,
        COUNT(CASE WHEN status = 'read' THEN 1 END) as read_messages,
        COUNT(CASE WHEN status = 'replied' THEN 1 END) as replied_messages
    FROM public.user_feedback;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Check Subscription Status Function
CREATE OR REPLACE FUNCTION check_subscription_status(user_id UUID DEFAULT auth.uid())
RETURNS TABLE(
    is_active BOOLEAN,
    plan_type VARCHAR(50),
    days_remaining INTEGER,
    subscription_end TIMESTAMPTZ
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        CASE 
            WHEN up.subscription_status = 'active' 
            AND up.subscription_end > NOW() 
            THEN true 
            ELSE false 
        END as is_active,
        up.subscription_plan as plan_type,
        CASE 
            WHEN up.subscription_end > NOW() 
            THEN EXTRACT(DAY FROM (up.subscription_end - NOW()))::INTEGER
            ELSE 0 
        END as days_remaining,
        up.subscription_end
    FROM public.user_profiles up
    WHERE up.id = user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Move Registered Profile Function
CREATE OR REPLACE FUNCTION move_registered_profile_to_user_profiles(
    user_email VARCHAR,
    auth_user_id UUID
)
RETURNS VOID AS $$
DECLARE
    reg_data RECORD;
BEGIN
    -- Get the registered profile data
    SELECT * INTO reg_data
    FROM public.registered_profiles
    WHERE email = user_email AND verification_status = 'pending'
    LIMIT 1;
    
    IF FOUND THEN
        -- Insert into user_profiles
        INSERT INTO public.user_profiles (
            id, full_name, class, board, phone, city, state, preferred_language, created_at, updated_at
        ) VALUES (
            auth_user_id,
            reg_data.full_name,
            reg_data.class,
            reg_data.board,
            reg_data.phone,
            reg_data.city,
            reg_data.state,
            reg_data.preferred_language,
            reg_data.created_at,
            NOW()
        );
        
        -- Mark as moved
        UPDATE public.registered_profiles
        SET verification_status = 'moved', updated_at = NOW()
        WHERE id = reg_data.id;
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Handle Email Verification Function
CREATE OR REPLACE FUNCTION handle_email_verification()
RETURNS TRIGGER AS $$
BEGIN
    -- When a user confirms their email, move their registration data
    IF NEW.email_confirmed_at IS NOT NULL AND OLD.email_confirmed_at IS NULL THEN
        PERFORM move_registered_profile_to_user_profiles(NEW.email, NEW.id);
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update Verification Status Function
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

-- Handle New User Function
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

-- Log Trial Event Function
CREATE OR REPLACE FUNCTION log_trial_event()
RETURNS TRIGGER AS $$
BEGIN
    -- Log trial status changes
    IF OLD.trial_status != NEW.trial_status THEN
        INSERT INTO public.trial_events (user_id, event_type, event_data)
        VALUES (
            NEW.id,
            'trial_status_changed',
            jsonb_build_object(
                'old_status', OLD.trial_status,
                'new_status', NEW.trial_status,
                'trial_end', NEW.trial_end
            )
        );
    END IF;
    
    -- Log trial expiration
    IF OLD.trial_end > NOW() AND NEW.trial_end <= NOW() THEN
        INSERT INTO public.trial_events (user_id, event_type, event_data)
        VALUES (
            NEW.id,
            'trial_expired',
            jsonb_build_object('trial_end', NEW.trial_end)
        );
    END IF;
    
    -- Log conversions
    IF OLD.subscription_status != 'active' AND NEW.subscription_status = 'active' THEN
        INSERT INTO public.trial_events (user_id, event_type, event_data)
        VALUES (
            NEW.id,
            'converted',
            jsonb_build_object(
                'plan', NEW.subscription_plan,
                'conversion_date', NOW()
            )
        );
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update Updated At Column Function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Assign User Class Access Function
CREATE OR REPLACE FUNCTION assign_user_class_access(
    p_user_id UUID,
    p_class_name VARCHAR,
    p_subjects TEXT[] DEFAULT NULL,
    p_languages TEXT[] DEFAULT ARRAY['English']
)
RETURNS BOOLEAN AS $$
BEGIN
    -- This function can be extended for class-specific access control
    -- For now, return true to indicate success
    RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Get Class Books Function
CREATE OR REPLACE FUNCTION get_class_books(
    p_class_name VARCHAR,
    p_subject VARCHAR DEFAULT NULL,
    p_language VARCHAR DEFAULT 'English'
)
RETURNS TABLE(
    id INTEGER,
    class_name VARCHAR,
    subject VARCHAR,
    language VARCHAR,
    book_name VARCHAR,
    chapter_number INTEGER,
    chapter_name VARCHAR,
    file_path TEXT,
    file_size BIGINT
) AS $$
BEGIN
    -- This function can be extended to return actual book data
    -- For now, return empty result
    RETURN;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- 10. TRIGGERS
-- =====================================================

-- Trigger for new user creation
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Trigger for email verification
DROP TRIGGER IF EXISTS on_email_confirmed ON auth.users;
CREATE TRIGGER on_email_confirmed
    AFTER UPDATE ON auth.users
    FOR EACH ROW EXECUTE FUNCTION handle_email_verification();

-- Trigger for email confirmation verification status update
DROP TRIGGER IF EXISTS on_email_confirmed_update_verification ON auth.users;
CREATE TRIGGER on_email_confirmed_update_verification
    AFTER UPDATE ON auth.users
    FOR EACH ROW EXECUTE FUNCTION update_verification_status_on_email_confirmation();

-- Trigger for trial events
DROP TRIGGER IF EXISTS trial_event_trigger ON public.user_profiles;
CREATE TRIGGER trial_event_trigger
    AFTER UPDATE ON public.user_profiles
    FOR EACH ROW
    EXECUTE FUNCTION log_trial_event();

-- Trigger for updated_at column
DROP TRIGGER IF EXISTS update_updated_at_trigger ON public.user_profiles;
CREATE TRIGGER update_updated_at_trigger
    BEFORE UPDATE ON public.user_profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- 11. INDEXES
-- =====================================================

-- User Profiles Indexes
CREATE INDEX IF NOT EXISTS idx_user_profiles_id ON public.user_profiles(id);
CREATE INDEX IF NOT EXISTS idx_user_profiles_class ON public.user_profiles(class);
CREATE INDEX IF NOT EXISTS idx_user_profiles_board ON public.user_profiles(board);
CREATE INDEX IF NOT EXISTS idx_user_profiles_verification_status ON public.user_profiles(verification_status);
CREATE INDEX IF NOT EXISTS idx_user_profiles_subscription_status ON public.user_profiles(subscription_status);
CREATE INDEX IF NOT EXISTS idx_user_profiles_trial_end ON public.user_profiles(trial_end);
CREATE INDEX IF NOT EXISTS idx_user_profiles_trial_status ON public.user_profiles(trial_status);

-- Payments Indexes
CREATE INDEX IF NOT EXISTS idx_payments_user_id ON public.payments(user_id);
CREATE INDEX IF NOT EXISTS idx_payments_order_id ON public.payments(razorpay_order_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON public.payments(status);
CREATE INDEX IF NOT EXISTS idx_payments_created_at ON public.payments(created_at);

-- Trial Events Indexes
CREATE INDEX IF NOT EXISTS idx_trial_events_user_id ON public.trial_events(user_id);
CREATE INDEX IF NOT EXISTS idx_trial_events_event_type ON public.trial_events(event_type);

-- BPL/APL Verifications Indexes
CREATE INDEX IF NOT EXISTS idx_bpl_apl_verifications_user_id ON public.bpl_apl_verifications(user_id);
CREATE INDEX IF NOT EXISTS idx_bpl_apl_verifications_status ON public.bpl_apl_verifications(verification_status);

-- User Feedback Indexes
CREATE INDEX IF NOT EXISTS idx_user_feedback_user_id ON public.user_feedback(user_id);
CREATE INDEX IF NOT EXISTS idx_user_feedback_status ON public.user_feedback(status);
CREATE INDEX IF NOT EXISTS idx_user_feedback_category ON public.user_feedback(category);

-- Registered Profiles Indexes
CREATE INDEX IF NOT EXISTS idx_registered_profiles_email ON public.registered_profiles(email);
CREATE INDEX IF NOT EXISTS idx_registered_profiles_verification_status ON public.registered_profiles(verification_status);
CREATE INDEX IF NOT EXISTS idx_registered_profiles_created_at ON public.registered_profiles(created_at);

-- =====================================================
-- 12. GRANT PERMISSIONS
-- =====================================================

GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON public.user_profiles TO authenticated;
GRANT ALL ON public.payments TO authenticated;
GRANT ALL ON public.trial_events TO authenticated;
GRANT ALL ON public.bpl_apl_verifications TO authenticated;
GRANT ALL ON public.user_feedback TO authenticated;
GRANT ALL ON public.registered_profiles TO authenticated;

GRANT EXECUTE ON FUNCTION get_user_profile(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION update_user_profile(UUID, VARCHAR, VARCHAR, VARCHAR, VARCHAR, VARCHAR, VARCHAR, VARCHAR, VARCHAR) TO authenticated;
GRANT EXECUTE ON FUNCTION check_trial_status(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION get_trial_conversion_stats() TO authenticated;
GRANT EXECUTE ON FUNCTION get_verification_stats() TO authenticated;
GRANT EXECUTE ON FUNCTION get_user_stats() TO authenticated;
GRANT EXECUTE ON FUNCTION get_feedback_stats() TO authenticated;
GRANT EXECUTE ON FUNCTION check_subscription_status(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION move_registered_profile_to_user_profiles(VARCHAR, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION handle_email_verification() TO authenticated;
GRANT EXECUTE ON FUNCTION update_verification_status_on_email_confirmation() TO authenticated;
GRANT EXECUTE ON FUNCTION handle_new_user() TO authenticated;
GRANT EXECUTE ON FUNCTION log_trial_event() TO authenticated;
GRANT EXECUTE ON FUNCTION update_updated_at_column() TO authenticated;
GRANT EXECUTE ON FUNCTION assign_user_class_access(UUID, VARCHAR, TEXT[], TEXT[]) TO authenticated;
GRANT EXECUTE ON FUNCTION get_class_books(VARCHAR, VARCHAR, VARCHAR) TO authenticated;

-- =====================================================
-- 13. CREATE ADMIN USER (Optional)
-- =====================================================

-- Uncomment and modify the following lines to create an admin user
-- You'll need to replace 'admin-email@example.com' with the actual admin email
-- and ensure the user exists in auth.users first

/*
INSERT INTO public.user_profiles (
    id,
    full_name,
    email,
    role,
    verification_status,
    economic_status,
    subscription_status,
    subscription_plan
) VALUES (
    '00000000-0000-0000-0000-000000000000', -- Replace with actual admin user ID
    'Admin User',
    'admin-email@example.com',
    'admin',
    'approved',
    'Premium',
    'active',
    'admin'
) ON CONFLICT (id) DO NOTHING;
*/

-- =====================================================
-- COMPLETE SCHEMA SETUP FINISHED
-- ===================================================== 