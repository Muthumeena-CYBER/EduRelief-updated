-- Create user role enum
CREATE TYPE public.app_role AS ENUM ('student', 'donor');

-- Create user_roles table (separate from profiles for security)
CREATE TABLE public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role app_role NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE (user_id, role)
);

-- Create profiles table
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
    full_name TEXT NOT NULL,
    email TEXT NOT NULL,
    avatar_url TEXT,
    bio TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create campaign categories enum
CREATE TYPE public.campaign_category AS ENUM ('school', 'college', 'bootcamp', 'competitive_exams', 'devices', 'other');

-- Create campaign status enum
CREATE TYPE public.campaign_status AS ENUM ('draft', 'active', 'paused', 'completed', 'cancelled');

-- Create campaigns table
CREATE TABLE public.campaigns (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
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

-- Create donations table
CREATE TABLE public.donations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    campaign_id UUID REFERENCES public.campaigns(id) ON DELETE CASCADE NOT NULL,
    donor_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    amount DECIMAL(10, 2) NOT NULL CHECK (amount > 0),
    message TEXT,
    is_anonymous BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create funding resource type enum
CREATE TYPE public.funding_type AS ENUM ('isa', 'scholarship', 'grant', 'sponsored');

-- Create funding resources table
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

-- Enable Row Level Security on all tables
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.donations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.funding_resources ENABLE ROW LEVEL SECURITY;

-- Security definer function to check user role
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- RLS Policies for user_roles
CREATE POLICY "Users can view their own roles"
ON public.user_roles FOR SELECT
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own role"
ON public.user_roles FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

-- RLS Policies for profiles
CREATE POLICY "Profiles are viewable by everyone"
ON public.profiles FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Users can insert their own profile"
ON public.profiles FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own profile"
ON public.profiles FOR UPDATE
TO authenticated
USING (user_id = auth.uid());

-- RLS Policies for campaigns
CREATE POLICY "Active campaigns are viewable by everyone"
ON public.campaigns FOR SELECT
USING (status = 'active' OR student_id = auth.uid());

CREATE POLICY "Students can create campaigns"
ON public.campaigns FOR INSERT
TO authenticated
WITH CHECK (student_id = auth.uid() AND public.has_role(auth.uid(), 'student'));

CREATE POLICY "Students can update their own campaigns"
ON public.campaigns FOR UPDATE
TO authenticated
USING (student_id = auth.uid());

CREATE POLICY "Students can delete their own campaigns"
ON public.campaigns FOR DELETE
TO authenticated
USING (student_id = auth.uid());

-- RLS Policies for donations
CREATE POLICY "Donations are viewable by campaign owner and donor"
ON public.donations FOR SELECT
TO authenticated
USING (
    donor_id = auth.uid() OR 
    EXISTS (SELECT 1 FROM public.campaigns WHERE campaigns.id = campaign_id AND campaigns.student_id = auth.uid())
);

CREATE POLICY "Anyone can view public donation info for active campaigns"
ON public.donations FOR SELECT
USING (
    EXISTS (SELECT 1 FROM public.campaigns WHERE campaigns.id = campaign_id AND campaigns.status = 'active')
);

CREATE POLICY "Authenticated users can donate"
ON public.donations FOR INSERT
TO authenticated
WITH CHECK (donor_id = auth.uid());

-- RLS Policies for funding_resources (public read)
CREATE POLICY "Funding resources are viewable by everyone"
ON public.funding_resources FOR SELECT
USING (is_active = true);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_profiles_updated_at
BEFORE UPDATE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_campaigns_updated_at
BEFORE UPDATE ON public.campaigns
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_funding_resources_updated_at
BEFORE UPDATE ON public.funding_resources
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Function to update campaign amount_raised after donation
CREATE OR REPLACE FUNCTION public.update_campaign_amount_raised()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE public.campaigns
    SET amount_raised = amount_raised + NEW.amount
    WHERE id = NEW.campaign_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER after_donation_insert
AFTER INSERT ON public.donations
FOR EACH ROW EXECUTE FUNCTION public.update_campaign_amount_raised();

-- Function to handle new user signup (create profile)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
    INSERT INTO public.profiles (user_id, full_name, email)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data ->> 'full_name', 'User'),
        NEW.email
    );
    
    -- Insert role from metadata
    INSERT INTO public.user_roles (user_id, role)
    VALUES (
        NEW.id,
        (NEW.raw_user_meta_data ->> 'role')::app_role
    );
    
    RETURN NEW;
END;
$$;

-- Trigger to create profile on signup
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();