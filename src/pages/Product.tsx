import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";

async function fetchListing(listingId: string) {
  const { data, error } = await supabase
    .from("listings")
    .select(
      `id, product_name, category, subcategory, packaging, quantity, min_quantity, bottles_per_case, price, final_price, price_per_case, currency, duty, incoterm, lead_time, condition, custom_status, content, image_urls, seller_user_id`
    )
    .eq("id", listingId)
    .single();
  if (error) throw error;
  return data as any;
}

async function fetchSeller(userId: string | null) {
  if (!userId) return null;
  const { data, error } = await supabase
    .from("profiles")
    .select("full_name, email, phone")
    .eq("id", userId)
    .single();
  if (error) return null;
  return data as any;
}

export default function Product() {
  const { id } = useParams();
  const { data: listing, isLoading, error } = useQuery({
    queryKey: ["listing_v2", id],
    queryFn: () => fetchListing(id as string),
    enabled: !!id,
  });

  const { data: seller } = useQuery({
    queryKey: ["listing_seller", listing?.seller_user_id],
    queryFn: () => fetchSeller(listing?.seller_user_id ?? null),
    enabled: !!listing?.seller_user_id,
  });

  const [activeImage, setActiveImage] = useState<string | null>(null);
  const images: string[] = useMemo(() => (Array.isArray(listing?.image_urls) ? listing!.image_urls : []), [listing]);
  useEffect(() => {
    if (images.length > 0) setActiveImage(images[0]);
  }, [images]);

  if (isLoading) return <div className="container py-8 px-4">Loading…</div>;
  if (error || !listing) return <div className="container py-8 px-4 text-red-500">Not found</div>;

  const amount = Number(listing.price_per_case ?? listing.final_price ?? listing.price ?? 0);
  const isEUR = (listing.currency || "").toUpperCase() === "EUR";
  const symbol = isEUR ? "€" : `${listing.currency ?? ""}`;

  return (
    <div className="container py-8 px-4 space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="lg:sticky lg:top-24 self-start space-y-3">
          <div className="rounded-xl border p-4 bg-card flex items-center justify-center min-h-[380px]">
            {activeImage ? (
              <img src={activeImage} alt={listing.product_name} className="max-h-96 object-contain" />
            ) : (
              <div className="h-40 w-40 rounded-lg bg-muted flex items-center justify-center text-muted-foreground">IMG</div>
            )}
          </div>
          {images.length > 1 && (
            <div className="grid grid-cols-5 gap-2">
              {images.map((url) => (
                <button
                  key={url}
                  onClick={() => setActiveImage(url)}
                  className={`h-16 rounded-md overflow-hidden border ${activeImage === url ? "ring-2 ring-primary" : ""}`}
                >
                  <img src={url} alt="thumb" className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <Badge className="bg-primary text-primary-foreground">New in</Badge>
            <span className="text-xs text-muted-foreground">{listing.category}{listing.subcategory ? ` • ${listing.subcategory}` : ""}</span>
          </div>
          <h1 className="text-3xl font-display font-semibold">{listing.product_name}</h1>
          <div className="text-sm">Pack: {listing.packaging === "case" && listing.bottles_per_case ? `${listing.bottles_per_case}x` : ""}{listing.content || "—"}</div>
          <div className="text-sm">Duty: {listing.duty === 'under_bond' ? 'Under Bond' : 'Duty Paid'}</div>

          <div className="rounded-xl border bg-card p-5">
            <div className="text-2xl font-semibold">{symbol} {amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
            <div className="text-xs text-muted-foreground">Per Case • Minimum order {listing.min_quantity ?? 1}</div>
            <div className="flex gap-3 pt-4">
              <Button>RESERVE</Button>
              <Button variant="outline">ADD TO CART</Button>
            </div>
          </div>

          {seller && (
            <div className="rounded-xl border p-4 bg-card">
              <div className="text-sm font-medium mb-1">Contact for Sales</div>
              <div className="text-sm">{seller.full_name ?? "Seller"}</div>
              <div className="text-sm text-muted-foreground">{seller.email ?? "—"}</div>
              <div className="text-sm text-muted-foreground">{seller.phone ?? "—"}</div>
            </div>
          )}
        </div>
      </div>

      <Tabs defaultValue="details" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="details">Details</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
        </TabsList>
        <TabsContent value="details">
          <div className="rounded-xl border p-6 bg-card">
            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div><dt className="text-muted-foreground">Description</dt><dd>{listing.content || '—'}</dd></div>
              <div><dt className="text-muted-foreground">QTY Available</dt><dd>{listing.quantity}</dd></div>
              <div><dt className="text-muted-foreground">Minimum Order</dt><dd>{listing.min_quantity ?? 1}</dd></div>
              <div><dt className="text-muted-foreground">Incoterms</dt><dd>{listing.incoterm ?? '—'}</dd></div>
              <div><dt className="text-muted-foreground">Lead Time</dt><dd>{listing.lead_time ?? '—'}</dd></div>
              <div><dt className="text-muted-foreground">Condition</dt><dd>{listing.condition ?? '—'}</dd></div>
              <div><dt className="text-muted-foreground">Customs Status</dt><dd>{listing.custom_status ?? '—'}</dd></div>
            </dl>
          </div>
        </TabsContent>
        <TabsContent value="security">
          <div className="rounded-xl border p-6 bg-card space-y-2 text-sm">
            <div>Only accept payment via CIGATY Escrow</div>
            <div>Ship every order with insurance coverage</div>
            <div>Perform due diligence and continuously monitor activities</div>
            <div>All listings are vetted for authenticity</div>
            <div>Dedicated support team</div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}


