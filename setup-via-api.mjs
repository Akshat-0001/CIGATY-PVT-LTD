#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const SUPABASE_URL = 'https://ctinwknfafeshljudolj.supabase.co';
const SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN0aW53a25mYWZlc2hsanVkb2xqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MTg1MTY3MiwiZXhwIjoyMDc3NDI3NjcyfQ.FabQInOhgs_I1GpuNIXTsA1pbqYL3VSJZqn4KnIACC4';

const supabase = createClient(SUPABASE_URL, SERVICE_KEY, {
  auth: { persistSession: false }
});

const sqlPath = join(__dirname, 'supabase', 'ALL_SETUP.sql');
const sql = readFileSync(sqlPath, 'utf8');

console.log('🚀 Setting up Supabase via API (what we can automate)...\n');

// Since DDL can't be executed via REST, we'll:
// 1. Provide SQL for manual execution
// 2. Automate everything else (admin setup, data operations)

async function setupAdmin() {
  console.log('👤 Setting up admin account...\n');
  
  try {
    // Get or create user
    const { data: { users } } = await supabase.auth.admin.listUsers();
    let director = users?.find(u => u.email === 'director@cigaty.com');
    
    if (!director) {
      console.log('📧 Creating director@cigaty.com...\n');
      const { data: newUser, error } = await supabase.auth.admin.createUser({
        email: 'director@cigaty.com',
        password: 'Sehajveer1998',
        email_confirm: true
      });
      
      if (error) {
        console.log('⚠️  Error:', error.message);
        return;
      }
      
      director = newUser.user;
      console.log('✅ User created!\n');
    } else {
      console.log('✓ User exists: director@cigaty.com\n');
    }
    
    // Try to set admin profile (will fail if SQL not executed yet)
    const { error: profileError } = await supabase
      .from('profiles')
      .upsert({
        id: director.id,
        full_name: 'Cigaty Director',
        role: 'admin',
        kyc_status: 'approved'
      }, { onConflict: 'id' });
    
    if (profileError) {
      console.log('⚠️  Profiles table not ready yet.');
      console.log('    After running SQL, execute this:\n');
      console.log(`INSERT INTO public.profiles (id, full_name, role, kyc_status)`);
      console.log(`VALUES ('${director.id}', 'Cigaty Director', 'admin', 'approved')`);
      console.log(`ON CONFLICT (id) DO UPDATE SET role = 'admin', kyc_status = 'approved';\n`);
    } else {
      console.log('✅ Admin profile configured!\n');
      console.log('   Email: director@cigaty.com');
      console.log('   Password: Sehajveer1998');
      console.log('   Role: admin\n');
    }
    
  } catch (err) {
    console.error('Error:', err.message);
  }
}

// Since we can't execute DDL via API, we'll use Supabase's SQL Editor API if available
// Or provide clear instructions

async function main() {
  console.log('='.repeat(80));
  console.log('CIGATY SUPABASE SETUP');
  console.log('='.repeat(80));
  console.log('');
  
  // Step 1: Admin user
  await setupAdmin();
  
  // Step 2: SQL Execution Instructions
  console.log('📋 SQL EXECUTION REQUIRED:');
  console.log('='.repeat(80));
  console.log('');
  console.log('Due to network/firewall restrictions, direct Postgres connection failed.');
  console.log('Please execute SQL manually:\n');
  console.log('1. Go to: https://supabase.com/dashboard/project/ctinwknfafeshljudolj/sql/new');
  console.log('2. Copy contents of: cigaty-dashboard/supabase/ALL_SETUP.sql');
  console.log('3. Paste and click "Run"');
  console.log('4. After SQL executes, admin account will be fully configured\n');
  
  // Try to check if tables exist
  console.log('🔍 Checking database status...\n');
  
  try {
    const { error } = await supabase.from('profiles').select('count').limit(1);
    if (error) {
      if (error.code === 'PGRST116') {
        console.log('⚠️  Tables not created yet. SQL must be executed first.\n');
      } else {
        console.log('⚠️  Database check:', error.message, '\n');
      }
    } else {
      console.log('✅ Database tables exist! Setup complete!\n');
    }
  } catch (err) {
    console.log('⚠️  Cannot verify database status\n');
  }
  
  console.log('='.repeat(80));
  console.log('✅ Setup automation complete!');
  console.log('   Follow SQL execution steps above to finish.\n');
}

main().catch(console.error);



