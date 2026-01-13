# Supabase + Vercel Deployment Guide

This guide will walk you through setting up Supabase as your backend and deploying your e-commerce platform to Vercel.

---

## Table of Contents

1. [Supabase Setup](#supabase-setup)
2. [Database Schema](#database-schema)
3. [Row Level Security](#row-level-security)
4. [Storage Setup](#storage-setup)
5. [Authentication Setup](#authentication-setup)
6. [Local Development](#local-development)
7. [Vercel Deployment](#vercel-deployment)
8. [Post-Deployment](#post-deployment)

---

## Supabase Setup

### Step 1: Create Supabase Account

1. Go to [supabase.com](https://supabase.com)
2. Click "Start your project"
3. Sign up with GitHub, Google, or email

### Step 2: Create New Project

1. Click "New Project"
2. Fill in project details:
   - **Name**: `babans-shop` (or your preferred name)
   - **Database Password**: Create a strong password (save this!)
   - **Region**: Choose closest to your users
   - **Pricing Plan**: Free tier is sufficient to start
3. Click "Create new project"
4. Wait 2-3 minutes for project initialization

### Step 3: Get API Credentials

1. Go to **Settings** → **API**
2. Copy the following:
   - **Project URL** (e.g., `https://abcdefgh.supabase.co`)
   - **anon/public key** (starts with `eyJ...`)

---

## Database Schema

### Step 1: Open SQL Editor

1. In your Supabase dashboard, click **SQL Editor**
2. Click **New Query**

### Step 2: Create Tables

Copy and paste this SQL script, then click **Run**:

```sql
-- Create users table (extends auth.users)
CREATE TABLE public.users (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  email TEXT NOT NULL,
  display_name TEXT,
  role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create products table
CREATE TABLE public.products (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  price NUMERIC(10, 2) NOT NULL CHECK (price >= 0),
  image_url TEXT NOT NULL,
  category TEXT NOT NULL,
  tags TEXT[] DEFAULT '{}',
  stock INTEGER DEFAULT 0 CHECK (stock >= 0),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create carts table
CREATE TABLE public.carts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  product_id UUID REFERENCES public.products ON DELETE CASCADE NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1 CHECK (quantity > 0),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, product_id)
);

-- Create orders table
CREATE TABLE public.orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  items JSONB NOT NULL,
  total_amount NUMERIC(10, 2) NOT NULL CHECK (total_amount >= 0),
  shipping_address JSONB NOT NULL,
  payment_method TEXT NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'shipped', 'delivered', 'cancelled')),
  is_paid BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_products_category ON public.products(category);
CREATE INDEX idx_products_created_at ON public.products(created_at DESC);
CREATE INDEX idx_carts_user_id ON public.carts(user_id);
CREATE INDEX idx_orders_user_id ON public.orders(user_id);
CREATE INDEX idx_orders_created_at ON public.orders(created_at DESC);
CREATE INDEX idx_orders_status ON public.orders(status);
```

---

## Row Level Security

### Step 1: Enable RLS

In the same SQL Editor, run this script:

```sql
-- Enable Row Level Security
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.carts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
```

### Step 2: Create RLS Policies

Run this script to set up security policies:

```sql
-- Users table policies
CREATE POLICY "Users can read own data" ON public.users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own data" ON public.users
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Admins can read all users" ON public.users
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
  );

-- Products table policies
CREATE POLICY "Anyone can read products" ON public.products
  FOR SELECT USING (true);

CREATE POLICY "Admins can insert products" ON public.products
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Admins can update products" ON public.products
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Admins can delete products" ON public.products
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
  );

-- Carts table policies
CREATE POLICY "Users can manage own cart" ON public.carts
  FOR ALL USING (auth.uid() = user_id);

-- Orders table policies
CREATE POLICY "Users can read own orders" ON public.orders
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own orders" ON public.orders
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can read all orders" ON public.orders
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Admins can update orders" ON public.orders
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
  );
```

---

## Storage Setup

### Step 1: Create Storage Bucket

1. Go to **Storage** in Supabase dashboard
2. Click **New bucket**
3. Name it `products`
4. Make it **Public**
5. Click **Create bucket**

### Step 2: Set Storage Policies

1. Click on the `products` bucket
2. Go to **Policies** tab
3. Click **New Policy** → **For full customization**
4. Add these policies:

**Policy 1: Public Read**
```sql
CREATE POLICY "Public can view product images" ON storage.objects
  FOR SELECT USING (bucket_id = 'products');
```

**Policy 2: Admin Upload**
```sql
CREATE POLICY "Admins can upload product images" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'products' AND
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
  );
```

**Policy 3: Admin Delete**
```sql
CREATE POLICY "Admins can delete product images" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'products' AND
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
  );
```

---

## Authentication Setup

### Step 1: Configure Email Provider

1. Go to **Authentication** → **Providers**
2. **Email** should be enabled by default
3. Configure email templates (optional):
   - Go to **Email Templates**
   - Customize confirmation and password reset emails

### Step 2: Configure Google OAuth (Optional)

1. Go to **Authentication** → **Providers**
2. Find **Google** and click to configure
3. Follow Supabase's guide to set up Google OAuth:
   - Create Google Cloud project
   - Enable Google+ API
   - Create OAuth credentials
   - Add authorized redirect URIs
4. Paste Client ID and Client Secret
5. Click **Save**

### Step 3: Configure Redirect URLs

1. Go to **Authentication** → **URL Configuration**
2. Add your site URLs:
   - **Site URL**: `http://localhost:3000` (for development)
   - **Redirect URLs**: 
     - `http://localhost:3000`
     - `https://your-domain.vercel.app` (add after deployment)

---

## Local Development

### Step 1: Configure Environment Variables

1. Open `.env.local` in your project root
2. Add your Supabase credentials:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
VITE_ADMIN_EMAIL=your-admin-email@example.com
```

3. Replace:
   - `your-project.supabase.co` with your Project URL
   - `your-anon-key-here` with your anon/public key
   - `your-admin-email@example.com` with your email (for admin access)

### Step 2: Install Dependencies

```bash
npm install
```

### Step 3: Run Development Server

```bash
npm run dev
```

The app should now run at `http://localhost:3000` with full Supabase integration!

---

## Vercel Deployment

### Step 1: Push to GitHub

1. Initialize git (if not already):
```bash
git init
git add .
git commit -m "Migrated to Supabase"
```

2. Create a new repository on GitHub
3. Push your code:
```bash
git remote add origin https://github.com/yourusername/your-repo.git
git branch -M main
git push -u origin main
```

### Step 2: Deploy to Vercel

1. Go to [vercel.com](https://vercel.com)
2. Sign up/login with GitHub
3. Click **Add New** → **Project**
4. Import your GitHub repository
5. Configure project:
   - **Framework Preset**: Vite
   - **Root Directory**: `./`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`

### Step 3: Add Environment Variables

In Vercel project settings:

1. Go to **Settings** → **Environment Variables**
2. Add these variables:
   - `VITE_SUPABASE_URL` = `https://your-project.supabase.co`
   - `VITE_SUPABASE_ANON_KEY` = `your-anon-key`
   - `VITE_ADMIN_EMAIL` = `your-admin-email@example.com`
3. Click **Save**

### Step 4: Deploy

1. Click **Deploy**
2. Wait for deployment to complete (1-2 minutes)
3. Your site will be live at `https://your-project.vercel.app`

---

## Post-Deployment

### Step 1: Update Supabase Redirect URLs

1. Go back to Supabase dashboard
2. **Authentication** → **URL Configuration**
3. Add your Vercel URL to **Redirect URLs**:
   - `https://your-project.vercel.app`

### Step 2: Create Admin Account

1. Visit your deployed site
2. Click **Register**
3. Use the email you set as `VITE_ADMIN_EMAIL`
4. Complete registration
5. You now have admin access!

### Step 3: Add Products

1. Login as admin
2. Go to **Admin Dashboard**
3. Use the **Add Product** form to add your products
4. Upload product images

### Step 4: Test Everything

- ✅ User registration and login
- ✅ Product browsing and search
- ✅ Add to cart functionality
- ✅ Checkout process
- ✅ Order placement
- ✅ Admin dashboard access
- ✅ Product management

---

## Troubleshooting

### Issue: "Supabase is not configured"

**Solution**: Check that environment variables are set correctly in `.env.local` (local) or Vercel settings (production).

### Issue: "Row Level Security policy violation"

**Solution**: Ensure all RLS policies are created correctly. Re-run the RLS SQL scripts.

### Issue: "Failed to upload image"

**Solution**: 
1. Check that `products` storage bucket exists and is public
2. Verify storage policies are set correctly
3. Ensure you're logged in as admin

### Issue: "Google OAuth not working"

**Solution**:
1. Verify Google OAuth credentials in Supabase
2. Check redirect URLs include your domain
3. Ensure Google Cloud project has correct authorized origins

---

## Database Backup

### Recommended: Enable Point-in-Time Recovery

1. Go to **Database** → **Backups**
2. Enable **Point in Time Recovery** (available on paid plans)
3. Or manually export database:
   - Go to **Database** → **Backups**
   - Click **Download backup**

---

## Monitoring

### Supabase Dashboard

Monitor your application:
- **Database**: Check table sizes and query performance
- **Authentication**: View user signups and activity
- **Storage**: Monitor storage usage
- **API**: Check API request logs

### Vercel Analytics

1. Go to Vercel project → **Analytics**
2. View page views, performance metrics
3. Enable **Web Analytics** for detailed insights

---

## Scaling

### Free Tier Limits

- **Database**: 500MB
- **Storage**: 1GB
- **Bandwidth**: 2GB/month
- **Monthly Active Users**: Unlimited

### Upgrade When Needed

When you outgrow free tier:
1. Go to Supabase **Settings** → **Billing**
2. Choose **Pro** plan ($25/month)
3. Get 8GB database, 100GB storage, 250GB bandwidth

---

## Support

- **Supabase Docs**: [supabase.com/docs](https://supabase.com/docs)
- **Vercel Docs**: [vercel.com/docs](https://vercel.com/docs)
- **Community**: [Supabase Discord](https://discord.supabase.com)

---

## Summary

✅ **Supabase project created**
✅ **Database schema set up**
✅ **Row Level Security configured**
✅ **Storage bucket created**
✅ **Authentication enabled**
✅ **Deployed to Vercel**
✅ **Admin account created**

Your e-commerce platform is now live and fully functional!
