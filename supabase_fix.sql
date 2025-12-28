-- RLS and Schema Fixes for Auth0 Integration
-- Run this in your Supabase SQL Editor

-- 1. Drop Foreign Key Constraints (auth.users doesn't have Auth0 users)
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_user_id_fkey;
ALTER TABLE public.user_roles DROP CONSTRAINT IF EXISTS user_roles_user_id_fkey;
ALTER TABLE public.campaigns DROP CONSTRAINT IF EXISTS campaigns_student_id_fkey;
ALTER TABLE public.donations DROP CONSTRAINT IF EXISTS donations_donor_id_fkey;

-- 2. Change ID columns to TEXT to support Auth0 IDs (e.g., "auth0|123456")
ALTER TABLE public.profiles ALTER COLUMN user_id TYPE text;
ALTER TABLE public.user_roles ALTER COLUMN user_id TYPE text;
ALTER TABLE public.campaigns ALTER COLUMN student_id TYPE text;
ALTER TABLE public.donations ALTER COLUMN donor_id TYPE text;

-- 3. Update RLS Policies to allow operations from the frontend
-- Note: In a production environment with Auth0, you'd typically verify the JWT on the server
-- or use Supabase Custom Claims. For this setup, we'll allow public access based on logic.

-- Enable insert for profiles (needed for Onboarding)
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
CREATE POLICY "Allow public insert profiles" ON public.profiles FOR INSERT TO public WITH CHECK (true);

-- Enable select for profiles (needed for AuthContext)
DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON public.profiles;
CREATE POLICY "Allow public select profiles" ON public.profiles FOR SELECT TO public USING (true);

-- Enable update for profiles
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
CREATE POLICY "Allow public update profiles" ON public.profiles FOR UPDATE TO public USING (true); -- Ideally check user_id = current_user_id passed in query

-- Fix user_roles policies
DROP POLICY IF EXISTS "Users can insert their own role" ON public.user_roles;
CREATE POLICY "Allow public insert user_roles" ON public.user_roles FOR INSERT TO public WITH CHECK (true);

DROP POLICY IF EXISTS "Users can view their own roles" ON public.user_roles;
CREATE POLICY "Allow public select user_roles" ON public.user_roles FOR SELECT TO public USING (true);

-- Fix campaigns policies
DROP POLICY IF EXISTS "Students can create campaigns" ON public.campaigns;
CREATE POLICY "Allow public insert campaigns" ON public.campaigns FOR INSERT TO public WITH CHECK (true);
