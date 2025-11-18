-- Payment Flow Restructuring
-- Add payment_percentage to reservations and update payment logic

-- 1) Add payment_percentage column to reservations
alter table public.reservations
  add column if not exists payment_percentage numeric(5,2) default 100;
  -- 100 for bonded warehouse, 20 for through_brand/other

-- 2) Create index for payment_percentage
create index if not exists reservations_payment_percentage_idx on public.reservations(payment_percentage);

-- 3) Update existing reservations based on listing inventory_type
-- Set payment_percentage to 100 for bonded_warehouse, 20 for others
update public.reservations r
set payment_percentage = case
  when exists (
    select 1 from public.listings l 
    where l.id = r.listing_id 
    and l.inventory_type = 'bonded_warehouse'
  ) then 100
  else 20
end
where payment_percentage = 100; -- Only update if still at default

-- 4) Note: escrow_provider and escrow_method columns are kept for backward compatibility
-- but should not be used in new code. The application will use payment_percentage instead.

-- 5) Add payment_percentage to orders table if it exists
do $$ 
begin
  if exists (select 1 from information_schema.tables where table_schema = 'public' and table_name = 'orders') then
    alter table public.orders
      add column if not exists payment_percentage numeric(5,2) default 100;
    
    create index if not exists orders_payment_percentage_idx on public.orders(payment_percentage);
  end if;
end $$;


