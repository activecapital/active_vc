-- =============================================
-- admin_users: whitelist of who can log in
-- =============================================
CREATE TABLE IF NOT EXISTS public.admin_users (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  first_name TEXT NOT NULL CHECK (first_name <> ''),
  last_name TEXT NOT NULL CHECK (last_name <> ''),
  middle_name TEXT,
  primary_phone_country_code TEXT,
  primary_phone_number TEXT,
  secondary_phone_country_code TEXT,
  secondary_phone_number TEXT,
  primary_email TEXT NOT NULL CHECK (primary_email <> ''),
  secondary_email TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;

-- Only service role (server-side) can read this table
CREATE POLICY "Service role only" ON public.admin_users
  USING (auth.role() = 'service_role');

-- Seed: first admin user
INSERT INTO public.admin_users (
  first_name, last_name, middle_name,
  primary_phone_country_code, primary_phone_number,
  secondary_phone_country_code, secondary_phone_number,
  primary_email, secondary_email
) VALUES (
  'Huey', 'Ly', 'Quang',
  '+86', '18291852125',
  '+1', '2184602308',
  'huey@active.vc', 'hueyl77@gmail.com'
);

-- =============================================
-- profiles: extra data linked to auth.users
-- =============================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  first_name TEXT,
  last_name TEXT,
  primary_email TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Service role full access" ON public.profiles
  USING (auth.role() = 'service_role');

-- Auto-create profile row when a new auth user is created
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, primary_email)
  VALUES (NEW.id, NEW.email)
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
