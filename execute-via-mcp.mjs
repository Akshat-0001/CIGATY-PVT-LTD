#!/usr/bin/env node

// Test script to verify we can connect to Supabase Postgres
import pkg from 'pg';
const { Client } = pkg;

// Try both connection formats
const poolerString = "postgresql://postgres.ctinwknfafeshljudolj:Sehajveer1998@aws-0-ap-south-1.pooler.supabase.com:6543/postgres?sslmode=require";
const directString = "postgresql://postgres:Sehajveer1998@db.ctinwknfafeshljudolj.supabase.co:5432/postgres?sslmode=require";

async function testConnection() {
  console.log('🔌 Testing Supabase connection...\n');
  
  // Temporarily disable SSL verification for testing
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
  
  // Try pooler first, then direct
  const connections = [
    { name: "Pooler", url: poolerString },
    { name: "Direct", url: directString }
  ];
  
  for (const conn of connections) {
    console.log(`Trying ${conn.name} connection...`);
    const client = new Client({
      connectionString: conn.url,
      ssl: {
        rejectUnauthorized: false
      }
    });

    try {
    await client.connect();
    console.log('✅ Connected successfully!\n');

    // Test query
    const { rows } = await client.query('SELECT version() as version');
    console.log('PostgreSQL version:', rows[0].version.substring(0, 50) + '...\n');

    // List tables
    const { rows: tables } = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `);
    console.log('📊 Tables found:');
    tables.forEach(t => console.log(`   - ${t.table_name}`));
    console.log('');

    // Check profiles
    const { rows: profiles } = await client.query(`
      SELECT email, role, kyc_status 
      FROM public.profiles 
      JOIN auth.users ON profiles.id = auth.users.id 
      ORDER BY email
    `);
    console.log('👤 User profiles:');
    profiles.forEach(p => {
      console.log(`   ${p.email}: ${p.role} (KYC: ${p.kyc_status})`);
    });

      await client.end();
      console.log(`\n✅ ${conn.name} connection successful!\n`);
      return; // Success, exit
    } catch (err) {
      console.log(`   ❌ ${conn.name} failed: ${err.message}`);
      await client.end().catch(() => {});
      continue; // Try next connection
    }
  }
  
  console.error('\n❌ All connection attempts failed');
  console.log('\n💡 The MCP connection in Cursor may also have issues.');
  console.log('   You can still use Supabase SQL Editor or REST API for operations.');
}

testConnection();

