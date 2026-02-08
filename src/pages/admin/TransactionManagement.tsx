import { useState, useMemo, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Mail, Phone, User, Building2, Package, Search, ChevronDown, Eye, X, Clock } from "lucide-react";
import { Link } from "react-router-dom";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { ExtendReservationDialog } from "@/components/reservations/ExtendReservationDialog";

async function fetchTransactions(status?: string) {
  let query = supabase
    .from("transaction_overview")
    .select("*")
    .order("reserved_at", { ascending: false });

  if (status && status !== "all") {
    query = query.eq("reservation_status", status);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data || [];
}

export default function TransactionManagement() {
  const { toast } = useToast();
  const [statusFilter, setStatusFilter] = useState<"all" | "pending" | "confirmed" | "cancelled">("all");
  const [search, setSearch] = useState("");
  const [selectedTransaction, setSelectedTransaction] = useState<any | null>(null);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [relatedOrder, setRelatedOrder] = useState<any | null>(null);
  const [loadingOrder, setLoadingOrder] = useState(false);
  const [extendDialogOpen, setExtendDialogOpen] = useState(false);
  const [reservationToExtend, setReservationToExtend] = useState<any | null>(null);
  const queryClient = useQueryClient();

  const { data: transactions, isLoading } = useQuery({
    queryKey: ["admin_transactions", statusFilter],
    queryFn: () => fetchTransactions(statusFilter),
    staleTime: 30_000,
  });

  const filteredTransactions = useMemo(() => {
    if (!transactions) return [];
    let filtered = [...transactions];

    if (search) {
      const query = search.toLowerCase();
      filtered = filtered.filter((t: any) => {
        return (
          t.buyer_name?.toLowerCase().includes(query) ||
          t.buyer_email?.toLowerCase().includes(query) ||
          t.seller_name?.toLowerCase().includes(query) ||
          t.seller_email?.toLowerCase().includes(query) ||
          t.product_name?.toLowerCase().includes(query) ||
          t.buyer_company?.toLowerCase().includes(query) ||
          t.seller_company?.toLowerCase().includes(query)
        );
      });
    }

    return filtered;
  }, [transactions, search]);

  const analytics = useMemo(() => {
    if (!transactions) return { active: 0, totalValue: 0, avgValue: 0, pending: 0 };
    
    const active = transactions.filter((t: any) => t.reservation_status === "pending").length;
    const totalValue = transactions
      .filter((t: any) => t.reservation_status === "pending")
      .reduce((sum: number, t: any) => sum + (Number(t.quantity) * Number(t.price_per_unit)), 0);
    const avgValue = active > 0 ? totalValue / active : 0;
    const pending = transactions.filter((t: any) => t.reservation_status === "pending").length;

    return { active, totalValue, avgValue, pending };
  }, [transactions]);

  const statusCounts = useMemo(() => {
    if (!transactions) return { all: 0, pending: 0, confirmed: 0, cancelled: 0 };
    const counts = { all: transactions.length, pending: 0, confirmed: 0, cancelled: 0 };
    transactions.forEach((t: any) => {
      if (t.reservation_status === "pending") counts.pending++;
      else if (t.reservation_status === "confirmed") counts.confirmed++;
      else if (t.reservation_status === "cancelled") counts.cancelled++;
    });
    return counts;
  }, [transactions]);

  const handleViewDetails = (transaction: any) => {
    setSelectedTransaction(transaction);
    setDetailDialogOpen(true);
    (async () => {
      setLoadingOrder(true);
      setRelatedOrder(null);
      try {
        if (transaction?.reservation_id) {
          const { data } = await supabase
            .from('orders')
            .select('*')
            .eq('reservation_id', transaction.reservation_id)
            .maybeSingle();
          if (data) setRelatedOrder(data);
        }
      } finally {
        setLoadingOrder(false);
      }
    })();
  };

  if (isLoading) {
    return (
      <div className="container py-4 md:py-8 px-4">
        <div className="text-center py-12">
          <p className="text-muted-foreground">Loading transactions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-4 md:py-8 px-4 space-y-4 md:space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h1 className="text-xl sm:text-2xl md:text-3xl font-display font-semibold">Transaction Management</h1>
      </div>

      {/* Analytics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
        <Card className="p-4">
          <div className="text-sm text-muted-foreground mb-1">Active Reservations</div>
          <div className="text-2xl font-bold text-primary">{analytics.active}</div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-muted-foreground mb-1">Total Value Reserved</div>
          <div className="text-2xl font-bold text-primary">
            €{analytics.totalValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-muted-foreground mb-1">Average Value</div>
          <div className="text-2xl font-bold text-primary">
            €{analytics.avgValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-muted-foreground mb-1">Pending</div>
          <div className="text-2xl font-bold text-warning">{analytics.pending}</div>
        </Card>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by buyer, seller, product..."
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
            <DropdownMenuItem>Newest First</DropdownMenuItem>
            <DropdownMenuItem>Oldest First</DropdownMenuItem>
            <DropdownMenuItem>Price: High to Low</DropdownMenuItem>
            <DropdownMenuItem>Price: Low to High</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Tabs */}
      <Tabs value={statusFilter} onValueChange={(v) => setStatusFilter(v as any)}>
        <div className="overflow-x-auto -mx-4 px-4 md:mx-0 md:px-0">
          <TabsList className="w-max md:w-full">
            <TabsTrigger value="all" className="whitespace-nowrap">All ({statusCounts.all})</TabsTrigger>
            <TabsTrigger value="pending" className="whitespace-nowrap">Pending ({statusCounts.pending})</TabsTrigger>
            <TabsTrigger value="confirmed" className="whitespace-nowrap">Confirmed ({statusCounts.confirmed})</TabsTrigger>
            <TabsTrigger value="cancelled" className="whitespace-nowrap">Cancelled ({statusCounts.cancelled})</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value={statusFilter} className="mt-4">
          {filteredTransactions.length === 0 ? (
            <div className="text-center py-12 rounded-lg border bg-card">
              <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No transactions found</p>
            </div>
          ) : (
            <div className="rounded-xl border bg-card overflow-hidden glass-card">
              <div className="hidden md:grid grid-cols-[2fr,2fr,1.5fr,1fr,1fr,1fr,auto] gap-4 p-4 border-b bg-muted/40 font-medium text-sm">
                <div>Buyer</div>
                <div>Product</div>
                <div>Seller</div>
                <div>Quantity</div>
                <div>Price</div>
                <div>Status</div>
                <div>Actions</div>
              </div>

              {filteredTransactions.map((transaction: any) => {
                const symbol = transaction.currency === "EUR" ? "€" : transaction.currency;
                const totalPrice = Number(transaction.quantity) * Number(transaction.price_per_unit);

                const currencySymbol = transaction.currency === "EUR" ? "€" : transaction.currency || "€";
                
                return (
                  <div
                    key={transaction.reservation_id}
                    className="grid md:grid-cols-[2fr,2fr,1.5fr,1fr,1fr,1fr,auto] grid-cols-1 gap-4 p-4 border-b last:border-b-0 hover:bg-muted/20 transition-colors cursor-pointer"
                    onClick={() => handleViewDetails(transaction)}
                  >
                    <div className="min-w-0">
                      <div className="text-xs text-muted-foreground md:hidden mb-1">Buyer</div>
                      <div className="font-medium truncate">{transaction.buyer_name || "—"}</div>
                      <div className="text-xs text-muted-foreground truncate">{transaction.buyer_email || "—"}</div>
                      {transaction.buyer_company && (
                        <div className="text-xs text-muted-foreground truncate">{transaction.buyer_company}</div>
                      )}
                    </div>

                    <div className="min-w-0">
                      <div className="text-xs text-muted-foreground md:hidden mb-1">Product</div>
                      <div className="font-medium truncate">{transaction.product_name || "—"}</div>
                      <div className="text-xs text-muted-foreground truncate">
                        {transaction.category}
                        {transaction.subcategory && ` • ${transaction.subcategory}`}
                      </div>
                    </div>

                    <div className="min-w-0">
                      <div className="text-xs text-muted-foreground md:hidden mb-1">Seller</div>
                      <div className="font-medium truncate">{transaction.seller_name || "—"}</div>
                      <div className="text-xs text-muted-foreground truncate">{transaction.seller_email || "—"}</div>
                      {transaction.seller_company && (
                        <div className="text-xs text-muted-foreground truncate">{transaction.seller_company}</div>
                      )}
                    </div>

                    <div>
                      <div className="text-xs text-muted-foreground md:hidden mb-1">Quantity</div>
                      <div className="text-sm">{transaction.quantity}</div>
                    </div>

                    <div>
                      <div className="text-xs text-muted-foreground md:hidden mb-1">Price</div>
                      <div className="text-sm font-semibold">
                        {currencySymbol} {totalPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </div>
                    </div>

                    <div>
                      <div className="text-xs text-muted-foreground md:hidden mb-1">Status</div>
                      <Badge
                        className={
                          transaction.reservation_status === "pending"
                            ? "bg-warning/20 text-warning border-warning/30"
                            : transaction.reservation_status === "confirmed"
                            ? "bg-success/20 text-success border-success/30"
                            : "bg-destructive/20 text-destructive border-destructive/30"
                        }
                      >
                        {transaction.reservation_status}
                      </Badge>
                    </div>

                    <div onClick={(e) => e.stopPropagation()} className="flex md:justify-end">
                      <Button size="sm" variant="outline" className="w-full md:w-auto" onClick={() => handleViewDetails(transaction)}>
                        <Eye className="h-4 w-4" /> <span className="ml-2 md:hidden">View Details</span>
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Detail Dialog */}
      <Dialog open={detailDialogOpen} onOpenChange={setDetailDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto scrollbar-thin">
          <DialogHeader>
            <DialogTitle>Transaction Details</DialogTitle>
          </DialogHeader>

          {selectedTransaction && (
            <div className="space-y-6 py-4">
              {/* Product Section */}
              <Card className="p-4">
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <Package className="h-4 w-4 text-primary" />
                  Product
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  {Array.isArray(selectedTransaction.image_urls) && selectedTransaction.image_urls.length > 0 && (
                    <div>
                      <img
                        src={selectedTransaction.image_urls[0]}
                        alt={selectedTransaction.product_name}
                        className="h-32 w-32 rounded-lg border border-border object-cover"
                      />
                    </div>
                  )}
                  <div className="space-y-2">
                    <div>
                      <span className="text-sm text-muted-foreground">Name:</span>
                      <div className="font-medium">{selectedTransaction.product_name}</div>
                    </div>
                    <div>
                      <span className="text-sm text-muted-foreground">Category:</span>
                      <div>{selectedTransaction.category} {selectedTransaction.subcategory && `• ${selectedTransaction.subcategory}`}</div>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Buyer Section */}
              <Card className="p-4">
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <User className="h-4 w-4 text-primary" />
                  Buyer
                </h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Name:</span>
                    <div className="font-medium">{selectedTransaction.buyer_name || "—"}</div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Email:</span>
                    <div className="flex items-center gap-2">
                      <span>{selectedTransaction.buyer_email || "—"}</span>
                      {selectedTransaction.buyer_email && (
                        <a href={`mailto:${selectedTransaction.buyer_email}`} className="text-primary hover:underline">
                          <Mail className="h-4 w-4" />
                        </a>
                      )}
                    </div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Phone:</span>
                    <div className="flex items-center gap-2">
                      <span>{selectedTransaction.buyer_phone || "—"}</span>
                      {selectedTransaction.buyer_phone && (
                        <a href={`tel:${selectedTransaction.buyer_phone}`} className="text-primary hover:underline">
                          <Phone className="h-4 w-4" />
                        </a>
                      )}
                    </div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Company:</span>
                    <div className="font-medium">{selectedTransaction.buyer_company || "—"}</div>
                  </div>
                  {selectedTransaction.buyer_country && (
                    <div>
                      <span className="text-muted-foreground">Country:</span>
                      <div>{selectedTransaction.buyer_country}</div>
                    </div>
                  )}
                </div>
              </Card>

              {/* Seller Section */}
              <Card className="p-4">
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <Building2 className="h-4 w-4 text-primary" />
                  Seller
                </h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Name:</span>
                    <div className="font-medium">{selectedTransaction.seller_name || "—"}</div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Email:</span>
                    <div className="flex items-center gap-2">
                      <span>{selectedTransaction.seller_email || "—"}</span>
                      {selectedTransaction.seller_email && (
                        <a href={`mailto:${selectedTransaction.seller_email}`} className="text-primary hover:underline">
                          <Mail className="h-4 w-4" />
                        </a>
                      )}
                    </div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Phone:</span>
                    <div className="flex items-center gap-2">
                      <span>{selectedTransaction.seller_phone || "—"}</span>
                      {selectedTransaction.seller_phone && (
                        <a href={`tel:${selectedTransaction.seller_phone}`} className="text-primary hover:underline">
                          <Phone className="h-4 w-4" />
                        </a>
                      )}
                    </div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Company:</span>
                    <div className="font-medium">{selectedTransaction.seller_company || "—"}</div>
                  </div>
                  {selectedTransaction.seller_country && (
                    <div>
                      <span className="text-muted-foreground">Country:</span>
                      <div>{selectedTransaction.seller_country}</div>
                    </div>
                  )}
                </div>
              </Card>

              {/* Reservation Details */}
              <Card className="p-4">
                <h3 className="font-semibold mb-3">Reservation Details</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Quantity:</span>
                    <div className="font-medium">{selectedTransaction.quantity} cases</div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Price per Unit:</span>
                    <div className="font-medium">
                      {(selectedTransaction.currency === "EUR" ? "€" : selectedTransaction.currency)} {Number(selectedTransaction.price_per_unit).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Total:</span>
                    <div className="font-bold text-primary text-lg">
                      {(selectedTransaction.currency === "EUR" ? "€" : selectedTransaction.currency)} {(Number(selectedTransaction.quantity) * Number(selectedTransaction.price_per_unit)).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Status:</span>
                    <div>
                      <Badge
                        className={
                          selectedTransaction.reservation_status === "pending"
                            ? "bg-warning/20 text-warning border-warning/30"
                            : selectedTransaction.reservation_status === "confirmed"
                            ? "bg-success/20 text-success border-success/30"
                            : "bg-destructive/20 text-destructive border-destructive/30"
                        }
                      >
                        {selectedTransaction.reservation_status}
                      </Badge>
                    </div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Reserved:</span>
                    <div>{new Date(selectedTransaction.reserved_at).toLocaleString()}</div>
                  </div>
                  {selectedTransaction.expires_at && (
                    <div>
                      <span className="text-muted-foreground">Expires:</span>
                      <div>{new Date(selectedTransaction.expires_at).toLocaleString()}</div>
                    </div>
                  )}
                  {selectedTransaction.extended_until && (
                    <div>
                      <span className="text-muted-foreground">Extended Until:</span>
                      <div className="flex items-center gap-2">
                        <Badge className="bg-primary/20 text-primary border-primary/30">Extended</Badge>
                        <span>{new Date(selectedTransaction.extended_until).toLocaleString()}</span>
                      </div>
                      {selectedTransaction.extension_reason && (
                        <div className="text-xs text-muted-foreground mt-1">Reason: {selectedTransaction.extension_reason}</div>
                      )}
                    </div>
                  )}
                  {selectedTransaction.reservation_notes && (
                    <div>
                      <span className="text-muted-foreground">Notes:</span>
                      <div>{selectedTransaction.reservation_notes}</div>
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-2 mt-4 pt-4 border-t">
                  {selectedTransaction.reservation_status === "pending" && selectedTransaction.reservation_id && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={(e) => {
                        e.stopPropagation();
                        setReservationToExtend({
                          id: selectedTransaction.reservation_id,
                          extended_until: selectedTransaction.extended_until,
                          expires_at: selectedTransaction.expires_at,
                        });
                        setExtendDialogOpen(true);
                      }}
                      className="gap-2"
                    >
                      <Clock className="h-4 w-4" />
                      Extend Reservation
                    </Button>
                  )}
                </div>
                <div className="text-xs text-muted-foreground mt-2">Payment is securely handled by CIGATY Escrow.</div>
              </Card>

              {/* Escrow / Order Controls */}
              <Card className="p-4">
                <h3 className="font-semibold mb-3">Escrow & Order</h3>
                {loadingOrder ? (
                  <div className="text-sm text-muted-foreground">Loading order…</div>
                ) : relatedOrder ? (
                  <div className="space-y-3 text-sm">
                    <div className="flex items-center gap-2"><span className="text-muted-foreground">Order:</span><span className="font-mono text-xs">{relatedOrder.id}</span></div>
                    <div className="flex items-center gap-2"><span className="text-muted-foreground">Status:</span><Badge>{relatedOrder.status}</Badge></div>
                    <div className="flex flex-wrap gap-2 pt-2">
                      <Button 
                        size="sm" 
                        variant="outline" 
                        disabled={relatedOrder.status === 'paid_in_escrow' || relatedOrder.status === 'dispatched' || relatedOrder.status === 'delivered' || relatedOrder.status === 'released'}
                        onClick={async () => {
                          try {
                            const { error } = await supabase.rpc('allocate_on_paid', { _order_id: relatedOrder.id });
                            if (error) throw error;
                            const { data } = await supabase.from('orders').select('*').eq('id', relatedOrder.id).single();
                            setRelatedOrder(data);
                            toast({ title: 'Order marked as paid', description: 'Stock has been allocated and funds are held in escrow.' });
                          } catch (e: any) {
                            toast({ title: 'Failed to mark as paid', description: e.message || 'Please try again.', variant: 'destructive' });
                          }
                        }}
                      >
                        Mark Paid (Mock)
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        disabled={relatedOrder.status !== 'paid_in_escrow'}
                        onClick={async () => {
                          try {
                            const { error } = await supabase.rpc('mark_dispatched', { _order_id: relatedOrder.id, _carrier: 'Manual', _tracking: 'N/A' });
                            if (error) throw error;
                            const { data } = await supabase.from('orders').select('*').eq('id', relatedOrder.id).single();
                            setRelatedOrder(data);
                            toast({ title: 'Order marked as dispatched' });
                          } catch (e: any) {
                            toast({ title: 'Failed to mark as dispatched', description: e.message || 'Please try again.', variant: 'destructive' });
                          }
                        }}
                      >
                        Mark Dispatched
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        disabled={relatedOrder.status !== 'dispatched'}
                        onClick={async () => {
                          try {
                            const { error } = await supabase.rpc('mark_delivered', { _order_id: relatedOrder.id });
                            if (error) throw error;
                            const { data } = await supabase.from('orders').select('*').eq('id', relatedOrder.id).single();
                            setRelatedOrder(data);
                            toast({ title: 'Order marked as delivered' });
                          } catch (e: any) {
                            toast({ title: 'Failed to mark as delivered', description: e.message || 'Please try again.', variant: 'destructive' });
                          }
                        }}
                      >
                        Mark Delivered
                      </Button>
                      <Button 
                        size="sm"
                        disabled={relatedOrder.status !== 'delivered'}
                        onClick={async () => {
                          if (!confirm('Release funds to seller? This action is final.')) return;
                          try {
                            const { error } = await supabase.rpc('release_order', { _order_id: relatedOrder.id });
                            if (error) throw error;
                            const { data } = await supabase.from('orders').select('*').eq('id', relatedOrder.id).single();
                            setRelatedOrder(data);
                            toast({ title: 'Funds released to seller' });
                          } catch (e: any) {
                            toast({ title: 'Failed to release funds', description: e.message || 'Please try again.', variant: 'destructive' });
                          }
                        }}
                      >
                        Release to Seller (Mock)
                      </Button>
                      <Button 
                        size="sm" 
                        variant="destructive"
                        disabled={relatedOrder.status === 'released' || relatedOrder.status === 'refunded'}
                        onClick={async () => {
                          if (!confirm('Refund this order? Stock will be restored. This action cannot be undone.')) return;
                          try {
                            const { error } = await supabase.rpc('restore_on_refund', { _order_id: relatedOrder.id });
                            if (error) throw error;
                            const { data } = await supabase.from('orders').select('*').eq('id', relatedOrder.id).single();
                            setRelatedOrder(data);
                            toast({ title: 'Order refunded', description: 'Stock has been restored.' });
                          } catch (e: any) {
                            toast({ title: 'Failed to refund', description: e.message || 'Please try again.', variant: 'destructive' });
                          }
                        }}
                      >
                        Refund (Mock)
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="text-sm text-muted-foreground">No order found for this reservation yet.</div>
                )}
              </Card>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setDetailDialogOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Extension Dialog */}
      {reservationToExtend && (
        <ExtendReservationDialog
          open={extendDialogOpen}
          onOpenChange={setExtendDialogOpen}
          reservationId={reservationToExtend.id}
          currentExpiry={reservationToExtend.extended_until || reservationToExtend.expires_at || null}
          onSuccess={() => {
            queryClient.invalidateQueries({ queryKey: ["admin_transactions"] });
            setReservationToExtend(null);
            // Refresh the selected transaction
            if (selectedTransaction?.reservation_id) {
              fetchTransactions(statusFilter).then((data) => {
                const updated = data?.find((t: any) => t.reservation_id === selectedTransaction.reservation_id);
                if (updated) setSelectedTransaction(updated);
              });
            }
          }}
        />
      )}
    </div>
  );
}

