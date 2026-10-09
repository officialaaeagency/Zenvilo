import React from 'react';
import { useCart } from '../context/CartContext';
import { useCurrency } from '../context/CurrencyContext';
import { useNavigation } from '../context/NavigationContext';
import { EmptyState } from '../components/common/EmptyState';
import { Button } from '../components/common/Button';
import { ShoppingBag, Trash2, Plus, Minus, ArrowRight, ShieldCheck, ArrowLeft } from 'lucide-react';

export const CartPage: React.FC = () => {
  const { items, updateQuantity, removeItem, clearCart, subtotal, itemCount } = useCart();
  const { formatPrice } = useCurrency();
  const { navigate } = useNavigation();

  const shippingCost = subtotal > 50 || subtotal === 0 ? 0 : 5.0;
  const estimatedTotal = subtotal + shippingCost;

  return (
    <div className="min-h-screen bg-neutral-950 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header & Breadcrumb */}
        <div className="mb-10">
          <div className="flex items-center gap-2 text-xs text-neutral-400 mb-2">
            <button
              type="button"
              onClick={() => navigate('home')}
              className="hover:text-white transition-colors"
            >
              Home
            </button>
            <span>/</span>
            <span className="text-neutral-200">Shopping Bag</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Shopping Bag ({itemCount})
          </h1>
        </div>

        {items.length === 0 ? (
          <div className="rounded-2xl bg-neutral-900/30 border border-neutral-900 py-20 px-4">
            <EmptyState
              icon={<ShoppingBag className="w-8 h-8 text-violet-400" />}
              title="Your bag is currently empty."
              description="Explore our curated catalog or check back as new collections launch."
              actionText="Explore Shop"
              onAction={() => navigate('shop')}
              secondaryActionText="About Zenvilo"
              onSecondaryAction={() => navigate('about')}
            />
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
            {/* Items List (7 cols) */}
            <div className="lg:col-span-8 space-y-4">
              <div className="rounded-2xl bg-neutral-900/60 border border-neutral-800/80 divide-y divide-neutral-800/80 overflow-hidden">
                {items.map((item) => (
                  <div key={item.id} className="p-4 sm:p-6 flex flex-col sm:flex-row gap-5">
                    <img
                      src={item.image}
                      alt={item.productTitle}
                      className="w-24 h-24 rounded-xl object-cover bg-neutral-800 border border-neutral-700/60 shrink-0"
                    />

                    <div className="flex-1 flex flex-col justify-between">
                      <div className="flex justify-between items-start gap-4">
                        <div>
                          <h3
                            onClick={() => navigate('product', { productSlug: item.productSlug })}
                            className="text-base font-semibold text-neutral-100 hover:text-violet-300 transition-colors cursor-pointer"
                          >
                            {item.productTitle}
                          </h3>
                          {item.variantName && (
                            <p className="text-xs text-neutral-400 mt-1">{item.variantName}</p>
                          )}
                          <div className="text-xs text-neutral-500 mt-1">
                            Unit Price: {formatPrice(item.price)}
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => removeItem(item.id)}
                          className="p-2 text-neutral-500 hover:text-red-400 rounded-lg hover:bg-neutral-800 transition-colors"
                          aria-label={`Remove ${item.productTitle}`}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="flex items-center justify-between mt-4 pt-3 border-t border-neutral-800/60">
                        {/* Quantity Adjuster */}
                        <div className="flex items-center border border-neutral-700 rounded-lg bg-neutral-800/60">
                          <button
                            type="button"
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="p-2 text-neutral-400 hover:text-white"
                            aria-label="Decrease quantity"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <span className="px-3 text-xs font-semibold text-neutral-100">
                            {item.quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="p-2 text-neutral-400 hover:text-white"
                            aria-label="Increase quantity"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <div className="text-right">
                          <span className="text-base font-bold text-white">
                            {formatPrice(item.price * item.quantity)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex justify-between items-center pt-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate('shop')}
                  className="flex items-center gap-1.5 text-neutral-400 hover:text-white"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Continue Browsing</span>
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={clearCart}
                  className="text-xs text-neutral-400 hover:text-red-400"
                >
                  Clear Bag
                </Button>
              </div>
            </div>

            {/* Order Summary Sidebar (4 cols) */}
            <div className="lg:col-span-4">
              <div className="rounded-2xl bg-neutral-900 border border-neutral-800 p-6 sticky top-28 space-y-6">
                <h2 className="text-base font-semibold text-white">Order Summary</h2>

                <div className="space-y-3 text-xs sm:text-sm">
                  <div className="flex justify-between text-neutral-400">
                    <span>Subtotal</span>
                    <span className="text-neutral-100 font-medium">{formatPrice(subtotal)}</span>
                  </div>

                  <div className="flex justify-between text-neutral-400">
                    <span>Shipping</span>
                    <span className="text-neutral-200">
                      {shippingCost === 0 ? (
                        <span className="text-emerald-400 font-medium">Free</span>
                      ) : (
                        formatPrice(shippingCost)
                      )}
                    </span>
                  </div>

                  {subtotal > 0 && subtotal < 50 && (
                    <div className="p-2.5 rounded-lg bg-neutral-950/60 border border-neutral-800 text-[11px] text-neutral-400">
                      Add {formatPrice(50 - subtotal)} more to qualify for free standard shipping.
                    </div>
                  )}

                  <div className="flex justify-between text-neutral-400">
                    <span>Taxes</span>
                    <span className="text-neutral-400">Calculated at checkout</span>
                  </div>
                </div>

                <div className="pt-4 border-t border-neutral-800 flex justify-between items-baseline">
                  <span className="text-base font-semibold text-white">Estimated Total</span>
                  <span className="text-2xl font-bold text-white">
                    {formatPrice(estimatedTotal)}
                  </span>
                </div>

                <Button
                  variant="primary"
                  size="lg"
                  fullWidth
                  onClick={() => navigate('checkout')}
                  className="flex items-center justify-center gap-2"
                >
                  <span>Proceed to Checkout</span>
                  <ArrowRight className="w-4 h-4" />
                </Button>

                <div className="flex items-center justify-center gap-2 text-xs text-neutral-400 pt-2">
                  <ShieldCheck className="w-4 h-4 text-violet-400" />
                  <span>256-Bit SSL Encrypted Checkout</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
