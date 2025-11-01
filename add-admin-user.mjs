#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://ctinwknfafeshljudolj.supabase.co';
const SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN0aW53a25mYWZlc2hsanVkb2xqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MTg1MTY3MiwiZXhwIjoyMDc3NDI3NjcyfQ.FabQInOhgs_I1GpuNIXTsA1pbqYL3VSJZqn4KnIACC4';

const supabase = createClient(SUPABASE_URL, SERVICE_KEY, {
  auth: { persistSession: false }
});

const NEW_ADMIN_EMAIL = 'com.akshat.dev@gmail.com';
const NEW_ADMIN_NAME = 'Akshat Dev';

async function addAdmin() {
  console.log('👤 Adding admin user:', NEW_ADMIN_EMAIL);
  console.log('');
  
  try {
    // Check if user exists
    const { data: { users } } = await supabase.auth.admin.listUsers();
    let user = users?.find(u => u.email === NEW_ADMIN_EMAIL);
    
    if (!user) {
      console.log('📧 User does not exist. Creating...');
      console.log('   Enter password for the new admin user:');
      console.log('   (Or press Enter to use default: Sehajveer1998)');
      
      // Read password from command line
      const readline = await import('readline');
      const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
      });
      
      const password = await new Promise(resolve => {
        rl.question('Password: ', answer => {
          rl.close();
          resolve(answer || 'Sehajveer1998');
        });
      });
      
      const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
        email: NEW_ADMIN_EMAIL,
        password: password,
        email_confirm: true
      });
      
      if (createError) {
        console.error('❌ Error creating user:', createError.message);
        process.exit(1);
      }
      
      user = newUser.user;
      console.log('✅ User created!\n');
    } else {
      console.log('✓ User already exists\n');
    }
    
    // Create/update admin profile
    console.log('🔧 Setting up admin profile...');
    const { error: profileError } = await supabase
      .from('profiles')
      .upsert({
        id: user.id,
        full_name: NEW_ADMIN_NAME,
        role: 'admin',
        kyc_status: 'approved'
      }, { onConflict: 'id' });
    
    if (profileError) {
      console.error('❌ Error creating profile:', profileError.message);
      console.log('\n📝 Run this SQL in Supabase SQL Editor instead:\n');
      console.log(`INSERT INTO public.profiles (id, full_name, role, kyc_status)`);
      console.log(`VALUES ('${user.id}', '${NEW_ADMIN_NAME}', 'admin', 'approved')`);
      console.log(`ON CONFLICT (id) DO UPDATE SET role = 'admin', kyc_status = 'approved';\n`);
      process.exit(1);
    }
    
    console.log('✅ Admin profile configured!\n');
    console.log('='.repeat(80));
    console.log('✅ ADMIN USER READY:');
    console.log(`   Email: ${NEW_ADMIN_EMAIL}`);
    console.log(`   Name: ${NEW_ADMIN_NAME}`);
    console.log(`   Role: admin`);
    console.log(`   KYC: approved`);
    console.log('='.repeat(80));
    console.log('');
    
  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  }
}

addAdmin().catch(console.error);



