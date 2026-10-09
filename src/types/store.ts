export interface ProductVariant {
  id: string;
  name: string;
  sku?: string;
  price?: number;
  compareAtPrice?: number;
  costPrice?: number; // Admin-only
  inventory?: number;
  imageUrl?: string;
  isActive?: boolean;
  options: Record<string, string>; // e.g. { Color: "Matte Black", Size: "Standard" }
}

export interface ProductSpecification {
  label: string;
  value: string;
}

export interface ProductFAQ {
  question: string;
  answer: string;
}

export interface ProductDimensions {
  length?: number;
  width?: number;
  height?: number;
  unit?: string;
}

export interface Product {
  id: string;
  slug: string;
  title: string;
  description: string;
  shortDescription: string;
  price: number;
  compareAtPrice?: number;
  costPrice?: number; // Admin-only
  currency: string;
  images: string[];
  imageAltTexts?: Record<string, string>;
  category: string;
  categorySlug?: string;
  categoryId?: string;
  subcategory?: string;
  brand?: string;
  sku?: string;
  productType?: 'physical' | 'digital' | 'bundle' | 'service';
  tags?: string[];
  status?: 'active' | 'draft' | 'inactive';
  variants: ProductVariant[];
  inventory: number;
  trackInventory?: boolean;
  lowStockThreshold?: number;
  allowBackorders?: boolean;
  weight?: number;
  dimensions?: ProductDimensions;
  dimensionsText?: string;
  shippingClass?: string;
  processingTime?: string;
  materials?: string;
  whatsIncluded?: string;
  careInstructions?: string;
  warrantyInfo?: string;
  internalNotes?: string; // Admin-only
  rating?: number;
  reviewCount?: number;
  features: string[];
  specifications: ProductSpecification[];
  shippingInfo?: string;
  returnInfo?: string;
  featured?: boolean;
  bestseller?: boolean;
  newArrival?: boolean;
  isActive?: boolean;
  isHomepageVisible?: boolean;
  isShopVisible?: boolean;
  sortOrder?: number;
  seoTitle?: string;
  seoDescription?: string;
  seoKeywords?: string;
  faqs?: ProductFAQ[];
  createdAt: string;
}

export interface Category {
  id: string;
  slug: string;
  name: string;
  description: string;
  image?: string;
  productCount: number;
  isActive?: boolean;
}

export interface CartItem {
  id: string; // unique item line id (product.id + variant.id)
  productId: string;
  productTitle: string;
  productSlug: string;
  variantId?: string;
  variantName?: string;
  price: number;
  image: string;
  quantity: number;
  currency: string;
}

export interface CurrencyConfig {
  code: string;
  symbol: string;
  label: string;
  rate: number; // exchange rate relative to USD
}

export interface FAQItem {
  id: string;
  category: 'Orders' | 'Shipping' | 'Returns' | 'Payments' | 'Products' | 'General';
  question: string;
  answer: string;
}

export interface Profile {
  id: string;
  fullName: string | null;
  phone: string | null;
  avatarUrl: string | null;
  email?: string;
  createdAt?: string;
}

export interface Address {
  id: string;
  userId: string;
  fullName: string;
  phone?: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  isDefault: boolean;
  createdAt?: string;
}

export interface OrderItem {
  id: string;
  orderId: string;
  productId?: string;
  variantId?: string;
  productName: string;
  variantName?: string;
  sku?: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  createdAt?: string;
}

export interface Order {
  id: string;
  userId?: string | null;
  orderNumber: string;
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded';
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded' | 'partially_refunded';
  currency: string;
  subtotal: number;
  shippingAmount: number;
  discountAmount: number;
  totalAmount: number;
  shippingAddress: any;
  billingAddress?: any;
  customerEmail: string;
  customerPhone?: string | null;
  items?: OrderItem[];
  createdAt: string;
  updatedAt: string;
}

export interface Review {
  id: string;
  productId: string;
  productTitle?: string;
  userId?: string | null;
  userName?: string;
  rating: number;
  title: string | null;
  content: string;
  isApproved: boolean;
  createdAt: string;
}

export interface AnalyticsSummary {
  totalRevenue: number;
  totalOrders: number;
  totalCustomers: number;
  totalProducts: number;
  averageOrderValue: number;
  paidOrdersCount: number;
  pendingOrdersCount: number;
  cancelledOrdersCount: number;
  refundedAmount: number;
  netRevenue: number;
  revenueByDay: Array<{ date: string; revenue: number; orders: number }>;
  orderStatusDistribution: Record<string, number>;
  topProducts: Array<{ name: string; quantity: number; revenue: number }>;
}

export type PageRoute =
  | 'home'
  | 'shop'
  | 'categories'
  | 'category'
  | 'product'
  | 'cart'
  | 'checkout'
  | 'about'
  | 'faq'
  | 'contact'
  | 'auth'
  | 'account'
  | 'admin'
  | 'admin/products'
  | 'admin/products/new'
  | 'admin/products/edit'
  | 'admin/categories'
  | 'admin/orders'
  | 'admin/customers'
  | 'admin/analytics'
  | 'admin/reviews'
  | 'admin/settings'
  | 'shipping-policy'
  | 'refund-policy'
  | 'privacy-policy'
  | 'terms';

export interface RouteState {
  page: PageRoute;
  params?: {
    categorySlug?: string;
    productSlug?: string;
    searchQuery?: string;
    productId?: string;
    orderId?: string;
    authTab?: 'login' | 'signup' | 'forgot' | 'reset';
  };
}
