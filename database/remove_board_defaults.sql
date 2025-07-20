-- Remove default board values from the handle_new_user function
-- This ensures new users must select their board during registration

-- Update the handle_new_user function to not set default board values
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.user_profiles (
        id, 
        full_name,
        class,
        board,
        board_abbr
    ) VALUES (
        NEW.id,
        NEW.raw_user_meta_data->>'full_name',
        'Class 1', -- Default class
        NULL, -- No default board - user must select
        NULL -- No default board abbreviation - user must select
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Show current trigger status
SELECT 
    trigger_name,
    event_manipulation,
    action_statement
FROM information_schema.triggers 
WHERE trigger_name = 'on_auth_user_created';

-- Verify the function was updated
SELECT 
    routine_name,
    routine_definition
FROM information_schema.routines 
WHERE routine_name = 'handle_new_user'; 