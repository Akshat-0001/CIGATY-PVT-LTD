import { supabase } from '@/integrations/supabase/client';

// Auth helper functions
export const authHelpers = {
  // Sign up new user
  async signUp(email: string, password: string, metadata?: Record<string, any>) {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: metadata,
          emailRedirectTo: `${window.location.origin}/application-received`,
        },
      });
      
      if (error) throw error;
      
      // Verify user was created
      if (!data.user) {
        throw new Error('User creation failed - no user returned');
      }
      
      return { data, error: null };
    } catch (error: any) {
      return { data: null, error: error.message };
    }
  },

  // Sign in existing user
  async signIn(email: string, password: string, rememberMe: boolean = true) {
    try {
      // Supabase client is configured with localStorage by default (persistent)
      // Sessions will persist across browser restarts
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) throw error;
      return { data, error: null };
    } catch (error: any) {
      return { data: null, error: error.message };
    }
  },

  // Sign out
  async signOut() {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      return { error: null };
    } catch (error: any) {
      return { error: error.message };
    }
  },

  // Get current user
  async getCurrentUser() {
    try {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error) throw error;
      return { user, error: null };
    } catch (error: any) {
      return { user: null, error: error.message };
    }
  },
};

// Database helper functions
export const dbHelpers = {
  // Upsert user profile with full details
  async upsertProfile(userId: string, profileData: {
    first_name: string;
    middle_name?: string;
    last_name: string;
    primary_phone: string;
    email?: string;
    country?: string;
    address?: string;
  }) {
    try {
      const fullName = `${profileData.first_name}${profileData.middle_name ? ` ${profileData.middle_name}` : ''} ${profileData.last_name}`.trim();
      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: userId,
          full_name: fullName,
          phone: profileData.primary_phone,
          email: profileData.email ?? null,
          country: profileData.country ?? null,
          address: profileData.address ?? null,
          currency: 'EUR',
          kyc_status: 'pending',
          status: 'pending',
          role: 'user',
        }, { onConflict: 'id' });
      if (error) throw error;
      return { error: null };
    } catch (error: any) {
      return { error: error.message };
    }
  },

  // Insert company details and link to profile
  async insertCompany(userId: string, companyData: {
    company_name: string;
    address_line1: string;
    address_line2?: string;
    city: string;
    zip_code?: string;
    country: string;
    registration_number: string;
    vat_number?: string;
    director_name?: string;
  }) {
    try {
      const { data, error } = await (supabase as any).rpc('insert_company_for_user', { _user_id: userId, _name: companyData.company_name });
      if (error) throw error;
      const cid = data as string;
      // Mirror a few fields into profile for back-compat
      await supabase
        .from('profiles')
        .update({
          gst_number: companyData.registration_number || null,
          country: companyData.country || null,
        })
        .eq('id', userId);
      return { data: { id: cid }, error: null };
    } catch (error: any) {
      return { data: null, error: error.message };
    }
  },

  // Insert document record (new schema)
  async insertDocument(params: {
    user_id: string;
    company_id: string | null;
    type: 'photo_id' | 'company_registration_doc' | 'proof_of_address' | 'vat_certificate';
    file_url: string;
    file_name?: string;
    mime_type?: string;
  }) {
    try {
      const stepMap: Record<string, number> = {
        photo_id: 1,
        company_registration_doc: 2,
        proof_of_address: 3,
        vat_certificate: 4,
      };
      const payload: any = {
        user_id: params.user_id,
        company_id: params.company_id,
        type: params.type,
        file_url: params.file_url,
        file_name: params.file_name ?? null,
        mime_type: params.mime_type ?? null,
        status: 'pending',
      };
      // Add step if column exists (best-effort; DB will ignore unknown keys)
      payload.step = stepMap[params.type] || 1;

      const { data, error } = await supabase
        .from('kyc_documents')
        .insert([payload])
        .select('id')
        .single();
      if (error) throw error;
      return { data, error: null };
    } catch (error: any) {
      return { data: null, error: error.message };
    }
  },
};

// Storage helper functions
export const storageHelpers = {
  // Upload document to documents bucket
  async uploadDocument(userId: string, file: File, docType: string) {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${userId}/${docType}_${Date.now()}.${fileExt}`;
      
      const { data, error } = await supabase.storage
        .from('company-docs')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false,
        });

      if (error) throw error;

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('company-docs')
        .getPublicUrl(fileName);

      return { data: { path: fileName, url: urlData.publicUrl, fileName }, error: null };
    } catch (error: any) {
      return { data: null, error: error.message };
    }
  },

  // Get document URL
  getDocumentUrl(path: string) {
    const { data } = supabase.storage
      .from('company-docs')
      .getPublicUrl(path);
    return data.publicUrl;
  },

  // Delete document
  async deleteDocument(path: string) {
    try {
      const { error } = await supabase.storage
        .from('company-docs')
        .remove([path]);

      if (error) throw error;
      return { error: null };
    } catch (error: any) {
      return { error: error.message };
    }
  },
};
