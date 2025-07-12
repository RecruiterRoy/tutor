-- Migration script to move existing users to user_profiles table
-- This script will migrate existing user data to the new structure

-- First, let's see what users we have
SELECT 
    id,
    email,
    raw_user_meta_data->>'full_name' as full_name,
    created_at
FROM auth.users
ORDER BY created_at;

-- Create user_profiles table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.user_profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name VARCHAR(255),
    class VARCHAR(20),
    board VARCHAR(100),
    board_abbr VARCHAR(10),
    phone VARCHAR(20),
    city VARCHAR(100),
    state VARCHAR(100),
    preferred_language VARCHAR(10) DEFAULT 'en',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS (Row Level Security)
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

-- Create policies if they don't exist
DROP POLICY IF EXISTS "Users can view own profile" ON public.user_profiles;
CREATE POLICY "Users can view own profile" ON public.user_profiles
    FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON public.user_profiles;
CREATE POLICY "Users can update own profile" ON public.user_profiles
    FOR UPDATE USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can insert own profile" ON public.user_profiles;
CREATE POLICY "Users can insert own profile" ON public.user_profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

-- Migrate existing users to user_profiles table
INSERT INTO public.user_profiles (
    id,
    full_name,
    class,
    board,
    board_abbr,
    phone,
    preferred_language,
    created_at
)
SELECT 
    u.id,
    COALESCE(u.raw_user_meta_data->>'full_name', 'Student') as full_name,
    COALESCE(u.raw_user_meta_data->>'class', 'Class 2') as class,
    'Central Board of Secondary Education' as board,
    'CBSE' as board_abbr,
    u.raw_user_meta_data->>'phone' as phone,
    'en' as preferred_language,
    u.created_at
FROM auth.users u
WHERE NOT EXISTS (
    SELECT 1 FROM public.user_profiles up WHERE up.id = u.id
);

-- Show migration results
SELECT 
    'Migration Results' as info,
    COUNT(*) as total_users_migrated
FROM public.user_profiles;

-- Show all user profiles
SELECT 
    id,
    full_name,
    class,
    board,
    board_abbr,
    phone,
    preferred_language,
    created_at
FROM public.user_profiles
ORDER BY created_at;

-- Create the functions if they don't exist
CREATE OR REPLACE FUNCTION get_user_profile(user_id UUID DEFAULT auth.uid())
RETURNS TABLE(
    id UUID,
    full_name VARCHAR,
    class VARCHAR,
    board VARCHAR,
    board_abbr VARCHAR,
    phone VARCHAR,
    city VARCHAR,
    state VARCHAR,
    preferred_language VARCHAR,
    created_at TIMESTAMPTZ
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        up.id,
        up.full_name,
        up.class,
        up.board,
        up.board_abbr,
        up.phone,
        up.city,
        up.state,
        up.preferred_language,
        up.created_at
    FROM public.user_profiles up
    WHERE up.id = user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION update_user_profile(
    user_id UUID DEFAULT auth.uid(),
    user_full_name VARCHAR DEFAULT NULL,
    user_class VARCHAR DEFAULT NULL,
    user_board VARCHAR DEFAULT NULL,
    user_board_abbr VARCHAR DEFAULT NULL,
    user_phone VARCHAR DEFAULT NULL,
    user_city VARCHAR DEFAULT NULL,
    user_state VARCHAR DEFAULT NULL,
    user_language VARCHAR DEFAULT NULL
)
RETURNS VOID AS $$
BEGIN
    INSERT INTO public.user_profiles (
        id, full_name, class, board, board_abbr, phone, city, state, preferred_language
    ) VALUES (
        user_id, user_full_name, user_class, user_board, user_board_abbr, 
        user_phone, user_city, user_state, user_language
    )
    ON CONFLICT (id) DO UPDATE SET
        full_name = COALESCE(user_full_name, user_profiles.full_name),
        class = COALESCE(user_class, user_profiles.class),
        board = COALESCE(user_board, user_profiles.board),
        board_abbr = COALESCE(user_board_abbr, user_profiles.board_abbr),
        phone = COALESCE(user_phone, user_profiles.phone),
        city = COALESCE(user_city, user_profiles.city),
        state = COALESCE(user_state, user_profiles.state),
        preferred_language = COALESCE(user_language, user_profiles.preferred_language),
        updated_at = NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON public.user_profiles TO authenticated;
GRANT EXECUTE ON FUNCTION get_user_profile(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION update_user_profile(UUID, VARCHAR, VARCHAR, VARCHAR, VARCHAR, VARCHAR, VARCHAR, VARCHAR, VARCHAR) TO authenticated;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_profiles_id ON public.user_profiles(id);
CREATE INDEX IF NOT EXISTS idx_user_profiles_class ON public.user_profiles(class);
CREATE INDEX IF NOT EXISTS idx_user_profiles_board ON public.user_profiles(board);

-- Show final status
SELECT 
    'Migration Complete' as status,
    COUNT(*) as total_profiles,
    COUNT(CASE WHEN class IS NOT NULL THEN 1 END) as profiles_with_class,
    COUNT(CASE WHEN board IS NOT NULL THEN 1 END) as profiles_with_board
FROM public.user_profiles; 