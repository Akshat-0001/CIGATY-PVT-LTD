import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://ctinwknfafeshljudolj.supabase.co';
const SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN0aW53a25mYWZlc2hsanVkb2xqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MTg1MTY3MiwiZXhwIjoyMDc3NDI3NjcyfQ.FabQInOhgs_I1GpuNIXTsA1pbqYL3VSJZqn4KnIACC4';

const supabase = createClient(SUPABASE_URL, SERVICE_KEY, {
  auth: { persistSession: false }
});

const DIRECTOR_ID = 'ce39e875-087d-4580-9380-dc1c3c92accf';

async function finalizeSetup() {
  console.log('🔧 Finalizing setup...\n');
  
  // Try to update admin profile
  console.log('👤 Setting up admin profile...\n');
  
  try {
    const { error } = await supabase
      .from('profiles')
      .upsert({
        id: DIRECTOR_ID,
        full_name: 'Cigaty Director',
        role: 'admin',
        kyc_status: 'approved'
      }, { onConflict: 'id' });
    
    if (error) {
      if (error.code === 'PGRST116' || error.message?.includes('does not exist')) {
        console.log('⚠️  Profiles table not found. Please execute SQL first.\n');
        console.log('Run this in Supabase SQL Editor:\n');
        console.log('1. Execute: supabase/ALL_SETUP.sql');
        console.log('2. Then run:\n');
        console.log(`INSERT INTO public.profiles (id, full_name, role, kyc_status)`);
        console.log(`VALUES ('${DIRECTOR_ID}', 'Cigaty Director', 'admin', 'approved')`);
        console.log(`ON CONFLICT (id) DO UPDATE SET role = 'admin', kyc_status = 'approved';\n`);
      } else {
        console.log('Error:', error.message);
      }
    } else {
      console.log('✅ Admin profile configured successfully!');
      console.log('   Email: director@cigaty.com');
      console.log('   Password: Sehajveer1998');
      console.log('   Role: admin');
      console.log('   KYC: approved\n');
    }
  } catch (err) {
    console.error('Error:', err.message);
  }
  
  // Verify setup
  console.log('🔍 Verifying setup...\n');
  
  try {
    const { data: profiles, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', DIRECTOR_ID)
      .single();
    
    if (error) {
      console.log('⚠️  Profiles table check failed:', error.message);
      console.log('    This is expected if SQL hasn\'t been executed yet.\n');
    } else if (profiles) {
      console.log('✅ Profile found:');
      console.log(`   Role: ${profiles.role}`);
      console.log(`   KYC: ${profiles.kyc_status}\n`);
    }
  } catch (err) {
    console.log('⚠️  Verification failed (SQL may not be executed yet)\n');
  }
  
  console.log('📋 NEXT STEPS:');
  console.log('1. Go to: https://supabase.com/dashboard/project/ctinwknfafeshljudolj/sql/new');
  console.log('2. Copy and paste contents of: supabase/ALL_SETUP.sql');
  console.log('3. Click "Run" to execute');
  console.log('4. After SQL executes, run this script again OR run the admin SQL shown above');
  console.log('5. Login at dashboard with: director@cigaty.com / Sehajveer1998\n');
}

finalizeSetup().catch(console.error);



