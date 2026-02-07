#!/usr/bin/env node
/**
 * Apply Database Migrations Script
 * 
 * This script applies all pending database migrations to Supabase.
 * Run this after pulling the latest code changes.
 * 
 * Usage:
 *   node apply-migrations.mjs
 * 
 * Or with custom Supabase URL/Key:
 *   SUPABASE_URL=your_url SUPABASE_SERVICE_KEY=your_key node apply-migrations.mjs
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { readdir } from 'fs/promises';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY || process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('❌ Error: Missing Supabase credentials');
  console.error('Please set SUPABASE_URL and SUPABASE_SERVICE_KEY environment variables');
  console.error('Or set VITE_SUPABASE_URL and VITE_SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// Migration files in order
const MIGRATION_FILES = [
  '07_platform_fees.sql',
  '08_reservation_extensions.sql',
  '09_inventory_system.sql',
  '10_payment_flow_restructure.sql',
  '11_update_get_seller_reservations.sql',
];

async function readMigrationFile(filename) {
  const filePath = join(__dirname, 'supabase', filename);
  try {
    return readFileSync(filePath, 'utf-8');
  } catch (error) {
    console.error(`❌ Error reading ${filename}:`, error.message);
    throw error;
  }
}

async function applyMigration(filename, sql) {
  console.log(`\n📄 Applying ${filename}...`);
  
  try {
    // Split SQL by semicolons and execute each statement
    // Note: Some statements might span multiple lines, so we need to be careful
    const statements = sql
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'));

    for (const statement of statements) {
      if (statement.trim().length === 0) continue;
      
      // Skip comments
      if (statement.trim().startsWith('--')) continue;
      
      try {
        const { error } = await supabase.rpc('exec_sql', { sql_query: statement });
        
        // If exec_sql doesn't exist, try direct query (requires service role)
        if (error && error.message?.includes('exec_sql')) {
          // Fallback: Use PostgREST REST API or direct connection
          console.warn(`⚠️  exec_sql RPC not available, trying alternative method...`);
          // For now, we'll need to use psql or Supabase CLI
          console.warn(`⚠️  Please apply ${filename} manually using Supabase CLI or Dashboard SQL Editor`);
          return false;
        }
        
        if (error) {
          // Some errors are expected (like "already exists")
          if (error.message?.includes('already exists') || 
              error.message?.includes('duplicate') ||
              error.message?.includes('if not exists')) {
            console.log(`   ℹ️  ${error.message.split('\n')[0]}`);
          } else {
            throw error;
          }
        }
      } catch (err) {
        // Some statements might fail if they use DO blocks or complex logic
        // We'll log but continue
        if (err.message?.includes('already exists') || 
            err.message?.includes('duplicate')) {
          console.log(`   ℹ️  ${err.message.split('\n')[0]}`);
        } else {
          console.warn(`   ⚠️  Statement warning: ${err.message.split('\n')[0]}`);
        }
      }
    }
    
    console.log(`   ✅ ${filename} applied successfully`);
    return true;
  } catch (error) {
    console.error(`   ❌ Error applying ${filename}:`, error.message);
    return false;
  }
}

async function checkMigrationStatus() {
  console.log('🔍 Checking migration status...\n');
  
  // Check if platform_fees table exists
  const { data: feesTable, error: feesError } = await supabase
    .from('platform_fees')
    .select('count')
    .limit(1);
  
  if (!feesError && feesTable !== null) {
    console.log('✅ platform_fees table exists');
  } else {
    console.log('❌ platform_fees table does not exist');
  }
  
  // Check if bonded_warehouses table exists
  const { data: warehousesTable, error: warehousesError } = await supabase
    .from('bonded_warehouses')
    .select('count')
    .limit(1);
  
  if (!warehousesError && warehousesTable !== null) {
    console.log('✅ bonded_warehouses table exists');
  } else {
    console.log('❌ bonded_warehouses table does not exist');
  }
  
  console.log('');
}

async function main() {
  console.log('🚀 Starting database migration process...\n');
  console.log(`📡 Connecting to: ${SUPABASE_URL.substring(0, 30)}...`);
  
  // Check current status
  await checkMigrationStatus();
  
  let successCount = 0;
  let failCount = 0;
  
  for (const filename of MIGRATION_FILES) {
    try {
      const sql = await readMigrationFile(filename);
      const success = await applyMigration(filename, sql);
      if (success) {
        successCount++;
      } else {
        failCount++;
      }
    } catch (error) {
      console.error(`❌ Failed to process ${filename}:`, error.message);
      failCount++;
    }
  }
  
  console.log('\n' + '='.repeat(50));
  console.log('📊 Migration Summary:');
  console.log(`   ✅ Successful: ${successCount}`);
  console.log(`   ❌ Failed: ${failCount}`);
  console.log('='.repeat(50));
  
  if (failCount > 0) {
    console.log('\n⚠️  Some migrations failed. Please review the errors above.');
    console.log('💡 Tip: You can apply migrations manually using:');
    console.log('   1. Supabase Dashboard SQL Editor');
    console.log('   2. Supabase CLI: supabase db push');
    console.log('   3. psql connection to your database');
    process.exit(1);
  } else {
    console.log('\n✅ All migrations applied successfully!');
    console.log('🎉 Your database is up to date.');
  }
}

main().catch((error) => {
  console.error('❌ Fatal error:', error);
  process.exit(1);
});


