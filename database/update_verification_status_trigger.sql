-- Create function to update verification status when email is confirmed
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

-- Create trigger for email confirmation
DROP TRIGGER IF EXISTS on_email_confirmed_update_verification ON auth.users;
CREATE TRIGGER on_email_confirmed_update_verification
    AFTER UPDATE ON auth.users
    FOR EACH ROW EXECUTE FUNCTION update_verification_status_on_email_confirmation();

-- Grant permissions
GRANT EXECUTE ON FUNCTION update_verification_status_on_email_confirmation() TO authenticated; 