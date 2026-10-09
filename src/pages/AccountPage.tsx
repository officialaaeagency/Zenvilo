import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigation } from '../context/NavigationContext';
import { useToast } from '../context/ToastContext';
import { useCurrency } from '../context/CurrencyContext';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { Order, Address, Product } from '../types/store';
import { Button } from '../components/common/Button';
import { EmptyState } from '../components/common/EmptyState';
import {
  User,
  Package,
  MapPin,
  Heart,
  Lock,
  LogOut,
  ShieldCheck,
  ExternalLink,
  Plus,
  Trash2,
  CheckCircle2,
  Clock,
  Truck,
  AlertCircle,
  ChevronRight,
  Eye,
} from 'lucide-react';

export const AccountPage: React.FC = () => {
  const { user, profile, isAdmin, signOut, updateProfile, updatePassword, loading: authLoading } = useAuth();
  const { navigate } = useNavigation();
  const { showToast } = useToast();
  const { formatPrice } = useCurrency();

  const [activeTab, setActiveTab] = useState<'orders' | 'addresses' | 'wishlist' | 'profile' | 'security'>('orders');

  // Customer data states
  const [orders, setOrders] = useState<Order[]>([]);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [wishlistProducts, setWishlistProducts] = useState<Product[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(false);

  // Profile edit form
  const [fullName, setFullName] = useState(profile?.fullName || '');
  const [phone, setPhone] = useState(profile?.phone || '');
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);

  // Password update form
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

  // New address form
  const [isAddingAddress, setIsAddingAddress] = useState(false);
  const [addrForm, setAddrForm] = useState({
    fullName: '',
    phone: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'United States',
    isDefault: false,
  });

  // Sync profile form when profile loads
  useEffect(() => {
    if (profile) {
      setFullName(profile.fullName || '');
      setPhone(profile.phone || '');
    }
  }, [profile]);

  // If not logged in and done loading, redirect to auth
  useEffect(() => {
    if (!authLoading && !user) {
      navigate('auth', { authTab: 'login' });
    }
  }, [authLoading, user, navigate]);

  // Load real customer orders, addresses, and wishlist
  const loadCustomerData = async () => {
    if (!user || !isSupabaseConfigured) return;
    setIsLoadingData(true);

    try {
      // 1. Fetch real orders
      const { data: ordersData, error: ordersErr } = await supabase
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
          customer_email,
          created_at,
          updated_at,
          order_items (
            id,
            order_id,
            product_name,
            variant_name,
            quantity,
            unit_price,
            total_price
          )
        `)
        .or(`user_id.eq.${user.id},customer_email.eq.${user.email}`)
        .order('created_at', { ascending: false });

      if (!ordersErr && ordersData) {
        const mappedOrders: Order[] = ordersData.map((o: any) => ({
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
          customerEmail: o.customer_email,
          createdAt: o.created_at,
          updatedAt: o.updated_at,
          items: (o.order_items || []).map((it: any) => ({
            id: it.id,
            orderId: it.order_id,
            productName: it.product_name,
            variantName: it.variant_name,
            quantity: it.quantity,
            unitPrice: Number(it.unit_price),
            totalPrice: Number(it.total_price),
          })),
        }));
        setOrders(mappedOrders);
      }

      // 2. Fetch addresses
      const { data: addrData } = await supabase
        .from('addresses')
        .select('*')
        .eq('user_id', user.id)
        .order('is_default', { ascending: false });

      if (addrData) {
        setAddresses(
          addrData.map((a: any) => ({
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
          }))
        );
      }

      // 3. Fetch wishlist items
      const { data: wishData } = await supabase
        .from('wishlist_items')
        .select(`
          product_id,
          products (
            id,
            name,
            slug,
            price,
            compare_at_price,
            product_images (image_url, is_primary)
          )
        `)
        .eq('user_id', user.id);

      if (wishData) {
        const mappedWish: Product[] = wishData
          .filter((w: any) => w.products)
          .map((w: any) => {
            const p = w.products;
            const primaryImg = p.product_images?.find((img: any) => img.is_primary)?.image_url || p.product_images?.[0]?.image_url || '';
            return {
              id: p.id,
              slug: p.slug,
              title: p.name,
              description: '',
              shortDescription: '',
              price: Number(p.price) || 0,
              compareAtPrice: p.compare_at_price ? Number(p.compare_at_price) : undefined,
              currency: 'USD',
              images: primaryImg ? [primaryImg] : [],
              category: '',
              variants: [],
              inventory: 1,
              features: [],
              specifications: [],
              createdAt: '',
            };
          });
        setWishlistProducts(mappedWish);
      }
    } catch (err) {
      console.warn('[Zenvilo Account] Failed to load data:', err);
    } finally {
      setIsLoadingData(false);
    }
  };

  useEffect(() => {
    if (user) {
      loadCustomerData();
    }
  }, [user]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdatingProfile(true);
    const res = await updateProfile({ fullName, phone });
    setIsUpdatingProfile(false);
    if (res.error) {
      showToast(res.error, 'error');
    } else {
      showToast('Profile updated successfully', 'success');
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 6) {
      showToast('Password must be at least 6 characters', 'error');
      return;
    }
    if (newPassword !== confirmPassword) {
      showToast('Passwords do not match', 'error');
      return;
    }
    setIsUpdatingPassword(true);
    const res = await updatePassword(newPassword);
    setIsUpdatingPassword(false);
    if (res.error) {
      showToast(res.error, 'error');
    } else {
      showToast('Password updated successfully', 'success');
      setNewPassword('');
      setConfirmPassword('');
    }
  };

  const handleSaveAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!addrForm.fullName || !addrForm.addressLine1 || !addrForm.city || !addrForm.postalCode) {
      showToast('Please fill in required address fields', 'error');
      return;
    }
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('addresses')
        .insert({
          user_id: user.id,
          full_name: addrForm.fullName,
          phone: addrForm.phone || null,
          address_line_1: addrForm.addressLine1,
          address_line_2: addrForm.addressLine2 || null,
          city: addrForm.city,
          state: addrForm.state,
          postal_code: addrForm.postalCode,
          country: addrForm.country,
          is_default: addrForm.isDefault,
        } as any)
        .select()
        .single();

      if (error) {
        showToast(error.message, 'error');
      } else {
        showToast('Address saved', 'success');
        setIsAddingAddress(false);
        setAddrForm({
          fullName: '',
          phone: '',
          addressLine1: '',
          addressLine2: '',
          city: '',
          state: '',
          postalCode: '',
          country: 'United States',
          isDefault: false,
        });
        loadCustomerData();
      }
    } catch (err: any) {
      showToast(err?.message || 'Error saving address', 'error');
    }
  };

  const handleDeleteAddress = async (id: string) => {
    try {
      const { error } = await supabase.from('addresses').delete().eq('id', id);
      if (error) {
        showToast(error.message, 'error');
      } else {
        showToast('Address removed', 'success');
        setAddresses((prev) => prev.filter((a) => a.id !== id));
      }
    } catch (err: any) {
      showToast(err?.message || 'Error deleting address', 'error');
    }
  };

  const handleRemoveWishlist = async (productId: string) => {
    if (!user) return;
    try {
      await supabase
        .from('wishlist_items')
        .delete()
        .eq('user_id', user.id)
        .eq('product_id', productId);
      showToast('Removed from wishlist', 'info');
      setWishlistProducts((prev) => prev.filter((p) => p.id !== productId));
    } catch (err: any) {
      showToast('Error removing item', 'error');
    }
  };

  const handleLogout = async () => {
    await signOut();
    showToast('Signed out of Zenvilo', 'info');
    navigate('home');
  };

  if (authLoading || !user) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const getStatusBadge = (status: Order['status']) => {
    switch (status) {
      case 'delivered':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-950/70 border border-emerald-800/60 text-emerald-300">Delivered</span>;
      case 'shipped':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-cyan-950/70 border border-cyan-800/60 text-cyan-300">Shipped</span>;
      case 'processing':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-violet-950/70 border border-violet-800/60 text-violet-300">Processing</span>;
      case 'confirmed':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-950/70 border border-blue-800/60 text-blue-300">Confirmed</span>;
      case 'cancelled':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-950/70 border border-red-800/60 text-red-300">Cancelled</span>;
      default:
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-neutral-900 border border-neutral-700 text-neutral-300">Pending</span>;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
      {/* Admin Quick Jump Banner */}
      {isAdmin && (
        <div className="mb-8 p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-violet-950/80 via-neutral-900 to-neutral-950 border border-violet-600/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-violet-600/30 border border-violet-500/50 flex items-center justify-center text-violet-300 shrink-0">
              <ShieldCheck className="w-5 h-5 text-violet-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-semibold text-white">Administrator Access Active</h3>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-violet-500 text-white uppercase tracking-wider">Store Admin</span>
              </div>
              <p className="text-xs text-neutral-400 mt-0.5">
                You have administrative privileges to manage products, categories, orders, customers, and view real-time analytics.
              </p>
            </div>
          </div>
          <Button
            variant="primary"
            size="sm"
            onClick={() => navigate('admin')}
            className="shrink-0 flex items-center gap-2"
          >
            <span>Open Admin Dashboard</span>
            <ExternalLink className="w-4 h-4" />
          </Button>
        </div>
      )}

      {/* Account Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-8 border-b border-neutral-800 gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-violet-950/80 border border-violet-800/60 flex items-center justify-center text-violet-300 text-xl font-bold shadow-inner">
            {(profile?.fullName || user.email || 'Z').charAt(0).toUpperCase()}
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">
              {profile?.fullName || 'My Account'}
            </h1>
            <p className="text-sm text-neutral-400">{user.email}</p>
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="flex items-center gap-2 px-4 py-2 text-xs font-medium text-neutral-400 hover:text-red-400 bg-neutral-900 hover:bg-neutral-800/80 border border-neutral-800 rounded-xl transition-colors"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign Out</span>
        </button>
      </div>

      {/* Main Tabs Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 pt-8">
        {/* Navigation Sidebar */}
        <div className="lg:col-span-1 space-y-1">
          <button
            onClick={() => setActiveTab('orders')}
            className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-medium transition-colors text-left ${
              activeTab === 'orders'
                ? 'bg-neutral-900 text-violet-400 border border-neutral-800 font-semibold'
                : 'text-neutral-400 hover:bg-neutral-900/60 hover:text-white'
            }`}
          >
            <div className="flex items-center gap-3">
              <Package className="w-4 h-4" />
              <span>Order History</span>
            </div>
            <span className="text-xs px-2 py-0.5 rounded-full bg-neutral-800 text-neutral-400">
              {orders.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('addresses')}
            className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-medium transition-colors text-left ${
              activeTab === 'addresses'
                ? 'bg-neutral-900 text-violet-400 border border-neutral-800 font-semibold'
                : 'text-neutral-400 hover:bg-neutral-900/60 hover:text-white'
            }`}
          >
            <div className="flex items-center gap-3">
              <MapPin className="w-4 h-4" />
              <span>Saved Addresses</span>
            </div>
            <span className="text-xs px-2 py-0.5 rounded-full bg-neutral-800 text-neutral-400">
              {addresses.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('wishlist')}
            className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-medium transition-colors text-left ${
              activeTab === 'wishlist'
                ? 'bg-neutral-900 text-violet-400 border border-neutral-800 font-semibold'
                : 'text-neutral-400 hover:bg-neutral-900/60 hover:text-white'
            }`}
          >
            <div className="flex items-center gap-3">
              <Heart className="w-4 h-4" />
              <span>Wishlist</span>
            </div>
            <span className="text-xs px-2 py-0.5 rounded-full bg-neutral-800 text-neutral-400">
              {wishlistProducts.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('profile')}
            className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-medium transition-colors text-left ${
              activeTab === 'profile'
                ? 'bg-neutral-900 text-violet-400 border border-neutral-800 font-semibold'
                : 'text-neutral-400 hover:bg-neutral-900/60 hover:text-white'
            }`}
          >
            <div className="flex items-center gap-3">
              <User className="w-4 h-4" />
              <span>Profile Details</span>
            </div>
            <ChevronRight className="w-4 h-4 text-neutral-600" />
          </button>

          <button
            onClick={() => setActiveTab('security')}
            className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-medium transition-colors text-left ${
              activeTab === 'security'
                ? 'bg-neutral-900 text-violet-400 border border-neutral-800 font-semibold'
                : 'text-neutral-400 hover:bg-neutral-900/60 hover:text-white'
            }`}
          >
            <div className="flex items-center gap-3">
              <Lock className="w-4 h-4" />
              <span>Password & Security</span>
            </div>
            <ChevronRight className="w-4 h-4 text-neutral-600" />
          </button>
        </div>

        {/* Content Pane */}
        <div className="lg:col-span-3">
          {/* TAB 1: ORDERS */}
          {activeTab === 'orders' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-white">Your Orders</h2>
                  <p className="text-xs text-neutral-400">Track shipments and order receipts from your verified account.</p>
                </div>
                {isLoadingData && (
                  <span className="text-xs text-neutral-500 animate-pulse">Syncing orders...</span>
                )}
              </div>

              {orders.length === 0 ? (
                <EmptyState
                  icon={<Package className="w-8 h-8 text-neutral-500" />}
                  title="No orders placed yet"
                  description="When you purchase items from Zenvilo, your order numbers, tracking information, and receipts will appear here."
                  actionText="Explore Shop"
                  onAction={() => navigate('shop')}
                />
              ) : (
                <div className="space-y-4">
                  {orders.map((ord) => (
                    <div
                      key={ord.id}
                      className="p-5 bg-neutral-900 border border-neutral-800 rounded-2xl hover:border-neutral-700 transition-colors"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-neutral-800/80">
                        <div>
                          <div className="flex items-center gap-3">
                            <span className="font-mono text-sm font-semibold text-white">
                              {ord.orderNumber}
                            </span>
                            {getStatusBadge(ord.status)}
                            <span className="text-[11px] px-2 py-0.5 rounded bg-neutral-800 text-neutral-400 capitalize">
                              Payment: {ord.paymentStatus}
                            </span>
                          </div>
                          <p className="text-xs text-neutral-400 mt-1">
                            Placed on {new Date(ord.createdAt).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                            })}
                          </p>
                        </div>
                        <div className="text-left sm:text-right">
                          <span className="text-sm font-bold text-violet-300">
                            {formatPrice(ord.totalAmount)}
                          </span>
                          <span className="block text-[11px] text-neutral-500">
                            {(ord.items || []).length} item{(ord.items || []).length === 1 ? '' : 's'}
                          </span>
                        </div>
                      </div>

                      {/* Items list */}
                      <div className="pt-4 space-y-2">
                        {(ord.items || []).map((it) => (
                          <div key={it.id} className="flex items-center justify-between text-xs text-neutral-300">
                            <div>
                              <span className="font-medium text-white">{it.productName}</span>
                              {it.variantName && (
                                <span className="text-neutral-500 ml-2">({it.variantName})</span>
                              )}
                              <span className="text-neutral-500 ml-2">× {it.quantity}</span>
                            </div>
                            <span className="text-neutral-400 font-mono">
                              {formatPrice(it.totalPrice)}
                            </span>
                          </div>
                        ))}
                      </div>

                      {ord.shippingAddress && (
                        <div className="mt-4 pt-3 border-t border-neutral-800/60 text-[11px] text-neutral-400 flex items-center gap-1.5">
                          <Truck className="w-3.5 h-3.5 text-neutral-500 shrink-0" />
                          <span>
                            Ship to: {ord.shippingAddress.address || ord.shippingAddress.addressLine1},{' '}
                            {ord.shippingAddress.city}, {ord.shippingAddress.postalCode}
                          </span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: ADDRESSES */}
          {activeTab === 'addresses' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-white">Saved Shipping Addresses</h2>
                  <p className="text-xs text-neutral-400">Save your shipping destination for 1-click checkout.</p>
                </div>
                {!isAddingAddress && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsAddingAddress(true)}
                    className="flex items-center gap-1.5"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add Address</span>
                  </Button>
                )}
              </div>

              {isAddingAddress && (
                <form
                  onSubmit={handleSaveAddress}
                  className="p-6 bg-neutral-900 border border-neutral-800 rounded-2xl space-y-4 animate-in fade-in duration-200"
                >
                  <h3 className="text-sm font-semibold text-white">Add New Address</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs text-neutral-400 mb-1">Full Recipient Name *</label>
                      <input
                        type="text"
                        required
                        value={addrForm.fullName}
                        onChange={(e) => setAddrForm({ ...addrForm, fullName: e.target.value })}
                        className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-xl text-sm text-white focus:outline-none focus:border-violet-500"
                        placeholder="e.g. Jane Doe"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-neutral-400 mb-1">Phone Number</label>
                      <input
                        type="tel"
                        value={addrForm.phone}
                        onChange={(e) => setAddrForm({ ...addrForm, phone: e.target.value })}
                        className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-xl text-sm text-white focus:outline-none focus:border-violet-500"
                        placeholder="+1 (555) 000-0000"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-xs text-neutral-400 mb-1">Street Address *</label>
                      <input
                        type="text"
                        required
                        value={addrForm.addressLine1}
                        onChange={(e) => setAddrForm({ ...addrForm, addressLine1: e.target.value })}
                        className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-xl text-sm text-white focus:outline-none focus:border-violet-500"
                        placeholder="123 Market Street"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-xs text-neutral-400 mb-1">Apt, Suite, Building (Optional)</label>
                      <input
                        type="text"
                        value={addrForm.addressLine2}
                        onChange={(e) => setAddrForm({ ...addrForm, addressLine2: e.target.value })}
                        className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-xl text-sm text-white focus:outline-none focus:border-violet-500"
                        placeholder="Suite 400"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-neutral-400 mb-1">City *</label>
                      <input
                        type="text"
                        required
                        value={addrForm.city}
                        onChange={(e) => setAddrForm({ ...addrForm, city: e.target.value })}
                        className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-xl text-sm text-white focus:outline-none focus:border-violet-500"
                        placeholder="San Francisco"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-neutral-400 mb-1">State / Province</label>
                      <input
                        type="text"
                        value={addrForm.state}
                        onChange={(e) => setAddrForm({ ...addrForm, state: e.target.value })}
                        className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-xl text-sm text-white focus:outline-none focus:border-violet-500"
                        placeholder="California"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-neutral-400 mb-1">Postal Code *</label>
                      <input
                        type="text"
                        required
                        value={addrForm.postalCode}
                        onChange={(e) => setAddrForm({ ...addrForm, postalCode: e.target.value })}
                        className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-xl text-sm text-white focus:outline-none focus:border-violet-500"
                        placeholder="94105"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-neutral-400 mb-1">Country</label>
                      <input
                        type="text"
                        value={addrForm.country}
                        onChange={(e) => setAddrForm({ ...addrForm, country: e.target.value })}
                        className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-xl text-sm text-white focus:outline-none focus:border-violet-500"
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-2">
                    <input
                      type="checkbox"
                      id="isDefault"
                      checked={addrForm.isDefault}
                      onChange={(e) => setAddrForm({ ...addrForm, isDefault: e.target.checked })}
                      className="rounded border-neutral-800 text-violet-600 focus:ring-violet-500"
                    />
                    <label htmlFor="isDefault" className="text-xs text-neutral-300">
                      Set as default shipping address
                    </label>
                  </div>

                  <div className="flex items-center justify-end gap-3 pt-3 border-t border-neutral-800">
                    <button
                      type="button"
                      onClick={() => setIsAddingAddress(false)}
                      className="px-4 py-2 text-xs text-neutral-400 hover:text-white"
                    >
                      Cancel
                    </button>
                    <Button type="submit" variant="primary" size="sm">
                      Save Address
                    </Button>
                  </div>
                </form>
              )}

              {addresses.length === 0 && !isAddingAddress ? (
                <EmptyState
                  icon={<MapPin className="w-8 h-8 text-neutral-500" />}
                  title="No saved addresses"
                  description="Add your shipping address to expedite future orders."
                  actionText="Add Address"
                  onAction={() => setIsAddingAddress(true)}
                />
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {addresses.map((addr) => (
                    <div
                      key={addr.id}
                      className="p-5 bg-neutral-900 border border-neutral-800 rounded-2xl relative group"
                    >
                      {addr.isDefault && (
                        <span className="inline-block px-2 py-0.5 rounded text-[10px] font-semibold bg-violet-950 border border-violet-800 text-violet-400 mb-2">
                          Default Shipping
                        </span>
                      )}
                      <h4 className="text-sm font-semibold text-white">{addr.fullName}</h4>
                      <p className="text-xs text-neutral-400 mt-1 leading-relaxed">
                        {addr.addressLine1}
                        {addr.addressLine2 && `, ${addr.addressLine2}`}
                        <br />
                        {addr.city}, {addr.state} {addr.postalCode}
                        <br />
                        {addr.country}
                      </p>
                      {addr.phone && (
                        <p className="text-xs text-neutral-500 mt-2 font-mono">{addr.phone}</p>
                      )}

                      <div className="mt-4 pt-3 border-t border-neutral-800 flex justify-end">
                        <button
                          type="button"
                          onClick={() => handleDeleteAddress(addr.id)}
                          className="text-xs text-neutral-500 hover:text-red-400 flex items-center gap-1 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Delete</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: WISHLIST */}
          {activeTab === 'wishlist' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-bold text-white">Your Saved Wishlist</h2>
                <p className="text-xs text-neutral-400">Products you've saved for future consideration.</p>
              </div>

              {wishlistProducts.length === 0 ? (
                <EmptyState
                  icon={<Heart className="w-8 h-8 text-neutral-500" />}
                  title="Your wishlist is empty"
                  description="Explore problem-solving essentials and tap the heart icon to bookmark favorites."
                  actionText="Explore Shop"
                  onAction={() => navigate('shop')}
                />
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {wishlistProducts.map((p) => (
                    <div
                      key={p.id}
                      className="p-4 bg-neutral-900 border border-neutral-800 rounded-2xl flex flex-col justify-between"
                    >
                      <div className="aspect-square rounded-xl bg-neutral-950 overflow-hidden mb-3 relative">
                        {p.images[0] ? (
                          <img
                            src={p.images[0]}
                            alt={p.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-neutral-700">
                            No image
                          </div>
                        )}
                      </div>
                      <div>
                        <h4 className="text-sm font-semibold text-white line-clamp-1">{p.title}</h4>
                        <p className="text-xs font-bold text-violet-400 mt-1">{formatPrice(p.price)}</p>
                      </div>
                      <div className="mt-4 pt-3 border-t border-neutral-800 flex items-center justify-between gap-2">
                        <button
                          onClick={() => handleRemoveWishlist(p.id)}
                          className="text-xs text-neutral-500 hover:text-red-400"
                        >
                          Remove
                        </button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => navigate('product', { productSlug: p.slug })}
                          className="text-xs"
                        >
                          View Product
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 4: PROFILE */}
          {activeTab === 'profile' && (
            <div className="max-w-xl space-y-6">
              <div>
                <h2 className="text-lg font-bold text-white">Profile Details</h2>
                <p className="text-xs text-neutral-400">Update your personal account credentials and contact information.</p>
              </div>

              <form onSubmit={handleSaveProfile} className="space-y-4">
                <div>
                  <label className="block text-xs text-neutral-400 mb-1">Email Address</label>
                  <input
                    type="email"
                    disabled
                    value={user.email || ''}
                    className="w-full px-4 py-2.5 bg-neutral-900/50 border border-neutral-800 rounded-xl text-sm text-neutral-400 cursor-not-allowed"
                  />
                  <span className="text-[11px] text-neutral-500 mt-1 block">
                    Email is managed securely by Supabase Authentication.
                  </span>
                </div>

                <div>
                  <label className="block text-xs text-neutral-400 mb-1">Full Name</label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. John Doe"
                    className="w-full px-4 py-2.5 bg-neutral-900 border border-neutral-800 rounded-xl text-sm text-white focus:outline-none focus:border-violet-500"
                  />
                </div>

                <div>
                  <label className="block text-xs text-neutral-400 mb-1">Phone Number</label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+1 (555) 000-0000"
                    className="w-full px-4 py-2.5 bg-neutral-900 border border-neutral-800 rounded-xl text-sm text-white focus:outline-none focus:border-violet-500"
                  />
                </div>

                <div className="pt-2">
                  <Button
                    type="submit"
                    variant="primary"
                    isLoading={isUpdatingProfile}
                  >
                    Save Changes
                  </Button>
                </div>
              </form>
            </div>
          )}

          {/* TAB 5: SECURITY */}
          {activeTab === 'security' && (
            <div className="max-w-xl space-y-6">
              <div>
                <h2 className="text-lg font-bold text-white">Password & Security</h2>
                <p className="text-xs text-neutral-400">Update your account password for enhanced security.</p>
              </div>

              <form onSubmit={handleUpdatePassword} className="space-y-4">
                <div>
                  <label className="block text-xs text-neutral-400 mb-1">New Password</label>
                  <input
                    type="password"
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="At least 6 characters"
                    className="w-full px-4 py-2.5 bg-neutral-900 border border-neutral-800 rounded-xl text-sm text-white focus:outline-none focus:border-violet-500"
                  />
                </div>

                <div>
                  <label className="block text-xs text-neutral-400 mb-1">Confirm New Password</label>
                  <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Repeat password"
                    className="w-full px-4 py-2.5 bg-neutral-900 border border-neutral-800 rounded-xl text-sm text-white focus:outline-none focus:border-violet-500"
                  />
                </div>

                <div className="pt-2">
                  <Button
                    type="submit"
                    variant="primary"
                    isLoading={isUpdatingPassword}
                  >
                    Update Password
                  </Button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
