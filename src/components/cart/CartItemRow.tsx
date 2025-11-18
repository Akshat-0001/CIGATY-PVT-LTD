import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toTitleCase } from "@/lib/utils";
import { Checkbox } from "@/components/ui/checkbox";
import { QuantityControl } from "./QuantityControl";
import { Trash2, ExternalLink } from "lucide-react";
import { Link } from "react-router-dom";
import { useCart, CartItem } from "@/hooks/useCart";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

interface CartItemRowProps {
  item: CartItem;
  isSelected: boolean;
  onSelect: (selected: boolean) => void;
}

export function CartItemRow({ item, isSelected, onSelect }: CartItemRowProps) {
  const { updateCartItemAsync, removeCartItemAsync } = useCart();
  const { toast } = useToast();
  const [isUpdating, setIsUpdating] = useState(false);

  const listing = item.listing as any;
  const imageUrl = Array.isArray(listing?.image_urls) && listing.image_urls.length > 0
    ? listing.image_urls[0]
    : null;

  const handleQuantityChange = async (delta: number) => {
    if (isUpdating) return;
    setIsUpdating(true);
    
    const newQuantity = item.quantity + delta;
    if (newQuantity < 1) {
      setIsUpdating(false);
      return;
    }
    if (listing?.quantity && newQuantity > listing.quantity) {
      toast({
        title: "Insufficient quantity",
        description: `Only ${listing.quantity} available`,
        variant: "destructive",
      });
      setIsUpdating(false);
      return;
    }

    try {
      await updateCartItemAsync({ id: item.id, updates: { quantity: newQuantity } });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update quantity",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleRemove = async () => {
    if (confirm("Remove this item from cart?")) {
      try {
        await removeCartItemAsync(item.id);
        toast({
          title: "Item removed",
          description: "Item has been removed from your cart",
        });
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to remove item",
          variant: "destructive",
        });
      }
    }
  };

  const priceLabel = () => {
    const amount = Number(item.price_per_unit);
    const symbol = item.currency === "EUR" ? "€" : item.currency;
    return `${symbol} ${amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const totalPrice = item.quantity * Number(item.price_per_unit);
  const totalPriceLabel = () => {
    const symbol = item.currency === "EUR" ? "€" : item.currency;
    return `${symbol} ${totalPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  return (
    <div className="grid md:grid-cols-[auto,2fr,1fr,1fr,1fr,1fr,1.5fr,auto] grid-cols-1 gap-4 p-5 border-b border-border/50 hover:bg-muted/20 transition-colors group">
      <div className="flex items-center md:justify-start justify-between">
        <Checkbox
          checked={isSelected}
          onCheckedChange={onSelect}
        />
        <div className="md:hidden flex items-center gap-2">
          <Link to={`/product/${item.listing_id}`}>
            <Button size="sm" variant="outline" className="gap-1">
              View
            </Button>
          </Link>
          <Button
            size="sm"
            variant="ghost"
            className="text-destructive hover:text-destructive hover:bg-destructive/10"
            onClick={handleRemove}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="flex items-center gap-4 min-w-0">
        <div className="h-20 w-20 rounded-lg border border-border bg-muted overflow-hidden flex items-center justify-center shrink-0">
          {imageUrl ? (
            <img src={imageUrl} alt={listing?.product_name} className="h-full w-full object-cover" />
          ) : (
            <span className="text-xs text-muted-foreground">IMG</span>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <Link to={`/product/${item.listing_id}`} className="hover:underline">
            <h3 className="font-semibold text-primary truncate">
              {listing?.product_name || "Product"}
            </h3>
          </Link>
          <div className="flex items-center gap-2 mt-1 flex-wrap">
            <Badge className="bg-primary/20 text-primary border-primary/30 text-xs">
              New in
            </Badge>
            {listing?.packaging && (
              <span className="text-xs text-muted-foreground">
                {listing.packaging}
              </span>
            )}
            <span className="text-xs text-muted-foreground md:hidden">
              {listing?.category || "—"}
            </span>
          </div>
        </div>
      </div>

      <div className="hidden md:flex items-center text-sm">{listing?.category || "—"}</div>
      <div className="hidden md:flex items-center text-sm">{listing?.subcategory ? toTitleCase(listing.subcategory) : "—"}</div>
      <div className="hidden md:flex items-center text-sm">{listing?.packaging || "—"}</div>
      <div className="hidden md:flex items-center text-sm">—</div> {/* Warehouse - can be added later */}

      <div className="flex items-center md:justify-start justify-between">
        <QuantityControl
          quantity={item.quantity}
          minQuantity={listing?.min_quantity || 1}
          maxQuantity={listing?.quantity}
          available={listing?.quantity}
          onIncrease={() => handleQuantityChange(1)}
          onDecrease={() => handleQuantityChange(-1)}
          disabled={isUpdating}
        />
        <div className="md:hidden text-sm font-semibold">{priceLabel()}</div>
      </div>

      <div className="hidden md:flex flex-col justify-center">
        <p className="font-semibold text-sm">{priceLabel()}</p>
        <p className="text-xs text-muted-foreground">Total: {totalPriceLabel()}</p>
        <p className="text-xs text-muted-foreground">Platform fee included in reservation</p>
      </div>

      {/* Mobile-only total display */}
      <div className="md:hidden flex items-center justify-between text-xs text-muted-foreground">
        <span>Total: {totalPriceLabel()}</span>
        <span className="text-xs">Platform fee included</span>
      </div>

      <div className="hidden md:flex items-center gap-2">
        <Link to={`/product/${item.listing_id}`}>
          <Button size="sm" variant="outline" className="gap-2">
            Reserve
          </Button>
        </Link>
        <Button
          size="sm"
          variant="ghost"
          className="text-destructive hover:text-destructive hover:bg-destructive/10"
          onClick={handleRemove}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
