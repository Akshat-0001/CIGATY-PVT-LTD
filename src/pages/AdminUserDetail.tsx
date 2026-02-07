import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

async function fetchProfile(id: string) {
  const { data } = await (supabase as any)
    .from('profiles')
    .select('id, full_name, status, role, email, phone, address, country, company_id, company_name, gst_number, vat_certificate, document1, document2, document3, created_at')
    .eq('id', id)
    .single();
  return data as any;
}
async function fetchCompany(id: string|null) {
  if (!id) return null; const { data } = await (supabase as any).from('companies').select('id, name').eq('id', id).single(); return data as any;
}
async function fetchDocs(userId: string) {
  const { data } = await (supabase as any).from('kyc_documents').select('*').eq('user_id', userId).order('uploaded_at',{ascending:false});
  return (data as any[])||[];
}

const docUrl = (path?: string|null) => path ? `https://${import.meta.env.VITE_SUPABASE_URL?.replace('https://','')}/storage/v1/object/public/company-docs/${path}` : '#';

export default function AdminUserDetail(){
  const { id } = useParams();
  const { data: profile, isLoading } = useQuery({ queryKey:['user_prof', id], queryFn: ()=> fetchProfile(id as string), enabled: !!id });
  const { data: company } = useQuery({ queryKey:['user_comp', profile?.company_id], queryFn: ()=> fetchCompany(profile?.company_id??null), enabled: !!profile?.company_id });
  const { data: docs } = useQuery({ queryKey:['user_docs', id], queryFn: ()=> fetchDocs(id as string), enabled: !!id });
  if (isLoading || !profile) return <div className="container py-8 px-4">Loading…</div>;

  const need = (key: string)=> (docs||[]).find((d:any)=> String(d.type).toLowerCase()===key);

  return (
    <div className="container py-8 px-4 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-semibold">{profile.full_name || 'User'}</h1>
          <div className="text-sm text-muted-foreground">User Verification • {new Date(profile.created_at ?? Date.now()).toLocaleString()}</div>
        </div>
        <div className="flex gap-2">
          <Button onClick={async ()=>{ await (supabase as any).rpc('approve_user',{ _user_id: profile.id }); history.back();}}>Approve</Button>
          <Button variant="destructive" onClick={async ()=>{ await (supabase as any).rpc('reject_user',{ _user_id: profile.id, _reason: 'Insufficient docs' }); history.back();}}>Reject</Button>
          <Button variant="outline" asChild><Link to="/admin/users">Back</Link></Button>
        </div>
      </div>

      {/* Overview cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="rounded-xl border p-5 bg-card space-y-3">
          <div className="text-sm font-medium">Account</div>
          <div className="text-sm"><span className="text-muted-foreground">Status:</span> <Badge variant={profile.status==='approved'?'secondary': profile.status==='rejected'?'destructive':'outline'}>{profile.status}</Badge></div>
          <div className="text-sm"><span className="text-muted-foreground">Role:</span> {profile.role ?? '—'}</div>
          <div className="text-sm"><span className="text-muted-foreground">Email:</span> {profile.email ?? '—'}</div>
          <div className="text-sm"><span className="text-muted-foreground">Phone:</span> {profile.phone ?? '—'}</div>
          <div className="text-sm"><span className="text-muted-foreground">Country:</span> {profile.country ?? '—'}</div>
          <div className="text-sm"><span className="text-muted-foreground">Address:</span> {profile.address ?? '—'}</div>
        </div>

        <div className="rounded-xl border p-5 bg-card space-y-3">
          <div className="text-sm font-medium">Company</div>
          <div className="text-sm"><span className="text-muted-foreground">Name:</span> {company?.name || profile.company_name || '—'}</div>
          <div className="text-sm"><span className="text-muted-foreground">Registration No:</span> {profile.gst_number || '—'}</div>
          <div className="text-sm"><span className="text-muted-foreground">Company ID:</span> {profile.company_id || '—'}</div>
        </div>

        <div className="rounded-xl border p-5 bg-card space-y-3">
          <div className="text-sm font-medium">Quick Actions</div>
          <div className="text-xs text-muted-foreground">Open legacy uploads stored on profile</div>
          <div className="flex flex-wrap gap-2">
            <a className="underline text-sm" href={docUrl(profile.document1)} target="_blank">Doc 1</a>
            <a className="underline text-sm" href={docUrl(profile.document2)} target="_blank">Doc 2</a>
            <a className="underline text-sm" href={docUrl(profile.document3)} target="_blank">Doc 3</a>
            <a className="underline text-sm" href={docUrl(profile.vat_certificate)} target="_blank">VAT Cert</a>
          </div>
        </div>
      </div>

      {/* Required documents */}
      <div className="rounded-xl border p-5 bg-card">
        <div className="flex items-center justify-between mb-3">
          <div className="text-base font-medium">Required Documents</div>
          <div className="text-sm text-muted-foreground">Open all
            <Button size="sm" variant="ghost" className="ml-2" onClick={()=>{
              ['photo_id','company_registration_doc','proof_of_address','vat_certificate'].forEach(t=>{
                const m = need(t);
                if (m?.file_url) window.open(docUrl(m.file_url), '_blank');
              });
            }}>Open all</Button>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {([
            { key: 'photo_id', label: 'Photo ID' },
            { key: 'company_registration_doc', label: 'Company Registration Document' },
            { key: 'proof_of_address', label: 'Proof of Address' },
            { key: 'vat_certificate', label: 'VAT Certificate (Optional)' },
          ] as const).map(spec => {
            const m = need(spec.key);
            return (
              <div key={spec.key} className="rounded-lg border p-4 bg-card">
                <div className="flex items-center justify-between">
                  <div className="font-medium">{spec.label}</div>
                  <Badge variant={m ? (m.status==='verified'?'secondary': m.status==='rejected'?'destructive':'outline') : 'outline'}>
                    {m? m.status : 'not uploaded'}
                  </Badge>
                </div>
                <div className="mt-2">
                  {m?.file_url ? (
                    <div className="flex gap-2">
                      <Button asChild size="sm" variant="outline"><a href={docUrl(m.file_url)} target="_blank" rel="noreferrer">Preview</a></Button>
                      <Button asChild size="sm"><a href={docUrl(m.file_url)} target="_blank" rel="noreferrer" download>Download</a></Button>
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

      {/* All documents */}
      {docs && docs.length>0 && (
        <div className="rounded-xl border p-5 bg-card">
          <div className="font-medium mb-2">All Documents</div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {docs.map((d:any)=> (
              <div key={d.id} className="rounded-lg border p-3">
                <div className="flex items-center justify-between">
                  <div className="font-medium capitalize">{String(d.type).replace(/_/g,' ')}</div>
                  <Badge variant={d.status==='verified'?'secondary': d.status==='rejected'?'destructive':'outline'}>{d.status}</Badge>
                </div>
                <div className="text-xs text-muted-foreground mt-1">{d.file_name}</div>
                <div className="mt-2 flex gap-2">
                  <Button asChild size="sm" variant="outline"><a href={docUrl(d.file_url)} target="_blank" rel="noreferrer">Preview</a></Button>
                  <Button asChild size="sm"><a href={docUrl(d.file_url)} target="_blank" rel="noreferrer" download>Download</a></Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
