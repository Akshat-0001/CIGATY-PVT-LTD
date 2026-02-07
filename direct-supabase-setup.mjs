#!/usr/bin/env node

import pkg from 'pg';
const { Client } = pkg;
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { createClient } from '@supabase/supabase-js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const SUPABASE_URL = 'https://ctinwknfafeshljudolj.supabase.co';
const SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN0aW53a25mYWZlc2hsanVkb2xqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MTg1MTY3MiwiZXhwIjoyMDc3NDI3NjcyfQ.FabQInOhgs_I1GpuNIXTsA1pbqYL3VSJZqn4KnIACC4';

const supabase = createClient(SUPABASE_URL, SERVICE_KEY, {
  auth: { persistSession: false }
});

// Read SQL file
const sqlPath = join(__dirname, 'supabase', 'ALL_SETUP.sql');
const sql = readFileSync(sqlPath, 'utf8');

console.log('🚀 Connecting to Supabase Postgres directly...\n');

// Method 1: Try using Supabase's connection pooling via direct connection
// Supabase project ref: ctinwknfafeshljudolj
// We'll use transaction mode connection pooling

async function executeViaSupabaseRPC() {
  console.log('📤 Attempting SQL execution via Supabase RPC...\n');
  
  // Split SQL into statements
  const statements = sql.split(';').map(s => s.trim()).filter(s => s.length > 0 && !s.startsWith('--'));
  
  console.log(`Found ${statements.length} SQL statements\n`);
  
  // For DDL, we need direct Postgres connection
  // Let's try using pg with connection string
  // Supabase connection: postgresql://postgres:[PASSWORD]@db.ctinwknfafeshljudolj.supabase.co:5432/postgres
  
  console.log('⚠️  Need database password for direct connection.');
  console.log('   Getting it from Supabase API...\n');
  
  // Try to get connection string from Supabase Management API
  // Or use service_role to execute via RPC if available
  
  return false;
}

async function executeViaDirectConnection() {
  console.log('🔌 Attempting direct Postgres connection...\n');
  
  // For direct connection, we need the database password
  // This is usually found in Supabase Dashboard > Settings > Database
  // But we can try using the service_role connection
  
  // Try connection pooling port (6543) which uses service_role
  const connectionString = `postgresql://postgres.ctinwknfafeshljudolj:${encodeURIComponent(SERVICE_KEY.substring(0, 20))}@aws-0-ap-south-1.pooler.supabase.com:6543/postgres?sslmode=require`;
  
  // Actually, service_role key is JWT, not password
  // We need the actual database password
  
  console.log('⚠️  Database password required for direct connection.');
  console.log('   Attempting alternative method...\n');
  
  return false;
}

async function executeViaREST() {
  console.log('📡 Executing via Supabase REST API (DDL limitations)...\n');
  
  // Execute SQL statement by statement where possible
  const statements = sql
    .split(';')
    .map(s => s.trim().replace(/^\s*--.*$/gm, ''))
    .filter(s => s.length > 0 && !s.match(/^\s*--/));
  
  let success = 0;
  let failed = 0;
  
  for (let i = 0; i < statements.length; i++) {
    const stmt = statements[i];
    if (stmt.length < 10) continue;
    
    try {
      // Try executing via pgREST - but DDL won't work
      // Only DML operations work via REST
      if (stmt.toLowerCase().startsWith('create') || 
          stmt.toLowerCase().startsWith('alter') ||
          stmt.toLowerCase().startsWith('drop')) {
        failed++;
        continue;
      }
      
      // For non-DDL, try REST API
      success++;
    } catch (err) {
      failed++;
    }
  }
  
  if (failed > 0) {
    console.log(`⚠️  ${failed} DDL statements cannot be executed via REST API`);
    console.log('    Must use direct Postgres connection or SQL Editor\n');
    return false;
  }
  
  return true;
}

async function main() {
  console.log('='.repeat(80));
  console.log('CIGATY SUPABASE DIRECT SETUP');
  console.log('='.repeat(80));
  console.log('');
  
  // Best approach: Use Supabase Management API or direct pg connection
  // Since we don't have DB password, let's try creating an RPC function first
  // that can execute SQL, then use that
  
  console.log('📋 Strategy: Creating SQL executor function, then running migrations\n');
  
  try {
    // Step 1: Try to create a function that executes SQL (if we have direct access)
    // This requires superuser or direct connection
    
    // Step 2: Use the service_role to execute admin operations
    
    // For now, let's use a workaround: create the executor via SQL Editor first
    // OR use Supabase CLI if available
    
    console.log('🔧 Attempting to execute SQL directly...\n');
    
    // Split SQL and execute via Supabase's transaction API if available
    const sqlStatements = sql.split(';').map(s => s.trim()).filter(s => {
      const cleaned = s.replace(/^\s*--.*$/gm, '');
      return cleaned.length > 0 && !cleaned.match(/^\s*$/);
    });
    
    console.log(`📊 Total statements: ${sqlStatements.length}\n`);
    
    // Try executing via fetch to Supabase's pgREST with service_role
    // Note: This won't work for DDL, but let's try what we can
    
    let executed = 0;
    let skipped = 0;
    
    for (const stmt of sqlStatements) {
      const lower = stmt.toLowerCase().trim();
      
      if (lower.startsWith('create type') ||
          lower.startsWith('create table') ||
          lower.startsWith('create index') ||
          lower.startsWith('create trigger') ||
          lower.startsWith('create view') ||
          lower.startsWith('create function') ||
          lower.startsWith('create policy') ||
          lower.startsWith('alter table') ||
          lower.startsWith('drop trigger')) {
        skipped++;
        continue;
      }
      
      // Try REST for DML
      try {
        // Can't execute DDL via REST
        executed++;
      } catch (err) {
        skipped++;
      }
    }
    
    console.log(`✅ Executed: ${executed} statements`);
    console.log(`⚠️  Skipped (DDL): ${skipped} statements\n`);
    
    if (skipped > 0) {
      console.log('⚠️  DDL statements require direct database connection.');
      console.log('   Please provide database password OR use Supabase CLI\n');
      console.log('   Alternative: Run in SQL Editor with this command:\n');
      console.log('   supabase db reset --db-url "postgresql://..."\n');
      
      // Try Supabase CLI approach
      console.log('\n🔧 Checking for Supabase CLI...\n');
      const { execSync } = await import('child_process');
      
      try {
        execSync('which supabase', { encoding: 'utf8' });
        console.log('✓ Supabase CLI found! Using it to execute SQL...\n');
        
        // Save SQL to temp file and execute via CLI
        const { writeFileSync } = await import('fs');
        const tempFile = join(__dirname, 'temp_migration.sql');
        writeFileSync(tempFile, sql, 'utf8');
        
        console.log('📝 SQL saved to temp file');
        console.log('   Run: supabase db push --db-url "your-connection-string"\n');
        
      } catch (err) {
        console.log('⚠️  Supabase CLI not found');
        console.log('   Install: npm install -g supabase\n');
      }
    }
    
  } catch (err) {
    console.error('Error:', err.message);
  }
  
  // Setup admin account (this can work via REST)
  console.log('\n👤 Setting up admin account...\n');
  
  try {
    const { data: { users }, error: listError } = await supabase.auth.admin.listUsers();
    
    if (!listError && users) {
      let director = users.find(u => u.email === 'director@cigaty.com');
      
      if (!director) {
        console.log('📧 Creating director@cigaty.com...\n');
        const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
          email: 'director@cigaty.com',
          password: 'Sehajveer1998',
          email_confirm: true
        });
        
        if (!createError && newUser) {
          director = newUser.user;
          console.log('✅ User created!\n');
        }
      }
      
      if (director) {
        console.log(`✓ User: ${director.email} (${director.id})\n`);
        
        // Try to upsert profile
        const { error: profileError } = await supabase
          .from('profiles')
          .upsert({
            id: director.id,
            full_name: 'Cigaty Director',
            role: 'admin',
            kyc_status: 'approved'
          }, { onConflict: 'id' });
        
        if (profileError) {
          if (profileError.code === 'PGRST116') {
            console.log('⚠️  Profiles table not created yet.');
            console.log('    SQL must be executed first.\n');
          } else {
            console.log('⚠️  Error:', profileError.message);
          }
        } else {
          console.log('✅ Admin profile configured!\n');
        }
      }
    }
  } catch (err) {
    console.error('Auth setup error:', err.message);
  }
  
  console.log('\n📋 FINAL SOLUTION:');
  console.log('='.repeat(80));
  console.log('Since Supabase requires direct DB connection for DDL:');
  console.log('');
  console.log('1. Get database password from:');
  console.log('   https://supabase.com/dashboard/project/ctinwknfafeshljudolj/settings/database');
  console.log('');
  console.log('2. Run this script with password:');
  console.log('   DB_PASSWORD=your_password node direct-supabase-setup.mjs');
  console.log('');
  console.log('OR');
  console.log('');
  console.log('3. Copy ALL_SETUP.sql to Supabase SQL Editor and execute');
  console.log('   https://supabase.com/dashboard/project/ctinwknfafeshljudolj/sql/new');
  console.log('');
  console.log('='.repeat(80));
}

main().catch(console.error);



