-- Inventory Location System Overhaul
-- Create bonded_warehouses table and add inventory_type columns to listings

-- 1) Create bonded_warehouses table
create table if not exists public.bonded_warehouses (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  address text,
  contact_person text,
  email text,
  phone text,
  is_active boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 2) Enable RLS on bonded_warehouses
alter table public.bonded_warehouses enable row level security;

-- 3) RLS Policies for bonded_warehouses
-- Public read access
do $$ begin
  if not exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'bonded_warehouses' and policyname = 'bonded_warehouses_read'
  ) then
    create policy "bonded_warehouses_read" on public.bonded_warehouses
      for select
      using (true);
  end if;
end $$;

-- Admin write access
do $$ begin
  if not exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'bonded_warehouses' and policyname = 'bonded_warehouses_admin'
  ) then
    create policy "bonded_warehouses_admin" on public.bonded_warehouses
      for all
      using (
        exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
      );
  end if;
end $$;

-- 4) Add inventory_type column to listings
alter table public.listings
  add column if not exists inventory_type text default 'bonded_warehouse';
  -- Values: 'bonded_warehouse', 'through_brand', 'other'

-- 5) Add custom_warehouse_name column to listings
alter table public.listings
  add column if not exists custom_warehouse_name text;

-- 6) Update warehouse_id to reference bonded_warehouses (if needed)
-- Note: We keep warehouse_id as-is for backward compatibility, but new listings should use bonded_warehouses
-- The application logic will handle the distinction

-- 7) Create indexes
create index if not exists listings_inventory_type_idx on public.listings(inventory_type);
create index if not exists bonded_warehouses_active_idx on public.bonded_warehouses(is_active);

-- 8) Create updated_at trigger for bonded_warehouses
create or replace function public.set_bonded_warehouses_updated_at() returns trigger language plpgsql as $$
begin 
  new.updated_at = now(); 
  return new; 
end $$;

drop trigger if exists trg_bonded_warehouses_updated_at on public.bonded_warehouses;
create trigger trg_bonded_warehouses_updated_at 
  before update on public.bonded_warehouses
  for each row execute function public.set_bonded_warehouses_updated_at();


