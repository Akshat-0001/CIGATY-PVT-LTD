import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const SUPABASE_URL = 'https://ctinwknfafeshljudolj.supabase.co';
const SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN0aW53a25mYWZlc2hsanVkb2xqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MTg1MTY3MiwiZXhwIjoyMDc3NDI3NjcyfQ.FabQInOhgs_I1GpuNIXTsA1pbqYL3VSJZqn4KnIACC4';

const supabase = createClient(SUPABASE_URL, SERVICE_KEY, {
  auth: { persistSession: false },
  db: { schema: 'public' }
});

async function executeSQL(sql) {
  // Use Supabase REST API to execute SQL via RPC
  // Note: This requires a function that executes SQL, which we'll create
  try {
    const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/exec_sql`, {
      method: 'POST',
      headers: {
        'apikey': SERVICE_KEY,
        'Authorization': `Bearer ${SERVICE_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=minimal'
      },
      body: JSON.stringify({ sql_text: sql })
    });
    return { ok: response.ok, status: response.status };
  } catch (err) {
    return { error: err.message };
  }
}

async function runSetup() {
  console.log('🚀 Setting up Supabase for Cigaty Trade Portal...\n');
  
  const files = [
    'supabase/01_schema.sql',
    'supabase/02_policies.sql', 
    'supabase/03_rpcs.sql',
    'supabase/04_import_scaffold.sql'
  ];
  
  console.log('📝 Reading SQL files...\n');
  
  let allSQL = '';
  
  for (const file of files.slice(0, 3)) {
    const path = join(__dirname, '..', file);
    try {
      const sql = readFileSync(path, 'utf8');
      allSQL += sql + '\n\n';
      console.log(`✓ Read ${file}`);
    } catch (err) {
      console.log(`✗ Could not read ${file}: ${err.message}`);
    }
  }
  
  console.log('\n📤 Executing SQL via Supabase API...\n');
  console.log('Note: Supabase requires SQL to be executed via SQL Editor.');
  console.log('Please copy the SQL below and run it in Supabase Dashboard > SQL Editor\n');
  console.log('='.repeat(80));
  console.log(allSQL);
  console.log('='.repeat(80));
  
  // Try to set up admin user via Auth Admin API
  console.log('\n👤 Setting up admin user...\n');
  
  try {
    // List users to find director@cigaty.com
    const { data: { users }, error: listError } = await supabase.auth.admin.listUsers();
    
    if (listError) {
      console.log('⚠️  Cannot list users. Please register director@cigaty.com first, then run:');
      console.log(`
UPDATE public.profiles 
SET role = 'admin', kyc_status = 'approved' 
WHERE id = (SELECT id FROM auth.users WHERE email = 'director@cigaty.com');
      `);
    } else {
      const director = users.find(u => u.email === 'director@cigaty.com');
      if (director) {
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
          console.log('⚠️  Profile table may not exist yet. Run SQL first, then:');
          console.log(`UPDATE public.profiles SET role='admin', kyc_status='approved' WHERE id='${director.id}';`);
        } else {
          console.log('✓ Admin account configured for director@cigaty.com');
        }
      } else {
        console.log('⚠️  director@cigaty.com not found. Please register first at /register');
      }
    }
  } catch (err) {
    console.log('⚠️  Auth admin API error:', err.message);
  }
  
  console.log('\n✅ Setup script complete!');
  console.log('\n📋 Next steps:');
  console.log('1. Copy the SQL above into Supabase Dashboard > SQL Editor and execute');
  console.log('2. Register director@cigaty.com at /register in your dashboard');
  console.log('3. Run the admin update SQL (shown above if needed)');
  console.log('4. Import your Excel file (see instructions in 04_import_scaffold.sql)\n');
}

runSetup().catch(console.error);



