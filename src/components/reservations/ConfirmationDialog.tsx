import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { AlertTriangle, Package, CheckCircle2 } from "lucide-react";
import { toTitleCase } from "@/lib/utils";
import type { Reservation } from "@/hooks/useReservations";

interface ConfirmationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  reservation: Reservation | null;
  listingQuantity?: number;
  onConfirm: (id: string, message?: string) => Promise<void>;
  isConfirming?: boolean;
}

export default function ConfirmationDialog({
  open,
  onOpenChange,
  reservation,
  listingQuantity,
  onConfirm,
  isConfirming = false,
}: ConfirmationDialogProps) {
  const [sendNotification, setSendNotification] = useState(true);
  const [personalMessage, setPersonalMessage] = useState("");
  const [addMessage, setAddMessage] = useState(false);

  if (!reservation) return null;

  const listing = reservation.listing as any;
  const buyer = reservation.buyer as any;
  const quantityAfter = listingQuantity !== undefined ? listingQuantity - reservation.quantity : null;
  const isLowStock = quantityAfter !== null && quantityAfter < 10;
  const isInsufficient = quantityAfter !== null && quantityAfter < 0;

  const handleConfirm = async () => {
    if (isInsufficient) {
      return; // Don't allow confirmation if insufficient stock
    }
    try {
      await onConfirm(reservation.id, addMessage ? personalMessage : undefined);
      onOpenChange(false);
      // Reset form
      setSendNotification(true);
      setPersonalMessage("");
      setAddMessage(false);
    } catch (error) {
      // Error handling done in parent
    }
  };

  const totalPrice = reservation.quantity * Number(reservation.price_per_unit);
  const symbol = reservation.currency === "EUR" ? "€" : reservation.currency;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Confirm Reservation</DialogTitle>
          <DialogDescription>
            Review reservation details before confirming. This will reduce your stock quantity.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Product Info */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                {Array.isArray(listing?.image_urls) && listing.image_urls[0] && (
                  <img
                    src={listing.image_urls[0]}
                    alt={listing?.product_name}
                    className="h-20 w-20 rounded-lg border object-cover"
                  />
                )}
                <div className="flex-1">
                  <h3 className="font-semibold text-lg">{listing?.product_name || "Product"}</h3>
                  <p className="text-sm text-muted-foreground">
                    {toTitleCase(listing?.category)}
                    {listing?.subcategory && ` • ${toTitleCase(listing.subcategory)}`}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Buyer Info */}
          <Card>
            <CardContent className="pt-6">
              <h4 className="font-semibold mb-3">Buyer Information</h4>
              <div className="space-y-2 text-sm">
                <div>
                  <span className="text-muted-foreground">Name:</span>
                  <span className="ml-2 font-medium">{buyer?.full_name || "—"}</span>
                </div>
                {buyer?.company?.name && (
                  <div>
                    <span className="text-muted-foreground">Company:</span>
                    <span className="ml-2 font-medium">{buyer.company.name}</span>
                  </div>
                )}
                {buyer?.email && (
                  <div>
                    <span className="text-muted-foreground">Email:</span>
                    <span className="ml-2">{buyer.email}</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Reservation Details */}
          <Card>
            <CardContent className="pt-6">
              <h4 className="font-semibold mb-3 flex items-center gap-2">
                <Package className="h-4 w-4" />
                Reservation Details
              </h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Quantity:</span>
                  <div className="font-medium">{reservation.quantity} {listing?.packaging === "case" ? "cases" : "bottles"}</div>
                </div>
                <div>
                  <span className="text-muted-foreground">Price per unit:</span>
                  <div className="font-medium">
                    {symbol} {Number(reservation.price_per_unit).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </div>
                </div>
                <div className="col-span-2 pt-2 border-t">
                  <span className="text-muted-foreground">Total:</span>
                  <div className="font-bold text-primary text-lg">
                    {symbol} {totalPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </div>
                </div>
              </div>
              {reservation.notes && (
                <div className="mt-4 pt-4 border-t">
                  <span className="text-muted-foreground text-sm">Buyer Notes:</span>
                  <p className="mt-1 text-sm">{reservation.notes}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Stock Impact */}
          {listingQuantity !== undefined && (
            <Card className={isLowStock || isInsufficient ? "border-destructive" : ""}>
              <CardContent className="pt-6">
                <h4 className="font-semibold mb-3 flex items-center gap-2">
                  {isInsufficient || isLowStock ? (
                    <AlertTriangle className="h-4 w-4 text-destructive" />
                  ) : (
                    <CheckCircle2 className="h-4 w-4 text-success" />
                  )}
                  Stock Impact
                </h4>
                {isInsufficient ? (
                  <div className="space-y-2 text-sm">
                    <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20">
                      <p className="text-destructive font-medium">
                        ⚠️ Insufficient Stock!
                      </p>
                      <p className="text-sm text-muted-foreground mt-1">
                        Current stock: {listingQuantity} • Requested: {reservation.quantity}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Cannot confirm this reservation. Please contact the buyer or update your stock.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Current Stock:</span>
                      <div className="font-medium text-lg">{listingQuantity}</div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Reserved:</span>
                      <div className="font-medium text-lg text-primary">{reservation.quantity}</div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">After Confirmation:</span>
                      <div className={`font-medium text-lg ${isLowStock ? "text-destructive" : "text-success"}`}>
                        {quantityAfter}
                        {isLowStock && " ⚠️"}
                      </div>
                    </div>
                  </div>
                )}
                {isLowStock && !isInsufficient && (
                  <div className="mt-3 p-3 rounded-lg bg-warning/10 border border-warning/20">
                    <p className="text-sm text-warning">
                      ⚠️ Low stock warning: Only {quantityAfter} units will remain after confirmation.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Options */}
          <div className="space-y-3">
            <div className="flex items-start gap-3 p-4 rounded-lg border bg-muted/30">
              <Checkbox
                id="notification"
                checked={sendNotification}
                onCheckedChange={(checked) => setSendNotification(checked === true)}
                disabled={isConfirming}
              />
              <Label htmlFor="notification" className="text-sm cursor-pointer flex-1">
                Send notification to buyer when confirmed
              </Label>
            </div>

            <div className="flex items-start gap-3 p-4 rounded-lg border bg-muted/30">
              <Checkbox
                id="message"
                checked={addMessage}
                onCheckedChange={(checked) => {
                  setAddMessage(checked === true);
                  if (!checked) setPersonalMessage("");
                }}
                disabled={isConfirming}
              />
              <div className="flex-1">
                <Label htmlFor="message" className="text-sm cursor-pointer">
                  Add personal message to buyer (optional)
                </Label>
                {addMessage && (
                  <Textarea
                    value={personalMessage}
                    onChange={(e) => setPersonalMessage(e.target.value)}
                    placeholder="Add a personal message for the buyer..."
                    className="mt-2"
                    rows={3}
                    disabled={isConfirming}
                  />
                )}
              </div>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isConfirming}
          >
            Cancel
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={isConfirming || isInsufficient}
            className="bg-success text-success-foreground hover:bg-success/90"
          >
            {isConfirming ? (
              <>
                <span className="animate-spin mr-2">⏳</span>
                Confirming...
              </>
            ) : (
              <>
                <CheckCircle2 className="h-4 w-4 mr-2" />
                Confirm Reservation
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

