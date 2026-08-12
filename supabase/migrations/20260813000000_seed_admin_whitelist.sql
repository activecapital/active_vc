-- Grant admin access to Pat and Chris.
-- Their profiles rows are created automatically by the on_auth_user_created
-- trigger the first time they sign in with Google; admin_users is the
-- whitelist that /auth/callback checks after the OAuth code exchange.
INSERT INTO public.admin_users (first_name, last_name, primary_email)
SELECT 'Pat', 'Matthews', 'pat@active.vc'
WHERE NOT EXISTS (
  SELECT 1 FROM public.admin_users WHERE primary_email = 'pat@active.vc'
);

INSERT INTO public.admin_users (first_name, last_name, primary_email)
SELECT 'Chris', 'Saum', 'chris@active.vc'
WHERE NOT EXISTS (
  SELECT 1 FROM public.admin_users WHERE primary_email = 'chris@active.vc'
);

-- Huey was seeded in 20260420000001_admin_auth.sql; this covers databases
-- where that seed row is missing.
INSERT INTO public.admin_users (first_name, last_name, primary_email, secondary_email)
SELECT 'Huey', 'Ly', 'huey@active.vc', 'hueyl77@gmail.com'
WHERE NOT EXISTS (
  SELECT 1 FROM public.admin_users
  WHERE primary_email = 'huey@active.vc' OR secondary_email = 'huey@active.vc'
);
