import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import MarketplaceCard from "@/components/marketplace/MarketplaceCard";

async function fetchRelated(category?: string, sellerId?: string, excludeId?: string) {
  let query = supabase.from("listings").select(
    "id, product_name, category, subcategory, packaging, quantity, bottles_per_case, price, final_price, price_per_case, currency, duty, content, image_urls, created_at, seller_user_id"
  ).eq("ui_status", "live").eq("status", "approved").limit(6);

  if (category) query = query.eq("category", category);
  if (sellerId) query = query.eq("seller_user_id", sellerId);
  const { data } = await query;
  return (data || []).filter((r: any) => r.id !== excludeId);
}

export default function RelatedProducts({ category, sellerId, excludeId }: { category?: string; sellerId?: string; excludeId?: string; }) {
  const { data: items, isLoading } = useQuery({
    queryKey: ["related", category, sellerId, excludeId],
    queryFn: () => fetchRelated(category, sellerId, excludeId),
    staleTime: 60_000,
  });

  if (isLoading) return null;
  if (!items || items.length === 0) return null;

  return (
    <div className="space-y-3">
      <h3 className="text-lg font-semibold">Related Listings</h3>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((row: any) => (
          <MarketplaceCard key={row.id} row={row} priceLabel={(r:any)=> r.currency?.toUpperCase()==='EUR' ? `€ ${Number(r.price_per_case ?? r.final_price ?? r.price ?? 0).toFixed(2)}` : `${r.currency} ${Number(r.price_per_case ?? r.final_price ?? r.price ?? 0).toFixed(2)}`} descr={()=>""} />
        ))}
      </div>
    </div>
  );
}


