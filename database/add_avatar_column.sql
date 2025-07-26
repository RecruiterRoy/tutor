-- Add avatar column to user_profiles table
ALTER TABLE user_profiles 
ADD COLUMN avatar VARCHAR DEFAULT 'teacher-avatar1.png';

-- Update existing records to have appropriate default avatars based on language
-- For Hindi and Hinglish users, set avatar to miss_sapna.jpg
UPDATE user_profiles 
SET avatar = 'miss_sapna.jpg' 
WHERE preferred_language IN ('Hindi', 'Hinglish') 
AND avatar = 'teacher-avatar1.png';

-- For English users, set avatar to roy_sir.jpg
UPDATE user_profiles 
SET avatar = 'roy_sir.jpg' 
WHERE preferred_language = 'English' 
AND avatar = 'teacher-avatar1.png';

-- Add a comment to document the avatar logic
COMMENT ON COLUMN user_profiles.avatar IS 'Avatar image filename. Default: roy_sir.jpg for English, miss_sapna.jpg for Hindi/Hinglish'; 