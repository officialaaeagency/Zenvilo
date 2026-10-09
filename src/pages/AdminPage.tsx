import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigation } from '../context/NavigationContext';
import { useCurrency } from '../context/CurrencyContext';
import { useToast } from '../context/ToastContext';
import { isSupabaseConfigured, checkSupabaseConnection, supabase } from '../lib/supabase';
import {
  getRealAnalytics,
  getAdminProducts,
  createProduct,
  updateProduct,
  duplicateProduct,
  toggleProductActive,
  toggleProductFeatured,
  toggleProductBestseller,
  toggleProductNewArrival,
  deleteProduct,
  createCategory,
  updateCategory,
  deleteCategory,
  getAllOrders,
  updateOrderStatus,
  updatePaymentStatus,
  getAllCustomers,
  getLoginActivity,
  getAllReviews,
  toggleReviewApproval,
  deleteReview,
  uploadCatalogImage,
} from '../services/adminService';
import { getCategories } from '../services/catalogService';
import { Product, Category, Order, Review, AnalyticsSummary } from '../types/store';
import { ProductFormModal } from '../components/admin/ProductFormModal';
import { Button } from '../components/common/Button';
import { Logo } from '../components/common/Logo';
import { EmptyState } from '../components/common/EmptyState';
import {
  LayoutDashboard,
  Package,
  Layers,
  ShoppingBag,
  Users,
  Star,
  Settings,
  Database,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ExternalLink,
  ChevronRight,
  TrendingUp,
  DollarSign,
  Clock,
  Truck,
  Edit,
  Trash2,
  Copy,
  Check,
  RefreshCw,
  Eye,
  X,
  Upload,
  Shield,
  Lock,
  Activity,
  Sparkles,
  SlidersHorizontal,
} from 'lucide-react';

export const AdminPage: React.FC = () => {
  const { user, profile, isAdmin, loading: authLoading, signOut } = useAuth();
  const { route, navigate } = useNavigation();
  const { formatPrice } = useCurrency();
  const { showToast } = useToast();

  // Active view
  type AdminTab = 'overview' | 'products' | 'categories' | 'orders' | 'customers' | 'logins' | 'reviews' | 'database';
  
  const getInitialTab = (): AdminTab => {
    if (route.page.includes('products')) return 'products';
    if (route.page.includes('categories')) return 'categories';
    if (route.page.includes('orders')) return 'orders';
    if (route.page.includes('customers')) return 'customers';
    if (route.page.includes('logins')) return 'logins';
    if (route.page.includes('reviews')) return 'reviews';
    if (route.page.includes('settings')) return 'database';
    return 'overview';
  };

  const [activeTab, setActiveTab] = useState<AdminTab>(getInitialTab());

  // Data states
  const [analytics, setAnalytics] = useState<AnalyticsSummary | null>(null);
  const [timeRange, setTimeRange] = useState<'today' | '7d' | '30d' | 'all'>('30d');
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [loginActivities, setLoginActivities] = useState<any[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loadingData, setLoadingData] = useState(false);

  // Filters & searches
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState('all');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<'all' | 'active' | 'draft' | 'inactive'>('all');
  const [selectedStockFilter, setSelectedStockFilter] = useState<'all' | 'in_stock' | 'low_stock' | 'out_of_stock'>('all');
  const [productSortBy, setProductSortBy] = useState<'newest' | 'name-asc' | 'name-desc' | 'price-asc' | 'price-desc' | 'stock-desc' | 'stock-asc'>('newest');
  const [selectedOrderStatusFilter, setSelectedOrderStatusFilter] = useState('all');

  // Modals & action states
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  const [isDeletingProduct, setIsDeletingProduct] = useState(false);
  const [duplicatingId, setDuplicatingId] = useState<string | null>(null);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [viewingOrder, setViewingOrder] = useState<Order | null>(null);

  // Connection diagnostic
  const [connStatus, setConnStatus] = useState<{
    tested: boolean;
    connected: boolean;
    message: string;
    loading: boolean;
  }>({
    tested: false,
    connected: false,
    message: '',
    loading: false,
  });

  const [copiedSql, setCopiedSql] = useState(false);

  // Load live data based on active tab
  const refreshCurrentView = async () => {
    setLoadingData(true);
    try {
      if (activeTab === 'overview') {
        const [anRes, ordRes] = await Promise.all([
          getRealAnalytics(timeRange),
          getAllOrders(),
        ]);
        if (anRes.data) setAnalytics(anRes.data);
        if (ordRes.data) setOrders(ordRes.data.slice(0, 10)); // Top 10 for overview
      } else if (activeTab === 'products') {
        const [prodRes, catRes] = await Promise.all([
          getAdminProducts(),
          getCategories(),
        ]);
        setProducts(prodRes.data);
        setCategories(catRes.data);
      } else if (activeTab === 'categories') {
        const catRes = await getCategories();
        setCategories(catRes.data);
      } else if (activeTab === 'orders') {
        const ordRes = await getAllOrders();
        setOrders(ordRes.data);
      } else if (activeTab === 'customers') {
        const custRes = await getAllCustomers();
        setCustomers(custRes.data);
      } else if (activeTab === 'logins') {
        const logRes = await getLoginActivity();
        setLoginActivities(logRes.data);
      } else if (activeTab === 'reviews') {
        const revRes = await getAllReviews();
        setReviews(revRes.data);
      }
    } catch (err) {
      console.warn('[Admin] View refresh error:', err);
    } finally {
      setLoadingData(false);
    }
  };

  useEffect(() => {
    if (isAdmin) {
      refreshCurrentView();
    }
  }, [isAdmin, activeTab, timeRange]);

  const testConnection = async () => {
    setConnStatus((prev) => ({ ...prev, loading: true }));
    const res = await checkSupabaseConnection();
    setConnStatus({
      tested: true,
      connected: res.connected,
      message: res.message,
      loading: false,
    });
  };

  // Emergency bootstrap admin handler if user is currently owner
  const handleClaimAdmin = async () => {
    if (!user) return;
    try {
      const { error } = await (supabase.from('user_roles') as any).upsert({
        user_id: user.id,
        role: 'admin',
      });
      if (error) {
        showToast('Database error: ' + error.message, 'error');
      } else {
        showToast('Admin privileges claimed! Reloading permissions...', 'success');
        window.location.reload();
      }
    } catch (err: any) {
      showToast(err?.message || 'Failed to claim role', 'error');
    }
  };

  // Copy full SQL script helper
  const handleCopySqlScript = () => {
    const sqlText = `-- ZENVILO SUPABASE COMPLETE SCHEMA
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'customer' CHECK (role IN ('customer', 'admin')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT uq_user_role UNIQUE (user_id, role)
);

CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT, phone TEXT, avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL, slug TEXT NOT NULL UNIQUE, description TEXT, image_url TEXT,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
  name TEXT NOT NULL, slug TEXT NOT NULL UNIQUE, short_description TEXT, description TEXT,
  price NUMERIC(10,2) NOT NULL CHECK (price >= 0), compare_at_price NUMERIC(10,2),
  currency TEXT NOT NULL DEFAULT 'USD', sku TEXT, inventory_quantity INT NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT TRUE, is_featured BOOLEAN NOT NULL DEFAULT FALSE,
  is_bestseller BOOLEAN NOT NULL DEFAULT FALSE, is_new BOOLEAN NOT NULL DEFAULT FALSE,
  seo_title TEXT, seo_description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.product_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL, alt_text TEXT, sort_order INT NOT NULL DEFAULT 0,
  is_primary BOOLEAN NOT NULL DEFAULT FALSE, created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.product_variants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  name TEXT NOT NULL, sku TEXT, price NUMERIC(10,2), compare_at_price NUMERIC(10,2),
  inventory_quantity INT NOT NULL DEFAULT 0, options JSONB NOT NULL DEFAULT '{}'::jsonb,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  order_number TEXT NOT NULL UNIQUE,
  status TEXT NOT NULL DEFAULT 'pending', payment_status TEXT NOT NULL DEFAULT 'pending',
  currency TEXT NOT NULL DEFAULT 'USD', subtotal NUMERIC(10,2) NOT NULL DEFAULT 0,
  shipping_amount NUMERIC(10,2) NOT NULL DEFAULT 0, discount_amount NUMERIC(10,2) NOT NULL DEFAULT 0,
  total_amount NUMERIC(10,2) NOT NULL DEFAULT 0,
  shipping_address JSONB NOT NULL DEFAULT '{}'::jsonb, billing_address JSONB DEFAULT '{}'::jsonb,
  customer_email TEXT NOT NULL, customer_phone TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
  variant_id UUID REFERENCES public.product_variants(id) ON DELETE SET NULL,
  product_name TEXT NOT NULL, variant_name TEXT, sku TEXT,
  quantity INT NOT NULL CHECK (quantity > 0), unit_price NUMERIC(10,2) NOT NULL,
  total_price NUMERIC(10,2) NOT NULL, created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.addresses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL, phone TEXT, address_line_1 TEXT NOT NULL, address_line_2 TEXT,
  city TEXT NOT NULL, state TEXT NOT NULL, postal_code TEXT NOT NULL, country TEXT NOT NULL DEFAULT 'US',
  is_default BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5), title TEXT, content TEXT NOT NULL,
  is_approved BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.wishlist_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT uq_user_product_wishlist UNIQUE (user_id, product_id)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read active categories" ON public.categories FOR SELECT USING (is_active = TRUE);
CREATE POLICY "Admins manage categories" ON public.categories FOR ALL USING (EXISTS (SELECT 1 FROM public.user_roles ur WHERE ur.user_id = auth.uid() AND ur.role = 'admin'));
CREATE POLICY "Public read active products" ON public.products FOR SELECT USING (is_active = TRUE);
CREATE POLICY "Admins manage products" ON public.products FOR ALL USING (EXISTS (SELECT 1 FROM public.user_roles ur WHERE ur.user_id = auth.uid() AND ur.role = 'admin'));
CREATE POLICY "Public read product images" ON public.product_images FOR SELECT USING (TRUE);
CREATE POLICY "Admins manage product images" ON public.product_images FOR ALL USING (EXISTS (SELECT 1 FROM public.user_roles ur WHERE ur.user_id = auth.uid() AND ur.role = 'admin'));
CREATE POLICY "Public read product variants" ON public.product_variants FOR SELECT USING (TRUE);
CREATE POLICY "Admins manage product variants" ON public.product_variants FOR ALL USING (EXISTS (SELECT 1 FROM public.user_roles ur WHERE ur.user_id = auth.uid() AND ur.role = 'admin'));
CREATE POLICY "Admins manage orders" ON public.orders FOR ALL USING (EXISTS (SELECT 1 FROM public.user_roles ur WHERE ur.user_id = auth.uid() AND ur.role = 'admin'));
CREATE POLICY "Admins manage order items" ON public.order_items FOR ALL USING (EXISTS (SELECT 1 FROM public.user_roles ur WHERE ur.user_id = auth.uid() AND ur.role = 'admin'));
CREATE POLICY "Public read approved reviews" ON public.reviews FOR SELECT USING (is_approved = TRUE);
CREATE POLICY "Admins manage reviews" ON public.reviews FOR ALL USING (EXISTS (SELECT 1 FROM public.user_roles ur WHERE ur.user_id = auth.uid() AND ur.role = 'admin'));
`;
    navigator.clipboard.writeText(sqlText);
    setCopiedSql(true);
    showToast('Complete SQL Schema copied to clipboard!', 'success');
    setTimeout(() => setCopiedSql(false), 2500);
  };

  // ACCESS CONTROL GATE
  if (authLoading) {
    return (
      <div className="min-h-screen bg-neutral-950 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // If user is not logged in
  if (!user) {
    return (
      <div className="min-h-screen bg-neutral-950 flex items-center justify-center p-4">
        <div className="w-full max-w-md p-8 bg-neutral-900 border border-neutral-800 rounded-3xl text-center space-y-6 shadow-2xl">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-violet-950/80 border border-violet-800/60 flex items-center justify-center text-violet-400">
            <Lock className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white tracking-tight">Admin Access Required</h1>
            <p className="text-xs text-neutral-400 mt-2 leading-relaxed">
              Please authenticate with your store administrator account to access the Zenvilo management dashboard.
            </p>
          </div>
          <div className="space-y-3 pt-2">
            <Button
              variant="primary"
              fullWidth
              onClick={() => navigate('auth', { authTab: 'login' })}
            >
              Log In as Administrator
            </Button>
            <button
              onClick={() => navigate('home')}
              className="text-xs text-neutral-400 hover:text-white"
            >
              Return to Storefront
            </button>
          </div>
        </div>
      </div>
    );
  }

  // If logged in but not admin role
  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-neutral-950 flex items-center justify-center p-4">
        <div className="w-full max-w-lg p-8 bg-neutral-900 border border-neutral-800 rounded-3xl space-y-6 shadow-2xl">
          <div className="flex items-center gap-3 pb-4 border-b border-neutral-800">
            <div className="w-10 h-10 rounded-xl bg-amber-950/80 border border-amber-800/60 flex items-center justify-center text-amber-400 shrink-0">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Administrator Role Restricted</h2>
              <p className="text-xs text-neutral-400">Your account does not possess admin permissions yet.</p>
            </div>
          </div>

          <div className="p-4 bg-neutral-950 border border-neutral-800 rounded-2xl text-xs space-y-2 text-neutral-300 font-mono">
            <div><span className="text-neutral-500">Email:</span> {user.email}</div>
            <div><span className="text-neutral-500">User ID:</span> {user.id}</div>
            <div><span className="text-neutral-500">Current Role:</span> customer</div>
          </div>

          <div className="text-xs text-neutral-400 space-y-2 leading-relaxed">
            <p>
              To grant your user account full store administrator privileges, run this quick command in your <strong className="text-neutral-200">Supabase SQL Editor</strong>:
            </p>
            <div className="p-3 bg-neutral-950 border border-neutral-800 rounded-xl font-mono text-[11px] text-violet-300 select-all overflow-x-auto">
              INSERT INTO public.user_roles (user_id, role) VALUES ('{user.id}', 'admin') ON CONFLICT DO NOTHING;
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
            <Button
              variant="primary"
              fullWidth
              onClick={handleClaimAdmin}
            >
              Grant Admin Role to This User
            </Button>
            <Button
              variant="outline"
              fullWidth
              onClick={() => navigate('account')}
            >
              Go to Customer Account
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col font-sans">
      {/* Top Admin Bar */}
      <header className="sticky top-0 z-30 bg-neutral-950/95 backdrop-blur-md border-b border-neutral-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setActiveTab('overview')}
              className="flex items-center gap-2 focus:outline-none"
            >
              <Logo size="sm" />
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-violet-600 text-white tracking-widest uppercase">
                Admin
              </span>
            </button>

            <div className="hidden md:flex items-center gap-2 text-xs text-neutral-400 pl-4 border-l border-neutral-800">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Real Supabase Storefront</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('home')}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-neutral-400 hover:text-white bg-neutral-900 border border-neutral-800 rounded-lg hover:border-neutral-700 transition-colors"
            >
              <span>View Live Store</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </button>

            <div className="h-4 w-px bg-neutral-800" />

            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-violet-950 border border-violet-800 flex items-center justify-center text-xs font-bold text-violet-300">
                {(profile?.fullName || user.email || 'A').charAt(0).toUpperCase()}
              </div>
              <span className="hidden sm:inline text-xs text-neutral-300 font-medium">
                {profile?.fullName || user.email}
              </span>
            </div>
          </div>
        </div>

        {/* Admin Navigation Tabs */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center gap-1 overflow-x-auto border-t border-neutral-900 py-1.5 scrollbar-none">
          {[
            { id: 'overview', label: 'Analytics & Overview', icon: LayoutDashboard },
            { id: 'products', label: 'Products', icon: Package },
            { id: 'categories', label: 'Categories', icon: Layers },
            { id: 'orders', label: 'Orders', icon: ShoppingBag },
            { id: 'customers', label: 'Customers', icon: Users },
            { id: 'logins', label: 'Login Activity', icon: Activity },
            { id: 'reviews', label: 'Reviews', icon: Star },
            { id: 'database', label: 'Database & SQL', icon: Database },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as AdminTab)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-medium whitespace-nowrap transition-colors ${
                  isActive
                    ? 'bg-neutral-900 text-violet-400 border border-neutral-800 font-semibold'
                    : 'text-neutral-400 hover:bg-neutral-900/50 hover:text-neutral-200'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
        {/* ========================================================== */}
        {/* TAB 1: OVERVIEW & REAL ANALYTICS */}
        {/* ========================================================== */}
        {activeTab === 'overview' && (
          <div className="space-y-8 animate-in fade-in duration-200">
            {/* Header with Time Filter */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-white tracking-tight">Store Overview & Performance</h2>
                <p className="text-xs text-neutral-400 mt-1">Real-time statistics calculated directly from Supabase orders and products.</p>
              </div>

              <div className="flex items-center gap-2">
                {(['today', '7d', '30d', 'all'] as const).map((r) => (
                  <button
                    key={r}
                    onClick={() => setTimeRange(r)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                      timeRange === r
                        ? 'bg-violet-600 text-white'
                        : 'bg-neutral-900 text-neutral-400 hover:text-white border border-neutral-800'
                    }`}
                  >
                    {r === 'today' ? 'Today' : r === '7d' ? '7 Days' : r === '30d' ? '30 Days' : 'All Time'}
                  </button>
                ))}
                <button
                  onClick={refreshCurrentView}
                  className="p-1.5 text-neutral-400 hover:text-white bg-neutral-900 border border-neutral-800 rounded-lg ml-1"
                  title="Refresh"
                >
                  <RefreshCw className={`w-4 h-4 ${loadingData ? 'animate-spin' : ''}`} />
                </button>
              </div>
            </div>

            {/* KPI Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Gross Revenue */}
              <div className="p-5 bg-neutral-900/90 border border-neutral-800 rounded-2xl relative overflow-hidden">
                <div className="flex items-center justify-between text-neutral-400 mb-2">
                  <span className="text-xs font-medium">Gross Revenue</span>
                  <div className="w-8 h-8 rounded-lg bg-emerald-950/60 border border-emerald-800/50 flex items-center justify-center text-emerald-400">
                    <DollarSign className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-2xl font-bold text-white tracking-tight">
                  {formatPrice(analytics?.totalRevenue ?? 0)}
                </div>
                <div className="text-[11px] text-neutral-400 mt-1">
                  Net: {formatPrice(analytics?.netRevenue ?? 0)}
                </div>
              </div>

              {/* Total Orders */}
              <div className="p-5 bg-neutral-900/90 border border-neutral-800 rounded-2xl relative overflow-hidden">
                <div className="flex items-center justify-between text-neutral-400 mb-2">
                  <span className="text-xs font-medium">Total Orders</span>
                  <div className="w-8 h-8 rounded-lg bg-violet-950/60 border border-violet-800/50 flex items-center justify-center text-violet-400">
                    <ShoppingBag className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-2xl font-bold text-white tracking-tight">
                  {analytics?.totalOrders ?? 0}
                </div>
                <div className="text-[11px] text-neutral-400 mt-1">
                  Paid: {analytics?.paidOrdersCount ?? 0} · Pending: {analytics?.pendingOrdersCount ?? 0}
                </div>
              </div>

              {/* Average Order Value */}
              <div className="p-5 bg-neutral-900/90 border border-neutral-800 rounded-2xl relative overflow-hidden">
                <div className="flex items-center justify-between text-neutral-400 mb-2">
                  <span className="text-xs font-medium">Average Order Value (AOV)</span>
                  <div className="w-8 h-8 rounded-lg bg-blue-950/60 border border-blue-800/50 flex items-center justify-center text-blue-400">
                    <TrendingUp className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-2xl font-bold text-white tracking-tight">
                  {formatPrice(analytics?.averageOrderValue ?? 0)}
                </div>
                <div className="text-[11px] text-neutral-400 mt-1">
                  Per completed transaction
                </div>
              </div>

              {/* Customers & Products */}
              <div className="p-5 bg-neutral-900/90 border border-neutral-800 rounded-2xl relative overflow-hidden">
                <div className="flex items-center justify-between text-neutral-400 mb-2">
                  <span className="text-xs font-medium">Catalog & Customers</span>
                  <div className="w-8 h-8 rounded-lg bg-cyan-950/60 border border-cyan-800/50 flex items-center justify-center text-cyan-400">
                    <Users className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-2xl font-bold text-white tracking-tight">
                  {analytics?.totalCustomers ?? 0} <span className="text-sm font-normal text-neutral-400">users</span>
                </div>
                <div className="text-[11px] text-neutral-400 mt-1">
                  {analytics?.totalProducts ?? 0} products in catalog
                </div>
              </div>
            </div>

            {/* Quick Actions & Recent Orders Row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Quick Shortcuts */}
              <div className="lg:col-span-1 p-6 bg-neutral-900 border border-neutral-800 rounded-2xl space-y-4">
                <h3 className="text-sm font-bold text-white">Management Shortcuts</h3>
                <div className="space-y-2">
                  <button
                    onClick={() => {
                      setEditingProduct(null);
                      setIsProductModalOpen(true);
                    }}
                    className="w-full flex items-center justify-between p-3 rounded-xl bg-neutral-950 border border-neutral-800 hover:border-violet-600 transition-colors text-left"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-violet-950/80 text-violet-400 flex items-center justify-center">
                        <Plus className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-xs font-semibold text-white">Add New Product</div>
                        <div className="text-[11px] text-neutral-400">Add to store catalog with photos</div>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-neutral-500" />
                  </button>

                  <button
                    onClick={() => {
                      setEditingCategory(null);
                      setIsCategoryModalOpen(true);
                    }}
                    className="w-full flex items-center justify-between p-3 rounded-xl bg-neutral-950 border border-neutral-800 hover:border-violet-600 transition-colors text-left"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-blue-950/80 text-blue-400 flex items-center justify-center">
                        <Layers className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-xs font-semibold text-white">Create Category</div>
                        <div className="text-[11px] text-neutral-400">Organize merchandise departments</div>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-neutral-500" />
                  </button>

                  <button
                    onClick={() => setActiveTab('database')}
                    className="w-full flex items-center justify-between p-3 rounded-xl bg-neutral-950 border border-neutral-800 hover:border-violet-600 transition-colors text-left"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-emerald-950/80 text-emerald-400 flex items-center justify-center">
                        <Database className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-xs font-semibold text-white">Database & SQL Editor</div>
                        <div className="text-[11px] text-neutral-400">Check Supabase tables & scripts</div>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-neutral-500" />
                  </button>
                </div>
              </div>

              {/* Recent Orders List */}
              <div className="lg:col-span-2 p-6 bg-neutral-900 border border-neutral-800 rounded-2xl space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-white">Recent Customer Orders</h3>
                  <button
                    onClick={() => setActiveTab('orders')}
                    className="text-xs text-violet-400 hover:underline"
                  >
                    View All Orders →
                  </button>
                </div>

                {orders.length === 0 ? (
                  <div className="py-12 text-center text-xs text-neutral-500">
                    No orders recorded in Supabase yet.
                  </div>
                ) : (
                  <div className="divide-y divide-neutral-800/80">
                    {orders.slice(0, 5).map((o) => (
                      <div
                        key={o.id}
                        className="py-3 flex items-center justify-between gap-4 text-xs"
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-semibold text-white">{o.orderNumber}</span>
                            <span className="px-2 py-0.5 rounded text-[10px] bg-neutral-800 text-neutral-300 capitalize">
                              {o.status}
                            </span>
                          </div>
                          <div className="text-[11px] text-neutral-400 mt-0.5">
                            {o.customerEmail} · {new Date(o.createdAt).toLocaleDateString()}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-white">{formatPrice(o.totalAmount)}</div>
                          <button
                            onClick={() => {
                              setViewingOrder(o);
                            }}
                            className="text-[11px] text-violet-400 hover:underline"
                          >
                            Details
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ========================================================== */}
        {/* TAB 2: PRODUCTS MANAGEMENT */}
        {/* ========================================================== */}
        {activeTab === 'products' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            {/* Header with Title and Add Button */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
                  <Package className="w-5 h-5 text-violet-400" />
                  <span>Product Management</span>
                </h2>
                <p className="text-xs text-neutral-400 mt-1">
                  Manage store catalog, prices, cost margins, variants, and stock stored in Supabase.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={refreshCurrentView}
                  isLoading={loadingData}
                  className="flex items-center gap-1.5"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Refresh</span>
                </Button>

                <Button
                  variant="primary"
                  onClick={() => {
                    setEditingProduct(null);
                    setIsProductModalOpen(true);
                  }}
                  className="flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Product</span>
                </Button>
              </div>
            </div>

            {/* Catalog KPI Stats Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              <div className="p-3.5 bg-neutral-900 border border-neutral-800 rounded-xl">
                <div className="text-[11px] text-neutral-400 font-medium">Total Products</div>
                <div className="text-xl font-bold text-white mt-1">{products.length}</div>
              </div>

              <div className="p-3.5 bg-neutral-900 border border-neutral-800 rounded-xl">
                <div className="text-[11px] text-emerald-400 font-medium">Active (Storefront)</div>
                <div className="text-xl font-bold text-emerald-300 mt-1">
                  {products.filter((p) => p.isActive && p.status !== 'draft').length}
                </div>
              </div>

              <div className="p-3.5 bg-neutral-900 border border-neutral-800 rounded-xl">
                <div className="text-[11px] text-amber-400 font-medium">Drafts (Hidden)</div>
                <div className="text-xl font-bold text-amber-300 mt-1">
                  {products.filter((p) => p.status === 'draft').length}
                </div>
              </div>

              <div className="p-3.5 bg-neutral-900 border border-neutral-800 rounded-xl">
                <div className="text-[11px] text-yellow-400 font-medium">Low Stock (&le; 5)</div>
                <div className="text-xl font-bold text-yellow-300 mt-1">
                  {products.filter((p) => p.inventory > 0 && p.inventory <= (p.lowStockThreshold ?? 5)).length}
                </div>
              </div>

              <div className="p-3.5 bg-neutral-900 border border-neutral-800 rounded-xl">
                <div className="text-[11px] text-red-400 font-medium">Out of Stock</div>
                <div className="text-xl font-bold text-red-300 mt-1">
                  {products.filter((p) => p.inventory <= 0).length}
                </div>
              </div>

              <div className="p-3.5 bg-neutral-900 border border-neutral-800 rounded-xl">
                <div className="text-[11px] text-violet-400 font-medium">Featured Items</div>
                <div className="text-xl font-bold text-violet-300 mt-1">
                  {products.filter((p) => p.featured).length}
                </div>
              </div>
            </div>

            {/* Comprehensive Search & Filter Toolbar */}
            <div className="p-4 bg-neutral-900/90 border border-neutral-800 rounded-2xl space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
                {/* Search input */}
                <div className="relative sm:col-span-2">
                  <Search className="w-4 h-4 text-neutral-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search by title, SKU, brand, tags..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 bg-neutral-950 border border-neutral-800 rounded-xl text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-violet-500"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-white"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* Category filter */}
                <div>
                  <select
                    value={selectedCategoryFilter}
                    onChange={(e) => setSelectedCategoryFilter(e.target.value)}
                    className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-xl text-xs text-neutral-300 focus:outline-none focus:border-violet-500"
                  >
                    <option value="all">All Categories</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Status filter */}
                <div>
                  <select
                    value={selectedStatusFilter}
                    onChange={(e) => setSelectedStatusFilter(e.target.value as any)}
                    className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-xl text-xs text-neutral-300 focus:outline-none focus:border-violet-500"
                  >
                    <option value="all">All Statuses</option>
                    <option value="active">Active Only</option>
                    <option value="draft">Drafts Only</option>
                    <option value="inactive">Inactive / Archived</option>
                  </select>
                </div>

                {/* Stock filter */}
                <div>
                  <select
                    value={selectedStockFilter}
                    onChange={(e) => setSelectedStockFilter(e.target.value as any)}
                    className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-xl text-xs text-neutral-300 focus:outline-none focus:border-violet-500"
                  >
                    <option value="all">All Stock Levels</option>
                    <option value="in_stock">In Stock (&gt; 5)</option>
                    <option value="low_stock">Low Stock (1–5)</option>
                    <option value="out_of_stock">Out of Stock (0)</option>
                  </select>
                </div>
              </div>

              {/* Sub-toolbar: Sort By & Reset */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-neutral-800/60 text-xs">
                <div className="flex items-center gap-2 text-neutral-400">
                  <SlidersHorizontal className="w-3.5 h-3.5 text-neutral-500" />
                  <span>Sort By:</span>
                  <select
                    value={productSortBy}
                    onChange={(e) => setProductSortBy(e.target.value as any)}
                    className="px-2.5 py-1 bg-neutral-950 border border-neutral-800 rounded-lg text-xs text-neutral-300 focus:outline-none focus:border-violet-500"
                  >
                    <option value="newest">Newest First</option>
                    <option value="name-asc">Title: A &rarr; Z</option>
                    <option value="name-desc">Title: Z &rarr; A</option>
                    <option value="price-asc">Price: Low to High</option>
                    <option value="price-desc">Price: High to Low</option>
                    <option value="stock-desc">Stock: High to Low</option>
                    <option value="stock-asc">Stock: Low to High</option>
                  </select>
                </div>

                {(searchQuery || selectedCategoryFilter !== 'all' || selectedStatusFilter !== 'all' || selectedStockFilter !== 'all') && (
                  <button
                    onClick={() => {
                      setSearchQuery('');
                      setSelectedCategoryFilter('all');
                      setSelectedStatusFilter('all');
                      setSelectedStockFilter('all');
                      setProductSortBy('newest');
                    }}
                    className="text-violet-400 hover:text-violet-300 hover:underline"
                  >
                    Clear All Filters
                  </button>
                )}
              </div>
            </div>

            {/* Filtered Products Count */}
            {(() => {
              const q = searchQuery.toLowerCase().trim();
              const filteredList = products
                .filter((p) => {
                  const matchesSearch =
                    !q ||
                    p.title.toLowerCase().includes(q) ||
                    (p.sku && p.sku.toLowerCase().includes(q)) ||
                    (p.brand && p.brand.toLowerCase().includes(q)) ||
                    (p.tags && p.tags.some((t) => t.toLowerCase().includes(q)));

                  const matchesCat =
                    selectedCategoryFilter === 'all' || p.categoryId === selectedCategoryFilter;

                  const matchesStatus =
                    selectedStatusFilter === 'all' ||
                    (selectedStatusFilter === 'active' && p.isActive && p.status !== 'draft') ||
                    (selectedStatusFilter === 'draft' && p.status === 'draft') ||
                    (selectedStatusFilter === 'inactive' && (!p.isActive || p.status === 'inactive'));

                  const stock = p.inventory ?? 0;
                  const lowThresh = p.lowStockThreshold ?? 5;
                  const matchesStock =
                    selectedStockFilter === 'all' ||
                    (selectedStockFilter === 'in_stock' && stock > lowThresh) ||
                    (selectedStockFilter === 'low_stock' && stock > 0 && stock <= lowThresh) ||
                    (selectedStockFilter === 'out_of_stock' && stock <= 0);

                  return matchesSearch && matchesCat && matchesStatus && matchesStock;
                })
                .sort((a, b) => {
                  if (productSortBy === 'name-asc') return a.title.localeCompare(b.title);
                  if (productSortBy === 'name-desc') return b.title.localeCompare(a.title);
                  if (productSortBy === 'price-asc') return a.price - b.price;
                  if (productSortBy === 'price-desc') return b.price - a.price;
                  if (productSortBy === 'stock-asc') return a.inventory - b.inventory;
                  if (productSortBy === 'stock-desc') return b.inventory - a.inventory;
                  return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
                });

              if (filteredList.length === 0) {
                return (
                  <EmptyState
                    icon={<Package className="w-8 h-8 text-neutral-500" />}
                    title={products.length === 0 ? "Catalog is empty" : "No matching products"}
                    description={
                      products.length === 0
                        ? "There are no products in your database yet. Tap 'Add Product' to create your first item."
                        : "No products matched your search or filters. Try adjusting your query or resetting filters."
                    }
                    actionText={products.length === 0 ? "Add First Product" : "Clear Filters"}
                    onAction={() => {
                      if (products.length === 0) {
                        setEditingProduct(null);
                        setIsProductModalOpen(true);
                      } else {
                        setSearchQuery('');
                        setSelectedCategoryFilter('all');
                        setSelectedStatusFilter('all');
                        setSelectedStockFilter('all');
                      }
                    }}
                  />
                );
              }

              return (
                <div className="space-y-4">
                  <div className="text-xs text-neutral-400">
                    Showing <span className="text-white font-semibold">{filteredList.length}</span> of{' '}
                    <span className="text-white font-semibold">{products.length}</span> products
                  </div>

                  {/* Desktop Table View (Hidden on mobile) */}
                  <div className="hidden lg:block bg-neutral-900 border border-neutral-800 rounded-2xl overflow-hidden shadow-xl">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-neutral-950/90 border-b border-neutral-800 text-neutral-400 uppercase tracking-wider font-semibold">
                          <tr>
                            <th className="py-3 px-4">Product & SKU</th>
                            <th className="py-3 px-4">Category & Brand</th>
                            <th className="py-3 px-4">Selling Price</th>
                            <th className="py-3 px-4">Cost & Margin</th>
                            <th className="py-3 px-4">Stock</th>
                            <th className="py-3 px-4">Status</th>
                            <th className="py-3 px-4">Highlights</th>
                            <th className="py-3 px-4 text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-neutral-800/80 text-neutral-300">
                          {filteredList.map((p) => {
                            const numPrice = p.price || 0;
                            const numCost = p.costPrice !== undefined ? p.costPrice : null;
                            const profit = numCost !== null ? numPrice - numCost : null;
                            const marginPct =
                              profit !== null && numPrice > 0
                                ? ((profit / numPrice) * 100).toFixed(0)
                                : null;

                            return (
                              <tr key={p.id} className="hover:bg-neutral-800/40 transition-colors">
                                {/* Product info & photo */}
                                <td className="py-3 px-4">
                                  <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 rounded-xl bg-neutral-950 overflow-hidden shrink-0 border border-neutral-800 relative">
                                      {p.images[0] ? (
                                        <img
                                          src={p.images[0]}
                                          alt={p.title}
                                          className="w-full h-full object-cover"
                                        />
                                      ) : (
                                        <div className="w-full h-full flex items-center justify-center text-[10px] text-neutral-600">
                                          No img
                                        </div>
                                      )}
                                      {p.images.length > 1 && (
                                        <span className="absolute bottom-0 right-0 bg-black/80 text-[9px] px-1 text-neutral-300 font-mono">
                                          +{p.images.length - 1}
                                        </span>
                                      )}
                                    </div>
                                    <div className="min-w-0 max-w-xs">
                                      <div className="font-semibold text-white truncate">{p.title}</div>
                                      <div className="text-[11px] text-neutral-400 font-mono mt-0.5">
                                        {p.sku || p.slug}
                                      </div>
                                    </div>
                                  </div>
                                </td>

                                {/* Category & Brand */}
                                <td className="py-3 px-4">
                                  <div className="text-neutral-200">{p.category}</div>
                                  <div className="text-[10px] text-neutral-500">{p.brand || 'Zenvilo'}</div>
                                </td>

                                {/* Selling Price */}
                                <td className="py-3 px-4">
                                  <div className="font-mono font-bold text-white">
                                    {formatPrice(p.price)}
                                  </div>
                                  {p.compareAtPrice && p.compareAtPrice > p.price && (
                                    <div className="text-[10px] text-neutral-500 font-mono line-through">
                                      {formatPrice(p.compareAtPrice)}
                                    </div>
                                  )}
                                </td>

                                {/* Cost & Margin (ADMIN ONLY) */}
                                <td className="py-3 px-4">
                                  {numCost !== null ? (
                                    <div>
                                      <div className="font-mono text-neutral-400 text-[11px]">
                                        Cost: {formatPrice(numCost)}
                                      </div>
                                      {profit !== null && (
                                        <div
                                          className={`text-[10px] font-mono font-medium ${
                                            profit >= 0 ? 'text-emerald-400' : 'text-red-400'
                                          }`}
                                        >
                                          Profit: +{formatPrice(profit)} ({marginPct}%)
                                        </div>
                                      )}
                                    </div>
                                  ) : (
                                    <span className="text-[10px] text-neutral-600 italic">Not set</span>
                                  )}
                                </td>

                                {/* Stock Badge */}
                                <td className="py-3 px-4">
                                  {p.inventory <= 0 ? (
                                    <span className="px-2.5 py-1 rounded-full text-[10px] font-semibold bg-red-950/70 border border-red-800/60 text-red-300">
                                      Out of stock
                                    </span>
                                  ) : p.inventory <= (p.lowStockThreshold ?? 5) ? (
                                    <span className="px-2.5 py-1 rounded-full text-[10px] font-semibold bg-amber-950/70 border border-amber-800/60 text-amber-300">
                                      {p.inventory} left (Low)
                                    </span>
                                  ) : (
                                    <span className="px-2.5 py-1 rounded-full text-[10px] font-semibold bg-emerald-950/70 border border-emerald-800/60 text-emerald-300">
                                      {p.inventory} in stock
                                    </span>
                                  )}
                                </td>

                                {/* Status Quick Toggle */}
                                <td className="py-3 px-4">
                                  <button
                                    onClick={async () => {
                                      const nextStatus = !p.isActive;
                                      await toggleProductActive(p.id, nextStatus);
                                      showToast(
                                        `Product "${p.title}" is now ${nextStatus ? 'Active' : 'Draft'}`,
                                        'info'
                                      );
                                      refreshCurrentView();
                                    }}
                                    className={`px-2.5 py-1 rounded-full text-[10px] font-semibold border transition-all ${
                                      p.isActive && p.status !== 'draft'
                                        ? 'bg-emerald-950/80 border-emerald-700 text-emerald-300 hover:bg-emerald-900/60'
                                        : 'bg-neutral-800 border-neutral-700 text-neutral-400 hover:bg-neutral-700'
                                    }`}
                                    title="Click to toggle Active / Draft status"
                                  >
                                    {p.isActive && p.status !== 'draft' ? 'Active' : 'Draft'}
                                  </button>
                                </td>

                                {/* Highlights Quick Toggles */}
                                <td className="py-3 px-4">
                                  <div className="flex items-center gap-1.5">
                                    <button
                                      onClick={async () => {
                                        await toggleProductFeatured(p.id, !p.featured);
                                        refreshCurrentView();
                                      }}
                                      className={`p-1 rounded-lg border text-[10px] transition-colors ${
                                        p.featured
                                          ? 'bg-violet-950 border-violet-700 text-violet-300'
                                          : 'bg-neutral-950 border-neutral-800 text-neutral-600 hover:text-neutral-400'
                                      }`}
                                      title={p.featured ? 'Featured on store (click to unfeature)' : 'Click to feature'}
                                    >
                                      ⭐
                                    </button>

                                    <button
                                      onClick={async () => {
                                        await toggleProductBestseller(p.id, !p.bestseller);
                                        refreshCurrentView();
                                      }}
                                      className={`p-1 rounded-lg border text-[10px] transition-colors ${
                                        p.bestseller
                                          ? 'bg-amber-950 border-amber-700 text-amber-300'
                                          : 'bg-neutral-950 border-neutral-800 text-neutral-600 hover:text-neutral-400'
                                      }`}
                                      title={p.bestseller ? 'Bestseller (click to remove)' : 'Click to mark Bestseller'}
                                    >
                                      🔥
                                    </button>

                                    <button
                                      onClick={async () => {
                                        await toggleProductNewArrival(p.id, !p.newArrival);
                                        refreshCurrentView();
                                      }}
                                      className={`p-1 rounded-lg border text-[10px] transition-colors ${
                                        p.newArrival
                                          ? 'bg-blue-950 border-blue-700 text-blue-300'
                                          : 'bg-neutral-950 border-neutral-800 text-neutral-600 hover:text-neutral-400'
                                      }`}
                                      title={p.newArrival ? 'New Arrival (click to remove)' : 'Click to mark New'}
                                    >
                                      ⚡
                                    </button>
                                  </div>
                                </td>

                                {/* Action Buttons */}
                                <td className="py-3 px-4 text-right">
                                  <div className="flex items-center justify-end gap-1.5">
                                    {/* Preview on Store */}
                                    <button
                                      onClick={() => navigate('product', { productSlug: p.slug })}
                                      className="p-1.5 text-neutral-400 hover:text-white hover:bg-neutral-800 rounded-lg transition-colors"
                                      title="View on Storefront"
                                    >
                                      <Eye className="w-3.5 h-3.5" />
                                    </button>

                                    {/* Edit Product */}
                                    <button
                                      onClick={() => {
                                        setEditingProduct(p);
                                        setIsProductModalOpen(true);
                                      }}
                                      className="p-1.5 text-neutral-400 hover:text-violet-400 hover:bg-neutral-800 rounded-lg transition-colors"
                                      title="Edit Product"
                                    >
                                      <Edit className="w-3.5 h-3.5" />
                                    </button>

                                    {/* Duplicate Product */}
                                    <button
                                      disabled={duplicatingId === p.id}
                                      onClick={async () => {
                                        setDuplicatingId(p.id);
                                        const res = await duplicateProduct(p.id);
                                        if (res.error) {
                                          showToast(`Duplication failed: ${res.error}`, 'error');
                                        } else {
                                          showToast(`Duplicated "${p.title}" successfully as draft!`, 'success');
                                          refreshCurrentView();
                                        }
                                        setDuplicatingId(null);
                                      }}
                                      className="p-1.5 text-neutral-400 hover:text-blue-400 hover:bg-neutral-800 rounded-lg transition-colors disabled:opacity-40"
                                      title="Duplicate Product"
                                    >
                                      <Copy className="w-3.5 h-3.5" />
                                    </button>

                                    {/* Delete Product */}
                                    <button
                                      onClick={() => setProductToDelete(p)}
                                      className="p-1.5 text-neutral-400 hover:text-red-400 hover:bg-neutral-800 rounded-lg transition-colors"
                                      title="Delete or Archive Product"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Mobile Cards View (Visible on small screens) */}
                  <div className="lg:hidden space-y-3">
                    {filteredList.map((p) => {
                      const numPrice = p.price || 0;
                      const numCost = p.costPrice !== undefined ? p.costPrice : null;
                      const profit = numCost !== null ? numPrice - numCost : null;

                      return (
                        <div
                          key={p.id}
                          className="p-4 bg-neutral-900 border border-neutral-800 rounded-2xl space-y-3 shadow-sm"
                        >
                          <div className="flex items-start gap-3">
                            <div className="w-14 h-14 rounded-xl bg-neutral-950 overflow-hidden shrink-0 border border-neutral-800">
                              {p.images[0] ? (
                                <img
                                  src={p.images[0]}
                                  alt={p.title}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-[10px] text-neutral-600">
                                  No img
                                </div>
                              )}
                            </div>

                            <div className="flex-1 min-w-0">
                              <div className="font-semibold text-white text-sm truncate">{p.title}</div>
                              <div className="text-[11px] text-neutral-400 font-mono mt-0.5">
                                {p.sku || p.slug}
                              </div>
                              <div className="text-[11px] text-neutral-400 mt-1">
                                {p.category} · {p.brand || 'Zenvilo'}
                              </div>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-neutral-800/60 text-xs">
                            <div>
                              <div className="text-[10px] text-neutral-500">Price</div>
                              <div className="font-mono font-bold text-white">{formatPrice(p.price)}</div>
                              {profit !== null && (
                                <div className="text-[10px] text-emerald-400 font-mono">
                                  Margin: +{formatPrice(profit)}
                                </div>
                              )}
                            </div>

                            <div className="text-right">
                              <div className="text-[10px] text-neutral-500">Inventory</div>
                              <div className="font-mono font-semibold text-white">
                                {p.inventory > 0 ? `${p.inventory} in stock` : 'Out of stock'}
                              </div>
                            </div>
                          </div>

                          {/* Quick Toggles & Actions */}
                          <div className="flex items-center justify-between pt-2 border-t border-neutral-800/60">
                            <button
                              onClick={async () => {
                                const nextStatus = !p.isActive;
                                await toggleProductActive(p.id, nextStatus);
                                showToast(
                                  `Product "${p.title}" is now ${nextStatus ? 'Active' : 'Draft'}`,
                                  'info'
                                );
                                refreshCurrentView();
                              }}
                              className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
                                p.isActive && p.status !== 'draft'
                                  ? 'bg-emerald-950/80 border-emerald-700 text-emerald-300'
                                  : 'bg-neutral-800 border-neutral-700 text-neutral-400'
                              }`}
                            >
                              {p.isActive && p.status !== 'draft' ? 'Active' : 'Draft'}
                            </button>

                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => navigate('product', { productSlug: p.slug })}
                                className="p-1.5 text-neutral-400 hover:text-white"
                                title="View on Store"
                              >
                                <Eye className="w-4 h-4" />
                              </button>

                              <button
                                onClick={() => {
                                  setEditingProduct(p);
                                  setIsProductModalOpen(true);
                                }}
                                className="p-1.5 text-neutral-400 hover:text-violet-400"
                                title="Edit"
                              >
                                <Edit className="w-4 h-4" />
                              </button>

                              <button
                                disabled={duplicatingId === p.id}
                                onClick={async () => {
                                  setDuplicatingId(p.id);
                                  const res = await duplicateProduct(p.id);
                                  if (res.error) {
                                    showToast(`Duplication failed: ${res.error}`, 'error');
                                  } else {
                                    showToast(`Duplicated "${p.title}" successfully!`, 'success');
                                    refreshCurrentView();
                                  }
                                  setDuplicatingId(null);
                                }}
                                className="p-1.5 text-neutral-400 hover:text-blue-400"
                                title="Duplicate"
                              >
                                <Copy className="w-4 h-4" />
                              </button>

                              <button
                                onClick={() => setProductToDelete(p)}
                                className="p-1.5 text-neutral-400 hover:text-red-400"
                                title="Delete"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })()}
          </div>
        )}

        {/* ========================================================== */}
        {/* TAB 3: CATEGORIES */}
        {/* ========================================================== */}
        {activeTab === 'categories' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-white tracking-tight">Categories</h2>
                <p className="text-xs text-neutral-400 mt-1">Organize your store catalog into browseable sections.</p>
              </div>

              <Button
                variant="primary"
                onClick={() => {
                  setEditingCategory(null);
                  setIsCategoryModalOpen(true);
                }}
                className="flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                <span>Add Category</span>
              </Button>
            </div>

            {categories.length === 0 ? (
              <EmptyState
                icon={<Layers className="w-8 h-8 text-neutral-500" />}
                title="No categories found"
                description="Add your first category to group your products."
                actionText="Create Category"
                onAction={() => {
                  setEditingCategory(null);
                  setIsCategoryModalOpen(true);
                }}
              />
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {categories.map((c) => (
                  <div
                    key={c.id}
                    className="p-5 bg-neutral-900 border border-neutral-800 rounded-2xl flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <h3 className="text-base font-bold text-white">{c.name}</h3>
                        <span className="px-2 py-0.5 rounded text-[10px] bg-neutral-800 text-neutral-400 font-mono">
                          {c.productCount} products
                        </span>
                      </div>
                      <div className="text-[11px] text-neutral-500 font-mono mt-0.5">/{c.slug}</div>
                      {c.description && (
                        <p className="text-xs text-neutral-400 mt-2 line-clamp-2">{c.description}</p>
                      )}
                    </div>

                    <div className="mt-4 pt-4 border-t border-neutral-800 flex items-center justify-between">
                      <button
                        onClick={() => {
                          setEditingCategory(c);
                          setIsCategoryModalOpen(true);
                        }}
                        className="text-xs text-violet-400 hover:underline"
                      >
                        Edit Details
                      </button>
                      <button
                        onClick={async () => {
                          if (confirm(`Delete category "${c.name}"?`)) {
                            const res = await deleteCategory(c.id);
                            if (res.error) {
                              showToast(res.error, 'error');
                            } else {
                              showToast('Category deleted', 'info');
                              refreshCurrentView();
                            }
                          }
                        }}
                        className="text-xs text-neutral-500 hover:text-red-400"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ========================================================== */}
        {/* TAB 4: ORDERS */}
        {/* ========================================================== */}
        {activeTab === 'orders' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-white tracking-tight">Customer Orders</h2>
                <p className="text-xs text-neutral-400 mt-1">Manage customer fulfillment and payment statuses.</p>
              </div>

              <div className="flex items-center gap-2">
                <select
                  value={selectedOrderStatusFilter}
                  onChange={(e) => setSelectedOrderStatusFilter(e.target.value)}
                  className="px-3 py-1.5 bg-neutral-900 border border-neutral-800 rounded-xl text-xs text-neutral-300 focus:outline-none"
                >
                  <option value="all">All Statuses</option>
                  <option value="pending">Pending</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="processing">Processing</option>
                  <option value="shipped">Shipped</option>
                  <option value="delivered">Delivered</option>
                  <option value="cancelled">Cancelled</option>
                </select>
                <button
                  onClick={refreshCurrentView}
                  className="p-1.5 bg-neutral-900 border border-neutral-800 rounded-lg text-neutral-400 hover:text-white"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
              </div>
            </div>

            {orders.length === 0 ? (
              <EmptyState
                icon={<ShoppingBag className="w-8 h-8 text-neutral-500" />}
                title="No orders found"
                description="Orders placed by customers in the store will populate here in real-time."
              />
            ) : (
              <div className="bg-neutral-900 border border-neutral-800 rounded-2xl overflow-hidden shadow-xl">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-neutral-950/80 border-b border-neutral-800 text-neutral-400 uppercase tracking-wider font-semibold">
                      <tr>
                        <th className="py-3 px-4">Order ID</th>
                        <th className="py-3 px-4">Customer</th>
                        <th className="py-3 px-4">Date</th>
                        <th className="py-3 px-4">Total</th>
                        <th className="py-3 px-4">Fulfillment Status</th>
                        <th className="py-3 px-4">Payment</th>
                        <th className="py-3 px-4 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-800/80 text-neutral-300">
                      {orders
                        .filter((o) => selectedOrderStatusFilter === 'all' || o.status === selectedOrderStatusFilter)
                        .map((o) => (
                          <tr key={o.id} className="hover:bg-neutral-800/40 transition-colors">
                            <td className="py-3 px-4 font-mono font-semibold text-white">
                              {o.orderNumber}
                            </td>
                            <td className="py-3 px-4">
                              <div>{o.customerEmail}</div>
                              {o.shippingAddress?.fullName && (
                                <div className="text-[11px] text-neutral-500">{o.shippingAddress.fullName}</div>
                              )}
                            </td>
                            <td className="py-3 px-4 text-neutral-400">
                              {new Date(o.createdAt).toLocaleDateString()}
                            </td>
                            <td className="py-3 px-4 font-mono font-bold text-white">
                              {formatPrice(o.totalAmount)}
                            </td>
                            <td className="py-3 px-4">
                              <select
                                value={o.status}
                                onChange={async (e) => {
                                  const newSt = e.target.value as any;
                                  await updateOrderStatus(o.id, newSt);
                                  showToast(`Order status updated to ${newSt}`, 'success');
                                  refreshCurrentView();
                                }}
                                className="bg-neutral-950 border border-neutral-800 rounded-lg px-2 py-1 text-[11px] text-white focus:outline-none"
                              >
                                <option value="pending">Pending</option>
                                <option value="confirmed">Confirmed</option>
                                <option value="processing">Processing</option>
                                <option value="shipped">Shipped</option>
                                <option value="delivered">Delivered</option>
                                <option value="cancelled">Cancelled</option>
                              </select>
                            </td>
                            <td className="py-3 px-4">
                              <select
                                value={o.paymentStatus}
                                onChange={async (e) => {
                                  const newPay = e.target.value as any;
                                  await updatePaymentStatus(o.id, newPay);
                                  showToast(`Payment status updated to ${newPay}`, 'success');
                                  refreshCurrentView();
                                }}
                                className="bg-neutral-950 border border-neutral-800 rounded-lg px-2 py-1 text-[11px] text-white focus:outline-none"
                              >
                                <option value="pending">Pending</option>
                                <option value="paid">Paid</option>
                                <option value="failed">Failed</option>
                                <option value="refunded">Refunded</option>
                              </select>
                            </td>
                            <td className="py-3 px-4 text-right">
                              <button
                                onClick={() => setViewingOrder(o)}
                                className="text-violet-400 hover:underline"
                              >
                                View Order
                              </button>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ========================================================== */}
        {/* TAB 5: CUSTOMERS */}
        {/* ========================================================== */}
        {activeTab === 'customers' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div>
              <h2 className="text-xl font-bold text-white tracking-tight">Registered Customers</h2>
              <p className="text-xs text-neutral-400 mt-1">Real account profiles linked to Supabase authentication.</p>
            </div>

            {customers.length === 0 ? (
              <EmptyState
                icon={<Users className="w-8 h-8 text-neutral-500" />}
                title="No customer accounts yet"
                description="Customers who create an account in Zenvilo will be listed here with lifetime spend metrics."
              />
            ) : (
              <div className="bg-neutral-900 border border-neutral-800 rounded-2xl overflow-hidden shadow-xl">
                <table className="w-full text-left text-xs">
                  <thead className="bg-neutral-950/80 border-b border-neutral-800 text-neutral-400 uppercase tracking-wider font-semibold">
                    <tr>
                      <th className="py-3 px-4">Customer Name</th>
                      <th className="py-3 px-4">Contact</th>
                      <th className="py-3 px-4">Registered Date</th>
                      <th className="py-3 px-4">Orders Placed</th>
                      <th className="py-3 px-4 text-right">Lifetime Spend</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-800/80 text-neutral-300">
                    {customers.map((c) => (
                      <tr key={c.id} className="hover:bg-neutral-800/40 transition-colors">
                        <td className="py-3 px-4 font-semibold text-white">
                          <div className="flex items-center gap-2.5">
                            <div className="w-7 h-7 rounded-full bg-violet-950 border border-violet-800 flex items-center justify-center text-[11px] font-bold text-violet-300">
                              {(c.fullName || 'C').charAt(0).toUpperCase()}
                            </div>
                            <span>{c.fullName || 'Zenvilo Customer'}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div>{c.email}</div>
                          {c.phone && <div className="text-[11px] text-neutral-500">{c.phone}</div>}
                        </td>
                        <td className="py-3 px-4 text-neutral-400">
                          {c.createdAt ? new Date(c.createdAt).toLocaleDateString() : '—'}
                        </td>
                        <td className="py-3 px-4 font-mono">{c.orderCount}</td>
                        <td className="py-3 px-4 font-mono font-bold text-white text-right">
                          {formatPrice(c.totalSpent)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ========================================================== */}
        {/* TAB 6: LOGIN ACTIVITY & AUDIT LOGS */}
        {/* ========================================================== */}
        {activeTab === 'logins' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-white tracking-tight">User Login Activity & Audit Logs</h2>
                <p className="text-xs text-neutral-400 mt-1">Real authenticated login sessions recorded securely in Supabase.</p>
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={refreshCurrentView}
                isLoading={loadingData}
                className="flex items-center gap-2 text-xs"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Refresh Logs</span>
              </Button>
            </div>

            {/* Quick explanation & status notice */}
            <div className="p-4 bg-neutral-900 border border-neutral-800 rounded-2xl flex items-start gap-3 text-xs text-neutral-300">
              <Shield className="w-4 h-4 text-violet-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold text-white">Secure Audit Policy: </span>
                <span>Only verified administrators can read from <code className="text-violet-300 font-mono">public.login_activity</code>. No passwords or authentication tokens are ever stored or exposed.</span>
              </div>
            </div>

            {loginActivities.length === 0 ? (
              <EmptyState
                icon={<Activity className="w-8 h-8 text-neutral-500" />}
                title="No login records found yet"
                description="Sign-in sessions will appear here as users log into Zenvilo. Ensure the 'supabase_login_activity.sql' migration is applied to your Supabase project."
              />
            ) : (
              <div className="bg-neutral-900 border border-neutral-800 rounded-2xl overflow-hidden shadow-xl">
                <table className="w-full text-left text-xs">
                  <thead className="bg-neutral-950/80 border-b border-neutral-800 text-neutral-400 uppercase tracking-wider font-semibold">
                    <tr>
                      <th className="py-3 px-4">User Email / ID</th>
                      <th className="py-3 px-4">Login Timestamp</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4">Device / Client Agent</th>
                      <th className="py-3 px-4 text-right">Sign Out Time</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-800/80 text-neutral-300">
                    {loginActivities.map((log) => (
                      <tr key={log.id} className="hover:bg-neutral-800/40 transition-colors">
                        <td className="py-3 px-4 font-semibold text-white">
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full bg-violet-950 border border-violet-800 flex items-center justify-center text-[10px] font-bold text-violet-300">
                              {(log.email || 'U').charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <div>{log.email || 'Unknown User'}</div>
                              <div className="text-[10px] text-neutral-500 font-mono">{log.user_id}</div>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4 font-mono text-neutral-300">
                          {log.login_at ? new Date(log.login_at).toLocaleString() : '—'}
                        </td>
                        <td className="py-3 px-4">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold ${
                            log.login_status === 'success'
                              ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                              : 'bg-red-950 text-red-400 border border-red-800'
                          }`}>
                            {log.login_status || 'success'}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-neutral-400 max-w-xs truncate" title={log.user_agent}>
                          {log.user_agent || 'Browser Client'}
                        </td>
                        <td className="py-3 px-4 text-right text-neutral-400 font-mono">
                          {log.logout_at ? new Date(log.logout_at).toLocaleString() : 'Active Session'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ========================================================== */}
        {/* TAB 7: REVIEWS MODERATION */}
        {/* ========================================================== */}
        {activeTab === 'reviews' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div>
              <h2 className="text-xl font-bold text-white tracking-tight">Review Moderation</h2>
              <p className="text-xs text-neutral-400 mt-1">Approve or reject customer reviews before they display publicly on product pages.</p>
            </div>

            {reviews.length === 0 ? (
              <EmptyState
                icon={<Star className="w-8 h-8 text-neutral-500" />}
                title="No reviews submitted yet"
                description="When customers leave reviews on your products, they will appear here for moderation."
              />
            ) : (
              <div className="space-y-3">
                {reviews.map((r) => (
                  <div
                    key={r.id}
                    className="p-5 bg-neutral-900 border border-neutral-800 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <div className="flex items-center text-amber-400">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`w-3.5 h-3.5 ${i < r.rating ? 'fill-amber-400' : 'text-neutral-700'}`}
                            />
                          ))}
                        </div>
                        <span className="font-semibold text-white text-xs">{r.title || 'Review'}</span>
                        <span className={`px-2 py-0.5 rounded text-[10px] ${
                          r.isApproved
                            ? 'bg-emerald-950 border border-emerald-800 text-emerald-400'
                            : 'bg-amber-950 border border-amber-800 text-amber-400'
                        }`}>
                          {r.isApproved ? 'Approved' : 'Pending Approval'}
                        </span>
                      </div>
                      <p className="text-xs text-neutral-300 mt-2">{r.content}</p>
                      <div className="text-[11px] text-neutral-500 mt-1">
                        By {r.userName} on product: <strong className="text-neutral-400">{r.productTitle}</strong>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <Button
                        size="sm"
                        variant={r.isApproved ? 'outline' : 'primary'}
                        onClick={async () => {
                          await toggleReviewApproval(r.id, !r.isApproved);
                          showToast(`Review ${r.isApproved ? 'unapproved' : 'approved'}`, 'success');
                          refreshCurrentView();
                        }}
                      >
                        {r.isApproved ? 'Unapprove' : 'Approve'}
                      </Button>
                      <button
                        onClick={async () => {
                          if (confirm('Delete this review permanently?')) {
                            await deleteReview(r.id);
                            showToast('Review removed', 'info');
                            refreshCurrentView();
                          }
                        }}
                        className="p-2 text-neutral-400 hover:text-red-400 rounded-lg hover:bg-neutral-800"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ========================================================== */}
        {/* TAB 7: DATABASE & SQL SETUP GUIDE */}
        {/* ========================================================== */}
        {activeTab === 'database' && (
          <div className="space-y-8 animate-in fade-in duration-200">
            <div>
              <h2 className="text-xl font-bold text-white tracking-tight">Supabase Connection & Database Architecture</h2>
              <p className="text-xs text-neutral-400 mt-1">
                Configure your relational database, inspect table health, and copy production SQL migration scripts.
              </p>
            </div>

            {/* Diagnostic Card */}
            <div className="p-6 bg-neutral-900 border border-neutral-800 rounded-2xl space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-3.5 h-3.5 rounded-full ${isSupabaseConfigured ? 'bg-emerald-400 shadow-sm shadow-emerald-400/50' : 'bg-amber-400'}`} />
                  <h3 className="text-sm font-bold text-white">Connection Diagnostic</h3>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={testConnection}
                  isLoading={connStatus.loading}
                  className="flex items-center gap-2 text-xs"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Test Live Query</span>
                </Button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono">
                <div className="p-3 bg-neutral-950 border border-neutral-800 rounded-xl">
                  <span className="text-neutral-500 block mb-1">VITE_SUPABASE_URL</span>
                  <span className="text-neutral-200 truncate block">
                    {import.meta.env.VITE_SUPABASE_URL || 'Not configured'}
                  </span>
                </div>
                <div className="p-3 bg-neutral-950 border border-neutral-800 rounded-xl">
                  <span className="text-neutral-500 block mb-1">VITE_SUPABASE_ANON_KEY</span>
                  <span className="text-neutral-200">
                    {import.meta.env.VITE_SUPABASE_ANON_KEY ? '•••••••••••••••• (Configured)' : 'Not configured'}
                  </span>
                </div>
              </div>

              {connStatus.tested && (
                <div className={`p-4 rounded-xl text-xs flex items-start gap-3 ${
                  connStatus.connected
                    ? 'bg-emerald-950/60 border border-emerald-800/60 text-emerald-300'
                    : 'bg-amber-950/60 border border-amber-800/60 text-amber-300'
                }`}>
                  {connStatus.connected ? <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" /> : <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />}
                  <div>
                    <div className="font-semibold">{connStatus.connected ? 'Connection Healthy' : 'Database Status Notice'}</div>
                    <div className="text-[11px] mt-0.5 text-neutral-300 leading-relaxed">{connStatus.message}</div>
                  </div>
                </div>
              )}
            </div>

            {/* Note about "createe" error & 1-Click Copy */}
            <div className="p-6 bg-gradient-to-r from-violet-950/40 to-neutral-900 border border-violet-800/40 rounded-2xl space-y-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-white">Full SQL Schema & Security Rules</h3>
                    <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-violet-900/60 text-violet-300 border border-violet-700/50">
                      Error-Free Version
                    </span>
                  </div>
                  <p className="text-xs text-neutral-300 mt-1 leading-relaxed">
                    Includes all 12 relational tables: <code className="text-violet-300">profiles</code>, <code className="text-violet-300">user_roles</code>, <code className="text-violet-300">categories</code>, <code className="text-violet-300">products</code>, <code className="text-violet-300">product_images</code>, <code className="text-violet-300">product_variants</code>, <code className="text-violet-300">carts</code>, <code className="text-violet-300">orders</code>, <code className="text-violet-300">order_items</code>, <code className="text-violet-300">addresses</code>, <code className="text-violet-300">reviews</code>, <code className="text-violet-300">wishlist_items</code>, plus RLS security policies.
                  </p>
                </div>

                <Button
                  variant="primary"
                  size="sm"
                  onClick={handleCopySqlScript}
                  className="shrink-0 flex items-center gap-2"
                >
                  {copiedSql ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  <span>{copiedSql ? 'Copied SQL!' : 'Copy SQL Script'}</span>
                </Button>
              </div>

              {/* Clarification on "createe" error */}
              <div className="p-3 bg-neutral-950/70 border border-neutral-800 rounded-xl text-xs text-neutral-400">
                <strong className="text-neutral-200">Note regarding the "createe" error:</strong> If you previously encountered a SQL error containing <code className="text-red-400">createe</code>, it occurred because of an accidental double 'e' typo in a previous SQL query (e.g. <code className="text-red-400">createe table</code> instead of <code className="text-emerald-400">CREATE TABLE</code>). The schema above and in <code className="text-violet-300">supabase_zenvilo_schema.sql</code> is clean, verified, and runs without syntax errors.
              </div>
            </div>
          </div>
        )}
      </main>

      {/* ========================================================== */}
      {/* PRODUCT CREATE & EDIT MODAL */}
      {/* ========================================================== */}
      {isProductModalOpen && (
        <ProductFormModal
          product={editingProduct}
          categories={categories}
          onClose={() => setIsProductModalOpen(false)}
          onSaved={() => {
            setIsProductModalOpen(false);
            refreshCurrentView();
          }}
        />
      )}

      {/* ========================================================== */}
      {/* CATEGORY CREATE & EDIT MODAL */}
      {/* ========================================================== */}
      {isCategoryModalOpen && (
        <CategoryFormModal
          category={editingCategory}
          onClose={() => setIsCategoryModalOpen(false)}
          onSaved={() => {
            setIsCategoryModalOpen(false);
            refreshCurrentView();
          }}
        />
      )}

      {/* ========================================================== */}
      {/* ORDER DETAILS MODAL */}
      {/* ========================================================== */}
      {viewingOrder && (
        <OrderDetailsModal
          order={viewingOrder}
          onClose={() => setViewingOrder(null)}
          onStatusUpdated={() => {
            refreshCurrentView();
          }}
        />
      )}
      {/* ========================================================== */}
      {/* DELETE PRODUCT CONFIRMATION MODAL */}
      {/* ========================================================== */}
      {productToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md bg-neutral-900 border border-neutral-800 rounded-3xl p-6 space-y-5 shadow-2xl">
            <div className="flex items-center gap-3 text-red-400">
              <div className="p-3 bg-red-950/60 border border-red-800/60 rounded-2xl">
                <Trash2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Delete Product</h3>
                <p className="text-xs text-neutral-400">Confirm catalog item removal</p>
              </div>
            </div>

            <div className="p-3.5 bg-neutral-950 border border-neutral-800 rounded-2xl flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-neutral-900 overflow-hidden shrink-0 border border-neutral-800">
                {productToDelete.images[0] ? (
                  <img
                    src={productToDelete.images[0]}
                    alt={productToDelete.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-[10px] text-neutral-600">
                    No img
                  </div>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <div className="font-semibold text-white text-sm truncate">
                  {productToDelete.title}
                </div>
                <div className="text-xs text-neutral-400 font-mono mt-0.5">
                  SKU: {productToDelete.sku || 'N/A'} · Price: {formatPrice(productToDelete.price)}
                </div>
              </div>
            </div>

            <p className="text-xs text-neutral-400 leading-relaxed">
              Are you sure you want to delete this product? If customers have previously ordered this item, it will be automatically archived and hidden from the storefront to preserve historical order records.
            </p>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-neutral-800">
              <button
                type="button"
                disabled={isDeletingProduct}
                onClick={() => setProductToDelete(null)}
                className="px-4 py-2 text-xs text-neutral-400 hover:text-white transition-colors"
              >
                Cancel
              </button>
              <Button
                variant="primary"
                isLoading={isDeletingProduct}
                onClick={async () => {
                  setIsDeletingProduct(true);
                  try {
                    const res = await deleteProduct(productToDelete.id);
                    if (res.error) {
                      showToast(`Failed to delete: ${res.error}`, 'error');
                    } else if (res.deactivatedOnly) {
                      showToast(
                        `Product has historical order records. Safely deactivated and hidden from storefront.`,
                        'info'
                      );
                      setProductToDelete(null);
                      refreshCurrentView();
                    } else {
                      showToast(`Product "${productToDelete.title}" deleted permanently.`, 'success');
                      setProductToDelete(null);
                      refreshCurrentView();
                    }
                  } catch (err: any) {
                    showToast(err?.message || 'Error deleting product', 'error');
                  } finally {
                    setIsDeletingProduct(false);
                  }
                }}
                className="bg-red-600 hover:bg-red-700 text-white border-red-500"
              >
                Delete Product
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ----------------------------------------------------------------------
// SUB-MODAL 2: CATEGORY CREATE / EDIT FORM
// ----------------------------------------------------------------------
interface CategoryFormModalProps {
  category: Category | null;
  onClose: () => void;
  onSaved: () => void;
}

const CategoryFormModal: React.FC<CategoryFormModalProps> = ({
  category,
  onClose,
  onSaved,
}) => {
  const { showToast } = useToast();
  const [name, setName] = useState(category?.name || '');
  const [slug, setSlug] = useState(category?.slug || '');
  const [description, setDescription] = useState(category?.description || '');
  const [imageUrl, setImageUrl] = useState(category?.image || '');
  const [isActive, setIsActive] = useState(category?.isActive ?? true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setName(val);
    if (!category) {
      setSlug(
        val
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/(^-|-$)+/g, '')
      );
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !slug.trim()) {
      showToast('Name and slug are required', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      if (category) {
        const res = await updateCategory(category.id, {
          name,
          slug,
          description,
          imageUrl,
          isActive,
        });
        if (res.error) showToast(res.error, 'error');
        else {
          showToast('Category updated', 'success');
          onSaved();
        }
      } else {
        const res = await createCategory({
          name,
          slug,
          description,
          imageUrl,
          isActive,
        });
        if (res.error) showToast(res.error, 'error');
        else {
          showToast('Category created', 'success');
          onSaved();
        }
      }
    } catch (err: any) {
      showToast(err?.message || 'Error saving category', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="w-full max-w-lg bg-neutral-900 border border-neutral-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl">
        <div className="flex items-center justify-between pb-4 border-b border-neutral-800">
          <h2 className="text-lg font-bold text-white">
            {category ? 'Edit Category' : 'Create Category'}
          </h2>
          <button onClick={onClose} className="p-2 text-neutral-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs text-neutral-400 mb-1">Category Name *</label>
            <input
              type="text"
              required
              value={name}
              onChange={handleNameChange}
              placeholder="e.g. Workspace Essentials"
              className="w-full px-3.5 py-2.5 bg-neutral-950 border border-neutral-800 rounded-xl text-sm text-white focus:outline-none focus:border-violet-500"
            />
          </div>

          <div>
            <label className="block text-xs text-neutral-400 mb-1">URL Slug *</label>
            <input
              type="text"
              required
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              placeholder="workspace-essentials"
              className="w-full px-3.5 py-2.5 bg-neutral-950 border border-neutral-800 rounded-xl text-sm text-white font-mono text-xs focus:outline-none focus:border-violet-500"
            />
          </div>

          <div>
            <label className="block text-xs text-neutral-400 mb-1">Description</label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief description of category collection..."
              className="w-full px-3.5 py-2.5 bg-neutral-950 border border-neutral-800 rounded-xl text-sm text-white focus:outline-none focus:border-violet-500"
            />
          </div>

          <div>
            <label className="block text-xs text-neutral-400 mb-1">Cover Image URL (Optional)</label>
            <input
              type="url"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="https://..."
              className="w-full px-3.5 py-2.5 bg-neutral-950 border border-neutral-800 rounded-xl text-sm text-white focus:outline-none focus:border-violet-500"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-neutral-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs text-neutral-400 hover:text-white"
            >
              Cancel
            </button>
            <Button type="submit" variant="primary" isLoading={isSubmitting}>
              {category ? 'Save Changes' : 'Create Category'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ----------------------------------------------------------------------
// SUB-MODAL 3: ORDER DETAILS DRAWER
// ----------------------------------------------------------------------
interface OrderDetailsModalProps {
  order: Order;
  onClose: () => void;
  onStatusUpdated: () => void;
}

const OrderDetailsModal: React.FC<OrderDetailsModalProps> = ({
  order,
  onClose,
  onStatusUpdated,
}) => {
  const { formatPrice } = useCurrency();
  const { showToast } = useToast();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="w-full max-w-xl bg-neutral-900 border border-neutral-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl">
        <div className="flex items-center justify-between pb-4 border-b border-neutral-800">
          <div>
            <h2 className="text-lg font-bold text-white font-mono">{order.orderNumber}</h2>
            <p className="text-xs text-neutral-400">
              Placed on {new Date(order.createdAt).toLocaleString()}
            </p>
          </div>
          <button onClick={onClose} className="p-2 text-neutral-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Customer & Shipping info */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="p-4 bg-neutral-950 border border-neutral-800 rounded-xl">
            <span className="text-neutral-500 block mb-1 font-semibold uppercase tracking-wider text-[10px]">Customer</span>
            <div className="text-white font-medium">{order.customerEmail}</div>
            {order.customerPhone && <div className="text-neutral-400 mt-1">{order.customerPhone}</div>}
          </div>

          <div className="p-4 bg-neutral-950 border border-neutral-800 rounded-xl">
            <span className="text-neutral-500 block mb-1 font-semibold uppercase tracking-wider text-[10px]">Shipping Address</span>
            <div className="text-white">
              {order.shippingAddress?.fullName}
              <br />
              {order.shippingAddress?.address || order.shippingAddress?.addressLine1}
              <br />
              {order.shippingAddress?.city}, {order.shippingAddress?.state} {order.shippingAddress?.postalCode}
            </div>
          </div>
        </div>

        {/* Status updates */}
        <div className="grid grid-cols-2 gap-4 text-xs">
          <div>
            <label className="block text-neutral-400 mb-1">Fulfillment Status</label>
            <select
              value={order.status}
              onChange={async (e) => {
                const s = e.target.value as any;
                await updateOrderStatus(order.id, s);
                showToast(`Status changed to ${s}`, 'success');
                onStatusUpdated();
              }}
              className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-xl text-white focus:outline-none"
            >
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="processing">Processing</option>
              <option value="shipped">Shipped</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

          <div>
            <label className="block text-neutral-400 mb-1">Payment Status</label>
            <select
              value={order.paymentStatus}
              onChange={async (e) => {
                const p = e.target.value as any;
                await updatePaymentStatus(order.id, p);
                showToast(`Payment changed to ${p}`, 'success');
                onStatusUpdated();
              }}
              className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-xl text-white focus:outline-none"
            >
              <option value="pending">Pending</option>
              <option value="paid">Paid</option>
              <option value="failed">Failed</option>
              <option value="refunded">Refunded</option>
            </select>
          </div>
        </div>

        {/* Items table */}
        <div>
          <span className="text-xs font-semibold text-neutral-300 block mb-2">Order Line Items</span>
          <div className="p-3 bg-neutral-950 border border-neutral-800 rounded-xl space-y-2 text-xs">
            {(order.items || []).map((it) => (
              <div key={it.id} className="flex items-center justify-between text-neutral-300">
                <div>
                  <span className="font-medium text-white">{it.productName}</span>
                  {it.variantName && <span className="text-neutral-500 ml-1">({it.variantName})</span>}
                  <span className="text-neutral-500 ml-2">× {it.quantity}</span>
                </div>
                <span className="font-mono">{formatPrice(it.totalPrice)}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Totals */}
        <div className="pt-2 border-t border-neutral-800 flex justify-between items-center text-sm font-bold text-white">
          <span>Total Charged:</span>
          <span className="text-violet-400 font-mono text-base">{formatPrice(order.totalAmount)}</span>
        </div>
      </div>
    </div>
  );
};
