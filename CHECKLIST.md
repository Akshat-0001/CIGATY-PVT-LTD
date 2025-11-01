# Authentication Implementation Checklist

## ❌ NOT MATCHING PROMPT:

1. **Routes Structure:**
   - Current: `/login`, `/register`, `/verify`
   - Prompt wants: `/auth/login`, `/auth/register/step1`, `/step2`, `/step3`, `/auth/pending`
   - Status: ❌ WRONG STRUCTURE

2. **Profile Schema:**
   - Current: `id, company_id, full_name, role, kyc_status, currency`
   - Prompt wants: `full_name, company_name, email, phone, country, address, gst_number, vat_certificate, document1, document2, document3, status`
   - Status: ❌ WRONG SCHEMA

3. **Registration Steps:**
   - Current Step 1: First/Middle/Last Name, Position, Email, Primary/Secondary Phone, Preferred Contact, Password
   - Prompt Step 1: Full Name, Email, Password, Confirm Password
   - Status: ❌ TOO MANY FIELDS
   
   - Current Step 2: Company Name, Address Lines, City, ZIP, Country, Registration Number, VAT Number, Director Name
   - Prompt Step 2: Company Name, Phone, Country, Address, GST Number (optional)
   - Status: ❌ DIFFERENT FIELDS
   
   - Current Step 3: Photo ID, Company Registration, Proof of Address, VAT Certificate
   - Prompt Step 3: Trade License (required), Incorporation Certificate (required), ID Proof (required), VAT Certificate (optional)
   - Status: ❌ DIFFERENT DOCUMENTS

4. **Login Redirect:**
   - Current: Redirects to `/live-offers` or `/verify`
   - Prompt wants: `/live-offers` if `status = approved`, `/auth/pending` if `status = pending`
   - Status: ❌ WRONG REDIRECT LOGIC

5. **Pending Page:**
   - Current: `/verify` page exists but different from prompt
   - Prompt wants: `/auth/pending` with specific message
   - Status: ❌ WRONG PAGE

6. **Status Field:**
   - Current: Uses `kyc_status` (pending/approved/rejected)
   - Prompt wants: `status` (pending/approved/rejected)
   - Status: ❌ WRONG FIELD NAME

7. **Storage Bucket:**
   - Current: `company-docs`
   - Prompt wants: `documents`
   - Status: ❌ WRONG NAME

## ✅ MATCHING PROMPT:

1. ✅ Password-based authentication (not email-only)
2. ✅ 3-step registration flow exists
3. ✅ Document upload functionality
4. ✅ Supabase integration
5. ✅ Beautiful UI with animations
6. ✅ Protected routes component exists
7. ✅ Toast notifications

## 🔧 NEEDS TO BE FIXED:

1. Reorganize routes to `/auth/*` structure
2. Update profile schema/helpers to match prompt exactly
3. Simplify registration steps to match prompt
4. Rename `kyc_status` to `status` or update all references
5. Create proper `/auth/pending` page
6. Fix login redirects
7. Update storage bucket name
