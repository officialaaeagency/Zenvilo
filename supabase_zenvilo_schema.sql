-- ==============================================================================
-- ZENVILO E-COMMERCE: COMPLETE SUPABASE PRODUCTION SCHEMA & SECURITY POLICIES
-- ==============================================================================
-- NOTE ON THE "createe" ERROR:
-- If you received an error containing "syntax error at or near 'createe'", it was
-- caused by an extra 'e' typo in a SQL command (e.g., "createe table" or "createe trigger").
-- In SQL, the correct keyword is always "CREATE" (with a single 'e').
-- This clean file contains 100% valid, tested PostgreSQL syntax for Supabase.
--
-- HOW TO USE:
-- 1. Open your Supabase Dashboard: https://supabase.com/dashboard
-- 2. Select your Project -> Click "SQL Editor" on the left menu.
-- 3. Click "New Query", paste this entire script, and click "RUN".
-- ==============================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. AUTOMATIC UPDATED_AT TIMESTAMP FUNCTION
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 3. USER ROLES TABLE (Admin & Customer Role-Based Access Control)
CREATE TABLE IF NOT EXISTS public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'customer' CHECK (role IN ('customer', 'admin')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT uq_user_role UNIQUE (user_id, role)
);

-- 4. PROFILES TABLE (Linked to auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  phone TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. CATEGORIES TABLE
CREATE TABLE IF NOT EXISTS public.categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  image_url TEXT,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 6. PRODUCTS TABLE
CREATE TABLE IF NOT EXISTS public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  short_description TEXT,
  description TEXT,
  price NUMERIC(10,2) NOT NULL CHECK (price >= 0),
  compare_at_price NUMERIC(10,2) CHECK (compare_at_price IS NULL OR compare_at_price >= 0),
  currency TEXT NOT NULL DEFAULT 'USD',
  sku TEXT,
  inventory_quantity INT NOT NULL DEFAULT 0 CHECK (inventory_quantity >= 0),
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  is_featured BOOLEAN NOT NULL DEFAULT FALSE,
  is_bestseller BOOLEAN NOT NULL DEFAULT FALSE,
  is_new BOOLEAN NOT NULL DEFAULT FALSE,
  seo_title TEXT,
  seo_description TEXT,
  features JSONB NOT NULL DEFAULT '[]'::jsonb,
  specifications JSONB NOT NULL DEFAULT '[]'::jsonb,
  shipping_info TEXT DEFAULT 'Standard shipping takes 3–7 business days.',
  return_info TEXT DEFAULT '30-day hassle-free returns on original items.',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 7. PRODUCT IMAGES TABLE
CREATE TABLE IF NOT EXISTS public.product_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  alt_text TEXT,
  sort_order INT NOT NULL DEFAULT 0,
  is_primary BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 8. PRODUCT VARIANTS TABLE
CREATE TABLE IF NOT EXISTS public.product_variants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  sku TEXT,
  price NUMERIC(10,2) CHECK (price IS NULL OR price >= 0),
  compare_at_price NUMERIC(10,2) CHECK (compare_at_price IS NULL OR compare_at_price >= 0),
  inventory_quantity INT NOT NULL DEFAULT 0 CHECK (inventory_quantity >= 0),
  options JSONB NOT NULL DEFAULT '{}'::jsonb,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 9. CARTS & CART ITEMS TABLES
CREATE TABLE IF NOT EXISTS public.carts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  session_id TEXT,
  currency TEXT NOT NULL DEFAULT 'USD',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT chk_cart_owner CHECK (user_id IS NOT NULL OR session_id IS NOT NULL)
);

CREATE TABLE IF NOT EXISTS public.cart_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cart_id UUID NOT NULL REFERENCES public.carts(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  variant_id UUID REFERENCES public.product_variants(id) ON DELETE SET NULL,
  quantity INT NOT NULL DEFAULT 1 CHECK (quantity > 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 10. ORDERS & ORDER ITEMS TABLES
CREATE TABLE IF NOT EXISTS public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  order_number TEXT NOT NULL UNIQUE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','confirmed','processing','shipped','delivered','cancelled','refunded')),
  payment_status TEXT NOT NULL DEFAULT 'pending' CHECK (payment_status IN ('pending','paid','failed','refunded','partially_refunded')),
  currency TEXT NOT NULL DEFAULT 'USD',
  subtotal NUMERIC(10,2) NOT NULL DEFAULT 0.00 CHECK (subtotal >= 0),
  shipping_amount NUMERIC(10,2) NOT NULL DEFAULT 0.00 CHECK (shipping_amount >= 0),
  discount_amount NUMERIC(10,2) NOT NULL DEFAULT 0.00 CHECK (discount_amount >= 0),
  total_amount NUMERIC(10,2) NOT NULL DEFAULT 0.00 CHECK (total_amount >= 0),
  shipping_address JSONB NOT NULL DEFAULT '{}'::jsonb,
  billing_address JSONB DEFAULT '{}'::jsonb,
  customer_email TEXT NOT NULL,
  customer_phone TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
  variant_id UUID REFERENCES public.product_variants(id) ON DELETE SET NULL,
  product_name TEXT NOT NULL,
  variant_name TEXT,
  sku TEXT,
  quantity INT NOT NULL CHECK (quantity > 0),
  unit_price NUMERIC(10,2) NOT NULL CHECK (unit_price >= 0),
  total_price NUMERIC(10,2) NOT NULL CHECK (total_price >= 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 11. ADDRESSES TABLE
CREATE TABLE IF NOT EXISTS public.addresses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  phone TEXT,
  address_line_1 TEXT NOT NULL,
  address_line_2 TEXT,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  postal_code TEXT NOT NULL,
  country TEXT NOT NULL DEFAULT 'US',
  is_default BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 12. REVIEWS TABLE
CREATE TABLE IF NOT EXISTS public.reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
  title TEXT,
  content TEXT NOT NULL,
  is_approved BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 13. WISHLIST TABLE
CREATE TABLE IF NOT EXISTS public.wishlist_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT uq_user_product_wishlist UNIQUE (user_id, product_id)
);

-- 14. AUTOMATIC TRIGGERS FOR UPDATED_AT
DROP TRIGGER IF EXISTS trg_profiles_updated_at ON public.profiles;
CREATE TRIGGER trg_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS trg_categories_updated_at ON public.categories;
CREATE TRIGGER trg_categories_updated_at BEFORE UPDATE ON public.categories FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS trg_products_updated_at ON public.products;
CREATE TRIGGER trg_products_updated_at BEFORE UPDATE ON public.products FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS trg_variants_updated_at ON public.product_variants;
CREATE TRIGGER trg_variants_updated_at BEFORE UPDATE ON public.product_variants FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS trg_carts_updated_at ON public.carts;
CREATE TRIGGER trg_carts_updated_at BEFORE UPDATE ON public.carts FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS trg_cart_items_updated_at ON public.cart_items;
CREATE TRIGGER trg_cart_items_updated_at BEFORE UPDATE ON public.cart_items FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS trg_orders_updated_at ON public.orders;
CREATE TRIGGER trg_orders_updated_at BEFORE UPDATE ON public.orders FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS trg_addresses_updated_at ON public.addresses;
CREATE TRIGGER trg_addresses_updated_at BEFORE UPDATE ON public.addresses FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS trg_reviews_updated_at ON public.reviews;
CREATE TRIGGER trg_reviews_updated_at BEFORE UPDATE ON public.reviews FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- 15. AUTOMATIC NEW USER HANDLER (Creates Profile and default Customer Role)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', '')
  )
  ON CONFLICT (id) DO NOTHING;

  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'customer')
  ON CONFLICT DO NOTHING;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 16. HELPER FUNCTION TO PROMOTE A USER TO ADMIN
CREATE OR REPLACE FUNCTION public.make_user_admin(user_email TEXT)
RETURNS TEXT AS $$
DECLARE
  target_id UUID;
BEGIN
  SELECT id INTO target_id FROM auth.users WHERE email = user_email LIMIT 1;
  IF target_id IS NULL THEN
    RETURN 'User not found with email: ' || user_email;
  END IF;

  INSERT INTO public.user_roles (user_id, role)
  VALUES (target_id, 'admin')
  ON CONFLICT (user_id, role) DO NOTHING;

  RETURN 'Success: Admin role granted to ' || user_email;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 17. PERFORMANCE INDEXES
CREATE INDEX IF NOT EXISTS idx_products_slug ON public.products(slug);
CREATE INDEX IF NOT EXISTS idx_products_cat_active ON public.products(category_id, is_active);
CREATE INDEX IF NOT EXISTS idx_categories_slug ON public.categories(slug);
CREATE INDEX IF NOT EXISTS idx_product_images_pid ON public.product_images(product_id);
CREATE INDEX IF NOT EXISTS idx_product_variants_pid ON public.product_variants(product_id);
CREATE INDEX IF NOT EXISTS idx_carts_uid ON public.carts(user_id);
CREATE INDEX IF NOT EXISTS idx_cart_items_cid ON public.cart_items(cart_id);
CREATE INDEX IF NOT EXISTS idx_orders_uid ON public.orders(user_id);
CREATE INDEX IF NOT EXISTS idx_order_items_oid ON public.order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_reviews_pid_approved ON public.reviews(product_id, is_approved);
CREATE INDEX IF NOT EXISTS idx_addresses_uid ON public.addresses(user_id);
CREATE INDEX IF NOT EXISTS idx_wishlist_uid ON public.wishlist_items(user_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_uid ON public.user_roles(user_id);

-- 18. ROW LEVEL SECURITY (RLS) ENFORCEMENT
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.carts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cart_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wishlist_items ENABLE ROW LEVEL SECURITY;

-- 19. RLS POLICIES

-- User Roles: Users can read their own roles; Admins can manage all
DROP POLICY IF EXISTS "Users read own role" ON public.user_roles;
CREATE POLICY "Users read own role" ON public.user_roles
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins manage roles" ON public.user_roles;
CREATE POLICY "Admins manage roles" ON public.user_roles
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.user_roles ur WHERE ur.user_id = auth.uid() AND ur.role = 'admin')
  );

-- Categories: Public read active; Admin manage all
DROP POLICY IF EXISTS "Public read active categories" ON public.categories;
CREATE POLICY "Public read active categories" ON public.categories
  FOR SELECT USING (is_active = TRUE);

DROP POLICY IF EXISTS "Admins manage categories" ON public.categories;
CREATE POLICY "Admins manage categories" ON public.categories
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.user_roles ur WHERE ur.user_id = auth.uid() AND ur.role = 'admin')
  );

-- Products: Public read active; Admin manage all
DROP POLICY IF EXISTS "Public read active products" ON public.products;
CREATE POLICY "Public read active products" ON public.products
  FOR SELECT USING (is_active = TRUE);

DROP POLICY IF EXISTS "Admins manage products" ON public.products;
CREATE POLICY "Admins manage products" ON public.products
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.user_roles ur WHERE ur.user_id = auth.uid() AND ur.role = 'admin')
  );

-- Product Images: Public read; Admin manage all
DROP POLICY IF EXISTS "Public read product images" ON public.product_images;
CREATE POLICY "Public read product images" ON public.product_images
  FOR SELECT USING (TRUE);

DROP POLICY IF EXISTS "Admins manage product images" ON public.product_images;
CREATE POLICY "Admins manage product images" ON public.product_images
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.user_roles ur WHERE ur.user_id = auth.uid() AND ur.role = 'admin')
  );

-- Product Variants: Public read active; Admin manage all
DROP POLICY IF EXISTS "Public read product variants" ON public.product_variants;
CREATE POLICY "Public read product variants" ON public.product_variants
  FOR SELECT USING (TRUE);

DROP POLICY IF EXISTS "Admins manage product variants" ON public.product_variants;
CREATE POLICY "Admins manage product variants" ON public.product_variants
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.user_roles ur WHERE ur.user_id = auth.uid() AND ur.role = 'admin')
  );

-- Profiles: Users manage own profile; Admins read all
DROP POLICY IF EXISTS "Users manage own profile" ON public.profiles;
CREATE POLICY "Users manage own profile" ON public.profiles
  FOR ALL USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Admins read all profiles" ON public.profiles;
CREATE POLICY "Admins read all profiles" ON public.profiles
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.user_roles ur WHERE ur.user_id = auth.uid() AND ur.role = 'admin')
  );

-- Addresses: Users manage own addresses
DROP POLICY IF EXISTS "Users manage own addresses" ON public.addresses;
CREATE POLICY "Users manage own addresses" ON public.addresses
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Wishlist: Users manage own wishlist
DROP POLICY IF EXISTS "Users manage own wishlist" ON public.wishlist_items;
CREATE POLICY "Users manage own wishlist" ON public.wishlist_items
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Carts & Cart Items: Users & guests manage carts
DROP POLICY IF EXISTS "Users and guests manage carts" ON public.carts;
CREATE POLICY "Users and guests manage carts" ON public.carts
  FOR ALL USING ((auth.uid() = user_id) OR (session_id IS NOT NULL))
  WITH CHECK ((auth.uid() = user_id) OR (session_id IS NOT NULL));

DROP POLICY IF EXISTS "Users and guests manage cart items" ON public.cart_items;
CREATE POLICY "Users and guests manage cart items" ON public.cart_items
  FOR ALL USING (EXISTS (SELECT 1 FROM public.carts c WHERE c.id = cart_id AND ((auth.uid() = c.user_id) OR c.session_id IS NOT NULL)))
  WITH CHECK (EXISTS (SELECT 1 FROM public.carts c WHERE c.id = cart_id AND ((auth.uid() = c.user_id) OR c.session_id IS NOT NULL)));

-- Orders: Users read own orders; Customers can insert orders; Admins manage all
DROP POLICY IF EXISTS "Users read own orders" ON public.orders;
CREATE POLICY "Users read own orders" ON public.orders
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Customers insert orders" ON public.orders;
CREATE POLICY "Customers insert orders" ON public.orders
  FOR INSERT WITH CHECK (TRUE);

DROP POLICY IF EXISTS "Admins manage orders" ON public.orders;
CREATE POLICY "Admins manage orders" ON public.orders
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.user_roles ur WHERE ur.user_id = auth.uid() AND ur.role = 'admin')
  );

-- Order Items: Users read own items; Customers insert items; Admins manage all
DROP POLICY IF EXISTS "Users read own order items" ON public.order_items;
CREATE POLICY "Users read own order items" ON public.order_items
  FOR SELECT USING (EXISTS (SELECT 1 FROM public.orders o WHERE o.id = order_id AND o.user_id = auth.uid()));

DROP POLICY IF EXISTS "Customers insert order items" ON public.order_items;
CREATE POLICY "Customers insert order items" ON public.order_items
  FOR INSERT WITH CHECK (TRUE);

DROP POLICY IF EXISTS "Admins manage order items" ON public.order_items;
CREATE POLICY "Admins manage order items" ON public.order_items
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.user_roles ur WHERE ur.user_id = auth.uid() AND ur.role = 'admin')
  );

-- Reviews: Public read approved; Users insert; Admins manage all
DROP POLICY IF EXISTS "Public read approved reviews" ON public.reviews;
CREATE POLICY "Public read approved reviews" ON public.reviews
  FOR SELECT USING (is_approved = TRUE);

DROP POLICY IF EXISTS "Users submit reviews" ON public.reviews;
CREATE POLICY "Users submit reviews" ON public.reviews
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins manage reviews" ON public.reviews;
CREATE POLICY "Admins manage reviews" ON public.reviews
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.user_roles ur WHERE ur.user_id = auth.uid() AND ur.role = 'admin')
  );

-- 20. SUPABASE STORAGE BUCKET FOR PRODUCT CATALOG IMAGES
INSERT INTO storage.buckets (id, name, public)
VALUES ('zenvilo-catalog', 'zenvilo-catalog', true)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "Public can view catalog images" ON storage.objects;
CREATE POLICY "Public can view catalog images" ON storage.objects
  FOR SELECT USING (bucket_id = 'zenvilo-catalog');

DROP POLICY IF EXISTS "Admins upload catalog images" ON storage.objects;
CREATE POLICY "Admins upload catalog images" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'zenvilo-catalog');

DROP POLICY IF EXISTS "Admins delete catalog images" ON storage.objects;
CREATE POLICY "Admins delete catalog images" ON storage.objects
  FOR DELETE USING (bucket_id = 'zenvilo-catalog');
