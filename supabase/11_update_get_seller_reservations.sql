-- Update get_seller_reservations RPC to include extension fields and payment_percentage

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
  expires_at timestamptz,
  extended_until timestamptz,
  extension_reason text,
  extended_by uuid,
  payment_percentage numeric,
  -- Listing fields
  product_name text,
  category text,
  subcategory text,
  packaging text,
  image_urls text[],
  bottles_per_case integer,
  inventory_type text,
  -- Buyer fields
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
    r.expires_at,
    r.extended_until,
    r.extension_reason,
    r.extended_by,
    r.payment_percentage,
    -- Listing fields
    l.product_name,
    l.category,
    l.subcategory,
    l.packaging,
    l.image_urls,
    l.bottles_per_case,
    l.inventory_type,
    -- Buyer fields - get from profiles and auth.users
    p.full_name as buyer_full_name,
    au.email as buyer_email,
    p.phone as buyer_phone,
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

-- Grant execute permission
grant execute on function public.get_seller_reservations(uuid) to authenticated;


