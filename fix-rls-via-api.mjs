#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const SUPABASE_URL = 'https://ctinwknfafeshljudolj.supabase.co';
const SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN0aW53a25mYWZlc2hsanVkb2xqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MTg1MTY3MiwiZXhwIjoyMDc3NDI3NjcyfQ.FabQInOhgs_I1GpuNIXTsA1pbqYL3VSJZqn4KnIACC4';

const supabase = createClient(SUPABASE_URL, SERVICE_KEY);

async function executeSQL() {
  const sqlPath = join(__dirname, 'supabase', 'fix-policies.sql');
  const sql = readFileSync(sqlPath, 'utf8');
  
  console.log('🔧 Executing RLS policy fix...\n');
  console.log('⚠️  Note: Supabase REST API cannot execute DDL (CREATE FUNCTION, etc.)');
  console.log('    The SQL must be run in Supabase SQL Editor.\n');
  console.log('📋 SQL to execute:\n');
  console.log('='.repeat(80));
  console.log(sql);
  console.log('='.repeat(80));
  console.log('\n📍 Run this in: https://supabase.com/dashboard/project/ctinwknfafeshljudolj/sql/new\n');
}

executeSQL();

