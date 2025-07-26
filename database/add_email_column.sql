-- Add email column to user_profiles table
ALTER TABLE user_profiles
ADD COLUMN email VARCHAR;

-- Add a comment to document the email column
COMMENT ON COLUMN user_profiles.email IS 'User email address, copied from auth.users table.'; 