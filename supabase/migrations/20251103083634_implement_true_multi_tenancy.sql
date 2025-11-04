-- =====================================================
-- Migration: Implement True Multi-Tenancy
-- Description: Convert from single-user-per-tenant to multi-user-per-tenant architecture
-- =====================================================

-- 1. Create the Tenant (Organization) table
-- This represents the top-level customer account (e.g., "Move One", "NGO X")
CREATE TABLE public.Tenant (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Add an index for faster lookups
CREATE INDEX idx_tenant_name ON public.Tenant(name);

-- Enable RLS on Tenant table
ALTER TABLE public.Tenant ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can only see their own tenant
-- (We'll set up the profile first, then this will work via JOIN)
CREATE POLICY "Users can view their own tenant"
ON public.Tenant FOR SELECT
USING (
  id IN (
    SELECT tenant_id FROM public.Profile WHERE id = auth.uid()
  )
);

-- RLS Policy: Only ops_manager can update tenant details
CREATE POLICY "Ops managers can update their tenant"
ON public.Tenant FOR UPDATE
USING (
  id IN (
    SELECT tenant_id FROM public.Profile
    WHERE id = auth.uid() AND user_role = 'ops_manager'
  )
);


-- 2. Create the Profile table
-- This links auth.users to tenants and stores user roles
CREATE TABLE public.Profile (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  tenant_id UUID NOT NULL REFERENCES public.Tenant(id) ON DELETE CASCADE,
  user_role TEXT NOT NULL DEFAULT 'ops_manager',
  full_name TEXT,
  email TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),

  -- Ensure user_role is one of the valid values
  CONSTRAINT valid_user_role CHECK (user_role IN ('ops_manager', 'dispatcher', 'admin'))
);

-- Add indexes for faster lookups
CREATE INDEX idx_profile_tenant_id ON public.Profile(tenant_id);
CREATE INDEX idx_profile_user_role ON public.Profile(user_role);

-- Enable RLS on Profile table
ALTER TABLE public.Profile ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can view their own profile
CREATE POLICY "Users can view their own profile"
ON public.Profile FOR SELECT
USING (id = auth.uid());

-- RLS Policy: Users can view profiles in their tenant
CREATE POLICY "Users can view profiles in their tenant"
ON public.Profile FOR SELECT
USING (
  tenant_id IN (
    SELECT tenant_id FROM public.Profile WHERE id = auth.uid()
  )
);

-- RLS Policy: Users can update their own profile
CREATE POLICY "Users can update their own profile"
ON public.Profile FOR UPDATE
USING (id = auth.uid())
WITH CHECK (id = auth.uid());

-- RLS Policy: Ops managers can update profiles in their tenant
CREATE POLICY "Ops managers can update tenant profiles"
ON public.Profile FOR UPDATE
USING (
  tenant_id IN (
    SELECT tenant_id FROM public.Profile
    WHERE id = auth.uid() AND user_role = 'ops_manager'
  )
);

-- RLS Policy: Ops managers can insert new profiles in their tenant
CREATE POLICY "Ops managers can insert tenant profiles"
ON public.Profile FOR INSERT
WITH CHECK (
  tenant_id IN (
    SELECT tenant_id FROM public.Profile
    WHERE id = auth.uid() AND user_role = 'ops_manager'
  )
);


-- 3. Create the trigger function for new user signup
-- This automatically creates a tenant and profile for new users
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
DECLARE
  new_tenant_id UUID;
  user_email TEXT;
BEGIN
  -- Get the user's email from the new auth user
  user_email := NEW.email;

  -- Create a new tenant for this user
  -- Use the email domain as a default tenant name (can be updated later)
  INSERT INTO public.Tenant (name)
  VALUES (COALESCE(user_email, 'New Organization'))
  RETURNING id INTO new_tenant_id;

  -- Create a profile for this user, linking them to the new tenant
  INSERT INTO public.Profile (id, tenant_id, user_role, email, full_name)
  VALUES (
    NEW.id,
    new_tenant_id,
    'ops_manager', -- Default role for new signups
    user_email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', user_email)
  );

  RETURN NEW;
END;
$$;

-- Add comment to the function
COMMENT ON FUNCTION public.handle_new_user() IS
'Automatically creates a new tenant and profile for each new user signup. New users default to ops_manager role.';


-- 4. Create the trigger on auth.users
-- This fires after a new user is inserted
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();


-- 5. Create a helper function to get the current user's tenant_id
-- This will be useful for application code and RLS policies
CREATE OR REPLACE FUNCTION public.get_user_tenant_id()
RETURNS UUID
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
DECLARE
  tenant_id UUID;
BEGIN
  SELECT Profile.tenant_id INTO tenant_id
  FROM public.Profile
  WHERE Profile.id = auth.uid();

  RETURN tenant_id;
END;
$$;

COMMENT ON FUNCTION public.get_user_tenant_id() IS
'Returns the tenant_id for the current authenticated user.';


-- 6. Create a helper function to check user role
-- This will be useful for RLS policies
CREATE OR REPLACE FUNCTION public.user_has_role(required_role TEXT)
RETURNS BOOLEAN
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
DECLARE
  user_role TEXT;
BEGIN
  SELECT Profile.user_role INTO user_role
  FROM public.Profile
  WHERE Profile.id = auth.uid();

  RETURN user_role = required_role;
END;
$$;

COMMENT ON FUNCTION public.user_has_role(TEXT) IS
'Checks if the current user has the specified role.';


-- 7. Grant necessary permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON public.Tenant TO authenticated;
GRANT ALL ON public.Profile TO authenticated;

-- Note: The next migration will need to:
-- 1. Update all existing tables to use proper tenant_id foreign keys
-- 2. Update RLS policies to use get_user_tenant_id() instead of auth.uid()
-- 3. Migrate any existing data to the new structure
