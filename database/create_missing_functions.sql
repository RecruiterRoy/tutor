-- Create Missing Functions for Email Confirmation
-- This script creates the missing function that's causing the email confirmation error

-- Create the missing move_registered_profile_to_user_profiles function
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
            id, 
            full_name, 
            class, 
            board, 
            phone, 
            city, 
            state, 
            preferred_language, 
            created_at, 
            updated_at
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

-- Create the handle_email_verification function
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

-- Create trigger for email confirmation
DROP TRIGGER IF EXISTS on_email_confirmed ON auth.users;
CREATE TRIGGER on_email_confirmed
    AFTER UPDATE ON auth.users
    FOR EACH ROW EXECUTE FUNCTION handle_email_verification();

-- Grant permissions
GRANT EXECUTE ON FUNCTION move_registered_profile_to_user_profiles(VARCHAR, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION handle_email_verification() TO authenticated;

-- Verify the functions were created
SELECT 
    'Missing Functions Created Successfully' as status,
    COUNT(*) as total_functions
FROM pg_proc 
WHERE proname IN ('move_registered_profile_to_user_profiles', 'handle_email_verification'); 