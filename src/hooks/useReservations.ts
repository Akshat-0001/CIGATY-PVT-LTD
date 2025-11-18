import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface Reservation {
  id: string;
  buyer_user_id: string;
  listing_id: string;
  quantity: number;
  price_per_unit: number;
  currency: string;
  status: "pending" | "confirmed" | "cancelled" | "completed";
  notes?: string;
  created_at: string;
  updated_at: string;
  confirmed_at?: string;
  cancelled_at?: string;
  expires_at?: string | null;
  extended_until?: string | null;
  extension_reason?: string | null;
  extended_by?: string | null;
  escrow_method?: 'cigaty' | 'warehouse';
  payment_percentage?: number;
  listing?: {
    product_name: string;
    category: string;
    subcategory?: string;
    packaging: string;
    image_urls?: string[];
    seller_user_id?: string;
    warehouse?: { id: string; name: string; email?: string; phone?: string } | null;
  };
  buyer?: {
    full_name?: string;
    email?: string;
    phone?: string;
    company_id?: string;
    company?: {
      name?: string;
      country?: string;
    };
  };
}

async function fetchBuyerReservations() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from("reservations")
    .select(`
      *,
      listing:listings!inner(
        product_name,
        category,
        subcategory,
        packaging,
        image_urls,
        seller_user_id,
        inventory_type
      )
    `)
    .eq("buyer_user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data || []) as Reservation[];
}

async function fetchAllReservations() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  // Check if user is admin
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") {
    throw new Error("Only admins can fetch all reservations");
  }

  // Fetch all reservations with buyer and listing info
  const { data, error } = await supabase
    .from("reservations")
    .select(`
      *,
      listing:listings!inner(
        product_name,
        category,
        subcategory,
        packaging,
        image_urls,
        seller_user_id,
        inventory_type
      ),
      buyer:profiles!reservations_buyer_user_id_fkey(
        id,
        email,
        full_name,
        phone,
        company_name
      )
    `)
    .order("created_at", { ascending: false })
    .limit(1000);

  if (error) throw error;
  return (data || []) as Reservation[];
}

async function fetchSellerReservations() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  // Try RPC first for enriched data
  const { data, error } = await supabase.rpc("get_seller_reservations", {
    _seller_user_id: user.id,
  });

  if (!error && Array.isArray(data)) {
    return (data || []).map((r: any) => ({
      id: r.id,
      buyer_user_id: r.buyer_user_id,
      listing_id: r.listing_id,
      quantity: r.quantity,
      price_per_unit: Number(r.price_per_unit),
      currency: r.currency || "EUR",
      status: r.status,
      notes: r.notes || null,
      created_at: r.created_at,
      updated_at: r.updated_at,
      confirmed_at: r.confirmed_at || null,
      cancelled_at: r.cancelled_at || null,
      expires_at: r.expires_at || null,
      extended_until: r.extended_until || null,
      extension_reason: r.extension_reason || null,
      extended_by: r.extended_by || null,
      payment_percentage: r.payment_percentage || null,
      listing: {
        product_name: r.product_name,
        category: r.category,
        subcategory: r.subcategory || null,
        packaging: r.packaging,
        image_urls: r.image_urls || [],
        bottles_per_case: r.bottles_per_case || null,
        inventory_type: r.inventory_type || null,
      },
      buyer: r.buyer_full_name || r.buyer_email ? {
        full_name: r.buyer_full_name || null,
        email: r.buyer_email || null,
        phone: r.buyer_phone || null,
        company_id: r.buyer_company_id || null,
        company: r.buyer_company_name ? {
          name: r.buyer_company_name,
          country: r.buyer_company_country || null,
        } : null,
      } : null,
    })) as Reservation[];
  }

  console.warn("RPC get_seller_reservations failed, falling back to direct queries.", error);

  // Fallback strategy (no RPC):
  // 1) Fetch seller's listing ids
  const { data: sellerListings, error: listingsError } = await supabase
    .from("listings")
    .select("id, product_name, category, subcategory, packaging, image_urls, bottles_per_case")
    .eq("seller_user_id", user.id)
    .limit(1000);

  if (listingsError) {
    console.error("Listings fetch error:", listingsError);
    throw listingsError;
  }

  const listingIds = (sellerListings || []).map((l: any) => l.id);
  if (listingIds.length === 0) return [];

  // 2) Fetch reservations for those listings
  const { data: reservationsRaw, error: resError } = await supabase
    .from("reservations")
    .select("id,buyer_user_id,listing_id,quantity,price_per_unit,currency,status,notes,created_at,updated_at,confirmed_at,cancelled_at,expires_at,extended_until,extension_reason,extended_by,payment_percentage")
    .in("listing_id", listingIds)
    .order("created_at", { ascending: false })
    .limit(1000);

  if (resError) {
    console.error("Reservations fetch error:", resError);
    throw resError;
  }

  // 3) Map listing details
  const listingById: Record<string, any> = {};
  for (const l of sellerListings || []) {
    listingById[l.id] = l;
  }

  // 4) Optionally enrich buyer info via profiles (best-effort)
  const buyerIds = Array.from(new Set((reservationsRaw || []).map((r: any) => r.buyer_user_id).filter(Boolean)));
  const buyerInfoById: Record<string, any> = {};
  if (buyerIds.length) {
    const { data: buyers } = await supabase
      .from("profiles")
      .select("id, full_name, phone, company_id")
      .in("id", buyerIds);
    for (const b of buyers || []) buyerInfoById[b.id] = b;
  }

  return (reservationsRaw || []).map((r: any) => ({
    id: r.id,
    buyer_user_id: r.buyer_user_id,
    listing_id: r.listing_id,
    quantity: r.quantity,
    price_per_unit: Number(r.price_per_unit),
    currency: r.currency || "EUR",
    status: r.status,
    notes: r.notes || null,
    created_at: r.created_at,
    updated_at: r.updated_at,
    confirmed_at: r.confirmed_at || null,
    cancelled_at: r.cancelled_at || null,
    expires_at: r.expires_at || null,
    extended_until: r.extended_until || null,
    extension_reason: r.extension_reason || null,
    extended_by: r.extended_by || null,
    payment_percentage: r.payment_percentage || null,
    listing: listingById[r.listing_id] ? {
      product_name: listingById[r.listing_id].product_name,
      category: listingById[r.listing_id].category,
      subcategory: listingById[r.listing_id].subcategory || null,
      packaging: listingById[r.listing_id].packaging,
      image_urls: listingById[r.listing_id].image_urls || [],
      bottles_per_case: listingById[r.listing_id].bottles_per_case || null,
      seller_user_id: user.id,
      inventory_type: listingById[r.listing_id].inventory_type || null,
    } : undefined,
    buyer: buyerInfoById[r.buyer_user_id] ? {
      full_name: buyerInfoById[r.buyer_user_id].full_name || null,
      email: undefined,
      phone: buyerInfoById[r.buyer_user_id].phone || null,
      company_id: buyerInfoById[r.buyer_user_id].company_id || null,
    } : null,
  })) as Reservation[];
}

async function createReservation(
  listingId: string,
  quantity: number,
  pricePerUnit: number,
  currency: string = "EUR",
  notes?: string
) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { data, error } = await supabase.rpc("create_reservation_with_notification", {
    _buyer_user_id: user.id,
    _listing_id: listingId,
    _quantity: quantity,
    _price_per_unit: pricePerUnit,
    _currency: currency,
    _notes: notes || null,
  });

  if (error) throw error;
  return data;
}

async function updateReservation(id: string, status: "confirmed" | "cancelled") {
  const updateData: any = { status };
  if (status === "confirmed") {
    updateData.confirmed_at = new Date().toISOString();
  } else if (status === "cancelled") {
    updateData.cancelled_at = new Date().toISOString();
  }

  const { data, error } = await supabase
    .from("reservations")
    .update(updateData)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

async function confirmReservationWithQuantityReduction(reservationId: string) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { data, error } = await supabase.rpc("confirm_reservation_with_quantity_reduction", {
    _reservation_id: reservationId,
    _seller_user_id: user.id,
  });

  if (error) {
    console.error("RPC Error:", error);
    if (error.code === '42883' || error.message?.includes('function') || error.message?.includes('not found')) {
      throw new Error("Database function not found. Please contact support to apply the SQL migration.");
    }
    throw error;
  }
  return data;
}

async function getReservationCount(listingId: string) {
  const { count, error } = await supabase
    .from("reservations")
    .select("*", { count: "exact", head: true })
    .eq("listing_id", listingId)
    .eq("status", "pending");

  if (error) throw error;
  return count || 0;
}

export function useReservations(asSeller: boolean = false, asAdmin: boolean = false) {
  const queryClient = useQueryClient();

  const { data: reservations, isLoading } = useQuery<Reservation[]>({
    queryKey: ["reservations", asAdmin ? "admin" : asSeller ? "seller" : "buyer"],
    queryFn: asAdmin ? fetchAllReservations : asSeller ? fetchSellerReservations : fetchBuyerReservations,
    staleTime: 30_000,
  });

  const createMutation = useMutation({
    mutationFn: ({ listingId, quantity, pricePerUnit, currency, notes }: { listingId: string; quantity: number; pricePerUnit: number; currency?: string; notes?: string }) =>
      createReservation(listingId, quantity, pricePerUnit, currency, notes),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reservations"] });
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: "confirmed" | "cancelled" }) =>
      updateReservation(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reservations"] });
      queryClient.invalidateQueries({ queryKey: ["my_listings"] });
      queryClient.invalidateQueries({ queryKey: ["listing"] });
    },
  });

  const confirmMutation = useMutation({
    mutationFn: (reservationId: string) => confirmReservationWithQuantityReduction(reservationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reservations"] });
      queryClient.invalidateQueries({ queryKey: ["my_listings"] });
      queryClient.invalidateQueries({ queryKey: ["listing"] });
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      queryClient.invalidateQueries({ queryKey: ["activities"] });
    },
  });

  return {
    reservations: reservations || [],
    isLoading,
    createReservation: createMutation.mutateAsync,
    updateReservation: updateMutation.mutateAsync,
    confirmReservation: confirmMutation.mutateAsync,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isConfirming: confirmMutation.isPending,
  };
}

export function useReservationCount(listingId: string) {
  return useQuery({
    queryKey: ["reservation_count", listingId],
    queryFn: () => getReservationCount(listingId),
    staleTime: 30_000,
  });
}

async function getPendingReservationCount(asSeller: boolean = false) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return 0;

  if (asSeller) {
    // Use RPC to get seller reservations and count pending
    const { data: sellerReservations, error } = await supabase.rpc("get_seller_reservations", {
      _seller_user_id: user.id,
    });
    if (error) return 0;
    return (sellerReservations || []).filter((r: any) => r.status === "pending").length;
  } else {
    // Count buyer's pending reservations
    const { count, error } = await supabase
      .from("reservations")
      .select("*", { count: "exact", head: true })
      .eq("buyer_user_id", user.id)
      .eq("status", "pending");
    if (error) return 0;
    return count || 0;
  }
}

export function usePendingReservationCount(asSeller: boolean = false) {
  return useQuery({
    queryKey: ["pending_reservation_count", asSeller ? "seller" : "buyer"],
    queryFn: () => getPendingReservationCount(asSeller),
    staleTime: 30_000,
    refetchInterval: 60_000, // Refetch every minute
  });
}
