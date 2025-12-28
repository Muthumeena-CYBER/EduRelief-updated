-- COMPLETE DATABASE SETUP
-- Run this script in the Supabase SQL Editor to initialize your database correctly.

-- 1. cleanup (Start Fresh)
DROP TABLE IF EXISTS public.donations CASCADE;
DROP TABLE IF EXISTS public.campaigns CASCADE;
DROP TABLE IF EXISTS public.user_roles CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;
DROP TABLE IF EXISTS public.funding_resources CASCADE;

DROP TYPE IF EXISTS public.app_role CASCADE;
DROP TYPE IF EXISTS public.campaign_category CASCADE;
DROP TYPE IF EXISTS public.campaign_status CASCADE;
DROP TYPE IF EXISTS public.funding_type CASCADE;

-- 2. Create Enums
CREATE TYPE public.app_role AS ENUM ('student', 'donor');
CREATE TYPE public.campaign_category AS ENUM ('school', 'college', 'bootcamp', 'competitive_exams', 'devices', 'other');
CREATE TYPE public.campaign_status AS ENUM ('draft', 'active', 'paused', 'completed', 'cancelled');
CREATE TYPE public.funding_type AS ENUM ('isa', 'scholarship', 'grant', 'sponsored');

-- 3. Create Tables (Auth0 Compatible - No 'auth.users' references)

-- Profiles: Stores user details
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT NOT NULL UNIQUE, -- Maps to Auth0 ID (e.g., "auth0|123...")
    full_name TEXT NOT NULL,
    email TEXT NOT NULL,
    avatar_url TEXT,
    bio TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- User Roles: Stores whether user is 'student' or 'donor'
CREATE TABLE public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT NOT NULL, -- Maps to Auth0 ID
    role app_role NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE (user_id, role)
);

-- Campaigns: Fundraising campaigns
CREATE TABLE public.campaigns (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id TEXT NOT NULL, -- Maps to Auth0 ID of the student
    title TEXT NOT NULL,
    story TEXT NOT NULL,
    category campaign_category NOT NULL DEFAULT 'other',
    funding_goal DECIMAL(10, 2) NOT NULL CHECK (funding_goal > 0),
    amount_raised DECIMAL(10, 2) NOT NULL DEFAULT 0,
    fund_usage TEXT,
    image_url TEXT,
    status campaign_status NOT NULL DEFAULT 'draft',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Donations: Records of donations
CREATE TABLE public.donations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    campaign_id UUID REFERENCES public.campaigns(id) ON DELETE CASCADE NOT NULL,
    donor_id TEXT, -- Maps to Auth0 ID of the donor (nullable for anonymous/guest)
    amount DECIMAL(10, 2) NOT NULL CHECK (amount > 0),
    message TEXT,
    is_anonymous BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Funding Resources: List of external resources
CREATE TABLE public.funding_resources (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    program_name TEXT NOT NULL,
    organization_name TEXT NOT NULL,
    description TEXT NOT NULL,
    funding_type funding_type NOT NULL,
    eligibility TEXT NOT NULL,
    requirements TEXT NOT NULL,
    application_url TEXT NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 4. Enable Row Level Security (RLS)
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.donations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.funding_resources ENABLE ROW LEVEL SECURITY;

-- 5. Create Permissive Policies (Since Auth is handled by Auth0 + Frontend)

-- Profiles
CREATE POLICY "Public profiles access" ON public.profiles FOR SELECT TO public USING (true);
CREATE POLICY "Public profiles insert" ON public.profiles FOR INSERT TO public WITH CHECK (true);
CREATE POLICY "Public profiles update" ON public.profiles FOR UPDATE TO public USING (true);

-- User Roles
CREATE POLICY "Public roles access" ON public.user_roles FOR SELECT TO public USING (true);
CREATE POLICY "Public roles insert" ON public.user_roles FOR INSERT TO public WITH CHECK (true);

-- Campaigns
CREATE POLICY "Public campaigns access" ON public.campaigns FOR SELECT TO public USING (true);
CREATE POLICY "Public campaigns insert" ON public.campaigns FOR INSERT TO public WITH CHECK (true);
CREATE POLICY "Public campaigns update" ON public.campaigns FOR UPDATE TO public USING (true);
CREATE POLICY "Public campaigns delete" ON public.campaigns FOR DELETE TO public USING (true);

-- Donations
CREATE POLICY "Public donations access" ON public.donations FOR SELECT TO public USING (true);
CREATE POLICY "Public donations insert" ON public.donations FOR INSERT TO public WITH CHECK (true);

-- Funding Resources
CREATE POLICY "Public resources access" ON public.funding_resources FOR SELECT TO public USING (true);

-- 6. Helper Functions & Triggers

-- Auto-update 'updated_at' timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_campaigns_updated_at BEFORE UPDATE ON public.campaigns FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_funding_resources_updated_at BEFORE UPDATE ON public.funding_resources FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Auto-update 'amount_raised' on donation
CREATE OR REPLACE FUNCTION public.update_campaign_amount_raised()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE public.campaigns
    SET amount_raised = amount_raised + NEW.amount
    WHERE id = NEW.campaign_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER after_donation_insert AFTER INSERT ON public.donations FOR EACH ROW EXECUTE FUNCTION public.update_campaign_amount_raised();
