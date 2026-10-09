-- ==============================================================================
-- ZENVILO E-COMMERCE: ADMIN-ONLY PRODUCT MANAGEMENT SCHEMA UPGRADE
-- ==============================================================================
-- This SQL migration upgrades your Zenvilo database to support complete
-- professional product management with admin-only cost pricing, inventory
-- controls, multi-variants, image uploads, shipping specs, SEO, and FAQs.
--
-- RUN THIS IN SUPABASE:
-- 1. Go to your Supabase Dashboard -> SQL Editor
-- 2. Click "New Query", paste this entire script, and click "RUN"
-- ==============================================================================

-- 1. UPGRADE PRODUCTS TABLE WITH ENTERPRISE FIELDS
ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS brand TEXT DEFAULT 'Zenvilo',
  ADD COLUMN IF NOT EXISTS subcategory TEXT,
  ADD COLUMN IF NOT EXISTS product_type TEXT DEFAULT 'physical',
  ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active',
  ADD COLUMN IF NOT EXISTS cost_price NUMERIC(10,2),
  ADD COLUMN IF NOT EXISTS track_inventory BOOLEAN DEFAULT TRUE,
  ADD COLUMN IF NOT EXISTS low_stock_threshold INT DEFAULT 5,
  ADD COLUMN IF NOT EXISTS allow_backorders BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS weight NUMERIC(10,2),
  ADD COLUMN IF NOT EXISTS dimensions JSONB DEFAULT '{"length": 0, "width": 0, "height": 0, "unit": "cm"}'::jsonb,
  ADD COLUMN IF NOT EXISTS dimensions_text TEXT,
  ADD COLUMN IF NOT EXISTS shipping_class TEXT DEFAULT 'standard',
  ADD COLUMN IF NOT EXISTS processing_time TEXT DEFAULT '1-2 business days',
  ADD COLUMN IF NOT EXISTS materials TEXT,
  ADD COLUMN IF NOT EXISTS whats_included TEXT,
  ADD COLUMN IF NOT EXISTS care_instructions TEXT,
  ADD COLUMN IF NOT EXISTS warranty_info TEXT,
  ADD COLUMN IF NOT EXISTS internal_notes TEXT,
  ADD COLUMN IF NOT EXISTS seo_keywords TEXT,
  ADD COLUMN IF NOT EXISTS is_homepage_visible BOOLEAN DEFAULT TRUE,
  ADD COLUMN IF NOT EXISTS is_shop_visible BOOLEAN DEFAULT TRUE,
  ADD COLUMN IF NOT EXISTS sort_order INT DEFAULT 0,
  ADD COLUMN IF NOT EXISTS faqs JSONB DEFAULT '[]'::jsonb;

-- Add check constraint for status if not exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'chk_products_status'
  ) THEN
    ALTER TABLE public.products ADD CONSTRAINT chk_products_status
      CHECK (status IN ('active', 'draft', 'inactive'));
  END IF;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- 2. UPGRADE PRODUCT VARIANTS TABLE
ALTER TABLE public.product_variants
  ADD COLUMN IF NOT EXISTS cost_price NUMERIC(10,2),
  ADD COLUMN IF NOT EXISTS image_url TEXT,
  ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE;

-- 3. UPGRADE PRODUCT IMAGES TABLE
ALTER TABLE public.product_images
  ADD COLUMN IF NOT EXISTS alt_text TEXT;

-- 4. PERFORMANCE INDEXES
CREATE INDEX IF NOT EXISTS idx_products_status ON public.products(status);
CREATE INDEX IF NOT EXISTS idx_products_brand ON public.products(brand);
CREATE INDEX IF NOT EXISTS idx_products_sort_order ON public.products(sort_order);
CREATE INDEX IF NOT EXISTS idx_products_sku ON public.products(sku);
CREATE INDEX IF NOT EXISTS idx_variants_sku ON public.product_variants(sku);

-- 5. SECURE ROW LEVEL SECURITY (RLS) POLICIES
-- Ensure RLS is enabled on all product tables
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_variants ENABLE ROW LEVEL SECURITY;

-- PRODUCTS:
-- Public can ONLY read Active products meant for storefront
DROP POLICY IF EXISTS "Public read active products" ON public.products;
CREATE POLICY "Public read active products"
  ON public.products
  FOR SELECT
  USING (is_active = TRUE AND status = 'active');

-- Strict Admin-only policy for managing all products (create, edit, delete, draft view)
DROP POLICY IF EXISTS "Admins manage products" ON public.products;
CREATE POLICY "Admins manage products"
  ON public.products
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles ur
      WHERE ur.user_id = auth.uid()
        AND ur.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.user_roles ur
      WHERE ur.user_id = auth.uid()
        AND ur.role = 'admin'
    )
  );

-- PRODUCT IMAGES:
DROP POLICY IF EXISTS "Public read product images" ON public.product_images;
CREATE POLICY "Public read product images"
  ON public.product_images
  FOR SELECT
  USING (TRUE);

DROP POLICY IF EXISTS "Admins manage product images" ON public.product_images;
CREATE POLICY "Admins manage product images"
  ON public.product_images
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles ur
      WHERE ur.user_id = auth.uid()
        AND ur.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.user_roles ur
      WHERE ur.user_id = auth.uid()
        AND ur.role = 'admin'
    )
  );

-- PRODUCT VARIANTS:
DROP POLICY IF EXISTS "Public read product variants" ON public.product_variants;
CREATE POLICY "Public read product variants"
  ON public.product_variants
  FOR SELECT
  USING (is_active = TRUE);

DROP POLICY IF EXISTS "Admins manage product variants" ON public.product_variants;
CREATE POLICY "Admins manage product variants"
  ON public.product_variants
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles ur
      WHERE ur.user_id = auth.uid()
        AND ur.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.user_roles ur
      WHERE ur.user_id = auth.uid()
        AND ur.role = 'admin'
    )
  );

-- 6. STORAGE BUCKET FOR PRODUCT CATALOG IMAGES
INSERT INTO storage.buckets (id, name, public)
VALUES ('zenvilo-catalog', 'zenvilo-catalog', TRUE)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "Public can view catalog images" ON storage.objects;
CREATE POLICY "Public can view catalog images"
  ON storage.objects
  FOR SELECT
  USING (bucket_id = 'zenvilo-catalog');

DROP POLICY IF EXISTS "Admins upload catalog images" ON storage.objects;
CREATE POLICY "Admins upload catalog images"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'zenvilo-catalog' AND
    EXISTS (
      SELECT 1 FROM public.user_roles ur
      WHERE ur.user_id = auth.uid()
        AND ur.role = 'admin'
    )
  );

DROP POLICY IF EXISTS "Admins delete catalog images" ON storage.objects;
CREATE POLICY "Admins delete catalog images"
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'zenvilo-catalog' AND
    EXISTS (
      SELECT 1 FROM public.user_roles ur
      WHERE ur.user_id = auth.uid()
        AND ur.role = 'admin'
    )
  );
