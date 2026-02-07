#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://ctinwknfafeshljudolj.supabase.co';
const SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN0aW53a25mYWZlc2hsanVkb2xqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MTg1MTY3MiwiZXhwIjoyMDc3NDI3NjcyfQ.FabQInOhgs_I1GpuNIXTsA1pbqYL3VSJZqn4KnIACC4';

const supabase = createClient(SUPABASE_URL, SERVICE_KEY, {
  auth: { persistSession: false }
});

async function checkProfiles() {
  console.log('🔍 Checking admin profiles...\n');
  
  const emails = ['director@cigaty.com', 'com.akshat.dev@gmail.com'];
  
  for (const email of emails) {
    try {
      const { data: { users } } = await supabase.auth.admin.listUsers();
      const user = users?.find(u => u.email === email);
      
      if (!user) {
        console.log(`❌ ${email}: User not found`);
        continue;
      }
      
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      
      if (error) {
        console.log(`⚠️  ${email}: Profile error - ${error.message}`);
        console.log(`   User ID: ${user.id}\n`);
      } else {
        console.log(`✅ ${email}:`);
        console.log(`   User ID: ${user.id}`);
        console.log(`   Role: ${profile.role}`);
        console.log(`   KYC Status: ${profile.kyc_status}`);
        console.log(`   Full Name: ${profile.full_name || 'Not set'}`);
        console.log('');
      }
    } catch (err) {
      console.log(`❌ ${email}: Error - ${err.message}\n`);
    }
  }
}

checkProfiles().catch(console.error);



