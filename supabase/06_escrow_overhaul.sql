-- Escrow & Reservation Overhaul
-- Warehouses, listings escrow fields, reservations expiry, auto-cancel procedure

-- 1) Warehouses table
create table if not exists public.warehouses (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text,
  phone text,
  address text,
  contact_person text,
  can_provide_escrow boolean default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.warehouses enable row level security;

do $$ begin
  if not exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'warehouses' and policyname = 'warehouses-read'
  ) then
    create policy "warehouses-read" on public.warehouses for select using (true);
  end if;
end $$;

do $$ begin
  if not exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'warehouses' and policyname = 'warehouses-admin'
  ) then
    create policy "warehouses-admin" on public.warehouses for all using (
      exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
    );
  end if;
end $$;

-- 2) Listings escrow fields
alter table public.listings 
  add column if not exists escrow_provider text default 'optional'; -- 'direct_payment' | 'optional' | 'cigaty_only' | 'warehouse_only'

alter table public.listings 
  add column if not exists warehouse_id uuid references public.warehouses(id);

alter table public.listings 
  add column if not exists payment_gateway text default 'stripe'; -- 'stripe' | 'razorpay'

create index if not exists listings_escrow_provider_idx on public.listings(escrow_provider);
create index if not exists listings_warehouse_idx on public.listings(warehouse_id);

-- 3) Reservations expiry + fields
alter table public.reservations 
  add column if not exists expires_at timestamptz;

alter table public.reservations 
  add column if not exists escrow_method text default 'cigaty'; -- 'cigaty' | 'warehouse'

alter table public.reservations 
  add column if not exists payment_gateway text; -- nullable: 'stripe' | 'razorpay'

create index if not exists reservations_expires_at_idx on public.reservations(expires_at) where status = 'pending';

-- 4) Auto-cancel expired reservations (run via pg_cron or manual job)
create or replace function public.auto_cancel_expired_reservations()
returns void
language plpgsql
security definer
as $$
declare
  r record;
begin
  for r in
    select id, listing_id, quantity
    from public.reservations
    where status = 'pending'
      and (
        (expires_at is not null and expires_at < now())
        or (expires_at is null and created_at < now() - interval '3 days')
      )
  loop
    update public.reservations
    set status = 'cancelled', cancelled_at = now(), updated_at = now()
    where id = r.id;
    -- NO stock deduction was done at pending stage, so nothing to reverse here
  end loop;
end;
$$;

grant execute on function public.auto_cancel_expired_reservations() to authenticated;

-- 5) Update create_reservation_with_notification to include expiry & escrow_method (if function exists)
-- Best-effort replacement; skip if function not present
do $$
begin
  perform 1 from pg_proc where proname = 'create_reservation_with_notification';
  if found then
    create or replace function public.create_reservation_with_notification(
      _buyer_user_id uuid,
      _listing_id uuid,
      _quantity integer,
      _price_per_unit numeric,
      _currency text default 'EUR',
      _notes text default null,
      _escrow_method text default 'cigaty'
    ) returns uuid language plpgsql security definer as $$
    declare
      _reservation_id uuid;
      _seller_user_id uuid;
      _seller_role text;
    begin
      select seller_user_id into _seller_user_id from public.listings where id = _listing_id;
      select role into _seller_role from public.profiles where id = _seller_user_id;
      if _seller_role = 'admin' then
        raise exception 'Admin listings must use direct checkout via cart.';
      end if;

      insert into public.reservations (
        buyer_user_id, listing_id, quantity, price_per_unit, currency, notes, escrow_method, expires_at, status
      ) values (
        _buyer_user_id, _listing_id, _quantity, _price_per_unit, _currency, _notes, _escrow_method, now() + interval '3 days', 'pending'
      ) returning id into _reservation_id;

      insert into public.notifications (user_id, type, title, message, entity_type, entity_id)
      values (
        _seller_user_id, 'reservation_created', 'New Reservation', 'A buyer has reserved your product', 'reservation', _reservation_id
      );

      insert into public.activity_log (user_id, activity_type, entity_type, entity_id, metadata)
      values (
        _buyer_user_id, 'reservation_created', 'reservation', _reservation_id,
        jsonb_build_object('listing_id', _listing_id, 'quantity', _quantity, 'escrow_method', _escrow_method)
      );

      return _reservation_id;
    end $$;
  end if;
end$$;


