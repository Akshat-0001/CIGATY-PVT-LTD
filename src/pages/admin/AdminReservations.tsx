import { useState, useMemo } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useReservations } from "@/hooks/useReservations";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Search,
  ChevronDown,
  CheckCircle2,
  XCircle,
  Eye,
  User,
  Mail,
  Phone,
  Building2,
  MapPin,
  FileText,
  Calendar,
  DollarSign,
  Package,
  Clock,
} from "lucide-react";
import { ExtendReservationDialog } from "@/components/reservations/ExtendReservationDialog";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import ReservationCard from "@/components/reservations/ReservationCard";
import ConfirmationDialog from "@/components/reservations/ConfirmationDialog";
import { format } from "date-fns";
import type { Reservation } from "@/hooks/useReservations";

interface BuyerProfile {
  id: string;
  email: string;
  full_name: string | null;
  phone: string | null;
  company_name: string | null;
  address_line1: string | null;
  address_line2: string | null;
  city: string | null;
  zip_code: string | null;
  country: string | null;
  registration_number: string | null;
  vat_number: string | null;
  director_name: string | null;
  position: string | null;
  primary_phone: string | null;
  secondary_phone: string | null;
  preferred_contact: string | null;
  role: string | null;
  verification_status: string | null;
  created_at: string | null;
}

async function fetchBuyerProfile(userId: string): Promise<BuyerProfile | null> {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .single();

  if (error) {
    console.error("Error fetching buyer profile:", error);
    return null;
  }

  return data as BuyerProfile;
}

export default function AdminReservations() {
  const { reservations, isLoading, confirmReservation, isConfirming } = useReservations(false, true);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "pending" | "confirmed" | "cancelled">("pending");
  const [sortKey, setSortKey] = useState("date_desc");
  const [showExpired, setShowExpired] = useState(false);
  const [selectedReservation, setSelectedReservation] = useState<Reservation | null>(null);
  const [confirmationDialogOpen, setConfirmationDialogOpen] = useState(false);
  const [buyerProfileDialogOpen, setBuyerProfileDialogOpen] = useState(false);
  const [selectedBuyerId, setSelectedBuyerId] = useState<string | null>(null);
  const [buyerProfile, setBuyerProfile] = useState<BuyerProfile | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [extendDialogOpen, setExtendDialogOpen] = useState(false);
  const [reservationToExtend, setReservationToExtend] = useState<Reservation | null>(null);

  // Helper function to check if reservation is expired
  const isReservationExpired = (reservation: Reservation): boolean => {
    if (reservation.status !== "pending") return false; // Only pending reservations can be expired
    
    const expiryDate = reservation.extended_until || reservation.expires_at;
    if (!expiryDate) return false;
    
    return new Date(expiryDate) < new Date();
  };

  // Helper function to get remaining time for a reservation
  const getRemainingTime = (reservation: Reservation): string | null => {
    if (reservation.status !== "pending") return null;
    
    const expiryDate = reservation.extended_until || reservation.expires_at;
    if (!expiryDate) return null;
    
    const now = new Date();
    const expiry = new Date(expiryDate);
    const diff = expiry.getTime() - now.getTime();
    
    if (diff <= 0) return "Expired";
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (days > 0) {
      return `${days}d ${hours}h`;
    } else if (hours > 0) {
      return `${hours}h ${minutes}m`;
    } else {
      return `${minutes}m`;
    }
  };

  // Fetch all reservations (admin can see all)
  const allReservations = useMemo(() => {
    return reservations || [];
  }, [reservations]);

  const filteredReservations = useMemo(() => {
    let filtered = [...allReservations];

    // Filter out expired reservations by default (unless showExpired is true)
    if (!showExpired) {
      filtered = filtered.filter((r) => !isReservationExpired(r));
    }

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
          listing?.subcategory?.toLowerCase().includes(query) ||
          buyer?.email?.toLowerCase().includes(query) ||
          buyer?.full_name?.toLowerCase().includes(query) ||
          r.id.toLowerCase().includes(query)
        );
      });
    }

    // Sort
    if (sortKey === "date_desc") {
      filtered.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    } else if (sortKey === "date_asc") {
      filtered.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
    } else if (sortKey === "price_desc") {
      filtered.sort((a, b) => Number(b.price_per_unit) - Number(a.price_per_unit));
    } else if (sortKey === "price_asc") {
      filtered.sort((a, b) => Number(a.price_per_unit) - Number(b.price_per_unit));
    }

    return filtered;
  }, [allReservations, statusFilter, search, sortKey, showExpired]);

  const stats = useMemo(() => {
    const activeReservations = allReservations.filter((r) => !isReservationExpired(r));
    return {
      total: activeReservations.length,
      pending: activeReservations.filter((r) => r.status === "pending").length,
      confirmed: activeReservations.filter((r) => r.status === "confirmed").length,
      cancelled: activeReservations.filter((r) => r.status === "cancelled").length,
      expired: allReservations.filter((r) => isReservationExpired(r)).length,
      totalValue: activeReservations
        .filter((r) => r.status === "pending" || r.status === "confirmed")
        .reduce((sum, r) => sum + Number(r.price_per_unit) * r.quantity, 0),
    };
  }, [allReservations]);

  const handleViewBuyer = async (buyerId: string) => {
    setSelectedBuyerId(buyerId);
    setLoadingProfile(true);
    setBuyerProfileDialogOpen(true);

    try {
      const profile = await fetchBuyerProfile(buyerId);
      setBuyerProfile(profile);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load buyer profile",
        variant: "destructive",
      });
    } finally {
      setLoadingProfile(false);
    }
  };

  const handleConfirmClick = (reservation: Reservation) => {
    setSelectedReservation(reservation);
    setConfirmationDialogOpen(true);
  };

  const handleConfirm = async (id: string) => {
    try {
      await confirmReservation(id);
      toast({
        title: "Reservation confirmed",
        description: "The reservation has been successfully confirmed.",
      });
      setConfirmationDialogOpen(false);
      setSelectedReservation(null);
      queryClient.invalidateQueries({ queryKey: ["reservations"] });
      queryClient.invalidateQueries({ queryKey: ["my_listings"] });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to confirm reservation",
        variant: "destructive",
      });
    }
  };

  const handleExtendClick = (reservation: Reservation) => {
    setReservationToExtend(reservation);
    setExtendDialogOpen(true);
  };

  const handleExtendSuccess = () => {
    queryClient.invalidateQueries({ queryKey: ["reservations"] });
    setReservationToExtend(null);
    setExtendDialogOpen(false);
  };

  if (isLoading) {
    return (
      <div className="container py-8 px-4">
        <div className="text-center py-12">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto" />
        </div>
      </div>
    );
  }

  return (
    <div className="container py-4 md:py-8 px-4 space-y-4 md:space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
        <div>
          <h1 className="text-2xl md:text-3xl font-display font-semibold">Reservation Management</h1>
          <p className="text-xs md:text-sm text-muted-foreground mt-1">
            Manage all reservations, approve or reject, and view buyer information
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground mt-1">All reservations</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Pending</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-warning">{stats.pending}</div>
            <p className="text-xs text-muted-foreground mt-1">Awaiting approval</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Confirmed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">{stats.confirmed}</div>
            <p className="text-xs text-muted-foreground mt-1">Approved reservations</p>
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
        {stats.expired > 0 && (
          <Card className="border-warning/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Expired</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-warning">{stats.expired}</div>
              <p className="text-xs text-muted-foreground mt-1">Expired reservations</p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by product, buyer email, name, or reservation ID..."
            className="pl-10"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="gap-2">
              Status: {statusFilter === "all" ? "All" : statusFilter.charAt(0).toUpperCase() + statusFilter.slice(1)}
              <ChevronDown className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => setStatusFilter("all")}>All</DropdownMenuItem>
            <DropdownMenuItem onClick={() => setStatusFilter("pending")}>Pending</DropdownMenuItem>
            <DropdownMenuItem onClick={() => setStatusFilter("confirmed")}>Confirmed</DropdownMenuItem>
            <DropdownMenuItem onClick={() => setStatusFilter("cancelled")}>Cancelled</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="gap-2">
              Sort <ChevronDown className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => setSortKey("date_desc")}>Newest First</DropdownMenuItem>
            <DropdownMenuItem onClick={() => setSortKey("date_asc")}>Oldest First</DropdownMenuItem>
            <DropdownMenuItem onClick={() => setSortKey("price_desc")}>Price: High to Low</DropdownMenuItem>
            <DropdownMenuItem onClick={() => setSortKey("price_asc")}>Price: Low to High</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        {stats.expired > 0 && (
          <Button
            variant={showExpired ? "default" : "outline"}
            onClick={() => setShowExpired(!showExpired)}
            className="gap-2"
          >
            {showExpired ? "Hide" : "Show"} Expired ({stats.expired})
          </Button>
        )}
      </div>

      {/* Reservations List */}
      <Tabs defaultValue="list" className="space-y-4">
        <TabsList>
          <TabsTrigger value="list">List View</TabsTrigger>
          <TabsTrigger value="cards">Card View</TabsTrigger>
        </TabsList>

        <TabsContent value="list" className="space-y-2">
          <Card>
            <div className="overflow-x-auto -mx-4 md:mx-0">
              <div className="min-w-full inline-block align-middle">
                <table className="w-full">
                  <thead className="bg-muted/50">
                    <tr>
                      <th className="text-left p-2 md:p-4 text-xs md:text-sm font-medium">ID</th>
                      <th className="text-left p-2 md:p-4 text-xs md:text-sm font-medium">Product</th>
                      <th className="text-left p-2 md:p-4 text-xs md:text-sm font-medium hidden md:table-cell">Buyer</th>
                      <th className="text-left p-2 md:p-4 text-xs md:text-sm font-medium">Qty</th>
                      <th className="text-left p-2 md:p-4 text-xs md:text-sm font-medium">Price</th>
                      <th className="text-left p-2 md:p-4 text-xs md:text-sm font-medium">Status</th>
                      <th className="text-left p-2 md:p-4 text-xs md:text-sm font-medium hidden lg:table-cell">Time</th>
                      <th className="text-left p-2 md:p-4 text-xs md:text-sm font-medium hidden md:table-cell">Date</th>
                      <th className="text-left p-2 md:p-4 text-xs md:text-sm font-medium">Actions</th>
                    </tr>
                  </thead>
                <tbody>
                  {filteredReservations.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="p-8 text-center text-muted-foreground">
                        No reservations found
                      </td>
                    </tr>
                  ) : (
                    filteredReservations.map((reservation) => {
                      const listing = reservation.listing as any;
                      const buyer = reservation.buyer as any;
                      return (
                        <tr key={reservation.id} className="border-b hover:bg-muted/20">
                          <td className="p-2 md:p-4">
                            <code className="text-xs">{reservation.id.slice(0, 6)}...</code>
                          </td>
                          <td className="p-2 md:p-4">
                            <div className="font-medium text-xs md:text-sm">{listing?.product_name || "N/A"}</div>
                            <div className="text-xs text-muted-foreground hidden md:block">
                              {listing?.category} {listing?.subcategory ? `• ${listing.subcategory}` : ""}
                            </div>
                          </td>
                          <td className="p-2 md:p-4 hidden md:table-cell">
                            <div className="font-medium text-xs md:text-sm">{buyer?.full_name || buyer?.email || "N/A"}</div>
                            <div className="text-xs text-muted-foreground">{buyer?.email}</div>
                          </td>
                          <td className="p-2 md:p-4 text-xs md:text-sm">{reservation.quantity}</td>
                          <td className="p-2 md:p-4">
                            <span className="text-xs md:text-sm">
                              {reservation.currency === "EUR" ? "€" : reservation.currency}{" "}
                              {Number(reservation.price_per_unit).toLocaleString(undefined, {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                              })}
                            </span>
                          </td>
                          <td className="p-2 md:p-4">
                            <div className="flex flex-wrap items-start md:items-center gap-1 md:gap-2">
                              <Badge
                                variant={
                                  reservation.status === "confirmed"
                                    ? "default"
                                    : reservation.status === "cancelled"
                                    ? "destructive"
                                    : "secondary"
                                }
                                className="text-xs shrink-0"
                              >
                                {reservation.status}
                              </Badge>
                              {isReservationExpired(reservation) && (
                                <Badge variant="outline" className="border-warning text-warning text-xs shrink-0">
                                  Expired
                                </Badge>
                              )}
                            </div>
                          </td>
                          <td className="p-2 md:p-4 hidden lg:table-cell">
                            {getRemainingTime(reservation) ? (
                              <div className="flex items-center gap-1 md:gap-2">
                                <Clock className="h-3 w-3 md:h-4 md:w-4 text-muted-foreground" />
                                <span className={`text-xs md:text-sm font-medium ${
                                  isReservationExpired(reservation) 
                                    ? "text-warning" 
                                    : getRemainingTime(reservation)?.includes("m") && !getRemainingTime(reservation)?.includes("h")
                                      ? "text-destructive"
                                      : "text-foreground"
                                }`}>
                                  {getRemainingTime(reservation)}
                                </span>
                              </div>
                            ) : (
                              <span className="text-xs md:text-sm text-muted-foreground">—</span>
                            )}
                          </td>
                          <td className="p-2 md:p-4 text-xs md:text-sm text-muted-foreground hidden md:table-cell">
                            {format(new Date(reservation.created_at), "MMM dd, yyyy")}
                          </td>
                          <td className="p-2 md:p-4">
                            <div className="flex flex-col md:flex-row items-stretch md:items-center gap-1 md:gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleViewBuyer(reservation.buyer_user_id)}
                                className="text-xs px-2 md:px-3"
                              >
                                <Eye className="h-3 w-3 md:h-4 md:w-4 md:mr-1" />
                                <span className="hidden md:inline">Buyer</span>
                              </Button>
                              {reservation.status === "pending" && !isReservationExpired(reservation) && (
                                <>
                                  <Button
                                    size="sm"
                                    onClick={() => handleConfirmClick(reservation)}
                                    disabled={isConfirming}
                                    className="text-xs px-2 md:px-3"
                                  >
                                    <CheckCircle2 className="h-3 w-3 md:h-4 md:w-4 md:mr-1" />
                                    <span className="hidden md:inline">Approve</span>
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => handleExtendClick(reservation)}
                                    className="text-xs px-2 md:px-3"
                                  >
                                    <Clock className="h-3 w-3 md:h-4 md:w-4 md:mr-1" />
                                    <span className="hidden md:inline">Extend</span>
                                  </Button>
                                </>
                              )}
                              {isReservationExpired(reservation) && (
                                <Badge variant="outline" className="border-warning text-warning text-xs">
                                  Expired
                                </Badge>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
              </div>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="cards" className="space-y-4">
          {filteredReservations.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center text-muted-foreground">
                No reservations found
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {filteredReservations.map((reservation) => {
                const listing = reservation.listing as any;
                const buyer = reservation.buyer as any;
                return (
                  <Card key={reservation.id} className="relative">
                    <CardContent className="pt-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge
                              variant={
                                reservation.status === "confirmed"
                                  ? "default"
                                  : reservation.status === "cancelled"
                                  ? "destructive"
                                  : "secondary"
                              }
                            >
                              {reservation.status}
                            </Badge>
                            <code className="text-xs text-muted-foreground">
                              {reservation.id.slice(0, 8)}...
                            </code>
                          </div>
                          <h3 className="font-semibold text-lg">{listing?.product_name || "N/A"}</h3>
                          <p className="text-sm text-muted-foreground">
                            {listing?.category} {listing?.subcategory ? `• ${listing.subcategory}` : ""}
                          </p>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-semibold">
                            {reservation.currency === "EUR" ? "€" : reservation.currency}{" "}
                            {Number(reservation.price_per_unit).toLocaleString(undefined, {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            })}
                          </div>
                          <div className="text-sm text-muted-foreground">Qty: {reservation.quantity}</div>
                        </div>
                      </div>

                      <div className="grid md:grid-cols-2 gap-4 mb-4">
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">Buyer</p>
                          <p className="font-medium">{buyer?.full_name || buyer?.email || "N/A"}</p>
                          <p className="text-sm text-muted-foreground">{buyer?.email}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">Date</p>
                          <p className="font-medium">
                            {format(new Date(reservation.created_at), "MMM dd, yyyy 'at' HH:mm")}
                          </p>
                        </div>
                        {getRemainingTime(reservation) && (
                          <div className="md:col-span-2">
                            <p className="text-xs text-muted-foreground mb-1">Remaining Time</p>
                            <div className="flex items-center gap-2">
                              <Clock className="h-4 w-4 text-muted-foreground" />
                              <p className={`font-medium ${
                                isReservationExpired(reservation) 
                                  ? "text-warning" 
                                  : getRemainingTime(reservation)?.includes("m") && !getRemainingTime(reservation)?.includes("h")
                                    ? "text-destructive"
                                    : "text-foreground"
                              }`}>
                                {getRemainingTime(reservation)}
                              </p>
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-2 pt-4 border-t">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleViewBuyer(reservation.buyer_user_id)}
                          className="flex-1"
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          View Buyer Info
                        </Button>
                        {reservation.status === "pending" && !isReservationExpired(reservation) && (
                          <>
                            <Button
                              size="sm"
                              onClick={() => handleConfirmClick(reservation)}
                              disabled={isConfirming}
                              className="flex-1"
                            >
                              <CheckCircle2 className="h-4 w-4 mr-1" />
                              Approve
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleExtendClick(reservation)}
                              className="flex-1"
                            >
                              <Clock className="h-4 w-4 mr-1" />
                              Extend
                            </Button>
                          </>
                        )}
                        {isReservationExpired(reservation) && (
                          <div className="flex-1 text-center">
                            <Badge variant="outline" className="border-warning text-warning">
                              Expired - Cannot Approve
                            </Badge>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Confirmation Dialog */}
      <ConfirmationDialog
        open={confirmationDialogOpen}
        onOpenChange={setConfirmationDialogOpen}
        reservation={selectedReservation}
        onConfirm={handleConfirm}
        isConfirming={isConfirming}
      />

      {/* Extend Reservation Dialog */}
      <ExtendReservationDialog
        open={extendDialogOpen}
        onOpenChange={setExtendDialogOpen}
        reservationId={reservationToExtend?.id || ""}
        currentExpiry={reservationToExtend?.extended_until || reservationToExtend?.expires_at || null}
        onSuccess={handleExtendSuccess}
      />

      {/* Buyer Profile Dialog */}
      <Dialog open={buyerProfileDialogOpen} onOpenChange={setBuyerProfileDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Buyer Profile Information
            </DialogTitle>
            <DialogDescription>Complete buyer profile and company details</DialogDescription>
          </DialogHeader>

          {loadingProfile ? (
            <div className="py-12 text-center">
              <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto" />
            </div>
          ) : buyerProfile ? (
            <div className="space-y-6">
              {/* Personal Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Personal Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Full Name</p>
                      <p className="font-medium">{buyerProfile.full_name || "N/A"}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Email</p>
                      <p className="font-medium flex items-center gap-2">
                        <Mail className="h-4 w-4" />
                        {buyerProfile.email}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Primary Phone</p>
                      <p className="font-medium flex items-center gap-2">
                        <Phone className="h-4 w-4" />
                        {buyerProfile.primary_phone || buyerProfile.phone || "N/A"}
                      </p>
                    </div>
                    {buyerProfile.secondary_phone && (
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">Secondary Phone</p>
                        <p className="font-medium flex items-center gap-2">
                          <Phone className="h-4 w-4" />
                          {buyerProfile.secondary_phone}
                        </p>
                      </div>
                    )}
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Position</p>
                      <p className="font-medium">{buyerProfile.position || "N/A"}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Preferred Contact</p>
                      <p className="font-medium">{buyerProfile.preferred_contact || "N/A"}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Company Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Building2 className="h-5 w-5" />
                    Company Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Company Name</p>
                      <p className="font-medium">{buyerProfile.company_name || "N/A"}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Registration Number</p>
                      <p className="font-medium">{buyerProfile.registration_number || "N/A"}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">VAT Number</p>
                      <p className="font-medium">{buyerProfile.vat_number || "N/A"}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Director Name</p>
                      <p className="font-medium">{buyerProfile.director_name || "N/A"}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Address Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <MapPin className="h-5 w-5" />
                    Address Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                      <p className="text-sm text-muted-foreground mb-1">Address Line 1</p>
                      <p className="font-medium">{buyerProfile.address_line1 || "N/A"}</p>
                    </div>
                    {buyerProfile.address_line2 && (
                      <div className="md:col-span-2">
                        <p className="text-sm text-muted-foreground mb-1">Address Line 2</p>
                        <p className="font-medium">{buyerProfile.address_line2}</p>
                      </div>
                    )}
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">City</p>
                      <p className="font-medium">{buyerProfile.city || "N/A"}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">ZIP Code</p>
                      <p className="font-medium">{buyerProfile.zip_code || "N/A"}</p>
                    </div>
                    <div className="md:col-span-2">
                      <p className="text-sm text-muted-foreground mb-1">Country</p>
                      <p className="font-medium">{buyerProfile.country || "N/A"}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Account Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Account Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Role</p>
                      <Badge>{buyerProfile.role || "N/A"}</Badge>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Verification Status</p>
                      <Badge
                        variant={
                          buyerProfile.verification_status === "verified" ? "default" : "secondary"
                        }
                      >
                        {buyerProfile.verification_status || "Pending"}
                      </Badge>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Account Created</p>
                      <p className="font-medium flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        {buyerProfile.created_at
                          ? format(new Date(buyerProfile.created_at), "MMM dd, yyyy 'at' HH:mm")
                          : "N/A"}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">User ID</p>
                      <code className="text-xs">{buyerProfile.id}</code>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            <div className="py-12 text-center text-muted-foreground">
              Failed to load buyer profile
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

