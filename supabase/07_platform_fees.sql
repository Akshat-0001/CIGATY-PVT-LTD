-- Platform Fees Management
-- Create platform_fees table for category-based fee system

-- 1) Create platform_fees table
create table if not exists public.platform_fees (
  id uuid primary key default gen_random_uuid(),
  category text not null unique,
  fee_amount numeric(10,2) not null,
  currency char(3) default 'GBP',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 2) Enable RLS
alter table public.platform_fees enable row level security;

-- 3) RLS Policies
-- Public read access
do $$ begin
  if not exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'platform_fees' and policyname = 'platform_fees_read'
  ) then
    create policy "platform_fees_read" on public.platform_fees
      for select
      using (true);
  end if;
end $$;

-- Admin write access
do $$ begin
  if not exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'platform_fees' and policyname = 'platform_fees_admin'
  ) then
    create policy "platform_fees_admin" on public.platform_fees
      for all
      using (
        exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
      );
  end if;
end $$;

-- 4) Insert default fees
insert into public.platform_fees (category, fee_amount, currency)
values
  ('Beer', 3.00, 'GBP'),
  ('Wine', 2.00, 'GBP'),
  ('Spirits', 3.00, 'GBP'),
  ('Champagne', 3.00, 'GBP'),
  ('Soft Drinks', 3.00, 'GBP'),
  ('Other', 3.00, 'GBP')
on conflict (category) do nothing;

-- 5) Create index
create index if not exists platform_fees_category_idx on public.platform_fees(category);

-- 6) Create updated_at trigger
create or replace function public.set_platform_fees_updated_at() returns trigger language plpgsql as $$
begin 
  new.updated_at = now(); 
  return new; 
end $$;

drop trigger if exists trg_platform_fees_updated_at on public.platform_fees;
create trigger trg_platform_fees_updated_at 
  before update on public.platform_fees
  for each row execute function public.set_platform_fees_updated_at();


