-- Update users table to add class and board information
-- This script adds the missing columns for student information

-- Add class column
ALTER TABLE auth.users 
ADD COLUMN IF NOT EXISTS class VARCHAR(20);

-- Add board column (full name)
ALTER TABLE auth.users 
ADD COLUMN IF NOT EXISTS board VARCHAR(100);

-- Add board abbreviation column
ALTER TABLE auth.users 
ADD COLUMN IF NOT EXISTS board_abbr VARCHAR(10);

-- Update existing users with default values if needed
UPDATE auth.users 
SET 
    class = 'Class 1',
    board = 'Central Board of Secondary Education',
    board_abbr = 'CBSE'
WHERE class IS NULL;

-- Create a function to update user profile
CREATE OR REPLACE FUNCTION update_user_profile(
    user_id UUID,
    user_class VARCHAR(20),
    user_board VARCHAR(100),
    user_board_abbr VARCHAR(10)
)
RETURNS VOID AS $$
BEGIN
    UPDATE auth.users 
    SET 
        class = user_class,
        board = user_board,
        board_abbr = user_board_abbr
    WHERE id = user_id;
END;
$$ LANGUAGE plpgsql;

-- Create a function to get user profile
CREATE OR REPLACE FUNCTION get_user_profile(user_id UUID)
RETURNS TABLE(
    id UUID,
    email VARCHAR,
    full_name VARCHAR,
    class VARCHAR,
    board VARCHAR,
    board_abbr VARCHAR,
    created_at TIMESTAMPTZ
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        u.id,
        u.email,
        u.raw_user_meta_data->>'full_name' as full_name,
        u.class,
        u.board,
        u.board_abbr,
        u.created_at
    FROM auth.users u
    WHERE u.id = user_id;
END;
$$ LANGUAGE plpgsql;

-- Grant permissions
GRANT EXECUTE ON FUNCTION update_user_profile(UUID, VARCHAR, VARCHAR, VARCHAR) TO authenticated;
GRANT EXECUTE ON FUNCTION get_user_profile(UUID) TO authenticated;

-- Create a view for easy access to user profiles
CREATE OR REPLACE VIEW user_profiles AS
SELECT 
    id,
    email,
    raw_user_meta_data->>'full_name' as full_name,
    class,
    board,
    board_abbr,
    created_at
FROM auth.users;

-- Grant access to the view
GRANT SELECT ON user_profiles TO authenticated; 