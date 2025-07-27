-- Create function to manually confirm email addresses
CREATE OR REPLACE FUNCTION manual_confirm_email(user_email VARCHAR)
RETURNS VOID AS $$
BEGIN
    -- Confirm email in auth.users table
    UPDATE auth.users 
    SET email_confirmed_at = NOW()
    WHERE email = user_email;
    
    -- Update verification status in user_profiles
    UPDATE public.user_profiles 
    SET verification_status = 'approved'
    WHERE email = user_email;
    
    RAISE NOTICE 'Email confirmed for user: %', user_email;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant permission to authenticated users
GRANT EXECUTE ON FUNCTION manual_confirm_email(VARCHAR) TO authenticated;

-- Also create a function to confirm all pending emails
CREATE OR REPLACE FUNCTION confirm_all_pending_emails()
RETURNS INTEGER AS $$
DECLARE
    confirmed_count INTEGER;
BEGIN
    -- Confirm all users without email confirmation
    UPDATE auth.users 
    SET email_confirmed_at = NOW()
    WHERE email_confirmed_at IS NULL;
    
    GET DIAGNOSTICS confirmed_count = ROW_COUNT;
    
    -- Update all pending profiles to approved
    UPDATE public.user_profiles 
    SET verification_status = 'approved'
    WHERE verification_status = 'pending';
    
    RAISE NOTICE 'Confirmed % pending email addresses', confirmed_count;
    RETURN confirmed_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant permission
GRANT EXECUTE ON FUNCTION confirm_all_pending_emails() TO authenticated;

-- Run it once to confirm all existing pending users
SELECT confirm_all_pending_emails(); 