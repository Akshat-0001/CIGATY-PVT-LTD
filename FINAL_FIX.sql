-- ⚠️ RUN THIS IN SUPABASE SQL EDITOR - IT WILL CREATE THE FUNCTION

-- First, drop it if exists (clean start)
DROP FUNCTION IF EXISTS public.confirm_reservation_with_quantity_reduction(uuid, uuid);

-- Create the function with EXACT parameter names
CREATE OR REPLACE FUNCTION public.confirm_reservation_with_quantity_reduction(
  _reservation_id uuid,
  _seller_user_id uuid
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $func$
DECLARE
  _listing_id uuid;
  _reserved_quantity integer;
  _current_quantity integer;
  _buyer_user_id uuid;
BEGIN
  -- Get reservation details
  SELECT 
    r.listing_id,
    r.quantity,
    r.buyer_user_id,
    l.quantity
  INTO _listing_id, _reserved_quantity, _buyer_user_id, _current_quantity
  FROM public.reservations r
  JOIN public.listings l ON l.id = r.listing_id
  WHERE r.id = _reservation_id
    AND r.status = 'pending'
    AND l.seller_user_id = _seller_user_id;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Reservation not found or not owned by seller';
  END IF;
  
  IF _current_quantity < _reserved_quantity THEN
    RAISE EXCEPTION 'Insufficient quantity available. Current: %, Requested: %', _current_quantity, _reserved_quantity;
  END IF;
  
  -- Update reservation
  UPDATE public.reservations
  SET status = 'confirmed', confirmed_at = now(), updated_at = now()
  WHERE id = _reservation_id;
  
  -- Reduce listing quantity
  UPDATE public.listings
  SET quantity = quantity - _reserved_quantity, updated_at = now()
  WHERE id = _listing_id;
  
  RETURN _reservation_id;
END;
$func$;

-- Grant permission
GRANT EXECUTE ON FUNCTION public.confirm_reservation_with_quantity_reduction(uuid, uuid) TO authenticated;

-- Refresh schema cache (important for PostgREST)
NOTIFY pgrst, 'reload schema';

-- Verify
SELECT 
  routine_name,
  routine_type
FROM information_schema.routines 
WHERE routine_schema = 'public' 
AND routine_name = 'confirm_reservation_with_quantity_reduction';

