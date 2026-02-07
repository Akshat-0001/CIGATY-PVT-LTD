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

// Get password from environment or prompt
const DB_PASSWORD = process.env.DB_PASSWORD || process.argv[2];

if (!DB_PASSWORD) {
  console.error('❌ Database password required!');
  console.error('');
  console.error('Usage:');
  console.error('  DB_PASSWORD=your_password node execute-with-password.mjs');
  console.error('  OR');
  console.error('  node execute-with-password.mjs your_password');
  console.error('');
  console.error('Get password from:');
  console.error('  https://supabase.com/dashboard/project/ctinwknfafeshljudolj/settings/database');
  console.error('');
  process.exit(1);
}

// Supabase connection strings - try pooler first (IPv4)
const connectionString = `postgresql://postgres.ctinwknfafeshljudolj:${encodeURIComponent(DB_PASSWORD)}@aws-0-ap-south-1.pooler.supabase.com:6543/postgres?sslmode=require&connect_timeout=10`;

// Direct connection (IPv4)
const directConnectionString = `postgresql://postgres.ctinwknfafeshljudolj:${encodeURIComponent(DB_PASSWORD)}@db.ctinwknfafeshljudolj.supabase.co:5432/postgres?sslmode=require&connect_timeout=10`;

// Try pooler first
const preferredConnection = connectionString;

async function executeSQL() {
  console.log('🚀 Connecting directly to Supabase Postgres...\n');
  
  // Try pooler first, fallback to direct
  let client = new Client({
    connectionString: preferredConnection,
    ssl: { rejectUnauthorized: false },
    // Force IPv4
    family: 4
  });
  
  try {
    try {
      await client.connect();
      console.log('✅ Connected via connection pooler!\n');
    } catch (poolError) {
      console.log('⚠️  Pooler connection failed, trying direct connection...\n');
      if (client) await client.end().catch(() => {});
      client = new Client({
        connectionString: directConnectionString,
        ssl: { rejectUnauthorized: false },
        family: 4 // Force IPv4
      });
      await client.connect();
      console.log('✅ Connected via direct connection!\n');
    }
    
    // Read SQL file
    const sqlPath = join(__dirname, 'supabase', 'ALL_SETUP.sql');
    const sql = readFileSync(sqlPath, 'utf8');
    
    console.log('📤 Executing SQL migrations...\n');
    
    // Execute entire SQL file
    try {
      await client.query(sql);
      console.log('✅ All SQL executed successfully!\n');
    } catch (err) {
      console.error('⚠️  Error executing SQL:', err.message);
      console.error('   Line:', err.position);
      console.error('   Statement:', err.query?.substring(0, 200));
      
      // Try executing statement by statement for better error reporting
      console.log('\n🔄 Retrying statement by statement...\n');
      
      const statements = sql
        .split(';')
        .map(s => s.trim())
        .filter(s => s.length > 0 && !s.match(/^\s*--/));
      
      for (let i = 0; i < statements.length; i++) {
        const stmt = statements[i];
        if (stmt.length < 5) continue;
        
        try {
          await client.query(stmt);
          process.stdout.write(`✓ Statement ${i + 1}/${statements.length}\r`);
        } catch (err) {
          console.error(`\n✗ Error in statement ${i + 1}:`, err.message);
          console.error(`  Statement: ${stmt.substring(0, 100)}...\n`);
        }
      }
    }
    
    console.log('\n✅ SQL execution complete!\n');
    
    // Setup admin profile
    console.log('👤 Setting up admin profile...\n');
    
    const supabase = createClient(SUPABASE_URL, SERVICE_KEY, {
      auth: { persistSession: false }
    });
    
    const { data: { users } } = await supabase.auth.admin.listUsers();
    const director = users?.find(u => u.email === 'director@cigaty.com');
    
    if (director) {
      await client.query(`
        INSERT INTO public.profiles (id, full_name, role, kyc_status)
        VALUES ($1, 'Cigaty Director', 'admin', 'approved')
        ON CONFLICT (id) DO UPDATE 
        SET role = 'admin', kyc_status = 'approved'
      `, [director.id]);
      
      console.log('✅ Admin profile configured!');
      console.log('   Email: director@cigaty.com');
      console.log('   Password: Sehajveer1998');
      console.log('   Role: admin\n');
    } else {
      console.log('⚠️  director@cigaty.com not found. Creating user...\n');
      
      const { data: newUser } = await supabase.auth.admin.createUser({
        email: 'director@cigaty.com',
        password: 'Sehajveer1998',
        email_confirm: true
      });
      
      if (newUser?.user) {
        await client.query(`
          INSERT INTO public.profiles (id, full_name, role, kyc_status)
          VALUES ($1, 'Cigaty Director', 'admin', 'approved')
        `, [newUser.user.id]);
        
        console.log('✅ User and profile created!\n');
      }
    }
    
    await client.end();
    console.log('✅ Setup complete!\n');
    
  } catch (err) {
    console.error('❌ Connection error:', err.message);
    console.error('\nTroubleshooting:');
    console.error('1. Check database password is correct');
    console.error('2. Verify connection string format');
    console.error('3. Check network/firewall settings\n');
    process.exit(1);
  }
}

executeSQL().catch(console.error);

