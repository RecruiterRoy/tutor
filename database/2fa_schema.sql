-- 2FA Database Schema for tution.app
-- This file contains all the necessary tables and functions for 2-factor authentication

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2FA Secrets Table
CREATE TABLE IF NOT EXISTS public.user_2fa_secrets (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    secret_key TEXT NOT NULL,
    backup_codes TEXT[] DEFAULT array[]::TEXT[],
    is_enabled BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id)
);

-- 2FA Verification Attempts Table (for rate limiting)
CREATE TABLE IF NOT EXISTS public.user_2fa_attempts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    attempt_type VARCHAR(20) NOT NULL, -- 'totp', 'backup_code', 'setup'
    ip_address INET,
    user_agent TEXT,
    success BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2FA Recovery Tokens Table
CREATE TABLE IF NOT EXISTS public.user_2fa_recovery (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    recovery_token TEXT NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    used BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.user_2fa_secrets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_2fa_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_2fa_recovery ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_2fa_secrets
CREATE POLICY "Users can view their own 2FA secrets" ON public.user_2fa_secrets
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own 2FA secrets" ON public.user_2fa_secrets
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own 2FA secrets" ON public.user_2fa_secrets
    FOR UPDATE USING (auth.uid() = user_id);

-- RLS Policies for user_2fa_attempts
CREATE POLICY "Users can view their own 2FA attempts" ON public.user_2fa_attempts
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own 2FA attempts" ON public.user_2fa_attempts
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- RLS Policies for user_2fa_recovery
CREATE POLICY "Users can view their own recovery tokens" ON public.user_2fa_recovery
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own recovery tokens" ON public.user_2fa_recovery
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own recovery tokens" ON public.user_2fa_recovery
    FOR UPDATE USING (auth.uid() = user_id);

-- Function to generate backup codes
CREATE OR REPLACE FUNCTION generate_backup_codes()
RETURNS TEXT[] AS $$
DECLARE
    codes TEXT[] := array[]::TEXT[];
    i INTEGER;
    code TEXT;
BEGIN
    FOR i IN 1..8 LOOP
        -- Generate 8-digit backup codes
        code := LPAD(FLOOR(RANDOM() * 100000000)::TEXT, 8, '0');
        codes := array_append(codes, code);
    END LOOP;
    RETURN codes;
END;
$$ LANGUAGE plpgsql;

-- Function to clean up old 2FA attempts (older than 24 hours)
CREATE OR REPLACE FUNCTION cleanup_old_2fa_attempts()
RETURNS VOID AS $$
BEGIN
    DELETE FROM public.user_2fa_attempts 
    WHERE created_at < NOW() - INTERVAL '24 hours';
END;
$$ LANGUAGE plpgsql;

-- Function to check if user has too many failed attempts
CREATE OR REPLACE FUNCTION check_2fa_rate_limit(user_uuid UUID, attempt_type VARCHAR)
RETURNS BOOLEAN AS $$
DECLARE
    recent_attempts INTEGER;
    max_attempts INTEGER := 5; -- Max 5 attempts per hour
BEGIN
    SELECT COUNT(*) INTO recent_attempts
    FROM public.user_2fa_attempts
    WHERE user_id = user_uuid 
    AND attempt_type = $2
    AND success = FALSE
    AND created_at > NOW() - INTERVAL '1 hour';
    
    RETURN recent_attempts < max_attempts;
END;
$$ LANGUAGE plpgsql;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_2fa_secrets_user_id ON public.user_2fa_secrets(user_id);
CREATE INDEX IF NOT EXISTS idx_user_2fa_attempts_user_id ON public.user_2fa_attempts(user_id);
CREATE INDEX IF NOT EXISTS idx_user_2fa_attempts_created_at ON public.user_2fa_attempts(created_at);
CREATE INDEX IF NOT EXISTS idx_user_2fa_recovery_user_id ON public.user_2fa_recovery(user_id);
CREATE INDEX IF NOT EXISTS idx_user_2fa_recovery_expires_at ON public.user_2fa_recovery(expires_at);

-- Grant necessary permissions
GRANT SELECT, INSERT, UPDATE ON public.user_2fa_secrets TO authenticated;
GRANT SELECT, INSERT ON public.user_2fa_attempts TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.user_2fa_recovery TO authenticated; 