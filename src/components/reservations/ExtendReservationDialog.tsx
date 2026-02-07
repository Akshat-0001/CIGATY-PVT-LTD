import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Calendar } from "lucide-react";
import { format, addDays } from "date-fns";

interface ExtendReservationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  reservationId: string;
  currentExpiry?: string | null;
  onSuccess?: () => void;
}

export function ExtendReservationDialog({
  open,
  onOpenChange,
  reservationId,
  currentExpiry,
  onSuccess,
}: ExtendReservationDialogProps) {
  const { toast } = useToast();
  const [newExpiryDate, setNewExpiryDate] = useState("");
  const [newExpiryTime, setNewExpiryTime] = useState("");
  const [reason, setReason] = useState("");
  const [isExtending, setIsExtending] = useState(false);

  // Set default date (7 days from now or current expiry, whichever is later)
  useEffect(() => {
    if (open) {
      const baseDate = currentExpiry ? new Date(currentExpiry) : new Date();
      const defaultDate = baseDate > new Date() ? baseDate : addDays(new Date(), 7);
      setNewExpiryDate(format(defaultDate, "yyyy-MM-dd"));
      setNewExpiryTime(format(defaultDate, "HH:mm"));
      setReason("");
    }
  }, [open, currentExpiry]);

  const handleExtend = async () => {
    if (!newExpiryDate || !newExpiryTime) {
      toast({
        title: "Date and time required",
        description: "Please select both date and time for the new expiry",
        variant: "destructive",
      });
      return;
    }

    const expiryDateTime = new Date(`${newExpiryDate}T${newExpiryTime}`);
    if (expiryDateTime <= new Date()) {
      toast({
        title: "Invalid date",
        description: "Expiry date must be in the future",
        variant: "destructive",
      });
      return;
    }

    setIsExtending(true);
    try {
      const { error } = await supabase.rpc("extend_reservation", {
        _reservation_id: reservationId,
        _new_expiry_date: expiryDateTime.toISOString(),
        _reason: reason.trim() || null,
      });

      if (error) throw error;

      toast({
        title: "Reservation extended",
        description: `Reservation expiry extended to ${format(expiryDateTime, "MMM dd, yyyy 'at' HH:mm")}`,
      });

      onSuccess?.();
      onOpenChange(false);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to extend reservation",
        variant: "destructive",
      });
    } finally {
      setIsExtending(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Extend Reservation</DialogTitle>
          <DialogDescription>
            Extend the expiry date for this reservation. The buyer will be notified of the new expiry date.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>New Expiry Date *</Label>
              <Input
                type="date"
                value={newExpiryDate}
                onChange={(e) => setNewExpiryDate(e.target.value)}
                min={format(new Date(), "yyyy-MM-dd")}
              />
            </div>
            <div>
              <Label>Time *</Label>
              <Input
                type="time"
                value={newExpiryTime}
                onChange={(e) => setNewExpiryTime(e.target.value)}
              />
            </div>
          </div>
          <div>
            <Label>Reason (Optional)</Label>
            <Textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g., Buyer requested extension due to payment processing delay"
              rows={3}
            />
          </div>
          {currentExpiry && (
            <div className="text-sm text-muted-foreground">
              Current expiry: {format(new Date(currentExpiry), "MMM dd, yyyy 'at' HH:mm")}
            </div>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isExtending}>
            Cancel
          </Button>
          <Button onClick={handleExtend} disabled={isExtending} className="gap-2">
            <Calendar className="h-4 w-4" />
            {isExtending ? "Extending..." : "Extend Reservation"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

