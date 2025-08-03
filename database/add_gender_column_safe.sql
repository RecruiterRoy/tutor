-- Safe SQL script to add gender column to user_profiles table
-- This script is designed to work with Supabase's restrictions

-- Step 1: Add gender column without default or constraints initially
ALTER TABLE user_profiles 
ADD COLUMN gender VARCHAR(10);

-- Step 2: Add comment to explain the column
COMMENT ON COLUMN user_profiles.gender IS 'User gender: male, female, or others';

-- Step 3: Update existing records to have a default gender
-- This is safer than setting a default constraint
UPDATE user_profiles 
SET gender = 'male' 
WHERE gender IS NULL;

-- Step 4: Create index for gender column for better query performance
CREATE INDEX IF NOT EXISTS idx_user_profiles_gender ON user_profiles(gender);

-- Step 5: Grant permissions to authenticated users (if not already granted)
GRANT SELECT, UPDATE ON user_profiles TO authenticated;

-- Step 6: Add RLS policy for gender column (if RLS is enabled)
-- Note: This will only work if RLS is enabled on the table
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'user_profiles' 
        AND policyname = 'Users can view and update their own gender'
    ) THEN
        RAISE NOTICE 'Policy already exists, skipping...';
    ELSE
        EXECUTE 'CREATE POLICY "Users can view and update their own gender" ON user_profiles FOR ALL USING (auth.uid() = id)';
    END IF;
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Could not create RLS policy: %', SQLERRM;
END $$;

-- Step 7: Verify the changes
SELECT 
    column_name, 
    data_type, 
    is_nullable, 
    column_default,
    CASE 
        WHEN gender IS NULL THEN 'NULL'
        ELSE gender 
    END as sample_value
FROM information_schema.columns 
LEFT JOIN user_profiles ON 1=1
WHERE table_name = 'user_profiles' 
AND column_name = 'gender'
LIMIT 1;

-- Step 8: Show current gender distribution
SELECT 
    gender,
    COUNT(*) as user_count
FROM user_profiles 
GROUP BY gender
ORDER BY user_count DESC; 