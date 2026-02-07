import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { User, Mail, Phone, Package, Calendar, FileText, ExternalLink } from "lucide-react";
import { Link } from "react-router-dom";

interface ReservationCardProps {
  reservation: {
    reservation_id: string;
    buyer_name: string;
    buyer_email: string;
    buyer_phone: string;
    buyer_company: string;
    product_name: string;
    category: string;
    subcategory: string;
    quantity: number;
    price_per_unit: number;
    status: string;
    created_at: string;
    notes?: string;
  };
  listingId: string;
}

export function ReservationCard({ reservation, listingId }: ReservationCardProps) {
  const totalPrice = reservation.price_per_unit * reservation.quantity;
  const currency = "EUR"; // Default, can be fetched from listing
  const isEUR = currency.toUpperCase() === "EUR";
  const symbol = isEUR ? "€" : currency;

  const statusColors: Record<string, string> = {
    pending: "bg-primary/20 text-primary border-primary/30",
    confirmed: "bg-success/20 text-success border-success/30",
    cancelled: "bg-destructive/20 text-destructive border-destructive/30",
    completed: "bg-secondary/20 text-secondary border-secondary/30",
  };

  const statusLabel: Record<string, string> = {
    pending: "Pending",
    confirmed: "Confirmed",
    cancelled: "Cancelled",
    completed: "Completed",
  };

  const createdDate = new Date(reservation.created_at);
  const timeAgo = getTimeAgo(createdDate);

  return (
    <div className="rounded-xl border border-border bg-card p-6 hover:border-primary/50 hover:shadow-lg transition-all duration-300 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Badge className={statusColors[reservation.status] || statusColors.pending}>
          {statusLabel[reservation.status] || "Pending"}
        </Badge>
        <span className="text-xs text-muted-foreground">Reserved {timeAgo}</span>
      </div>

      {/* Product Info */}
      <div className="flex items-center gap-4 p-4 rounded-lg bg-muted/30 border border-border/50">
        <div className="h-16 w-16 rounded-lg overflow-hidden bg-muted border border-border flex items-center justify-center shrink-0">
          <Package className="h-8 w-8 text-muted-foreground" />
        </div>
        <div className="flex-1 min-w-0">
          <Link
            to={`/product/${listingId}`}
            className="font-semibold hover:text-primary transition-colors flex items-center gap-2"
          >
            {reservation.product_name}
            <ExternalLink className="h-3 w-3 text-muted-foreground" />
          </Link>
          <div className="text-sm text-muted-foreground">
            {reservation.category}
            {reservation.subcategory && ` • ${reservation.subcategory}`}
          </div>
        </div>
      </div>

      {/* Buyer Details */}
      <div className="space-y-3 p-4 rounded-lg bg-muted/50 border border-border/50">
        <div className="flex items-center gap-2 font-semibold text-sm">
          <User className="h-4 w-4 text-primary" />
          Buyer Details
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
          <div>
            <span className="text-muted-foreground">Name:</span>
            <span className="ml-2 font-medium">{reservation.buyer_name || "—"}</span>
          </div>
          <div>
            <span className="text-muted-foreground">Company:</span>
            <span className="ml-2 font-medium">{reservation.buyer_company || "—"}</span>
          </div>
          {reservation.buyer_email && (
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground">Email:</span>
              <a
                href={`mailto:${reservation.buyer_email}`}
                className="text-primary hover:underline flex items-center gap-1"
              >
                {reservation.buyer_email}
                <Mail className="h-3 w-3" />
              </a>
            </div>
          )}
          {reservation.buyer_phone && (
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground">Phone:</span>
              <a
                href={`tel:${reservation.buyer_phone}`}
                className="text-primary hover:underline flex items-center gap-1"
              >
                {reservation.buyer_phone}
                <Phone className="h-3 w-3" />
              </a>
            </div>
          )}
        </div>
        <div className="flex gap-2 pt-2 border-t border-border/50">
          {reservation.buyer_email && (
            <Button
              size="sm"
              variant="outline"
              asChild
              className="flex-1"
            >
              <a href={`mailto:${reservation.buyer_email}`}>
                <Mail className="h-4 w-4 mr-2" />
                Contact
              </a>
            </Button>
          )}
          {reservation.buyer_phone && (
            <Button
              size="sm"
              variant="outline"
              asChild
              className="flex-1"
            >
              <a href={`tel:${reservation.buyer_phone}`}>
                <Phone className="h-4 w-4 mr-2" />
                Call
              </a>
            </Button>
          )}
        </div>
      </div>

      {/* Reservation Details */}
      <div className="space-y-3 p-4 rounded-lg bg-muted/30 border border-border/50">
        <div className="flex items-center gap-2 font-semibold text-sm">
          <Package className="h-4 w-4 text-primary" />
          Reservation Details
        </div>
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <span className="text-muted-foreground">Quantity:</span>
            <span className="ml-2 font-medium">{reservation.quantity} cases</span>
          </div>
          <div>
            <span className="text-muted-foreground">Price per Unit:</span>
            <span className="ml-2 font-medium">
              {symbol} {reservation.price_per_unit.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>
          <div className="col-span-2">
            <span className="text-muted-foreground">Total Value:</span>
            <span className="ml-2 font-semibold text-lg text-primary">
              {symbol} {totalPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>
          <div className="col-span-2 flex items-center gap-2 text-xs text-muted-foreground">
            <Calendar className="h-3 w-3" />
            Reserved: {createdDate.toLocaleString()}
          </div>
        </div>
      </div>

      {/* Notes */}
      {reservation.notes && (
        <div className="space-y-2 p-4 rounded-lg bg-muted/30 border border-border/50">
          <div className="flex items-center gap-2 font-semibold text-sm">
            <FileText className="h-4 w-4 text-primary" />
            Notes
          </div>
          <p className="text-sm text-muted-foreground">{reservation.notes}</p>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-2 pt-2 border-t border-border/50">
        <Button
          size="sm"
          variant="outline"
          asChild
          className="flex-1"
        >
          <Link to={`/product/${listingId}`}>
            View Listing
          </Link>
        </Button>
        {reservation.status === "pending" && (
          <Button
            size="sm"
            className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90"
            onClick={() => {/* Mark as confirmed - to be implemented */}}
          >
            Mark Confirmed
          </Button>
        )}
      </div>
    </div>
  );
}

function getTimeAgo(date: Date): string {
  const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) return `${days} day${days > 1 ? "s" : ""} ago`;
  if (hours > 0) return `${hours} hour${hours > 1 ? "s" : ""} ago`;
  if (minutes > 0) return `${minutes} minute${minutes > 1 ? "s" : ""} ago`;
  return "just now";
}

