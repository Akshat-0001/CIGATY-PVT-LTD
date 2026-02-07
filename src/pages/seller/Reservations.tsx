import { useState, useMemo } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useReservations } from "@/hooks/useReservations";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Mail, Phone, User, Building2, Calendar, Package } from "lucide-react";
import { Link } from "react-router-dom";
import { Search, ChevronDown } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

export default function SellerReservations() {
  const { reservations, isLoading, updateReservation } = useReservations(true);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "pending" | "confirmed" | "cancelled">("all");
  const [sortKey, setSortKey] = useState<string>("date_desc");

  const filteredReservations = useMemo(() => {
    let filtered = [...reservations];

    if (statusFilter !== "all") {
      filtered = filtered.filter((r) => r.status === statusFilter);
    }

    if (search) {
      const query = search.toLowerCase();
      filtered = filtered.filter((r) => {
        const listing = r.listing as any;
        const buyer = r.buyer as any;
        return (
          listing?.product_name?.toLowerCase().includes(query) ||
          buyer?.full_name?.toLowerCase().includes(query) ||
          buyer?.email?.toLowerCase().includes(query) ||
          buyer?.company?.name?.toLowerCase().includes(query)
        );
      });
    }

    if (sortKey === "date_desc") {
      filtered.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    } else if (sortKey === "date_asc") {
      filtered.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
    }

    return filtered;
  }, [reservations, statusFilter, search, sortKey]);

  const handleUpdateStatus = async (id: string, status: "confirmed" | "cancelled") => {
    try {
      await updateReservation({ id, status });
      toast({
        title: `Reservation ${status}`,
        description: `Reservation has been marked as ${status}`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update reservation",
        variant: "destructive",
      });
    }
  };

  const statusCounts = useMemo(() => {
    const counts = { all: reservations.length, pending: 0, confirmed: 0, cancelled: 0 };
    reservations.forEach((r) => {
      if (r.status === "pending") counts.pending++;
      else if (r.status === "confirmed") counts.confirmed++;
      else if (r.status === "cancelled") counts.cancelled++;
    });
    return counts;
  }, [reservations]);

  if (isLoading) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Loading reservations...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-display font-semibold">Reservations</h2>
          <p className="text-sm text-muted-foreground mt-1">
            {filteredReservations.length} reservation{filteredReservations.length !== 1 ? "s" : ""}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by buyer, product, company..."
            className="pl-10"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="gap-2">
              Sort by <ChevronDown className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => setSortKey("date_desc")}>Newest First</DropdownMenuItem>
            <DropdownMenuItem onClick={() => setSortKey("date_asc")}>Oldest First</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <Tabs value={statusFilter} onValueChange={(v) => setStatusFilter(v as any)}>
        <TabsList>
          <TabsTrigger value="all">All ({statusCounts.all})</TabsTrigger>
          <TabsTrigger value="pending">Pending ({statusCounts.pending})</TabsTrigger>
          <TabsTrigger value="confirmed">Confirmed ({statusCounts.confirmed})</TabsTrigger>
          <TabsTrigger value="cancelled">Cancelled ({statusCounts.cancelled})</TabsTrigger>
        </TabsList>

        <TabsContent value={statusFilter} className="space-y-4 mt-4">
          {filteredReservations.length === 0 ? (
            <div className="text-center py-12 rounded-lg border bg-card">
              <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No reservations found</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {filteredReservations.map((reservation) => {
                const listing = reservation.listing as any;
                const buyer = reservation.buyer as any;
                const imageUrl = Array.isArray(listing?.image_urls) && listing.image_urls.length > 0
                  ? listing.image_urls[0]
                  : null;

                const totalPrice = reservation.quantity * Number(reservation.price_per_unit);
                const symbol = reservation.currency === "EUR" ? "€" : reservation.currency;

                return (
                  <Card key={reservation.id} className="p-6 hover:border-primary/50 transition-all duration-300">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <Badge
                          className={
                            reservation.status === "pending"
                              ? "bg-warning/20 text-warning border-warning/30"
                              : reservation.status === "confirmed"
                              ? "bg-success/20 text-success border-success/30"
                              : "bg-destructive/20 text-destructive border-destructive/30"
                          }
                        >
                          {reservation.status}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          Reserved {new Date(reservation.created_at).toLocaleString()}
                        </span>
                      </div>
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
                          <div className="flex-1">
                            <Link to={`/product/${reservation.listing_id}`}>
                              <h3 className="font-semibold text-primary hover:underline">
                                {listing?.product_name || "Product"}
                              </h3>
                            </Link>
                            <p className="text-sm text-muted-foreground">
                              {listing?.category}
                              {listing?.subcategory && ` • ${listing.subcategory}`}
                            </p>
                          </div>
                        </div>

                        <div className="space-y-2 p-4 rounded-lg border bg-muted/50">
                          <h4 className="font-semibold text-sm flex items-center gap-2">
                            <Package className="h-4 w-4 text-primary" />
                            Reservation Details
                          </h4>
                          <div className="grid grid-cols-2 gap-2 text-sm">
                            <div>
                              <span className="text-muted-foreground">Quantity:</span>
                              <span className="ml-2 font-medium">{reservation.quantity} cases</span>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Price:</span>
                              <span className="ml-2 font-medium">
                                {symbol} {Number(reservation.price_per_unit).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} per case
                              </span>
                            </div>
                            <div className="col-span-2 pt-2 border-t border-border">
                              <span className="text-muted-foreground">Total:</span>
                              <span className="ml-2 font-bold text-primary">
                                {symbol} {totalPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                              </span>
                            </div>
                          </div>
                          {reservation.notes && (
                            <div className="mt-2 text-sm">
                              <span className="text-muted-foreground">Notes:</span>
                              <p className="mt-1 text-foreground">{reservation.notes}</p>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Buyer Section */}
                      <div className="space-y-4">
                        <div className="p-4 rounded-lg border bg-muted/50">
                          <h4 className="font-semibold text-sm mb-3 flex items-center gap-2">
                            <User className="h-4 w-4 text-primary" />
                            Buyer Details
                          </h4>
                          <div className="space-y-2 text-sm">
                            <div>
                              <span className="text-muted-foreground">Name:</span>
                              <span className="ml-2 font-medium">{buyer?.full_name || "—"}</span>
                            </div>
                            {buyer?.company?.name && (
                              <div>
                                <span className="text-muted-foreground flex items-center gap-1">
                                  <Building2 className="h-3 w-3" /> Company:
                                </span>
                                <span className="ml-5 font-medium">{buyer.company.name}</span>
                              </div>
                            )}
                            {buyer?.email && (
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
                            {buyer?.phone && (
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
                          </div>
                        </div>

                        <div className="flex gap-2">
                          {buyer?.email && (
                            <Button
                              size="sm"
                              variant="outline"
                              className="flex-1"
                              asChild
                            >
                              <a href={`mailto:${buyer.email}`}>
                                <Mail className="h-4 w-4 mr-2" /> Contact
                              </a>
                            </Button>
                          )}
                          {buyer?.phone && (
                            <Button
                              size="sm"
                              variant="outline"
                              className="flex-1"
                              asChild
                            >
                              <a href={`tel:${buyer.phone}`}>
                                <Phone className="h-4 w-4 mr-2" /> Call
                              </a>
                            </Button>
                          )}
                        </div>

                        {reservation.status === "pending" && (
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              className="flex-1 bg-success text-success-foreground hover:bg-success/90"
                              onClick={() => handleUpdateStatus(reservation.id, "confirmed")}
                            >
                              Mark Confirmed
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              className="flex-1"
                              onClick={() => handleUpdateStatus(reservation.id, "cancelled")}
                            >
                              Cancel
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
