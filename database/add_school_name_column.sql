-- Add school_name column to user_profiles table
ALTER TABLE user_profiles 
ADD COLUMN school_name VARCHAR(255);

-- Add a comment to document the school_name column
COMMENT ON COLUMN user_profiles.school_name IS 'School name of the student'; 