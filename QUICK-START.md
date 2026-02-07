# 🚀 Cigaty Trade Portal - Quick Start Guide

## ✅ Setup Complete!

Your Supabase database is fully configured with:
- ✅ All tables created
- ✅ RLS policies active
- ✅ Admin account ready
- ✅ Views and functions working

---

## 🎯 Getting Started

### 1. Configure Environment Variables

Create `.env.local` file in `cigaty-dashboard` folder:

```bash
cd cigaty-dashboard
cat > .env.local << 'EOF'
VITE_SUPABASE_URL=https://ctinwknfafeshljudolj.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN0aW53a25mYWZlc2hsanVkb2xqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE4NTE2NzIsImV4cCI6MjA3NzQyNzY3Mn0.oQxE5rXWlBr89N4J4poxDDD2mfg5kUNG9Wur2tqK32w
EOF
```

### 2. Start the Dashboard

```bash
cd cigaty-dashboard
npm install  # if not done already
npm run dev
```

### 3. Login

1. Open: http://localhost:5173/login
2. Enter:
   - **Email**: `director@cigaty.com`
   - Use **magic link** (click "Send magic link")
   - Check your email and click the link

---

## 📊 What You Can Do Now

### Admin Features:
- **Live Offers** (`/live-offers`) - View all approved listings
- **Admin Approvals** (`/admin/approvals`) - Approve/reject pending listings
- **My Stock** (`/my-stock`) - Manage your listings
- **Product Pages** - Click any product in Live Offers to see details

### Regular User Features:
- **Register** - New users can sign up
- **KYC Verification** - 3-step document upload
- **Create Listings** - Add products to sell

---

## 📦 Import Your Liquor Catalogue (Next Step)

1. **Export Excel to CSV:**
   - Open `Cigaty. stock offer (2025).xlsx`
   - Save as CSV (UTF-8 encoding)

2. **Upload to Supabase:**
   - Go to: https://supabase.com/dashboard/project/ctinwknfafeshljudolj/editor
   - Find `liquor_catalog_tmp` table (or create it if needed)
   - Click "Insert" → "Import CSV"
   - Upload your CSV file

3. **Normalize Data:**
   - Go to SQL Editor
   - Run the normalization SQL from `supabase/04_import_scaffold.sql`
   - This will populate `brands`, `categories`, `countries`, and `liquor_catalog`

---

## 🎨 Dashboard Routes

- `/` - Home/Index
- `/login` - Login page
- `/register` - Registration
- `/verify` - KYC verification
- `/live-offers` - Browse all approved listings
- `/product/:id` - Product detail page
- `/my-stock` - Your listings
- `/my-activity` - Your activity history
- `/admin/approvals` - Admin approval queue (admin only)

---

## 🔐 Admin Credentials

- **Email**: director@cigaty.com
- **Password**: Sehajveer1998
- **Role**: admin
- **KYC Status**: approved

---

## 🐛 Troubleshooting

### Can't login?
- Make sure `.env.local` exists with correct values
- Restart the dev server after creating `.env.local`
- Check browser console for errors

### Tables not showing?
- Verify SQL executed successfully in Supabase
- Run `node verify-setup.mjs` to check status

### Connection errors?
- Verify Supabase URL and anon key in `.env.local`
- Check Supabase project is active

---

## 🎉 You're Ready!

Everything is set up and working. Start the dashboard and begin trading!



