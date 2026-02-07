-- Step 1: Check if function exists
SELECT 
  routine_name,
  routine_type,
  data_type as return_type
FROM information_schema.routines 
WHERE routine_schema = 'public' 
AND routine_name = 'confirm_reservation_with_quantity_reduction';

-- Step 2: If function doesn't exist, create it
-- If the above query returns nothing, run this:

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.routines 
    WHERE routine_schema = 'public' 
    AND routine_name = 'confirm_reservation_with_quantity_reduction'
  ) THEN
    
    -- Drop function if exists (clean start)
    DROP FUNCTION IF EXISTS public.confirm_reservation_with_quantity_reduction(uuid, uuid);
    
    -- Create the function
    CREATE FUNCTION public.confirm_reservation_with_quantity_reduction(
      _reservation_id uuid,
      _seller_user_id uuid
    ) 
    RETURNS uuid 
    LANGUAGE plpgsql 
    SECURITY DEFINER 
    AS $$
    DECLARE
      _listing_id uuid;
      _reserved_quantity integer;
      _current_quantity integer;
      _buyer_user_id uuid;
    BEGIN
      -- Get reservation details and verify seller owns the listing
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
      
      -- Check sufficient quantity
      IF _current_quantity < _reserved_quantity THEN
        RAISE EXCEPTION 'Insufficient quantity available. Current: %, Requested: %', _current_quantity, _reserved_quantity;
      END IF;
      
      -- Update reservation status
      UPDATE public.reservations
      SET 
        status = 'confirmed',
        confirmed_at = now(),
        updated_at = now()
      WHERE id = _reservation_id;
      
      -- Reduce listing quantity
      UPDATE public.listings
      SET 
        quantity = quantity - _reserved_quantity,
        updated_at = now()
      WHERE id = _listing_id;
      
      RETURN _reservation_id;
    END $$;
    
    -- Grant execute permission
    GRANT EXECUTE ON FUNCTION public.confirm_reservation_with_quantity_reduction(uuid, uuid) TO authenticated;
    
    RAISE NOTICE '✅ Function created successfully!';
  ELSE
    RAISE NOTICE '✅ Function already exists!';
  END IF;
END $$;

-- Step 3: Verify it exists now
SELECT 
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM information_schema.routines 
      WHERE routine_schema = 'public' 
      AND routine_name = 'confirm_reservation_with_quantity_reduction'
    ) 
    THEN '✅ Function EXISTS - You can now test it!'
    ELSE '❌ Function NOT FOUND - Please check errors above'
  END as verification_result;

-- Step 4: Check function parameters
SELECT 
  p.parameter_name,
  p.data_type,
  p.parameter_default,
  p.ordinal_position
FROM information_schema.parameters p
WHERE p.specific_schema = 'public'
AND p.specific_name LIKE '%confirm_reservation_with_quantity_reduction%'
ORDER BY p.ordinal_position;

