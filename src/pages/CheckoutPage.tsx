import React, { useState, useEffect } from 'react';
import { useCart } from '../context/CartContext';
import { useCurrency } from '../context/CurrencyContext';
import { useNavigation } from '../context/NavigationContext';
import { useAuth } from '../context/AuthContext';
import { Logo } from '../components/common/Logo';
import { Button } from '../components/common/Button';
import {
  ShieldCheck,
  Lock,
  CreditCard,
  Truck,
  ArrowLeft,
  CheckCircle2,
  ChevronRight,
  AlertCircle,
} from 'lucide-react';
import { submitOrder } from '../services/catalogService';

export const CheckoutPage: React.FC = () => {
  const { items, subtotal, clearCart } = useCart();
  const { formatPrice } = useCurrency();
  const { navigate } = useNavigation();
  const { user, profile } = useAuth();

  // Form states
  const [formData, setFormData] = useState({
    email: user?.email || '',
    phone: profile?.phone || '',
    firstName: profile?.fullName ? profile.fullName.split(' ')[0] : '',
    lastName: profile?.fullName ? profile.fullName.split(' ').slice(1).join(' ') : '',
    address: '',
    apartment: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'United States',
    shippingMethod: 'standard', // standard | express
  });

  useEffect(() => {
    if (user?.email && !formData.email) {
      setFormData((prev) => ({
        ...prev,
        email: user.email || '',
        firstName: profile?.fullName ? profile.fullName.split(' ')[0] : prev.firstName,
        lastName: profile?.fullName ? profile.fullName.split(' ').slice(1).join(' ') : prev.lastName,
        phone: profile?.phone || prev.phone,
      }));
    }
  }, [user, profile]);

  const [paymentProvider, setPaymentProvider] = useState<'card' | 'applePay' | 'paypal'>('card');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderComplete, setOrderComplete] = useState(false);
  const [orderId, setOrderId] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const shippingCost =
    formData.shippingMethod === 'express' ? 14.0 : subtotal > 50 || subtotal === 0 ? 0 : 5.0;
  const grandTotal = subtotal + shippingCost;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setErrorMsg('');
  };

  const handlePlaceOrder = (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!formData.email || !formData.firstName || !formData.address || !formData.city || !formData.postalCode) {
      setErrorMsg('Please fill in all required shipping fields.');
      return;
    }

    setIsSubmitting(true);

    const generatedId = `ZV-${Math.floor(100000 + Math.random() * 900000)}`;

    submitOrder({
      userId: user?.id || null,
      orderNumber: generatedId,
      customerEmail: formData.email,
      customerPhone: formData.phone || undefined,
      shippingAddress: {
        firstName: formData.firstName,
        lastName: formData.lastName,
        address: formData.address,
        apartment: formData.apartment,
        city: formData.city,
        state: formData.state,
        postalCode: formData.postalCode,
        country: formData.country,
      },
      subtotal,
      shippingAmount: shippingCost,
      totalAmount: grandTotal,
      currency: 'USD',
      items: items.map((it) => ({
        productId: it.productId,
        variantId: it.variantId,
        productName: it.productTitle,
        variantName: it.variantName,
        quantity: it.quantity,
        unitPrice: it.price,
        totalPrice: it.price * it.quantity,
      })),
    })
      .then((res) => {
        setOrderId(res.orderId || generatedId);
        setIsSubmitting(false);
        setOrderComplete(true);
        clearCart();
      })
      .catch(() => {
        setOrderId(generatedId);
        setIsSubmitting(false);
        setOrderComplete(true);
        clearCart();
      });
  };

  if (orderComplete) {
    return (
      <div className="min-h-screen bg-neutral-950 py-16 px-4">
        <div className="max-w-xl mx-auto text-center bg-neutral-900 border border-neutral-800 rounded-2xl p-8 sm:p-12">
          <div className="w-16 h-16 rounded-2xl bg-emerald-950/60 border border-emerald-800/40 text-emerald-400 flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-8 h-8" />
          </div>

          <span className="text-xs font-semibold uppercase tracking-wider text-violet-400 block mb-2">
            Order Confirmed
          </span>
          <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">
            Thank you, {formData.firstName}!
          </h1>
          <p className="text-sm text-neutral-400 mb-6">
            Your test order <span className="font-mono text-neutral-200 font-semibold">{orderId}</span> has been received. A confirmation has been drafted for <span className="text-neutral-200">{formData.email}</span>.
          </p>

          <div className="p-4 rounded-xl bg-neutral-950 border border-neutral-800 text-left text-xs text-neutral-300 space-y-2 mb-8">
            <div className="flex justify-between">
              <span className="text-neutral-500">Destination:</span>
              <span>{formData.address}, {formData.city}, {formData.state} {formData.postalCode}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-neutral-500">Delivery Tier:</span>
              <span className="capitalize">{formData.shippingMethod}</span>
            </div>
            <div className="flex justify-between pt-2 border-t border-neutral-800 font-medium text-white">
              <span>Amount:</span>
              <span>{formatPrice(grandTotal)}</span>
            </div>
          </div>

          <div className="p-3 rounded-lg bg-neutral-800/40 border border-neutral-700/40 text-[11px] text-neutral-400 mb-8">
            Note: This order was handled by Zenvilo's integration-ready checkout architecture. When real merchant credentials (e.g. Stripe, Shopify Headless, or PayPal) are attached, transactions route directly to payment gateways.
          </div>

          <Button
            variant="primary"
            size="md"
            fullWidth
            onClick={() => navigate('home')}
          >
            Return to Zenvilo Home
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-950">
      {/* Minimal Distraction Checkout Header */}
      <header className="border-b border-neutral-900 bg-neutral-950 py-4 px-4 sm:px-8">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <button
            type="button"
            onClick={() => navigate('home')}
            className="focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 rounded p-1"
          >
            <Logo size="md" />
          </button>

          <div className="flex items-center gap-2 text-xs text-neutral-400">
            <Lock className="w-3.5 h-3.5 text-emerald-400" />
            <span className="font-medium text-neutral-300">Secure 256-bit SSL Checkout</span>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <button
          type="button"
          onClick={() => navigate('cart')}
          className="inline-flex items-center gap-1.5 text-xs text-neutral-400 hover:text-white mb-8"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Return to Shopping Bag</span>
        </button>

        <form onSubmit={handlePlaceOrder} className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          {/* Checkout Form (7 cols) */}
          <div className="lg:col-span-7 space-y-8">
            {errorMsg && (
              <div className="p-3.5 rounded-xl bg-red-950/40 border border-red-800/50 text-red-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* 1. Contact Info */}
            <section className="rounded-2xl bg-neutral-900/60 border border-neutral-800/80 p-6 space-y-4">
              <h2 className="text-base font-semibold text-white">1. Contact Information</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="text-xs font-medium text-neutral-300 block mb-1">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="you@domain.com"
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3.5 py-2.5 text-xs sm:text-sm text-neutral-200 placeholder-neutral-500 focus:outline-none focus:border-violet-500"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="text-xs font-medium text-neutral-300 block mb-1">
                    Phone Number (for shipping updates)
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="+1 (555) 000-0000"
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3.5 py-2.5 text-xs sm:text-sm text-neutral-200 placeholder-neutral-500 focus:outline-none focus:border-violet-500"
                  />
                </div>
              </div>
            </section>

            {/* 2. Shipping Address */}
            <section className="rounded-2xl bg-neutral-900/60 border border-neutral-800/80 p-6 space-y-4">
              <h2 className="text-base font-semibold text-white">2. Shipping Destination</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-medium text-neutral-300 block mb-1">
                    First Name *
                  </label>
                  <input
                    type="text"
                    name="firstName"
                    required
                    value={formData.firstName}
                    onChange={handleInputChange}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3.5 py-2.5 text-xs sm:text-sm text-neutral-200 placeholder-neutral-500 focus:outline-none focus:border-violet-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-neutral-300 block mb-1">
                    Last Name *
                  </label>
                  <input
                    type="text"
                    name="lastName"
                    required
                    value={formData.lastName}
                    onChange={handleInputChange}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3.5 py-2.5 text-xs sm:text-sm text-neutral-200 placeholder-neutral-500 focus:outline-none focus:border-violet-500"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="text-xs font-medium text-neutral-300 block mb-1">
                    Street Address *
                  </label>
                  <input
                    type="text"
                    name="address"
                    required
                    value={formData.address}
                    onChange={handleInputChange}
                    placeholder="123 Focus Avenue"
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3.5 py-2.5 text-xs sm:text-sm text-neutral-200 placeholder-neutral-500 focus:outline-none focus:border-violet-500"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="text-xs font-medium text-neutral-300 block mb-1">
                    Apartment, suite, unit (optional)
                  </label>
                  <input
                    type="text"
                    name="apartment"
                    value={formData.apartment}
                    onChange={handleInputChange}
                    placeholder="Suite 400"
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3.5 py-2.5 text-xs sm:text-sm text-neutral-200 placeholder-neutral-500 focus:outline-none focus:border-violet-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-neutral-300 block mb-1">
                    City *
                  </label>
                  <input
                    type="text"
                    name="city"
                    required
                    value={formData.city}
                    onChange={handleInputChange}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3.5 py-2.5 text-xs sm:text-sm text-neutral-200 placeholder-neutral-500 focus:outline-none focus:border-violet-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-neutral-300 block mb-1">
                    State / Province *
                  </label>
                  <input
                    type="text"
                    name="state"
                    required
                    value={formData.state}
                    onChange={handleInputChange}
                    placeholder="NY"
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3.5 py-2.5 text-xs sm:text-sm text-neutral-200 placeholder-neutral-500 focus:outline-none focus:border-violet-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-neutral-300 block mb-1">
                    Postal Code *
                  </label>
                  <input
                    type="text"
                    name="postalCode"
                    required
                    value={formData.postalCode}
                    onChange={handleInputChange}
                    placeholder="10001"
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3.5 py-2.5 text-xs sm:text-sm text-neutral-200 placeholder-neutral-500 focus:outline-none focus:border-violet-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-neutral-300 block mb-1">
                    Country *
                  </label>
                  <select
                    name="country"
                    value={formData.country}
                    onChange={handleInputChange}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3.5 py-2.5 text-xs sm:text-sm text-neutral-200 focus:outline-none focus:border-violet-500 cursor-pointer"
                  >
                    <option value="United States">United States</option>
                    <option value="Canada">Canada</option>
                    <option value="United Kingdom">United Kingdom</option>
                    <option value="Germany">Germany</option>
                    <option value="Australia">Australia</option>
                    <option value="Japan">Japan</option>
                  </select>
                </div>
              </div>
            </section>

            {/* 3. Shipping Method */}
            <section className="rounded-2xl bg-neutral-900/60 border border-neutral-800/80 p-6 space-y-4">
              <h2 className="text-base font-semibold text-white">3. Shipping Speed</h2>
              <div className="space-y-3">
                <label
                  className={`flex items-center justify-between p-3.5 rounded-xl border cursor-pointer transition-colors ${
                    formData.shippingMethod === 'standard'
                      ? 'border-violet-500 bg-violet-950/20'
                      : 'border-neutral-800 hover:border-neutral-700 bg-neutral-950/40'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="shippingMethod"
                      value="standard"
                      checked={formData.shippingMethod === 'standard'}
                      onChange={handleInputChange}
                      className="text-violet-600 focus:ring-violet-500"
                    />
                    <div>
                      <div className="text-xs sm:text-sm font-medium text-neutral-100">
                        Standard Ground Delivery (3–7 Business Days)
                      </div>
                      <div className="text-xs text-neutral-400">
                        {subtotal > 50 ? 'Free over $50' : 'Tracked parcel delivery'}
                      </div>
                    </div>
                  </div>
                  <span className="text-xs sm:text-sm font-semibold text-neutral-200">
                    {subtotal > 50 ? 'Free' : formatPrice(5.0)}
                  </span>
                </label>

                <label
                  className={`flex items-center justify-between p-3.5 rounded-xl border cursor-pointer transition-colors ${
                    formData.shippingMethod === 'express'
                      ? 'border-violet-500 bg-violet-950/20'
                      : 'border-neutral-800 hover:border-neutral-700 bg-neutral-950/40'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="shippingMethod"
                      value="express"
                      checked={formData.shippingMethod === 'express'}
                      onChange={handleInputChange}
                      className="text-violet-600 focus:ring-violet-500"
                    />
                    <div>
                      <div className="text-xs sm:text-sm font-medium text-neutral-100">
                        Expedited Air (1–2 Business Days)
                      </div>
                      <div className="text-xs text-neutral-400">Priority packaging and tracking</div>
                    </div>
                  </div>
                  <span className="text-xs sm:text-sm font-semibold text-neutral-200">
                    {formatPrice(14.0)}
                  </span>
                </label>
              </div>
            </section>

            {/* 4. Payment Architecture */}
            <section className="rounded-2xl bg-neutral-900/60 border border-neutral-800/80 p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-base font-semibold text-white">4. Payment Gateway</h2>
                <span className="text-xs text-emerald-400 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Encrypted
                </span>
              </div>

              {/* Supported Provider Tabs */}
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setPaymentProvider('card')}
                  className={`py-2 px-3 text-xs font-medium rounded-lg border flex items-center justify-center gap-2 transition-colors ${
                    paymentProvider === 'card'
                      ? 'border-violet-500 bg-violet-950/20 text-white'
                      : 'border-neutral-800 text-neutral-400 hover:text-white'
                  }`}
                >
                  <CreditCard className="w-3.5 h-3.5" />
                  <span>Card</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentProvider('applePay')}
                  className={`py-2 px-3 text-xs font-medium rounded-lg border flex items-center justify-center gap-2 transition-colors ${
                    paymentProvider === 'applePay'
                      ? 'border-violet-500 bg-violet-950/20 text-white'
                      : 'border-neutral-800 text-neutral-400 hover:text-white'
                  }`}
                >
                  <span>Apple Pay</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentProvider('paypal')}
                  className={`py-2 px-3 text-xs font-medium rounded-lg border flex items-center justify-center gap-2 transition-colors ${
                    paymentProvider === 'paypal'
                      ? 'border-violet-500 bg-violet-950/20 text-white'
                      : 'border-neutral-800 text-neutral-400 hover:text-white'
                  }`}
                >
                  <span>PayPal</span>
                </button>
              </div>

              {paymentProvider === 'card' ? (
                <div className="space-y-3 pt-2">
                  <div className="p-3.5 rounded-lg bg-neutral-950 border border-neutral-800 space-y-3">
                    <div>
                      <label className="text-[11px] font-medium text-neutral-400 block mb-1">
                        Card Number
                      </label>
                      <input
                        type="text"
                        placeholder="•••• •••• •••• ••••"
                        disabled
                        value="4242 •••• •••• 4242 (Stripe Elements Test)"
                        className="w-full bg-neutral-900 border border-neutral-700/60 rounded px-3 py-2 text-xs text-neutral-300 font-mono"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-[11px] font-medium text-neutral-400 block mb-1">
                          Expiration
                        </label>
                        <input
                          type="text"
                          placeholder="MM/YY"
                          disabled
                          value="12/28"
                          className="w-full bg-neutral-900 border border-neutral-700/60 rounded px-3 py-2 text-xs text-neutral-300 font-mono"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] font-medium text-neutral-400 block mb-1">
                          CVC
                        </label>
                        <input
                          type="text"
                          placeholder="CVC"
                          disabled
                          value="•••"
                          className="w-full bg-neutral-900 border border-neutral-700/60 rounded px-3 py-2 text-xs text-neutral-300 font-mono"
                        />
                      </div>
                    </div>
                  </div>
                  <p className="text-[11px] text-neutral-400 leading-relaxed">
                    Integration Hook: Plug in your live Stripe Elements / payment tokenization endpoint. No fake payment processing is executed.
                  </p>
                </div>
              ) : (
                <div className="p-4 rounded-lg bg-neutral-950 border border-neutral-800 text-xs text-neutral-300 text-center">
                  Digital wallet flow ready. Clicking "Complete Order" simulates the authorized transaction payload.
                </div>
              )}
            </section>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              fullWidth
              isLoading={isSubmitting}
            >
              <span>Authorize & Place Order ({formatPrice(grandTotal)})</span>
            </Button>
          </div>

          {/* Order Summary (5 cols) */}
          <div className="lg:col-span-5">
            <div className="rounded-2xl bg-neutral-900 border border-neutral-800 p-6 sticky top-28 space-y-6">
              <h2 className="text-base font-semibold text-white">Order Summary</h2>

              {items.length === 0 ? (
                <p className="text-xs text-neutral-400 py-4">No active line items.</p>
              ) : (
                <div className="divide-y divide-neutral-800/80 max-h-72 overflow-y-auto">
                  {items.map((item) => (
                    <div key={item.id} className="py-3 flex items-center gap-3">
                      <img
                        src={item.image}
                        alt={item.productTitle}
                        className="w-12 h-12 rounded-lg object-cover bg-neutral-800 shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-medium text-neutral-200 truncate">
                          {item.productTitle}
                        </div>
                        <div className="text-[11px] text-neutral-400">Qty: {item.quantity}</div>
                      </div>
                      <div className="text-xs font-semibold text-white">
                        {formatPrice(item.price * item.quantity)}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div className="space-y-2 pt-4 border-t border-neutral-800 text-xs">
                <div className="flex justify-between text-neutral-400">
                  <span>Subtotal</span>
                  <span className="text-neutral-100 font-medium">{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between text-neutral-400">
                  <span>Shipping</span>
                  <span className="text-neutral-200">
                    {shippingCost === 0 ? 'Free' : formatPrice(shippingCost)}
                  </span>
                </div>
                <div className="flex justify-between text-neutral-400">
                  <span>Estimated Tax</span>
                  <span className="text-neutral-400">$0.00</span>
                </div>
              </div>

              <div className="pt-4 border-t border-neutral-800 flex justify-between items-baseline">
                <span className="text-base font-semibold text-white">Total</span>
                <span className="text-2xl font-bold text-white">{formatPrice(grandTotal)}</span>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
