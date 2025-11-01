-- Run this AFTER ALL_SETUP.sql executes successfully
INSERT INTO public.profiles (id, full_name, role, kyc_status)
VALUES ('ce39e875-087d-4580-9380-dc1c3c92accf', 'Cigaty Director', 'admin', 'approved')
ON CONFLICT (id) DO UPDATE 
SET role = 'admin', kyc_status = 'approved';
