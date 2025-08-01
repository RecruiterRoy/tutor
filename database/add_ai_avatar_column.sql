-- Add ai_avatar column to user_profiles table
ALTER TABLE user_profiles 
ADD COLUMN ai_avatar VARCHAR(50) DEFAULT 'roy-sir';

-- Update existing records to have appropriate default avatars based on language
-- For Hindi and Hinglish users, set ai_avatar to ms-sapna
UPDATE user_profiles 
SET ai_avatar = 'ms-sapna' 
WHERE preferred_language IN ('Hindi', 'Hinglish') 
AND ai_avatar = 'roy-sir';

-- For English users, set ai_avatar to roy-sir (already default)
-- No update needed as it's already the default

-- Add a comment to document the ai_avatar logic
COMMENT ON COLUMN user_profiles.ai_avatar IS 'AI avatar identifier. Default: roy-sir for English, ms-sapna for Hindi/Hinglish'; 