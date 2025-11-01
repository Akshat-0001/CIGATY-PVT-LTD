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

// Combine all SQL files
const sqlFiles = [
  join(__dirname, 'supabase', '01_schema.sql'),
  join(__dirname, 'supabase', '02_policies.sql'),
  join(__dirname, 'supabase', '03_rpcs.sql'),
];

let combinedSQL = '';

for (const file of sqlFiles) {
  try {
    const sql = readFileSync(file, 'utf8');
    combinedSQL += sql + '\n\n';
    console.log(`✓ Read ${file.split('/').pop()}`);
  } catch (err) {
    console.error(`✗ Error reading ${file}:`, err.message);
  }
}

// Execute via HTTP to Supabase SQL endpoint
async function executeSQL() {
  console.log('\n📤 Executing SQL in Supabase...\n');
  
  // Supabase doesn't expose SQL execution via REST API for security
  // We'll use the Management API or direct Postgres connection
  // For now, output SQL for manual execution with instructions
  
  console.log('='.repeat(80));
  console.log('SQL TO EXECUTE IN SUPABASE SQL EDITOR:');
  console.log('='.repeat(80));
  console.log(combinedSQL);
  console.log('='.repeat(80));
  
  // Try to execute via fetch to Supabase REST
  // Note: This will only work for DML, not DDL
  // DDL requires SQL Editor execution
  
  const statements = combinedSQL
    .split(';')
    .map(s => s.trim())
    .filter(s => s.length > 0 && !s.startsWith('--'));
  
  console.log(`\nFound ${statements.length} SQL statements`);
  console.log('\n⚠️  DDL statements (CREATE TABLE, ALTER TABLE, etc.) must be run manually in Supabase SQL Editor');
  console.log('    Go to: https://supabase.com/dashboard/project/ctinwknfafeshljudolj/sql/new\n');
}

// Setup admin user
async function setupAdmin() {
  console.log('\n👤 Checking for admin user...\n');
  
  try {
    const { data: { users }, error } = await supabase.auth.admin.listUsers();
    
    if (error) {
      console.log('⚠️  Cannot access Auth Admin API:', error.message);
      console.log('\nAfter running SQL and registering, execute:');
      console.log(`
UPDATE public.profiles 
SET role = 'admin', kyc_status = 'approved' 
WHERE id = (SELECT id FROM auth.users WHERE email = 'director@cigaty.com');
      `);
      return;
    }
    
    const director = users?.find(u => u.email === 'director@cigaty.com');
    
    if (!director) {
      console.log('⚠️  director@cigaty.com not found in auth.users');
      console.log('    Please register first at: http://localhost:5173/register\n');
      console.log('    Then run this SQL after registration:');
      console.log(`
INSERT INTO public.profiles (id, full_name, role, kyc_status)
VALUES (
  (SELECT id FROM auth.users WHERE email = 'director@cigaty.com'),
  'Cigaty Director',
  'admin',
  'approved'
)
ON CONFLICT (id) DO UPDATE 
SET role = 'admin', kyc_status = 'approved';
      `);
      return;
    }
    
    console.log(`✓ Found user: ${director.email} (${director.id})`);
    
    // Upsert profile with admin role
    const { error: profileError } = await supabase
      .from('profiles')
      .upsert({
        id: director.id,
        full_name: 'Cigaty Director',
        role: 'admin',
        kyc_status: 'approved'
      }, { onConflict: 'id' });
    
    if (profileError) {
      if (profileError.code === 'PGRST116' || profileError.message.includes('does not exist')) {
        console.log('⚠️  Profiles table does not exist yet. Please run SQL schema first.\n');
      } else {
        console.log('⚠️  Error updating profile:', profileError.message);
        console.log('\nRun this SQL manually:');
        console.log(`
INSERT INTO public.profiles (id, full_name, role, kyc_status)
VALUES ('${director.id}', 'Cigaty Director', 'admin', 'approved')
ON CONFLICT (id) DO UPDATE 
SET role = 'admin', kyc_status = 'approved';
        `);
      }
    } else {
      console.log('✅ Admin account configured successfully!');
      console.log(`   Email: director@cigaty.com`);
      console.log(`   Role: admin`);
      console.log(`   KYC Status: approved\n`);
    }
    
  } catch (err) {
    console.error('Error setting up admin:', err.message);
  }
}

async function main() {
  console.log('🚀 Cigaty Trade Portal - Supabase Setup\n');
  console.log('='.repeat(80));
  
  await executeSQL();
  await setupAdmin();
  
  console.log('\n📋 SUMMARY:');
  console.log('1. Copy the SQL above into Supabase SQL Editor');
  console.log('2. Execute it (this creates all tables, policies, functions)');
  console.log('3. Register director@cigaty.com if not already registered');
  console.log('4. Admin role will be set automatically if user exists\n');
  console.log('✅ Setup instructions complete!\n');
}

main().catch(console.error);



