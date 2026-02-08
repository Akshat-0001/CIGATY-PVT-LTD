import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { isAdminListing as checkIsAdminListing } from "@/lib/seller";
import { supabase } from "@/integrations/supabase/client";
import { toTitleCase, formatCurrency } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useCart } from "@/hooks/useCart";
import { ReserveModal } from "@/components/reservations/ReserveModal";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";
import { fadeInUp, staggerContainer, hoverScale, tapScale, springTransition } from "@/lib/animations";
import { CIGATY_DIRECTOR } from "@/lib/constants";
import { MessageCircle, Mail, Phone } from "lucide-react";

async function fetchListing(listingId: string) {
  const { data, error } = await supabase
    .from("listings")
    .select(
      `id, product_name, category, subcategory, packaging, quantity, min_quantity, bottles_per_case, price, final_price, price_per_case, currency, duty, incoterm, lead_time, condition, custom_status, content, image_urls, seller_user_id, warehouse_id, inventory_type, custom_warehouse_name, warehouse:bonded_warehouses(id, name)`
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

  const { data: isAdminListing } = useQuery({
    queryKey: ["is_admin_listing", listing?.seller_user_id],
    queryFn: () => checkIsAdminListing(listing?.seller_user_id ?? null),
    enabled: !!listing?.seller_user_id,
  });

  const [activeImage, setActiveImage] = useState<string | null>(null);
  const [reserveModalOpen, setReserveModalOpen] = useState(false);
  const { addToCartAsync, isAdding, cartItems } = useCart();
  const { toast } = useToast();
  const images: string[] = useMemo(() => (Array.isArray(listing?.image_urls) ? listing!.image_urls : []), [listing]);
  
  useEffect(() => {
    if (images.length > 0) setActiveImage(images[0]);
  }, [images]);

  const isInCart = useMemo(() => {
    return cartItems.some((item: any) => item.listing_id === listing?.id);
  }, [cartItems, listing?.id]);

  const handleAddToCart = async () => {
    if (!listing) return;
    const pricePerUnit = Number(
      listing.price_per_case ?? listing.final_price ?? listing.price ?? 0
    );
    try {
      await addToCartAsync({
        listingId: listing.id,
        quantity: listing.min_quantity || 1,
        pricePerUnit,
        currency: listing.currency || "EUR",
      });
      toast({
        title: "Added to cart",
        description: "Item has been added to your cart",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add item to cart",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="container py-4 md:py-8 px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-3">
            <div className="rounded-xl border glass-card shimmer-loading h-96" />
            <div className="grid grid-cols-5 gap-2">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-16 rounded-md shimmer-loading" />
              ))}
            </div>
          </div>
          <div className="space-y-4">
            <div className="h-8 bg-muted rounded shimmer-loading w-3/4" />
            <div className="h-12 bg-muted rounded shimmer-loading w-full" />
          </div>
        </div>
      </div>
    );
  }
  if (error || !listing) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="container py-4 md:py-8 px-4 text-center"
      >
        <div className="glass-card rounded-xl p-12 max-w-md mx-auto">
          <p className="text-red-500 text-lg font-semibold">Product not found</p>
        </div>
      </motion.div>
    );
  }

  const amount = Number(listing.price_per_case ?? listing.final_price ?? listing.price ?? 0);
  const isCase = (listing.packaging || "case").toLowerCase() === "case";
  const bpc = Number(listing.bottles_per_case || 0);
  const perBottle = isCase && bpc ? amount / bpc : null;

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={staggerContainer}
      className="container py-4 md:py-8 px-4 space-y-6 md:space-y-8"
    >
      <motion.div variants={fadeInUp} className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <motion.div
          variants={fadeInUp}
          className="lg:sticky lg:top-24 self-start space-y-3"
        >
          <motion.div
            className="rounded-xl border p-4 bg-card glass-card flex items-center justify-center min-h-[380px]"
            whileHover={{ scale: 1.01 }}
            transition={springTransition}
          >
            <AnimatePresence mode="wait">
              {activeImage ? (
                <motion.img
                  key={activeImage}
                  src={activeImage}
                  alt={listing.product_name}
                  className="max-h-96 object-contain"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.3 }}
                />
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="h-40 w-40 rounded-lg bg-muted flex items-center justify-center text-muted-foreground"
                >
                  IMG
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
          {images.length > 1 && (
            <motion.div
              variants={staggerContainer}
              initial="hidden"
              animate="visible"
              className="grid grid-cols-5 gap-2"
            >
              {images.map((url, index) => (
                <motion.button
                  key={url}
                  variants={fadeInUp}
                  whileHover={hoverScale}
                  whileTap={tapScale}
                  onClick={() => setActiveImage(url)}
                  className={`h-16 rounded-md overflow-hidden border glass-nav-item transition-all ${
                    activeImage === url ? "ring-2 ring-primary scale-105" : ""
                  }`}
                >
                  <img src={url} alt="thumb" className="h-full w-full object-cover" />
                </motion.button>
              ))}
            </motion.div>
          )}
        </motion.div>

        <motion.div variants={fadeInUp} className="space-y-4">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-3"
          >
            <Badge className="bg-primary text-primary-foreground">New in</Badge>
            <span className="text-xs text-muted-foreground">{toTitleCase(listing.category)}{listing.subcategory ? ` • ${toTitleCase(listing.subcategory)}` : ""}</span>
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-2xl md:text-3xl font-display font-semibold"
          >
            {listing.product_name}
          </motion.h1>
          <div className="text-sm">Pack: {listing.packaging === "case" && listing.bottles_per_case ? `${listing.bottles_per_case}x` : ""}{listing.content || "—"}</div>
          <div className="text-sm">Duty: {listing.duty === 'under_bond' ? 'Under Bond' : 'Duty Paid'}</div>

          <div className="lg:sticky lg:top-24 space-y-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="rounded-xl border bg-card glass-card p-5"
            >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
              className="text-2xl font-semibold"
            >
              {formatCurrency(amount, listing.currency)}
            </motion.div>
            <div className="text-xs text-muted-foreground">{isCase ? 'Per Case' : 'Per Bottle'} • Minimum order {listing.min_quantity ?? 1}</div>
            {isCase && bpc ? (
              <div className="text-xs text-muted-foreground mt-1">Bottles per Case: <span className="font-medium text-foreground">{bpc}</span>{perBottle ? ` • Per Bottle: ${formatCurrency(perBottle, listing.currency)}` : ''}</div>
            ) : null}
            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <Button 
                onClick={() => setReserveModalOpen(true)}
                className="bg-primary text-primary-foreground hover:bg-primary/90 glass-button w-full sm:w-auto"
              >
                RESERVE
              </Button>
              <Button 
                variant="default"
                onClick={handleAddToCart}
                disabled={isAdding || isInCart}
                className="glass-button w-full sm:w-auto"
              >
                {isAdding ? "Adding..." : isInCart ? "IN CART" : "ADD TO CART"}
              </Button>
            </div>
            <div className="mt-2 text-xs text-muted-foreground">
              CIGATY acts as escrow for all transactions. Payment percentage depends on inventory type.
            </div>
            {isInCart && (
              <Badge className="mt-2 bg-primary/20 text-primary border-primary/30">
                Already in cart
              </Badge>
            )}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="rounded-xl border p-4 bg-card glass-card space-y-3"
          >
            <div className="text-sm font-medium mb-2">Contact for Sales</div>
            <div className="space-y-2 text-sm">
              <div className="font-semibold">{CIGATY_DIRECTOR.name}</div>
              <div className="text-muted-foreground flex items-center gap-2">
                <Mail className="h-3 w-3" />
                <a href={`mailto:${CIGATY_DIRECTOR.email}`} className="text-primary hover:underline">
                  {CIGATY_DIRECTOR.email}
                </a>
              </div>
              <div className="text-muted-foreground flex items-center gap-2">
                <Phone className="h-3 w-3" />
                <a href={`tel:${CIGATY_DIRECTOR.phone}`} className="text-primary hover:underline">
                  {CIGATY_DIRECTOR.phone}
                </a>
              </div>
            </div>
            <Button
              onClick={() => window.open(`https://wa.me/${CIGATY_DIRECTOR.whatsappNumber}?text=Hello%20from%20CIGATY%20Trade%20Portal`, '_blank')}
              className="w-full gap-2 mt-3"
              variant="outline"
            >
              <MessageCircle className="h-4 w-4" />
              Contact on WhatsApp
            </Button>
          </motion.div>
          </div>

          <ReserveModal 
            open={reserveModalOpen} 
            onOpenChange={setReserveModalOpen} 
            listing={listing}
            seller={seller}
          />
        </motion.div>
      </motion.div>

      <motion.div variants={fadeInUp}>
        <Tabs defaultValue="details" className="w-full">
          <TabsList className="mb-4 glass-nav-item">
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="security">Security</TabsTrigger>
          </TabsList>
          <TabsContent value="details">
            <div className="rounded-xl border p-6 bg-card glass-card">
            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div><dt className="text-muted-foreground">Volume</dt><dd>{listing.content || '—'}</dd></div>
              <div><dt className="text-muted-foreground">QTY Available</dt><dd>{listing.quantity}</dd></div>
              <div><dt className="text-muted-foreground">Minimum Order</dt><dd>{listing.min_quantity ?? 1}</dd></div>
              {isCase && bpc ? (<div><dt className="text-muted-foreground">Total Bottles</dt><dd>{listing.quantity * bpc}</dd></div>) : null}
              <div><dt className="text-muted-foreground">Incoterms</dt><dd>{listing.incoterm ?? '—'}</dd></div>
              <div><dt className="text-muted-foreground">Lead Time</dt><dd>{listing.lead_time ?? '—'}</dd></div>
              <div><dt className="text-muted-foreground">Condition</dt><dd>{listing.condition ?? '—'}</dd></div>
              <div><dt className="text-muted-foreground">Customs Status</dt><dd>{listing.custom_status ?? '—'}</dd></div>
              <div><dt className="text-muted-foreground">Warehouse</dt><dd>{listing.warehouse?.name || '—'}</dd></div>
            </dl>
          </div>
        </TabsContent>
          <TabsContent value="security">
            <div className="rounded-xl border p-6 bg-card glass-card space-y-2 text-sm">
              <div>Only accept payment via CIGATY Escrow</div>
              <div>Ship every order with insurance coverage</div>
              <div>Perform due diligence and continuously monitor activities</div>
              <div>All listings are vetted for authenticity</div>
              <div>Dedicated support team</div>
            </div>
          </TabsContent>
        </Tabs>
      </motion.div>
    </motion.div>
  );
}


