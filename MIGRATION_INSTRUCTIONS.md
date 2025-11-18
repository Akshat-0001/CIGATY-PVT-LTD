# Database Migration Instructions

## Overview

This document provides instructions for applying the database migrations required for the CIGATY platform features.

## Migration Files

The following migration files need to be applied in order:

1. `07_platform_fees.sql` - Platform fees table
2. `08_reservation_extensions.sql` - Reservation extension columns and RPC
3. `09_inventory_system.sql` - Bonded warehouses and inventory types
4. `10_payment_flow_restructure.sql` - Payment percentage column
5. `11_update_get_seller_reservations.sql` - Updated RPC function

## Method 1: Using Supabase Dashboard (Recommended)

1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. For each migration file (in order):
   - Open the file from `supabase/` directory
   - Copy the entire contents
   - Paste into SQL Editor
   - Click **Run** or press `Ctrl+Enter` (Windows/Linux) or `Cmd+Enter` (Mac)
   - Verify success message

## Method 2: Using Supabase CLI

```bash
# Make sure you have Supabase CLI installed
npm install -g supabase

# Login to Supabase
supabase login

# Link your project (if not already linked)
supabase link --project-ref your-project-ref

# Apply migrations
supabase db push

# Or apply specific migration
supabase db execute -f supabase/07_platform_fees.sql
```

## Method 3: Using psql

```bash
# Connect to your Supabase database
psql "postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres"

# Apply each migration file
\i supabase/07_platform_fees.sql
\i supabase/08_reservation_extensions.sql
\i supabase/09_inventory_system.sql
\i supabase/10_payment_flow_restructure.sql
\i supabase/11_update_get_seller_reservations.sql
```

## Method 4: Using Node.js Script

```bash
# Set environment variables
export SUPABASE_URL="https://your-project-ref.supabase.co"
export SUPABASE_SERVICE_KEY="your-service-role-key"

# Run the migration script
node apply-migrations.mjs
```

**Note:** The Node.js script requires a custom RPC function `exec_sql` which may not exist. If it fails, use Method 1 (Dashboard) instead.

## Verification

After applying migrations, verify they were successful:

### Check Platform Fees Table
```sql
SELECT * FROM platform_fees;
-- Should show: Beer, Wine, Spirits, Champagne, Soft Drinks, Other
```

### Check Bonded Warehouses Table
```sql
SELECT * FROM bonded_warehouses;
-- Should be empty initially (admin can add warehouses via UI)
```

### Check Reservation Columns
```sql
SELECT column_name 
FROM information_schema.columns 
WHERE table_name = 'reservations' 
AND column_name IN ('extended_until', 'extension_reason', 'extended_by', 'payment_percentage');
-- Should return all 4 columns
```

### Check Listing Columns
```sql
SELECT column_name 
FROM information_schema.columns 
WHERE table_name = 'listings' 
AND column_name IN ('inventory_type', 'custom_warehouse_name');
-- Should return both columns
```

### Test RPC Functions
```sql
-- Test extend_reservation (should fail if not admin)
SELECT extend_reservation('00000000-0000-0000-0000-000000000000', NOW() + INTERVAL '7 days', 'Test');

-- Test get_seller_reservations
SELECT * FROM get_seller_reservations('your-user-id');
```

## Troubleshooting

### Error: "relation already exists"
- This is normal if migrations were partially applied
- The migrations use `IF NOT EXISTS` clauses, so they're safe to re-run
- You can ignore these errors

### Error: "permission denied"
- Make sure you're using the **service_role** key (not anon key)
- For Dashboard: You have admin access
- For CLI: Check your project permissions

### Error: "function does not exist"
- Some migrations depend on previous ones
- Make sure to run migrations in order
- Check that all previous migrations completed successfully

### Error: "column already exists"
- This means the migration was already partially applied
- The migrations use `ADD COLUMN IF NOT EXISTS`, so this is safe to ignore

## Post-Migration Steps

1. **Verify RLS Policies**: Test that platform_fees and bonded_warehouses tables are readable by all users
2. **Test Admin Functions**: Verify admins can create/edit platform fees and bonded warehouses
3. **Test Extension**: Create a test reservation and try extending it as admin
4. **Test Payment Flow**: Create listings with different inventory types and verify payment percentages

## Rollback (if needed)

If you need to rollback migrations:

```sql
-- Remove platform fees (WARNING: This will delete all fee data)
DROP TABLE IF EXISTS platform_fees CASCADE;

-- Remove bonded warehouses (WARNING: This will delete all warehouse data)
DROP TABLE IF EXISTS bonded_warehouses CASCADE;

-- Remove reservation extension columns
ALTER TABLE reservations 
  DROP COLUMN IF EXISTS extended_until,
  DROP COLUMN IF EXISTS extension_reason,
  DROP COLUMN IF EXISTS extended_by,
  DROP COLUMN IF EXISTS payment_percentage;

-- Remove listing inventory columns
ALTER TABLE listings
  DROP COLUMN IF EXISTS inventory_type,
  DROP COLUMN IF EXISTS custom_warehouse_name;

-- Remove RPC functions
DROP FUNCTION IF EXISTS extend_reservation(uuid, timestamptz, text);
```

**⚠️ WARNING:** Rollback will delete data. Only use if absolutely necessary.

## Support

If you encounter issues:
1. Check the Supabase logs in Dashboard
2. Verify your database connection
3. Ensure you have the correct permissions
4. Review the migration SQL files for syntax errors


