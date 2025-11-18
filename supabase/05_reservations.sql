-- Reservations, Cart, Activity Log, and Notifications Schema and RPC Functions

-- Create activity_log table
create table if not exists public.activity_log (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  activity_type text not null, -- 'cart_added', 'reservation_created', 'reservation_confirmed', 'reservation_cancelled', etc.
  entity_type text, -- 'listing', 'reservation', 'cart_item'
  entity_id uuid,
  metadata jsonb, -- Store additional data like quantity, price, etc.
  created_at timestamptz not null default now()
);

create index if not exists activity_log_user_idx on public.activity_log(user_id, created_at desc);
create index if not exists activity_log_entity_idx on public.activity_log(entity_type, entity_id);

-- Enable RLS on activity_log
alter table public.activity_log enable row level security;

-- Activity log policies
create policy "Users can view own activities"
  on public.activity_log for select
  using (user_id = auth.uid());

create policy "System can insert activities"
  on public.activity_log for insert
  with check (true); -- Will be controlled via RPC functions

-- RPC Function: Confirm reservation and reduce quantity
create or replace function public.confirm_reservation_with_quantity_reduction(
  _reservation_id uuid,
  _seller_user_id uuid
) returns uuid language plpgsql security definer as $$
declare
  _listing_id uuid;
  _reserved_quantity integer;
  _listing_packaging text;
  _current_quantity integer;
  _buyer_user_id uuid;
begin
  -- Get reservation details and verify seller owns the listing
  select 
    r.listing_id,
    r.quantity,
    r.buyer_user_id,
    l.packaging,
    l.quantity
  into _listing_id, _reserved_quantity, _buyer_user_id, _listing_packaging, _current_quantity
  from public.reservations r
  join public.listings l on l.id = r.listing_id
  where r.id = _reservation_id
    and r.status = 'pending'
    and l.seller_user_id = _seller_user_id;
  
  if not found then
    raise exception 'Reservation not found or not owned by seller';
  end if;
  
  -- Check sufficient quantity
  if _current_quantity < _reserved_quantity then
    raise exception 'Insufficient quantity available. Current: %, Requested: %', _current_quantity, _reserved_quantity;
  end if;
  
  -- Update reservation status
  update public.reservations
  set 
    status = 'confirmed',
    confirmed_at = now(),
    updated_at = now()
  where id = _reservation_id;
  
  -- Reduce listing quantity
  update public.listings
  set 
    quantity = quantity - _reserved_quantity,
    updated_at = now()
  where id = _listing_id;
  
  -- Create notification for buyer
  insert into public.notifications (
    user_id, type, title, message, entity_type, entity_id
  )
  values (
    _buyer_user_id,
    'reservation_confirmed',
    'Reservation Confirmed',
    'Your reservation has been confirmed by the seller',
    'reservation',
    _reservation_id
  );
  
  -- Log activity for buyer
  insert into public.activity_log (
    user_id, activity_type, entity_type, entity_id, metadata
  )
  values (
    _buyer_user_id,
    'reservation_confirmed',
    'reservation',
    _reservation_id,
    jsonb_build_object(
      'listing_id', _listing_id,
      'quantity', _reserved_quantity,
      'status', 'confirmed',
      'confirmed_by', _seller_user_id
    )
  );
  
  -- Log activity for seller
  insert into public.activity_log (
    user_id, activity_type, entity_type, entity_id, metadata
  )
  values (
    _seller_user_id,
    'reservation_confirmed',
    'reservation',
    _reservation_id,
    jsonb_build_object(
      'listing_id', _listing_id,
      'quantity', _reserved_quantity,
      'buyer_user_id', _buyer_user_id,
      'status', 'confirmed'
    )
  );
  
  return _reservation_id;
end $$;

-- RPC Function: Get seller reservations with enhanced details (INCLUDING BUYER INFO)
create or replace function public.get_seller_reservations(
  _seller_user_id uuid
) returns table (
  id uuid,
  buyer_user_id uuid,
  listing_id uuid,
  quantity integer,
  price_per_unit numeric,
  currency text,
  status text,
  notes text,
  created_at timestamptz,
  updated_at timestamptz,
  confirmed_at timestamptz,
  cancelled_at timestamptz,
  -- Listing fields
  product_name text,
  category text,
  subcategory text,
  packaging text,
  image_urls text[],
  bottles_per_case integer,
  -- Buyer fields (NEW - THIS WAS MISSING!)
  buyer_full_name text,
  buyer_email text,
  buyer_phone text,
  buyer_company_id uuid,
  buyer_company_name text,
  buyer_company_country text
) language plpgsql security definer as $$
begin
  return query
  select
    r.id,
    r.buyer_user_id,
    r.listing_id,
    r.quantity,
    r.price_per_unit,
    r.currency,
    r.status,
    r.notes,
    r.created_at,
    r.updated_at,
    r.confirmed_at,
    r.cancelled_at,
    -- Listing fields
    l.product_name,
    l.category,
    l.subcategory,
    l.packaging,
    l.image_urls,
    l.bottles_per_case,
    -- Buyer fields - get from profiles and auth.users
    p.full_name as buyer_full_name,
    au.email as buyer_email,
    null as buyer_phone,  -- Phone may not exist in profiles table - handle in app
    p.company_id as buyer_company_id,
    c.name as buyer_company_name,
    co.name as buyer_company_country
  from public.reservations r
  join public.listings l on l.id = r.listing_id
  left join public.profiles p on p.id = r.buyer_user_id
  left join auth.users au on au.id = r.buyer_user_id
  left join public.companies c on c.id = p.company_id
  left join public.countries co on co.id = c.country_id
  where l.seller_user_id = _seller_user_id
  order by r.created_at desc;
end $$;

-- RPC Function: Get user activities (buyer and seller combined)
create or replace function public.get_user_activities(
  _user_id uuid,
  _limit integer default 50
) returns table (
  id uuid,
  user_id uuid,
  activity_type text,
  entity_type text,
  entity_id uuid,
  metadata jsonb,
  created_at timestamptz,
  -- Additional fields from related entities
  product_name text,
  product_image text,
  category text,
  quantity integer,
  price numeric,
  currency text,
  status text
) language plpgsql security definer as $$
begin
  return query
  select
    a.id,
    a.user_id,
    a.activity_type,
    a.entity_type,
    a.entity_id,
    a.metadata,
    a.created_at,
    -- Extract product info from metadata or join with listings
    case 
      when a.entity_type = 'listing' then (select l.product_name from public.listings l where l.id = a.entity_id)
      when a.entity_type = 'reservation' then (select l.product_name from public.reservations r join public.listings l on l.id = r.listing_id where r.id = a.entity_id)
      when a.entity_type = 'cart_item' then (select l.product_name from public.cart_items ci join public.listings l on l.id = ci.listing_id where ci.id = a.entity_id)
      else null
    end as product_name,
    case
      when a.entity_type = 'listing' then (select l.image_urls[1] from public.listings l where l.id = a.entity_id)
      when a.entity_type = 'reservation' then (select l.image_urls[1] from public.reservations r join public.listings l on l.id = r.listing_id where r.id = a.entity_id)
      when a.entity_type = 'cart_item' then (select l.image_urls[1] from public.cart_items ci join public.listings l on l.id = ci.listing_id where ci.id = a.entity_id)
      else null
    end as product_image,
    case
      when a.entity_type = 'listing' then (select l.category from public.listings l where l.id = a.entity_id)
      when a.entity_type = 'reservation' then (select l.category from public.reservations r join public.listings l on l.id = r.listing_id where r.id = a.entity_id)
      when a.entity_type = 'cart_item' then (select l.category from public.cart_items ci join public.listings l on l.id = ci.listing_id where ci.id = a.entity_id)
      else null
    end as category,
    case
      when a.metadata ? 'quantity' then (a.metadata->>'quantity')::integer
      when a.entity_type = 'reservation' then (select r.quantity from public.reservations r where r.id = a.entity_id)
      when a.entity_type = 'cart_item' then (select ci.quantity from public.cart_items ci where ci.id = a.entity_id)
      else null
    end as quantity,
    case
      when a.metadata ? 'price' then (a.metadata->>'price')::numeric
      when a.entity_type = 'reservation' then (select r.price_per_unit * r.quantity from public.reservations r where r.id = a.entity_id)
      when a.entity_type = 'cart_item' then (select ci.price_per_unit * ci.quantity from public.cart_items ci where ci.id = a.entity_id)
      else null
    end as price,
    case
      when a.metadata ? 'currency' then a.metadata->>'currency'
      when a.entity_type = 'reservation' then (select r.currency from public.reservations r where r.id = a.entity_id)
      when a.entity_type = 'cart_item' then (select ci.currency from public.cart_items ci where ci.id = a.entity_id)
      else null
    end as currency,
    case
      when a.metadata ? 'status' then a.metadata->>'status'
      when a.entity_type = 'reservation' then (select r.status::text from public.reservations r where r.id = a.entity_id)
      else null
    end as status
  from public.activity_log a
  where a.user_id = _user_id
  order by a.created_at desc
  limit _limit;
end $$;

-- Grant execute permissions
grant execute on function public.confirm_reservation_with_quantity_reduction(uuid, uuid) to authenticated;
grant execute on function public.get_seller_reservations(uuid) to authenticated;
grant execute on function public.get_user_activities(uuid, integer) to authenticated;

