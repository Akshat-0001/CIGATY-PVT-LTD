import { useMemo, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { toTitleCase } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Link, useNavigate } from "react-router-dom";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { LayoutGrid, ChevronDown, SlidersHorizontal, Check, X, Copy } from "lucide-react";

async function fetchApprovals(status: "pending" | "approved" | "rejected") {
  const { data, error } = await (supabase as any)
    .from("listings")
    .select(
      "id, created_at, product_name, category, subcategory, packaging, quantity, bottles_per_case, price, price_per_case, currency, duty, image_urls, status, ui_status"
    )
    .eq("status", status)
    .eq("ui_status", "live")
    .order("created_at", { ascending: false })
    .limit(500);
  if (error) throw error;
  return data as any[];
}

async function fetchCompanies(ids: string[]) {
  if (!ids.length) return [] as any[];
  const { data, error } = await (supabase as any)
    .from("companies")
    .select("id, name, legal_name, registration_no, vat_number, country, website, address_line1, address_line2, city, region, postal_code")
    .in("id", ids);
  if (error) return [] as any[];
  return data as any[];
}

async function fetchWarehouses(ids: string[]) {
  if (!ids.length) return [] as any[];
  const { data, error } = await (supabase as any)
    .from("warehouses")
    .select("id, name, city, country")
    .in("id", ids);
  if (error) return [] as any[];
  return data as any[];
}

function desc(row: any) {
  const parts: string[] = [];
  if (row.abv != null && row.abv !== "") parts.push(`${Number(row.abv)}%`);
  if (row.refillable) parts.push("REF");
  if (row.custom_status) parts.push(row.custom_status);
  return parts.join(" | ");
}

function priceLabel(row: any) {
  const amount = Number(row.price_per_case ?? row.final_price ?? row.price ?? 0);
  const isEUR = (row.currency || "").toUpperCase() === "EUR";
  const symbol = isEUR ? "€" : `${row.currency ?? ""}`;
  return `${symbol} ${amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export default function AdminApprovals() {
  const qc = useQueryClient();
  const navigate = useNavigate();
  const [statusTab, setStatusTab] = useState<"pending"|"approved"|"rejected">("pending");
  const { data, isLoading } = useQuery<any[]>({
    queryKey: ["admin_approvals", statusTab],
    queryFn: () => fetchApprovals(statusTab),
    staleTime: 30_000,
    gcTime: 5 * 60_000,
    refetchOnWindowFocus: false,
    placeholderData: (prev) => prev ?? [],
  });

  const companyIds = useMemo(() => Array.from(new Set((data ?? []).map((r: any) => r.seller?.company_id).filter(Boolean))), [data]);
  const warehouseIds = useMemo(() => Array.from(new Set((data ?? []).map((r: any) => r.warehouse_id).filter(Boolean))), [data]);

  const { data: companies } = useQuery<any[]>({
    queryKey: ["admin_companies", statusTab, companyIds.join(",")],
    queryFn: () => fetchCompanies(companyIds),
    enabled: companyIds.length > 0,
    staleTime: 60_000,
    placeholderData: (prev) => prev ?? [],
  });
  const { data: warehouses } = useQuery<any[]>({
    queryKey: ["admin_warehouses", statusTab, warehouseIds.join(",")],
    queryFn: () => fetchWarehouses(warehouseIds),
    enabled: warehouseIds.length > 0,
    staleTime: 60_000,
    placeholderData: (prev) => prev ?? [],
  });

  const companyMap = useMemo(() => {
    const m: Record<string, any> = {};
    (companies || []).forEach((c: any) => { m[c.id] = c; });
    return m;
  }, [companies]);
  const warehouseMap = useMemo(() => {
    const m: Record<string, any> = {};
    (warehouses || []).forEach((w: any) => { m[w.id] = w; });
    return m;
  }, [warehouses]);

  // fetch last moderation for approved/rejected
  const ids = useMemo(() => (data ?? []).map((r: any) => r.id), [data]);
  const { data: lastMods } = useQuery<any[]>({
    queryKey: ["last_mods", statusTab, ids.join(",")],
    queryFn: async () => {
      if (statusTab === "pending" || ids.length === 0) return [];
      const { data: lm } = await (supabase as any)
        .from("listing_last_moderation")
        .select("listing_id, action, reason, admin_name, admin_email, created_at")
        .in("listing_id", ids);
      return lm || [];
    },
    enabled: statusTab !== "pending" && ids.length > 0,
    placeholderData: (prev) => prev ?? [],
  });
  const modMap: Record<string, any> = useMemo(() => {
    const m: Record<string, any> = {};
    (lastMods || []).forEach((x: any) => { m[x.listing_id] = x; });
    return m;
  }, [lastMods]);

  // UI state
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState("date_desc");
  const [selected, setSelected] = useState<Record<string, boolean>>({});
  const [quickView, setQuickView] = useState<any | null>(null);
  const [rejectOpen, setRejectOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState("");

  // Filters
  const [filterDuty, setFilterDuty] = useState<Record<string, boolean>>({});
  const [filterCategory, setFilterCategory] = useState<Record<string, boolean>>({});

  const rows = useMemo(() => {
    const src = data ?? [];
    const filtered = (src as any[]).filter(r => {
      const byS = !search || r.product_name?.toLowerCase().includes(search.toLowerCase()) || r.seller?.full_name?.toLowerCase().includes(search.toLowerCase());
      const byDuty = Object.values(filterDuty).some(Boolean) ? !!filterDuty[r.duty] : true;
      const byCat = Object.values(filterCategory).some(Boolean) ? !!filterCategory[r.category] : true;
      return byS && byDuty && byCat;
    });
    const sorted = [...filtered].sort((a, b) => {
      if (sortKey === "date_desc") return +new Date(b.created_at) - +new Date(a.created_at);
      if (sortKey === "date_asc") return +new Date(a.created_at) - +new Date(b.created_at);
      if (sortKey === "price_asc") return Number(a.price_per_case ?? a.final_price ?? a.price ?? 0) - Number(b.price_per_case ?? b.final_price ?? b.price ?? 0);
      if (sortKey === "price_desc") return Number(b.price_per_case ?? b.final_price ?? b.price ?? 0) - Number(a.price_per_case ?? a.final_price ?? a.price ?? 0);
      return 0;
    });
    return sorted;
  }, [data, search, sortKey, filterDuty, filterCategory]);

  const approveMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await (supabase as any).rpc("approve_listing", { p_id: id });
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin_approvals"] })
  });

  const rejectMutation = useMutation({
    mutationFn: async (payload: { id: string; reason: string }) => {
      const { error } = await (supabase as any).rpc("reject_listing", { p_id: payload.id, reason: payload.reason });
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin_approvals"] });
      setRejectReason("");
      setRejectOpen(false);
    }
  });

  const bulkIds = Object.entries(selected).filter(([, v]) => v).map(([k]) => k);

  const copy = (text: string) => navigator.clipboard?.writeText(text).catch(() => {});

  return (
    <div className="container py-4 md:py-8 px-4 space-y-4 md:space-y-6">
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <h1 className="text-xl sm:text-2xl md:text-3xl font-display font-semibold">Listings Approvals</h1>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
          {bulkIds.length > 0 && (
            <>
              <Button size="sm" className="gap-2 w-full sm:w-auto" onClick={() => bulkIds.forEach(id => approveMutation.mutate(id))}><Check className="h-4 w-4" /> <span className="hidden sm:inline">Approve Selected</span><span className="sm:hidden">Approve</span></Button>
              <Button size="sm" variant="destructive" className="gap-2 w-full sm:w-auto" onClick={() => { setRejectOpen(true); }}><X className="h-4 w-4" /> <span className="hidden sm:inline">Reject Selected</span><span className="sm:hidden">Reject</span></Button>
            </>
          )}
        </div>
      </div>

      {/* Simple subnav to jump between modules */}
      <div className="flex gap-2 -mt-2">
        <Button asChild variant="outline"><a href="/admin/approvals">Listings</a></Button>
        <Button asChild variant="ghost"><a href="/admin/users">User Verification</a></Button>
      </div>

      <Tabs value={statusTab} onValueChange={(v: any) => setStatusTab(v)} className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="pending">Pending</TabsTrigger>
          <TabsTrigger value="approved">Approved</TabsTrigger>
          <TabsTrigger value="rejected">Rejected</TabsTrigger>
        </TabsList>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 mb-4">
          <Input placeholder="Search by product or seller…" value={search} onChange={(e) => setSearch(e.target.value)} className="w-full sm:max-w-sm" />
          <div className="flex gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="gap-2 w-full sm:w-auto"><ChevronDown className="h-4 w-4" /> <span className="hidden sm:inline">Sort</span></Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start">
                <DropdownMenuItem onClick={() => setSortKey("date_desc")}>Newest</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSortKey("date_asc")}>Oldest</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSortKey("price_asc")}>Price min</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSortKey("price_desc")}>Price max</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="gap-2 w-full sm:w-auto"><SlidersHorizontal className="h-4 w-4" /> <span className="hidden sm:inline">Filters</span></Button>
              </DropdownMenuTrigger>
            <DropdownMenuContent className="p-3 space-y-3" align="start">
              <div>
                <div className="text-xs text-muted-foreground mb-2">Duty</div>
                {["duty_paid", "under_bond"].map(k => (
                  <label key={k} className="flex items-center gap-2 text-sm">
                    <Checkbox checked={!!filterDuty[k]} onCheckedChange={(v) => setFilterDuty(p => ({ ...p, [k]: !!v }))} />
                    <span>{k === "duty_paid" ? "Duty Paid" : "Under Bond"}</span>
                  </label>
                ))}
              </div>
              <div>
                <div className="text-xs text-muted-foreground mb-2">Category</div>
                {["Beer","Wine","Spirits","Champagne","Other"].map(c => (
                  <label key={c} className="flex items-center gap-2 text-sm">
                    <Checkbox checked={!!filterCategory[c]} onCheckedChange={(v) => setFilterCategory(p => ({ ...p, [c]: !!v }))} />
                    <span>{c}</span>
                  </label>
                ))}
              </div>
            </DropdownMenuContent>
          </DropdownMenu>
          </div>
        </div>

        <TabsContent value={statusTab}>
          {isLoading && <div className="rounded-xl border bg-card p-6 text-center text-muted-foreground">Loading…</div>}

          {!isLoading && rows.length === 0 && (
            <div className="rounded-xl border bg-card p-10 text-center">
              <LayoutGrid className="h-6 w-6 mx-auto mb-3 text-muted-foreground" />
              <div className="text-sm text-muted-foreground">No listings in this state.</div>
            </div>
          )}

          {rows.length > 0 && (
            <div className="rounded-xl border bg-card overflow-hidden">
              <div className="hidden md:grid grid-cols-[3fr,1fr,1.2fr,2fr,2fr,2fr,1.6fr] gap-4 p-4 border-b bg-muted/40 font-medium text-sm">
                <div>Product</div>
                <div>QTY</div>
                <div>Price</div>
                <div>Description</div>
                <div>Seller</div>
                <div>Company</div>
                <div>Actions</div>
              </div>

              {rows.map((r: any) => {
                const comp = r.seller?.company_id ? companyMap[r.seller.company_id] : null;
                const wh = r.warehouse_id ? warehouseMap[r.warehouse_id] : null;
                const companyHover = comp ? (
                  <div className="text-xs space-y-1">
                    <div><span className="text-muted-foreground">Legal:</span> {comp.legal_name ?? "—"}</div>
                    <div><span className="text-muted-foreground">Reg No:</span> {comp.registration_no ?? "—"}</div>
                    <div><span className="text-muted-foreground">VAT:</span> {comp.vat_number ?? "—"}</div>
                    <div className="truncate"><span className="text-muted-foreground">Website:</span> {comp.website ?? "—"}</div>
                  </div>
                ) : null;

                return (
                  <div
                    key={r.id}
                    className="grid md:grid-cols-[3fr,1fr,1.2fr,2fr,2fr,2fr,1.6fr] grid-cols-1 gap-4 p-4 border-b last:border-b-0 hover:bg-muted/30 transition-colors cursor-pointer"
                    onClick={() => navigate(`/admin/approvals/${r.id}`)}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="h-16 w-16 rounded-lg overflow-hidden bg-muted border flex items-center justify-center shrink-0">
                        {Array.isArray(r.image_urls) && r.image_urls.length > 0 ? (
                          <img src={r.image_urls[0]} alt={r.product_name} className="h-full w-full object-cover" />
                        ) : (
                          <span className="text-xs text-muted-foreground">IMG</span>
                        )}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="font-medium truncate">{r.product_name}</h3>
                          <Badge variant="secondary" className="shrink-0">{r.category}</Badge>
                          {wh && <Badge variant="outline" className="shrink-0">{wh.name}</Badge>}
                        </div>
                        <div className="text-xs text-muted-foreground truncate">{r.subcategory ? toTitleCase(r.subcategory) : "—"}</div>
                      </div>
                    </div>

                    <div className="hidden md:flex items-center text-sm">{r.quantity}</div>

                    <div className="flex flex-col justify-center">
                      <div className="font-semibold">{priceLabel(r)}</div>
                      <div className="text-xs text-muted-foreground">per case</div>
                      <div className="text-xs text-muted-foreground">{r.duty === "under_bond" ? "Under Bond" : "Duty Paid"}</div>
                    </div>

                    <div className="hidden md:flex items-center text-sm text-muted-foreground">{desc(r) || "—"}</div>

                    <div className="hidden md:flex items-center gap-2 min-w-0" onClick={(e) => e.stopPropagation()}>
                      <div className="min-w-0">
                        <div className="truncate text-sm">{r.seller?.full_name ?? "—"}</div>
                        <div className="truncate text-xs text-muted-foreground">{r.seller?.email ?? "—"}</div>
                        {r.seller?.phone && (
                          <button className="text-xs text-muted-foreground hover:underline inline-flex items-center gap-1" onClick={() => copy(r.seller.phone)} title="Copy phone">
                            <Copy className="h-3 w-3" />{r.seller.phone}
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="hidden md:flex items-center min-w-0" onClick={(e) => e.stopPropagation()}>
                      {comp ? (
                        <HoverCard>
                          <HoverCardTrigger asChild>
                            <div className="min-w-0">
                              <div className="truncate text-sm font-medium">{comp.name}</div>
                              <div className="truncate text-xs text-muted-foreground">{comp.country ?? "—"}</div>
                            </div>
                          </HoverCardTrigger>
                          <HoverCardContent className="w-72">
                            {companyHover}
                          </HoverCardContent>
                        </HoverCard>
                      ) : (
                        <div className="text-sm text-muted-foreground">—</div>
                      )}
                    </div>

                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 md:justify-end" onClick={(e) => e.stopPropagation()}>
                      {statusTab === "pending" && (
                        <>
                          <Button size="sm" className="gap-2 w-full sm:w-auto" onClick={() => approveMutation.mutate(r.id)}><Check className="h-4 w-4" />Approve</Button>
                          <Button size="sm" variant="destructive" className="w-full sm:w-auto" onClick={() => { setSelected({ [r.id]: true }); setRejectOpen(true); }}>Reject</Button>
                        </>
                      )}
                      <div className="flex items-center justify-center sm:justify-start">
                        <Checkbox checked={!!selected[r.id]} onCheckedChange={(v) => setSelected(p => ({ ...p, [r.id]: !!v }))} />
                      </div>
                    </div>

                    {/* Mobile metadata row */}
                    <div className="flex md:hidden items-center justify-between text-xs text-muted-foreground">
                      <div>Qty: {r.quantity}</div>
                      <div>{r.duty === 'under_bond' ? 'Under Bond' : 'Duty Paid'}</div>
                    </div>

                    {statusTab !== "pending" && modMap[r.id] && (
                      <div className="md:col-span-7 col-span-1 pt-2 text-xs text-muted-foreground">
                        {modMap[r.id].action === 'approved' ? 'Approved' : 'Rejected'} by {modMap[r.id].admin_name || modMap[r.id].admin_email || 'Admin'} on {new Date(modMap[r.id].created_at).toLocaleString()}
                        {modMap[r.id].reason ? ` • ${modMap[r.id].reason}` : ''}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Quick View removed; navigation to detail instead */}

      {/* Reject dialog */}
      <Dialog open={rejectOpen} onOpenChange={setRejectOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject listing</DialogTitle>
          </DialogHeader>
          <div className="space-y-2">
            <div className="text-sm text-muted-foreground">Provide a reason (shared with the seller).</div>
            <Textarea value={rejectReason} onChange={(e) => setRejectReason(e.target.value)} placeholder="Reason for rejection…" />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectOpen(false)}>Cancel</Button>
            <Button variant="destructive" disabled={!rejectReason.trim()} onClick={() => {
              Object.entries(selected).forEach(([id, v]) => v && rejectMutation.mutate({ id, reason: rejectReason.trim() }));
            }}>Reject</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}


