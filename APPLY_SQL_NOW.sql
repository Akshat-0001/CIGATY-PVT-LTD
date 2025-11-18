-- ⚠️ CRITICAL: Apply this SQL to fix the "function not found" error!

-- Step 1: Create the confirm_reservation_with_quantity_reduction function
CREATE OR REPLACE FUNCTION public.confirm_reservation_with_quantity_reduction(
  _reservation_id uuid,
  _seller_user_id uuid
) RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  _listing_id uuid;
  _reserved_quantity integer;
  _listing_packaging text;
  _current_quantity integer;
  _buyer_user_id uuid;
BEGIN
  -- Get reservation details and verify seller owns the listing
  SELECT 
    r.listing_id,
    r.quantity,
    r.buyer_user_id,
    l.packaging,
    l.quantity
  INTO _listing_id, _reserved_quantity, _buyer_user_id, _listing_packaging, _current_quantity
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
  
  -- Create notification for buyer (if notifications table exists)
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'notifications') THEN
    INSERT INTO public.notifications (
      user_id, type, title, message, entity_type, entity_id
    )
    VALUES (
      _buyer_user_id,
      'reservation_confirmed',
      'Reservation Confirmed',
      'Your reservation has been confirmed by the seller',
      'reservation',
      _reservation_id
    );
  END IF;
  
  -- Log activity for buyer (if activity_log table exists)
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'activity_log') THEN
    INSERT INTO public.activity_log (
      user_id, activity_type, entity_type, entity_id, metadata
    )
    VALUES (
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
    INSERT INTO public.activity_log (
      user_id, activity_type, entity_type, entity_id, metadata
    )
    VALUES (
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
  END IF;
  
  RETURN _reservation_id;
END $$;

-- Step 2: Grant execute permission
GRANT EXECUTE ON FUNCTION public.confirm_reservation_with_quantity_reduction(uuid, uuid) TO authenticated;

-- Step 3: Verify it exists
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.routines 
    WHERE routine_schema = 'public' 
    AND routine_name = 'confirm_reservation_with_quantity_reduction'
  ) THEN
    RAISE NOTICE '✅ Function created successfully!';
  ELSE
    RAISE EXCEPTION '❌ Function creation failed!';
  END IF;
END $$;

