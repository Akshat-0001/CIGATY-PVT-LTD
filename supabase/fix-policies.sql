-- Fix infinite recursion in profiles policies
-- Run this in Supabase SQL Editor

-- Drop existing problematic policies
drop policy if exists "profiles-admin" on public.profiles;
drop policy if exists "profiles-self" on public.profiles;
drop policy if exists "profiles-admin-read" on public.profiles;
drop policy if exists "profiles-admin-update" on public.profiles;
drop policy if exists "profiles-self-select" on public.profiles;
drop policy if exists "profiles-self-update" on public.profiles;

-- Create a function that bypasses RLS to check admin status
-- This uses SECURITY DEFINER to run with elevated privileges and bypasses RLS
create or replace function public.is_admin()
returns boolean
language plpgsql
security definer
stable
as $$
declare
  admin_check boolean;
begin
  -- This query bypasses RLS because function is SECURITY DEFINER
  select role = 'admin' into admin_check
  from public.profiles
  where id = auth.uid()
  limit 1;
  
  return coalesce(admin_check, false);
end;
$$;

-- Allow users to read their own profile (simple - no recursion)
create policy "profiles-self-select" on public.profiles 
  for select 
  using (auth.uid() = id);

-- Allow users to update their own profile
create policy "profiles-self-update" on public.profiles 
  for update 
  using (auth.uid() = id) 
  with check (auth.uid() = id);

-- Allow admins to read all profiles (uses function that bypasses RLS)
create policy "profiles-admin-read" on public.profiles 
  for select 
  using (public.is_admin() = true);

-- Allow admins to update all profiles
create policy "profiles-admin-update" on public.profiles 
  for update 
  using (public.is_admin() = true);

-- Also fix listings admin policy to use same pattern
drop policy if exists "listings-admin-update" on public.listings;
create policy "listings-admin-update" on public.listings 
  for update 
  using (public.is_admin() = true);

