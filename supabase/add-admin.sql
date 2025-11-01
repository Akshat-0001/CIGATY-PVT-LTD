-- Add additional admin user: com.akshat.dev@gmail.com
-- 
-- STEP 1: If user doesn't exist yet, run this in Supabase Dashboard:
--   Go to: Authentication > Users > Add User
--   Email: com.akshat.dev@gmail.com
--   Password: (set your preferred password)
--   Auto Confirm: Yes
--
-- STEP 2: After user is created, run the SQL below

-- Get the user ID and create/update admin profile
INSERT INTO public.profiles (id, full_name, role, kyc_status)
SELECT 
  id,
  'Akshat Dev',
  'admin',
  'approved'
FROM auth.users
WHERE email = 'com.akshat.dev@gmail.com'
ON CONFLICT (id) DO UPDATE 
SET role = 'admin', kyc_status = 'approved', full_name = 'Akshat Dev';

-- Verify it worked
SELECT 
  u.email,
  p.role,
  p.kyc_status,
  p.full_name
FROM auth.users u
JOIN public.profiles p ON p.id = u.id
WHERE u.email = 'com.akshat.dev@gmail.com';



