import React, { useState, useEffect } from 'react';
import { Product, ProductVariant } from '../types/store';
import { ARCHITECTURAL_SAMPLE_PRODUCT } from '../data/catalog';
import { getProductBySlug, getApprovedReviews } from '../services/catalogService';
import { useCurrency } from '../context/CurrencyContext';
import { useCart } from '../context/CartContext';
import { useNavigation } from '../context/NavigationContext';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { CurrencySelector } from '../components/common/CurrencySelector';
import { Button } from '../components/common/Button';
import {
  ShieldCheck,
  Truck,
  RotateCcw,
  Check,
  ShoppingBag,
  Zap,
  Star,
  Info,
  RefreshCw,
} from 'lucide-react';

interface ProductDetailPageProps {
  productSlug?: string;
}

export const ProductDetailPage: React.FC<ProductDetailPageProps> = ({ productSlug }) => {
  const { navigate } = useNavigation();
  const { formatPrice } = useCurrency();
  const { addItem } = useCart();
  const { showToast } = useToast();
  const { user } = useAuth();

  const [product, setProduct] = useState<Product>(ARCHITECTURAL_SAMPLE_PRODUCT);
  const [isArchitecturalTemplate, setIsArchitecturalTemplate] = useState(true);
  const [loading, setLoading] = useState(false);
  const [reviews, setReviews] = useState<any[]>([]);

  // States
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [selectedVariantId, setSelectedVariantId] = useState<string>('');
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<'description' | 'features' | 'specs' | 'shipping' | 'returns' | 'faq' | 'reviews'>('description');

  // Review submission state
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewTitle, setReviewTitle] = useState('');
  const [reviewContent, setReviewContent] = useState('');
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function fetchProduct() {
      if (!productSlug || productSlug === ARCHITECTURAL_SAMPLE_PRODUCT.slug) {
        setProduct(ARCHITECTURAL_SAMPLE_PRODUCT);
        setIsArchitecturalTemplate(true);
        setSelectedVariantId(ARCHITECTURAL_SAMPLE_PRODUCT.variants[0]?.id || '');
        return;
      }

      setLoading(true);
      try {
        const { data, error } = await getProductBySlug(productSlug);
        if (isMounted) {
          if (data) {
            setProduct(data);
            setIsArchitecturalTemplate(false);
            setSelectedVariantId(data.variants[0]?.id || '');
            // Fetch reviews for real product
            const { data: revData } = await getApprovedReviews(data.id);
            if (revData) setReviews(revData);
          } else {
            // Fallback to sample template if slug not found
            setProduct(ARCHITECTURAL_SAMPLE_PRODUCT);
            setIsArchitecturalTemplate(true);
            setSelectedVariantId(ARCHITECTURAL_SAMPLE_PRODUCT.variants[0]?.id || '');
          }
        }
      } catch {
        if (isMounted) {
          setProduct(ARCHITECTURAL_SAMPLE_PRODUCT);
          setIsArchitecturalTemplate(true);
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    fetchProduct();
    return () => {
      isMounted = false;
    };
  }, [productSlug]);

  const selectedVariant: ProductVariant | undefined = product.variants.find(
    (v) => v.id === selectedVariantId
  );

  const activePrice = selectedVariant?.price ?? product.price;

  const handleAddToCart = () => {
    addItem(product, selectedVariantId, quantity);
    showToast(`Added ${quantity} × ${product.title} to bag`, 'success');
  };

  const handleBuyNow = () => {
    addItem(product, selectedVariantId, quantity);
    navigate('checkout');
  };

  const images = product.images.length > 0
    ? product.images
    : ['https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?auto=format&fit=crop&w=1200&q=80'];

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-950 flex flex-col items-center justify-center py-24 text-center">
        <RefreshCw className="w-8 h-8 animate-spin text-violet-400 mb-4" />
        <p className="text-sm text-neutral-400">Loading product specifications from Supabase...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-950 py-8 sm:py-12 pb-24 md:pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Architecture Spec Notice Banner */}
        {isArchitecturalTemplate && (
          <div className="mb-6 p-3 sm:p-4 rounded-xl bg-violet-950/30 border border-violet-800/40 text-violet-300 text-xs flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Info className="w-4 h-4 text-violet-400 shrink-0" />
              <span>
                <strong>Product Architecture Template:</strong> Demonstrating full PDP capabilities connected to Supabase (gallery, variant engine, currency conversion, specifications, sticky mobile purchase). Live catalog is empty until official launch.
              </span>
            </div>
            <button
              type="button"
              onClick={() => navigate('shop')}
              className="text-violet-200 hover:text-white font-medium underline shrink-0"
            >
              Back to Shop
            </button>
          </div>
        )}

        {/* Breadcrumb Navigation */}
        <nav className="flex items-center gap-2 text-xs text-neutral-400 mb-8" aria-label="Breadcrumb">
          <button
            type="button"
            onClick={() => navigate('home')}
            className="hover:text-white transition-colors"
          >
            Home
          </button>
          <span>/</span>
          <button
            type="button"
            onClick={() => navigate('shop')}
            className="hover:text-white transition-colors"
          >
            Shop
          </button>
          <span>/</span>
          <span className="text-neutral-200 line-clamp-1">{product.title}</span>
        </nav>

        {/* Main Product Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          {/* Left Column: Image Gallery (7 cols) */}
          <div className="lg:col-span-7 flex flex-col gap-4">
            {/* Primary Large Image */}
            <div className="relative aspect-4/3 sm:aspect-square w-full rounded-2xl bg-neutral-900 border border-neutral-800/80 overflow-hidden">
              <img
                src={images[selectedImageIndex]}
                alt={`${product.title} preview ${selectedImageIndex + 1}`}
                className="w-full h-full object-cover object-center"
              />
            </div>

            {/* Thumbnails */}
            {images.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-2">
                {images.map((img, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setSelectedImageIndex(idx)}
                    className={`relative w-20 h-20 rounded-xl overflow-hidden border-2 transition-all shrink-0 bg-neutral-900 ${
                      selectedImageIndex === idx
                        ? 'border-violet-500 ring-2 ring-violet-500/20'
                        : 'border-neutral-800 hover:border-neutral-700 opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img
                      src={img}
                      alt={`Thumbnail ${idx + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right Column: Purchasing Actions & Metadata (5 cols) */}
          <div className="lg:col-span-5 flex flex-col justify-start">
            <div className="space-y-6">
              {/* Category & Title */}
              <div>
                <div className="flex items-center justify-between gap-4 mb-2">
                  <span className="text-xs uppercase tracking-wider text-violet-400 font-semibold">
                    {product.category}
                  </span>
                  <CurrencySelector />
                </div>
                <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                  {product.title}
                </h1>
              </div>

              {/* Real Reviews Area - Zero fake reviews discipline */}
              <div className="pt-1">
                {reviews.length > 0 ? (
                  <div className="flex items-center gap-2 text-xs text-neutral-300">
                    <div className="flex text-amber-400">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className="w-3.5 h-3.5 fill-amber-400"
                        />
                      ))}
                    </div>
                    <span className="font-semibold text-white">
                      {(reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1)}
                    </span>
                    <span className="text-neutral-500">·</span>
                    <span className="text-neutral-400">({reviews.length} customer reviews)</span>
                  </div>
                ) : (
                  <p className="text-xs text-neutral-400">
                    No verified customer reviews recorded yet. Real reviews display post-order.
                  </p>
                )}
              </div>

              {/* Price display */}
              <div className="flex items-baseline gap-3 pt-2 border-t border-neutral-900">
                <span className="text-3xl font-bold text-white">
                  {formatPrice(activePrice)}
                </span>
                {product.compareAtPrice && product.compareAtPrice > activePrice && (
                  <span className="text-base text-neutral-400 line-through">
                    {formatPrice(product.compareAtPrice)}
                  </span>
                )}
              </div>

              {/* Short Benefit / Pitch */}
              <p className="text-sm text-neutral-300 leading-relaxed">
                {product.shortDescription}
              </p>

              {/* Variant Selector */}
              {product.variants.length > 0 && (
                <div className="space-y-3 pt-2">
                  <label className="text-xs font-semibold text-neutral-300 uppercase tracking-wider block">
                    Select Variant / Configuration
                  </label>
                  <div className="grid grid-cols-1 gap-2">
                    {product.variants.map((v) => {
                      const isSelected = v.id === selectedVariantId;
                      return (
                        <button
                          key={v.id}
                          type="button"
                          onClick={() => setSelectedVariantId(v.id)}
                          className={`flex items-center justify-between p-3 rounded-lg border text-xs sm:text-sm text-left transition-all min-h-[44px] ${
                            isSelected
                              ? 'border-violet-500 bg-violet-950/20 text-white font-medium'
                              : 'border-neutral-800 bg-neutral-900/60 text-neutral-300 hover:border-neutral-700'
                          }`}
                        >
                          <span>{v.name}</span>
                          <span className="font-semibold text-neutral-100">
                            {formatPrice(v.price ?? product.price)}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Quantity Selector */}
              <div className="pt-2">
                <label className="text-xs font-semibold text-neutral-300 uppercase tracking-wider block mb-2">
                  Quantity
                </label>
                <div className="inline-flex items-center border border-neutral-800 rounded-lg bg-neutral-900 p-1">
                  <button
                    type="button"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    disabled={quantity <= 1}
                    className="w-10 h-10 flex items-center justify-center text-neutral-300 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed rounded-md hover:bg-neutral-800 transition-colors"
                    aria-label="Decrease quantity"
                  >
                    -
                  </button>
                  <span className="w-12 text-center text-sm font-semibold text-white">
                    {quantity}
                  </span>
                  <button
                    type="button"
                    onClick={() => setQuantity(quantity + 1)}
                    className="w-10 h-10 flex items-center justify-center text-neutral-300 hover:text-white rounded-md hover:bg-neutral-800 transition-colors"
                    aria-label="Increase quantity"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* CTAs: Add to Cart & Buy Now */}
              <div className="flex flex-col sm:flex-row gap-3 pt-4">
                <Button
                  variant="primary"
                  size="lg"
                  fullWidth
                  onClick={handleAddToCart}
                  className="flex items-center justify-center gap-2"
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>Add to Bag</span>
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  fullWidth
                  onClick={handleBuyNow}
                  className="flex items-center justify-center gap-2"
                >
                  <Zap className="w-4 h-4 text-violet-400" />
                  <span>Buy Now</span>
                </Button>
              </div>

              {/* Reassurance Micro-trust cards */}
              <div className="pt-4 border-t border-neutral-900 space-y-2 text-xs text-neutral-400">
                <div className="flex items-center gap-2.5">
                  <Truck className="w-4 h-4 text-violet-400 shrink-0" />
                  <span>Free shipping on all orders over $50</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <RotateCcw className="w-4 h-4 text-violet-400 shrink-0" />
                  <span>30-day return policy in original packaging</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <ShieldCheck className="w-4 h-4 text-violet-400 shrink-0" />
                  <span>Industry-standard encrypted checkout</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Detailed Sections: Tabs (Description, Features, Specs, Shipping, Returns, FAQ) */}
        <div className="mt-16 pt-12 border-t border-neutral-900">
          <div className="flex items-center gap-2 overflow-x-auto border-b border-neutral-800 pb-3 mb-8">
            {[
              { id: 'description', label: 'Description' },
              { id: 'features', label: 'Key Features' },
              { id: 'specs', label: 'Specifications' },
              { id: 'shipping', label: 'Shipping Info' },
              { id: 'returns', label: 'Returns & Refunds' },
              { id: 'faq', label: 'Product FAQ' },
              { id: 'reviews', label: `Reviews (${reviews.length})` },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-4 py-2 text-xs sm:text-sm font-medium rounded-lg whitespace-nowrap transition-colors min-h-[40px] ${
                  activeTab === tab.id
                    ? 'bg-neutral-800 text-white border border-neutral-700'
                    : 'text-neutral-400 hover:text-white hover:bg-neutral-900'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="max-w-3xl text-sm leading-relaxed text-neutral-300">
            {activeTab === 'description' && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-white">Full Product Overview</h3>
                <p className="text-neutral-300">{product.description}</p>
              </div>
            )}

            {activeTab === 'features' && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-white">Key Functional Features</h3>
                {product.features.length > 0 ? (
                  <ul className="space-y-2.5">
                    {product.features.map((f, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <Check className="w-4 h-4 text-violet-400 shrink-0 mt-0.5" />
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-xs text-neutral-400">Detailed feature breakdown provided upon production run.</p>
                )}
              </div>
            )}

            {activeTab === 'specs' && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-white">Technical Specifications</h3>
                {product.specifications.length > 0 ? (
                  <div className="rounded-xl border border-neutral-800 overflow-hidden">
                    <table className="w-full text-left text-xs sm:text-sm">
                      <tbody className="divide-y divide-neutral-800 bg-neutral-900/40">
                        {product.specifications.map((s, i) => (
                          <tr key={i} className="hover:bg-neutral-800/40">
                            <td className="py-3 px-4 font-medium text-neutral-400 w-1/3">
                              {s.label}
                            </td>
                            <td className="py-3 px-4 text-neutral-200">{s.value}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="text-xs text-neutral-400">Formal engineering tolerances and dimensions recorded in database.</p>
                )}
              </div>
            )}

            {activeTab === 'shipping' && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-white">Shipping Information</h3>
                <p>{product.shippingInfo || 'Standard shipping takes 3–7 business days.'}</p>
                <p className="text-xs text-neutral-400">
                  Tracking numbers are issued immediately once packages are picked up by the courier.
                </p>
              </div>
            )}

            {activeTab === 'returns' && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-white">Returns & Refund Guarantee</h3>
                <p>{product.returnInfo || '30-day hassle-free returns.'}</p>
                <p className="text-xs text-neutral-400">
                  Contact support@zenvilo.com to request an RMA authorization and prepaid return label.
                </p>
              </div>
            )}

            {activeTab === 'faq' && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-white">Product Inquiries</h3>
                <div className="space-y-3">
                  <div className="p-4 rounded-lg bg-neutral-900/60 border border-neutral-800">
                    <h4 className="font-semibold text-white text-xs mb-1">How do I maintain this product?</h4>
                    <p className="text-xs text-neutral-400">Clean gently with a damp microfiber cloth and neutral soap. Avoid harsh chemical cleaners.</p>
                  </div>
                  <div className="p-4 rounded-lg bg-neutral-900/60 border border-neutral-800">
                    <h4 className="font-semibold text-white text-xs mb-1">What is covered under warranty?</h4>
                    <p className="text-xs text-neutral-400">All Zenvilo products come with a 1-year limited warranty against material and manufacturing defects.</p>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'reviews' && (
              <div className="space-y-8">
                <div>
                  <h3 className="text-lg font-semibold text-white">Customer Reviews</h3>
                  <p className="text-xs text-neutral-400 mt-1">Verified purchaser feedback and quality reports.</p>
                </div>

                {reviews.length === 0 ? (
                  <div className="p-6 bg-neutral-900/40 border border-neutral-800 rounded-2xl text-center space-y-2">
                    <p className="text-xs text-neutral-400">No public reviews published for this product yet.</p>
                    <p className="text-[11px] text-neutral-500">Be the first customer to share your experience below.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {reviews.map((rev) => (
                      <div key={rev.id} className="p-4 bg-neutral-900/60 border border-neutral-800 rounded-xl space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1.5 text-amber-400">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`w-3.5 h-3.5 ${i < rev.rating ? 'fill-amber-400' : 'text-neutral-700'}`}
                              />
                            ))}
                          </div>
                          <span className="text-[11px] text-neutral-500">
                            {new Date(rev.created_at).toLocaleDateString()}
                          </span>
                        </div>
                        {rev.title && <h4 className="text-xs font-bold text-white">{rev.title}</h4>}
                        <p className="text-xs text-neutral-300 leading-relaxed">{rev.content}</p>
                        <div className="text-[11px] text-neutral-500">
                          By {rev.profiles?.full_name || 'Verified Customer'}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Write Review Form */}
                <div className="p-6 bg-neutral-900 border border-neutral-800 rounded-2xl space-y-4">
                  <h4 className="text-sm font-bold text-white">Write a Product Review</h4>
                  {user ? (
                    <form
                      onSubmit={async (e) => {
                        e.preventDefault();
                        if (!reviewContent.trim()) {
                          showToast('Please enter your review content', 'error');
                          return;
                        }
                        if (!isSupabaseConfigured) {
                          showToast('Review submitted (preview mode)', 'success');
                          return;
                        }
                        setIsSubmittingReview(true);
                        try {
                          const { error } = await (supabase.from('reviews') as any).insert({
                            product_id: product.id,
                            user_id: user.id,
                            rating: reviewRating,
                            title: reviewTitle.trim() || null,
                            content: reviewContent.trim(),
                            is_approved: false,
                          });
                          if (error) {
                            showToast(error.message, 'error');
                          } else {
                            showToast('Review submitted for moderation! It will appear once approved by admin.', 'success');
                            setReviewTitle('');
                            setReviewContent('');
                          }
                        } catch (err: any) {
                          showToast(err?.message || 'Error submitting review', 'error');
                        } finally {
                          setIsSubmittingReview(false);
                        }
                      }}
                      className="space-y-3"
                    >
                      <div>
                        <label className="block text-xs text-neutral-400 mb-1">Rating</label>
                        <div className="flex items-center gap-1">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <button
                              key={star}
                              type="button"
                              onClick={() => setReviewRating(star)}
                              className="p-1 text-amber-400 focus:outline-none"
                            >
                              <Star
                                className={`w-5 h-5 ${star <= reviewRating ? 'fill-amber-400' : 'text-neutral-700'}`}
                              />
                            </button>
                          ))}
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs text-neutral-400 mb-1">Review Headline (Optional)</label>
                        <input
                          type="text"
                          value={reviewTitle}
                          onChange={(e) => setReviewTitle(e.target.value)}
                          placeholder="e.g. Exceptional build quality and utility"
                          className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-xl text-xs text-white focus:outline-none focus:border-violet-500"
                        />
                      </div>

                      <div>
                        <label className="block text-xs text-neutral-400 mb-1">Your Review *</label>
                        <textarea
                          rows={3}
                          required
                          value={reviewContent}
                          onChange={(e) => setReviewContent(e.target.value)}
                          placeholder="Share your detailed experience with craftsmanship, durability, or functionality..."
                          className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-xl text-xs text-white focus:outline-none focus:border-violet-500"
                        />
                      </div>

                      <Button
                        type="submit"
                        variant="primary"
                        size="sm"
                        isLoading={isSubmittingReview}
                      >
                        Submit Review
                      </Button>
                    </form>
                  ) : (
                    <div className="p-4 bg-neutral-950 border border-neutral-800 rounded-xl text-xs text-neutral-400 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                      <span>Please sign in to your Zenvilo account to submit a verified product review.</span>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => navigate('auth', { authTab: 'login' })}
                      >
                        Sign In
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Sticky Mobile Purchase Bar */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 p-3 bg-neutral-950/95 border-t border-neutral-800 backdrop-blur z-30 flex items-center justify-between gap-3 shadow-2xl">
        <div>
          <div className="text-[10px] text-neutral-400 uppercase tracking-wider">Total</div>
          <div className="text-base font-bold text-white">{formatPrice(activePrice * quantity)}</div>
        </div>
        <div className="flex gap-2">
          <Button
            variant="primary"
            size="md"
            onClick={handleAddToCart}
            className="flex items-center gap-1.5"
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Add to Bag</span>
          </Button>
        </div>
      </div>
    </div>
  );
};
