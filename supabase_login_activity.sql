-- ==============================================================================
-- ZENVILO E-COMMERCE: SUPABASE LOGIN ACTIVITY & AUDIT LOG MIGRATION
-- ==============================================================================
-- This migration creates a secure login activity tracking system for Zenvilo.
--
-- Features:
-- 0. Ensures `public.user_roles` exists (prevents ERROR 42P01: relation does not exist)
-- 1. Table `public.login_activity` (tracks every user sign-in session)
-- 2. View `public.admin_user_login_summary` (aggregates login metrics per user)
-- 3. Automatic trigger / client recording on Supabase Auth
-- 4. Row Level Security (RLS) ensuring ONLY store administrators can view logs
-- 5. Zero password or secret exposure
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- STEP 0: ENSURE USER ROLES TABLE EXISTS
-- ------------------------------------------------------------------------------
-- Prevents: ERROR: 42P01: relation "public.user_roles" does not exist
CREATE TABLE IF NOT EXISTS public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'customer' CHECK (role IN ('customer', 'admin')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT uq_user_role UNIQUE (user_id, role)
);

CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON public.user_roles(user_id);
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can read own role" ON public.user_roles;
CREATE POLICY "Users can read own role"
  ON public.user_roles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- ------------------------------------------------------------------------------
-- STEP 1: CREATE LOGIN ACTIVITY TABLE
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.login_activity (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  login_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  logout_at TIMESTAMPTZ,
  login_status TEXT NOT NULL DEFAULT 'success' CHECK (login_status IN ('success', 'failed')),
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_login_activity_user_id ON public.login_activity(user_id);
CREATE INDEX IF NOT EXISTS idx_login_activity_login_at ON public.login_activity(login_at DESC);

-- Enable Row Level Security
ALTER TABLE public.login_activity ENABLE ROW LEVEL SECURITY;

-- Policy 1: Authenticated users can insert their own login events upon sign in
DROP POLICY IF EXISTS "Users can record own login activity" ON public.login_activity;
CREATE POLICY "Users can record own login activity"
  ON public.login_activity
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Policy 2: Users can update their own logout time upon signing out
DROP POLICY IF EXISTS "Users can update own logout activity" ON public.login_activity;
CREATE POLICY "Users can update own logout activity"
  ON public.login_activity
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Policy 3: STRICT ADMIN-ONLY access to view login logs
DROP POLICY IF EXISTS "Admins can view all login activity" ON public.login_activity;
CREATE POLICY "Admins can view all login activity"
  ON public.login_activity
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_roles.user_id = auth.uid()
        AND user_roles.role = 'admin'
    )
  );

-- ------------------------------------------------------------------------------
-- STEP 2: CREATE ADMIN LOGIN SUMMARY VIEW
-- ------------------------------------------------------------------------------
CREATE OR REPLACE VIEW public.admin_user_login_summary
WITH (security_invoker = true)
AS
SELECT
  u.id AS user_id,
  u.email AS email,
  u.created_at AS account_created_at,
  COALESCE(u.last_sign_in_at, MAX(la.login_at)) AS last_login_at,
  COUNT(la.id) AS recorded_login_count,
  MAX(la.logout_at) AS last_logout_at,
  COALESCE(MAX(la.login_status), 'active') AS latest_status
FROM auth.users u
LEFT JOIN public.login_activity la ON la.user_id = u.id
GROUP BY u.id, u.email, u.created_at, u.last_sign_in_at;

-- Grant select to authenticated users (RLS on underlying tables governs access)
GRANT SELECT ON public.admin_user_login_summary TO authenticated;

-- ==============================================================================
-- 3. Optional Convenience Helper: Record Login RPC
-- Allows the frontend to safely record a login without manual raw SQL
-- ==============================================================================
CREATE OR REPLACE FUNCTION public.record_user_login(
  p_user_agent TEXT DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID;
  v_email TEXT;
  v_activity_id UUID;
BEGIN
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  SELECT email INTO v_email FROM auth.users WHERE id = v_user_id;

  INSERT INTO public.login_activity (
    user_id,
    email,
    login_at,
    login_status,
    user_agent
  )
  VALUES (
    v_user_id,
    v_email,
    NOW(),
    'success',
    p_user_agent
  )
  RETURNING id INTO v_activity_id;

  RETURN v_activity_id;
END;
$$;

GRANT EXECUTE ON FUNCTION public.record_user_login(TEXT) TO authenticated;
