import { useState, useEffect, useMemo } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { useReservations } from "@/hooks/useReservations";
import { useToast } from "@/hooks/use-toast";
import { Minus, Plus, X, Package, Truck, Clock, MapPin, HelpCircle, Mail, Phone, MessageCircle, CheckCircle2 } from "lucide-react";
import { addDays, format } from "date-fns";
import { CIGATY_DIRECTOR } from "@/lib/constants";
import { getPlatformFee } from "@/lib/fees";
import { useQuery } from "@tanstack/react-query";

interface ReserveModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  listing: {
    id: string;
    product_name: string;
    category?: string;
    subcategory?: string;
    packaging?: string;
    quantity: number;
    min_quantity?: number;
    bottles_per_case?: number;
    price_per_case?: number;
    price?: number;
    final_price?: number;
    currency?: string;
    image_urls?: string[];
    warehouse?: {
      id: string;
      name: string;
    } | null;
    incoterm?: string;
    lead_time?: string;
    duty?: string;
    seller_user_id?: string;
  };
  seller?: {
    full_name?: string;
    email?: string;
    phone?: string;
  } | null;
}

export function ReserveModal({ open, onOpenChange, listing, seller }: ReserveModalProps) {
  const { createReservation, isCreating } = useReservations();
  const { toast } = useToast();
  const [quantity, setQuantity] = useState(1);
  const [notes, setNotes] = useState("");
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  const minQuantity = listing.min_quantity || 1;
  const maxQuantity = listing.quantity || 1000;
  const isSoldByCases = listing.packaging === "case";
  
  // Calculate prices based on packaging type
  const offerPrice = useMemo(() => {
    if (isSoldByCases) {
      return Number(listing.price_per_case ?? listing.final_price ?? listing.price ?? 0);
    } else {
      return Number(listing.price ?? listing.final_price ?? listing.price_per_case ?? 0);
    }
  }, [isSoldByCases, listing]);

  // Get platform fee for category and subcategory
  const { data: platformFeeAmount } = useQuery({
    queryKey: ['platform_fee', listing.category, listing.subcategory],
    queryFn: () => getPlatformFee(listing.category || 'Spirits', listing.subcategory || null),
    enabled: !!listing.category,
    staleTime: 5 * 60_000, // 5 minutes cache
  });

  const platformFee = platformFeeAmount || 3.00; // Default fallback
  const platformFeeTotal = platformFee * quantity;
  const totalPrice = (offerPrice * quantity) + platformFeeTotal; // Platform fees are ADDED to the buyer's total
  
  // Calculate payment percentage based on inventory type
  const paymentPercentage = listing.inventory_type === 'bonded_warehouse' ? 100 : 20;
  const paymentAmount = (totalPrice * paymentPercentage) / 100;
  const currency = listing.currency || "EUR";
  const symbol = currency === "EUR" ? "€" : currency;

  const images: string[] = useMemo(() => 
    Array.isArray(listing.image_urls) ? listing.image_urls : [],
    [listing.image_urls]
  );

  useEffect(() => {
    if (open) {
      setQuantity(minQuantity);
      setNotes("");
      setTermsAccepted(false);
      setSelectedImageIndex(0);
      // Remember last quantity from localStorage
      const lastQuantity = localStorage.getItem(`reservation_qty_${listing.id}`);
      if (lastQuantity) {
        const qty = parseInt(lastQuantity, 10);
        if (qty >= minQuantity && qty <= maxQuantity) {
          setQuantity(qty);
        }
      }
    }
  }, [open, minQuantity, maxQuantity, listing.id]);

  const handleQuantityChange = (delta: number) => {
    const newQuantity = Math.max(minQuantity, Math.min(maxQuantity, quantity + delta));
    setQuantity(newQuantity);
    localStorage.setItem(`reservation_qty_${listing.id}`, newQuantity.toString());
  };

  const handleQuantityInput = (value: string) => {
    const val = parseInt(value) || minQuantity;
    const clamped = Math.max(minQuantity, Math.min(maxQuantity, val));
    setQuantity(clamped);
    localStorage.setItem(`reservation_qty_${listing.id}`, clamped.toString());
  };

  const handleReserve = async () => {
    if (!termsAccepted) {
      toast({
        title: "Terms Required",
        description: "Please accept the Terms & Conditions to proceed",
        variant: "destructive",
      });
      return;
    }

    if (quantity < minQuantity || quantity > maxQuantity) {
      toast({
        title: "Invalid quantity",
        description: `Quantity must be between ${minQuantity} and ${maxQuantity}`,
        variant: "destructive",
      });
      return;
    }

    try {
      await createReservation({
        listingId: listing.id,
        quantity,
        pricePerUnit: offerPrice,
        currency,
        notes: notes || undefined,
      });
      
      toast({
        title: "Reserved successfully!",
        description: "Complete checkout within 3 days to confirm your reservation. Payment is securely handled by CIGATY Escrow.",
      });
      onOpenChange(false);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to create reservation",
        variant: "destructive",
      });
    }
  };

  // Calculate estimated delivery date
  const estimatedDelivery = useMemo(() => {
    if (!listing.lead_time) return null;
    const weeks = parseInt(listing.lead_time.replace(/\D/g, "")) || 2;
    return format(addDays(new Date(), weeks * 7), "MMM dd, yyyy");
  }, [listing.lead_time]);

  // Quantity display
  const quantityDisplay = isSoldByCases 
    ? `${quantity} case${quantity !== 1 ? "s" : ""} (${quantity * (listing.bottles_per_case || 1)} bottles)`
    : `${quantity} bottle${quantity !== 1 ? "s" : ""}`;

  const totalBottles = isSoldByCases ? quantity * (listing.bottles_per_case || 1) : quantity;

  // Availability color coding
  const getAvailabilityBadgeColor = () => {
    if (listing.quantity > 10) return "bg-success/20 text-success border-success/30";
    if (listing.quantity > 5) return "bg-warning/20 text-warning border-warning/30";
    return "bg-destructive/20 text-destructive border-destructive/30";
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto p-0 gap-0">
        {/* Header Section */}
        <div className="flex items-center justify-between border-b px-6 py-4 bg-muted/30">
          <div>
            <DialogTitle className="text-2xl font-display">Reserve Product</DialogTitle>
            <DialogDescription className="mt-1">
              {listing.category}
              {listing.subcategory && ` • ${listing.subcategory}`}
            </DialogDescription>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onOpenChange(false)}
            className="rounded-full"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 p-6">
          {/* Left: Product Showcase */}
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2 mb-2">
                  <Badge className="bg-primary/20 text-primary border-primary/30">New</Badge>
                  <Badge className={getAvailabilityBadgeColor()}>
                    {listing.quantity} Available
                  </Badge>
                  {listing.duty === "under_bond" && (
                    <Badge variant="outline">Under Bond</Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Product Image */}
                  <div className="relative aspect-square rounded-lg border overflow-hidden bg-muted">
                    {images[selectedImageIndex] ? (
                      <img
                        src={images[selectedImageIndex]}
                        alt={listing.product_name}
                        className="w-full h-full object-contain"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                        No Image
                      </div>
                    )}
                  </div>
                  
                  {/* Image Gallery */}
                  {images.length > 1 && (
                    <div className="grid grid-cols-4 gap-2">
                      {images.map((url, idx) => (
                        <button
                          key={idx}
                          onClick={() => setSelectedImageIndex(idx)}
                          className={`relative aspect-square rounded-md overflow-hidden border transition-all ${
                            selectedImageIndex === idx
                              ? "ring-2 ring-primary"
                              : "opacity-60 hover:opacity-100"
                          }`}
                        >
                          <img
                            src={url}
                            alt={`${listing.product_name} ${idx + 1}`}
                            className="w-full h-full object-cover"
                          />
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Product Details */}
                  <div className="space-y-2">
                    <h3 className="text-xl font-display font-semibold">{listing.product_name}</h3>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Package className="h-4 w-4" />
                      <span>
                        {isSoldByCases && listing.bottles_per_case
                          ? `${listing.bottles_per_case}x ${listing.content || "bottles per case"}`
                          : listing.content || "Single bottle"}
                      </span>
                    </div>
                    <div className="text-2xl font-bold text-primary">
                      {symbol} {offerPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      <span className="text-sm font-normal text-muted-foreground ml-2">
                        per {isSoldByCases ? "case" : "bottle"}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right: Reservation Form */}
          <div className="space-y-6">

            {/* Quantity Selection */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Package className="h-5 w-5 text-primary" />
                  Quantity Selection
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Sold by: {isSoldByCases ? "Cases" : "Bottles"}</Label>
                  {isSoldByCases && listing.bottles_per_case && (
                    <p className="text-sm text-muted-foreground">
                      Bottles/cs: {listing.bottles_per_case}
                    </p>
                  )}
                  <p className="text-sm text-muted-foreground">
                    Quantity Available: <span className="font-semibold text-foreground">{listing.quantity}</span>
                  </p>
                  {minQuantity > 1 && (
                    <p className="text-sm text-muted-foreground">
                      Minimum Order: <span className="font-semibold text-foreground">{minQuantity}</span>
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-3">
                  <Button
                    size="icon"
                    variant="outline"
                    className="h-12 w-12"
                    onClick={() => handleQuantityChange(-1)}
                    disabled={quantity <= minQuantity}
                  >
                    <Minus className="h-5 w-5" />
                  </Button>
                  <Input
                    type="number"
                    value={quantity}
                    onChange={(e) => handleQuantityInput(e.target.value)}
                    className="w-24 text-center text-lg font-semibold"
                    min={minQuantity}
                    max={maxQuantity}
                  />
                  <Button
                    size="icon"
                    variant="outline"
                    className="h-12 w-12"
                    onClick={() => handleQuantityChange(1)}
                    disabled={quantity >= maxQuantity}
                  >
                    <Plus className="h-5 w-5" />
                  </Button>
                </div>

                <div className="rounded-lg bg-muted/50 p-3 border">
                  <p className="text-sm font-medium">
                    You're reserving: <span className="text-primary font-semibold">{quantityDisplay}</span>
                  </p>
                  {isSoldByCases && (
                    <p className="text-xs text-muted-foreground mt-1">
                      Total bottles: {totalBottles}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Price Breakdown */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Total Breakdown Cost</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Offer Price:</span>
                  <span className="font-semibold">
                    {symbol} {(offerPrice * quantity).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-1">
                    <span className="text-muted-foreground">Platform Fee:</span>
                    <HelpCircle className="h-3 w-3 text-muted-foreground" />
                  </div>
                  <span className="font-semibold">
                    +{symbol} {platformFeeTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="border-t pt-3 flex items-center justify-between">
                  <span className="font-semibold text-base">Total:</span>
                  <span className="text-2xl font-bold text-primary">
                    {symbol} {totalPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm pt-2">
                  <span className="text-muted-foreground">Payment ({paymentPercentage}%):</span>
                  <span className="font-semibold text-primary">
                    {symbol} {paymentAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>
                {paymentPercentage < 100 && (
                  <div className="flex items-center justify-between text-xs text-muted-foreground pt-1">
                    <span>Remaining Balance:</span>
                    <span>{symbol} {(totalPrice - paymentAmount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                  </div>
                )}
                <p className="text-xs text-muted-foreground mt-2">
                  Platform fee: {symbol}{platformFee.toFixed(2)} per item. CIGATY acts as escrow for all transactions.
                </p>
              </CardContent>
            </Card>

            {/* Delivery Information */}
            {(listing.warehouse || listing.lead_time || listing.incoterm) && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Truck className="h-5 w-5 text-primary" />
                    Delivery Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  {listing.warehouse && (
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">Warehouse:</span>
                      <span className="font-medium">{listing.warehouse.name}</span>
                    </div>
                  )}
                  {listing.lead_time && (
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">Lead Time:</span>
                      <span className="font-medium">{listing.lead_time}</span>
                    </div>
                  )}
                  {listing.incoterm && (
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">Incoterms:</span>
                      <span className="font-medium">{listing.incoterm}</span>
                    </div>
                  )}
                  {estimatedDelivery && (
                    <div className="flex items-center gap-2 mt-3 pt-3 border-t">
                      <Clock className="h-4 w-4 text-primary" />
                      <span className="text-muted-foreground">Estimated Delivery:</span>
                      <span className="font-semibold text-primary">{estimatedDelivery}</span>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Notes */}
            <div className="space-y-2">
              <Label htmlFor="notes">Notes (Optional)</Label>
              <Textarea
                id="notes"
                placeholder="Add any special requirements or notes for the seller..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                disabled={isCreating}
              />
            </div>

            {/* Terms & Conditions */}
            <div className="flex items-start gap-3 p-4 rounded-lg border bg-muted/30">
              <Checkbox
                id="terms"
                checked={termsAccepted}
                onCheckedChange={(checked) => setTermsAccepted(checked === true)}
                disabled={isCreating}
                className="mt-0.5"
              />
              <Label htmlFor="terms" className="text-sm cursor-pointer">
                I have read and agree to the{" "}
                <a href="/terms" target="_blank" className="text-primary hover:underline">
                  Terms & Conditions
                </a>
              </Label>
            </div>

            {/* CIGATY Sales Representative */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <MessageCircle className="h-5 w-5 text-primary" />
                  Your Sales Representative
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-full bg-primary/20 flex items-center justify-center text-primary font-semibold">
                    {CIGATY_DIRECTOR.name.charAt(0)}
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold">{CIGATY_DIRECTOR.name}</p>
                    <Badge className="bg-primary/20 text-primary border-primary/30 text-xs">
                      {CIGATY_DIRECTOR.role}
                    </Badge>
                  </div>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Mail className="h-3 w-3" />
                    <a href={`mailto:${CIGATY_DIRECTOR.email}`} className="text-primary hover:underline">
                      {CIGATY_DIRECTOR.email}
                    </a>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Phone className="h-3 w-3" />
                    <a href={`tel:${CIGATY_DIRECTOR.phone}`} className="text-primary hover:underline">
                      {CIGATY_DIRECTOR.phone}
                    </a>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    asChild
                  >
                    <a href={`mailto:${CIGATY_DIRECTOR.email}`}>
                      <Mail className="h-4 w-4 mr-2" />
                      Email
                    </a>
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    asChild
                  >
                    <a href={`tel:${CIGATY_DIRECTOR.phone}`}>
                      <Phone className="h-4 w-4 mr-2" />
                      Call
                    </a>
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => window.open(`https://wa.me/${CIGATY_DIRECTOR.whatsappNumber}?text=Hello%20from%20CIGATY%20Trade%20Portal`, '_blank')}
                  >
                    <MessageCircle className="h-4 w-4 mr-2" />
                    WhatsApp
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Footer */}
        <DialogFooter className="border-t px-6 py-4 bg-muted/30">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isCreating}
          >
            Cancel
          </Button>
          <Button
            onClick={handleReserve}
            disabled={isCreating || quantity < minQuantity || quantity > maxQuantity || !termsAccepted}
            className="bg-primary text-primary-foreground hover:bg-primary/90 min-w-[140px]"
          >
            {isCreating ? (
              <>
                <span className="animate-spin mr-2">⏳</span>
                Reserving...
              </>
            ) : (
              <>
                <CheckCircle2 className="h-4 w-4 mr-2" />
                Confirm Reserve
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
