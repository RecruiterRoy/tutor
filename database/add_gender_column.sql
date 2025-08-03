-- Add gender column to user_profiles table
-- This script adds a gender column to store user gender information

-- Add gender column to user_profiles table
ALTER TABLE user_profiles 
ADD COLUMN gender VARCHAR(10) DEFAULT 'male' CHECK (gender IN ('male', 'female', 'others'));

-- Add comment to explain the column
COMMENT ON COLUMN user_profiles.gender IS 'User gender: male, female, or others';

-- Update existing records to have a default gender (optional)
-- UPDATE user_profiles SET gender = 'male' WHERE gender IS NULL;

-- Create index for gender column for better query performance
CREATE INDEX idx_user_profiles_gender ON user_profiles(gender);

-- Grant permissions to authenticated users
GRANT SELECT, UPDATE ON user_profiles TO authenticated;

-- Add RLS policy for gender column
CREATE POLICY "Users can view and update their own gender" ON user_profiles
    FOR ALL USING (auth.uid() = id);

-- Verify the changes
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'user_profiles' AND column_name = 'gender'; 