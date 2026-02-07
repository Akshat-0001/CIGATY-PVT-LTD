-- Core schema for Cigaty Trade Portal (Supabase SQL)
create type approval_status as enum ('pending','approved','rejected');
create type duty_status as enum ('under_bond','duty_paid');
create type pack_type as enum ('bottle','can','keg','other');

create table if not exists public.brands (
  id bigint generated always as identity primary key,
  name text not null unique
);

create table if not exists public.categories (
  id bigint generated always as identity primary key,
  name text not null unique
);

create table if not exists public.countries (
  id bigint generated always as identity primary key,
  iso2 char(2) not null unique,
  name text not null
);

create table if not exists public.companies (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  country_id bigint references public.countries(id),
  created_at timestamptz not null default now()
);

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  company_id uuid references public.companies(id) on delete set null,
  full_name text,
  role text not null default 'user',
  kyc_status text not null default 'pending',
  currency char(3) not null default 'EUR',
  created_at timestamptz not null default now()
);

create table if not exists public.kyc_documents (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  step smallint not null,
  file_url text not null,
  status text not null default 'pending',
  notes text,
  created_at timestamptz not null default now()
);

create table if not exists public.liquor_catalog (
  id bigint generated always as identity primary key,
  item_code text unique,
  brand_id bigint references public.brands(id),
  category_id bigint references public.categories(id),
  name text not null,
  vintage text,
  abv_percent numeric(5,2),
  volume_ml int,
  pack_per_case int not null default 6,
  pack_type pack_type not null default 'bottle',
  origin_country_id bigint references public.countries(id),
  description text,
  image_url text,
  created_at timestamptz not null default now()
);

create table if not exists public.listings (
  id uuid primary key default gen_random_uuid(),
  product_id bigint not null references public.liquor_catalog(id) on delete restrict,
  seller_company_id uuid references public.companies(id) on delete set null,
  seller_user_id uuid references public.profiles(id) on delete set null,
  duty duty_status not null default 'duty_paid',
  qty_cases int not null check (qty_cases >= 0),
  price_per_case numeric(12,2) not null check (price_per_case >= 0),
  currency char(3) not null default 'EUR',
  location text,
  market_restrictions text[],
  notes text,
  status approval_status not null default 'pending',
  is_active boolean not null default true,
  approved_at timestamptz,
  rejected_reason text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists listings_product_idx on public.listings(product_id);
create index if not exists listings_status_idx on public.listings(status, is_active);

create or replace function public.set_updated_at() returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end $$;
drop trigger if exists trg_listings_updated_at on public.listings;
create trigger trg_listings_updated_at before update on public.listings
for each row execute function public.set_updated_at();

create or replace view public.live_offers as
select
  l.id as listing_id,
  coalesce(c.name,'—') as supplier,
  p.item_code,
  p.name as description,
  l.qty_cases as stock_cases,
  l.price_per_case,
  l.currency,
  l.duty,
  p.pack_per_case,
  p.volume_ml,
  b.name as brand,
  cat.name as category
from public.listings l
join public.liquor_catalog p on p.id = l.product_id
left join public.companies c on c.id = l.seller_company_id
left join public.brands b on b.id = p.brand_id
left join public.categories cat on cat.id = p.category_id
where l.status = 'approved' and l.is_active = true and l.qty_cases > 0
order by l.created_at desc;


alter table public.companies enable row level security;
alter table public.profiles enable row level security;
alter table public.kyc_documents enable row level security;
alter table public.liquor_catalog enable row level security;
alter table public.listings enable row level security;

-- Profiles: user reads self; admin reads/updates all
drop policy if exists "profiles-self" on public.profiles;
create policy "profiles-self" on public.profiles for select using (auth.uid() = id);
drop policy if exists "profiles-admin" on public.profiles;
create policy "profiles-admin" on public.profiles for all using (
  exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
);

-- Catalogue readable by all (public)
drop policy if exists "catalogue-read" on public.liquor_catalog;
create policy "catalogue-read" on public.liquor_catalog for select using (true);

-- KYC docs
drop policy if exists "kyc-self" on public.kyc_documents;
create policy "kyc-self" on public.kyc_documents for all using (user_id = auth.uid()) with check (user_id = auth.uid());
drop policy if exists "kyc-review" on public.kyc_documents;
create policy "kyc-review" on public.kyc_documents for all using (
  exists (select 1 from public.profiles p where p.id = auth.uid() and p.role in ('verifier','admin'))
);

-- Listings
drop policy if exists "listings-read" on public.listings;
create policy "listings-read" on public.listings for select using (
  status = 'approved' and is_active = true or seller_user_id = auth.uid()
);
drop policy if exists "listings-insert-own" on public.listings;
create policy "listings-insert-own" on public.listings for insert with check (seller_user_id = auth.uid());
drop policy if exists "listings-update-own" on public.listings;
create policy "listings-update-own" on public.listings for update using (seller_user_id = auth.uid()) with check (seller_user_id = auth.uid());
drop policy if exists "listings-admin-update" on public.listings;
create policy "listings-admin-update" on public.listings for update using (
  exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
);


create or replace function public.approve_listing(p_id uuid)
returns void language plpgsql security definer as $$
begin
  if not exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin') then
    raise exception 'not_admin';
  end if;
  update public.listings set status = 'approved', approved_at = now(), rejected_reason = null where id = p_id;
end $$;

create or replace function public.reject_listing(p_id uuid, reason text)
returns void language plpgsql security definer as $$
begin
  if not exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin') then
    raise exception 'not_admin';
  end if;
  update public.listings set status = 'rejected', rejected_reason = reason where id = p_id;
end $$;


