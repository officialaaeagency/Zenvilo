import React from 'react';
import { useCart } from '../../context/CartContext';
import { useCurrency } from '../../context/CurrencyContext';
import { useNavigation } from '../../context/NavigationContext';
import { X, Trash2, ShoppingBag, Plus, Minus, ArrowRight } from 'lucide-react';
import { Button } from '../common/Button';

export const CartDrawer: React.FC = () => {
  const { items, isOpen, closeCart, updateQuantity, removeItem, subtotal, itemCount } = useCart();
  const { formatPrice } = useCurrency();
  const { navigate } = useNavigation();

  if (!isOpen) return null;

  const handleCheckout = () => {
    closeCart();
    navigate('checkout');
  };

  const handleViewCartPage = () => {
    closeCart();
    navigate('cart');
  };

  return (
    <div
      className="fixed inset-0 z-50 overflow-hidden"
      aria-labelledby="slide-over-cart-title"
      role="dialog"
      aria-modal="true"
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/70 backdrop-blur-sm transition-opacity"
        onClick={closeCart}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-neutral-900 border-l border-neutral-800 shadow-2xl flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-4 sm:p-6 border-b border-neutral-800">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-violet-400" />
              <h2 id="slide-over-cart-title" className="text-base font-semibold text-neutral-100">
                Your Bag ({itemCount})
              </h2>
            </div>
            <button
              type="button"
              onClick={closeCart}
              className="p-2 text-neutral-400 hover:text-white rounded-lg hover:bg-neutral-800 transition-colors"
              aria-label="Close cart drawer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6">
            {items.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center py-12">
                <div className="w-16 h-16 rounded-2xl bg-neutral-800/80 border border-neutral-700/60 flex items-center justify-center text-neutral-400 mb-4">
                  <ShoppingBag className="w-7 h-7" />
                </div>
                <h3 className="text-base font-semibold text-neutral-100 mb-1">Your cart is empty</h3>
                <p className="text-xs text-neutral-400 max-w-xs mb-6">
                  You have not added any items yet. Discover our curated collections or check back for new launches.
                </p>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => {
                    closeCart();
                    navigate('shop');
                  }}
                >
                  Explore Catalog
                </Button>
              </div>
            ) : (
              <div className="divide-y divide-neutral-800">
                {items.map((item) => (
                  <div key={item.id} className="py-4 flex gap-4">
                    <img
                      src={item.image || 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?auto=format&fit=crop&w=300&q=80'}
                      alt={item.productTitle}
                      className="w-20 h-20 rounded-lg object-cover bg-neutral-800 border border-neutral-700/60 shrink-0"
                    />
                    <div className="flex-1 flex flex-col justify-between">
                      <div>
                        <div className="flex justify-between items-start gap-2">
                          <h4 className="text-sm font-medium text-neutral-100 line-clamp-1">
                            {item.productTitle}
                          </h4>
                          <button
                            type="button"
                            onClick={() => removeItem(item.id)}
                            className="text-neutral-500 hover:text-red-400 p-1"
                            aria-label={`Remove ${item.productTitle}`}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        {item.variantName && (
                          <p className="text-xs text-neutral-400 mt-0.5">{item.variantName}</p>
                        )}
                      </div>

                      <div className="flex items-center justify-between mt-3">
                        {/* Quantity adjuster */}
                        <div className="flex items-center border border-neutral-700 rounded-md bg-neutral-800/50">
                          <button
                            type="button"
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="p-1.5 text-neutral-400 hover:text-white"
                            aria-label="Decrease quantity"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="px-2 text-xs font-medium text-neutral-200">
                            {item.quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="p-1.5 text-neutral-400 hover:text-white"
                            aria-label="Increase quantity"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>

                        <span className="text-sm font-semibold text-neutral-100">
                          {formatPrice(item.price * item.quantity)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          {items.length > 0 && (
            <div className="p-4 sm:p-6 border-t border-neutral-800 bg-neutral-900/90 space-y-4">
              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between text-neutral-400">
                  <span>Subtotal</span>
                  <span className="text-neutral-100 font-medium">{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between text-neutral-400">
                  <span>Shipping</span>
                  <span className="text-neutral-300">Calculated at checkout</span>
                </div>
              </div>

              <div className="pt-2 border-t border-neutral-800 flex justify-between items-baseline">
                <span className="text-sm font-medium text-neutral-200">Estimated Total</span>
                <span className="text-lg font-bold text-white">{formatPrice(subtotal)}</span>
              </div>

              <div className="space-y-2 pt-2">
                <Button
                  variant="primary"
                  size="md"
                  fullWidth
                  onClick={handleCheckout}
                  className="flex items-center justify-center gap-2"
                >
                  <span>Proceed to Checkout</span>
                  <ArrowRight className="w-4 h-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  fullWidth
                  onClick={handleViewCartPage}
                >
                  View Full Bag
                </Button>
              </div>

              <p className="text-[11px] text-center text-neutral-400">
                Encrypted & secure checkout. 30-day guarantee.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
