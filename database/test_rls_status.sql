-- Test script to check RLS status on user_profiles table
-- Run this in Supabase SQL Editor to verify RLS is disabled

-- Check if RLS is enabled on user_profiles table
SELECT 
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables 
WHERE tablename = 'user_profiles';

-- Check existing policies
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'user_profiles';

-- Test if we can insert a test record (this should work if RLS is disabled)
-- Note: This will fail if the table doesn't exist or has other constraints
INSERT INTO public.user_profiles (
    id,
    full_name,
    email,
    verification_status,
    created_at,
    updated_at
) VALUES (
    gen_random_uuid(),
    'Test User',
    'test@example.com',
    'pending',
    NOW(),
    NOW()
) ON CONFLICT (id) DO NOTHING;

-- Check if the test record was inserted
SELECT COUNT(*) as total_profiles FROM public.user_profiles;

-- Clean up test record
DELETE FROM public.user_profiles WHERE email = 'test@example.com'; 