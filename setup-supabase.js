import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import XLSX from 'xlsx';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const SUPABASE_URL = 'https://ctinwknfafeshljudolj.supabase.co';
const SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN0aW53a25mYWZlc2hsanVkb2xqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MTg1MTY3MiwiZXhwIjoyMDc3NDI3NjcyfQ.FabQInOhgs_I1GpuNIXTsA1pbqYL3VSJZqn4KnIACC4';

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { persistSession: false }
});

async function runSQL(filePath) {
  const sql = readFileSync(filePath, 'utf8');
  console.log(`Running ${filePath}...`);
  const { data, error } = await supabase.rpc('exec_sql', { sql_text: sql });
  if (error) {
    // Try direct PostgREST query
    console.log(`Note: exec_sql not available, will use manual execution`);
    return { error };
  }
  return { data };
}

async function executeSQLDirect(sql) {
  // Use REST API to execute SQL
  const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/exec_sql`, {
    method: 'POST',
    headers: {
      'apikey': SERVICE_ROLE_KEY,
      'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ sql_text: sql })
  });
  
  if (!response.ok) {
    // Fallback: try pgSQL via Postgres REST API
    console.log('Trying alternative SQL execution method...');
    return { error: new Error('Direct SQL execution requires Supabase SQL editor') };
  }
  
  return await response.json();
}

async function importExcel() {
  try {
    const excelPath = join(__dirname, '..', 'Cigaty. stock offer (2025).xlsx');
    const workbook = XLSX.readFile(excelPath);
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const rows = XLSX.utils.sheet_to_json(sheet);
    
    console.log(`Found ${rows.length} rows in Excel`);
    
    // Insert into temp table
    const { error: insertError } = await supabase
      .from('liquor_catalog_tmp')
      .insert(rows);
    
    if (insertError) {
      console.log('Note: Temp table may need to be created first');
      return insertError;
    }
    
    // Run normalization
    const normalizeSQL = `
      insert into public.brands(name)
      select distinct brand from public.liquor_catalog_tmp where brand is not null
      on conflict (name) do nothing;

      insert into public.categories(name)
      select distinct category from public.liquor_catalog_tmp where category is not null
      on conflict (name) do nothing;

      insert into public.countries(iso2, name)
      select distinct origin_country_iso2, origin_country_iso2 from public.liquor_catalog_tmp where origin_country_iso2 is not null
      on conflict (iso2) do nothing;

      insert into public.liquor_catalog(
        item_code, brand_id, category_id, name, vintage, abv_percent, volume_ml, pack_per_case, pack_type, origin_country_id, description, image_url
      )
      select
        t.item_code,
        (select id from public.brands b where b.name = t.brand),
        (select id from public.categories c where c.name = t.category),
        t.name, t.vintage, t.abv_percent, t.volume_ml, coalesce(t.pack_per_case, 6),
        cast(coalesce(t.pack_type, 'bottle') as pack_type),
        (select id from public.countries cc where cc.iso2 = t.origin_country_iso2),
        t.description, t.image_url
      from public.liquor_catalog_tmp t
      on conflict (item_code) do nothing;
    `;
    
    return await executeSQLDirect(normalizeSQL);
  } catch (err) {
    console.error('Excel import error:', err.message);
    return { error: err };
  }
}

async function setupAdmin(email) {
  // First, try to find user by email
  const { data: users, error: userError } = await supabase.auth.admin.listUsers();
  
  if (userError) {
    console.log('Cannot list users, please create manually via Supabase dashboard');
    return;
  }
  
  const user = users?.users?.find(u => u.email === email);
  if (!user) {
    console.log(`User ${email} not found. Please register first at /register`);
    return;
  }
  
  // Update profile
  const { error } = await supabase
    .from('profiles')
    .upsert({
      id: user.id,
      full_name: 'Cigaty Director',
      role: 'admin',
      kyc_status: 'approved'
    });
  
  if (error) {
    console.log('Profile update error:', error.message);
  } else {
    console.log(`✓ Admin account set for ${email}`);
  }
}

async function main() {
  console.log('Setting up Supabase...\n');
  
  console.log('IMPORTANT: Please run the SQL files manually in Supabase SQL Editor:');
  console.log('1. supabase/01_schema.sql');
  console.log('2. supabase/02_policies.sql');
  console.log('3. supabase/03_rpcs.sql');
  console.log('4. supabase/04_import_scaffold.sql\n');
  
  // Try to read and display SQL for manual execution
  const sqlFiles = ['01_schema.sql', '02_policies.sql', '03_rpcs.sql'];
  
  for (const file of sqlFiles) {
    const path = join(__dirname, 'supabase', file);
    try {
      const sql = readFileSync(path, 'utf8');
      console.log(`\n=== ${file} ===`);
      console.log(sql.substring(0, 200) + '...\n');
    } catch (err) {
      console.log(`Could not read ${file}`);
    }
  }
  
  // Setup admin account (will work after SQL is run)
  console.log('\nSetting up admin account...');
  await setupAdmin('director@cigaty.com');
  
  console.log('\n✓ Setup instructions printed above. Please execute SQL files in Supabase SQL Editor.');
}

main().catch(console.error);



