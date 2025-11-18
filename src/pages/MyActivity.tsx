import { useState, useMemo } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toTitleCase } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Search, ChevronDown } from "lucide-react";
import { Link } from "react-router-dom";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useReservations } from "@/hooks/useReservations";
import { useCart } from "@/hooks/useCart";

interface ActivityItem {
  id: string;
  type: "buy";
  activity: "Reserved" | "In Cart";
  product_name: string;
  category: string;
  subcategory?: string;
  warehouse?: string;
  updateDate: string;
  quantity: number;
  totalPrice: number;
  status: string;
  listing_id: string;
  image_urls?: string[];
}

export default function MyActivity() {
  const { reservations, isLoading: reservationsLoading } = useReservations();
  const { cartItems, isLoading: cartLoading } = useCart();
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState<string>("date_desc");
  const [typeFilter, setTypeFilter] = useState<"all" | "reservations" | "cart">("all");

  const isLoading = reservationsLoading || cartLoading;

  const activities: ActivityItem[] = useMemo(() => {
    const items: ActivityItem[] = [];

    // Add reservations
    reservations.forEach((reservation) => {
      const listing = reservation.listing as any;
      items.push({
        id: reservation.id,
        type: "buy",
        activity: "Reserved",
        product_name: listing?.product_name || "Product",
        category: listing?.category || "—",
        subcategory: listing?.subcategory,
        warehouse: "—", // Can be added if warehouse info is available
        updateDate: new Date(reservation.created_at).toLocaleDateString("en-GB", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
        }),
        quantity: reservation.quantity,
        totalPrice: Number(reservation.price_per_unit) * reservation.quantity,
        status: reservation.status === "pending" ? "Reserved" : reservation.status,
        listing_id: reservation.listing_id,
        image_urls: listing?.image_urls,
      });
    });

    // Add cart items
    cartItems.forEach((cartItem) => {
      const listing = cartItem.listing as any;
      items.push({
        id: cartItem.id,
        type: "buy",
        activity: "In Cart",
        product_name: listing?.product_name || "Product",
        category: listing?.category || "—",
        subcategory: listing?.subcategory,
        warehouse: "—",
        updateDate: new Date(cartItem.created_at).toLocaleDateString("en-GB", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
        }),
        quantity: cartItem.quantity,
        totalPrice: Number(cartItem.price_per_unit) * cartItem.quantity, // Platform fee calculated separately
        status: "In Cart",
        listing_id: cartItem.listing_id,
        image_urls: listing?.image_urls,
      });
    });

    return items;
  }, [reservations, cartItems]);

  const filteredActivities = useMemo(() => {
    let filtered = [...activities];

    // Filter by type
    if (typeFilter === "reservations") {
      filtered = filtered.filter((a) => a.activity === "Reserved");
    } else if (typeFilter === "cart") {
      filtered = filtered.filter((a) => a.activity === "In Cart");
    }

    // Filter by search
    if (search) {
      const query = search.toLowerCase();
      filtered = filtered.filter(
        (a) =>
          a.product_name.toLowerCase().includes(query) ||
          a.category.toLowerCase().includes(query) ||
          a.subcategory?.toLowerCase().includes(query)
      );
    }

    // Sort
    if (sortKey === "date_desc") {
      filtered.sort((a, b) => new Date(b.updateDate).getTime() - new Date(a.updateDate).getTime());
    } else if (sortKey === "date_asc") {
      filtered.sort((a, b) => new Date(a.updateDate).getTime() - new Date(b.updateDate).getTime());
    } else if (sortKey === "price_asc") {
      filtered.sort((a, b) => a.totalPrice - b.totalPrice);
    } else if (sortKey === "price_desc") {
      filtered.sort((a, b) => b.totalPrice - a.totalPrice);
    } else if (sortKey === "name_asc") {
      filtered.sort((a, b) => a.product_name.localeCompare(b.product_name));
    } else if (sortKey === "name_desc") {
      filtered.sort((a, b) => b.product_name.localeCompare(a.product_name));
    }

    return filtered;
  }, [activities, search, sortKey, typeFilter]);

  const activeActivities = useMemo(() => {
    return filteredActivities.filter((a) => a.status === "Reserved" || a.status === "In Cart" || a.status === "pending");
  }, [filteredActivities]);

  const historyActivities = useMemo(() => {
    return filteredActivities.filter((a) => a.status === "confirmed" || a.status === "cancelled" || a.status === "completed");
  }, [filteredActivities]);

  if (isLoading) {
    return (
      <div className="container py-4 md:py-8 px-4">
        <div className="text-center py-12">
          <p className="text-muted-foreground">Loading activities...</p>
        </div>
      </div>
    );
  }

  const ActivityRow = ({ activity }: { activity: ActivityItem }) => {
    const imageUrl = Array.isArray(activity.image_urls) && activity.image_urls.length > 0
      ? activity.image_urls[0]
      : null;

    return (
      <div className="grid md:grid-cols-[auto,2fr,1fr,1fr,1fr,1fr,1fr,1fr,auto] grid-cols-1 gap-3 md:gap-4 p-4 border-b last:border-b-0 hover:bg-muted/50 transition-colors">
        <div className="flex items-center">
          <Badge
            className={
              activity.status === "Reserved" || activity.status === "pending"
                ? "bg-primary/20 text-primary border-primary/30"
                : activity.status === "In Cart"
                ? "bg-success/20 text-success border-success/30"
                : activity.status === "confirmed"
                ? "bg-success/20 text-success border-success/30"
                : "bg-destructive/20 text-destructive border-destructive/30"
            }
          >
            <span className="w-2 h-2 rounded-full bg-primary mr-2"></span>
            {activity.type === "buy" ? "Buy" : "Sell"}
          </Badge>
        </div>

        <div className="flex items-center gap-3 min-w-0">
          {imageUrl && (
            <img
              src={imageUrl}
              alt={activity.product_name}
              className="h-12 w-12 rounded-lg border border-border object-cover shrink-0"
            />
          )}
          <Link to={`/product/${activity.listing_id}`} className="min-w-0 flex-1">
            <p className="font-medium text-sm text-primary hover:underline truncate">
              {activity.product_name}
            </p>
            {activity.subcategory && (
              <p className="text-xs text-muted-foreground truncate">{toTitleCase(activity.subcategory)}</p>
            )}
          </Link>
        </div>

        <div className="hidden md:flex items-center text-sm">{activity.category}</div>
        <div className="hidden md:flex items-center text-sm">{activity.subcategory ? toTitleCase(activity.subcategory) : "—"}</div>
        <div className="hidden md:flex items-center text-sm">{activity.warehouse}</div>
        <div className="hidden md:flex items-center text-sm">{activity.updateDate}</div>
        <div className="hidden md:flex items-center text-sm">{activity.quantity}</div>

        <div className="flex flex-col justify-center">
          <p className="font-semibold text-sm">
            €{activity.totalPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
          <p className="text-xs text-muted-foreground">
            Total: €{activity.totalPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
        </div>

        <div className="flex items-center md:justify-end">
          <Badge
            className={
              activity.status === "Reserved" || activity.status === "pending"
                ? "bg-warning/20 text-warning border-warning/30"
                : activity.status === "In Cart"
                ? "bg-success/20 text-success border-success/30"
                : activity.status === "confirmed"
                ? "bg-success/20 text-success border-success/30"
                : "bg-destructive/20 text-destructive border-destructive/30"
            }
          >
            {activity.status}
          </Badge>
        </div>
        {/* Mobile-only compact meta row */}
        <div className="flex md:hidden items-center justify-between text-xs text-muted-foreground">
          <div>{activity.updateDate}</div>
          <div>Qty: {activity.quantity}</div>
        </div>
      </div>
    );
  };

  return (
    <div className="container py-4 md:py-8 px-4">
      <div className="flex items-center justify-between mb-4 md:mb-8">
        <h1 className="text-2xl sm:text-3xl font-display font-semibold">Activity Feed</h1>
      </div>

      <Tabs defaultValue="active" className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="active">Active Deals</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="space-y-4">
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
            <p className="text-sm text-muted-foreground">
              {activeActivities.length} item{activeActivities.length !== 1 ? "s" : ""}
            </p>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search for product, category, subcategory"
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
                  <DropdownMenuItem onClick={() => setSortKey("date_desc")}>Date: Newest</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setSortKey("date_asc")}>Date: Oldest</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setSortKey("price_asc")}>Price: Low to High</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setSortKey("price_desc")}>Price: High to Low</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setSortKey("name_asc")}>Name: A-Z</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setSortKey("name_desc")}>Name: Z-A</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="gap-2 w-full sm:w-auto">
                    <ChevronDown className="h-4 w-4" /> <span className="hidden sm:inline">Filter by</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => setTypeFilter("all")}>All</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setTypeFilter("reservations")}>Reservations</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setTypeFilter("cart")}>Cart Items</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {activeActivities.length === 0 ? (
            <div className="rounded-lg border bg-card p-12 text-center">
              <p className="text-muted-foreground">No active activities</p>
            </div>
          ) : (
            <div className="rounded-lg border bg-card overflow-hidden">
              <div className="hidden md:grid grid-cols-[auto,2fr,1fr,1fr,1fr,1fr,1fr,1fr,auto] gap-4 p-4 border-b bg-muted/50 font-medium text-sm">
                <div>Activity</div>
                <div>Product</div>
                <div>Category</div>
                <div>Sub Category</div>
                <div>Warehouse</div>
                <div>Update Date</div>
                <div>Quantity</div>
                <div>Total Price</div>
                <div>Status</div>
              </div>

              {activeActivities.map((activity) => (
                <ActivityRow key={activity.id} activity={activity} />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="history">
          {historyActivities.length === 0 ? (
            <div className="text-center py-12 rounded-lg border bg-card">
              <p className="text-muted-foreground">No historical activities yet</p>
            </div>
          ) : (
            <div className="rounded-lg border bg-card overflow-hidden">
              <div className="hidden md:grid grid-cols-[auto,2fr,1fr,1fr,1fr,1fr,1fr,1fr,auto] gap-4 p-4 border-b bg-muted/50 font-medium text-sm">
                <div>Activity</div>
                <div>Product</div>
                <div>Category</div>
                <div>Sub Category</div>
                <div>Warehouse</div>
                <div>Update Date</div>
                <div>Quantity</div>
                <div>Total Price</div>
                <div>Status</div>
              </div>

              {historyActivities.map((activity) => (
                <ActivityRow key={activity.id} activity={activity} />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
