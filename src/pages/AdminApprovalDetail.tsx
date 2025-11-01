import { useParams, Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Check, X } from "lucide-react";

async function fetchListing(id: string) {
  const { data, error } = await (supabase as any)
    .from("listings")
    .select("id, created_at, product_name, category, subcategory, packaging, quantity, min_quantity, bottles_per_case, price, final_price, price_per_case, currency, duty, abv, refillable, custom_status, content, image_urls, incoterm, lead_time, condition, status, seller_user_id")
    .eq("id", id)
    .single();
  if (error) throw error;
  return data as any;
}

async function fetchSeller(userId: string | null) {
  if (!userId) return null;
  const { data, error } = await (supabase as any)
    .from("profiles")
    .select("id, full_name, email, phone, country, company_id")
    .eq("id", userId)
    .single();
  if (error) return null;
  return data as any;
}

async function fetchCompany(companyId: string | null) {
  if (!companyId) return null;
  const { data, error } = await (supabase as any)
    .from("companies")
    .select("id, name, legal_name, registration_no, vat_number, address_line1, address_line2, city, region, postal_code, country, website, created_at")
    .eq("id", companyId)
    .single();
  if (error) return null;
  return data as any;
}

async function fetchRestrictions(listingId: string) {
  const { data, error } = await (supabase as any)
    .from("restricted_markets")
    .select("restriction_type, countries")
    .eq("listing_id", listingId);
  if (error) return [] as any[];
  return data as any[];
}

async function fetchDocuments(companyId: string | null) {
  if (!companyId) return [] as any[];
  const { data, error } = await (supabase as any)
    .from("kyc_documents")
    .select("id, type, status, file_url, file_name, mime_type, verified_by, verified_at, notes, uploaded_at")
    .eq("company_id", companyId)
    .order("uploaded_at", { ascending: false });
  if (error) return [] as any[];
  return data as any[];
}

function priceLabel(row: any) {
  const amount = Number(row.price_per_case ?? row.final_price ?? row.price ?? 0);
  const isEUR = (row.currency || "").toUpperCase() === "EUR";
  const symbol = isEUR ? "€" : `${row.currency ?? ""}`;
  return `${symbol} ${amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export default function AdminApprovalDetail() {
  const { id } = useParams();
  const qc = useQueryClient();
  const { data: listing, isLoading, error } = useQuery({ queryKey: ["approval_detail", id], queryFn: () => fetchListing(id as string), enabled: !!id });

  const { data: seller } = useQuery({ queryKey: ["approval_seller", listing?.seller_user_id], queryFn: () => fetchSeller(listing?.seller_user_id ?? null), enabled: !!listing?.seller_user_id });
  const { data: company } = useQuery({ queryKey: ["approval_company", seller?.company_id], queryFn: () => fetchCompany(seller?.company_id ?? null), enabled: !!seller?.company_id });
  const { data: docs } = useQuery({ queryKey: ["approval_docs", seller?.company_id], queryFn: () => fetchDocuments(seller?.company_id ?? null), enabled: !!seller?.company_id });
  const { data: restrictions } = useQuery({ queryKey: ["approval_restr", id], queryFn: () => fetchRestrictions(id as string), enabled: !!id });

  const approve = useMutation({
    mutationFn: async () => { const { error } = await (supabase as any).rpc("approve_listing", { p_id: id }); if (error) throw error; },
    onSuccess: () => qc.invalidateQueries()
  });
  const reject = useMutation({
    mutationFn: async () => { const { error } = await (supabase as any).rpc("reject_listing", { p_id: id, reason: "Rejected by admin" }); if (error) throw error; },
    onSuccess: () => qc.invalidateQueries()
  });

  if (isLoading) return <div className="container py-8 px-4">Loading…</div>;
  if (error || !listing) return <div className="container py-8 px-4 text-red-500">Not found</div>;

  const imgs: string[] = Array.isArray(listing.image_urls) ? listing.image_urls : [];

  return (
    <div className="container py-8 px-4 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-semibold">{listing.product_name}</h1>
          <div className="text-sm text-muted-foreground">{listing.category}{listing.subcategory ? ` • ${listing.subcategory}` : ""}</div>
        </div>
        <div className="flex gap-2">
          {listing.status === "pending" && (
            <>
              <Button className="gap-2" onClick={() => approve.mutate()}><Check className="h-4 w-4" />Approve</Button>
              <Button variant="destructive" onClick={() => reject.mutate()}><X className="h-4 w-4" />Reject</Button>
            </>
          )}
          <Button variant="outline" asChild><Link to="/admin/approvals">Back</Link></Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-3">
          <div className="rounded-xl border p-4 bg-card min-h-[380px] flex items-center justify-center">
            {imgs[0] ? <img src={imgs[0]} alt={listing.product_name} className="max-h-96 object-contain" /> : <div className="text-muted-foreground">IMG</div>}
          </div>
          {imgs.length > 1 && (
            <div className="grid grid-cols-5 gap-2">
              {imgs.slice(1).map((u) => <img key={u} src={u} className="h-16 w-full object-cover rounded-md border" />)}
            </div>
          )}
        </div>

        <div className="space-y-4">
          <div className="rounded-xl border p-5 bg-card space-y-2">
            <div className="text-lg font-semibold">{priceLabel(listing)} <span className="text-xs text-muted-foreground">per case</span></div>
            <div className="text-sm text-muted-foreground">QTY {listing.quantity} • {listing.packaging} • {listing.bottles_per_case ?? "-"} btl/case</div>
            <div className="flex gap-2">
              <Badge className={listing.duty === "under_bond" ? "bg-amber-500 text-white" : "bg-emerald-600 text-white"}>{listing.duty === "under_bond" ? "Under Bond" : "Duty Paid"}</Badge>
              {listing.incoterm && <Badge variant="outline">{listing.incoterm}</Badge>}
              {listing.lead_time && <Badge variant="outline">{listing.lead_time}</Badge>}
            </div>
          </div>

          {company && (
            <div className="rounded-xl border p-5 bg-card">
              <div className="text-sm"><span className="text-muted-foreground">Company Reg. No:</span> {company.registration_no ?? '—'}</div>
            </div>
          )}

          <Tabs defaultValue="details" className="w-full">
            <TabsList className="mb-3">
              <TabsTrigger value="details">Details</TabsTrigger>
              <TabsTrigger value="seller">Seller</TabsTrigger>
              <TabsTrigger value="company">Company</TabsTrigger>
              <TabsTrigger value="documents">Documents</TabsTrigger>
              <TabsTrigger value="restrictions">Restrictions</TabsTrigger>
            </TabsList>

            <TabsContent value="details">
              <div className="rounded-xl border p-5 bg-card grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                <div><span className="text-muted-foreground">Description</span><div>{listing.content || "—"}</div></div>
                <div><span className="text-muted-foreground">ABV | REF | T</span><div>{[(listing.abv!=null?`${Number(listing.abv)}%`:null), listing.refillable?"REF":null, listing.custom_status||null].filter(Boolean).join(" | ") || "—"}</div></div>
                <div><span className="text-muted-foreground">Condition</span><div>{listing.condition || "—"}</div></div>
                <div><span className="text-muted-foreground">Min Order</span><div>{listing.min_quantity ?? 1}</div></div>
              </div>
            </TabsContent>

            <TabsContent value="seller">
              <div className="rounded-xl border p-5 bg-card text-sm space-y-1">
                <div className="font-medium">{seller?.full_name ?? "—"}</div>
                <div className="text-muted-foreground">{seller?.email ?? "—"} • {seller?.phone ?? "—"} • {seller?.country ?? "—"}</div>
              </div>
            </TabsContent>

            <TabsContent value="company">
              <div className="rounded-xl border p-5 bg-card text-sm space-y-2">
                {!company && <div className="text-muted-foreground">No company linked.</div>}
                {company && (
                  <>
                    <div className="text-base font-medium">{company.name}</div>
                    <div className="text-muted-foreground">{company.country ?? "—"} {company.website ? `• ${company.website}` : ''}</div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-2">
                      <div><span className="text-muted-foreground">Legal Name:</span> {company.legal_name ?? '—'}</div>
                      <div><span className="text-muted-foreground">Reg No:</span> {company.registration_no ?? '—'}</div>
                      <div><span className="text-muted-foreground">VAT:</span> {company.vat_number ?? '—'}</div>
                      <div className="col-span-2"><span className="text-muted-foreground">Address:</span> {[company.address_line1, company.address_line2, company.city, company.region, company.postal_code, company.country].filter(Boolean).join(', ') || '—'}</div>
                    </div>
                  </>
                )}
              </div>
            </TabsContent>

            <TabsContent value="documents">
              <div className="rounded-xl border p-5 bg-card text-sm space-y-4">
                {!seller?.company_id && <div className="text-muted-foreground">No company linked.</div>}
                {seller?.company_id && (
                  <>
                    <div>
                      <div className="font-medium mb-2">Required Documents</div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {([
                          { key: 'photo_id', label: 'Photo ID' },
                          { key: 'company_registration', label: 'Company Registration Document' },
                          { key: 'proof_of_address', label: 'Proof of Address' },
                          { key: 'vat_certificate', label: 'VAT Certificate (Optional)' },
                        ] as const).map((spec) => {
                          const match = (docs || []).find((d: any) => String(d.type).toLowerCase() === spec.key);
                          return (
                            <div key={spec.key} className="rounded-lg border p-3">
                              <div className="flex items-center justify-between">
                                <div>{spec.label}</div>
                                <Badge variant={match ? (match.status === 'verified' ? 'secondary' : match.status === 'rejected' ? 'destructive' : 'outline') : 'outline'}>
                                  {match ? match.status : 'not uploaded'}
                                </Badge>
                              </div>
                              <div className="mt-2">
                                {match ? (
                                  <div className="flex gap-2">
                                    <Button asChild size="sm" variant="outline"><a href={match.file_url} target="_blank" rel="noreferrer">Preview</a></Button>
                                    <Button asChild size="sm"><a href={match.file_url} target="_blank" rel="noreferrer" download>Download</a></Button>
                                  </div>
                                ) : (
                                  <div className="text-xs text-muted-foreground">Document not uploaded</div>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {docs && docs.length > 0 && (
                      <div className="space-y-2">
                        <div className="font-medium">All Documents</div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {docs.map((d: any) => (
                            <div key={d.id} className="rounded-lg border p-3 bg-card">
                              <div className="flex items-center justify-between">
                                <div className="font-medium capitalize">{String(d.type).replace(/_/g,' ')}</div>
                                <Badge variant={d.status === 'verified' ? 'secondary' : d.status === 'rejected' ? 'destructive' : 'outline'}>{d.status}</Badge>
                              </div>
                              <div className="text-xs text-muted-foreground mt-1">{d.file_name}</div>
                              <div className="text-xs text-muted-foreground">Uploaded {new Date(d.uploaded_at).toLocaleDateString()}</div>
                              <div className="mt-2 flex gap-2">
                                <Button asChild size="sm" variant="outline"><a href={d.file_url} target="_blank" rel="noreferrer">Preview</a></Button>
                                <Button asChild size="sm"><a href={d.file_url} target="_blank" rel="noreferrer" download>Download</a></Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            </TabsContent>

            <TabsContent value="restrictions">
              <div className="rounded-xl border p-5 bg-card text-sm">
                {restrictions && restrictions.length ? (
                  <div>
                    <div className="mb-2">Type: {restrictions[0].restriction_type}</div>
                    <div className="text-muted-foreground">{restrictions[0].countries?.join(", ")}</div>
                  </div>
                ) : "No restrictions"}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}


