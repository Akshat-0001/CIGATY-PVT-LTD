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
    <div className="flex items-center gap-3 flex-wrap">
      {['All','Beer','Wine','Spirits','Champagne','Other'].map(cat => (
        <div key={cat} className="relative group">
          <Button
            size="sm"
            variant={activeCategory === cat ? 'secondary' : 'ghost'}
            onClick={() => { setActiveCategory(cat); setActiveSubcategory(''); }}
            className="rounded-full px-4"
          >
            {cat}
          </Button>
          {cat !== 'All' && (SUBCATEGORIES[cat] || []).length > 0 && (
            <div className="absolute left-0 top-full mt-2 z-20 hidden group-hover:block">
              <div className="w-64 rounded-xl border bg-card shadow-xl p-3">
                <div className="text-xs text-muted-foreground mb-2 px-1">Subcategories</div>
                <div className="grid grid-cols-1 gap-1">
                  {(SUBCATEGORIES[cat] || []).map(sc => (
                    <button
                      key={sc}
                      onClick={() => { setActiveCategory(cat); setActiveSubcategory(sc); }}
                      className={`text-left px-2 py-1 rounded-md hover:bg-muted ${activeSubcategory === sc && activeCategory === cat ? 'bg-muted' : ''}`}
                    >
                      {sc}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );

  const ListRow = ({ row }: { row: any }) => (
    <Link
      to={`/product/${row.id}`}
      className="grid grid-cols-[3fr,1fr,1fr,2fr,2fr] gap-4 p-4 border-b last:border-b-0 hover:bg-muted/40 transition-colors"
    >
      <div className="flex items-center gap-4">
        <div className="h-16 w-16 rounded-lg overflow-hidden bg-muted border flex items-center justify-center">
          {Array.isArray(row.image_urls) && row.image_urls.length > 0 ? (
            <img src={row.image_urls[0]} alt={row.product_name} className="h-full w-full object-cover" />
          ) : (
            <span className="text-xs text-muted-foreground">IMG</span>
          )}
        </div>
        <div className="min-w-0">
          <Badge className="mb-1 bg-primary text-primary-foreground">New in</Badge>
          <h3 className="truncate font-medium text-sm text-primary">{row.product_name}</h3>
        </div>
      </div>

      <div className="flex items-center text-sm">{row.quantity}</div>

      <div className="flex flex-col justify-center">
        <p className="font-semibold">{priceLabel(row)}</p>
        <p className="text-xs text-muted-foreground">Per Case</p>
        <p className="text-xs text-muted-foreground">{row.duty === "under_bond" ? "Under Bond" : "Duty Paid"}</p>
      </div>

      <div className="flex items-center text-sm text-muted-foreground">{descr(row) || '—'}</div>

      <div className="flex items-center text-sm text-muted-foreground">
        {row.restricted ? row.restricted : 'No'}
      </div>
    </Link>
  );

  const GridCard = ({ row }: { row: any }) => (
    <Link to={`/product/${row.id}`} className="group rounded-xl border bg-card overflow-hidden shadow-sm hover:shadow-md transition-shadow">
      <div className="aspect-[4/3] bg-muted overflow-hidden">
        {Array.isArray(row.image_urls) && row.image_urls.length > 0 ? (
          <img src={row.image_urls[0]} alt={row.product_name} className="h-full w-full object-cover group-hover:scale-[1.02] transition-transform" />
        ) : (
          <div className="h-full w-full flex items-center justify-center text-muted-foreground">IMG</div>
        )}
      </div>
      <div className="p-4 space-y-2">
        <div className="flex items-center justify-between">
          <h3 className="font-medium truncate">{row.product_name}</h3>
          <Badge variant="secondary" className="ml-2">{row.category}</Badge>
        </div>
        <div className="text-sm text-muted-foreground truncate">{descr(row)}</div>
        <div className="flex items-baseline gap-2">
          <div className="text-lg font-semibold">{priceLabel(row)}</div>
          <div className="text-xs text-muted-foreground">per case</div>
        </div>
        <div className="flex items-center gap-2">
          <Badge className={row.duty === 'under_bond' ? 'bg-amber-500 text-white' : 'bg-emerald-600 text-white'}>
            {row.duty === 'under_bond' ? 'Under Bond' : 'Duty Paid'}
          </Badge>
          <Badge variant="outline">QTY {row.quantity}</Badge>
          <Badge variant="outline">{row.restricted ? 'Restricted' : 'No Restrictions'}</Badge>
        </div>
      </div>
    </Link>
  );

  const content = useMemo(() => {
    if (isLoading) {
      return (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="rounded-xl border bg-card overflow-hidden">
              <div className="animate-pulse h-44 bg-muted" />
              <div className="p-4 space-y-2">
                <div className="h-4 bg-muted rounded w-2/3" />
                <div className="h-3 bg-muted rounded w-1/3" />
                <div className="h-3 bg-muted rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      );
    }
    if (error) {
      return (
        <div className="p-6 text-center">
          <p className="text-sm text-red-500 mb-2">Failed to load live offers</p>
          <p className="text-xs text-muted-foreground">{error instanceof Error ? error.message : "Unknown error"}</p>
        </div>
      );
    }
    if (items.length === 0) {
      return (
        <div className="p-6 text-center">
          <p className="text-sm text-muted-foreground">No live offers available yet.</p>
        </div>
      );
    }

    if (viewMode === "grid") {
      return (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((row) => (
            <GridCard key={row.id} row={row} />
          ))}
        </div>
      );
    }

    return (
      <div className="rounded-xl border bg-card overflow-hidden">
        <div className="grid grid-cols-[3fr,1fr,1fr,2fr,2fr] gap-4 p-4 border-b bg-muted/40 font-medium text-sm">
          <div>Product</div>
          <div>QTY</div>
          <div>Price</div>
          <div>Description</div>
          <div>Market Restrictions</div>
        </div>
        {items.map((row) => (
          <ListRow key={row.id} row={row} />
        ))}
      </div>
    );
  }, [isLoading, error, items, viewMode]);

  return (
    <div className="container py-8 px-4 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-display font-semibold">Live Offers</h1>
        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="gap-2">
                Sort by <ChevronDown className="h-4 w-4" />
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
              <Button variant="outline" className="gap-2">
                <SlidersHorizontal className="h-4 w-4" /> Filter by
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[360px] sm:w-[420px]">
              <SheetHeader>
                <SheetTitle>Filters</SheetTitle>
              </SheetHeader>

              <div className="mt-4 space-y-6 overflow-auto">
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
                  <div className="space-y-2 max-h-56 overflow-auto pr-2">
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
                  <div className="grid grid-cols-2 gap-2 max-h-56 overflow-auto pr-2">
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

          <Button variant="outline" className="gap-2">
            <Download className="h-4 w-4" />
            DOWNLOAD LIVE OFFERS
          </Button>

          <div className="flex gap-1 border rounded-md p-1">
            <Button variant={viewMode === "list" ? "secondary" : "ghost"} size="sm" onClick={() => setViewMode("list")}>
              <LayoutList className="h-4 w-4" />
            </Button>
            <Button variant={viewMode === "grid" ? "secondary" : "ghost"} size="sm" onClick={() => setViewMode("grid")}>
              <LayoutGrid className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      <CategoryTabs />

      <div className="text-sm text-muted-foreground">{items.length} items</div>
      {content}
    </div>
  );
}
