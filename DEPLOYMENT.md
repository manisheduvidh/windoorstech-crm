# 🚀 Official Deployment Guide: Windoorstech CRM

Follow these exact steps to move from local development to a live production environment on Vercel with a Supabase database.

---

## 1. Supabase Setup (Database & Security)

### A. Create Project
1. Sign in to [Supabase.com](https://supabase.com/).
2. Click **"New Project"**.
3. **Name**: `Windoorstech CRM`.
4. **Password**: Set a strong password (save it).
5. **Region**: Choose the one closest to you.
6. Click **"Create new project"** and wait for it to finish setting up.

### B. Configure API Keys
1. Go to **Project Settings** (Gear icon) -> **API**.
2. Copy the **Project URL** and the **anon public** key.
3. Paste them into your local `.env.local` file:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-public-anon-key
   ADMIN_EMAIL=manishcode6@gmail.com
   ```

### C. Run SQL Schema
1. Go to the **SQL Editor** (the `>_` icon on the left).
2. Click **"New Query"** and paste the following code. This creates your tables and enforces your **1-month deletion rule** at the database level.

```sql
-- 1. Create Users Table
create table users (
  id uuid primary key default auth.uid(),
  username text unique not null,
  role text check (role in ('admin', 'admin_view', 'manager', 'employee')),
  display_name text,
  is_frozen boolean default false,
  created_at timestamp with time zone default now()
);

-- 2. Create Leads Table
create table leads (
  id uuid primary key default gen_random_uuid(),
  created_by uuid references users(id),
  created_by_username text,
  lead_quality text not null,
  lead_category text,
  primary_name text,
  primary_category text,
  primary_contact text,
  secondary_name text,
  secondary_category text,
  secondary_contact text,
  location text,
  quote_brand text,
  quote_name text,
  quote_sqft numeric,
  quote_value numeric,
  image_names text[],
  quote_file_name text,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- 3. Enable Security (RLS)
alter table users enable row level security;
alter table leads enable row level security;

-- 4. Set Permissions (Policies)
-- Users can see leads they created, Admins see everything
create policy "Select Policy" on leads for select
  using (auth.uid() = created_by OR (select role from users where id = auth.uid()) IN ('admin', 'admin_view'));

-- ONLY Admins can delete, and ONLY if lead is less than 1 month old
create policy "Admin Delete Policy" on leads for delete
  using (
    (select role from users where id = auth.uid()) = 'admin'
    AND created_at > (now() - interval '1 month')
  );

-- Users can insert their own leads
create policy "Insert Policy" on leads for insert
  with check (auth.uid() = created_by);
```
3. Click **"Run"**.

---

## 2. GitHub Hosting

1. Initialize git if not already done:
   ```powershell
   git init
   git add .
   git commit -m "Build: Fully functional Windoorstech CRM"
   ```
2. Create a repository on [GitHub](https://github.com/new) named `windoorstech-crm`.
3. Push your code:
   ```powershell
   git remote add origin https://github.com/YOUR_USERNAME/windoorstech-crm.git
   git branch -M main
   git push -u origin main
   ```

---

## 3. Vercel Deployment

1. Sign in to [Vercel.com](https://vercel.com/).
2. Click **"Add New"** -> **"Project"**.
3. **Import** your `windoorstech-crm` repository.
4. **Environment Variables**:
   *   Expand the section and add `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
5. Click **"Deploy"**.

---

## 4. Final Step: Activating Live Database
The app currently uses `localStorage` for quick testing. When you are ready to connect the live database:
1. Open `src/lib/leads.js`.
2. I can help you swap the functions from `localStorage` to `supabase` calls. Just ask!
