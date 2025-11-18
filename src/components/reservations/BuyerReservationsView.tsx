import { useState, useMemo } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Search, ChevronDown, Package } from "lucide-react";
import { Link } from "react-router-dom";
import { useReservations } from "@/hooks/useReservations";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import ReservationCard from "./ReservationCard";

async function fetchSellerInfo(userId: string | null) {
  if (!userId) return null;
  const { data, error } = await supabase
    .from("profiles")
    .select("full_name, email, phone")
    .eq("id", userId)
    .single();
  if (error) return null;
  return data as any;
}

export default function BuyerReservationsView() {
  const { reservations, isLoading, updateReservation } = useReservations(false);
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"active" | "pending" | "confirmed" | "cancelled" | "all">("active");
  const [sortKey, setSortKey] = useState("date_desc");

  // Fetch seller info for all reservations
  const sellerIds = useMemo(() => {
    return Array.from(new Set(
      reservations
        .map((r) => (r.listing as any)?.seller_user_id)
        .filter((id): id is string => !!id)
    ));
  }, [reservations]);

  const { data: sellerInfoMap } = useQuery({
    queryKey: ["sellers", sellerIds],
    queryFn: async () => {
      const map: Record<string, any> = {};
      await Promise.all(
        sellerIds.map(async (id) => {
          const seller = await fetchSellerInfo(id);
          if (seller) map[id] = seller;
        })
      );
      return map;
    },
    enabled: sellerIds.length > 0,
  });

  const filteredReservations = useMemo(() => {
    let filtered = [...reservations];

    // Filter by status
    if (statusFilter === "active") {
      filtered = filtered.filter((r) => r.status === "pending" || r.status === "confirmed");
    } else if (statusFilter !== "all") {
      filtered = filtered.filter((r) => r.status === statusFilter);
    }

    // Search filter
    if (search) {
      const query = search.toLowerCase();
      filtered = filtered.filter((r) => {
        const listing = r.listing as any;
        return (
          listing?.product_name?.toLowerCase().includes(query) ||
          listing?.category?.toLowerCase().includes(query) ||
          listing?.subcategory?.toLowerCase().includes(query)
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

  const handleCancelReservation = async (id: string) => {
    if (!confirm("Are you sure you want to cancel this reservation?")) return;

    try {
      await updateReservation({ id, status: "cancelled" });
      toast({
        title: "Reservation cancelled",
        description: "Your reservation has been cancelled successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to cancel reservation",
        variant: "destructive",
      });
    }
  };

  const stats = useMemo(() => {
    const pending = reservations.filter((r) => r.status === "pending").length;
    const confirmed = reservations.filter((r) => r.status === "confirmed").length;
    const cancelled = reservations.filter((r) => r.status === "cancelled").length;
    const totalValue = reservations
      .filter((r) => r.status === "pending" || r.status === "confirmed")
      .reduce((sum, r) => sum + (r.quantity * r.price_per_unit), 0);

    return { pending, confirmed, cancelled, totalValue, total: reservations.length };
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
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-display font-semibold">My Reservations</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Track and manage all your product reservations
          </p>
        </div>
      </div>

      {/* Dashboard Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Active Reservations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pending + stats.confirmed}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {stats.pending} pending • {stats.confirmed} confirmed
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Pending</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pending}</div>
            <p className="text-xs text-muted-foreground mt-1">Awaiting admin approval</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Confirmed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.confirmed}</div>
            <p className="text-xs text-muted-foreground mt-1">Confirmed by admin</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Value</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">€{stats.totalValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
            <p className="text-xs text-muted-foreground mt-1">Active reservations</p>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by product, category..."
            className="pl-10"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
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

      {/* Status Tabs */}
      <Tabs value={statusFilter} onValueChange={(v) => setStatusFilter(v as any)}>
        <div className="overflow-x-auto -mx-4 px-4 md:mx-0 md:px-0">
          <TabsList className="w-max md:w-full">
            <TabsTrigger value="active" className="whitespace-nowrap">Active ({stats.pending + stats.confirmed})</TabsTrigger>
            <TabsTrigger value="pending" className="whitespace-nowrap">Pending ({stats.pending})</TabsTrigger>
            <TabsTrigger value="confirmed" className="whitespace-nowrap">Confirmed ({stats.confirmed})</TabsTrigger>
            <TabsTrigger value="cancelled" className="whitespace-nowrap">Cancelled ({stats.cancelled})</TabsTrigger>
            <TabsTrigger value="all" className="whitespace-nowrap">All ({stats.total})</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value={statusFilter} className="space-y-4 mt-4">
          {filteredReservations.length === 0 ? (
            <Card className="p-12">
              <div className="text-center">
                <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No reservations found</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  {statusFilter === "active" 
                    ? "You don't have any active reservations. Start browsing offers!"
                    : "No reservations match your filters."}
                </p>
                {statusFilter === "active" && (
                  <Button asChild>
                    <Link to="/live-offers">Browse Marketplace</Link>
                  </Button>
                )}
              </div>
            </Card>
          ) : (
            <div className="grid gap-4">
                    {filteredReservations.map((reservation) => {
                const listing = reservation.listing as any;
                const seller = sellerInfoMap?.[listing?.seller_user_id];
                return (
                  <ReservationCard
                    key={reservation.id}
                    reservation={reservation}
                    view="buyer"
                    onCancel={handleCancelReservation}
                    seller={seller}
                  />
                );
              })}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

