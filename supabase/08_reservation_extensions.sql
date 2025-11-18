-- Reservation Extensions
-- Add columns and RPC for admin to extend reservation expiry dates

-- 1) Add extension columns to reservations table
alter table public.reservations
  add column if not exists extended_until timestamptz,
  add column if not exists extension_reason text,
  add column if not exists extended_by uuid references public.profiles(id);

-- 2) Create index for extended_until
create index if not exists reservations_extended_until_idx on public.reservations(extended_until);

-- 3) Create RPC function for extending reservations (admin only)
create or replace function public.extend_reservation(
  _reservation_id uuid,
  _new_expiry_date timestamptz,
  _reason text default null
) returns void
language plpgsql
security definer
as $$
declare
  _admin_id uuid;
begin
  -- Verify user is admin
  select id into _admin_id 
  from public.profiles 
  where id = auth.uid() and role = 'admin';
  
  if _admin_id is null then
    raise exception 'Only admins can extend reservations';
  end if;
  
  -- Update reservation
  update public.reservations
  set extended_until = _new_expiry_date,
      extension_reason = _reason,
      extended_by = _admin_id,
      updated_at = now()
  where id = _reservation_id;
  
  if not found then
    raise exception 'Reservation not found';
  end if;
end $$;

-- 4) Grant execute permission to authenticated users (function will check admin role internally)
grant execute on function public.extend_reservation(uuid, timestamptz, text) to authenticated;


