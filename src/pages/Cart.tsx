import { useState, useMemo } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useCart } from "@/hooks/useCart";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { CartItemRow } from "@/components/cart/CartItemRow";
import { Search, ChevronDown, SlidersHorizontal, ShoppingCart } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useReservations } from "@/hooks/useReservations";
import { motion, AnimatePresence } from "framer-motion";
import { fadeInUp, staggerContainer, hoverScale, tapScale, springTransition, listItem } from "@/lib/animations";
import { supabase } from "@/integrations/supabase/client";

export default function Cart() {
  const { cartItems, isLoading, updateCartItemAsync, removeCartItemAsync } = useCart();
  const { toast } = useToast();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState<string>("date_desc");
  const [selectedItems, setSelectedItems] = useState<Record<string, boolean>>({});
  const [selectAll, setSelectAll] = useState(false);
  const { createReservation, isCreating } = useReservations();
  const [isReservingAll, setIsReservingAll] = useState(false);

  const filteredItems = useMemo(() => {
    let filtered = [...cartItems];
    
    if (search) {
      const query = search.toLowerCase();
      filtered = filtered.filter((item: any) => {
        const listing = item.listing;
        return (
          listing?.product_name?.toLowerCase().includes(query) ||
          listing?.category?.toLowerCase().includes(query) ||
          listing?.subcategory?.toLowerCase().includes(query)
        );
      });
    }

    if (sortKey === "date_desc") {
      filtered.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    } else if (sortKey === "date_asc") {
      filtered.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
    } else if (sortKey === "price_asc") {
      filtered.sort((a, b) => Number(a.price_per_unit) - Number(b.price_per_unit));
    } else if (sortKey === "price_desc") {
      filtered.sort((a, b) => Number(b.price_per_unit) - Number(a.price_per_unit));
    } else if (sortKey === "name_asc") {
      filtered.sort((a, b) => {
        const nameA = (a.listing as any)?.product_name?.toLowerCase() || "";
        const nameB = (b.listing as any)?.product_name?.toLowerCase() || "";
        return nameA.localeCompare(nameB);
      });
    } else if (sortKey === "name_desc") {
      filtered.sort((a, b) => {
        const nameA = (a.listing as any)?.product_name?.toLowerCase() || "";
        const nameB = (b.listing as any)?.product_name?.toLowerCase() || "";
        return nameB.localeCompare(nameA);
      });
    }

    return filtered;
  }, [cartItems, search, sortKey]);

  // Determine which cart items are from admin listings
  const sellerIds = useMemo(() => {
    return Array.from(new Set(
      filteredItems
        .map((item: any) => item.listing?.seller_user_id)
        .filter((id: any) => !!id)
    ));
  }, [filteredItems]);

  const { data: sellerRoleMap } = useQuery({
    queryKey: ["cart_seller_roles", sellerIds],
    queryFn: async () => {
      if (sellerIds.length === 0) return {} as Record<string, string>;
      const { data, error } = await supabase
        .from("profiles")
        .select("id, role")
        .in("id", sellerIds);
      if (error) return {} as Record<string, string>;
      const map: Record<string, string> = {};
      (data || []).forEach((p: any) => { map[p.id] = p.role; });
      return map;
    },
    enabled: sellerIds.length > 0,
    staleTime: 60_000,
  });

  // Check for mixed inventory types in selected items
  const selectedItemsList = useMemo(() => {
    return filteredItems.filter((item) => selectedItems[item.id]);
  }, [filteredItems, selectedItems]);

  const inventoryTypesInSelected = useMemo(() => {
    const types = new Set(
      selectedItemsList
        .map((item: any) => item.listing?.inventory_type)
        .filter(Boolean)
    );
    return Array.from(types);
  }, [selectedItemsList]);

  const hasMixedInventoryTypes = useMemo(() => {
    return inventoryTypesInSelected.length > 1;
  }, [inventoryTypesInSelected]);

  const handleSelectAll = (checked: boolean) => {
    setSelectAll(checked);
    const newSelected: Record<string, boolean> = {};
    if (checked) {
      filteredItems.forEach((item) => {
        newSelected[item.id] = true;
      });
    }
    setSelectedItems(newSelected);
  };

  const handleSelectItem = (itemId: string, checked: boolean) => {
    setSelectedItems((prev) => ({ ...prev, [itemId]: checked }));
    if (!checked) setSelectAll(false);
  };

  const handleRemoveSelected = async () => {
    const selectedIds = Object.keys(selectedItems).filter((id) => selectedItems[id]);
    if (selectedIds.length === 0) return;
    
    if (!confirm(`Remove ${selectedIds.length} item(s) from cart?`)) return;

    try {
      await Promise.all(selectedIds.map((id) => removeCartItemAsync(id)));
      setSelectedItems({});
      setSelectAll(false);
      toast({
        title: "Items removed",
        description: `${selectedIds.length} item(s) removed from cart`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to remove items",
        variant: "destructive",
      });
    }
  };

  const selectedCount = Object.values(selectedItems).filter(Boolean).length;
  const totalPrice = useMemo(() => {
    return filteredItems
      .filter((item) => selectedItems[item.id])
      .reduce((sum, item) => {
        const price = Number(item.price_per_unit) * item.quantity;
        // Platform fees will be calculated when reservation is created
        return sum + price;
      }, 0);
  }, [filteredItems, selectedItems]);

  if (isLoading) {
    return (
      <div className="container py-4 md:py-8 px-4">
        <div className="text-center py-12">
          <div className="glass-card rounded-xl p-8 max-w-md mx-auto">
            <div className="shimmer-loading h-4 bg-muted rounded w-1/2 mx-auto mb-4" />
            <div className="shimmer-loading h-3 bg-muted rounded w-1/3 mx-auto" />
          </div>
        </div>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="container py-4 md:py-8 px-4"
      >
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-6 md:mb-8">
          <h1 className="text-2xl md:text-3xl font-display font-semibold">Shopping Cart</h1>
        </div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-12 space-y-4"
        >
          <motion.div
            animate={{ rotate: [0, -10, 10, -10, 0], scale: [1, 1.1, 1] }}
            transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
          >
            <ShoppingCart className="h-16 w-16 mx-auto text-muted-foreground" />
          </motion.div>
          <h2 className="text-xl font-semibold">Your cart is empty</h2>
          <p className="text-muted-foreground">Add items to your cart to get started</p>
          <motion.div whileHover={hoverScale} whileTap={tapScale}>
            <Button onClick={() => navigate("/live-offers")} className="glass-button">
              Browse Live Offers
            </Button>
          </motion.div>
        </motion.div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={staggerContainer}
      className="container py-4 md:py-8 px-4 space-y-4 md:space-y-6"
    >
      <motion.div variants={fadeInUp} className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl md:text-3xl font-display font-semibold">Shopping Cart</h1>
          <p className="text-sm text-muted-foreground mt-1">{cartItems.length} items</p>
        </div>
        <motion.div whileHover={hoverScale} whileTap={tapScale} className="w-full md:w-auto">
          <Button
            size="lg"
            className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg glass-button w-full md:w-auto"
            onClick={async () => {
              const itemsToReserve = filteredItems.filter((item) => selectedItems[item.id]);
              if (itemsToReserve.length === 0) {
                toast({ title: 'No items selected', description: 'Select items to reserve.', variant: 'destructive' });
                return;
              }
              
              setIsReservingAll(true);
              try {
                let successCount = 0;
                let errorCount = 0;
                
                for (const item of itemsToReserve) {
                  try {
                    await createReservation({
                      listingId: item.listing_id,
                      quantity: item.quantity,
                      pricePerUnit: Number(item.price_per_unit),
                      currency: item.currency || 'EUR',
                      notes: 'Reserved from cart'
                    });
                    successCount++;
                    // Remove from cart after successful reservation
                    await removeCartItemAsync(item.id);
                  } catch (error: any) {
                    console.error('Failed to reserve item:', error);
                    errorCount++;
                  }
                }
                
                if (successCount > 0) {
                  toast({
                    title: 'Reservations Created',
                    description: `${successCount} item(s) reserved successfully. Our admin team will contact you within 24-48 hours.`,
                  });
                  setSelectedItems({});
                  setSelectAll(false);
                  queryClient.invalidateQueries({ queryKey: ['reservations'] });
                  if (successCount === itemsToReserve.length) {
                    navigate('/reservations');
                  }
                }
                
                if (errorCount > 0) {
                  toast({
                    title: 'Some Reservations Failed',
                    description: `${errorCount} item(s) could not be reserved. Please try again.`,
                    variant: 'destructive',
                  });
                }
              } catch (e: any) {
                toast({ 
                  title: 'Reservation failed', 
                  description: e.message || 'Please try again.', 
                  variant: 'destructive' 
                });
              } finally {
                setIsReservingAll(false);
              }
            }}
            disabled={selectedCount === 0 || isReservingAll}
          >
            {isReservingAll ? 'Creating Reservations...' : 'RESERVE ALL SELECTED'}
          </Button>
        </motion.div>
      </motion.div>

      <motion.div variants={fadeInUp} className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search for product, category, subcategory"
            className="pl-10 glass-input"
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
            <DropdownMenuItem onClick={() => setSortKey("date_desc")}>Newest</DropdownMenuItem>
            <DropdownMenuItem onClick={() => setSortKey("date_asc")}>Oldest</DropdownMenuItem>
            <DropdownMenuItem onClick={() => setSortKey("price_asc")}>Price: Low to High</DropdownMenuItem>
            <DropdownMenuItem onClick={() => setSortKey("price_desc")}>Price: High to Low</DropdownMenuItem>
            <DropdownMenuItem onClick={() => setSortKey("name_asc")}>Name: A-Z</DropdownMenuItem>
            <DropdownMenuItem onClick={() => setSortKey("name_desc")}>Name: Z-A</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </motion.div>

      <motion.div variants={fadeInUp} className="rounded-xl border bg-card glass-card overflow-hidden">
        <div className="hidden md:grid grid-cols-[auto,2fr,1fr,1fr,1fr,1fr,1.5fr,auto] gap-4 p-4 border-b bg-muted/40 font-medium text-sm">
          <Checkbox
            checked={selectAll}
            onCheckedChange={handleSelectAll}
          />
          <div>Product</div>
          <div>Category</div>
          <div>Sub Category</div>
          <div>Packaging</div>
          <div>Warehouse</div>
          <div>QTY</div>
          <div>Price</div>
        </div>
        <div className="md:hidden flex items-center justify-between p-4 border-b bg-muted/40">
          <div className="flex items-center gap-2">
            <Checkbox
              checked={selectAll}
              onCheckedChange={handleSelectAll}
            />
            <span className="text-sm font-medium">Select All</span>
          </div>
          <span className="text-xs text-muted-foreground">{filteredItems.length} items</span>
        </div>

        <AnimatePresence mode="popLayout">
          {filteredItems.map((item, index) => (
            <motion.div
              key={item.id}
              variants={listItem}
              initial="hidden"
              animate="visible"
              exit="exit"
              layout
            >
              <CartItemRow
                item={item}
                isSelected={selectedItems[item.id] || false}
                onSelect={(checked) => {
                  handleSelectItem(item.id, checked);
                }}
              />
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>

      <AnimatePresence>
        {selectedCount > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 p-4 rounded-lg border bg-card glass-card sticky bottom-0 z-10 md:static"
          >
          <div className="min-w-0">
            <p className="text-sm text-muted-foreground">{selectedCount} item(s) selected</p>
            <p className="text-lg font-semibold mt-1">
              Total: €{totalPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
          </div>
          <div className="flex flex-col md:flex-row gap-2 w-full md:w-auto">
            <motion.div whileHover={hoverScale} whileTap={tapScale} className="w-full md:w-auto">
              <Button variant="outline" onClick={handleRemoveSelected} className="glass-nav-item w-full md:w-auto">
                Remove Selected
              </Button>
            </motion.div>
            <motion.div whileHover={hoverScale} whileTap={tapScale} className="w-full md:w-auto">
              <Button
                className="bg-primary text-primary-foreground hover:bg-primary/90 glass-button w-full md:w-auto"
                onClick={async () => {
                  const itemsToReserve = filteredItems.filter((item) => selectedItems[item.id]);
                  if (itemsToReserve.length === 0) {
                    toast({ title: 'No items selected', description: 'Select items to reserve.', variant: 'destructive' });
                    return;
                  }
                  
                  setIsReservingAll(true);
                  try {
                    let successCount = 0;
                    let errorCount = 0;
                    
                    for (const item of itemsToReserve) {
                      try {
                        await createReservation({
                          listingId: item.listing_id,
                          quantity: item.quantity,
                          pricePerUnit: Number(item.price_per_unit),
                          currency: item.currency || 'EUR',
                          notes: 'Reserved from cart'
                        });
                        successCount++;
                        // Remove from cart after successful reservation
                        await removeCartItemAsync(item.id);
                      } catch (error: any) {
                        console.error('Failed to reserve item:', error);
                        errorCount++;
                      }
                    }
                    
                    if (successCount > 0) {
                      toast({
                        title: 'Reservations Created',
                        description: `${successCount} item(s) reserved successfully. Our admin team will contact you within 24-48 hours.`,
                      });
                      setSelectedItems({});
                      setSelectAll(false);
                      queryClient.invalidateQueries({ queryKey: ['reservations'] });
                      if (successCount === itemsToReserve.length) {
                        navigate('/reservations');
                      }
                    }
                    
                    if (errorCount > 0) {
                      toast({
                        title: 'Some Reservations Failed',
                        description: `${errorCount} item(s) could not be reserved. Please try again.`,
                        variant: 'destructive',
                      });
                    }
                  } catch (e: any) {
                    toast({ 
                      title: 'Reservation failed', 
                      description: e.message || 'Please try again.', 
                      variant: 'destructive' 
                    });
                  } finally {
                    setIsReservingAll(false);
                  }
                }}
                disabled={selectedCount === 0 || isReservingAll}
              >
                {isReservingAll ? 'Creating Reservations...' : 'RESERVE ALL SELECTED'}
              </Button>
            </motion.div>
          </div>
        </motion.div>
      )}
      </AnimatePresence>
    </motion.div>
  );
}
