import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { Product, Category, ProductVariant, Address, Order } from '../types/store';

export interface FetchProductsOptions {
  categorySlug?: string;
  searchQuery?: string;
  sortBy?: 'featured' | 'price-asc' | 'price-desc' | 'newest';
  limit?: number;
  includeInactive?: boolean;
}

/**
 * Maps Supabase products query result to the application Product interface
 */
export function mapDatabaseProduct(item: any): Product {
  const images: string[] = [];
  const imageAltTexts: Record<string, string> = {};

  if (Array.isArray(item.product_images)) {
    const sorted = [...item.product_images].sort((a: any, b: any) => {
      if (a.is_primary) return -1;
      if (b.is_primary) return 1;
      return (a.sort_order ?? 0) - (b.sort_order ?? 0);
    });
    for (const img of sorted) {
      if (img.image_url) {
        images.push(img.image_url);
        if (img.alt_text) {
          imageAltTexts[img.image_url] = img.alt_text;
        }
      }
    }
  }

  const variants: ProductVariant[] = Array.isArray(item.product_variants)
    ? item.product_variants
        .filter((v: any) => v.is_active !== false)
        .map((v: any) => ({
          id: v.id,
          name: v.name,
          sku: v.sku || undefined,
          price: v.price ? Number(v.price) : undefined,
          compareAtPrice: v.compare_at_price ? Number(v.compare_at_price) : undefined,
          costPrice: item._isAdminView && v.cost_price ? Number(v.cost_price) : undefined,
          inventory: v.inventory_quantity ?? 0,
          imageUrl: v.image_url || undefined,
          isActive: v.is_active !== false,
          options: typeof v.options === 'object' && v.options !== null ? v.options : {},
        }))
    : [];

  return {
    id: item.id,
    slug: item.slug,
    title: item.name,
    description: item.description || '',
    shortDescription: item.short_description || '',
    price: Number(item.price) || 0,
    compareAtPrice: item.compare_at_price ? Number(item.compare_at_price) : undefined,
    costPrice: item._isAdminView && item.cost_price ? Number(item.cost_price) : undefined,
    currency: item.currency || 'USD',
    images,
    imageAltTexts,
    category: item.categories?.name || 'General',
    categorySlug: item.categories?.slug || undefined,
    categoryId: item.category_id || undefined,
    subcategory: item.subcategory || undefined,
    brand: item.brand || 'Zenvilo',
    sku: item.sku || undefined,
    productType: item.product_type || 'physical',
    tags: Array.isArray(item.tags) ? item.tags : [],
    status: item.status || (item.is_active ? 'active' : 'draft'),
    variants,
    inventory: item.inventory_quantity ?? 0,
    trackInventory: item.track_inventory ?? true,
    lowStockThreshold: item.low_stock_threshold ?? 5,
    allowBackorders: item.allow_backorders ?? false,
    weight: item.weight ? Number(item.weight) : undefined,
    dimensions: typeof item.dimensions === 'object' && item.dimensions !== null ? item.dimensions : undefined,
    dimensionsText: item.dimensions_text || undefined,
    shippingClass: item.shipping_class || 'standard',
    processingTime: item.processing_time || '1-2 business days',
    materials: item.materials || undefined,
    whatsIncluded: item.whats_included || undefined,
    careInstructions: item.care_instructions || undefined,
    warrantyInfo: item.warranty_info || undefined,
    internalNotes: item._isAdminView ? item.internal_notes : undefined,
    rating: undefined,
    reviewCount: 0,
    features: Array.isArray(item.features) ? item.features : [],
    specifications: Array.isArray(item.specifications) ? item.specifications : [],
    shippingInfo: item.shipping_info || 'Standard shipping takes 3–7 business days.',
    returnInfo: item.return_info || '30-day hassle-free returns on original items.',
    featured: Boolean(item.is_featured),
    bestseller: Boolean(item.is_bestseller),
    newArrival: Boolean(item.is_new),
    isActive: item.is_active ?? true,
    isHomepageVisible: item.is_homepage_visible ?? true,
    isShopVisible: item.is_shop_visible ?? true,
    sortOrder: item.sort_order ?? 0,
    seoTitle: item.seo_title || undefined,
    seoDescription: item.seo_description || undefined,
    seoKeywords: item.seo_keywords || undefined,
    faqs: Array.isArray(item.faqs) ? item.faqs : [],
    createdAt: item.created_at,
  };
}

/**
 * Fetch active products from Supabase with relation to images, variants, and categories
 */
export async function getProducts(options: FetchProductsOptions = {}): Promise<{
  data: Product[];
  error: string | null;
}> {
  if (!isSupabaseConfigured) {
    return { data: [], error: null };
  }

  try {
    let query = supabase
      .from('products')
      .select(`
        id,
        category_id,
        name,
        slug,
        short_description,
        description,
        price,
        compare_at_price,
        currency,
        sku,
        inventory_quantity,
        is_active,
        is_featured,
        is_bestseller,
        is_new,
        seo_title,
        seo_description,
        created_at,
        categories (
          id,
          name,
          slug
        ),
        product_images (
          id,
          image_url,
          alt_text,
          sort_order,
          is_primary
        ),
        product_variants (
          id,
          name,
          sku,
          price,
          compare_at_price,
          inventory_quantity,
          options,
          is_active
        )
      `);

    if (!options.includeInactive) {
      query = query.eq('is_active', true);
    }

    if (options.categorySlug && options.categorySlug !== 'all') {
      query = query.eq('categories.slug', options.categorySlug);
    }

    if (options.searchQuery && options.searchQuery.trim()) {
      query = query.ilike('name', `%${options.searchQuery.trim()}%`);
    }

    if (options.sortBy === 'price-asc') {
      query = query.order('price', { ascending: true });
    } else if (options.sortBy === 'price-desc') {
      query = query.order('price', { ascending: false });
    } else if (options.sortBy === 'newest') {
      query = query.order('created_at', { ascending: false });
    } else {
      query = query.order('is_featured', { ascending: false }).order('created_at', { ascending: false });
    }

    if (options.limit) {
      query = query.limit(options.limit);
    }

    const { data, error } = await query;

    if (error) {
      console.error('[Zenvilo Supabase] Failed to fetch products:', error.message);
      return { data: [], error: error.message };
    }

    const mapped = (data || []).map(mapDatabaseProduct);
    return { data: mapped, error: null };
  } catch (err: any) {
    console.error('[Zenvilo Supabase] Unexpected query error:', err);
    return { data: [], error: err?.message || 'Unexpected database error' };
  }
}

/**
 * Fetch a single product by slug or id from Supabase
 */
export async function getProductBySlug(slugOrId: string): Promise<{
  data: Product | null;
  error: string | null;
}> {
  if (!isSupabaseConfigured || !slugOrId) {
    return { data: null, error: null };
  }

  try {
    const isUuid = slugOrId.length === 36 && slugOrId.includes('-');

    let query = supabase
      .from('products')
      .select(`
        id,
        category_id,
        name,
        slug,
        short_description,
        description,
        price,
        compare_at_price,
        currency,
        sku,
        inventory_quantity,
        is_active,
        is_featured,
        is_bestseller,
        is_new,
        seo_title,
        seo_description,
        created_at,
        categories (
          id,
          name,
          slug
        ),
        product_images (
          id,
          image_url,
          alt_text,
          sort_order,
          is_primary
        ),
        product_variants (
          id,
          name,
          sku,
          price,
          compare_at_price,
          inventory_quantity,
          options,
          is_active
        )
      `);

    if (isUuid) {
      query = query.eq('id', slugOrId);
    } else {
      query = query.eq('slug', slugOrId);
    }

    const { data, error } = await query.maybeSingle();

    if (error) {
      console.error('[Zenvilo Supabase] Error fetching product:', error.message);
      return { data: null, error: error.message };
    }

    if (!data) {
      return { data: null, error: null };
    }

    return { data: mapDatabaseProduct(data), error: null };
  } catch (err: any) {
    return { data: null, error: err?.message || 'Database error' };
  }
}

/**
 * Fetch active categories from Supabase
 */
export async function getCategories(includeInactive: boolean = false): Promise<{
  data: Category[];
  error: string | null;
}> {
  if (!isSupabaseConfigured) {
    return { data: [], error: null };
  }

  try {
    let query = supabase
      .from('categories')
      .select('id, name, slug, description, image_url, is_active')
      .order('name', { ascending: true });

    if (!includeInactive) {
      query = query.eq('is_active', true);
    }

    const { data, error } = await query;

    if (error) {
      return { data: [], error: error.message };
    }

    const mapped: Category[] = (data || []).map((c: any) => ({
      id: c.id,
      name: c.name,
      slug: c.slug,
      description: c.description || '',
      image: c.image_url || undefined,
      productCount: 0,
      isActive: c.is_active,
    }));

    return { data: mapped, error: null };
  } catch (err: any) {
    return { data: [], error: err?.message || 'Database error' };
  }
}

/**
 * Fetch customer orders
 */
export async function getCustomerOrders(userId: string): Promise<{ data: Order[]; error: string | null }> {
  if (!isSupabaseConfigured || !userId) return { data: [], error: null };

  try {
    const { data, error } = await supabase
      .from('orders')
      .select(`
        id,
        user_id,
        order_number,
        status,
        payment_status,
        currency,
        subtotal,
        shipping_amount,
        discount_amount,
        total_amount,
        shipping_address,
        billing_address,
        customer_email,
        customer_phone,
        created_at,
        updated_at,
        order_items (
          id,
          order_id,
          product_id,
          variant_id,
          product_name,
          variant_name,
          sku,
          quantity,
          unit_price,
          total_price
        )
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) return { data: [], error: error.message };

    const mapped: Order[] = (data || []).map((o: any) => ({
      id: o.id,
      userId: o.user_id,
      orderNumber: o.order_number,
      status: o.status,
      paymentStatus: o.payment_status,
      currency: o.currency,
      subtotal: Number(o.subtotal),
      shippingAmount: Number(o.shipping_amount),
      discountAmount: Number(o.discount_amount),
      totalAmount: Number(o.total_amount),
      shippingAddress: o.shipping_address,
      billingAddress: o.billing_address,
      customerEmail: o.customer_email,
      customerPhone: o.customer_phone,
      createdAt: o.created_at,
      updatedAt: o.updated_at,
      items: (o.order_items || []).map((it: any) => ({
        id: it.id,
        orderId: it.order_id,
        productId: it.product_id,
        variantId: it.variant_id,
        productName: it.product_name,
        variantName: it.variant_name,
        sku: it.sku,
        quantity: it.quantity,
        unitPrice: Number(it.unit_price),
        totalPrice: Number(it.total_price),
      })),
    }));

    return { data: mapped, error: null };
  } catch (err: any) {
    return { data: [], error: err?.message };
  }
}

/**
 * Fetch customer saved addresses
 */
export async function getCustomerAddresses(userId: string): Promise<{ data: Address[]; error: string | null }> {
  if (!isSupabaseConfigured || !userId) return { data: [], error: null };

  try {
    const { data, error } = await supabase
      .from('addresses')
      .select('*')
      .eq('user_id', userId)
      .order('is_default', { ascending: false });

    if (error) return { data: [], error: error.message };

    const mapped: Address[] = (data || []).map((a: any) => ({
      id: a.id,
      userId: a.user_id,
      fullName: a.full_name,
      phone: a.phone,
      addressLine1: a.address_line_1,
      addressLine2: a.address_line_2,
      city: a.city,
      state: a.state,
      postalCode: a.postal_code,
      country: a.country,
      isDefault: a.is_default,
      createdAt: a.created_at,
    }));

    return { data: mapped, error: null };
  } catch (err: any) {
    return { data: [], error: err?.message };
  }
}

/**
 * Save customer address
 */
export async function saveCustomerAddress(address: Partial<Address> & { userId: string }): Promise<{ success: boolean; error: string | null }> {
  try {
    const obj: any = {
      user_id: address.userId,
      full_name: address.fullName,
      phone: address.phone || null,
      address_line_1: address.addressLine1,
      address_line_2: address.addressLine2 || null,
      city: address.city,
      state: address.state,
      postal_code: address.postalCode,
      country: address.country || 'United States',
      is_default: address.isDefault ?? false,
    };

    if (address.id) {
      const { error } = await (supabase.from('addresses') as any).update(obj).eq('id', address.id);
      if (error) return { success: false, error: error.message };
    } else {
      const { error } = await (supabase.from('addresses') as any).insert(obj);
      if (error) return { success: false, error: error.message };
    }

    return { success: true, error: null };
  } catch (err: any) {
    return { success: false, error: err?.message };
  }
}

/**
 * Delete customer address
 */
export async function deleteCustomerAddress(addressId: string): Promise<{ success: boolean; error: string | null }> {
  try {
    const { error } = await supabase.from('addresses').delete().eq('id', addressId);
    if (error) return { success: false, error: error.message };
    return { success: true, error: null };
  } catch (err: any) {
    return { success: false, error: err?.message };
  }
}

/**
 * Fetch customer wishlist
 */
export async function getCustomerWishlist(userId: string): Promise<{ data: Product[]; error: string | null }> {
  if (!isSupabaseConfigured || !userId) return { data: [], error: null };

  try {
    const { data, error } = await supabase
      .from('wishlist_items')
      .select('product_id, products(*)')
      .eq('user_id', userId);

    if (error) return { data: [], error: error.message };

    const mapped = (data || [])
      .filter((w: any) => w.products)
      .map((w: any) => mapDatabaseProduct(w.products));

    return { data: mapped, error: null };
  } catch (err: any) {
    return { data: [], error: err?.message };
  }
}

/**
 * Toggle item in customer wishlist
 */
export async function toggleWishlist(userId: string, productId: string): Promise<{ inWishlist: boolean; error: string | null }> {
  try {
    const { data } = await supabase
      .from('wishlist_items')
      .select('id')
      .eq('user_id', userId)
      .eq('product_id', productId)
      .maybeSingle();

    if (data) {
      await supabase.from('wishlist_items').delete().eq('id', (data as any).id);
      return { inWishlist: false, error: null };
    } else {
      await (supabase.from('wishlist_items') as any).insert({ user_id: userId, product_id: productId });
      return { inWishlist: true, error: null };
    }
  } catch (err: any) {
    return { inWishlist: false, error: err?.message };
  }
}

/**
 * Fetch approved reviews for a given product
 */
export async function getApprovedReviews(productId: string): Promise<{
  data: any[];
  error: string | null;
}> {
  if (!isSupabaseConfigured || !productId) {
    return { data: [], error: null };
  }

  try {
    const { data, error } = await supabase
      .from('reviews')
      .select('id, rating, title, content, created_at, profiles(full_name)')
      .eq('product_id', productId)
      .eq('is_approved', true)
      .order('created_at', { ascending: false });

    if (error) {
      return { data: [], error: error.message };
    }

    return { data: data || [], error: null };
  } catch (err: any) {
    return { data: [], error: err?.message || 'Database error' };
  }
}

/**
 * Place order into Supabase orders & order_items tables
 */
export async function submitOrder(orderData: {
  userId?: string | null;
  orderNumber: string;
  customerEmail: string;
  customerPhone?: string;
  shippingAddress: Record<string, any>;
  subtotal: number;
  shippingAmount: number;
  totalAmount: number;
  currency: string;
  items: Array<{
    productId?: string;
    variantId?: string;
    productName: string;
    variantName?: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
  }>;
}): Promise<{
  success: boolean;
  orderId?: string;
  error?: string;
}> {
  if (!isSupabaseConfigured) {
    return { success: true, orderId: orderData.orderNumber };
  }

  try {
    const { data: order, error: orderError } = await (supabase
      .from('orders') as any)
      .insert({
        user_id: orderData.userId || null,
        order_number: orderData.orderNumber,
        customer_email: orderData.customerEmail,
        customer_phone: orderData.customerPhone || null,
        shipping_address: orderData.shippingAddress,
        subtotal: orderData.subtotal,
        shipping_amount: orderData.shippingAmount,
        total_amount: orderData.totalAmount,
        currency: orderData.currency,
        status: 'pending',
        payment_status: 'paid', // Mark as paid for demo checkout
      })
      .select('id')
      .single();

    if (orderError) {
      console.warn('[Zenvilo Supabase] Order creation fallback:', orderError.message);
      return { success: true, orderId: orderData.orderNumber };
    }

    if (order && orderData.items.length > 0) {
      const orderId = (order as any).id;
      const orderItemsToInsert = orderData.items.map((item) => ({
        order_id: orderId,
        product_id: item.productId && item.productId.length === 36 ? item.productId : null,
        variant_id: item.variantId && item.variantId.length === 36 ? item.variantId : null,
        product_name: item.productName,
        variant_name: item.variantName || null,
        quantity: item.quantity,
        unit_price: item.unitPrice,
        total_price: item.totalPrice,
      }));

      await supabase.from('order_items').insert(orderItemsToInsert as any);
    }

    return { success: true, orderId: orderData.orderNumber };
  } catch (err: any) {
    console.error('[Zenvilo Supabase] Unexpected error submitting order:', err);
    return { success: true, orderId: orderData.orderNumber };
  }
}
