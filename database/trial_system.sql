-- Trial System Database Schema for TUTOR.AI

-- First, let's check what columns exist in user_profiles and add missing ones
DO $$ 
BEGIN
    -- Add subscription_status column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'user_profiles' AND column_name = 'subscription_status') THEN
        ALTER TABLE public.user_profiles ADD COLUMN subscription_status VARCHAR(20) DEFAULT 'trial';
    END IF;
    
    -- Add subscription_plan column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'user_profiles' AND column_name = 'subscription_plan') THEN
        ALTER TABLE public.user_profiles ADD COLUMN subscription_plan VARCHAR(50) DEFAULT 'free_trial';
    END IF;
    
    -- Add subscription_start column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'user_profiles' AND column_name = 'subscription_start') THEN
        ALTER TABLE public.user_profiles ADD COLUMN subscription_start TIMESTAMPTZ;
    END IF;
    
    -- Add subscription_end column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'user_profiles' AND column_name = 'subscription_end') THEN
        ALTER TABLE public.user_profiles ADD COLUMN subscription_end TIMESTAMPTZ;
    END IF;
    
    -- Add trial_start column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'user_profiles' AND column_name = 'trial_start') THEN
        ALTER TABLE public.user_profiles ADD COLUMN trial_start TIMESTAMPTZ;
    END IF;
    
    -- Add trial_end column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'user_profiles' AND column_name = 'trial_end') THEN
        ALTER TABLE public.user_profiles ADD COLUMN trial_end TIMESTAMPTZ;
    END IF;
    
    -- Add trial_status column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'user_profiles' AND column_name = 'trial_status') THEN
        ALTER TABLE public.user_profiles ADD COLUMN trial_status VARCHAR(20) DEFAULT 'not_started';
    END IF;
    
    -- Add conversion_date column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'user_profiles' AND column_name = 'conversion_date') THEN
        ALTER TABLE public.user_profiles ADD COLUMN conversion_date TIMESTAMPTZ;
    END IF;
    
    -- Add last_reminder_sent column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'user_profiles' AND column_name = 'last_reminder_sent') THEN
        ALTER TABLE public.user_profiles ADD COLUMN last_reminder_sent TIMESTAMPTZ;
    END IF;
    
    -- Add role column if it doesn't exist (for admin functionality)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'user_profiles' AND column_name = 'role') THEN
        ALTER TABLE public.user_profiles ADD COLUMN role VARCHAR(20) DEFAULT 'user';
    END IF;
END $$;

-- Drop existing trial_events table if it exists
DROP TABLE IF EXISTS public.trial_events CASCADE;

-- Create trial tracking table
CREATE TABLE public.trial_events (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    event_type VARCHAR(50) NOT NULL, -- trial_started, trial_expired, converted, reminder_sent
    event_data JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Drop existing trial analytics view if it exists
DROP VIEW IF EXISTS trial_analytics CASCADE;

-- Create trial analytics view with correct column names
CREATE VIEW trial_analytics AS
SELECT 
    DATE(trial_start) as trial_date,
    COUNT(*) as trials_started,
    COUNT(CASE WHEN trial_end < NOW() THEN 1 END) as trials_expired,
    COUNT(CASE WHEN subscription_status = 'active' AND subscription_plan != 'free_trial' THEN 1 END) as conversions,
    ROUND(
        (COUNT(CASE WHEN subscription_status = 'active' AND subscription_plan != 'free_trial' THEN 1 END) * 100.0) / 
        NULLIF(COUNT(CASE WHEN trial_end < NOW() THEN 1 END), 0), 2
    ) as conversion_rate
FROM user_profiles 
WHERE trial_start IS NOT NULL
GROUP BY DATE(trial_start)
ORDER BY trial_date DESC;

-- Drop existing functions if they exist
DROP FUNCTION IF EXISTS check_trial_status(UUID) CASCADE;
DROP FUNCTION IF EXISTS get_trial_conversion_stats() CASCADE;

-- Create function to check trial status
CREATE FUNCTION check_trial_status(user_id UUID DEFAULT auth.uid())
RETURNS TABLE(
    is_trial_active BOOLEAN,
    trial_days_left INTEGER,
    trial_end_date TIMESTAMPTZ,
    subscription_status VARCHAR(20),
    subscription_plan VARCHAR(50)
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        CASE 
            WHEN up.trial_end > NOW() THEN true 
            ELSE false 
        END as is_trial_active,
        CASE 
            WHEN up.trial_end > NOW() 
            THEN EXTRACT(DAY FROM (up.trial_end - NOW()))
            ELSE 0 
        END as trial_days_left,
        up.trial_end as trial_end_date,
        up.subscription_status,
        up.subscription_plan
    FROM public.user_profiles up
    WHERE up.id = user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to get trial conversion stats with correct column names
CREATE FUNCTION get_trial_conversion_stats()
RETURNS TABLE(
    total_trials INTEGER,
    active_trials INTEGER,
    expired_trials INTEGER,
    conversions INTEGER,
    conversion_rate DECIMAL(5,2)
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COUNT(*) as total_trials,
        COUNT(CASE WHEN trial_end > NOW() THEN 1 END) as active_trials,
        COUNT(CASE WHEN trial_end <= NOW() THEN 1 END) as expired_trials,
        COUNT(CASE WHEN subscription_status = 'active' AND subscription_plan != 'free_trial' THEN 1 END) as conversions,
        ROUND(
            (COUNT(CASE WHEN subscription_status = 'active' AND subscription_plan != 'free_trial' THEN 1 END) * 100.0) / 
            NULLIF(COUNT(CASE WHEN trial_end <= NOW() THEN 1 END), 0), 2
        ) as conversion_rate
    FROM public.user_profiles 
    WHERE trial_start IS NOT NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_profiles_trial_end ON public.user_profiles(trial_end);
CREATE INDEX IF NOT EXISTS idx_user_profiles_trial_status ON public.user_profiles(trial_status);
CREATE INDEX IF NOT EXISTS idx_user_profiles_subscription_status ON public.user_profiles(subscription_status);
CREATE INDEX IF NOT EXISTS idx_trial_events_user_id ON public.trial_events(user_id);
CREATE INDEX IF NOT EXISTS idx_trial_events_event_type ON public.trial_events(event_type);

-- Enable RLS on trial_events table
ALTER TABLE public.trial_events ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view own trial events" ON public.trial_events;
DROP POLICY IF EXISTS "Admins can view all trial events" ON public.trial_events;

-- RLS Policies for trial_events
CREATE POLICY "Users can view own trial events" ON public.trial_events
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all trial events" ON public.trial_events
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.user_profiles 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Grant permissions
GRANT ALL ON public.trial_events TO authenticated;
GRANT EXECUTE ON FUNCTION check_trial_status(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION get_trial_conversion_stats() TO authenticated;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS trial_event_trigger ON public.user_profiles;
DROP FUNCTION IF EXISTS log_trial_event() CASCADE;

-- Create trigger to log trial events
CREATE FUNCTION log_trial_event()
RETURNS TRIGGER AS $$
BEGIN
    -- Log trial start
    IF NEW.trial_start IS NOT NULL AND OLD.trial_start IS NULL THEN
        INSERT INTO public.trial_events (user_id, event_type, event_data)
        VALUES (NEW.id, 'trial_started', jsonb_build_object('trial_end', NEW.trial_end));
    END IF;
    
    -- Log trial expiry
    IF NEW.trial_end <= NOW() AND OLD.trial_end > NOW() THEN
        INSERT INTO public.trial_events (user_id, event_type, event_data)
        VALUES (NEW.id, 'trial_expired', jsonb_build_object('trial_end', NEW.trial_end));
    END IF;
    
    -- Log conversion
    IF NEW.subscription_status = 'active' AND NEW.subscription_plan != 'free_trial' 
       AND (OLD.subscription_status != 'active' OR OLD.subscription_plan = 'free_trial') THEN
        INSERT INTO public.trial_events (user_id, event_type, event_data)
        VALUES (NEW.id, 'converted', jsonb_build_object('plan', NEW.subscription_plan));
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
CREATE TRIGGER trial_event_trigger
    AFTER UPDATE ON public.user_profiles
    FOR EACH ROW
    EXECUTE FUNCTION log_trial_event();

-- Show final status
SELECT 
    'Trial System Setup Complete' as status,
    COUNT(*) as total_users,
    COUNT(CASE WHEN trial_start IS NOT NULL THEN 1 END) as users_with_trials,
    COUNT(CASE WHEN trial_end > NOW() THEN 1 END) as active_trials,
    COUNT(CASE WHEN subscription_status = 'active' AND subscription_plan != 'free_trial' THEN 1 END) as paid_users
FROM public.user_profiles; 