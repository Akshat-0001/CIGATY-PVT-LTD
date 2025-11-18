import { useState, useMemo, useEffect } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Search, ChevronDown, Package, Mail, Phone, CheckCircle2, X, Download, AlertCircle, TrendingUp, Clock, DollarSign } from "lucide-react";
import { useReservations } from "@/hooks/useReservations";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import ReservationCard from "./ReservationCard";
import type { Reservation } from "@/hooks/useReservations";

async function fetchListingQuantity(listingId: string) {
  const { data, error } = await (supabase as any)
    .from("listings")
    .select("quantity")
    .eq("id", listingId)
    .single();
  if (error || !data) return null;
  return data.quantity || 0;
}

export default function SellerReservationsView() {
  const { reservations, isLoading, updateReservation } = useReservations(true);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "pending" | "confirmed" | "cancelled">("pending");
  const [sortKey, setSortKey] = useState("date_desc");
  const [selectedReservations, setSelectedReservations] = useState<Set<string>>(new Set());
  const [listingQuantities, setListingQuantities] = useState<Record<string, number>>({});

  // Fetch listing quantities for all reservations

  const listingIds = useMemo(() => {
    // Filter out undefined/null listing_ids
    return Array.from(new Set(
      reservations
        .map((r) => r.listing_id)
        .filter((id): id is string => !!id)
    ));
  }, [reservations]);

  useQuery({
    queryKey: ["listing_quantities", listingIds],
    queryFn: async () => {
      const quantities: Record<string, number> = {};
      await Promise.all(
        listingIds
          .filter((id): id is string => !!id)
          .map(async (listingId) => {
            const qty = await fetchListingQuantity(listingId);
            if (qty !== null) {
              quantities[listingId] = qty;
            }
          })
      );
      setListingQuantities(quantities);
      return quantities;
    },
    enabled: listingIds.length > 0 && listingIds.every(id => !!id),
    staleTime: 30_000, // Cache for 30 seconds
  });

  const filteredReservations = useMemo(() => {
    let filtered = [...reservations];

    // Filter by status
    if (statusFilter !== "all") {
      filtered = filtered.filter((r) => r.status === statusFilter);
    }

    // Search filter
    if (search) {
      const query = search.toLowerCase();
      filtered = filtered.filter((r) => {
        const listing = r.listing as any;
        const buyer = r.buyer as any;
        return (
          listing?.product_name?.toLowerCase().includes(query) ||
          listing?.category?.toLowerCase().includes(query) ||
          buyer?.full_name?.toLowerCase().includes(query) ||
          buyer?.email?.toLowerCase().includes(query) ||
          buyer?.company?.name?.toLowerCase().includes(query)
        );
      });
    }

    // Sort
    filtered.sort((a, b) => {
      if (sortKey === "date_desc") return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      if (sortKey === "date_asc") return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      if (sortKey === "price_desc") return (b.quantity * b.price_per_unit) - (a.quantity * a.price_per_unit);
      if (sortKey === "price_asc") return (a.quantity * a.price_per_unit) - (b.quantity * b.price_per_unit);
      return 0;
    });

    return filtered;
  }, [reservations, statusFilter, search, sortKey]);

  const handleSelectReservation = (id: string, selected: boolean) => {
    setSelectedReservations((prev) => {
      const next = new Set(prev);
      if (selected) {
        next.add(id);
      } else {
        next.delete(id);
      }
      return next;
    });
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedReservations(new Set(filteredReservations.map((r) => r.id)));
    } else {
      setSelectedReservations(new Set());
    }
  };

  const handleContact = (email?: string, phone?: string) => {
    if (email) {
      window.location.href = `mailto:${email}`;
    } else if (phone) {
      window.location.href = `tel:${phone}`;
    }
  };


  const handleCancelReservation = async (id: string) => {
    if (!confirm("Are you sure you want to cancel this reservation?")) return;

    try {
      await updateReservation({ id, status: "cancelled" });
      toast({
        title: "Reservation cancelled",
        description: "The reservation has been cancelled successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to cancel reservation",
        variant: "destructive",
      });
    }
  };

  const handleBulkCancel = async () => {
    if (selectedReservations.size === 0) return;
    if (!confirm(`Cancel ${selectedReservations.size} reservation(s)?`)) return;

    try {
      await Promise.all(
        Array.from(selectedReservations).map((id) =>
          updateReservation({ id, status: "cancelled" })
        )
      );
      toast({
        title: "Reservations cancelled",
        description: `${selectedReservations.size} reservation(s) have been cancelled`,
      });
      setSelectedReservations(new Set());
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to cancel some reservations",
        variant: "destructive",
      });
    }
  };

  const stats = useMemo(() => {
    const pending = reservations.filter((r) => r.status === "pending").length;
    const confirmed = reservations.filter((r) => r.status === "confirmed").length;
    const cancelled = reservations.filter((r) => r.status === "cancelled").length;
    
    const revenue = reservations
      .filter((r) => r.status === "confirmed")
      .reduce((sum, r) => sum + (r.quantity * r.price_per_unit), 0);

    const pendingValue = reservations
      .filter((r) => r.status === "pending")
      .reduce((sum, r) => sum + (r.quantity * r.price_per_unit), 0);

    // Note: Reservations are now confirmed automatically when buyer checks out
    // No longer tracking seller response time

    // Urgent reservations (pending > 24 hours)
    const urgent = reservations.filter((r) => {
      if (r.status !== "pending") return false;
      const hoursSince = (Date.now() - new Date(r.created_at).getTime()) / (1000 * 60 * 60);
      return hoursSince > 24;
    }).length;

    return { pending, confirmed, cancelled, revenue, pendingValue, urgent };
  }, [reservations]);

  const statusCounts = useMemo(() => {
    return {
      all: reservations.length,
      pending: stats.pending,
      confirmed: stats.confirmed,
      cancelled: stats.cancelled,
    };
  }, [reservations, stats]);

  if (isLoading) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Loading reservations...</p>
      </div>
    );
  }

  // Show error state if there's an error
  if (reservations.length === 0 && !isLoading) {
    // This is okay - no reservations yet
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-display font-semibold">Reservations</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage reservations on your listings
          </p>
        </div>
      </div>

      {/* Dashboard Stats */}
      <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Package className="h-4 w-4" /> Pending Reservations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pending}</div>
            {stats.urgent > 0 && (
              <Badge className="mt-2 bg-destructive/20 text-destructive border-destructive/30">
                <AlertCircle className="h-3 w-3 mr-1" /> {stats.urgent} needs attention
              </Badge>
            )}
            <p className="text-xs text-muted-foreground mt-1">Awaiting buyer checkout</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4" /> Confirmed
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.confirmed}</div>
            <p className="text-xs text-muted-foreground mt-1">Total confirmed</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <DollarSign className="h-4 w-4" /> Revenue This Week
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">€{stats.revenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
            <p className="text-xs text-muted-foreground mt-1">From confirmed reservations</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Clock className="h-4 w-4" /> Pending Value
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">€{stats.pendingValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
            <p className="text-xs text-muted-foreground mt-1">Awaiting checkout</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Filters & Actions */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by buyer, product, company..."
            className="pl-10"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
          {selectedReservations.size > 0 && (
              <Button
                variant="destructive"
                size="sm"
                onClick={handleBulkCancel}
                className="w-full sm:w-auto"
              >
                <X className="h-4 w-4 mr-2" /> <span className="hidden sm:inline">Cancel {selectedReservations.size}</span><span className="sm:hidden">Cancel</span>
              </Button>
          )}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="gap-2 w-full sm:w-auto">
                <ChevronDown className="h-4 w-4" /> <span className="hidden sm:inline">Sort by</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setSortKey("date_desc")}>Date (Newest)</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSortKey("date_asc")}>Date (Oldest)</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSortKey("price_desc")}>Price (High to Low)</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSortKey("price_asc")}>Price (Low to High)</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Status Tabs */}
      <Tabs value={statusFilter} onValueChange={(v) => setStatusFilter(v as any)}>
        <div className="overflow-x-auto -mx-4 px-4 md:mx-0 md:px-0">
          <TabsList className="w-max md:w-full">
            <TabsTrigger value="all" className="whitespace-nowrap">All ({statusCounts.all})</TabsTrigger>
            <TabsTrigger value="pending" className="whitespace-nowrap">
              Pending ({statusCounts.pending})
              {stats.urgent > 0 && (
                <Badge className="ml-2 bg-destructive text-destructive-foreground text-xs">
                  {stats.urgent}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="confirmed" className="whitespace-nowrap">Confirmed ({statusCounts.confirmed})</TabsTrigger>
            <TabsTrigger value="cancelled" className="whitespace-nowrap">Cancelled ({statusCounts.cancelled})</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value={statusFilter} className="space-y-4 mt-4">
          {filteredReservations.length === 0 ? (
            <Card className="p-12">
              <div className="text-center">
                <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No reservations found</h3>
                <p className="text-sm text-muted-foreground">
                  {statusFilter === "pending"
                    ? "You don't have any pending reservations at the moment."
                    : "No reservations match your filters."}
                </p>
              </div>
            </Card>
          ) : (
            <>
              {/* Bulk Select Header */}
              <div className="flex items-center gap-3 p-3 rounded-lg border bg-muted/30">
                <Checkbox
                  checked={
                    filteredReservations.length > 0 &&
                    filteredReservations.every((r) => selectedReservations.has(r.id))
                  }
                  onCheckedChange={(checked) => handleSelectAll(checked === true)}
                />
                <span className="text-sm text-muted-foreground">
                  {selectedReservations.size > 0
                    ? `${selectedReservations.size} selected`
                    : "Select all"}
                </span>
              </div>

              {/* Reservation Cards */}
              <div className="grid gap-4">
                {filteredReservations.map((reservation, index) => (
                  <ReservationCard
                    key={reservation.id || `reservation-${index}-${reservation.listing_id}`}
                    reservation={reservation}
                    view="seller"
                    onCancel={handleCancelReservation}
                    onContact={handleContact}
                    selected={selectedReservations.has(reservation.id)}
                    onSelect={handleSelectReservation}
                    showListingQuantity={true}
                    listingQuantity={reservation.listing_id ? listingQuantities[reservation.listing_id] : undefined}
                  />
                ))}
              </div>
            </>
          )}
        </TabsContent>
      </Tabs>

    </div>
  );
}

