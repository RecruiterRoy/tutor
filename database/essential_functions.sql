-- Essential Functions for Login and Registration
-- Run this in your Supabase SQL Editor

-- Manual email confirmation function
CREATE OR REPLACE FUNCTION manual_confirm_email(user_email VARCHAR)
RETURNS VOID AS $$
BEGIN
    UPDATE auth.users SET email_confirmed_at = NOW() WHERE email = user_email;
    UPDATE public.user_profiles SET verification_status = 'approved' WHERE email = user_email;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Handle new user creation
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.user_profiles (id, email, full_name, verification_status)
    VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'full_name', ''), 
            CASE WHEN NEW.app_metadata->>'provider' = 'google' THEN 'approved' ELSE 'pending' END);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update verification status on email confirmation
CREATE OR REPLACE FUNCTION update_verification_status_on_email_confirmation()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.email_confirmed_at IS NOT NULL AND OLD.email_confirmed_at IS NULL THEN
        UPDATE public.user_profiles SET verification_status = 'approved' WHERE id = NEW.id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create triggers
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION handle_new_user();

DROP TRIGGER IF EXISTS on_email_confirmed_update_verification ON auth.users;
CREATE TRIGGER on_email_confirmed_update_verification AFTER UPDATE ON auth.users FOR EACH ROW EXECUTE FUNCTION update_verification_status_on_email_confirmation();

-- Grant permissions
GRANT EXECUTE ON FUNCTION manual_confirm_email(VARCHAR) TO authenticated, anon;
GRANT EXECUTE ON FUNCTION handle_new_user() TO authenticated;
GRANT EXECUTE ON FUNCTION update_verification_status_on_email_confirmation() TO authenticated; 