-- Simple Trial System Setup
-- This script adds only the essential columns for the trial system

-- Add essential columns to user_profiles table
ALTER TABLE public.user_profiles 
ADD COLUMN IF NOT EXISTS subscription_status VARCHAR(20) DEFAULT 'trial',
ADD COLUMN IF NOT EXISTS subscription_plan VARCHAR(50) DEFAULT 'free_trial',
ADD COLUMN IF NOT EXISTS trial_start TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS trial_end TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS role VARCHAR(20) DEFAULT 'user';

-- Create simple trial events table
CREATE TABLE IF NOT EXISTS public.trial_events (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    event_type VARCHAR(50) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.trial_events ENABLE ROW LEVEL SECURITY;

-- Simple RLS policy
CREATE POLICY "Users can view own trial events" ON public.trial_events
    FOR SELECT USING (auth.uid() = user_id);

-- Grant permissions
GRANT ALL ON public.trial_events TO authenticated;

-- Show current status
SELECT 
    'Trial System Setup Complete' as status,
    COUNT(*) as total_users
FROM public.user_profiles; 