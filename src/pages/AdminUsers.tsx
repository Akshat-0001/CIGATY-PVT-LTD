import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Checkbox } from "@/components/ui/checkbox";
import { useNavigate } from "react-router-dom";
import { ChevronDown } from "lucide-react";

async function fetchUsers(status: string) {
  try {
    const { data, error } = await (supabase as any).rpc('admin_list_users', { _status: status });
    if (error) throw error;
    if (data && data.length) return data as any[];
  } catch {}
  // Fallback: profiles with status
  const { data: prof } = await (supabase as any)
    .from('profiles')
    .select('id, full_name, status, email, phone, country, address, company_id, company_name, gst_number, created_at')
    .eq('status', status)
    .order('created_at', { ascending: false })
    .limit(300);
  return (prof as any[]) || [];
}

async function fetchCompanies(ids: string[]) {
  if (!ids.length) return [] as any[];
  const { data } = await (supabase as any)
    .from('companies')
    .select('id, name')
    .in('id', ids);
  return (data as any[]) || [];
}

async function fetchRequiredDocs(userIds: string[]) {
  if (!userIds.length) return [] as any[];
  const { data } = await (supabase as any)
    .from('kyc_documents')
    .select('user_id, type, file_url, status')
    .in('user_id', userIds)
    .in('type', ['photo_id','company_registration_doc','proof_of_address','vat_certificate']);
  return (data as any[]) || [];
}

const DOC_LABEL: Record<string,string> = {
  photo_id: 'Photo ID',
  company_registration_doc: 'Company Reg',
  proof_of_address: 'Proof of Address',
  vat_certificate: 'VAT Cert',
};

const publicUrl = (path?: string|null) => path ? `https://${import.meta.env.VITE_SUPABASE_URL?.replace('https://','')}/storage/v1/object/public/company-docs/${path}` : '#';

export default function AdminUsers() {
  const navigate = useNavigate();
  const [statusTab, setStatusTab] = useState('pending');
  const [search, setSearch] = useState('');
  const { data, isLoading } = useQuery<any[]>({ queryKey: ['admin_users', statusTab], queryFn: () => fetchUsers(statusTab), placeholderData: (p)=>p??[] });
  const companyIds = useMemo(()=> Array.from(new Set((data??[]).map((r:any)=>r.company_id).filter(Boolean))),[data]);
  const userIds = useMemo(()=> (data??[]).map((r:any)=> r.user_id ?? r.id).filter(Boolean), [data]);

  const { data: companies } = useQuery<any[]>({ queryKey: ['admin_users_companies', statusTab, companyIds.join(',')], queryFn: ()=> fetchCompanies(companyIds), enabled: companyIds.length>0, placeholderData: (p)=>p??[] });
  const { data: docs } = useQuery<any[]>({ queryKey: ['admin_users_docs', statusTab, userIds.join(',')], queryFn: ()=> fetchRequiredDocs(userIds), enabled: userIds.length>0, placeholderData: (p)=>p??[] });

  const companyMap = useMemo(()=>{ const m:Record<string,any>={}; (companies||[]).forEach((c:any)=>m[c.id]=c); return m;},[companies]);
  const docMap = useMemo(()=>{
    const m: Record<string, Record<string, any>> = {};
    (docs||[]).forEach((d:any)=>{
      const uid = d.user_id;
      if (!m[uid]) m[uid] = {} as any;
      m[uid][d.type] = d;
    });
    return m;
  },[docs]);

  const rows = useMemo(()=>{
    const src = (data||[]) as any[];
    return src.filter(r=>{
      const name = (r.full_name||'').toLowerCase();
      const email = (r.email||'').toLowerCase();
      const company = (r.company_name||'').toLowerCase();
      return !search || name.includes(search.toLowerCase()) || email.includes(search.toLowerCase()) || company.includes(search.toLowerCase());
    });
  },[data,search]);

  const openAllDocs = (uid: string) => {
    const d = docMap[uid] || {};
    ['photo_id','company_registration_doc','proof_of_address','vat_certificate'].forEach(t => {
      const u = d[t]?.file_url ? publicUrl(d[t].file_url) : null;
      if (u && u !== '#') window.open(u, '_blank');
    });
  };

  const isPending = statusTab === 'pending';
  const headerCols = isPending ? "grid grid-cols-[2fr,1.6fr,1.2fr,1.8fr,2fr,auto]" : "grid grid-cols-[2fr,1.6fr,1.2fr,1.8fr,2fr]";
  const rowCols = isPending ? "grid grid-cols-[2fr,1.6fr,1.2fr,1.8fr,2fr,auto]" : "grid grid-cols-[2fr,1.6fr,1.2fr,1.8fr,2fr]";

  return (
    <div className="container py-4 md:py-8 px-4 space-y-4 md:space-y-6">
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <h1 className="text-xl sm:text-2xl md:text-3xl font-display font-semibold">Admin • User Verification</h1>
        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="gap-2 w-full md:w-auto">Status: {statusTab} <ChevronDown className="h-4 w-4"/></Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {['pending','approved','rejected'].map(s=> (
                <DropdownMenuItem key={s} onClick={()=>setStatusTab(s)} className={statusTab===s? 'font-semibold':''}>{s}</DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div className="flex items-center gap-2 mb-4">
        <Input placeholder="Search users" value={search} onChange={(e)=>setSearch(e.target.value)} className="w-full md:max-w-sm"/>
      </div>

      <div className="rounded-xl border bg-card overflow-hidden">
        <div className={`hidden md:${headerCols.replace('grid ', '')} gap-4 p-4 border-b bg-muted/40 font-medium text-sm`}>
          <div>User</div>
          <div>Company</div>
          <div>Reg No</div>
          <div>Location</div>
          <div>Docs</div>
          {isPending && <div>Actions</div>}
        </div>
        {isLoading && <div className="p-6 text-muted-foreground">Loading…</div>}
        {!isLoading && rows.length===0 && <div className="p-6 text-muted-foreground">No users</div>}
        {rows.map((r:any)=>{
          const uid = r.user_id ?? r.id;
          const c = r.company_id ? companyMap[r.company_id] : null;
          const d = docMap[uid] || {};
          const uploadedCount = ['photo_id','company_registration_doc','proof_of_address','vat_certificate'].filter(t=> d[t]?.file_url).length;
          const chip = (t: string) => {
            const entry = d[t];
            const color = entry ? (entry.status==='verified'?'secondary': entry.status==='rejected'?'destructive':'outline') : 'outline';
            const href = entry?.file_url ? publicUrl(entry.file_url) : undefined;
            return href ? (
              <a key={t} href={href} target="_blank" rel="noreferrer" className="inline-flex items-center px-2 py-1 rounded border text-xs mr-1 hover:underline">
                {DOC_LABEL[t]}
              </a>
            ) : (
              <Badge key={t} variant={color} className="mr-1 text-xs">{DOC_LABEL[t]}</Badge>
            );
          };
          const profileStatus = r.profile_status || r.status || 'pending';
          return (
            <div key={uid} className={`md:${rowCols.replace('grid ', '')} grid-cols-1 gap-4 p-4 border-b last:border-b-0 hover:bg-muted/30`}>
              <div className="min-w-0">
                <div className="flex items-center justify-between mb-2">
                  <div className="truncate font-medium">{r.full_name || '—'}</div>
                  <Badge variant={profileStatus==='approved'?'secondary': profileStatus==='rejected'?'destructive':'outline'} className="shrink-0 ml-2">{profileStatus}</Badge>
                </div>
                <div className="text-xs text-muted-foreground truncate">{r.email || '—'}</div>
                <div className="text-xs text-muted-foreground truncate">{r.phone || '—'}</div>
              </div>
              <div className="min-w-0">
                <div className="text-xs text-muted-foreground md:hidden">Company</div>
                <div className="truncate">{c?.name || r.company_name || '—'}</div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground md:hidden mb-1">Reg No</div>
                <div>{r.registration_no || r.gst_number || '—'}</div>
              </div>
              <div className="min-w-0">
                <div className="text-xs text-muted-foreground md:hidden mb-1">Location</div>
                <div className="truncate text-sm">{r.country || '—'}</div>
                <div className="truncate text-xs text-muted-foreground">{r.address || '—'}</div>
              </div>
              <div className="flex flex-col gap-2">
                <div className="text-xs text-muted-foreground md:hidden">Documents</div>
                <div className="flex items-center flex-wrap gap-1">
                  {['photo_id','company_registration_doc','proof_of_address','vat_certificate'].map(chip)}
                  <span className="text-xs text-muted-foreground ml-2">{uploadedCount}/4</span>
                </div>
                <Button size="sm" variant="ghost" className="w-full md:w-auto" onClick={()=> openAllDocs(uid)}>Open all</Button>
              </div>
              {isPending && (
                <div className="flex flex-col sm:flex-row gap-2">
                  <Button size="sm" className="w-full sm:w-auto" onClick={async ()=>{ await (supabase as any).rpc('approve_user',{ _user_id: uid }); location.reload();}}>Approve</Button>
                  <Button size="sm" variant="destructive" className="w-full sm:w-auto" onClick={async ()=>{ await (supabase as any).rpc('reject_user',{ _user_id: uid, _reason: 'Not eligible' }); location.reload();}}>Reject</Button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
