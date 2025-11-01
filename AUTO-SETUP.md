# Auto Setup Instructions

## Quick Setup (2 methods)

### Method 1: With Database Password (Recommended - Fully Automated)

1. **Get your database password:**
   - Go to: https://supabase.com/dashboard/project/ctinwknfafeshljudolj/settings/database
   - Scroll to "Connection string" section
   - Copy the password from the connection string (the part after `postgres:` and before `@`)

2. **Run the setup script:**
   ```bash
   cd cigaty-dashboard
   DB_PASSWORD=your_password_here node execute-with-password.mjs
   ```

   OR if your password has special characters:
   ```bash
   node execute-with-password.mjs "your_password_here"
   ```

This will:
- ✅ Connect directly to Postgres
- ✅ Execute all SQL migrations
- ✅ Create all tables, policies, functions
- ✅ Set up admin account (director@cigaty.com)
- ✅ Configure admin profile

### Method 2: Manual SQL Execution (If password unavailable)

1. Go to: https://supabase.com/dashboard/project/ctinwknfafeshljudolj/sql/new
2. Copy entire contents of `supabase/ALL_SETUP.sql`
3. Paste and click "Run"
4. Then run: `node finalize-setup.mjs` to configure admin

---

## After Setup

Login credentials:
- Email: director@cigaty.com
- Password: Sehajveer1998

Then:
1. Start dashboard: `npm run dev`
2. Go to: http://localhost:5173/login
3. You'll have full admin access!



