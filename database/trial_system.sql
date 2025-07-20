-- Trial System Database Schema for TUTOR.AI

-- Add trial fields to user_profiles table
ALTER TABLE public.user_profiles 
ADD COLUMN IF NOT EXISTS trial_start TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS trial_end TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS trial_status VARCHAR(20) DEFAULT 'not_started', -- not_started, active, expired, converted
ADD COLUMN IF NOT EXISTS conversion_date TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS last_reminder_sent TIMESTAMPTZ;

-- Create trial tracking table
CREATE TABLE IF NOT EXISTS public.trial_events (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    event_type VARCHAR(50) NOT NULL, -- trial_started, trial_expired, converted, reminder_sent
    event_data JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create trial analytics view
CREATE OR REPLACE VIEW trial_analytics AS
SELECT 
    DATE(trial_start) as trial_date,
    COUNT(*) as trials_started,
    COUNT(CASE WHEN trial_end < NOW() THEN 1 END) as trials_expired,
    COUNT(CASE WHEN subscription_status = 'active' AND subscription_plan != 'free_trial' THEN 1 END) as conversions,
    ROUND(
        (COUNT(CASE WHEN subscription_status = 'active' AND subscription_plan != 'free_trial' THEN 1 END) * 100.0) / 
        COUNT(CASE WHEN trial_end < NOW() THEN 1 END), 2
    ) as conversion_rate
FROM user_profiles 
WHERE trial_start IS NOT NULL
GROUP BY DATE(trial_start)
ORDER BY trial_date DESC;

-- Create function to check trial status
CREATE OR REPLACE FUNCTION check_trial_status(user_id UUID DEFAULT auth.uid())
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

-- Create function to get trial conversion stats
CREATE OR REPLACE FUNCTION get_trial_conversion_stats()
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
CREATE INDEX IF NOT EXISTS idx_trial_events_user_id ON public.trial_events(user_id);
CREATE INDEX IF NOT EXISTS idx_trial_events_event_type ON public.trial_events(event_type);

-- Enable RLS on trial_events table
ALTER TABLE public.trial_events ENABLE ROW LEVEL SECURITY;

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

-- Create trigger to log trial events
CREATE OR REPLACE FUNCTION log_trial_event()
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
DROP TRIGGER IF EXISTS trial_event_trigger ON public.user_profiles;
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