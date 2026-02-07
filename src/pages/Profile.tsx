import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { authHelpers } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import {
  Mail,
  Phone,
  MapPin,
  Building2,
  FileText,
  ShieldCheck,
  CalendarClock,
  LogOut,
  Edit2,
  Save,
  X,
  User,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Lock,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

interface ProfileData {
  id: string;
  full_name: string | null;
  email: string | null;
  phone: string | null;
  currency: string;
  role: string;
  kyc_status: string;
  company_id: string | null;
  company_name: string | null;
  company_country: string | null;
  created_at: string;
}

async function fetchProfile() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  // Fetch profile with company information
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select(`
      id,
      full_name,
      currency,
      role,
      kyc_status,
      company_id,
      created_at,
      companies (
        id,
        name,
        country_id,
        countries (
          name
        )
      )
    `)
    .eq('id', user.id)
    .single();

  if (profileError) throw profileError;

  // Get email from auth.users
  const email = user.email;

  // Get phone from auth.users metadata or profile if available
  const phone = user.user_metadata?.phone || null;

  return {
    id: profile.id,
    full_name: profile.full_name,
    email: email || null,
    phone: phone,
    currency: profile.currency || 'EUR',
    role: profile.role || 'user',
    kyc_status: profile.kyc_status || 'pending',
    company_id: profile.company_id,
    company_name: profile.companies?.name || null,
    company_country: profile.companies?.countries?.name || null,
    created_at: profile.created_at,
  } as ProfileData;
}

async function fetchKycDocuments(userId: string) {
  const { data, error } = await supabase
    .from('kyc_documents')
    .select('*')
    .eq('user_id', userId)
    .order('step', { ascending: true });

  if (error) throw error;
  return data || [];
}

async function fetchCountries() {
  const { data, error } = await supabase
    .from('countries')
    .select('id, name, iso2')
    .order('name');

  if (error) throw error;
  return data || [];
}

async function updateProfile(updates: Partial<ProfileData>) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data, error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', user.id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export default function Profile() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState<Partial<ProfileData>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Fetch profile data
  const { data: profile, isLoading: isLoadingProfile, error: profileError } = useQuery({
    queryKey: ['profile'],
    queryFn: fetchProfile,
    staleTime: 60_000,
  });

  // Fetch KYC documents
  const { data: kycDocuments, isLoading: isLoadingDocuments } = useQuery({
    queryKey: ['kyc_documents', profile?.id],
    queryFn: () => fetchKycDocuments(profile!.id),
    enabled: !!profile?.id,
  });

  // Fetch countries for select dropdown
  const { data: countries } = useQuery({
    queryKey: ['countries'],
    queryFn: fetchCountries,
    staleTime: 300_000, // Cache for 5 minutes
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: updateProfile,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      toast({
        title: 'Profile updated',
        description: 'Your profile has been successfully updated.',
      });
      setEditMode(false);
      setErrors({});
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update profile.',
        variant: 'destructive',
      });
    },
  });

  // Initialize form data when profile loads
  useEffect(() => {
    if (profile && !editMode) {
      setFormData({
        full_name: profile.full_name || '',
        currency: profile.currency || 'EUR',
      });
    }
  }, [profile, editMode]);

  const handleEdit = () => {
    setFormData({
      full_name: profile?.full_name || '',
      currency: profile?.currency || 'EUR',
    });
    setEditMode(true);
    setErrors({});
  };

  const handleCancel = () => {
    setFormData({});
    setEditMode(false);
    setErrors({});
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.full_name || formData.full_name.trim() === '') {
      newErrors.full_name = 'Full name is required';
    }

    if (!formData.currency) {
      newErrors.currency = 'Currency is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) {
      toast({
        title: 'Validation Error',
        description: 'Please fix the errors before saving.',
        variant: 'destructive',
      });
      return;
    }

    const updates: Partial<ProfileData> = {};
    if (formData.full_name !== undefined) updates.full_name = formData.full_name;
    if (formData.currency !== undefined) updates.currency = formData.currency;

    updateMutation.mutate(updates);
  };

  const handleLogout = async () => {
    const { error } = await authHelpers.signOut();
    if (!error) navigate('/login', { replace: true });
  };

  const kycStatusBadge = useMemo(() => {
    const status = profile?.kyc_status?.toLowerCase() || 'pending';
    switch (status) {
      case 'approved':
        return (
          <Badge className="bg-success/20 text-success border-success/30">
            <CheckCircle2 className="h-3 w-3 mr-1" />
            Verified
          </Badge>
        );
      case 'rejected':
        return (
          <Badge className="bg-destructive/20 text-destructive border-destructive/30">
            <AlertCircle className="h-3 w-3 mr-1" />
            Rejected
          </Badge>
        );
      default:
        return (
          <Badge className="bg-warning/20 text-warning border-warning/30">
            <AlertCircle className="h-3 w-3 mr-1" />
            Pending
          </Badge>
        );
    }
  }, [profile?.kyc_status]);

  const roleBadge = useMemo(() => {
    const role = profile?.role?.toLowerCase() || 'user';
    return (
      <Badge className="bg-primary/20 text-primary border-primary/30 capitalize">
        {role}
      </Badge>
    );
  }, [profile?.role]);

  if (isLoadingProfile) {
    return (
      <div className="container py-10">
        <div className="space-y-6">
          <Skeleton className="h-10 w-64" />
          <div className="grid gap-6 md:grid-cols-2">
            <Skeleton className="h-64" />
            <Skeleton className="h-64" />
          </div>
        </div>
      </div>
    );
  }

  if (profileError) {
    return (
      <div className="container py-10">
        <Card className="max-w-xl mx-auto">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-destructive">
              <AlertCircle className="h-5 w-5" />
              <p className="font-semibold">Error loading profile</p>
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              {profileError instanceof Error ? profileError.message : 'Failed to load profile'}
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="container py-10">
        <Card className="max-w-xl mx-auto">
          <CardContent className="pt-6">
            <p className="text-muted-foreground">No profile found.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container py-4 md:py-8 lg:py-10 px-4 space-y-4 md:space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-display font-semibold mb-2">My Profile</h1>
          <p className="text-muted-foreground">Manage your account information</p>
        </div>
        <div className="flex items-center gap-2">
          {!editMode && (
            <Button variant="outline" onClick={handleEdit} className="gap-2">
              <Edit2 className="h-4 w-4" />
              Edit Profile
            </Button>
          )}
          {editMode && (
            <>
              <Button
                variant="outline"
                onClick={handleCancel}
                disabled={updateMutation.isPending}
                className="gap-2"
              >
                <X className="h-4 w-4" />
                Cancel
              </Button>
              <Button
                onClick={handleSave}
                disabled={updateMutation.isPending}
                className="gap-2"
              >
                {updateMutation.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Save className="h-4 w-4" />
                )}
                Save Changes
              </Button>
            </>
          )}
          <Button variant="outline" onClick={handleLogout} className="gap-2">
            <LogOut className="h-4 w-4" />
            Logout
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Personal Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5 text-primary" />
              Personal Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {editMode ? (
              <>
                <div className="space-y-2">
                  <Label htmlFor="full_name" className="flex items-center gap-2">
                    <User className="h-4 w-4 text-primary" />
                    Full Name
                  </Label>
                  <Input
                    id="full_name"
                    value={formData.full_name || ''}
                    onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                    className={cn(errors.full_name && 'border-destructive')}
                    placeholder="Enter your full name"
                  />
                  {errors.full_name && (
                    <p className="text-xs text-destructive">{errors.full_name}</p>
                  )}
                </div>
              </>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <User className="h-4 w-4 text-primary shrink-0" />
                  <div className="flex-1">
                    <span className="text-sm text-muted-foreground">Full Name</span>
                    <p className="font-medium">{profile.full_name || '—'}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Email - Read-only */}
            <div className="flex items-center gap-3">
              <Mail className="h-4 w-4 text-primary shrink-0" />
              <div className="flex-1">
                <span className="text-sm text-muted-foreground flex items-center gap-2">
                  Email
                  <Badge className="bg-success/20 text-success border-success/30 text-xs">
                    <CheckCircle2 className="h-3 w-3 mr-1" />
                    Verified
                  </Badge>
                </span>
                <p className="font-medium">{profile.email || '—'}</p>
              </div>
            </div>

            {/* Phone - Display only (from metadata) */}
            {profile.phone && (
              <div className="flex items-center gap-3">
                <Phone className="h-4 w-4 text-primary shrink-0" />
                <div className="flex-1">
                  <span className="text-sm text-muted-foreground">Phone</span>
                  <p className="font-medium">{profile.phone}</p>
                </div>
              </div>
            )}

            {/* Member Since - Read-only */}
            <div className="flex items-center gap-3">
              <CalendarClock className="h-4 w-4 text-primary shrink-0" />
              <div className="flex-1">
                <span className="text-sm text-muted-foreground">Member Since</span>
                <p className="font-medium">
                  {profile.created_at
                    ? format(new Date(profile.created_at), 'MMM dd, yyyy')
                    : '—'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Account Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-primary" />
              Account Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Role - Display only */}
            <div className="flex items-center gap-3">
              <ShieldCheck className="h-4 w-4 text-primary shrink-0" />
              <div className="flex-1">
                <span className="text-sm text-muted-foreground">Role</span>
                <div className="mt-1">{roleBadge}</div>
              </div>
            </div>

            {/* KYC Status - Display only */}
            <div className="flex items-center gap-3">
              <ShieldCheck className="h-4 w-4 text-primary shrink-0" />
              <div className="flex-1">
                <span className="text-sm text-muted-foreground">Verification Status</span>
                <div className="mt-1">{kycStatusBadge}</div>
              </div>
            </div>

            {/* Currency - Editable */}
            {editMode ? (
              <div className="space-y-2">
                <Label htmlFor="currency" className="flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-primary" />
                  Currency
                </Label>
                <select
                  id="currency"
                  value={formData.currency || 'EUR'}
                  onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                  className={cn(
                    'flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
                    errors.currency && 'border-destructive'
                  )}
                >
                  <option value="EUR">EUR (€)</option>
                  <option value="USD">USD ($)</option>
                  <option value="GBP">GBP (£)</option>
                  <option value="JPY">JPY (¥)</option>
                  <option value="CNY">CNY (¥)</option>
                </select>
                {errors.currency && (
                  <p className="text-xs text-destructive">{errors.currency}</p>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <ShieldCheck className="h-4 w-4 text-primary shrink-0" />
                <div className="flex-1">
                  <span className="text-sm text-muted-foreground">Currency</span>
                  <p className="font-medium">{profile.currency || 'EUR'}</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Company Information */}
        {profile.company_name && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5 text-primary" />
                Company Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-3">
                <Building2 className="h-4 w-4 text-primary shrink-0" />
                <div className="flex-1">
                  <span className="text-sm text-muted-foreground">Company Name</span>
                  <p className="font-medium">{profile.company_name}</p>
                </div>
              </div>
              {profile.company_country && (
                <div className="flex items-center gap-3">
                  <MapPin className="h-4 w-4 text-primary shrink-0" />
                  <div className="flex-1">
                    <span className="text-sm text-muted-foreground">Country</span>
                    <p className="font-medium">{profile.company_country}</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Documents Section */}
        <Card className={cn(profile.company_name ? '' : 'md:col-span-2')}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lock className="h-5 w-5 text-primary" />
              Verified Documents
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              These documents have been verified and cannot be edited
            </p>
          </CardHeader>
          <CardContent>
            {isLoadingDocuments ? (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {[1, 2, 3, 4].map((i) => (
                  <Skeleton key={i} className="h-32" />
                ))}
              </div>
            ) : kycDocuments && kycDocuments.length > 0 ? (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {kycDocuments.map((doc: any, index: number) => (
                  <DocCard
                    key={doc.id}
                    label={`Document ${index + 1}`}
                    path={doc.file_url}
                    status={doc.status}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p className="text-sm">No documents uploaded yet</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function DocCard({ label, path, status }: { label: string; path: string | null; status?: string }) {
  const isVerified = status === 'approved';
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL?.replace('https://', '');

  return (
    <Card className="border-l-4 border-l-primary/30">
      <CardContent className="pt-4">
        <div className="flex items-center gap-2 mb-3">
          <FileText className="h-4 w-4 text-primary" />
          <span className="text-sm font-medium">{label}</span>
        </div>
        {path ? (
          <div className="space-y-2">
            <a
              href={`https://${supabaseUrl}/storage/v1/object/public/company-docs/${path}`}
              target="_blank"
              rel="noreferrer"
              className="text-sm text-primary hover:underline flex items-center gap-1"
            >
              View Document
            </a>
            {isVerified && (
              <Badge className="bg-success/20 text-success border-success/30 text-xs">
                <CheckCircle2 className="h-3 w-3 mr-1" />
                Verified
              </Badge>
            )}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">Not uploaded</p>
        )}
      </CardContent>
    </Card>
  );
}
