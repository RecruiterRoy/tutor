-- Create registered_profiles table for temporary storage before email verification
-- This table stores registration data until user verifies their email

CREATE TABLE IF NOT EXISTS public.registered_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    temp_user_id TEXT NOT NULL, -- Temporary ID before auth user is created
    email VARCHAR(255) NOT NULL,
    full_name VARCHAR(255),
    class VARCHAR(20),
    board VARCHAR(100),
    phone VARCHAR(20),
    city VARCHAR(100),
    state VARCHAR(100),
    preferred_language VARCHAR(10) DEFAULT 'en',
    registration_method VARCHAR(20) DEFAULT 'email', -- 'email' or 'phone'
    verification_status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'verified', 'moved'
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS (Row Level Security)
ALTER TABLE public.registered_profiles ENABLE ROW LEVEL SECURITY;

-- Create policies for registered_profiles
CREATE POLICY "Anyone can insert registered profiles" ON public.registered_profiles
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Anyone can read registered profiles" ON public.registered_profiles
    FOR SELECT USING (true);

CREATE POLICY "Anyone can update registered profiles" ON public.registered_profiles
    FOR UPDATE USING (true);

-- Create function to move verified registration to user_profiles
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
            id, full_name, class, board, phone, city, state, preferred_language, created_at, updated_at
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

-- Create function to handle email verification and profile migration
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
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON public.registered_profiles TO authenticated;
GRANT EXECUTE ON FUNCTION move_registered_profile_to_user_profiles(VARCHAR, UUID) TO authenticated;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_registered_profiles_email ON public.registered_profiles(email);
CREATE INDEX IF NOT EXISTS idx_registered_profiles_verification_status ON public.registered_profiles(verification_status);
CREATE INDEX IF NOT EXISTS idx_registered_profiles_created_at ON public.registered_profiles(created_at); 