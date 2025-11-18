import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface CartItem {
  id: string;
  buyer_user_id: string;
  listing_id: string;
  quantity: number;
  price_per_unit: number;
  currency: string;
  notes?: string;
  selected: boolean;
  created_at: string;
  updated_at: string;
  listing?: {
    product_name: string;
    category: string;
    subcategory?: string;
    packaging: string;
    quantity: number;
    image_urls?: string[];
    warehouse_id?: string;
    min_quantity?: number;
    inventory_type?: string;
    custom_warehouse_name?: string;
  };
}

async function fetchCartItems() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from("cart_items")
    .select(`
      *,
      listing:listings!inner(
        product_name,
        category,
        subcategory,
        packaging,
        quantity,
        image_urls,
        warehouse_id,
        min_quantity,
        price_per_case,
        currency,
        inventory_type,
        custom_warehouse_name
      )
    `)
    .eq("buyer_user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data || []) as CartItem[];
}

async function addToCart(listingId: string, quantity: number, pricePerUnit: number, currency: string = "EUR") {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { data, error } = await supabase
    .from("cart_items")
    .upsert({
      buyer_user_id: user.id,
      listing_id: listingId,
      quantity,
      price_per_unit: pricePerUnit,
      currency,
      selected: true,
    }, {
      onConflict: "buyer_user_id,listing_id",
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

async function updateCartItem(id: string, updates: { quantity?: number; selected?: boolean; notes?: string }) {
  const { data, error } = await supabase
    .from("cart_items")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

async function removeCartItem(id: string) {
  const { data, error } = await supabase
    .from("cart_items")
    .delete()
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

async function getCartCount() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return 0;

  const { count, error } = await supabase
    .from("cart_items")
    .select("*", { count: "exact", head: true })
    .eq("buyer_user_id", user.id);

  if (error) throw error;
  return count || 0;
}

export function useCart() {
  const queryClient = useQueryClient();

  const { data: cartItems, isLoading } = useQuery<CartItem[]>({
    queryKey: ["cart_items"],
    queryFn: fetchCartItems,
    staleTime: 30_000,
  });

  const { data: cartCount } = useQuery({
    queryKey: ["cart_count"],
    queryFn: getCartCount,
    staleTime: 10_000,
    refetchInterval: 10_000,
  });

  const addMutation = useMutation({
    mutationFn: ({ listingId, quantity, pricePerUnit, currency }: { listingId: string; quantity: number; pricePerUnit: number; currency?: string }) =>
      addToCart(listingId, quantity, pricePerUnit, currency),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cart_items"] });
      queryClient.invalidateQueries({ queryKey: ["cart_count"] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: { quantity?: number; selected?: boolean; notes?: string } }) =>
      updateCartItem(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cart_items"] });
      queryClient.invalidateQueries({ queryKey: ["cart_count"] });
    },
  });

  const removeMutation = useMutation({
    mutationFn: removeCartItem,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cart_items"] });
      queryClient.invalidateQueries({ queryKey: ["cart_count"] });
    },
  });

  return {
    cartItems: cartItems || [],
    cartCount: cartCount || 0,
    isLoading,
    addToCart: addMutation.mutate,
    addToCartAsync: addMutation.mutateAsync,
    updateCartItem: updateMutation.mutate,
    updateCartItemAsync: updateMutation.mutateAsync,
    removeCartItem: removeMutation.mutate,
    removeCartItemAsync: removeMutation.mutateAsync,
    isAdding: addMutation.isPending,
    isUpdating: updateMutation.isPending,
    isRemoving: removeMutation.isPending,
    mutations: {
      add: addMutation,
      update: updateMutation,
      remove: removeMutation,
    },
  };
}
