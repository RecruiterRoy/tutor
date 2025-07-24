-- Simple SQL script to delete all data except admin in user_profiles table
-- This will only delete data, NOT the table structures themselves

-- 1. Delete all user profiles except admin (only check full_name for Admin)
DELETE FROM user_profiles
WHERE full_name NOT LIKE '%Admin%';

-- 2. Delete all registered profiles except admin (only check full_name for Admin)
DELETE FROM registered_profiles
WHERE full_name NOT LIKE '%Admin%';

-- 3. Delete all auth users except admin (if using Supabase Auth)
DELETE FROM auth.users
WHERE email NOT LIKE '%admin%';

-- Note: This script will only delete data, NOT the table structures.
-- All tables, columns, indexes, and constraints will remain intact.
-- Only admin profiles (full_name containing 'Admin') will be preserved in user_profiles table. 