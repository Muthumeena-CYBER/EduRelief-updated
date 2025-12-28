-- FIX BROKEN TRIGGERS
-- Run this in Supabase SQL Editor to stop the "Database error saving new user"

-- 1. Drop the old Auth0 trigger if it exists (on auth.users)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- 2. Drop the function it calls
DROP FUNCTION IF EXISTS public.handle_new_user();

-- 3. Ensure we can write to profiles
GRANT ALL ON TABLE public.profiles TO postgres, service_role;
GRANT ALL ON TABLE public.profiles TO authenticated;
GRANT ALL ON TABLE public.profiles TO anon;

GRANT ALL ON TABLE public.user_roles TO postgres, service_role;
GRANT ALL ON TABLE public.user_roles TO authenticated;
GRANT ALL ON TABLE public.user_roles TO anon;
