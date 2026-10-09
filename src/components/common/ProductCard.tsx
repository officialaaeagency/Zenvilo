import React from 'react';
import { Product } from '../../types/store';
import { useCurrency } from '../../context/CurrencyContext';
import { useNavigation } from '../../context/NavigationContext';
import { useCart } from '../../context/CartContext';
import { ShoppingBag, ArrowRight } from 'lucide-react';

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { formatPrice } = useCurrency();
  const { navigate } = useNavigation();
  const { addItem } = useCart();

  const handleCardClick = () => {
    navigate('product', { productSlug: product.slug });
  };

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
    addItem(product, product.variants[0]?.id, 1);
  };

  return (
    <article
      onClick={handleCardClick}
      className="group relative bg-neutral-900/60 rounded-xl border border-neutral-800/80 hover:border-neutral-700 transition-all duration-200 overflow-hidden cursor-pointer flex flex-col"
    >
      {/* Product Image */}
      <div className="relative aspect-square w-full overflow-hidden bg-neutral-800/60">
        <img
          src={product.images[0] || 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?auto=format&fit=crop&w=600&q=80'}
          alt={product.title}
          loading="lazy"
          className="w-full h-full object-cover object-center group-hover:scale-[1.03] transition-transform duration-300"
        />

        {/* Quick Add Overlay on Desktop */}
        <button
          type="button"
          onClick={handleQuickAdd}
          aria-label={`Quick add ${product.title} to cart`}
          className="absolute bottom-3 right-3 hidden sm:flex items-center gap-1.5 px-3 py-2 bg-neutral-900/90 hover:bg-neutral-900 text-white text-xs font-medium rounded-lg border border-neutral-700 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-150 shadow-lg"
        >
          <ShoppingBag className="w-3.5 h-3.5 text-violet-400" />
          <span>Quick Add</span>
        </button>
      </div>

      {/* Product Metadata */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between">
        <div>
          {/* Category & Status (clean typography, no pill enclosures) */}
          <div className="flex items-center gap-2 text-xs text-neutral-400 mb-1.5">
            <span>{product.category}</span>
            {product.newArrival && (
              <>
                <span aria-hidden="true">·</span>
                <span className="text-violet-400 font-medium">New</span>
              </>
            )}
          </div>

          <h3 className="text-base font-medium text-neutral-100 group-hover:text-violet-300 transition-colors line-clamp-1 mb-2">
            {product.title}
          </h3>

          <p className="text-xs text-neutral-400 line-clamp-2 leading-relaxed mb-3">
            {product.shortDescription}
          </p>
        </div>

        <div>
          {/* Reviews Area - Only display if real reviews exist */}
          {product.rating && (product.reviewCount ?? 0) > 0 ? (
            <div className="flex items-center gap-1 text-xs text-neutral-400 mb-2">
              <span className="text-amber-400">★</span>
              <span className="font-medium text-neutral-200">{product.rating.toFixed(1)}</span>
              <span>({product.reviewCount})</span>
            </div>
          ) : null}

          {/* Pricing */}
          <div className="flex items-baseline gap-2 pt-2 border-t border-neutral-800/80">
            <span className="text-base font-semibold text-white">
              {formatPrice(product.price)}
            </span>
            {product.compareAtPrice && product.compareAtPrice > product.price && (
              <span className="text-xs text-neutral-400 line-through">
                {formatPrice(product.compareAtPrice)}
              </span>
            )}
          </div>
        </div>
      </div>
    </article>
  );
};
