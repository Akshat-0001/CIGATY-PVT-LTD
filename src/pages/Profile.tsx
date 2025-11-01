import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import Button from '@/components/forms/Button';
import { authHelpers } from '@/lib/supabase';
import { Mail, Phone, MapPin, Building2, FileText, ShieldCheck, CalendarClock, LogOut } from 'lucide-react';

interface ProfileRow {
  id: string;
  full_name: string | null;
  email: string | null;
  phone: string | null;
  country: string | null;
  address: string | null;
  company_name: string | null;
  gst_number: string | null;
  vat_certificate: string | null;
  document1: string | null;
  document2: string | null;
  document3: string | null;
  status: string | null;
  role: string | null;
  created_at: string | null;
}

export default function Profile() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [profile, setProfile] = useState<ProfileRow | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        if (sessionError || !session) {
          navigate('/login', { replace: true });
          return;
        }
        const userId = session.user.id;
        const { data, error } = await supabase
          .from('profiles')
          .select('id, full_name, email, phone, country, address, company_name, gst_number, vat_certificate, document1, document2, document3, status, role, created_at')
          .eq('id', userId)
          .single();
        if (error) throw error;
        setProfile(data as ProfileRow);
      } catch (e: any) {
        setError(e.message ?? 'Failed to load profile');
      } finally {
        setLoading(false);
      }
    })();
  }, [navigate]);

  const onLogout = async () => {
    const { error } = await authHelpers.signOut();
    if (!error) navigate('/login', { replace: true });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center py-20">
        <div className="text-muted-foreground">Loading profile…</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center py-20">
        <div className="card max-w-xl w-full">
          <p className="text-wine">{error}</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center py-20">
        <div className="card max-w-xl w-full">
          <p className="text-muted-foreground">No profile found.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-10">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-display font-semibold text-light">My Profile</h1>
          <p className="text-muted-foreground">View your account and company information</p>
        </div>
        <Button variant="outline" onClick={onLogout} className="gap-2">
          <LogOut className="w-4 h-4" /> Logout
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="card">
          <h2 className="text-xl font-display mb-4 text-light">Account</h2>
          <div className="space-y-3 text-sm">
            <div className="flex items-center gap-3"><ShieldCheck className="w-4 h-4 text-gold" /><span className="text-light font-medium">Name:</span><span className="text-muted-foreground">{profile.full_name ?? '-'}</span></div>
            <div className="flex items-center gap-3"><Mail className="w-4 h-4 text-gold" /><span className="text-light font-medium">Email:</span><span className="text-muted-foreground">{profile.email ?? '-'}</span></div>
            <div className="flex items-center gap-3"><Phone className="w-4 h-4 text-gold" /><span className="text-light font-medium">Phone:</span><span className="text-muted-foreground">{profile.phone ?? '-'}</span></div>
            <div className="flex items-center gap-3"><CalendarClock className="w-4 h-4 text-gold" /><span className="text-light font-medium">Member Since:</span><span className="text-muted-foreground">{profile.created_at ? new Date(profile.created_at).toLocaleString() : '-'}</span></div>
            <div className="flex items-center gap-3"><ShieldCheck className="w-4 h-4 text-gold" /><span className="text-light font-medium">Role:</span><span className="text-muted-foreground capitalize">{profile.role ?? '-'}</span></div>
            <div className="flex items-center gap-3"><ShieldCheck className="w-4 h-4 text-gold" /><span className="text-light font-medium">Status:</span><span className="text-muted-foreground capitalize">{profile.status ?? '-'}</span></div>
          </div>
        </div>

        <div className="card">
          <h2 className="text-xl font-display mb-4 text-light">Company</h2>
          <div className="space-y-3 text-sm">
            <div className="flex items-center gap-3"><Building2 className="w-4 h-4 text-gold" /><span className="text-light font-medium">Company:</span><span className="text-muted-foreground">{profile.company_name ?? '-'}</span></div>
            <div className="flex items-center gap-3"><MapPin className="w-4 h-4 text-gold" /><span className="text-light font-medium">Address:</span><span className="text-muted-foreground">{profile.address ?? '-'}</span></div>
            <div className="flex items-center gap-3"><MapPin className="w-4 h-4 text-gold" /><span className="text-light font-medium">Country:</span><span className="text-muted-foreground">{profile.country ?? '-'}</span></div>
            <div className="flex items-center gap-3"><FileText className="w-4 h-4 text-gold" /><span className="text-light font-medium">GST Number:</span><span className="text-muted-foreground">{profile.gst_number ?? '-'}</span></div>
          </div>
        </div>

        <div className="card md:col-span-2">
          <h2 className="text-xl font-display mb-4 text-light">Documents</h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <DocCard label="Trade License" path={profile.document1} />
            <DocCard label="Incorporation Certificate" path={profile.document2} />
            <DocCard label="ID Proof" path={profile.document3} />
            <DocCard label="VAT Certificate" path={profile.vat_certificate} />
          </div>
        </div>
      </div>
    </div>
  );
}

function DocCard({ label, path }: { label: string; path: string | null }) {
  return (
    <div className="border border-dark-light rounded-lg p-4">
      <div className="text-light font-medium mb-2 flex items-center gap-2"><FileText className="w-4 h-4 text-gold" />{label}</div>
      {path ? (
        <a href={`https://${import.meta.env.VITE_SUPABASE_URL?.replace('https://', '')}/storage/v1/object/public/company-docs/${path}`} target="_blank" rel="noreferrer" className="text-gold text-sm hover:text-gold-light">View Document</a>
      ) : (
        <div className="text-muted-foreground text-sm">Not uploaded</div>
      )}
    </div>
  );
}
