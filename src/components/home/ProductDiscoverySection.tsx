import React, { useState } from 'react';
import { Product } from '../../types/store';
import { ProductCard } from '../common/ProductCard';

interface ProductDiscoverySectionProps {
  products: Product[];
  title?: string;
  subtitle?: string;
}

export const ProductDiscoverySection: React.FC<ProductDiscoverySectionProps> = ({
  products,
  title = 'Featured Discoveries',
  subtitle = 'Curated highlights from our catalog',
}) => {
  const [activeTab, setActiveTab] = useState<'featured' | 'bestsellers' | 'newArrivals'>('featured');

  // Filter based on tab
  const featured = products.filter((p) => p.featured);
  const bestsellers = products.filter((p) => p.bestseller);
  const newArrivals = products.filter((p) => p.newArrival);

  // Requirement: "Hide sections that have no products instead of showing fake content."
  if (products.length === 0) {
    return null;
  }

  const currentList =
    activeTab === 'featured'
      ? featured
      : activeTab === 'bestsellers'
      ? bestsellers
      : newArrivals;

  if (currentList.length === 0 && products.length === 0) {
    return null;
  }

  return (
    <section className="py-20 bg-neutral-950 border-b border-neutral-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 gap-4">
          <div>
            <div className="text-xs font-semibold uppercase tracking-[0.2em] text-violet-400 mb-2">
              Curated Highlights
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              {title}
            </h2>
            <p className="mt-2 text-sm text-neutral-400">{subtitle}</p>
          </div>

          {/* Interactive filter tabs (clean segmented controls) */}
          <div className="flex items-center gap-1 p-1 bg-neutral-900 rounded-lg border border-neutral-800 self-start sm:self-auto">
            <button
              type="button"
              onClick={() => setActiveTab('featured')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                activeTab === 'featured'
                  ? 'bg-neutral-800 text-white shadow-sm'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              Featured
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('bestsellers')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                activeTab === 'bestsellers'
                  ? 'bg-neutral-800 text-white shadow-sm'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              Best Sellers
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('newArrivals')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                activeTab === 'newArrivals'
                  ? 'bg-neutral-800 text-white shadow-sm'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              New Arrivals
            </button>
          </div>
        </div>

        {currentList.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {currentList.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="py-12 text-center text-sm text-neutral-400 bg-neutral-900/30 rounded-xl border border-neutral-900">
            No items in this collection currently.
          </div>
        )}
      </div>
    </section>
  );
};
