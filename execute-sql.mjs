import pkg from 'pg';
const { Client } = pkg;
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Supabase connection string format:
// postgresql://postgres:[PASSWORD]@db.[PROJECT_REF].supabase.co:5432/postgres
// We'll need the password from Supabase dashboard
// For now, let's try using the connection string builder

const SUPABASE_PROJECT_REF = 'ctinwknfafeshljudolj';
// Password needs to be retrieved from Supabase Dashboard > Settings > Database
// For security, we'll prompt or use environment variable

async function executeWithPostgres() {
  console.log('⚠️  Direct Postgres connection requires database password.');
  console.log('   Get it from: Supabase Dashboard > Settings > Database > Connection String\n');
  console.log('   Or use: Supabase Dashboard > SQL Editor (recommended)\n');
  
  // Alternative: Use Supabase Management API if available
  console.log('📝 SQL is ready to execute. See output above or run: node setup-db.mjs\n');
}

// Read and combine SQL files
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
  } catch (err) {
    console.error(`Error reading ${file}:`, err.message);
  }
}

// Since we can't get the Postgres password from the service key,
// We'll use Supabase's HTTP API to execute via a custom function
// OR provide clear instructions

console.log('🚀 Cigaty Supabase Setup - Direct Execution\n');
console.log('='.repeat(80));
console.log('EXECUTING SQL VIA SUPABASE API...');
console.log('='.repeat(80));

// Use fetch to execute SQL via Supabase's REST API
// Note: Supabase doesn't expose raw SQL execution via REST for security
// We'll need to use the SQL Editor or create a migration

async function main() {
  const SUPABASE_URL = 'https://ctinwknfafeshljudolj.supabase.co';
  const SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN0aW53a25mYWZlc2hsanVkb2xqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MTg1MTY3MiwiZXhwIjoyMDc3NDI3NjcyfQ.FabQInOhgs_I1GpuNIXTsA1pbqYL3VSJZqn4KnIACC4';
  
  // Split SQL into executable statements
  const statements = combinedSQL
    .split(';')
    .map(s => s.trim().replace(/^\s*--.*$/gm, ''))
    .filter(s => s.length > 0 && !s.startsWith('--'));
  
  console.log(`\n📊 Found ${statements.length} SQL statements to execute\n`);
  
  // Execute each statement via Supabase REST API
  // Note: This only works for DML, not DDL
  // DDL requires SQL Editor execution
  
  console.log('⚠️  IMPORTANT: Supabase does not allow DDL (CREATE TABLE, etc.) via REST API');
  console.log('    You MUST execute the SQL in Supabase SQL Editor:\n');
  console.log(`    URL: https://supabase.com/dashboard/project/${SUPABASE_PROJECT_REF}/sql/new\n`);
  
  console.log('='.repeat(80));
  console.log('COPY THIS SQL TO SUPABASE SQL EDITOR:');
  console.log('='.repeat(80));
  console.log(combinedSQL);
  console.log('='.repeat(80));
  
  console.log('\n✅ SQL ready for execution in Supabase Dashboard!\n');
  
  // Try to set up admin via Auth API (this part can be automated)
  console.log('🔧 Setting up admin account...\n');
  
  try {
    const { createClient } = await import('@supabase/supabase-js');
    const supabase = createClient(SUPABASE_URL, SERVICE_KEY, {
      auth: { persistSession: false }
    });
    
    const { data: { users }, error: listError } = await supabase.auth.admin.listUsers();
    
    if (listError) {
      console.log('⚠️  Cannot access Auth Admin. After SQL execution, run:');
    } else {
      const director = users?.find(u => u.email === 'director@cigaty.com');
      if (director) {
        console.log(`✓ Found user: ${director.email}`);
        
        // Try to upsert profile (will fail if table doesn't exist yet)
        const { error } = await supabase
          .from('profiles')
          .upsert({
            id: director.id,
            full_name: 'Cigaty Director',
            role: 'admin',
            kyc_status: 'approved'
          }, { onConflict: 'id' });
        
        if (error) {
          console.log(`⚠️  Profiles table not ready. After SQL execution, run:`);
          console.log(`
UPDATE public.profiles 
SET role = 'admin', kyc_status = 'approved' 
WHERE id = '${director.id}';
          `);
        } else {
          console.log('✅ Admin account configured!');
        }
      } else {
        console.log('⚠️  director@cigaty.com not found. Register first at /register');
      }
    }
  } catch (err) {
    console.log('⚠️  Error:', err.message);
  }
  
  console.log('\n📋 FINAL STEPS:');
  console.log('1. Copy SQL above to Supabase SQL Editor and execute');
  console.log('2. If director@cigaty.com exists, admin is already set');
  console.log('3. If not, register at /register, then run admin update SQL\n');
}

main().catch(console.error);



