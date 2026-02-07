import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { createPaymentIntent, releaseToSeller } from '@/lib/payments/escrow';

export function useOrder(orderId: string | undefined) {
  return useQuery({
    queryKey: ['order', orderId],
    queryFn: async () => {
      if (!orderId) return null;
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('id', orderId)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!orderId,
  });
}

export function useCreateOrderFromReservation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (reservationId: string) => {
      // RPC stub; if the function does not exist yet, throw a friendly error
      const { data, error } = await supabase.rpc('create_order_from_reservation', {
        _reservation_id: reservationId,
      } as any);
      if (error) throw new Error(error.message || 'Failed to create order');
      await qc.invalidateQueries({ queryKey: ['orders'] });
      return data as { order_id: string } | any;
    },
  });
}

export function useCreatePaymentIntent() {
  return useMutation({
    mutationFn: async (orderId: string) => createPaymentIntent(orderId),
  });
}

export function useReleaseOrder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (orderId: string) => releaseToSeller(orderId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['orders'] });
    },
  });
}

export function useCreateOrderFromCart() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (items: Array<{ listing_id: string; quantity: number; unit_price: number; currency: string }>) => {
      const { data, error } = await supabase.rpc('create_order_from_cart', { _items: items as any });
      if (error) throw new Error(error.message || 'Failed to create order from cart');
      await qc.invalidateQueries({ queryKey: ['orders'] });
      return data as string;
    },
  });
}


