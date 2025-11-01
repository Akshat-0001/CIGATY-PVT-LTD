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
