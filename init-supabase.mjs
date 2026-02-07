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

// Read all SQL files
const files = ['01_schema.sql', '02_policies.sql', '03_rpcs.sql'];
let fullSQL = '';

for (const file of files) {
  const path = join(__dirname, 'supabase', file);
  try {
    fullSQL += readFileSync(path, 'utf8') + '\n\n';
  } catch (err) {
    console.error(`Error reading ${file}:`, err.message);
    process.exit(1);
  }
}

console.log('🚀 Initializing Supabase Database...\n');

// Save SQL to a file for easy copy-paste
import { writeFileSync } from 'fs';
writeFileSync(
  join(__dirname, 'supabase', 'ALL_SETUP.sql'),
  fullSQL,
  'utf8'
);
console.log('✓ Created supabase/ALL_SETUP.sql\n');

// Try to execute via Supabase Management API (if available)
console.log('📤 Attempting to execute SQL via API...\n');

// Supabase doesn't expose raw SQL execution for security
// We'll provide the SQL and automate what we can

console.log('⚠️  DDL statements must be executed manually in Supabase SQL Editor');
console.log(`   URL: https://supabase.com/dashboard/project/ctinwknfafeshljudolj/sql/new\n`);

console.log('='.repeat(80));
console.log('SQL TO EXECUTE (or see supabase/ALL_SETUP.sql):');
console.log('='.repeat(80));
console.log(fullSQL.substring(0, 500) + '...\n[See supabase/ALL_SETUP.sql for full SQL]');
console.log('='.repeat(80));

// Setup admin user (this part can be automated after SQL runs)
console.log('\n👤 Setting up admin account...\n');

async function setupAdmin() {
  try {
    const { data: { users }, error: listError } = await supabase.auth.admin.listUsers();
    
    if (listError) {
      console.log('⚠️  Cannot access users. Will setup after SQL execution.\n');
      return;
    }
    
    let director = users?.find(u => u.email === 'director@cigaty.com');
    
    if (!director) {
      console.log('📧 Creating director@cigaty.com user...\n');
      
      // Create user via Auth Admin API
      const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
        email: 'director@cigaty.com',
        password: 'Sehajveer1998',
        email_confirm: true
      });
      
      if (createError) {
        console.log('⚠️  Error creating user:', createError.message);
        console.log('    User may already exist or password policy issue\n');
      } else {
        director = newUser.user;
        console.log('✅ Created user: director@cigaty.com\n');
      }
    }
    
    if (director) {
      console.log(`✓ Found user: ${director.email} (${director.id})\n`);
      
      // Wait a moment for profile table to potentially exist
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Upsert profile
      const { error: profileError } = await supabase
        .from('profiles')
        .upsert({
          id: director.id,
          full_name: 'Cigaty Director',
          role: 'admin',
          kyc_status: 'approved'
        }, { onConflict: 'id' });
      
      if (profileError) {
        if (profileError.code === 'PGRST116' || profileError.message?.includes('does not exist')) {
          console.log('⚠️  Profiles table does not exist yet.');
          console.log('    Run the SQL first, then execute:\n');
          console.log(`INSERT INTO public.profiles (id, full_name, role, kyc_status)`);
          console.log(`VALUES ('${director.id}', 'Cigaty Director', 'admin', 'approved')`);
          console.log(`ON CONFLICT (id) DO UPDATE SET role = 'admin', kyc_status = 'approved';\n`);
        } else {
          console.log('⚠️  Error:', profileError.message);
          console.log('\nRun this SQL manually:\n');
          console.log(`UPDATE public.profiles SET role='admin', kyc_status='approved' WHERE id='${director.id}';\n`);
        }
      } else {
        console.log('✅ Admin account fully configured!');
        console.log('   Email: director@cigaty.com');
        console.log('   Password: Sehajveer1998');
        console.log('   Role: admin');
        console.log('   KYC: approved\n');
      }
    }
  } catch (err) {
    console.error('Error:', err.message);
  }
}

await setupAdmin();

console.log('\n📋 SUMMARY:');
console.log('1. ✅ SQL file created: supabase/ALL_SETUP.sql');
console.log('2. ⏳ Execute SQL in Supabase SQL Editor');
console.log('3. ✅ Admin user setup attempted (may need SQL first)');
console.log('\n✅ Setup complete! Check output above for any manual steps.\n');



