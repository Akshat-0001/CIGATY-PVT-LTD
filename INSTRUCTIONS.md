# 🚨 CRITICAL: Apply SQL Migration

## The Error You're Seeing

The error `Could not find the function public.confirm_reservation_with_quantity_reduction` means **the function doesn't exist in your database yet**.

## How to Fix

### Step 1: Open Supabase Dashboard
1. Go to https://supabase.com/dashboard
2. Select your project: `ctinwknfafeshljudolj`
3. Click on **"SQL Editor"** in the left sidebar

### Step 2: Run the SQL
1. Click **"New Query"** button
2. Open the file `FINAL_FIX.sql` from this folder
3. **Copy the ENTIRE contents** of `FINAL_FIX.sql`
4. **Paste it** into the SQL Editor
5. Click **"Run"** button (or press `Ctrl+Enter` / `Cmd+Enter`)

### Step 3: Verify It Worked
You should see in the results:
- `routine_name: confirm_reservation_with_quantity_reduction`
- `routine_type: FUNCTION`

### Step 4: Refresh Schema Cache
If the function still doesn't work after creating it:
1. Wait 10-30 seconds (Supabase needs to refresh)
2. Or restart your Supabase project (Settings → General → Restart)
3. Or wait for automatic refresh (can take a few minutes)

### Step 5: Refresh Your Browser
1. Hard refresh: `Ctrl+Shift+R` (Windows/Linux) or `Cmd+Shift+R` (Mac)
2. Clear browser cache if needed
3. Try confirming a reservation again

## If It Still Doesn't Work

1. **Check the function exists:**
   ```sql
   SELECT * FROM information_schema.routines 
   WHERE routine_name = 'confirm_reservation_with_quantity_reduction';
   ```
   If this returns nothing, the function wasn't created.

2. **Check for errors in SQL Editor:**
   - Look at the bottom of the SQL Editor for any red error messages
   - Check if there are permission issues

3. **Verify you're in the correct schema:**
   - Make sure you're executing in the `public` schema
   - The function should be: `public.confirm_reservation_with_quantity_reduction`

## Common Issues

### Issue: "Permission denied"
**Solution:** Make sure you're using an admin account or have proper permissions.

### Issue: "Syntax error"
**Solution:** Copy the SQL exactly as provided. Don't modify it.

### Issue: "Function created but still 404"
**Solution:** 
- Wait 30 seconds for schema cache refresh
- Restart your Supabase project
- Clear browser cache and refresh

## Need Help?

If you've followed all steps and still get the error:
1. Screenshot the SQL Editor after running the SQL
2. Check if there are any error messages
3. Verify the function exists using the verification query above

