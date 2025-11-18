import { useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Mail, Phone, User, Building2, Package, Eye, X, Calendar, DollarSign, AlertCircle, MessageCircle, Clock } from "lucide-react";
import { toTitleCase } from "@/lib/utils";
import { format } from "date-fns";
import type { Reservation } from "@/hooks/useReservations";
import { CIGATY_DIRECTOR } from "@/lib/constants";

interface ReservationCardProps {
  reservation: Reservation;
  view: "buyer" | "seller";
  onCancel?: (id: string) => void;
  onConfirm?: (reservation: Reservation) => void;
  onContact?: (email?: string, phone?: string) => void;
  selected?: boolean;
  onSelect?: (id: string, selected: boolean) => void;
  showListingQuantity?: boolean;
  listingQuantity?: number;
  seller?: {
    full_name?: string;
    email?: string;
    phone?: string;
  } | null;
  extraFooter?: React.ReactNode;
  isAdmin?: boolean;
}

export default function ReservationCard({
  reservation,
  view,
  onCancel,
  onConfirm,
  onContact,
  selected = false,
  onSelect,
  showListingQuantity = false,
  listingQuantity,
  seller,
  extraFooter,
  isAdmin = false,
}: ReservationCardProps) {
  const listing = reservation.listing as any;
  const buyer = reservation.buyer as any;
  const imageUrl = useMemo(() => {
    if (Array.isArray(listing?.image_urls) && listing.image_urls.length > 0) {
      return listing.image_urls[0];
    }
    return null;
  }, [listing?.image_urls]);

  const totalPrice = reservation.quantity * Number(reservation.price_per_unit);
  const symbol = reservation.currency === "EUR" ? "€" : reservation.currency;

  const statusBadgeClass = useMemo(() => {
    if (reservation.status === "pending") return "bg-warning/20 text-warning border-warning/30";
    if (reservation.status === "confirmed") return "bg-success/20 text-success border-success/30";
    return "bg-destructive/20 text-destructive border-destructive/30";
  }, [reservation.status]);

  const isUrgent = useMemo(() => {
    if (reservation.status !== "pending") return false;
    const expiry = reservation.expires_at ? new Date(reservation.expires_at) : new Date(new Date(reservation.created_at).getTime() + 3 * 24 * 60 * 60 * 1000);
    const hoursLeft = (expiry.getTime() - Date.now()) / (1000 * 60 * 60);
    return hoursLeft <= 24 && hoursLeft > 0;
  }, [reservation.status, reservation.created_at, reservation.expires_at]);

  const expiryLabel = useMemo(() => {
    if (reservation.status !== 'pending') return null;
    // Use extended_until if present, otherwise use expires_at or calculate from created_at
    const expiry = reservation.extended_until 
      ? new Date(reservation.extended_until)
      : reservation.expires_at 
        ? new Date(reservation.expires_at) 
        : new Date(new Date(reservation.created_at).getTime() + 3 * 24 * 60 * 60 * 1000);
    const ms = expiry.getTime() - Date.now();
    if (ms <= 0) return 'Expired';
    const days = Math.floor(ms / (1000 * 60 * 60 * 24));
    const hours = Math.floor((ms % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    return `${days}d ${hours}h left${reservation.extended_until ? ' (extended)' : ''}`;
  }, [reservation.status, reservation.created_at, reservation.expires_at, reservation.extended_until]);

  const quantityAfterConfirmation = showListingQuantity && listingQuantity
    ? listingQuantity - reservation.quantity
    : null;

  const isLowStock = quantityAfterConfirmation !== null && quantityAfterConfirmation < 10;

  return (
    <Card 
      className={`p-6 hover:border-primary/50 transition-all duration-300 ${selected ? "ring-2 ring-primary" : ""}`}
      onClick={(e) => {
        // Don't trigger card selection when clicking on interactive elements
        if ((e.target as HTMLElement).closest('button, a, input')) {
          return;
        }
      }}
    >
      {/* Header with Status and Actions */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          {view === "seller" && onSelect && (
            <input
              type="checkbox"
              checked={selected}
              onChange={(e) => {
                e.stopPropagation();
                onSelect(reservation.id, e.target.checked);
              }}
              onClick={(e) => e.stopPropagation()}
              className="h-4 w-4 rounded border-primary cursor-pointer"
              key={`checkbox-${reservation.id}`}
            />
          )}
          <Badge className={statusBadgeClass}>
            {reservation.status}
          </Badge>
          {reservation.extended_until && (
            <Badge className="bg-primary/20 text-primary border-primary/30">
              Extended
            </Badge>
          )}
          {reservation.status === 'pending' && (
            <Badge className={isUrgent ? "bg-destructive/20 text-destructive border-destructive/30" : "bg-warning/20 text-warning border-warning/30"}>
              <AlertCircle className="h-3 w-3 mr-1" /> {expiryLabel}
            </Badge>
          )}
          <span className="text-xs text-muted-foreground">
            Reserved {format(new Date(reservation.created_at), "MMM dd, yyyy HH:mm")}
          </span>
        </div>
        {view === "buyer" && reservation.status === "pending" && onCancel && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onCancel(reservation.id)}
            className="text-destructive hover:text-destructive"
          >
            <X className="h-4 w-4 mr-2" /> Cancel
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Product Section */}
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            {imageUrl ? (
              <img
                src={imageUrl}
                alt={listing?.product_name}
                className="h-20 w-20 rounded-lg border border-border object-cover"
              />
            ) : (
              <div className="h-20 w-20 rounded-lg border border-border bg-muted flex items-center justify-center">
                <span className="text-xs text-muted-foreground">IMG</span>
              </div>
            )}
            <div className="flex-1 min-w-0">
              <Link to={`/product/${reservation.listing_id}`}>
                <h3 className="font-semibold text-primary hover:underline truncate">
                  {listing?.product_name || "Product"}
                </h3>
              </Link>
              <p className="text-sm text-muted-foreground truncate">
                {toTitleCase(listing?.category)}
                {listing?.subcategory && ` • ${toTitleCase(listing.subcategory)}`}
              </p>
              <p className="text-xs text-muted-foreground truncate">
                {listing?.packaging}
                {listing?.bottles_per_case && ` • ${listing.bottles_per_case} btl/case`}
              </p>
            </div>
          </div>

          {/* Reservation Details */}
          <div className="space-y-2 p-4 rounded-lg border bg-muted/50">
            <h4 className="font-semibold text-sm flex items-center gap-2">
              <Package className="h-4 w-4 text-primary" />
              Reservation Details
            </h4>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <span className="text-muted-foreground">Quantity:</span>
                <span className="ml-2 font-medium">
                  {reservation.quantity} {listing?.packaging === "case" ? "cases" : "bottles"}
                </span>
              </div>
              <div>
                <span className="text-muted-foreground">Price per unit:</span>
                <span className="ml-2 font-medium">
                  {symbol} {Number(reservation.price_per_unit).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>
              <div className="col-span-2 pt-2 border-t border-border">
                <span className="text-muted-foreground">Total:</span>
                <span className="ml-2 font-bold text-primary text-lg">
                  {symbol} {totalPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>
              {showListingQuantity && listingQuantity !== undefined && (
                <div className="col-span-2 pt-2 border-t border-border">
                  <span className="text-muted-foreground">Current Stock:</span>
                  <span className="ml-2 font-medium">{listingQuantity}</span>
                  {quantityAfterConfirmation !== null && (
                    <>
                      <span className="text-muted-foreground ml-4">After Confirmation:</span>
                      <span className={`ml-2 font-medium ${isLowStock ? "text-destructive" : ""}`}>
                        {quantityAfterConfirmation} {isLowStock && "⚠️"}
                      </span>
                    </>
                  )}
                </div>
              )}
            </div>
            {reservation.notes && (
              <div className="mt-2 text-sm">
                <span className="text-muted-foreground">Notes:</span>
                <p className="mt-1 text-foreground">{reservation.notes}</p>
              </div>
            )}
          </div>

          {/* Quick Actions */}
          <div className="flex gap-2">
            <Button variant="outline" size="sm" asChild>
              <Link to={`/product/${reservation.listing_id}`}>
                <Eye className="h-4 w-4 mr-2" /> View Product
              </Link>
            </Button>
          </div>
          {view === 'buyer' && (reservation.status === 'pending' || reservation.status === 'confirmed') && (
            <div className="pt-2">
              <div className="text-xs text-muted-foreground mb-1">
                {reservation.status === 'pending' 
                  ? 'Your reservation is pending admin approval. Our admin team will contact you within 24-48 hours to complete your purchase.'
                  : 'Your reservation has been confirmed. Payment has been processed manually.'}
              </div>
              {extraFooter}
            </div>
          )}
        </div>

        {/* Buyer/Seller Section */}
        <div className="space-y-4">
          {view === "seller" ? (
            <>
              {buyer ? (
                <div className="p-4 rounded-lg border bg-muted/50">
                  <h4 className="font-semibold text-sm mb-3 flex items-center gap-2">
                    <User className="h-4 w-4 text-primary" />
                    Buyer Details
                  </h4>
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="text-muted-foreground">Name:</span>
                      <span className="ml-2 font-medium">{buyer.full_name || "—"}</span>
                    </div>
                    {buyer.company?.name && (
                      <div>
                        <span className="text-muted-foreground flex items-center gap-1">
                          <Building2 className="h-3 w-3" /> Company:
                        </span>
                        <span className="ml-5 font-medium">{buyer.company.name}</span>
                        {buyer.company.country && (
                          <span className="ml-2 text-xs text-muted-foreground">({buyer.company.country})</span>
                        )}
                      </div>
                    )}
                    {buyer.email && (
                      <div className="flex items-center gap-2">
                        <span className="text-muted-foreground">Email:</span>
                        <a
                          href={`mailto:${buyer.email}`}
                          className="text-primary hover:underline flex items-center gap-1"
                        >
                          <Mail className="h-3 w-3" /> {buyer.email}
                        </a>
                      </div>
                    )}
                    {buyer.phone && (
                      <div className="flex items-center gap-2">
                        <span className="text-muted-foreground">Phone:</span>
                        <a
                          href={`tel:${buyer.phone}`}
                          className="text-primary hover:underline flex items-center gap-1"
                        >
                          <Phone className="h-3 w-3" /> {buyer.phone}
                        </a>
                      </div>
                    )}
                    {!buyer.email && !buyer.phone && (
                      <div className="text-xs text-muted-foreground italic">
                        No contact information available
                      </div>
                    )}
                  </div>
            {reservation.escrow_method && (
              <div className="text-xs text-muted-foreground mt-2">
                Escrow: <span className="font-medium text-foreground">{reservation.escrow_method === 'warehouse' ? 'Warehouse Escrow' : 'CIGATY Escrow'}</span>
              </div>
            )}
                </div>
              ) : (
                <div className="p-4 rounded-lg border border-warning/20 bg-warning/5">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="h-4 w-4 text-warning mt-0.5" />
                    <div>
                      <h4 className="font-semibold text-sm text-warning mb-1">Buyer Information Not Available</h4>
                      <p className="text-xs text-muted-foreground">
                        Unable to load buyer details. Please refresh the page or contact support.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex gap-2">
                {buyer?.email && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-1"
                    onClick={() => onContact?.(buyer.email)}
                  >
                    <Mail className="h-4 w-4 mr-2" /> Email
                  </Button>
                )}
                {buyer?.phone && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-1"
                    onClick={() => onContact?.(undefined, buyer.phone)}
                  >
                    <Phone className="h-4 w-4 mr-2" /> Call
                  </Button>
                )}
              </div>

              {reservation.status === "pending" && (
                <div className="flex flex-col gap-2">
                  <div className="p-3 rounded-lg border border-info/20 bg-info/5">
                    <p className="text-xs text-muted-foreground">
                      Reservation is pending. Admin will manually contact the buyer and process payment before confirming. 
                      {reservation.payment_percentage && (
                        <span className="font-medium text-foreground ml-1">
                          Payment: {reservation.payment_percentage}%
                        </span>
                      )}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="destructive"
                      className="flex-1"
                      onClick={() => onCancel?.(reservation.id)}
                    >
                      <X className="h-4 w-4 mr-2" /> Cancel
                    </Button>
                  </div>
                </div>
              )}
              {reservation.extended_until && (
                <div className="mt-2 text-xs text-muted-foreground">
                  Extended until: {format(new Date(reservation.extended_until), "MMM dd, yyyy 'at' HH:mm")}
                  {reservation.extension_reason && (
                    <div className="mt-1">Reason: {reservation.extension_reason}</div>
                  )}
                </div>
              )}
            </>
          ) : (
            <>
              {/* CIGATY Director Info for Buyer View */}
              <div className="p-4 rounded-lg border bg-muted/50">
                <h4 className="font-semibold text-sm mb-3">Contact for Sales</h4>
                <div className="space-y-2 text-sm mb-3">
                  <div>
                    <span className="text-muted-foreground">Salesperson:</span>
                    <span className="ml-2 font-medium">{CIGATY_DIRECTOR.name}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Email:</span>
                    <a
                      href={`mailto:${CIGATY_DIRECTOR.email}`}
                      className="ml-2 text-primary hover:underline flex items-center gap-1"
                    >
                      <Mail className="h-3 w-3" /> {CIGATY_DIRECTOR.email}
                    </a>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Phone:</span>
                    <a
                      href={`tel:${CIGATY_DIRECTOR.phone}`}
                      className="ml-2 text-primary hover:underline flex items-center gap-1"
                    >
                      <Phone className="h-3 w-3" /> {CIGATY_DIRECTOR.phone}
                    </a>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="flex-1" asChild>
                    <a href={`mailto:${CIGATY_DIRECTOR.email}`}>
                      <Mail className="h-4 w-4 mr-2" /> Email
                    </a>
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1" asChild>
                    <a href={`tel:${CIGATY_DIRECTOR.phone}`}>
                      <Phone className="h-4 w-4 mr-2" /> Call
                    </a>
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex-1"
                    onClick={() => window.open(`https://wa.me/${CIGATY_DIRECTOR.whatsappNumber}?text=Hello%20from%20CIGATY%20Trade%20Portal`, '_blank')}
                  >
                    <MessageCircle className="h-4 w-4 mr-2" /> WhatsApp
                  </Button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </Card>
  );
}

