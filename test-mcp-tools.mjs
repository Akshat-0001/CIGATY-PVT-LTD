#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://ctinwknfafeshljudolj.supabase.co';
const SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN0aW53a25mYWZlc2hsanVkb2xqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MTg1MTY3MiwiZXhwIjoyMDc3NDI3NjcyfQ.FabQInOhgs_I1GpuNIXTsA1pbqYL3VSJZqn4KnIACC4';

const supabase = createClient(SUPABASE_URL, SERVICE_KEY);

async function testConnection() {
  console.log('🔍 Testing Supabase connection and checking RLS fix status...\n');
  
  // Test 1: Check if we can read profiles (this was failing before due to recursion)
  console.log('1️⃣  Testing profiles table access...');
  try {
    const { data: profiles, error } = await supabase
      .from('profiles')
      .select('*')
      .limit(1);
    
    if (error) {
      if (error.code === '42P17' || error.message.includes('infinite recursion')) {
        console.log('   ❌ Still has recursion error - RLS fix not applied yet\n');
        return false;
      } else {
        console.log(`   ⚠️  Error: ${error.message}\n`);
      }
    } else {
      console.log('   ✅ Profiles accessible - no recursion error!\n');
    }
  } catch (err) {
    console.log('   ❌ Error:', err.message);
  }
  
  // Test 2: Check if is_admin function exists
  console.log('2️⃣  Checking for is_admin() function...');
  try {
    const { data, error } = await supabase.rpc('is_admin');
    if (error) {
      if (error.message.includes('does not exist')) {
        console.log('   ⚠️  is_admin() function not found - RLS fix may not be applied\n');
      } else {
        console.log(`   ⚠️  Function exists but error: ${error.message}\n`);
      }
    } else {
      console.log('   ✅ is_admin() function exists!\n');
    }
  } catch (err) {
    console.log('   ⚠️  Cannot test function (expected if not admin context)\n');
  }
  
  // Test 3: List tables
  console.log('3️⃣  Testing database access...');
  try {
    const { data, error } = await supabase.from('liquor_catalog').select('count').limit(1);
    if (error && error.code !== 'PGRST116') {
      console.log(`   ⚠️  Error: ${error.message}\n`);
    } else {
      console.log('   ✅ Database connection working!\n');
    }
  } catch (err) {
    console.log('   ⚠️  Error:', err.message);
  }
  
  return true;
}

testConnection().then(success => {
  if (success) {
    console.log('✅ Connection test complete!');
    console.log('\n📋 If recursion error is gone, try logging in again.');
  } else {
    console.log('\n⚠️  Please run the RLS fix SQL in Supabase SQL Editor first.');
  }
});

