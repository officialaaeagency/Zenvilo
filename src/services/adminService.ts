import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { Product, Category, Order, Profile, Review, AnalyticsSummary } from '../types/store';

/**
 * Upload an image to Supabase Storage 'zenvilo-catalog' bucket
 */
export async function uploadCatalogImage(
  file: File,
  folder: 'products' | 'categories' = 'products'
): Promise<{ url: string | null; error: string | null }> {
  if (!isSupabaseConfigured) {
    return { url: null, error: 'Database is not configured' };
  }

  try {
    const ext = file.name.split('.').pop();
    const cleanFileName = `${folder}/${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${ext}`;

    const { data, error } = await supabase.storage
      .from('zenvilo-catalog')
      .upload(cleanFileName, file, {
        cacheControl: '3600',
        upsert: false,
      });

    if (error) {
      console.warn('[Zenvilo Storage] Upload error:', error.message);
      return { url: null, error: error.message };
    }

    const { data: urlData } = supabase.storage
      .from('zenvilo-catalog')
      .getPublicUrl(cleanFileName);

    return { url: urlData.publicUrl, error: null };
  } catch (err: any) {
    return { url: null, error: err?.message || 'Storage upload error' };
  }
}

/**
 * ADMIN: Fetch all products for admin management (includes cost_price, internal_notes, drafts)
 */
export async function getAdminProducts(): Promise<{ data: Product[]; error: string | null }> {
  if (!isSupabaseConfigured) return { data: [], error: 'Database not connected' };

  try {
    const { data, error } = await supabase
      .from('products')
      .select(`
        *,
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
          cost_price,
          inventory_quantity,
          image_url,
          options,
          is_active
        )
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.warn('[Zenvilo Admin] Failed to fetch admin products:', error.message);
      return { data: [], error: error.message };
    }

    const { mapDatabaseProduct } = await import('./catalogService');
    const mapped = (data || []).map((item) => mapDatabaseProduct({ ...item, _isAdminView: true }));
    return { data: mapped, error: null };
  } catch (err: any) {
    return { data: [], error: err?.message || 'Failed to fetch admin products' };
  }
}

export interface AdminProductPayload {
  name: string;
  slug: string;
  shortDescription?: string;
  description?: string;
  categoryId?: string | null;
  subcategory?: string;
  brand?: string;
  productType?: 'physical' | 'digital' | 'bundle' | 'service';
  tags?: string[];
  status?: 'active' | 'draft' | 'inactive';
  price: number;
  compareAtPrice?: number | null;
  costPrice?: number | null;
  currency?: string;
  sku?: string;
  inventoryQuantity: number;
  trackInventory?: boolean;
  lowStockThreshold?: number;
  allowBackorders?: boolean;
  weight?: number | null;
  dimensions?: { length?: number; width?: number; height?: number; unit?: string } | null;
  dimensionsText?: string;
  shippingClass?: string;
  processingTime?: string;
  shippingInfo?: string;
  returnInfo?: string;
  materials?: string;
  whatsIncluded?: string;
  careInstructions?: string;
  warrantyInfo?: string;
  internalNotes?: string;
  isActive: boolean;
  isFeatured: boolean;
  isBestseller: boolean;
  isNew: boolean;
  isHomepageVisible?: boolean;
  isShopVisible?: boolean;
  sortOrder?: number;
  seoTitle?: string;
  seoDescription?: string;
  seoKeywords?: string;
  features?: string[];
  specifications?: Array<{ label: string; value: string }>;
  faqs?: Array<{ question: string; answer: string }>;
  images?: Array<{ url: string; altText?: string; isPrimary?: boolean; sortOrder?: number }>;
  variants?: Array<{
    name: string;
    sku?: string;
    price?: number;
    compareAtPrice?: number;
    costPrice?: number;
    inventory?: number;
    imageUrl?: string;
    options?: Record<string, string>;
    isActive?: boolean;
  }>;
}

/**
 * ADMIN: Create a new product with full commercial fields, images, variants, and metadata
 */
export async function createProduct(payload: AdminProductPayload): Promise<{ id: string | null; error: string | null }> {
  if (!isSupabaseConfigured) return { id: null, error: 'Database not connected' };

  try {
    // 1. Insert product record
    const insertData: Record<string, any> = {
      name: payload.name,
      slug: payload.slug,
      short_description: payload.shortDescription || null,
      description: payload.description || null,
      category_id: payload.categoryId || null,
      subcategory: payload.subcategory || null,
      brand: payload.brand || 'Zenvilo',
      product_type: payload.productType || 'physical',
      tags: payload.tags || [],
      status: payload.status || (payload.isActive ? 'active' : 'draft'),
      price: payload.price,
      compare_at_price: payload.compareAtPrice || null,
      cost_price: payload.costPrice || null,
      currency: payload.currency || 'USD',
      sku: payload.sku || null,
      inventory_quantity: payload.inventoryQuantity,
      track_inventory: payload.trackInventory ?? true,
      low_stock_threshold: payload.lowStockThreshold ?? 5,
      allow_backorders: payload.allowBackorders ?? false,
      weight: payload.weight || null,
      dimensions: payload.dimensions || {},
      dimensions_text: payload.dimensionsText || null,
      shipping_class: payload.shippingClass || 'standard',
      processing_time: payload.processingTime || '1-2 business days',
      shipping_info: payload.shippingInfo || null,
      return_info: payload.returnInfo || null,
      materials: payload.materials || null,
      whats_included: payload.whatsIncluded || null,
      care_instructions: payload.careInstructions || null,
      warranty_info: payload.warrantyInfo || null,
      internal_notes: payload.internalNotes || null,
      is_active: payload.isActive,
      is_featured: payload.isFeatured,
      is_bestseller: payload.isBestseller,
      is_new: payload.isNew,
      is_homepage_visible: payload.isHomepageVisible ?? true,
      is_shop_visible: payload.isShopVisible ?? true,
      sort_order: payload.sortOrder ?? 0,
      seo_title: payload.seoTitle || null,
      seo_description: payload.seoDescription || null,
      seo_keywords: payload.seoKeywords || null,
      features: payload.features || [],
      specifications: payload.specifications || [],
      faqs: payload.faqs || [],
    };

    const { data: product, error: prodErr } = await (supabase
      .from('products') as any)
      .insert(insertData)
      .select('id')
      .single();

    if (prodErr) return { id: null, error: prodErr.message };

    const productId = product.id;

    // 2. Insert product images
    if (payload.images && payload.images.length > 0) {
      const imgRows = payload.images.map((img, idx) => ({
        product_id: productId,
        image_url: img.url,
        alt_text: img.altText || null,
        sort_order: img.sortOrder ?? idx,
        is_primary: img.isPrimary !== undefined ? img.isPrimary : idx === 0,
      }));
      await supabase.from('product_images').insert(imgRows as any);
    }

    // 3. Insert product variants
    if (payload.variants && payload.variants.length > 0) {
      const variantRows = payload.variants.map((v) => ({
        product_id: productId,
        name: v.name,
        sku: v.sku || null,
        price: v.price || null,
        compare_at_price: v.compareAtPrice || null,
        cost_price: v.costPrice || null,
        inventory_quantity: v.inventory ?? 0,
        image_url: v.imageUrl || null,
        options: v.options || {},
        is_active: v.isActive !== false,
      }));
      await supabase.from('product_variants').insert(variantRows as any);
    }

    return { id: productId, error: null };
  } catch (err: any) {
    return { id: null, error: err?.message || 'Failed to create product' };
  }
}

/**
 * ADMIN: Update an existing product
 */
export async function updateProduct(
  id: string,
  payload: Partial<AdminProductPayload>
): Promise<{ success: boolean; error: string | null }> {
  if (!isSupabaseConfigured) return { success: false, error: 'Database not connected' };

  try {
    const updateObj: Record<string, any> = {};
    if (payload.name !== undefined) updateObj.name = payload.name;
    if (payload.slug !== undefined) updateObj.slug = payload.slug;
    if (payload.shortDescription !== undefined) updateObj.short_description = payload.shortDescription;
    if (payload.description !== undefined) updateObj.description = payload.description;
    if (payload.categoryId !== undefined) updateObj.category_id = payload.categoryId;
    if (payload.subcategory !== undefined) updateObj.subcategory = payload.subcategory;
    if (payload.brand !== undefined) updateObj.brand = payload.brand;
    if (payload.productType !== undefined) updateObj.product_type = payload.productType;
    if (payload.tags !== undefined) updateObj.tags = payload.tags;
    if (payload.status !== undefined) updateObj.status = payload.status;
    if (payload.price !== undefined) updateObj.price = payload.price;
    if (payload.compareAtPrice !== undefined) updateObj.compare_at_price = payload.compareAtPrice;
    if (payload.costPrice !== undefined) updateObj.cost_price = payload.costPrice;
    if (payload.currency !== undefined) updateObj.currency = payload.currency;
    if (payload.sku !== undefined) updateObj.sku = payload.sku;
    if (payload.inventoryQuantity !== undefined) updateObj.inventory_quantity = payload.inventoryQuantity;
    if (payload.trackInventory !== undefined) updateObj.track_inventory = payload.trackInventory;
    if (payload.lowStockThreshold !== undefined) updateObj.low_stock_threshold = payload.lowStockThreshold;
    if (payload.allowBackorders !== undefined) updateObj.allow_backorders = payload.allowBackorders;
    if (payload.weight !== undefined) updateObj.weight = payload.weight;
    if (payload.dimensions !== undefined) updateObj.dimensions = payload.dimensions;
    if (payload.dimensionsText !== undefined) updateObj.dimensions_text = payload.dimensionsText;
    if (payload.shippingClass !== undefined) updateObj.shipping_class = payload.shippingClass;
    if (payload.processingTime !== undefined) updateObj.processing_time = payload.processingTime;
    if (payload.shippingInfo !== undefined) updateObj.shipping_info = payload.shippingInfo;
    if (payload.returnInfo !== undefined) updateObj.return_info = payload.returnInfo;
    if (payload.materials !== undefined) updateObj.materials = payload.materials;
    if (payload.whatsIncluded !== undefined) updateObj.whats_included = payload.whatsIncluded;
    if (payload.careInstructions !== undefined) updateObj.care_instructions = payload.careInstructions;
    if (payload.warrantyInfo !== undefined) updateObj.warranty_info = payload.warrantyInfo;
    if (payload.internalNotes !== undefined) updateObj.internal_notes = payload.internalNotes;
    if (payload.isActive !== undefined) updateObj.is_active = payload.isActive;
    if (payload.isFeatured !== undefined) updateObj.is_featured = payload.isFeatured;
    if (payload.isBestseller !== undefined) updateObj.is_bestseller = payload.isBestseller;
    if (payload.isNew !== undefined) updateObj.is_new = payload.isNew;
    if (payload.isHomepageVisible !== undefined) updateObj.is_homepage_visible = payload.isHomepageVisible;
    if (payload.isShopVisible !== undefined) updateObj.is_shop_visible = payload.isShopVisible;
    if (payload.sortOrder !== undefined) updateObj.sort_order = payload.sortOrder;
    if (payload.seoTitle !== undefined) updateObj.seo_title = payload.seoTitle;
    if (payload.seoDescription !== undefined) updateObj.seo_description = payload.seoDescription;
    if (payload.seoKeywords !== undefined) updateObj.seo_keywords = payload.seoKeywords;
    if (payload.features !== undefined) updateObj.features = payload.features;
    if (payload.specifications !== undefined) updateObj.specifications = payload.specifications;
    if (payload.faqs !== undefined) updateObj.faqs = payload.faqs;

    const { error: updErr } = await (supabase
      .from('products') as any)
      .update(updateObj)
      .eq('id', id);

    if (updErr) return { success: false, error: updErr.message };

    // Update images if provided
    if (payload.images !== undefined) {
      await supabase.from('product_images').delete().eq('product_id', id);
      if (payload.images.length > 0) {
        const imgRows = payload.images.map((img, idx) => ({
          product_id: id,
          image_url: img.url,
          alt_text: img.altText || null,
          sort_order: img.sortOrder ?? idx,
          is_primary: img.isPrimary !== undefined ? img.isPrimary : idx === 0,
        }));
        await supabase.from('product_images').insert(imgRows as any);
      }
    }

    // Update variants if provided
    if (payload.variants !== undefined) {
      await supabase.from('product_variants').delete().eq('product_id', id);
      if (payload.variants.length > 0) {
        const variantRows = payload.variants.map((v) => ({
          product_id: id,
          name: v.name,
          sku: v.sku || null,
          price: v.price || null,
          compare_at_price: v.compareAtPrice || null,
          cost_price: v.costPrice || null,
          inventory_quantity: v.inventory ?? 0,
          image_url: v.imageUrl || null,
          options: v.options || {},
          is_active: v.isActive !== false,
        }));
        await supabase.from('product_variants').insert(variantRows as any);
      }
    }

    return { success: true, error: null };
  } catch (err: any) {
    return { success: false, error: err?.message || 'Failed to update product' };
  }
}

/**
 * ADMIN: Duplicate an existing product
 */
export async function duplicateProduct(id: string): Promise<{ id: string | null; error: string | null }> {
  if (!isSupabaseConfigured) return { id: null, error: 'Database not connected' };

  try {
    // 1. Fetch source product
    const { data: source, error: fetchErr } = await (supabase
      .from('products') as any)
      .select(`
        *,
        product_images (*),
        product_variants (*)
      `)
      .eq('id', id)
      .single();

    if (fetchErr || !source) {
      return { id: null, error: fetchErr?.message || 'Source product not found' };
    }

    const sourceData: any = source;

    // 2. Clone product row
    const randomSuffix = Math.random().toString(36).substring(2, 7);
    const clonedSlug = `${sourceData.slug}-copy-${randomSuffix}`;
    const clonedName = `${sourceData.name} (Copy)`;

    const { id: oldId, created_at, updated_at, ...copyFields } = sourceData;
    delete copyFields.product_images;
    delete copyFields.product_variants;

    const newProductData = {
      ...copyFields,
      name: clonedName,
      slug: clonedSlug,
      status: 'draft',
      is_active: false,
      sku: sourceData.sku ? `${sourceData.sku}-COPY` : null,
    };

    const { data: newProd, error: insertErr } = await (supabase
      .from('products') as any)
      .insert(newProductData)
      .select('id')
      .single();

    if (insertErr || !newProd) {
      return { id: null, error: insertErr?.message || 'Failed to duplicate product record' };
    }

    const newProductId = newProd.id;

    // 3. Clone images
    const rawImages = sourceData.product_images;
    if (Array.isArray(rawImages) && rawImages.length > 0) {
      const clonedImages = rawImages.map((img: any) => ({
        product_id: newProductId,
        image_url: img.image_url,
        alt_text: img.alt_text,
        sort_order: img.sort_order,
        is_primary: img.is_primary,
      }));
      await supabase.from('product_images').insert(clonedImages as any);
    }

    // 4. Clone variants
    const rawVariants = sourceData.product_variants;
    if (Array.isArray(rawVariants) && rawVariants.length > 0) {
      const clonedVariants = rawVariants.map((v: any) => ({
        product_id: newProductId,
        name: v.name,
        sku: v.sku ? `${v.sku}-COPY` : null,
        price: v.price,
        compare_at_price: v.compare_at_price,
        cost_price: v.cost_price,
        inventory_quantity: v.inventory_quantity,
        image_url: v.image_url,
        options: v.options,
        is_active: v.is_active,
      }));
      await supabase.from('product_variants').insert(clonedVariants as any);
    }

    return { id: newProductId, error: null };
  } catch (err: any) {
    return { id: null, error: err?.message || 'Failed to duplicate product' };
  }
}

/**
 * ADMIN: Toggle product active status (Soft delete / deactivate)
 */
export async function toggleProductActive(id: string, isActive: boolean): Promise<{ success: boolean; error: string | null }> {
  try {
    const { error } = await (supabase.from('products') as any)
      .update({
        is_active: isActive,
        status: isActive ? 'active' : 'inactive',
      })
      .eq('id', id);
    if (error) return { success: false, error: error.message };
    return { success: true, error: null };
  } catch (err: any) {
    return { success: false, error: err?.message };
  }
}

/**
 * ADMIN: Toggle product featured status
 */
export async function toggleProductFeatured(id: string, isFeatured: boolean): Promise<{ success: boolean; error: string | null }> {
  try {
    const { error } = await (supabase.from('products') as any)
      .update({ is_featured: isFeatured })
      .eq('id', id);
    if (error) return { success: false, error: error.message };
    return { success: true, error: null };
  } catch (err: any) {
    return { success: false, error: err?.message };
  }
}

/**
 * ADMIN: Toggle product bestseller status
 */
export async function toggleProductBestseller(id: string, isBestseller: boolean): Promise<{ success: boolean; error: string | null }> {
  try {
    const { error } = await (supabase.from('products') as any)
      .update({ is_bestseller: isBestseller })
      .eq('id', id);
    if (error) return { success: false, error: error.message };
    return { success: true, error: null };
  } catch (err: any) {
    return { success: false, error: err?.message };
  }
}

/**
 * ADMIN: Toggle product new arrival status
 */
export async function toggleProductNewArrival(id: string, isNew: boolean): Promise<{ success: boolean; error: string | null }> {
  try {
    const { error } = await (supabase.from('products') as any)
      .update({ is_new: isNew })
      .eq('id', id);
    if (error) return { success: false, error: error.message };
    return { success: true, error: null };
  } catch (err: any) {
    return { success: false, error: err?.message };
  }
}

/**
 * ADMIN: Safely delete product
 */
export async function deleteProduct(id: string): Promise<{ success: boolean; error: string | null; deactivatedOnly?: boolean }> {
  try {
    // Check if product is in any orders
    const { count } = await supabase
      .from('order_items')
      .select('id', { count: 'exact', head: true })
      .eq('product_id', id);

    if (count && count > 0) {
      // Deactivate instead of hard delete to preserve historical order integrity!
      const res = await toggleProductActive(id, false);
      return { ...res, deactivatedOnly: true };
    }

    const { error } = await supabase.from('products').delete().eq('id', id);
    if (error) return { success: false, error: error.message };
    return { success: true, error: null, deactivatedOnly: false };
  } catch (err: any) {
    return { success: false, error: err?.message };
  }
}

/**
 * ADMIN: Create category
 */
export async function createCategory(payload: {
  name: string;
  slug: string;
  description?: string;
  imageUrl?: string;
  isActive?: boolean;
}): Promise<{ id: string | null; error: string | null }> {
  try {
    const { data, error } = await (supabase.from('categories') as any)
      .insert({
        name: payload.name,
        slug: payload.slug,
        description: payload.description || null,
        image_url: payload.imageUrl || null,
        is_active: payload.isActive ?? true,
      })
      .select('id')
      .single();

    if (error) return { id: null, error: error.message };
    return { id: data.id, error: null };
  } catch (err: any) {
    return { id: null, error: err?.message };
  }
}

/**
 * ADMIN: Update category
 */
export async function updateCategory(
  id: string,
  payload: {
    name?: string;
    slug?: string;
    description?: string;
    imageUrl?: string;
    isActive?: boolean;
  }
): Promise<{ success: boolean; error: string | null }> {
  try {
    const obj: any = {};
    if (payload.name !== undefined) obj.name = payload.name;
    if (payload.slug !== undefined) obj.slug = payload.slug;
    if (payload.description !== undefined) obj.description = payload.description;
    if (payload.imageUrl !== undefined) obj.image_url = payload.imageUrl;
    if (payload.isActive !== undefined) obj.is_active = payload.isActive;

    const { error } = await (supabase.from('categories') as any).update(obj).eq('id', id);
    if (error) return { success: false, error: error.message };
    return { success: true, error: null };
  } catch (err: any) {
    return { success: false, error: err?.message };
  }
}

/**
 * ADMIN: Safely delete category (protects products)
 */
export async function deleteCategory(id: string): Promise<{ success: boolean; error: string | null }> {
  try {
    const { count } = await supabase
      .from('products')
      .select('id', { count: 'exact', head: true })
      .eq('category_id', id);

    if (count && count > 0) {
      return {
        success: false,
        error: `Cannot delete category: ${count} product(s) are currently assigned to it. Reassign or delete those products first.`,
      };
    }

    const { error } = await supabase.from('categories').delete().eq('id', id);
    if (error) return { success: false, error: error.message };
    return { success: true, error: null };
  } catch (err: any) {
    return { success: false, error: err?.message };
  }
}

/**
 * ADMIN: Get all orders
 */
export async function getAllOrders(): Promise<{ data: Order[]; error: string | null }> {
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
 * ADMIN: Update order status
 */
export async function updateOrderStatus(orderId: string, status: Order['status']): Promise<{ success: boolean; error: string | null }> {
  try {
    const { error } = await (supabase.from('orders') as any).update({ status }).eq('id', orderId);
    if (error) return { success: false, error: error.message };
    return { success: true, error: null };
  } catch (err: any) {
    return { success: false, error: err?.message };
  }
}

/**
 * ADMIN: Update payment status
 */
export async function updatePaymentStatus(orderId: string, paymentStatus: Order['paymentStatus']): Promise<{ success: boolean; error: string | null }> {
  try {
    const { error } = await (supabase.from('orders') as any).update({ payment_status: paymentStatus }).eq('id', orderId);
    if (error) return { success: false, error: error.message };
    return { success: true, error: null };
  } catch (err: any) {
    return { success: false, error: err?.message };
  }
}

/**
 * ADMIN: Get all customers with spend and order counts
 */
export async function getAllCustomers(): Promise<{ data: any[]; error: string | null }> {
  try {
    // Fetch profiles
    const { data: profiles, error: pErr } = await supabase
      .from('profiles')
      .select('id, full_name, phone, avatar_url, created_at')
      .order('created_at', { ascending: false });

    if (pErr) return { data: [], error: pErr.message };

    // Fetch order aggregates
    const { data: orders } = await supabase
      .from('orders')
      .select('id, user_id, customer_email, total_amount, payment_status, created_at');

    const customerMap = new Map<string, any>();

    (profiles || []).forEach((p: any) => {
      customerMap.set(p.id, {
        id: p.id,
        fullName: p.full_name || 'Customer',
        phone: p.phone,
        email: 'Registered User',
        createdAt: p.created_at,
        orderCount: 0,
        totalSpent: 0,
        latestOrderDate: null,
      });
    });

    (orders || []).forEach((o: any) => {
      if (o.user_id && customerMap.has(o.user_id)) {
        const c = customerMap.get(o.user_id);
        c.orderCount += 1;
        if (o.payment_status === 'paid') {
          c.totalSpent += Number(o.total_amount);
        }
        if (!c.latestOrderDate || new Date(o.created_at) > new Date(c.latestOrderDate)) {
          c.latestOrderDate = o.created_at;
        }
        if (o.customer_email) c.email = o.customer_email;
      }
    });

    return { data: Array.from(customerMap.values()), error: null };
  } catch (err: any) {
    return { data: [], error: err?.message };
  }
}

/**
 * ADMIN: Get all login activity audit records
 */
export async function getLoginActivity(): Promise<{ data: any[]; error: string | null }> {
  try {
    const { data, error } = await (supabase.from('login_activity') as any)
      .select('id, user_id, email, login_at, logout_at, login_status, user_agent, created_at')
      .order('login_at', { ascending: false })
      .limit(100);

    if (error) {
      // Fallback: If table does not exist or user doesn't have rows yet, return empty
      return { data: [], error: error.message };
    }

    return { data: data || [], error: null };
  } catch (err: any) {
    return { data: [], error: err?.message };
  }
}

/**
 * Record current user's login activity in Supabase
 */
export async function recordCurrentUserLogin(): Promise<void> {
  try {
    const { data: authData } = await supabase.auth.getUser();
    if (!authData.user) return;

    await (supabase.from('login_activity') as any).insert({
      user_id: authData.user.id,
      email: authData.user.email,
      login_at: new Date().toISOString(),
      login_status: 'success',
      user_agent: typeof navigator !== 'undefined' ? navigator.userAgent : null,
    });
  } catch (err) {
    // Non-blocking background audit attempt
  }
}

/**
 * ADMIN: Get all reviews
 */
export async function getAllReviews(): Promise<{ data: Review[]; error: string | null }> {
  try {
    const { data, error } = await supabase
      .from('reviews')
      .select(`
        id,
        product_id,
        rating,
        title,
        content,
        is_approved,
        created_at,
        products (name),
        profiles (full_name)
      `)
      .order('created_at', { ascending: false });

    if (error) return { data: [], error: error.message };

    const mapped: Review[] = (data || []).map((r: any) => ({
      id: r.id,
      productId: r.product_id,
      productTitle: r.products?.name || 'Product',
      userName: r.profiles?.full_name || 'Anonymous Customer',
      rating: r.rating,
      title: r.title,
      content: r.content,
      isApproved: r.is_approved,
      createdAt: r.created_at,
    }));

    return { data: mapped, error: null };
  } catch (err: any) {
    return { data: [], error: err?.message };
  }
}

/**
 * ADMIN: Approve or reject review
 */
export async function toggleReviewApproval(reviewId: string, isApproved: boolean): Promise<{ success: boolean; error: string | null }> {
  try {
    const { error } = await (supabase.from('reviews') as any).update({ is_approved: isApproved }).eq('id', reviewId);
    if (error) return { success: false, error: error.message };
    return { success: true, error: null };
  } catch (err: any) {
    return { success: false, error: err?.message };
  }
}

/**
 * ADMIN: Delete review
 */
export async function deleteReview(reviewId: string): Promise<{ success: boolean; error: string | null }> {
  try {
    const { error } = await supabase.from('reviews').delete().eq('id', reviewId);
    if (error) return { success: false, error: error.message };
    return { success: true, error: null };
  } catch (err: any) {
    return { success: false, error: err?.message };
  }
}

/**
 * ADMIN: Compute REAL analytics from Supabase data
 */
export async function getRealAnalytics(timeRange: 'today' | 'yesterday' | '7d' | '30d' | '90d' | 'year' | 'all'): Promise<{
  data: AnalyticsSummary | null;
  error: string | null;
}> {
  if (!isSupabaseConfigured) return { data: null, error: 'Database not configured' };

  try {
    // 1. Fetch total products count
    const { count: prodCount } = await supabase
      .from('products')
      .select('id', { count: 'exact', head: true });

    // 2. Fetch total registered customers count
    const { count: custCount } = await supabase
      .from('profiles')
      .select('id', { count: 'exact', head: true });

    // 3. Date boundary calculation
    const now = new Date();
    let startDate: Date | null = null;

    if (timeRange === 'today') {
      startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    } else if (timeRange === 'yesterday') {
      startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1);
    } else if (timeRange === '7d') {
      startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    } else if (timeRange === '30d') {
      startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    } else if (timeRange === '90d') {
      startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
    } else if (timeRange === 'year') {
      startDate = new Date(now.getFullYear(), 0, 1);
    }

    let ordersQuery = supabase
      .from('orders')
      .select(`
        id,
        order_number,
        status,
        payment_status,
        total_amount,
        created_at,
        order_items (
          product_name,
          quantity,
          total_price
        )
      `);

    if (startDate) {
      ordersQuery = ordersQuery.gte('created_at', startDate.toISOString());
    }

    const { data: orders, error: oErr } = await ordersQuery;
    if (oErr) return { data: null, error: oErr.message };

    const orderList = orders || [];

    // Calculate real figures
    let totalRevenue = 0;
    let refundedAmount = 0;
    let paidOrdersCount = 0;
    let pendingOrdersCount = 0;
    let cancelledOrdersCount = 0;
    const orderStatusDistribution: Record<string, number> = {
      pending: 0,
      confirmed: 0,
      processing: 0,
      shipped: 0,
      delivered: 0,
      cancelled: 0,
      refunded: 0,
    };

    const dayMap = new Map<string, { revenue: number; orders: number }>();
    const productSalesMap = new Map<string, { quantity: number; revenue: number }>();

    orderList.forEach((o: any) => {
      const amount = Number(o.total_amount) || 0;
      const status = o.status || 'pending';
      orderStatusDistribution[status] = (orderStatusDistribution[status] || 0) + 1;

      if (o.payment_status === 'paid') {
        totalRevenue += amount;
        paidOrdersCount += 1;
      } else if (o.payment_status === 'refunded') {
        refundedAmount += amount;
      } else if (o.payment_status === 'pending') {
        pendingOrdersCount += 1;
      }

      if (status === 'cancelled') {
        cancelledOrdersCount += 1;
      }

      // Group by day for chart
      const dayKey = o.created_at.split('T')[0];
      const curDay = dayMap.get(dayKey) || { revenue: 0, orders: 0 };
      if (o.payment_status === 'paid') {
        curDay.revenue += amount;
      }
      curDay.orders += 1;
      dayMap.set(dayKey, curDay);

      // Top products
      if (Array.isArray(o.order_items)) {
        o.order_items.forEach((it: any) => {
          const name = it.product_name || 'Item';
          const p = productSalesMap.get(name) || { quantity: 0, revenue: 0 };
          p.quantity += it.quantity || 1;
          p.revenue += Number(it.total_price) || 0;
          productSalesMap.set(name, p);
        });
      }
    });

    const averageOrderValue = paidOrdersCount > 0 ? totalRevenue / paidOrdersCount : 0;
    const netRevenue = Math.max(0, totalRevenue - refundedAmount);

    const revenueByDay = Array.from(dayMap.entries())
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([date, d]) => ({
        date,
        revenue: d.revenue,
        orders: d.orders,
      }));

    const topProducts = Array.from(productSalesMap.entries())
      .map(([name, d]) => ({
        name,
        quantity: d.quantity,
        revenue: d.revenue,
      }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);

    return {
      data: {
        totalRevenue,
        totalOrders: orderList.length,
        totalCustomers: custCount || 0,
        totalProducts: prodCount || 0,
        averageOrderValue,
        paidOrdersCount,
        pendingOrdersCount,
        cancelledOrdersCount,
        refundedAmount,
        netRevenue,
        revenueByDay,
        orderStatusDistribution,
        topProducts,
      },
      error: null,
    };
  } catch (err: any) {
    return { data: null, error: err?.message };
  }
}
