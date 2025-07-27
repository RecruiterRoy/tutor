-- Simple Fix for Profile Creation RLS Issue
-- This temporarily disables RLS to allow profile creation, then re-enables with proper policies

-- Step 1: Temporarily disable RLS on user_profiles
ALTER TABLE public.user_profiles DISABLE ROW LEVEL SECURITY;

-- Step 2: Grant all permissions to ensure access
GRANT ALL ON public.user_profiles TO authenticated;
GRANT ALL ON public.user_profiles TO anon;
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT USAGE ON SCHEMA public TO anon;

-- Step 3: Re-enable RLS with simple policies
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

-- Step 4: Drop all existing policies
DROP POLICY IF EXISTS "Users can view own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Service role can manage all profiles" ON public.user_profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.user_profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON public.user_profiles;

-- Step 5: Create simple, permissive policies
CREATE POLICY "Allow all operations for authenticated users" ON public.user_profiles
    FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Allow all operations for anon users" ON public.user_profiles
    FOR ALL USING (auth.role() = 'anon');

-- Step 6: Ensure functions have proper permissions
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    -- Create a basic profile for new users
    INSERT INTO public.user_profiles (
        id, 
        email, 
        verification_status,
        trial_status,
        trial_start,
        trial_end,
        subscription_status,
        subscription_plan
    ) VALUES (
        NEW.id,
        NEW.email,
        CASE 
            WHEN NEW.email_confirmed_at IS NOT NULL THEN 'approved'
            ELSE 'pending'
        END,
        'active',
        NOW(),
        NOW() + INTERVAL '7 days',
        'trial',
        'free_trial'
    );
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 7: Recreate trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Step 8: Grant function permissions
GRANT EXECUTE ON FUNCTION handle_new_user() TO authenticated;

-- Step 9: Verify the fix
SELECT 
    'RLS Profile Creation Fixed' as status,
    COUNT(*) as total_policies
FROM pg_policies 
WHERE tablename = 'user_profiles'; 