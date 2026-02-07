import { supabase } from "@/integrations/supabase/client";

export async function isAdminListing(sellerUserId: string | null): Promise<boolean> {
  if (!sellerUserId) return false;
  const { data, error } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", sellerUserId)
    .single();
  if (error || !data) return false;
  return data.role === "admin";
}

export async function getListingSellerRole(sellerUserId: string | null): Promise<string | null> {
  if (!sellerUserId) return null;
  const { data, error } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", sellerUserId)
    .single();
  if (error || !data) return null;
  return data.role;
}


