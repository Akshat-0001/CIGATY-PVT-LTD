import { useMemo, useState } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Search, Eye, MoreHorizontal } from "lucide-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toTitleCase } from "@/lib/utils";
import { useNavigate } from "react-router-dom";
import SellerReservations from "./seller/Reservations";
import { ReservationBadge } from "@/components/seller/ReservationBadge";
import { useReservationCount } from "@/hooks/useReservations";

async function fetchMyListings() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [] as any[];
  const { data, error } = await (supabase as any)
    .from("listings")
    .select("id, updated_at, created_at, status, ui_status, product_name, category, subcategory, packaging, quantity, min_quantity, bottles_per_case, price, final_price, price_per_case, currency, duty, incoterm, lead_time, warehouse_id, image_urls")
    .eq("seller_user_id", user.id)
    .order("updated_at", { ascending: false });
  if (error) throw error; return data as any[];
}

export default function MyStock() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [tab, setTab] = useState('all');
  const [query, setQuery] = useState('');
  const { data } = useQuery({ queryKey: ["my_listings"], queryFn: fetchMyListings, placeholderData: (p)=>p??[] });

  const items = useMemo(()=> (data||[]) as any[], [data]);
  const filtered = useMemo(()=>{
    return items.filter((x:any)=>{
      const matches = !query || (x.product_name||'').toLowerCase().includes(query.toLowerCase()) || (x.category||'').toLowerCase().includes(query.toLowerCase());
      if (!matches) return false;
      if (tab === 'all') return true;
      if (tab === 'draft') return (x.ui_status === 'draft');
      if (tab === 'idle') return (x.ui_status === 'idle');
      if (tab === 'approved') return (x.status === 'approved' && x.ui_status==='live');
      if (tab === 'rejected') return (x.status === 'rejected');
      if (tab === 'pending') return (x.status === 'pending' && x.ui_status==='live');
      return true;
    });
  },[items,tab,query]);

  const count = (k:string) => items.filter((x:any)=> {
    if (k==='all') return true;
    if (k==='draft') return x.ui_status==='draft';
    if (k==='idle') return x.ui_status==='idle';
    if (k==='approved') return x.status==='approved' && x.ui_status==='live';
    if (k==='rejected') return x.status==='rejected';
    if (k==='pending') return x.status==='pending' && x.ui_status==='live';
    return true;
  }).length;

  const priceLabel = (row:any) => {
    const n = Number(row.price_per_case ?? row.final_price ?? row.price ?? 0);
    return row.currency ? `${row.currency} ${n.toLocaleString(undefined,{minimumFractionDigits:2, maximumFractionDigits:2})}` : n.toFixed(2);
  };

  const makeLive = async (item: any) => {
    if (item.status === 'approved' && item.ui_status === 'idle') {
      await (supabase as any).rpc('update_listing_intent', { _id: item.id, _ui_status: 'live' });
    } else {
      await (supabase as any).rpc('update_listing_go_live', { _id: item.id });
    }
    qc.invalidateQueries({ queryKey: ["my_listings"] });
  };

  const makeIdle = async (id: string) => {
    await (supabase as any).rpc('update_listing_intent', { _id: id, _ui_status: 'idle' });
    qc.invalidateQueries({ queryKey: ["my_listings"] });
  };

  const delListing = async (id: string) => {
    if (!window.confirm('Delete this listing?')) return;
    await (supabase as any)
      .from('listings')
      .delete()
      .eq('id', id);
    qc.invalidateQueries({ queryKey: ["my_listings"] });
  };

  return (
    <div className="container py-4 md:py-8 px-4 space-y-4 md:space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h1 className="text-2xl sm:text-3xl font-bold">Inventory</h1>
        <div className="w-full sm:w-auto">
          <Button className="gap-2 glass-button w-full sm:w-auto" onClick={()=>navigate('/add-listing')}>ADD LISTING</Button>
        </div>
      </div>

      <div>
        <Tabs value={tab} onValueChange={setTab} className="w-full">
          <div className="overflow-x-auto -mx-4 px-4 md:mx-0 md:px-0 mb-6">
            <TabsList className="mb-6 glass-nav-item w-max md:w-full">
              <TabsTrigger value="all" className="whitespace-nowrap">All ({count('all')})</TabsTrigger>
              <TabsTrigger value="approved" className="whitespace-nowrap">Live ({count('approved')})</TabsTrigger>
              <TabsTrigger value="pending" className="whitespace-nowrap">Pending ({count('pending')})</TabsTrigger>
              <TabsTrigger value="idle" className="whitespace-nowrap">Idle ({count('idle')})</TabsTrigger>
              <TabsTrigger value="rejected" className="whitespace-nowrap">Declined ({count('rejected')})</TabsTrigger>
              <TabsTrigger value="draft" className="whitespace-nowrap">Draft ({count('draft')})</TabsTrigger>
              <TabsTrigger value="reservations" className="whitespace-nowrap">Reservations</TabsTrigger>
            </TabsList>
          </div>

        <TabsContent value={tab} className="space-y-4">
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
            <p className="text-sm text-muted-foreground">{filtered.length} items</p>
            <div className="relative w-full md:w-96">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input placeholder="Search your listings" className="pl-10 glass-input" value={query} onChange={(e)=>setQuery(e.target.value)} />
            </div>
          </div>

          <div className="rounded-lg border bg-card glass-card">
            <div className="hidden md:grid grid-cols-[1.2fr,2.4fr,1fr,1.2fr,1.2fr,1.2fr,auto] gap-4 p-4 border-b bg-muted/50 font-medium text-sm">
              <div>Updated</div>
              <div>Product</div>
              <div>QTY</div>
              <div>Price</div>
              <div>Duty</div>
              <div>Status</div>
              <div>Actions</div>
            </div>
            {filtered.map((item: any) => (
                <div
                  key={item.id}
                  className="grid md:grid-cols-[1.2fr,2.4fr,1fr,1.2fr,1.2fr,1.2fr,auto] grid-cols-1 gap-4 p-4 border-b last:border-b-0 hover:bg-muted/30 transition-colors"
                >
                <div className="hidden md:block text-sm">{new Date(item.updated_at ?? item.created_at).toLocaleString()}</div>
                <div className="flex items-center gap-3 min-w-0">
                  <div className="h-12 w-12 rounded-md overflow-hidden bg-muted border flex items-center justify-center shrink-0">
                    {Array.isArray(item.image_urls) && item.image_urls[0] ? (
                      <img src={item.image_urls[0]} alt={item.product_name} className="h-full w-full object-cover" loading="lazy" decoding="async" />
                    ) : (
                      <span className="text-xs text-muted-foreground">IMG</span>
                    )}
                  </div>
                  <div className="min-w-0">
                    <div className="truncate font-medium text-sm">{item.product_name || '—'}</div>
                    <div className="text-xs text-muted-foreground truncate">{toTitleCase(item.category)}{item.subcategory? ` • ${toTitleCase(item.subcategory)}`:''} • {item.packaging}{item.bottles_per_case? ` • ${item.bottles_per_case} btl/case`:''}</div>
                    <div className="text-xs text-muted-foreground truncate">{item.incoterm || '—'}{item.lead_time? ` • ${item.lead_time}`:''}</div>
                  </div>
                </div>
                    <div className="hidden md:block text-sm">{item.quantity ?? item.qty_cases ?? '-'}</div>
                    <div className="text-sm md:text-left text-right">{priceLabel(item)}</div>
                    <div className="hidden md:block text-sm">{item.duty === 'under_bond' ? 'Under Bond' : 'Duty Paid'}</div>
                    <div className="text-sm flex flex-col gap-1 md:items-start items-end">
                      <Badge variant={item.ui_status==='draft' ? 'outline' : (item.status==='approved'?'secondary': item.status==='rejected'?'destructive':'outline')}>
                        {item.ui_status === 'draft' ? 'draft' : (item.status || 'pending')}
                      </Badge>
                      {(item.status === 'approved' && item.ui_status === 'live') && (
                        <ReservationBadge listingId={item.id} />
                      )}
                    </div>
                <div className="flex flex-col sm:flex-row gap-2 items-stretch sm:items-center md:justify-start justify-end">
                  <Button size="sm" variant="outline" className="w-full sm:w-auto" onClick={()=> navigate(`/product/${item.id}`)}><Eye className="h-4 w-4"/> <span className="hidden sm:inline">View</span></Button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button size="sm" variant="ghost" className="w-full sm:w-auto"><MoreHorizontal className="h-4 w-4"/></Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={()=> navigate(`/add-listing?id=${item.id}`)}>Edit</DropdownMenuItem>
                      {(item.ui_status === 'draft' || item.ui_status === 'idle' || item.status==='rejected') && (
                        <DropdownMenuItem onClick={()=> makeLive(item)}>Make Live</DropdownMenuItem>
                      )}
                      {(item.status === 'approved' || (item.status==='pending' && item.ui_status==='live')) && (
                        <DropdownMenuItem onClick={()=> makeIdle(item.id)}>Make Idle</DropdownMenuItem>
                      )}
                      {(item.ui_status === 'draft' || item.status==='rejected' || item.status==='pending') && (
                        <DropdownMenuItem onClick={()=> delListing(item.id)}>Delete</DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                {/* Mobile-only compact meta row */}
                <div className="flex md:hidden items-center justify-between text-xs text-muted-foreground">
                  <div>{new Date(item.updated_at ?? item.created_at).toLocaleDateString()}</div>
                  <div>Qty: {item.quantity ?? item.qty_cases ?? '-'}</div>
                  <div>{item.duty === 'under_bond' ? 'Under Bond' : 'Duty Paid'}</div>
                </div>
              </div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="reservations">
          <SellerReservations />
        </TabsContent>
      </Tabs>
      </div>
    </div>
  );
}
