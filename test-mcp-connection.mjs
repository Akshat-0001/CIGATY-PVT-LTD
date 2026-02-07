import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://ctinwknfafeshljudolj.supabase.co';
const SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN0aW53a25mYWZlc2hsanVkb2xqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MTg1MTY3MiwiZXhwIjoyMDc3NDI3NjcyfQ.FabQInOhgs_I1GpuNIXTsA1pbqYL3VSJZqn4KnIACC4';

const supabase = createClient(SUPABASE_URL, SERVICE_KEY);

async function test() {
  console.log('🧪 Testing Supabase connection via REST API...\n');
  
  // Test 1: List tables
  try {
    const { data: tables, error } = await supabase.from('profiles').select('count').limit(1);
    if (error && error.code !== 'PGRST116') {
      console.log('❌ Connection issue:', error.message);
    } else {
      console.log('✅ Supabase REST API connection working!');
      console.log('   (MCP tools may still be loading)\n');
    }
  } catch (err) {
    console.log('❌ Error:', err.message);
  }
  
  // Test 2: Check profiles
  const { data: profiles } = await supabase.from('profiles').select('email:auth.users!inner(email), role, kyc_status').limit(5);
  console.log('📊 Profiles check:', profiles ? 'Working' : 'Need auth join');
}

test();
