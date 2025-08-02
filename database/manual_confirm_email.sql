-- Manual Email Confirmation Function
-- This function allows manual confirmation of user emails for instant access

CREATE OR REPLACE FUNCTION manual_confirm_email(user_email TEXT)
RETURNS VOID AS $$
BEGIN
    -- Update the auth.users table to mark email as confirmed
    UPDATE auth.users 
    SET email_confirmed_at = NOW(),
        updated_at = NOW()
    WHERE email = user_email;
    
    -- Update user_profiles to set verification status to approved
    UPDATE public.user_profiles 
    SET verification_status = 'approved',
        economic_status = 'Premium',
        updated_at = NOW()
    WHERE email = user_email;
    
    -- Log the confirmation
    RAISE NOTICE 'Email confirmed and user approved: %', user_email;
    
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Error confirming email for %: %', user_email, SQLERRM;
        RAISE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION manual_confirm_email(TEXT) TO authenticated;

-- Add comment for documentation
COMMENT ON FUNCTION manual_confirm_email(TEXT) IS 'Manually confirms user email and approves user for instant access'; 