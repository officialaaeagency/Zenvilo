CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE OR REPLACE FUNCTION set_updated_at() RETURNS TRIGGER AS $$ BEGIN NEW.updated_at = NOW(); RETURN NEW; END; $$ LANGUAGE plpgsql;
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE, full_name TEXT, phone TEXT, avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE TABLE IF NOT EXISTS public.categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(), name TEXT NOT NULL, slug TEXT NOT NULL UNIQUE, description TEXT, image_url TEXT,
  is_active BOOLEAN NOT NULL DEFAULT TRUE, created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE TABLE IF NOT EXISTS public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(), category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
  name TEXT NOT NULL, slug TEXT NOT NULL UNIQUE, short_description TEXT, description TEXT,
  price NUMERIC(10,2) NOT NULL CHECK (price >= 0), compare_at_price NUMERIC(10,2) CHECK (compare_at_price IS NULL OR compare_at_price >= 0),
  currency TEXT NOT NULL DEFAULT 'USD', sku TEXT, inventory_quantity INT NOT NULL DEFAULT 0 CHECK (inventory_quantity >= 0),
  is_active BOOLEAN NOT NULL DEFAULT TRUE, is_featured BOOLEAN NOT NULL DEFAULT FALSE, is_bestseller BOOLEAN NOT NULL DEFAULT FALSE, is_new BOOLEAN NOT NULL DEFAULT FALSE,
  seo_title TEXT, seo_description TEXT, created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE TABLE IF NOT EXISTS public.product_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(), product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL, alt_text TEXT, sort_order INT NOT NULL DEFAULT 0, is_primary BOOLEAN NOT NULL DEFAULT FALSE, created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE TABLE IF NOT EXISTS public.product_variants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(), product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  name TEXT NOT NULL, sku TEXT, price NUMERIC(10,2) CHECK (price IS NULL OR price >= 0), compare_at_price NUMERIC(10,2) CHECK (compare_at_price IS NULL OR compare_at_price >= 0),
  inventory_quantity INT NOT NULL DEFAULT 0 CHECK (inventory_quantity >= 0), options JSONB NOT NULL DEFAULT '{}'::jsonb, is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE TABLE IF NOT EXISTS public.carts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(), user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE, session_id TEXT, currency TEXT NOT NULL DEFAULT 'USD',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), CONSTRAINT chk_cart_owner CHECK (user_id IS NOT NULL OR session_id IS NOT NULL)
);
CREATE TABLE IF NOT EXISTS public.cart_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(), cart_id UUID NOT NULL REFERENCES public.carts(id) ON DELETE CASCADE, product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  variant_id UUID REFERENCES public.product_variants(id) ON DELETE SET NULL, quantity INT NOT NULL DEFAULT 1 CHECK (quantity > 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE TABLE IF NOT EXISTS public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(), user_id REFERENCES auth.users(id) ON DELETE SET NULL, order_number TEXT NOT NULL UNIQUE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','confirmed','processing','shipped','delivered','cancelled','refunded')),
  payment_status TEXT NOT NULL DEFAULT 'pending' CHECK (payment_status IN ('pending','paid','failed','refunded','partially_refunded')),
  currency TEXT NOT NULL DEFAULT 'USD', subtotal NUMERIC(10,2) NOT NULL CHECK (subtotal >= 0), shipping_amount NUMERIC(10,2) NOT NULL DEFAULT 0 CHECK (shipping_amount >= 0),
  discount_amount NUMERIC(10,2) NOT NULL DEFAULT 0 CHECK (discount_amount >= 0), total_amount NUMERIC(10,2) NOT NULL CHECK (total_amount >= 0),
  shipping_address JSONB NOT NULL DEFAULT '{}'::jsonb, billing_address JSONB DEFAULT '{}'::jsonb, customer_email TEXT NOT NULL, customer_phone TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE TABLE IF NOT EXISTS public.order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(), order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES public.products(id) ON DELETE SET NULL, variant_id UUID REFERENCES public.product_variants(id) ON DELETE SET NULL,
  product_name TEXT NOT NULL, variant_name TEXT, sku TEXT, quantity INT NOT NULL CHECK (quantity > 0), unit_price NUMERIC(10,2) NOT NULL CHECK (unit_price >= 0),
  total_price NUMERIC(10,2) NOT NULL CHECK (total_price >= 0), created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE TABLE IF NOT EXISTS public.addresses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(), user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE, full_name TEXT NOT NULL, phone TEXT,
  address_line_1 TEXT NOT NULL, address_line_2 TEXT, city TEXT NOT NULL, state TEXT NOT NULL, postal_code TEXT NOT NULL, country TEXT NOT NULL DEFAULT 'US',
  is_default BOOLEAN NOT NULL DEFAULT FALSE, created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE TABLE IF NOT EXISTS public.reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(), product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  user_id REFERENCES auth.users(id) ON DELETE SET NULL, rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5), title TEXT, content TEXT NOT NULL,
  is_approved BOOLEAN NOT NULL DEFAULT FALSE, created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE TABLE IF NOT EXISTS public.wishlist_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(), user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE, created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT uq_user_product_wishlist UNIQUE (user_id, product_id)
);
CREATE TRIGGER trg_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_categories_updated_at BEFORE UPDATE ON public.categories FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_products_updated_at BEFORE UPDATE ON public.products FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_variants_updated_at BEFORE UPDATE ON public.product_variants FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_carts_updated_at BEFORE UPDATE ON public.carts FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_cart_items_updated_at BEFORE UPDATE ON public.cart_items FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_orders_updated_at BEFORE UPDATE ON public.orders FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_addresses_updated_at BEFORE UPDATE ON public.addresses FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_reviews_updated_at BEFORE UPDATE ON public.reviews FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE INDEX IF NOT EXISTS idx_products_slug ON public.products(slug); CREATE INDEX IF NOT EXISTS idx_products_cat_active ON public.products(category_id, is_active);
CREATE INDEX IF NOT EXISTS idx_categories_slug ON public.categories(slug); CREATE INDEX IF NOT EXISTS idx_product_images_pid ON public.product_images(product_id);
CREATE INDEX IF NOT EXISTS idx_product_variants_pid ON public.product_variants(product_id); CREATE INDEX IF NOT EXISTS idx_carts_uid ON public.carts(user_id);
CREATE INDEX IF NOT EXISTS idx_cart_items_cid ON public.cart_items(cart_id); CREATE INDEX IF NOT EXISTS idx_orders_uid ON public.orders(user_id);
CREATE INDEX IF NOT EXISTS idx_order_items_oid ON public.order_items(order_id); CREATE INDEX IF NOT EXISTS idx_reviews_pid_approved ON public.reviews(product_id, is_approved);
CREATE INDEX IF NOT EXISTS idx_addresses_uid ON public.addresses(user_id); CREATE INDEX IF NOT EXISTS idx_wishlist_uid ON public.wishlist_items(user_id);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY; ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY; ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_images ENABLE ROW LEVEL SECURITY; ALTER TABLE public.product_variants ENABLE ROW LEVEL SECURITY; ALTER TABLE public.carts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cart_items ENABLE ROW LEVEL SECURITY; ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY; ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.addresses ENABLE ROW LEVEL SECURITY; ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY; ALTER TABLE public.wishlist_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read active categories" ON public.categories FOR SELECT USING (is_active = TRUE);
CREATE POLICY "Public read active products" ON public.products FOR SELECT USING (is_active = TRUE);
CREATE POLICY "Public read product images" ON public.product_images FOR SELECT USING (EXISTS (SELECT 1 FROM public.products p WHERE p.id = product_id AND p.is_active = TRUE));
CREATE POLICY "Public read active variants" ON public.product_variants FOR SELECT USING (is_active = TRUE AND EXISTS (SELECT 1 FROM public.products p WHERE p.id = product_id AND p.is_active = TRUE));
CREATE POLICY "Public read approved reviews" ON public.reviews FOR SELECT USING (is_approved = TRUE);
CREATE POLICY "Users manage own profile" ON public.profiles FOR ALL USING (auth.uid() = id) WITH CHECK (auth.uid() = id);
CREATE POLICY "Users manage own addresses" ON public.addresses FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users manage own wishlist" ON public.wishlist_items FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users and guests manage carts" ON public.carts FOR ALL USING ((auth.uid() = user_id) OR (session_id IS NOT NULL)) WITH CHECK ((auth.uid() = user_id) OR (session_id IS NOT NULL));
CREATE POLICY "Users and guests manage cart items" ON public.cart_items FOR ALL USING (EXISTS (SELECT 1 FROM public.carts c WHERE c.id = cart_id AND ((auth.uid() = c.user_id) OR c.session_id IS NOT NULL))) WITH CHECK (EXISTS (SELECT 1 FROM public.carts c WHERE c.id = cart_id AND ((auth.uid() = c.user_id) OR c.session_id IS NOT NULL)));
CREATE POLICY "Users read own orders" ON public.orders FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Customers create orders" ON public.orders FOR INSERT WITH CHECK ((auth.uid() = user_id) OR (user_id IS NULL AND customer_email IS NOT NULL));
CREATE POLICY "Users read own order items" ON public.order_items FOR SELECT USING (EXISTS (SELECT 1 FROM public.orders o WHERE o.id = order_id AND o.user_id = auth.uid()));
CREATE POLICY "Customers insert order items" ON public.order_items FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM public.orders o WHERE o.id = order_id)); CREATE POLICY "Users submit reviews" ON public.reviews FOR INSERT WITH CHECK (auth.uid() = user_id AND is_approved = FALSE);
