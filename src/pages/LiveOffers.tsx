import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter, SheetTrigger } from "@/components/ui/sheet";
import { Checkbox } from "@/components/ui/checkbox";
import { Download, LayoutList, LayoutGrid, ChevronDown, SlidersHorizontal } from "lucide-react";
import { toTitleCase } from "@/lib/utils";
import MarketplaceCard from "@/components/marketplace/MarketplaceCard";
import { motion, AnimatePresence } from "framer-motion";
import { staggerContainer, fadeInUp, hoverScale, tapScale, springTransition } from "@/lib/animations";
const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;
const isNew = (createdAt?: string | null) =>
  !!createdAt && (Date.now() - new Date(createdAt).getTime() < THIRTY_DAYS_MS);

const SUBCATEGORIES: Record<string, string[]> = {
  Beer: ['craft','low/no alcohol'],
  Wine: ['port','sparkling wine','fortified','mixed'],
  Spirits: ['Gin','liqueur','pastis','whiskey','mezcal','rum','vodka','cognac/brandy','tequila','armagnac','other'],
  Champagne: ['Vintage','Non-Vintage','Rose','other'],
  Other: ['Absinthe','Calvados','Non Alcoholic','Grappa','Raki','Sake','Mixed cocktails','other'],
};

const CONTENT_LIST = ['2','3','4','5','10','15','20','25','27.5','33','35','35.5','37.5','44','50','60','70','72.5','75','100','150','175','200','300','450','600','1200','1500','3000'];

async function fetchApprovedListings() {
  const { data, error } = await supabase
    .from("listings")
    .select(
      "id, product_name, category, subcategory, packaging, quantity, min_quantity, bottles_per_case, price, final_price, price_per_case, currency, duty, content, image_urls, created_at, abv, refillable, custom_status, incoterm, lead_time, ui_status, status"
    )
    .eq("status", "approved")
    .eq("ui_status", "live")
    .order("created_at", { ascending: false })
    .limit(500);
  if (error) throw error;
  return data as any[];
}

async function fetchWarehouses() {
  const { data, error } = await supabase.from("warehouses").select("id,name").order("name");
  if (error) return [] as any[];
  return (data as any[]) || [];
}

export default function LiveOffers() {
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");
  const [activeCategory, setActiveCategory] = useState<string>("All");
  const [activeSubcategory, setActiveSubcategory] = useState<string>("");
  const [sortKey, setSortKey] = useState<string>("price_asc");

  const { data, isLoading, error } = useQuery({ queryKey: ["live_offers_v2"], queryFn: fetchApprovedListings });
  const { data: warehouses } = useQuery({ queryKey: ["warehouses"], queryFn: fetchWarehouses });

  // Filters
  const [showFilters, setShowFilters] = useState(false);
  const [filterCategories, setFilterCategories] = useState<Record<string, boolean>>({});
  const [filterWarehouses, setFilterWarehouses] = useState<Record<string, boolean>>({});
  const [filterContents, setFilterContents] = useState<Record<string, boolean>>({});

  const itemsFiltered = useMemo(() => {
    const src = data ?? [];
    return src.filter((row: any) => {
      const byCat = activeCategory === "All" || row.category === activeCategory;
      const bySub = !activeSubcategory || row.subcategory === activeSubcategory;
      const byFilterCat = Object.values(filterCategories).some(Boolean)
        ? !!filterCategories[row.category]
        : true;
      const byContent = Object.values(filterContents).some(Boolean)
        ? !!filterContents[(row.content || '').replace(' cl','')]
        : true;
      // Warehouse link not in view; skipping until listings have warehouse_id in view output
      const byWarehouse = Object.values(filterWarehouses).some(Boolean) ? true : true;
      return byCat && bySub && byFilterCat && byContent && byWarehouse;
    });
  }, [data, activeCategory, activeSubcategory, filterCategories, filterContents, filterWarehouses]);

  const priceLabel = (row: any) => {
    const amount = Number(row.price_per_case ?? row.final_price ?? row.price ?? 0);
    const isEUR = (row.currency || "").toUpperCase() === "EUR";
    const symbol = isEUR ? "€" : `${row.currency ?? ""}`;
    return `${symbol} ${amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const sortFn = (a: any, b: any) => {
    const priceA = Number(a.price_per_case ?? a.final_price ?? a.price ?? 0);
    const priceB = Number(b.price_per_case ?? b.final_price ?? b.price ?? 0);
    const nameA = (a.product_name || '').toLowerCase();
    const nameB = (b.product_name || '').toLowerCase();
    if (sortKey === 'price_asc') return priceA - priceB;
    if (sortKey === 'price_desc') return priceB - priceA;
    if (sortKey === 'qty_asc') return (a.quantity || 0) - (b.quantity || 0);
    if (sortKey === 'qty_desc') return (b.quantity || 0) - (a.quantity || 0);
    if (sortKey === 'name_asc') return nameA.localeCompare(nameB);
    if (sortKey === 'name_desc') return nameB.localeCompare(nameA);
    return 0;
  };

  const items = useMemo(() => [...itemsFiltered].sort(sortFn), [itemsFiltered, sortKey]);

  const descr = (row: any) => {
    const parts: string[] = [];
    if (row.abv != null && row.abv !== "") parts.push(`${Number(row.abv)}%`);
    if (row.refillable) parts.push("REF");
    if (row.custom_status) parts.push(row.custom_status);
    return parts.join(" | ");
  };

  const CategoryTabs = () => (
    <motion.div
      className="flex items-center gap-3 flex-wrap"
      initial="hidden"
      animate="visible"
      variants={staggerContainer}
    >
      {['All','Beer','Wine','Spirits','Champagne','Other'].map((cat, index) => {
        const categories = ['All','Beer','Wine','Spirits','Champagne','Other'];
        const isLastTwo = index >= categories.length - 2; // Last two items
        
        return (
          <motion.div
            key={cat}
            variants={fadeInUp}
            className="relative group/category"
          >
            <motion.div
              whileHover={hoverScale}
              whileTap={tapScale}
              transition={springTransition}
            >
              <Button
                size="sm"
                variant={activeCategory === cat ? 'secondary' : 'ghost'}
                onClick={() => { setActiveCategory(cat); setActiveSubcategory(''); }}
                className="rounded-full px-4 glass-nav-item"
              >
                {cat}
              </Button>
            </motion.div>
            {cat !== 'All' && (SUBCATEGORIES[cat] || []).length > 0 && (
              <div className={`absolute ${isLastTwo ? 'right-0' : 'left-0'} top-full pt-1 z-20 opacity-0 invisible group-hover/category:opacity-100 group-hover/category:visible transition-all duration-200`}>
                <div className="min-w-[240px] max-w-[320px] w-max rounded-xl border bg-card shadow-xl overflow-hidden">
                  <div className="text-xs text-muted-foreground mb-2 px-4 pt-3">Subcategories</div>
                  <div className="grid grid-cols-1 gap-0.5 max-h-[300px] overflow-y-scroll scrollbar-thin px-3 pb-3">
                    {(SUBCATEGORIES[cat] || []).map(sc => (
                      <button
                        key={sc}
                        onClick={() => { setActiveCategory(cat); setActiveSubcategory(sc); }}
                        className={`text-left px-3 py-1.5 rounded-md hover:bg-muted transition-colors whitespace-nowrap text-sm ${activeSubcategory === sc && activeCategory === cat ? 'bg-muted' : ''}`}
                      >
                        {toTitleCase(sc)}
                      </button>
                    ))}
                  </div>
                  {(SUBCATEGORIES[cat] || []).length > 6 && (
                    <div className="text-xs text-center text-muted-foreground py-1 bg-muted/30 border-t">
                      Scroll for more ↓
                    </div>
                  )}
                </div>
              </div>
            )}
          </motion.div>
        );
      })}
    </motion.div>
  );

  const ListRow = ({ row, index }: { row: any; index: number }) => (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={fadeInUp}
      transition={{ delay: index * 0.05, ...springTransition }}
    >
      <Link
        to={`/product/${row.id}`}
        className="group relative grid grid-cols-[1fr,auto] md:grid-cols-[3fr,1fr,1fr,2fr,2fr] gap-4 p-4 rounded-2xl border bg-card glass-card shadow-sm transition-all duration-300 hover:shadow-xl hover:shadow-primary/10"
      >
      {/* Half-outside NEW badge at top-left (only for <30 days) */}
      {isNew(row.created_at) && (
        <div className="pointer-events-none absolute -top-2 -left-2 z-20">
          <span className="inline-flex items-center h-5 px-2 rounded-full bg-primary text-primary-foreground text-[10px] font-semibold shadow-md">New</span>
        </div>
      )}
      <div className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100"
           style={{ background: "radial-gradient(1200px 200px at top, rgba(59,130,246,0.10), transparent 50%)" }} />
      <div className="flex items-center gap-4">
        <div className="h-20 w-20 rounded-lg overflow-hidden bg-muted border flex items-center justify-center ring-1 ring-transparent group-hover:ring-primary/20 transition">
          {Array.isArray(row.image_urls) && row.image_urls.length > 0 ? (
            <img src={row.image_urls[0]} alt={row.product_name} className="h-full w-full object-cover" />
          ) : (
            <span className="text-xs text-muted-foreground">IMG</span>
          )}
        </div>
        <div className="min-w-0">
          <h3 className="truncate font-medium text-sm text-black">{row.product_name}</h3>
        </div>
      </div>

      <div className="hidden md:flex items-center text-sm">{row.quantity}</div>

      <div className="flex flex-col justify-center items-end md:items-start">
        <p className="font-semibold">{priceLabel(row)}</p>
        <p className="text-xs text-muted-foreground">Per Case</p>
        <p className="text-xs text-muted-foreground">{row.duty === "under_bond" ? "Under Bond" : "Duty Paid"}</p>
      </div>

      <div className="hidden md:flex items-center text-sm text-muted-foreground">{descr(row) || '—'}</div>

      <div className="hidden md:flex items-center text-sm text-muted-foreground">
        {row.restricted ? row.restricted : 'No'}
      </div>
    </Link>
    </motion.div>
  );

  // Grid uses MarketplaceCard

  const content = useMemo(() => {
    if (isLoading) {
      return (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="rounded-2xl border bg-card overflow-hidden glass-card"
            >
              <div className="shimmer-loading h-44 bg-muted" />
              <div className="p-4 space-y-3">
                <div className="h-4 bg-muted rounded w-2/3 shimmer-loading" />
                <div className="h-3 bg-muted rounded w-1/2 shimmer-loading" />
                <div className="h-3 bg-muted rounded w-1/3 shimmer-loading" />
              </div>
            </motion.div>
          ))}
        </div>
      );
    }
    if (error) {
      return (
        <div className="p-6 text-center">
          <p className="text-sm text-red-500 mb-2">Failed to load marketplace</p>
          <p className="text-xs text-muted-foreground">{error instanceof Error ? error.message : "Unknown error"}</p>
        </div>
      );
    }
    if (items.length === 0) {
      return (
        <div className="p-6 text-center">
          <p className="text-sm text-muted-foreground">No products available in marketplace yet.</p>
        </div>
      );
    }

    if (viewMode === "grid") {
      return (
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
        >
          {items.map((row, index) => (
            <motion.div key={row.id} variants={fadeInUp}>
              <MarketplaceCard row={row} priceLabel={priceLabel} descr={descr} />
            </motion.div>
          ))}
        </motion.div>
      );
    }

    return (
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        className="space-y-3"
      >
        <div className="hidden md:grid grid-cols-[3fr,1fr,1fr,2fr,2fr] gap-4 px-2 font-medium text-xs text-muted-foreground">
          <div>Product</div>
          <div>QTY</div>
          <div>Price</div>
          <div>Description</div>
          <div>Market Restrictions</div>
        </div>
        <div className="grid gap-3">
          <AnimatePresence mode="popLayout">
            {items.map((row, index) => (
              <ListRow key={row.id} row={row} index={index} />
            ))}
          </AnimatePresence>
        </div>
      </motion.div>
    );
  }, [isLoading, error, items, viewMode]);

  const appliedFiltersCount =
    Object.values(filterCategories).filter(Boolean).length +
    Object.values(filterContents).filter(Boolean).length +
    Object.values(filterWarehouses).filter(Boolean).length;

  return (
    <div className="container py-4 md:py-8 px-4 space-y-4 md:space-y-6">
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <h1 className="text-2xl md:text-3xl font-display font-semibold">Marketplace</h1>
        <div className="flex flex-wrap items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="gap-2">
                <ChevronDown className="h-4 w-4" /> <span className="hidden sm:inline">Sort by</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setSortKey('price_asc')}>Price min</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSortKey('price_desc')}>Price max</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSortKey('qty_asc')}>Quantity min</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSortKey('qty_desc')}>Quantity max</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSortKey('name_asc')}>Name A-Z</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSortKey('name_desc')}>Name Z-A</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Sheet open={showFilters} onOpenChange={setShowFilters}>
            <SheetTrigger asChild>
              <Button variant="outline" size="sm" className="gap-2">
                <SlidersHorizontal className="h-4 w-4" /> <span className="hidden sm:inline">Filter by</span>
                {appliedFiltersCount > 0 && (
                  <Badge className="ml-1 bg-primary/15 text-primary border-primary/30 text-xs">{appliedFiltersCount}</Badge>
                )}
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[360px] sm:w-[420px] glass-light">
              <SheetHeader>
                <SheetTitle>Filters</SheetTitle>
              </SheetHeader>

              <div className="mt-4 space-y-6 overflow-auto scrollbar-thin">
                <div>
                  <div className="font-medium mb-2">Category</div>
                  <div className="space-y-2">
                    {['Beer','Wine','Spirits','Champagne','Other'].map(cat => (
                      <label key={cat} className="flex items-center gap-2">
                        <Checkbox
                          checked={!!filterCategories[cat]}
                          onCheckedChange={(v) => setFilterCategories(prev => ({ ...prev, [cat]: !!v }))}
                        />
                        <span>{cat}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <div className="font-medium mb-2">Warehouse</div>
                  <div className="space-y-2 max-h-56 overflow-auto scrollbar-thin pr-2">
                    {(warehouses || []).map((w: any) => (
                      <label key={w.id} className="flex items-center gap-2">
                        <Checkbox
                          checked={!!filterWarehouses[w.id]}
                          onCheckedChange={(v) => setFilterWarehouses(prev => ({ ...prev, [w.id]: !!v }))}
                        />
                        <span>{w.name}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <div className="font-medium mb-2">Content</div>
                  <div className="grid grid-cols-2 gap-2 max-h-56 overflow-auto scrollbar-thin pr-2">
                    {CONTENT_LIST.map((v) => (
                      <label key={v} className="flex items-center gap-2">
                        <Checkbox
                          checked={!!filterContents[v]}
                          onCheckedChange={(x) => setFilterContents(prev => ({ ...prev, [v]: !!x }))}
                        />
                        <span>{v} cl</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              <SheetFooter className="mt-6">
                <Button onClick={() => { setFilterCategories({}); setFilterWarehouses({}); setFilterContents({}); }}>Reset</Button>
                <Button className="ml-auto" onClick={() => setShowFilters(false)}>Apply</Button>
              </SheetFooter>
            </SheetContent>
          </Sheet>

          <Button variant="outline" size="sm" className="gap-2 hidden sm:flex">
            <Download className="h-4 w-4" /> <span className="hidden md:inline">DOWNLOAD MARKETPLACE</span>
          </Button>

          <motion.div
            className="flex gap-1 border rounded-md p-1 glass-nav-item"
            whileHover={{ scale: 1.02 }}
            transition={springTransition}
          >
            <motion.div
              whileHover={hoverScale}
              whileTap={tapScale}
              transition={springTransition}
            >
              <Button variant={viewMode === "list" ? "secondary" : "ghost"} size="sm" onClick={() => setViewMode("list")}>
                <LayoutList className="h-4 w-4" />
              </Button>
            </motion.div>
            <motion.div
              whileHover={hoverScale}
              whileTap={tapScale}
              transition={springTransition}
            >
              <Button variant={viewMode === "grid" ? "secondary" : "ghost"} size="sm" onClick={() => setViewMode("grid")}>
                <LayoutGrid className="h-4 w-4" />
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </div>

      <CategoryTabs />

      <div className="text-sm text-muted-foreground">{items.length} items</div>
      {content}
    </div>
  );
}
